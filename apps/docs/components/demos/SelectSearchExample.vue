<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormField } from '@registry/components/form-field'
import { Option, OptionGroup } from '@registry/components/option'
import { Button } from '@registry/components/button'
import { Select, type SelectFilter } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const searchChoice = ref('ts')
const searchChoices = ref(['ts'])
const filterControl = ref<string | string[] | null>('contains')
const filterMode = computed<SelectFilter>(() =>
  filterControl.value === 'starts-with' || filterControl.value === 'ends-with'
    ? filterControl.value
    : 'contains',
)
const searchOptions = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby', disabled: true },
]
</script>

<template>
  <section
    class="select-search-demo"
    data-testid="select-search"
  >
    <form id="select-search-form">
      <FormField :label="t('Searchable language', '可搜索的语言')"
        ><Select
          v-model="searchChoice"
          name="search-language"
          searchable
          required
          :filter="filterMode"
        >
          <OptionGroup :label="t('Web', '网页')"
            ><Option
              value="ts"
              label="TypeScript"
          /></OptionGroup>
          <OptionGroup :label="t('Systems', '系统')"
            ><Option
              value="rust"
              label="Rust" /><Option
              value="ruby"
              label="Ruby"
              disabled
          /></OptionGroup> </Select
      ></FormField>
      <FormField :label="t('Searchable collection', '可搜索的集合')"
        ><Select
          v-model="searchChoices"
          :options="searchOptions"
          name="search-languages"
          searchable
          multiple
          selection-display="chips"
      /></FormField>
      <Button
        type="reset"
        variant="text"
        >{{ t('Reset languages', '重置语言') }}</Button
      >
      <div class="select-search-demo__controls">
        <label for="select-search-filter">{{ t('Filter mode', '筛选方式') }}</label>
        <Select
          id="select-search-filter"
          v-model="filterControl"
        >
          <Option
            value="contains"
            :label="t('Contains', '包含')"
          />
          <Option
            value="starts-with"
            :label="t('Starts with', '开头匹配')"
          />
          <Option
            value="ends-with"
            :label="t('Ends with', '结尾匹配')"
          />
        </Select>
      </div>
    </form>
    <p class="select-search-demo__note">
      {{
        t(
          'The filter applies to the grouped list on the left. Accepted values keep their form values while the query only narrows the visible choices.',
          '筛选方式作用于左侧的分组列表。已接受的值保留其表单值，查询文字只缩小可见选项范围。',
        )
      }}
    </p>
  </section>
</template>

<style scoped>
.select-search-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-search-demo form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-search-demo :deep(.yam3x-form-field) {
  inline-size: min(100%, 320px);
}
.select-search-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  inline-size: 100%;
}
.select-search-demo__note {
  flex-basis: 100%;
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
