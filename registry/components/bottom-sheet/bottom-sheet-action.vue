<script setup lang="ts">
import { inject } from 'vue'
import { bottomSheetCloseKey } from './bottom-sheet.context'

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const close = inject(bottomSheetCloseKey, undefined)
function onClick(event: MouseEvent): void {
  emit('click', event)
  if (!event.defaultPrevented) close?.()
}
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    @click="onClick"
  >
    <slot />
  </button>
</template>
