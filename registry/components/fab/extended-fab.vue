<script setup lang="ts">
import { useSlots } from 'vue'
import Fab from './fab-base.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    size?: 'small' | 'medium' | 'large'
    expanded?: boolean
    variant?:
      | 'primary-container'
      | 'secondary-container'
      | 'tertiary-container'
      | 'primary'
      | 'secondary'
      | 'tertiary'
    href?: string
    type?: 'button' | 'submit' | 'reset'
    id?: string
    name?: string
    value?: string
    form?: string
    /** @deprecated Material recommends omitting the Extended FAB while its action is unavailable. */
    disabled?: boolean
    /** @deprecated Material recommends omitting the Extended FAB while its action is unavailable. */
    disabledInteractive?: boolean
    lowered?: boolean
  }>(),
  {
    size: 'medium',
    expanded: true,
    variant: 'primary-container',
    type: 'button',
    disabled: false,
    disabledInteractive: false,
    lowered: false,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{
  default?(): unknown
  icon?(): unknown
}>()
const slots = useSlots()
</script>

<template>
  <Fab
    v-bind="{ ...$attrs, ...props }"
    kind="extended"
    :has-icon="Boolean(slots.icon)"
    @click="emit('click', $event)"
  >
    <template #icon><slot name="icon" /></template>
    <slot />
  </Fab>
</template>
