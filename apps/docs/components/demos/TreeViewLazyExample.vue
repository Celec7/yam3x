<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { Button } from '@registry/components/button'
import { TreeView, type TreeViewKey, type TreeViewNode } from '@registry/components/tree-view'
import { lazyNodes } from './tree-view-demo-data'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const lazyExpanded = ref<TreeViewKey[]>([])
const lazyChecked = ref<TreeViewKey[]>([])
const nodes = computed<TreeViewNode[]>(() => lazyNodes(t))
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
  <div class="tree-view-demo">
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
        :nodes="nodes"
        :label="t('Remote records', '远端记录')"
        check-mode="independent"
        :load-children="load"
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
          <Button @click="finish(request)">{{ t('Return children', '返回子项') }}</Button>
          <Button
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
.tree-view-demo__section,
.tree-view-demo__response {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.tree-view-demo__response {
  gap: 8px;
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
</style>
