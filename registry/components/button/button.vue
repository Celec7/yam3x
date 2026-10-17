<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import ButtonBase from './button-base.vue'
import type { ButtonShape, ButtonSize, ButtonVariant } from './button.variants'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    type?: 'button' | 'submit' | 'reset'
    href?: string
    id?: string
    name?: string
    value?: string
    form?: string
    disabled?: boolean
    disabledInteractive?: boolean
  }>(),
  {
    variant: 'filled',
    size: 'small',
    shape: 'round',
    type: 'button',
    href: undefined,
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
    disabled: false,
    disabledInteractive: false,
  },
)
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()
const forwardedAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([name]) =>
        ![
          'toggle',
          'selected',
          'onUpdate:selected',
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
    @click="emit('click', $event)"
  >
    <template #default><slot /></template>
    <template
      v-if="$slots.icon"
      #icon
      ><slot name="icon"
    /></template>
    <template
      v-if="$slots['trailing-icon']"
      #trailing-icon
      ><slot name="trailing-icon"
    /></template>
  </ButtonBase>
</template>
