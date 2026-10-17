<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import ButtonBase from './button-base.vue'
import type { ButtonShape, ButtonSize, ToggleButtonVariant } from './button.variants'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    variant?: ToggleButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    role?: 'button' | 'radio'
    type?: 'button' | 'submit' | 'reset'
    id?: string
    name?: string
    value?: string
    form?: string
    disabled?: boolean
  }>(),
  {
    variant: 'filled',
    size: 'small',
    shape: 'round',
    role: undefined,
    type: 'button',
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
    disabled: false,
  },
)
const checked = defineModel<boolean>('checked', { default: false })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()
const forwardedAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([name]) =>
        ![
          'href',
          'disabledInteractive',
          'disabled-interactive',
          'toggle',
          'selected',
          'checked',
          'onUpdate:selected',
          'onUpdate:checked',
          'onBeforeinput',
          'onInput',
          'onChange',
        ].includes(name),
    ),
  ),
)
const buttonProps = computed(() => ({ ...forwardedAttrs.value, ...props }))
</script>

<template>
  <ButtonBase
    v-bind="buttonProps"
    v-model:selected="checked"
    toggle
    @click="emit('click', $event)"
  >
    <template #default><slot /></template>
    <template
      v-if="$slots.icon"
      #icon
      ><slot name="icon"
    /></template>
    <template
      v-if="$slots['selected-icon']"
      #selected-icon
      ><slot name="selected-icon"
    /></template>
    <template
      v-if="$slots.selected"
      #selected
      ><slot name="selected"
    /></template>
    <template
      v-if="$slots['trailing-icon']"
      #trailing-icon
      ><slot name="trailing-icon"
    /></template>
  </ButtonBase>
</template>
