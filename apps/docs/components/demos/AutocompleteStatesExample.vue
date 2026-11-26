<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import {
  Autocomplete,
  type AutocompleteFilter,
  type AutocompleteOption,
} from '@registry/components/autocomplete'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const requiredQuery = ref('')
const requiredSelected = ref<string | null>(null)
const customQuery = ref('')
const prefixQuery = ref('')
const automaticQuery = ref('')
const automaticSelected = ref<string | null>(null)
const suffixQuery = ref('')
const unrestrictedQuery = ref('')
const sensitiveQuery = ref('')
const customFilterQuery = ref('')
const dynamicAppleDisabled = ref(false)
const indicatorQuery = ref('')
const indicatorSelection = ref<string | null>(null)
const invalidQuery = ref('apple')
const invalidSelected = ref<string | null>(null)
const floatingQuery = ref('Apple')

const fruitResultsLabel = (count: number) =>
  t(`${count} fruits available`, `有 ${count} 种水果可选`)
const sameLengthFilter: AutocompleteFilter = (option, term) => option.label.length === term.length
const selection = computed<AutocompleteOption[]>(() => [
  { value: 'apple', label: t('Apple', '苹果') },
  { value: 'apricot', label: t('Apricot', '杏') },
  { value: 'banana', label: t('Banana', '香蕉') },
  { value: 'blueberry', label: t('Blueberry', '蓝莓') },
  { value: 'disabled', label: t('Unavailable option', '暂不可用的选项'), disabled: true },
])
const dynamicOptions = computed(() =>
  selection.value.map((option) =>
    option.value === 'apple' ? { ...option, disabled: dynamicAppleDisabled.value } : { ...option },
  ),
)

function toggleDynamicApple(): void {
  dynamicAppleDisabled.value = !dynamicAppleDisabled.value
}
</script>

<template>
  <details class="autocomplete-states">
    <summary>{{ t('Validation and custom input examples', '验证与自定义输入示例') }}</summary>
    <section
      class="autocomplete-states__body"
      data-testid="autocomplete-states"
    >
      <form
        id="autocomplete-validation"
        class="autocomplete-states__grid"
        @submit.prevent
      >
        <Autocomplete
          v-model="requiredQuery"
          v-model:selected="requiredSelected"
          :options="selection"
          :label="t('Required fruit', '必选水果')"
          :locale="localeTag"
          name="fruit"
          required
          selection-required
        />
        <div class="autocomplete-states__row">
          <Button type="submit">{{ t('Validate', '验证') }}</Button>
          <Button type="reset">{{ t('Reset', '重置') }}</Button>
        </div>
        <output data-testid="required-selection">{{ requiredSelected || t('None', '无') }}</output>
      </form>

      <Autocomplete
        v-model="customQuery"
        :options="selection"
        :label="t('Custom input', '自定义输入')"
        :locale="localeTag"
      >
        <template #input="{ inputProps }">
          <input
            v-bind="inputProps"
            class="yam3x-autocomplete__input custom-autocomplete-input"
          />
        </template>
      </Autocomplete>

      <Autocomplete
        v-model="prefixQuery"
        :options="selection"
        :label="t('Prefix fruit', '前缀匹配水果')"
        :locale="localeTag"
        filter="starts-with"
        :results-label="fruitResultsLabel"
      />
      <Autocomplete
        v-model="suffixQuery"
        :options="selection"
        :label="t('Suffix fruit', '后缀匹配水果')"
        :locale="localeTag"
        filter="ends-with"
      />
      <Autocomplete
        v-model="unrestrictedQuery"
        :options="selection"
        :label="t('Unfiltered fruit', '不过滤水果')"
        :locale="localeTag"
        filter="none"
      />
      <Autocomplete
        v-model="sensitiveQuery"
        :options="selection"
        :label="t('Case-sensitive fruit', '区分大小写的水果')"
        :locale="localeTag"
        case-sensitive
      />
      <Autocomplete
        v-model="customFilterQuery"
        :options="selection"
        :label="t('Custom-filtered fruit', '自定义筛选水果')"
        :locale="localeTag"
        :filter="sameLengthFilter"
      />

      <Autocomplete
        v-model="automaticQuery"
        v-model:selected="automaticSelected"
        :options="selection"
        :label="t('Auto activate fruit', '自动激活水果选项')"
        :locale="localeTag"
        auto-activate
      />
      <output data-testid="automatic-selection">{{ automaticSelected || t('None', '无') }}</output>

      <div class="autocomplete-states__row">
        <Button
          type="button"
          @pointerdown.prevent
          @click="toggleDynamicApple"
          >{{
            dynamicAppleDisabled
              ? t('Enable Apple', '启用苹果选项')
              : t('Disable Apple', '禁用苹果选项')
          }}</Button
        >
      </div>
      <Autocomplete
        :options="dynamicOptions"
        :label="t('Dynamic fruit', '动态水果选项')"
        :locale="localeTag"
        auto-activate
      />

      <Autocomplete
        :options="selection"
        :label="t('Disabled fruit', '禁用的水果选项')"
        :locale="localeTag"
        disabled
      />
      <Autocomplete
        :options="selection"
        :label="t('Readonly fruit', '只读水果选项')"
        :locale="localeTag"
        readonly
      />
      <Autocomplete
        :options="selection"
        :label="t('Hidden no-data', '隐藏无数据提示')"
        :locale="localeTag"
        hide-no-data
      />
      <Autocomplete
        :options="selection"
        :label="t('Hidden loading', '隐藏加载提示')"
        :locale="localeTag"
        loading
        hide-loading
      />
      <Autocomplete
        v-model="indicatorQuery"
        v-model:selected="indicatorSelection"
        :options="selection"
        :label="t('Hidden selection indicator', '隐藏选中指示器')"
        :locale="localeTag"
        hide-selection-indicator
      />
      <Autocomplete
        v-model="floatingQuery"
        :options="selection"
        :label="t('Floating fruit', '浮动水果')"
        :locale="localeTag"
        float-label="always"
      />
      <Autocomplete
        v-model="invalidQuery"
        v-model:selected="invalidSelected"
        :options="selection"
        :label="t('Invalid fruit', '无效水果')"
        :locale="localeTag"
        :error="t('Choose a listed fruit.', '请选择列表中的水果。')"
      />
      <Autocomplete
        :options="selection"
        :label="t('Loading fruit', '正在加载水果选项')"
        :locale="localeTag"
        loading
        :loading-text="t('Loading fruit options', '正在加载水果选项')"
        panel-class="autocomplete-demo-panel"
        :results-label="fruitResultsLabel"
      />
    </section>
  </details>
</template>

<style scoped>
.autocomplete-states {
  max-inline-size: 26rem;
}
.autocomplete-states > summary {
  cursor: pointer;
}
.autocomplete-states__body {
  display: grid;
  gap: 24px;
  margin-block-start: 16px;
}
.autocomplete-states__grid {
  display: grid;
  gap: 16px;
}
.autocomplete-states__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.autocomplete-states output {
  color: var(--md-sys-color-on-surface-variant, #49454f);
  overflow-wrap: anywhere;
}
</style>
