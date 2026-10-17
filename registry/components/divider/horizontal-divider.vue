<script setup lang="ts">
import DividerBase from './divider-base.vue'
import type { DividerProps } from './divider.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DividerProps>(), {
  decorative: true,
})
</script>

<template>
  <DividerBase
    v-bind="$attrs"
    :thickness="props.thickness"
    :color="props.color"
    :inset="props.inset"
    :inset-start="props.insetStart"
    :inset-end="props.insetEnd"
    :decorative="props.decorative"
    orientation="horizontal"
  />
</template>
