<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  idPrefix: string
  startDateLabel: string
  endDateLabel: string
  startValue: string
  endValue: string
  placeholder: string
  invalid: boolean
  errorId: string
  supportId?: string
  showSeparator?: boolean
}>()

const emit = defineEmits<{
  'update:start': [value: string]
  'update:end': [value: string]
  'commit:start': []
  'commit:end': []
}>()

function update(part: 'start' | 'end', event: Event): void {
  const value = (event.target as HTMLInputElement).value
  if (part === 'start') emit('update:start', value)
  else emit('update:end', value)
}

function commit(part: 'start' | 'end'): void {
  if (part === 'start') emit('commit:start')
  else emit('commit:end')
}
</script>

<template>
  <div class="yam3x-date-picker__range-field">
    <label :for="`${props.idPrefix}-start`">{{ props.startDateLabel }}</label>
    <input
      :id="`${props.idPrefix}-start`"
      :value="props.startValue"
      type="text"
      :placeholder="props.placeholder"
      :aria-invalid="props.invalid ? 'true' : undefined"
      :aria-describedby="props.invalid ? props.errorId : props.supportId"
      @input="update('start', $event)"
      @keydown.enter.prevent="commit('start')"
      @blur="commit('start')"
    />
  </div>
  <span
    v-if="props.showSeparator"
    class="yam3x-date-picker__range-separator"
    aria-hidden="true"
    >–</span
  >
  <div class="yam3x-date-picker__range-field">
    <label :for="`${props.idPrefix}-end`">{{ props.endDateLabel }}</label>
    <input
      :id="`${props.idPrefix}-end`"
      :value="props.endValue"
      type="text"
      :placeholder="props.placeholder"
      :aria-invalid="props.invalid ? 'true' : undefined"
      :aria-describedby="props.invalid ? props.errorId : props.supportId"
      @input="update('end', $event)"
      @keydown.enter.prevent="commit('end')"
      @blur="commit('end')"
    />
  </div>
</template>
