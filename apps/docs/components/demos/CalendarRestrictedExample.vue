<script setup lang="ts">
import { computed } from 'vue'
import { Calendar } from '@registry/components/calendar'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()

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

const startAt = offsetDate(0)
const minDate = offsetDate(5)
const maxDate = offsetDate(15)
const unavailableDate = offsetDate(10)
const dateFormat = computed(
  () => new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium', timeZone: 'UTC' }),
)

function formatDate(value: string): string {
  return dateFormat.value.format(new Date(`${value}T00:00:00Z`))
}
</script>

<template>
  <div
    class="calendar-restricted"
    data-testid="calendar-restricted"
  >
    <Calendar
      :label="t('Restricted dates', '受限日期')"
      :start-at="startAt"
      :min-date="minDate"
      :max-date="maxDate"
      :locale="localeTag"
      :is-date-selectable="(value) => value !== unavailableDate"
      :is-special-date="(value) => value.endsWith('-15')"
    />
    <p class="calendar-restricted__value">
      {{
        t(
          `Available ${formatDate(minDate)} to ${formatDate(maxDate)}; ${formatDate(
            unavailableDate,
          )} is unavailable.`,
          `可选范围 ${formatDate(minDate)} 至 ${formatDate(maxDate)}；${formatDate(
            unavailableDate,
          )} 不可选。`,
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.calendar-restricted {
  display: grid;
  justify-items: start;
  gap: 12px;
  min-inline-size: 0;
}
.calendar-restricted__value {
  margin: 0;
  color: var(--vp-c-text-2);
}
</style>
