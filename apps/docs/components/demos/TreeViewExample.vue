<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { TreeView, type TreeViewKey, type TreeViewNode } from '@registry/components/tree-view'
import { Checkbox } from '@registry/components/checkbox'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'
const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const rtl = ref(false)
const disabled = ref(false)
const multiple = ref(false)
const combined = ref(false)
const selected = ref<TreeViewKey[]>([])
const expanded = ref<TreeViewKey[]>([0])
const checked = ref<TreeViewKey[]>([])
const batchSelected = ref<TreeViewKey[]>([])
const batchExpanded = ref<TreeViewKey[]>([0, 'design'])
const lazyExpanded = ref<TreeViewKey[]>([])
const lazyChecked = ref<TreeViewKey[]>([])
const nodes = computed<TreeViewNode[]>(() => [
  {
    key: 0,
    label: t('Workspace', '工作区'),
    description: t('Local records', '本地记录'),
    children: [
      {
        key: 'design',
        label: t('Design', '设计'),
        children: [
          {
            key: 'brief',
            label: t('Brief', '简报'),
            description: t('Project brief', '项目简报'),
            icon: 'draft',
          },
          { key: 'tokens', label: t('Tokens', '令牌') },
          { key: 'locked', label: t('Archived', '已归档'), disabled: true },
        ],
      },
      { key: 'notes', label: t('Notes', '笔记'), description: t('Team notes', '团队笔记') },
    ],
  },
  {
    key: 'shared',
    label: t('Shared', '共享'),
    children: [
      {
        key: 'documents',
        label: t('Documents', '文档'),
        children: [
          {
            key: 'deep',
            label: t(
              'A complete document name that remains available when text is enlarged',
              '文字放大时仍然完整保留且可读取的文档名称',
            ),
            description: t('Supporting material', '补充材料'),
          },
        ],
      },
    ],
  },
  { key: 'disabled', label: t('Unavailable', '不可用'), disabled: true },
  { key: 'zebra', label: t('Zebra', '斑马') },
])
const lazyNodes = computed<TreeViewNode[]>(() => [
  { key: 'remote', label: t('Remote documents', '远端文档'), hasChildren: true },
  { key: 'more', label: t('More sources', '更多来源'), hasChildren: true },
  { key: 'saved', label: t('Saved', '已保存') },
])
interface Request {
  id: number
  node: Readonly<TreeViewNode>
  canceled: boolean
  resolve: (nodes: readonly TreeViewNode[]) => void
  reject: (error: unknown) => void
  cleanup: () => void
}
const requests = shallowRef<Request[]>([])
let serial = 0
function load(
  node: Readonly<TreeViewNode>,
  { signal }: { signal: AbortSignal },
): Promise<readonly TreeViewNode[]> {
  return new Promise((resolve, reject) => {
    const id = ++serial
    const onAbort = () => {
      requests.value = requests.value.map((request) =>
        request.id === id ? { ...request, canceled: true } : request,
      )
    }
    signal.addEventListener('abort', onAbort, { once: true })
    requests.value = [
      ...requests.value,
      {
        id,
        node,
        canceled: false,
        resolve,
        reject,
        cleanup: () => signal.removeEventListener('abort', onAbort),
      },
    ]
  })
}
function finish(request: Request, failed = false) {
  requests.value = requests.value.filter((entry) => entry.id !== request.id)
  request.cleanup()
  if (failed) request.reject(new Error('Simulated server failure'))
  else
    request.resolve([
      {
        key: `loaded-${request.id}`,
        label: t(`Remote result ${request.id}`, `远端结果 ${request.id}`),
      },
    ])
}
onBeforeUnmount(() => {
  for (const request of requests.value) {
    request.cleanup()
    request.resolve([])
  }
})
</script>

<template>
  <div
    class="tree-view-demo"
    :dir="rtl ? 'rtl' : 'ltr'"
  >
    <div class="tree-view-demo__tools">
      <Checkbox
        v-model="rtl"
        :label="t('Use RTL', '使用 RTL')"
      />
      <Checkbox
        v-model="disabled"
        :label="t('Disable tree actions', '禁用树操作')"
      />
      <Checkbox
        v-model="multiple"
        :label="t('Allow multiple selection', '允许多选')"
      />
    </div>
    <section
      data-testid="tree-explorer"
      class="tree-view-demo__section"
    >
      <TreeView
        v-model:expanded-keys="expanded"
        v-model:selected-keys="selected"
        :nodes="nodes"
        :label="t('Workspace explorer', '工作区浏览')"
        :selection-mode="multiple ? 'multiple' : 'single'"
        :disabled="disabled"
        :locale="fieldLocale"
      />
      <p data-testid="tree-selected">
        {{ t('Selected:', '已选择：') }} {{ selected.join(', ') || '—' }}
      </p>
    </section>
    <section
      data-testid="tree-batch"
      class="tree-view-demo__section"
    >
      <Checkbox
        v-model="combined"
        :label="t('Inspect and check separately', '分别查看与勾选')"
      />
      <TreeView
        v-model:expanded-keys="batchExpanded"
        v-model:selected-keys="batchSelected"
        v-model:checked-keys="checked"
        :nodes="nodes"
        :label="t('Batch records', '批量记录')"
        check-mode="cascade"
        :selection-mode="combined ? 'single' : 'none'"
        :description="
          t(
            'Selection identifies the item to inspect; checks mark records for a separate batch action. Disabled records keep their stored checks.',
            '选择表示要查看的条目，勾选表示独立批量操作中的记录。禁用记录保留其已有勾选。',
          )
        "
        :disabled="disabled"
        :locale="fieldLocale"
      />
      <p data-testid="tree-checked">
        {{ t('Checked:', '已勾选：') }} {{ checked.join(', ') || '—' }}
      </p>
      <p data-testid="tree-inspected">
        {{ t('Inspecting:', '正在查看：') }} {{ batchSelected.join(', ') || '—' }}
      </p>
    </section>
    <section
      data-testid="tree-lazy"
      class="tree-view-demo__section"
    >
      <p>
        {{
          t(
            'Simulate branch responses below. A canceled read can still be completed to demonstrate that obsolete results are ignored.',
            '在下方模拟分支响应。取消的读取仍可返回，用于观察过期结果被忽略。',
          )
        }}
      </p>
      <TreeView
        v-model:expanded-keys="lazyExpanded"
        v-model:checked-keys="lazyChecked"
        :nodes="lazyNodes"
        :label="t('Remote records', '远端记录')"
        check-mode="independent"
        :load-children="load"
        :disabled="disabled"
        :locale="fieldLocale"
      />
      <p data-testid="tree-lazy-checked">
        {{ t('Checked:', '已勾选：') }} {{ lazyChecked.join(', ') || '—' }}
      </p>
      <section
        v-for="request in requests"
        :key="request.id"
        :data-load-request="request.id"
        class="tree-view-demo__response"
      >
        <p>
          {{ t('Response', '响应') }} {{ request.id }} · {{ request.node.label }}
          {{ request.canceled ? t('(cancellation requested)', '（已请求取消）') : '' }}
        </p>
        <div class="tree-view-demo__tools">
          <Button @click="finish(request)">{{ t('Return children', '返回子项') }}</Button
          ><Button
            variant="outlined"
            @click="finish(request, true)"
            >{{ t('Fail response', '拒绝响应') }}</Button
          >
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.tree-view-demo,
.tree-view-demo__section {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.tree-view-demo p {
  margin: 0;
  overflow-wrap: anywhere;
}
.tree-view-demo__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.tree-view-demo__response {
  display: grid;
  gap: 8px;
}
</style>
