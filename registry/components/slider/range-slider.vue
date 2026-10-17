<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import SliderBase from './slider-base.vue'
import type { RangeSliderModel, RangeSliderProps } from './slider-utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<RangeSliderProps>(), {
  orientation: 'horizontal',
  size: 'extra-small',
  min: 0,
  max: 100,
  step: 1,
  stops: false,
  labelled: false,
  disabled: false,
})

const model = defineModel<RangeSliderModel>()
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [event: Event]
  change: [event: Event]
}>()
const value = computed<RangeSliderModel>({
  get: () => model.value ?? [props.min, props.max],
  set: (next) => {
    model.value = next
  },
})
const attrs = useAttrs()
</script>

<template>
  <SliderBase
    v-bind="{ ...attrs, ...props }"
    v-model="value"
    variant="range"
    @beforeinput="emit('beforeinput', $event)"
    @input="emit('input', $event)"
    @change="emit('change', $event)"
  />
</template>
