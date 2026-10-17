<script setup lang="ts">
import ActionChip from './action-chip.vue'

defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    variant?: 'outlined' | 'elevated'
    href?: string
    target?: string
    rel?: string
    download?: string | boolean
    type?: 'button' | 'submit' | 'reset'
    name?: string
    value?: string
    form?: string
    disabled?: boolean
  }>(),
  { variant: 'outlined', type: 'button', disabled: false },
)
defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <ActionChip
    kind="suggestion"
    v-bind="{ ...$props, ...$attrs }"
    @click="$emit('click', $event)"
  >
    <template
      v-if="$slots.icon"
      #icon
      ><slot name="icon"
    /></template>
    <slot />
  </ActionChip>
</template>
