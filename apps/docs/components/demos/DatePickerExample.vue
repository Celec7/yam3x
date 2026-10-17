<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { DatePicker, DateRangePicker, type DateRangeValue } from '@registry/components/date-picker'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const mode = ref<'auto' | 'docked' | 'modal'>('auto')
const selection = ref<'single' | 'range'>('single')

function toLocalDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function offsetDate(days: number): string {
  const value = new Date()
  value.setDate(value.getDate() + days)
  return toLocalDate(value)
}

const date = ref<string | null>(offsetDate(2))
const range = ref<DateRangeValue>({ start: offsetDate(3), end: offsetDate(8) })
</script>

<template>
  <section class="date-picker-example">
    <div class="date-picker-example__settings">
      <label
        >{{ t('Mode', '形态') }}
        <Select v-model="mode"
          ><Option
            value="auto"
            :label="t('Adaptive', '自适应')" /><Option
            value="docked"
            :label="t('Docked', '停靠式')" /><Option
            value="modal"
            :label="t('Modal', '模态')" /></Select
      ></label>
      <label
        >{{ t('Selection', '选择') }}
        <Select v-model="selection"
          ><Option
            value="single"
            :label="t('Single date', '单个日期')" /><Option
            value="range"
            :label="t('Date range', '日期范围')" /></Select
      ></label>
    </div>
    <DatePicker
      v-if="selection === 'single'"
      v-model="date"
      :mode="mode"
      :min-date="offsetDate(0)"
      :max-date="offsetDate(730)"
      :label="t('Event date', '活动日期')"
      placeholder="YYYY-MM-DD"
      :supporting-text="
        t(
          'Dates follow the current locale. Enter YYYY-MM-DD or open the calendar to choose a date.',
          '日期按当前语言显示；可输入 YYYY-MM-DD，或打开日历选择。',
        )
      "
      clearable
    />
    <DateRangePicker
      v-else
      v-model="range"
      :mode="mode"
      :label="t('Booking dates', '预订日期')"
      :start-date-label="t('Start date', '开始日期')"
      :end-date-label="t('End date', '结束日期')"
      :supporting-text="
        t('Choose a start date, then choose an end date.', '先选开始日期，再选结束日期。')
      "
    />
    <p
      class="date-picker-example__value"
      aria-live="polite"
    >
      {{ t('Current value:', '当前值：') }}
      {{
        selection === 'single'
          ? date || t('None selected', '未选择')
          : `${range.start || t('None selected', '未选择')} – ${range.end || t('None selected', '未选择')}`
      }}
    </p>
  </section>
</template>

<style scoped>
.date-picker-example {
  display: grid;
  gap: 20px;
  min-height: 560px;
  padding: 20px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  background: var(--md-sys-color-surface);
}
.date-picker-example__settings {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.date-picker-example__settings label {
  display: flex;
  gap: 8px;
  align-items: center;
}
.date-picker-example__value {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
