<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cascader, type CascaderOption } from '@registry/components/cascader'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const value = ref<string[]>(['docs', 'design', 'guide'])
const query = ref('')
const options = computed<CascaderOption[]>(() => [
  {
    value: 'product',
    label: t('Product', '产品'),
    children: [
      {
        value: 'shared',
        label: t('Shared', '共享'),
        children: [
          { value: 'brief', label: t('Brief', '简报') },
          { value: 'locked', label: t('Unavailable', '暂不可用'), disabled: true },
        ],
      },
    ],
  },
  {
    value: 'docs',
    label: t('Documentation', '文档'),
    children: [
      {
        value: 'shared',
        label: t('Shared', '共享'),
        children: [
          { value: 'guide', label: t('Guide', '指南') },
          { value: 'api', label: 'API' },
        ],
      },
    ],
  },
  {
    value: 'archive',
    label: t('Archive', '归档'),
    disabled: true,
    children: [{ value: 'old', label: t('Old material', '旧资料') }],
  },
])
</script>

<template>
  <section
    class="cascader-search"
    data-testid="cascader-search"
  >
    <FormField
      :label="t('Component path', '组件路径')"
      :hint="
        t(
          'Search complete displayed paths. Confirm a branch explicitly, or choose a leaf to accept it.',
          '搜索完整的显示路径。可显式确认分支，或选择叶节点以确认。',
        )
      "
    >
      <Cascader
        v-model="value"
        v-model:query="query"
        :options="options"
        :label="t('Component path', '组件路径')"
        :locale="localeTag"
        name="component-path"
        searchable
        clearable
        select-branches
      />
    </FormField>
    <p data-testid="cascader-search-value">
      {{ t('Accepted path:', '已确认路径：') }} <output>{{ JSON.stringify(value) }}</output>
    </p>
  </section>
</template>

<style scoped>
.cascader-search {
  display: grid;
  gap: 16px;
  max-inline-size: 22rem;
  min-inline-size: 0;
}
.cascader-search p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
