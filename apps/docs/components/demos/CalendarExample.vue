<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@registry/components/calendar'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()

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

const date = ref<string | null>(offsetDate(0))
const restrictedStart = offsetDate(0)
const restrictedMin = offsetDate(5)
const restrictedMax = offsetDate(15)
const unavailableDate = offsetDate(10)
const rangeStart = ref<string | null>(null)
const rangeEnd = ref<string | null>(null)
</script>

<template>
  <div class="calendar-demo">
    <label class="calendar-demo__label">{{ t('Standalone calendar', '独立日历') }}</label>
    <Calendar
      v-model="date"
      :locale="locale"
      :is-special-date="(value) => value.endsWith('-15')"
    />
    <p>{{ t('Current selection:', '当前选择：') }} {{ date || t('None selected', '未选择') }}</p>
    <Calendar
      v-model:range-start="rangeStart"
      v-model:range-end="rangeEnd"
      selection="range"
      :label="t('Date range', '日期范围')"
      :start-at="date"
      :locale="locale"
    />
    <p>
      {{ t('Date range:', '日期范围：') }} {{ rangeStart || t('Start date', '开始日期') }} →
      {{ rangeEnd || t('End date', '结束日期') }}
    </p>
    <Calendar
      :label="t('Restricted dates', '受限日期')"
      :start-at="restrictedStart"
      :min-date="restrictedMin"
      :max-date="restrictedMax"
      :locale="locale"
      :is-date-selectable="(value) => value !== unavailableDate"
      :is-special-date="(value) => value.endsWith('-15')"
    />
  </div>
</template>

<style scoped>
.calendar-demo {
  display: grid;
  justify-items: start;
  gap: 12px;
}
.calendar-demo__label {
  font-weight: 600;
}
.calendar-demo p {
  margin: 0;
  color: var(--vp-c-text-2);
}
</style>
