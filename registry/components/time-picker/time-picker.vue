<script setup lang="ts">
import { useTimePickerLocale } from './time-picker.locale'
import { ref } from 'vue'
import TimePickerControl from './time-picker-control.vue'
import type { TimePickerProps, TimeValue } from './time-picker.types'

const props = defineProps<TimePickerProps>()
const emit = defineEmits<{
  'update:modelValue': [value: TimeValue]
  change: [value: TimeValue]
}>()
const dragging = ref(false)
const { locale } = useTimePickerLocale(props)
</script>

<template>
  <div
    class="yam3x-time-picker"
    :dir="/^(ar|he|fa)(-|$)/i.test(locale) ? 'rtl' : undefined"
  >
    <div
      class="yam3x-time-picker__surface yam3x-time-picker__surface--inline"
      :class="{
        'is-horizontal': props.layoutType === 'horizontal',
        'is-24-hour': props.format === '24',
        'is-dragging': dragging,
      }"
    >
      <TimePickerControl
        v-bind="props"
        mode="dial"
        :show-mode-toggle="false"
        :show-actions="false"
        :show-headline="false"
        @update:model-value="emit('update:modelValue', $event)"
        @change="emit('change', $event)"
        @update:dragging="dragging = $event"
      />
    </div>
  </div>
</template>
