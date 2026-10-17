<script setup lang="ts">
import { useAttrs } from 'vue'
import SliderBase from './slider-base.vue'
import type { SliderModel, SliderProps } from './slider-utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SliderProps>(), {
  variant: 'standard',
  orientation: 'horizontal',
  size: 'extra-small',
  min: 0,
  max: 100,
  step: 1,
  stops: false,
  labelled: false,
  disabled: false,
})

const model = defineModel<SliderModel>({ default: 0 })
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [event: Event]
  change: [event: Event]
}>()
const attrs = useAttrs()
</script>

<template>
  <SliderBase
    v-bind="{ ...attrs, ...props }"
    v-model="model"
    @beforeinput="emit('beforeinput', $event)"
    @input="emit('input', $event)"
    @change="emit('change', $event)"
  >
    <slot />
  </SliderBase>
</template>
