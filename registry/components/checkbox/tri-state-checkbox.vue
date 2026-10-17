<script setup lang="ts">
import { computed } from 'vue'
import CheckboxBase from './checkbox-base.vue'
import type { CheckboxProps, CheckboxState } from './checkbox.types'

const props = withDefaults(defineProps<CheckboxProps>(), {
  description: undefined,
  id: undefined,
  name: undefined,
  value: 'on',
  form: undefined,
  required: false,
  disabled: false,
  invalid: false,
})
const stateModel = defineModel<CheckboxState>({ default: 'unchecked' })
const emit = defineEmits<{
  click: [event: MouseEvent]
  input: [event: Event]
  invalid: [event: Event]
  change: [event: Event]
}>()
const initialState = stateModel.value
const state = computed(() => stateModel.value)

function onUpdateState(value: CheckboxState): void {
  stateModel.value = value
}
</script>

<template>
  <CheckboxBase
    v-bind="props"
    :state="state"
    :initial-state="initialState"
    @update:state="onUpdateState"
    @click="emit('click', $event)"
    @input="emit('input', $event)"
    @invalid="emit('invalid', $event)"
    @change="emit('change', $event)"
  />
</template>
