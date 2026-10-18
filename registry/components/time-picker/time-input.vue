<script setup lang="ts">
import { useTimePickerLocale } from './time-picker.locale'
import TimePickerControl from './time-picker-control.vue'
import type { TimeInputProps, TimeValue } from './time-picker.types'

const props = defineProps<TimeInputProps>()
const emit = defineEmits<{
  'update:modelValue': [value: TimeValue]
  change: [value: TimeValue]
}>()
const { locale } = useTimePickerLocale(props)
</script>

<template>
  <div
    class="yam3x-time-picker"
    :dir="/^(ar|he|fa)(-|$)/i.test(locale) ? 'rtl' : undefined"
  >
    <div class="yam3x-time-picker__surface yam3x-time-picker__surface--inline is-input-mode">
      <TimePickerControl
        v-bind="props"
        mode="input"
        :show-mode-toggle="false"
        :show-actions="false"
        :show-headline="false"
        @update:model-value="emit('update:modelValue', $event)"
        @change="emit('change', $event)"
      />
    </div>
  </div>
</template>
