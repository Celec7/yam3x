<script setup lang="ts">
import Fab from './fab-base.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    size?: 'small' | 'default' | 'medium' | 'large'
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
    /** @deprecated Material recommends omitting the FAB while its action is unavailable. */
    disabled?: boolean
    /** @deprecated Material recommends omitting the FAB while its action is unavailable. */
    disabledInteractive?: boolean
    lowered?: boolean
  }>(),
  {
    size: 'default',
    variant: 'primary-container',
    type: 'button',
    disabled: false,
    disabledInteractive: false,
    lowered: false,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ default?(): unknown }>()
</script>

<template>
  <Fab
    v-bind="{ ...$attrs, ...props }"
    kind="standard"
    @click="emit('click', $event)"
  >
    <slot />
  </Fab>
</template>
