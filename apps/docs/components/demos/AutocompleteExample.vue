<script setup lang="ts">
import { computed, ref } from 'vue'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import {
  Autocomplete,
  type AutocompleteOption,
  type AutocompleteVariant,
} from '@registry/components/autocomplete'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const query = ref('')
const selected = ref<string | null>(null)
const variant = ref<AutocompleteVariant>('standard')
const events = ref<string[]>([])

const options = computed<AutocompleteOption[]>(() => [
  { value: 'apple', label: t('Apple', '苹果') },
  { value: 'apricot', label: t('Apricot', '杏') },
  { value: 'banana', label: t('Banana', '香蕉') },
  { value: 'blueberry', label: t('Blueberry', '蓝莓') },
  { value: 'disabled', label: t('Unavailable option', '暂不可用的选项'), disabled: true },
])

function recordEvent(name: string): void {
  events.value = [...events.value.slice(-4), name]
}
</script>

<template>
  <section
    class="autocomplete-demo yam3x-demo yam3x-demo__stack"
    data-testid="autocomplete-example"
  >
    <label class="autocomplete-demo__control">
      {{ t('Suggestion color', '建议菜单颜色') }}
      <Select
        v-model="variant"
        :aria-label="t('Suggestion color', '建议菜单颜色')"
        :locale="localeTag"
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
      :options="options"
      :label="t('Fruit', '水果')"
      :hint="t('Type to filter the fruit list.', '输入以筛选水果列表。')"
      :placeholder="t('Start typing', '开始输入')"
      :locale="localeTag"
      @query="recordEvent('query')"
      @beforeselect="recordEvent('beforeselect')"
      @select="recordEvent('select')"
      @change="recordEvent('change')"
      @open="recordEvent('open')"
      @close="recordEvent('close')"
      @toggle="(event) => recordEvent(`toggle:${event.open ? 'open' : 'close'}`)"
    />
    <p class="autocomplete-demo__status">
      {{ t('Input:', '输入：') }} {{ query || t('(empty)', '（空）') }};
      {{ t('Selected:', '已选：') }} {{ selected || t('None', '无') }}
    </p>
    <p
      class="autocomplete-demo__events"
      data-testid="autocomplete-events"
    >
      {{ events.join(',') || t('No events yet', '暂无事件') }}
    </p>
  </section>
</template>

<style scoped>
.autocomplete-demo {
  display: grid;
  gap: 16px;
  min-inline-size: 0;
}
.autocomplete-demo__control {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.autocomplete-demo__status,
.autocomplete-demo__events {
  margin: 0;
  overflow-wrap: anywhere;
}
.autocomplete-demo__events {
  min-inline-size: 0;
  max-inline-size: 100%;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  overflow-wrap: anywhere;
}
</style>
