<script setup lang="ts">
import Fab from './fab-base.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    size?: 'default' | 'medium' | 'large'
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
    lowered?: boolean
  }>(),
  {
    size: 'default',
    variant: 'primary-container',
    type: 'button',
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
