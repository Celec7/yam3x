<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue'
import { listVariantKey, type ListVariant } from './list.types'
import './list.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ variant?: ListVariant }>(), { variant: 'standard' })
const attrs = useAttrs()
const variant = computed<ListVariant>(() =>
  props.variant === 'segmented' ? 'segmented' : 'standard',
)
provide(listVariantKey, { variant })
</script>

<template>
  <ul
    v-bind="attrs"
    class="yam3x-list"
    :class="['yam3x-list--' + variant]"
    :data-variant="variant"
    role="list"
  >
    <slot />
  </ul>
</template>
