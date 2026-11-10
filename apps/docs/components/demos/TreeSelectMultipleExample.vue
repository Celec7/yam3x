<script setup lang="ts">
import { computed, ref } from 'vue'
import { TreeSelect, type TreeSelectNode } from '@registry/components/tree-select'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const values = ref<string | string[] | null>(['brief', 'external', 'locked'])
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
    class="tree-select-multiple"
    data-testid="tree-select-multiple"
  >
    <FormField
      :label="t('Review scope', '审查范围')"
      :hint="
        t(
          'Accepted records appear as removable chips. Unknown or disabled records stay stored.',
          '已确认记录显示为可移除的芯片。未知或禁用记录仍会保留。',
        )
      "
    >
      <TreeSelect
        v-model="values"
        v-model:expanded-keys="expanded"
        :nodes="nodes"
        :label="t('Review scope', '审查范围')"
        :locale="localeTag"
        name="review-scope"
        multiple
        searchable
        clearable
      />
    </FormField>
    <p data-testid="tree-select-multiple-value">
      {{ t('Accepted records:', '已确认记录：') }}
      <output>{{ JSON.stringify(values) }}</output>
    </p>
  </section>
</template>

<style scoped>
.tree-select-multiple {
  display: grid;
  gap: 16px;
  max-inline-size: 22rem;
  min-inline-size: 0;
}
.tree-select-multiple p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
