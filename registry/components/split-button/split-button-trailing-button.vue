<script setup lang="ts">
import { computed, inject } from 'vue'
import IconButton from '../icon-button/icon-button.vue'
import Icon from '../icon/icon.vue'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import type { IconButtonWidth } from '../icon-button/icon-button.types'
import type { SplitButtonVariant } from './split-button.types'
import { buttonVariant, splitButtonContextKey } from './split-button.context'
import { splitButtonTokens } from './split-button.tokens'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  variant?: SplitButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  disabled?: boolean
  width?: IconButtonWidth
}>()
const checked = defineModel<boolean>('checked', { default: false })
const context = inject(splitButtonContextKey, null)
const size = computed(() => props.size || context?.size.value || 'small')
const splitVariant = computed(() => props.variant || context?.variant.value || 'filled')
const iconButtonVariant = computed(() => buttonVariant(splitVariant.value))
const shape = computed(() => props.shape || context?.shape.value || 'round')
const style = computed(() => {
  const tokens = splitButtonTokens[size.value]
  const [leading, trailing] = tokens.trailingSpace[checked.value ? 'selected' : 'unselected']
  return {
    '--_yam3x-icon-button-icon-size': `${tokens.trailingIconSize}px`,
    '--_yam3x-icon-button-default-leading-space': `${leading}px`,
    '--_yam3x-icon-button-default-trailing-space': `${trailing}px`,
    ...(splitVariant.value === 'elevated'
      ? {
          '--_yam3x-icon-button-container-color':
            'var(--_yam3x-split-button-color-surface-container-low)',
          '--_yam3x-icon-button-icon-color': 'var(--_yam3x-split-button-color-primary)',
          '--_yam3x-icon-button-container-elevation': 'var(--_yam3x-split-button-elevation-level1)',
        }
      : {}),
  }
})
</script>

<template>
  <IconButton
    v-bind="$attrs"
    class="yam3x-split-button__menu"
    :class="{ 'yam3x-split-button__menu--elevated': splitVariant === 'elevated' }"
    :style="style"
    :variant="iconButtonVariant"
    :size="size"
    :shape="shape"
    :width="width || 'default'"
    :disabled="disabled"
    :aria-expanded="checked ? 'true' : 'false'"
    @click="checked = !checked"
  >
    <span
      class="yam3x-split-button__chevron"
      aria-hidden="true"
      ><Icon name="expand_more"
    /></span>
  </IconButton>
</template>
