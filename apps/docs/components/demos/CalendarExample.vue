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

function offsetDate(days: number): string {
  const value = new Date()
  value.setDate(value.getDate() + days)
  return toLocalDate(value)
}

const date = ref<string | null>(offsetDate(0))
</script>

<template>
  <div
    class="calendar-basic"
    data-testid="calendar-basic"
  >
    <Calendar
      v-model="date"
      :locale="localeTag"
      :is-special-date="(value) => value.endsWith('-15')"
    />
    <p class="calendar-basic__value">
      {{ t('Current selection:', '当前选择：') }} {{ date || t('None selected', '未选择') }}
    </p>
  </div>
</template>

<style scoped>
.calendar-basic {
  display: grid;
  justify-items: start;
  gap: 12px;
  min-inline-size: 0;
}
.calendar-basic__value {
  margin: 0;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
</style>
