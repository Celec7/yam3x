<script setup lang="ts">
import { computed, ref } from 'vue'
import { TreeSelect, type TreeSelectNode } from '@registry/components/tree-select'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const value = ref<string | string[] | null>('brief')
const expanded = ref(['workspace', 'design'])
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
</script>

<template>
  <section
    class="tree-select-basic"
    data-testid="tree-select-basic"
  >
    <FormField
      :label="t('Project document', '项目文档')"
      :hint="t('Search labels or browse the tree.', '搜索标签或浏览树。')"
    >
      <TreeSelect
        v-model="value"
        v-model:expanded-keys="expanded"
        :nodes="nodes"
        :label="t('Project document', '项目文档')"
        :locale="localeTag"
        name="project-document"
        searchable
        clearable
        required
      />
    </FormField>
    <p data-testid="tree-select-basic-value">
      {{ t('Accepted document:', '已确认文档：') }} <output>{{ value ?? '—' }}</output>
    </p>
  </section>
</template>

<style scoped>
.tree-select-basic {
  display: grid;
  gap: 16px;
  max-inline-size: 22rem;
  min-inline-size: 0;
}
.tree-select-basic p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
