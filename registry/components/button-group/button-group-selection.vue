<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import ToggleButton from '../button/toggle-button.vue'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import IconToggleButton from '../icon-button/icon-toggle-button.vue'
import ButtonGroup from './button-group.vue'
import ButtonGroupItem from './button-group-item.vue'
import type {
  ButtonGroupButtonVariant,
  ButtonGroupIconButtonVariant,
  ButtonGroupOption,
  ButtonGroupOverflowItem,
  ButtonGroupSelectionMode,
  ButtonGroupValue,
  ButtonGroupVariant,
} from './button-group.types'

const props = withDefaults(
  defineProps<{
    options: ButtonGroupOption[]
    label: string
    variant?: ButtonGroupVariant
    selectionMode?: ButtonGroupSelectionMode
    selectionRequired?: boolean
    buttonVariant?: ButtonGroupButtonVariant
    iconButtonVariant?: ButtonGroupIconButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    overflow?: 'none' | 'menu'
    gap?: string | number
  }>(),
  {
    variant: 'standard',
    selectionMode: 'single',
    selectionRequired: false,
    buttonVariant: 'filled-tonal',
    iconButtonVariant: 'tonal',
    size: 'small',
    shape: 'round',
    overflow: 'none',
    gap: undefined,
  },
)
const model = defineModel<ButtonGroupValue>({ default: '' })
const emit = defineEmits<{
  select: [value: ButtonGroupValue, option: ButtonGroupOption]
}>()
defineSlots<{
  option?(props: { option: ButtonGroupOption; selected: boolean; disabled: boolean }): unknown
  'overflow-indicator'?(props: {
    items: ButtonGroupOverflowItem[]
    activate: (value: string) => void
  }): unknown
}>()

const single = computed(() => props.selectionMode === 'single')
const groupRole = computed(() => (single.value ? 'radiogroup' : 'group'))
const enabledOptions = computed(() => props.options.filter((option) => !option.disabled))

function isSelected(option: ButtonGroupOption): boolean {
  return Array.isArray(model.value)
    ? model.value.includes(option.value)
    : model.value === option.value
}

function tabIndex(option: ButtonGroupOption): number | undefined {
  if (!single.value) return undefined
  const hasSelectedEnabled = enabledOptions.value.some(isSelected)
  return isSelected(option) ||
    (!hasSelectedEnabled && enabledOptions.value[0]?.value === option.value)
    ? 0
    : -1
}

function onOptionKeydown(event: KeyboardEvent): void {
  if (!single.value || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
    return
  void nextTick(() => {
    const focused = document.activeElement
    const value =
      focused instanceof HTMLElement
        ? focused.closest<HTMLElement>('[data-group-value]')?.dataset.groupValue
        : undefined
    const option = props.options.find((item) => item.value === value)
    if (option && !isSelected(option)) onSelected(option, true)
  })
}

function onSelected(option: ButtonGroupOption, selected: boolean): void {
  if (option.disabled) return
  if (single.value && !selected && isSelected(option)) return
  let nextValue: ButtonGroupValue
  if (single.value) {
    if (!selected && props.selectionRequired) return
    nextValue = selected ? option.value : ''
  } else {
    const values = Array.isArray(model.value) ? model.value : []
    nextValue = selected
      ? [...new Set([...values, option.value])]
      : values.filter((value) => value !== option.value)
  }
  model.value = nextValue
  emit('select', nextValue, option)
}

function onGroupActivate(event: { value: string; source: 'button' | 'overflow' }): void {
  if (event.source !== 'overflow') return
  const option = props.options.find((item) => item.value === event.value)
  if (option) onSelected(option, !isSelected(option))
}

watch(
  [() => props.options, () => props.selectionMode, () => props.selectionRequired, model],
  () => {
    if (!enabledOptions.value.length) {
      if (props.selectionRequired) model.value = single.value ? '' : []
      return
    }
    if (single.value) {
      if (
        typeof model.value === 'string' &&
        enabledOptions.value.some(({ value }) => value === model.value)
      )
        return
      const currentValues = Array.isArray(model.value) ? model.value : []
      const retained = enabledOptions.value.find(({ value }) => currentValues.includes(value))
      const nextValue =
        retained?.value ?? (props.selectionRequired ? enabledOptions.value[0]!.value : '')
      if (model.value !== nextValue) model.value = nextValue
      return
    }
    const values = Array.isArray(model.value) ? model.value : model.value ? [model.value] : []
    const validValues = [...new Set(values)].filter((value) =>
      enabledOptions.value.some((option) => option.value === value),
    )
    if (validValues.length) {
      if (!Array.isArray(model.value) || validValues.length !== model.value.length)
        model.value = validValues
    } else if (props.selectionRequired) {
      model.value = [enabledOptions.value[0]!.value]
    } else if (!Array.isArray(model.value) || model.value.length) {
      model.value = []
    }
  },
  { deep: true, immediate: true, flush: 'post' },
)
</script>

<template>
  <ButtonGroup
    :label="label"
    :role="groupRole"
    :variant="variant"
    :size="size"
    :shape="shape"
    :overflow="overflow"
    :gap="gap"
    @activate="onGroupActivate"
  >
    <ButtonGroupItem
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :label="option.label"
      :disabled="option.disabled"
    >
      <IconToggleButton
        v-if="option.kind === 'icon'"
        :variant="
          variant === 'connected'
            ? iconButtonVariant
            : (option.iconButtonVariant ?? iconButtonVariant)
        "
        :size="size"
        :shape="shape"
        :disabled="option.disabled"
        :role="single ? 'radio' : 'button'"
        :checked="isSelected(option)"
        :tabindex="tabIndex(option)"
        :aria-label="option.label"
        @keydown="onOptionKeydown"
        @update:checked="onSelected(option, $event)"
      >
        <slot
          name="option"
          :option="option"
          :selected="isSelected(option)"
          :disabled="Boolean(option.disabled)"
        >
          {{ option.label }}
        </slot>
      </IconToggleButton>
      <ToggleButton
        v-else
        :variant="variant === 'connected' ? buttonVariant : (option.buttonVariant ?? buttonVariant)"
        :size="size"
        :shape="shape"
        :disabled="option.disabled"
        :role="single ? 'radio' : 'button'"
        :checked="isSelected(option)"
        :tabindex="tabIndex(option)"
        :aria-label="option.label"
        @keydown="onOptionKeydown"
        @update:checked="onSelected(option, $event)"
      >
        <slot
          name="option"
          :option="option"
          :selected="isSelected(option)"
          :disabled="Boolean(option.disabled)"
        >
          {{ option.label }}
        </slot>
      </ToggleButton>
    </ButtonGroupItem>
    <template
      v-if="$slots['overflow-indicator']"
      #overflow-indicator="{ items, activate }"
    >
      <slot
        name="overflow-indicator"
        :items="items"
        :activate="activate"
      />
    </template>
  </ButtonGroup>
</template>
