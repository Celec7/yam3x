<script setup lang="ts">
import { computed, inject } from 'vue'
import Button from '../button/button.vue'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import type { SplitButtonVariant } from './split-button.types'
import { splitButtonContextKey } from './split-button.context'
import { splitButtonTokens } from './split-button.tokens'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  variant?: SplitButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  disabled?: boolean
}>()
defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ default?(): unknown; icon?(): unknown; 'trailing-icon'?(): unknown }>()
const context = inject(splitButtonContextKey, null)
const style = computed(() => {
  const size = props.size || context?.size.value || 'small'
  const [start, end] = splitButtonTokens[size].leadingPadding
  return {
    '--_yam3x-split-button-leading-padding-start': `${start}px`,
    '--_yam3x-split-button-leading-padding-end': `${end}px`,
    '--_yam3x-button-padding-inline':
      'calc(var(--_yam3x-split-button-leading-padding-start) * var(--_yam3x-split-button-density-scale, 1)) calc(var(--_yam3x-split-button-leading-padding-end) * var(--_yam3x-split-button-density-scale, 1))',
  }
})
</script>

<template>
  <Button
    v-bind="$attrs"
    class="yam3x-split-button__primary"
    :style="style"
    data-yam3x-ripple-min-pressed-duration="225"
    :variant="variant || context?.variant.value || 'filled'"
    :size="size || context?.size.value || 'small'"
    :shape="shape || context?.shape.value || 'round'"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <template
      v-if="$slots.icon"
      #icon
      ><slot name="icon"
    /></template>
    <template #default><slot /></template>
    <template
      v-if="$slots['trailing-icon']"
      #trailing-icon
      ><slot name="trailing-icon"
    /></template>
  </Button>
</template>
