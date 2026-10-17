<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import IconButtonBase from './icon-button-base.vue'
import type {
  IconButtonShape,
  IconButtonSize,
  IconButtonVariant,
  IconButtonWidth,
} from './icon-button.types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    variant?: IconButtonVariant
    size?: IconButtonSize
    width?: IconButtonWidth
    shape?: IconButtonShape
    disabled?: boolean
    disabledInteractive?: boolean
    type?: 'button' | 'submit' | 'reset'
    href?: string
    id?: string
    name?: string
    value?: string
    form?: string
  }>(),
  {
    variant: 'filled',
    size: 'small',
    width: 'default',
    shape: 'round',
    disabled: false,
    disabledInteractive: false,
    type: 'button',
    href: undefined,
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
  },
)
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ default?(): unknown }>()
const attrs = useAttrs()
const forwardedProps = computed(() => ({
  ...Object.fromEntries(
    Object.entries(attrs).filter(
      ([name]) =>
        !['toggle', 'selected', 'checked', 'onUpdate:selected', 'onUpdate:checked'].includes(name),
    ),
  ),
  ...props,
}))
</script>

<template>
  <IconButtonBase
    v-bind="forwardedProps"
    @click="emit('click', $event)"
  >
    <slot />
  </IconButtonBase>
</template>
