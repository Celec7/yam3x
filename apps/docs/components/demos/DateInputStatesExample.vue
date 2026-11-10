<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from '@registry/components/date-input'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, messages: text } = useDemoLocale({
  en: {
    disabled: 'Disabled',
    disabledInput: 'Disabled input',
    disabledHint: 'Disabled values stay visible but cannot be edited.',
    readOnly: 'Read-only',
    readOnlyInput: 'Read-only input',
    readOnlyHint: 'Read-only segments keep their value and refuse edits.',
    rtl: 'Right-to-left',
    rtlDate: 'Right-to-left date',
    rtlHint: 'The Hebrew locale supplies the segment order and direction.',
    currentValue: 'Current value',
  },
  zh: {
    disabled: '禁用',
    disabledInput: '禁用输入',
    disabledHint: '禁用值仍然可见，但无法编辑。',
    readOnly: '只读',
    readOnlyInput: '只读输入',
    readOnlyHint: '只读片段保留值并拒绝编辑。',
    rtl: '从右向左',
    rtlDate: '从右向左的日期',
    rtlHint: '希伯来语区域提供片段顺序和方向。',
    currentValue: '当前值',
  },
})

const dateTime = ref<Date | null>(new Date(2026, 9, 5, 13, 45, 30))
const rtlDate = new Date(2026, 9, 5)
</script>

<template>
  <div
    class="date-input-states"
    data-testid="date-input-states"
  >
    <section class="date-input-states__item">
      <h4>{{ text.disabled }}</h4>
      <DateInput
        :model-value="dateTime"
        :label="text.disabledInput"
        :hint="text.disabledHint"
        :locale="localeTag"
        disabled
      />
    </section>
    <section class="date-input-states__item">
      <h4>{{ text.readOnly }}</h4>
      <DateInput
        :model-value="dateTime"
        :label="text.readOnlyInput"
        :hint="text.readOnlyHint"
        :locale="localeTag"
        readonly
      />
    </section>
    <section class="date-input-states__item">
      <h4>{{ text.rtl }}</h4>
      <DateInput
        :model-value="rtlDate"
        :label="text.rtlDate"
        :hint="text.rtlHint"
        locale="he-IL"
      />
    </section>
  </div>
</template>

<style scoped>
.date-input-states {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: start;
}
.date-input-states__item {
  display: grid;
  justify-items: start;
  gap: 10px;
}
.date-input-states__item h4 {
  margin: 0;
  font-size: 15px;
}
</style>
