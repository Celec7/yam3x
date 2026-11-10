<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@registry/components/calendar'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()

function toLocalDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startAt = toLocalDate(new Date())
const rangeStart = ref<string | null>(null)
const rangeEnd = ref<string | null>(null)
</script>

<template>
  <div
    class="calendar-range"
    data-testid="calendar-range"
  >
    <Calendar
      v-model:range-start="rangeStart"
      v-model:range-end="rangeEnd"
      selection="range"
      :label="t('Date range', '日期范围')"
      :start-at="startAt"
      :locale="localeTag"
    />
    <p class="calendar-range__value">
      {{ t('Date range:', '日期范围：') }} {{ rangeStart || t('Start date', '开始日期') }} →
      {{ rangeEnd || t('End date', '结束日期') }}
    </p>
  </div>
</template>

<style scoped>
.calendar-range {
  display: grid;
  justify-items: start;
  gap: 12px;
  min-inline-size: 0;
}
.calendar-range__value {
  margin: 0;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
</style>
