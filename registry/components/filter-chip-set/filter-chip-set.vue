<script setup lang="ts">
import { computed, ref } from 'vue'
import FilterChip from '../filter-chip/filter-chip.vue'
import type { FilterChipOption } from './filter-chip-set.types'

const props = withDefaults(
  defineProps<{
    options: readonly FilterChipOption[]
    label: string
    multi?: boolean
    disabled?: boolean
    vertical?: boolean
    name?: string
    form?: string
    variant?: 'outlined' | 'elevated'
    hideSelectionIndicator?: boolean
  }>(),
  {
    multi: false,
    disabled: false,
    vertical: false,
    name: undefined,
    form: undefined,
    variant: 'outlined',
    hideSelectionIndicator: false,
  },
)

const model = defineModel<string | string[] | null>({ default: null })
const emit = defineEmits<{ change: [value: string | string[] | null] }>()
const root = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)

const selectedValues = computed(() =>
  props.multi
    ? Array.isArray(model.value)
      ? model.value
      : model.value == null
        ? []
        : [model.value]
    : model.value == null
      ? []
      : [Array.isArray(model.value) ? model.value[0] : model.value],
)

const tabStopIndex = computed(() => {
  if (props.disabled) return -1
  if (activeIndex.value >= 0 && !props.options[activeIndex.value]?.disabled)
    return activeIndex.value
  const selected = props.options.findIndex(
    (option) => !option.disabled && selectedValues.value.includes(option.value),
  )
  return selected >= 0 ? selected : props.options.findIndex((option) => !option.disabled)
})

function selectOption(option: FilterChipOption): void {
  if (props.disabled || option.disabled) return
  let next: string | string[] | null
  if (props.multi) {
    const current = selectedValues.value
    next = current.includes(option.value)
      ? current.filter((value) => value !== option.value)
      : [...current, option.value]
  } else {
    next = selectedValues.value.includes(option.value) ? null : option.value
  }
  model.value = next
  emit('change', next)
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const enabled = props.options.flatMap((option, optionIndex) =>
    props.disabled || option.disabled ? [] : [optionIndex],
  )
  if (!enabled.length) return
  const rtl = root.value && getComputedStyle(root.value).direction === 'rtl'
  const forward = props.vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  const backward = props.vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  let next: number | undefined
  if (event.key === 'Home') next = enabled[0]
  else if (event.key === 'End') next = enabled.at(-1)
  else if (event.key === forward || event.key === backward) {
    const position = enabled.indexOf(index)
    const step = event.key === forward ? 1 : -1
    next = enabled[(position + step + enabled.length) % enabled.length]
  }
  if (next === undefined) return
  event.preventDefault()
  activeIndex.value = next
  root.value?.querySelector<HTMLElement>(`[data-chip-index="${next}"]`)?.focus()
}
</script>

<template>
  <div
    ref="root"
    class="yam3x-filter-chip-set"
    :class="{ 'yam3x-filter-chip-set--vertical': vertical }"
    role="grid"
    :aria-label="label"
    :aria-multiselectable="multi ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div
      class="yam3x-filter-chip-set__row"
      role="row"
    >
      <FilterChip
        v-for="(option, index) in options"
        :key="option.value"
        :data-chip-index="index"
        role="gridcell"
        :aria-selected="selectedValues.includes(option.value)"
        :aria-disabled="disabled || option.disabled ? 'true' : undefined"
        :selected="selectedValues.includes(option.value)"
        :selection-indicator="!hideSelectionIndicator"
        :variant="variant"
        :disabled="disabled || option.disabled"
        :tabindex="index === tabStopIndex ? 0 : -1"
        @focus="activeIndex = index"
        @keydown="onKeydown($event, index)"
        @update:selected="selectOption(option)"
      >
        <template
          v-if="$slots.icon"
          #icon
          ><slot
            name="icon"
            :option="option"
        /></template>
        {{ option.label }}
      </FilterChip>
    </div>
    <template v-if="name">
      <input
        v-for="value in selectedValues"
        :key="value"
        type="hidden"
        :name="name"
        :value="value"
        :form="form"
        :disabled="disabled || options.find((option) => option.value === value)?.disabled"
      />
    </template>
  </div>
</template>

<style scoped>
.yam3x-filter-chip-set {
  --_yam3x-filter-chip-set-gap: max(
    8px,
    var(--md-sys-spacing-8, calc(8px * var(--md-sys-density-spacing-scale, 1)))
  );
  display: inline-flex;
  max-width: 100%;
}
.yam3x-filter-chip-set__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--_yam3x-filter-chip-set-gap);
  max-width: 100%;
}
.yam3x-filter-chip-set--vertical .yam3x-filter-chip-set__row {
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
}
.yam3x-filter-chip-set :deep(.yam3x-filter-chip) {
  flex: none;
}
</style>
