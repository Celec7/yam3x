<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cascader, type CascaderOption } from '@registry/components/cascader'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const value = ref<string[]>(['product', 'design', 'brief'])
const options = computed<CascaderOption[]>(() => [
  {
    value: 'product',
    label: t('Product', '产品'),
    children: [
      {
        value: 'design',
        label: t('Design', '设计'),
        children: [
          { value: 'brief', label: t('Brief', '简报') },
          { value: 'tokens', label: t('Tokens', '令牌') },
        ],
      },
      {
        value: 'engineering',
        label: t('Engineering', '研发'),
        children: [{ value: 'release', label: t('Release', '发布') }],
      },
    ],
  },
  {
    value: 'docs',
    label: t('Documentation', '文档'),
    children: [{ value: 'guide', label: t('Guide', '指南') }],
  },
])
</script>

<template>
  <section
    class="cascader-basic"
    data-testid="cascader-basic"
  >
    <FormField
      :label="t('Project location', '项目位置')"
      :hint="
        t('Open the picker, then choose a column and a value.', '打开选择器，然后选择列和值。')
      "
    >
      <Cascader
        v-model="value"
        :options="options"
        :label="t('Project location', '项目位置')"
        :locale="localeTag"
        name="project-location"
        searchable
        clearable
      />
    </FormField>
    <p data-testid="cascader-basic-value">
      {{ t('Accepted path:', '已确认路径：') }} <output>{{ JSON.stringify(value) }}</output>
    </p>
  </section>
</template>

<style scoped>
.cascader-basic {
  display: grid;
  gap: 16px;
  max-inline-size: 22rem;
  min-inline-size: 0;
}
.cascader-basic p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
