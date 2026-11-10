<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Calendar } from '@registry/components/calendar'
import { useDemoDirection } from './use-demo-direction'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const { dir, toggle } = useDemoDirection()
const date = ref<string | null>('2026-10-05')
</script>

<template>
  <div
    class="calendar-rtl"
    data-testid="calendar-rtl"
  >
    <Button
      type="button"
      variant="outlined"
      @click="toggle"
      >{{ t('Switch direction', '切换方向') }}</Button
    >
    <div :dir="dir">
      <Calendar
        v-model="date"
        :label="t('RTL example', 'RTL 示例')"
        start-at="2026-10-05"
        :locale="localeTag"
      />
    </div>
    <p class="calendar-rtl__value">
      {{ t('Direction:', '方向：') }} {{ dir.toUpperCase() }} · {{ t('Selected:', '已选：') }}
      {{ date || t('None selected', '未选择') }}
    </p>
  </div>
</template>

<style scoped>
.calendar-rtl {
  display: grid;
  justify-items: start;
  gap: 12px;
  min-inline-size: 0;
}
.calendar-rtl__value {
  margin: 0;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
</style>
