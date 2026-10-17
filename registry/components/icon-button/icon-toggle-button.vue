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
    role?: 'button' | 'radio'
    type?: 'button' | 'submit' | 'reset'
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
    role: 'button',
    type: 'button',
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
  },
)
const checked = defineModel<boolean>('checked', { default: false })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{
  default?(): unknown
  'selected-icon'?(): unknown
}>()
const attrs = useAttrs()
const forwardedProps = computed(() => ({
  ...Object.fromEntries(
    Object.entries(attrs).filter(
      ([name]) =>
        ![
          'href',
          'toggle',
          'selected',
          'onUpdate:selected',
          'checked',
          'onUpdate:checked',
        ].includes(name),
    ),
  ),
  ...props,
}))
</script>

<template>
  <IconButtonBase
    v-bind="forwardedProps"
    v-model:selected="checked"
    toggle
    @click="emit('click', $event)"
  >
    <template #default><slot /></template>
    <template
      v-if="$slots['selected-icon']"
      #selected-icon
      ><slot name="selected-icon"
    /></template>
  </IconButtonBase>
</template>
