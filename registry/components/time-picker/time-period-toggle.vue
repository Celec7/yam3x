<script setup lang="ts">
const props = defineProps<{
  period: 'AM' | 'PM'
  options: Array<{ value: 'AM' | 'PM'; label: string }>
  label: string
  setPeriod: (period: 'AM' | 'PM') => void
}>()

function onKeydown(event: KeyboardEvent, index: number): void {
  const delta =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : 0
  if (!delta) return
  event.preventDefault()
  const nextIndex = (index + delta + props.options.length) % props.options.length
  const next = props.options[nextIndex]!
  props.setPeriod(next.value)
  ;(event.currentTarget as HTMLElement).parentElement
    ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    [nextIndex]?.focus()
}
</script>

<template>
  <div
    class="yam3x-time-picker__period"
    role="radiogroup"
    :aria-label="props.label"
  >
    <button
      v-for="(option, index) in props.options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === props.period"
      :tabindex="option.value === props.period ? 0 : -1"
      @click="props.setPeriod(option.value)"
      @keydown="onKeydown($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
