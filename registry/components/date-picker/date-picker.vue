<script setup lang="ts">
import { ref } from 'vue'
import DatePickerCore from './date-picker-core.vue'
import type { DatePickerProps, DateRangeValue } from './date-picker.types'

const props = defineProps<DatePickerProps>()
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:open': [value: boolean]
  change: [value: string | null]
  invalid: [value: string]
}>()

const picker = ref<{ open: () => void; close: () => void; focus: () => void } | null>(null)

function onUpdateModelValue(value: string | null | DateRangeValue): void {
  if (value === null || typeof value === 'string') emit('update:modelValue', value)
}

function onChange(value: string | null | DateRangeValue): void {
  if (value === null || typeof value === 'string') emit('change', value)
}

defineExpose({
  open: () => picker.value?.open(),
  close: () => picker.value?.close(),
  focus: () => picker.value?.focus(),
})
</script>

<template>
  <DatePickerCore
    ref="picker"
    v-bind="props"
    selection="single"
    @update:model-value="onUpdateModelValue"
    @change="onChange"
    @update:open="emit('update:open', $event)"
    @invalid="emit('invalid', $event)"
  />
</template>
