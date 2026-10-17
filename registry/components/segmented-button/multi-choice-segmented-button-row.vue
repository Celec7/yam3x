<script setup lang="ts">
import { useAttrs } from 'vue'
import SegmentedButtonRow from './segmented-button-row.vue'
import type { SegmentedButtonChangeDetail } from './segmented-button.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    name?: string
    density?: 0 | 1 | 2 | 3
  }>(),
  { disabled: false, density: 0 },
)
const model = defineModel<string[]>({ default: () => [] })
const emit = defineEmits<{
  change: [detail: SegmentedButtonChangeDetail<string[]>]
}>()
defineSlots<{ default?(): unknown }>()

const attrs = useAttrs()

function onModelUpdate(value: string | string[] | null): void {
  if (Array.isArray(value)) model.value = value
}

function onChange(detail: SegmentedButtonChangeDetail): void {
  emit('change', detail as SegmentedButtonChangeDetail<string[]>)
}
</script>

<template>
  <SegmentedButtonRow
    v-bind="attrs"
    mode="multiple"
    :model-value="model"
    :disabled="props.disabled"
    :name="props.name"
    :density="props.density"
    @update:model-value="onModelUpdate"
    @change="onChange"
  >
    <slot />
  </SegmentedButtonRow>
</template>
