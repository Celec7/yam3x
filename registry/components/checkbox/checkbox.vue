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
const checked = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  click: [event: MouseEvent]
  input: [event: Event]
  invalid: [event: Event]
  change: [event: Event]
}>()
const initialState: CheckboxState = checked.value ? 'checked' : 'unchecked'
const state = computed<CheckboxState>(() => (checked.value ? 'checked' : 'unchecked'))

function onUpdateState(value: CheckboxState): void {
  checked.value = value === 'checked'
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
