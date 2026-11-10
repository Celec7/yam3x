<script setup lang="ts">
import { computed, ref } from 'vue'
import { TreeSelect, type TreeSelectNode } from '@registry/components/tree-select'
import { FormField } from '@registry/components/form-field'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const value = ref<string | string[] | null>('brief')
const values = ref<string | string[] | null>(['tokens', 'external'])
const expanded = ref(['workspace', 'design'])
const rtl = ref(false)
const disabled = ref(false)
const cancel = ref(false)
const fail = ref(true)
const remote = ref<string | string[] | null>(null)
const remoteExpanded = ref<string[]>([])
const large = ref<string | string[] | null>('item-9999')
const hideLeadingLarge = ref(false)

const nodes = computed<TreeSelectNode[]>(() => [
  {
    key: 'workspace',
    label: t('Workspace', '工作区'),
    selectable: false,
    children: [
      {
        key: 'design',
        label: t('Design', '设计'),
        selectable: false,
        children: [
          { key: 'brief', label: t('Brief', '简报') },
          { key: 'tokens', label: t('Tokens', '令牌') },
        ],
      },
      { key: 'notes', label: t('Notes', '笔记') },
      { key: 'locked', label: t('Archived', '已归档'), disabled: true },
    ],
  },
])

const sourceLargeNodes = computed<TreeSelectNode[]>(() => [
  {
    key: 'catalog',
    label: t('Catalog', '目录'),
    selectable: false,
    children: Array.from({ length: 10000 }, (_, index) => ({
      key: `item-${index}`,
      label: t(`Item ${index + 1}`, `项目 ${index + 1}`),
    })),
  },
])
const largeNodes = computed(() =>
  hideLeadingLarge.value
    ? [{ ...sourceLargeNodes.value[0]!, children: sourceLargeNodes.value[0]!.children!.slice(2) }]
    : sourceLargeNodes.value,
)
const remoteNodes = computed<TreeSelectNode[]>(() => [
  { key: 'remote', label: t('Remote records', '远端记录'), hasChildren: true, selectable: false },
])

async function loadRemote(_node: Readonly<TreeSelectNode>, { signal }: { signal: AbortSignal }) {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, 180)
    const abort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
  })
  if (fail.value) {
    fail.value = false
    throw new Error('Demo failure')
  }
  return [{ key: 'remote-brief', label: t('Remote brief', '远端简报') }]
}
</script>

<template>
  <section
    class="tree-select-demo"
    data-testid="tree-select-demo"
    :dir="rtl ? 'rtl' : 'ltr'"
  >
    <div class="tree-select-demo__controls">
      <Checkbox
        v-model="rtl"
        :label="t('Mirror picker', '镜像选择器')"
      />
      <Checkbox
        v-model="disabled"
        :label="t('Disable record fields', '禁用记录字段')"
      />
      <Checkbox
        v-model="cancel"
        :label="t('Reject changes', '拒绝更改')"
      />
    </div>
    <form id="tree-select-form">
      <fieldset :disabled="disabled">
        <FormField :label="t('Document', '文档')">
          <TreeSelect
            v-model="value"
            v-model:expanded-keys="expanded"
            :nodes="nodes"
            :label="t('Document', '文档')"
            :locale="localeTag"
            name="document"
            required
            searchable
            clearable
            @beforeinput="cancel && $event.preventDefault()"
          />
        </FormField>
        <FormField :label="t('Document collection', '文档集合')">
          <TreeSelect
            v-model="values"
            :nodes="nodes"
            :expanded-keys="['workspace', 'design']"
            :label="t('Document collection', '文档集合')"
            :locale="localeTag"
            name="documents"
            multiple
            searchable
            clearable
            @beforeinput="cancel && $event.preventDefault()"
          />
        </FormField>
      </fieldset>
      <Button
        type="reset"
        variant="text"
        >{{ t('Reset documents', '重置文档') }}</Button
      >
    </form>
    <FormField :label="t('Loaded document', '加载的文档')">
      <TreeSelect
        v-model="remote"
        v-model:expanded-keys="remoteExpanded"
        :nodes="remoteNodes"
        :load-children="loadRemote"
        :label="t('Loaded document', '加载的文档')"
        :locale="localeTag"
      />
    </FormField>
    <FormField :label="t('Large document catalog', '大型文档目录')">
      <TreeSelect
        v-model="large"
        :nodes="largeNodes"
        :expanded-keys="['catalog']"
        :label="t('Large document catalog', '大型文档目录')"
        :locale="localeTag"
        virtual
        searchable
      />
    </FormField>
    <Checkbox
      v-model="hideLeadingLarge"
      :label="t('Hide leading large records', '隐藏大型目录开头记录')"
    />
    <p>
      {{ t('Selected document', '已选文档') }}: <output>{{ value ?? '—' }}</output>
    </p>
  </section>
</template>

<style scoped>
.tree-select-demo {
  display: grid;
  gap: 24px;
}
.tree-select-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.tree-select-demo form {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.tree-select-demo fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  min-inline-size: 0;
  padding: 0;
  border: 0;
}
.tree-select-demo :deep(.yam3x-form-field) {
  inline-size: min(100%, 320px);
}
.tree-select-demo p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
