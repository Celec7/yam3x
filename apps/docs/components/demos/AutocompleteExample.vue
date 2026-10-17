<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import {
  Autocomplete,
  type AutocompleteFilter,
  type AutocompleteOption,
  type AutocompleteVariant,
} from '@registry/components/autocomplete'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const query = ref('')
const selected = ref<string | null>(null)
const variant = ref<AutocompleteVariant>('standard')
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
const events = ref<string[]>([])
const fruitResultsLabel = (count: number) =>
  t(`${count} fruits available`, `有 ${count} 种水果可选`)
const sameLengthFilter: AutocompleteFilter = (option, term) => option.label.length === term.length
const recordEvent = (name: string) => {
  events.value = [...events.value.slice(-4), name]
}
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
function toggleDynamicApple() {
  dynamicAppleDisabled.value = !dynamicAppleDisabled.value
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <label class="yam3x-demo__control">
      {{ t('Suggestion color', '建议菜单颜色') }}
      <Select
        v-model="variant"
        :aria-label="t('Suggestion color', '建议菜单颜色')"
      >
        <Option
          value="standard"
          :label="t('Standard', '标准')"
        />
        <Option
          value="vibrant"
          :label="t('Vibrant', '鲜明')"
        />
      </Select>
    </label>
    <Autocomplete
      v-model="query"
      v-model:selected="selected"
      :variant="variant"
      :options="selection"
      :label="t('Fruit', '水果')"
      :placeholder="t('Start typing', '开始输入')"
      @query="recordEvent('query')"
      @beforeselect="recordEvent('beforeselect')"
      @select="recordEvent('select')"
      @change="recordEvent('change')"
      @open="recordEvent('open')"
      @close="recordEvent('close')"
      @toggle="(event) => recordEvent(`toggle:${event.open ? 'open' : 'close'}`)"
    />
    <p class="yam3x-demo__status">
      {{ t('Input:', '输入：') }} {{ query || t('(empty)', '（空）') }};
      {{ t('Selected:', '已选：') }} {{ selected || t('None', '无') }}
    </p>
    <div
      class="autocomplete-events"
      data-testid="autocomplete-events"
    >
      {{ events.join(',') }}
    </div>
    <details>
      <summary>{{ t('Validation and custom input examples', '验证与自定义输入示例') }}</summary>
      <form
        id="autocomplete-validation"
        class="yam3x-demo__stack"
        @submit.prevent
      >
        <Autocomplete
          v-model="requiredQuery"
          v-model:selected="requiredSelected"
          :options="selection"
          :label="t('Required fruit', '必选水果')"
          name="fruit"
          required
          selection-required
        />
        <div class="yam3x-demo__row">
          <Button type="submit">{{ t('Validate', '验证') }}</Button>
          <Button type="reset">{{ t('Reset', '重置') }}</Button>
        </div>
        <output data-testid="required-selection">{{ requiredSelected || t('None', '无') }}</output>
      </form>
      <Autocomplete
        v-model="customQuery"
        :options="selection"
        :label="t('Custom input', '自定义输入')"
      >
        <template #input="{ inputProps }"
          ><input
            v-bind="inputProps"
            class="yam3x-autocomplete__input custom-autocomplete-input"
        /></template>
      </Autocomplete>
      <Autocomplete
        v-model="prefixQuery"
        :options="selection"
        :label="t('Prefix fruit', '前缀匹配水果')"
        filter="starts-with"
        :results-label="fruitResultsLabel"
      />
      <Autocomplete
        v-model="suffixQuery"
        :options="selection"
        :label="t('Suffix fruit', '后缀匹配水果')"
        filter="ends-with"
      />
      <Autocomplete
        v-model="unrestrictedQuery"
        :options="selection"
        :label="t('Unfiltered fruit', '不过滤水果')"
        filter="none"
      />
      <Autocomplete
        v-model="sensitiveQuery"
        :options="selection"
        :label="t('Case-sensitive fruit', '区分大小写的水果')"
        case-sensitive
      />
      <Autocomplete
        v-model="customFilterQuery"
        :options="selection"
        :label="t('Custom-filtered fruit', '自定义筛选水果')"
        :filter="sameLengthFilter"
      />
      <Autocomplete
        v-model="automaticQuery"
        v-model:selected="automaticSelected"
        :options="selection"
        :label="t('Auto activate fruit', '自动激活水果选项')"
        auto-activate
      />
      <output data-testid="automatic-selection">{{ automaticSelected || t('None', '无') }}</output>
      <div class="yam3x-demo__row">
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
        auto-activate
      />
      <Autocomplete
        :options="selection"
        :label="t('Disabled fruit', '禁用的水果选项')"
        disabled
      />
      <Autocomplete
        :options="selection"
        :label="t('Readonly fruit', '只读水果选项')"
        readonly
      />
      <Autocomplete
        :options="selection"
        :label="t('Hidden no-data', '隐藏无数据提示')"
        hide-no-data
      />
      <Autocomplete
        :options="selection"
        :label="t('Hidden loading', '隐藏加载提示')"
        loading
        hide-loading
      />
      <Autocomplete
        v-model="indicatorQuery"
        v-model:selected="indicatorSelection"
        :options="selection"
        :label="t('Hidden selection indicator', '隐藏选中指示器')"
        hide-selection-indicator
      />
      <Autocomplete
        :options="selection"
        :label="t('Loading fruit', '正在加载水果选项')"
        loading
        :loading-text="t('Loading fruit options', '正在加载水果选项')"
        panel-class="autocomplete-demo-panel"
        :results-label="fruitResultsLabel"
      />
    </details>
  </div>
</template>
