<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import InputChip from './input-chip.vue'

const props = withDefaults(
  defineProps<{
    label: string
    name?: string
    form?: string
    placeholder?: string
    disabled?: boolean
    maxChips?: number | null
    vertical?: boolean
    reorderable?: boolean
  }>(),
  {
    name: undefined,
    form: undefined,
    placeholder: '',
    disabled: false,
    maxChips: null,
    vertical: false,
    reorderable: false,
  },
)

const model = defineModel<string[]>({ default: () => [] })
const emit = defineEmits<{
  change: [
    detail: {
      type: 'add' | 'remove' | 'edit' | 'reorder'
      value: string
      oldValue?: string
      fromIndex?: number
      toIndex?: number
    },
  ]
}>()
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const draft = ref('')
const editing = ref<string | null>(null)
const pendingRemoval = ref<string | null>(null)
const focused = ref(false)
const draggingValue = ref<string | null>(null)

const values = computed(() => model.value ?? [])
const displayValues = computed(() => values.value.filter((value) => value !== editing.value))
const visibleValues = computed(() =>
  focused.value || props.maxChips == null
    ? displayValues.value
    : displayValues.value.slice(0, Math.max(0, props.maxChips)),
)
const overflow = computed(() => displayValues.value.length - visibleValues.value.length)

function changeValues(
  next: string[],
  detail: {
    type: 'add' | 'remove' | 'edit' | 'reorder'
    value: string
    oldValue?: string
    fromIndex?: number
    toIndex?: number
  },
): void {
  model.value = next
  emit('change', detail)
}

function reorder(value: string, targetValue: string): void {
  const fromIndex = values.value.indexOf(value)
  const toIndex = values.value.indexOf(targetValue)
  if (props.disabled || !props.reorderable || fromIndex < 0 || toIndex < 0 || fromIndex === toIndex)
    return
  const next = [...values.value]
  next.splice(fromIndex, 1)
  next.splice(toIndex, 0, value)
  changeValues(next, { type: 'reorder', value, fromIndex, toIndex })
}

function onChipDragStart(event: DragEvent, value: string): void {
  if (!props.reorderable || props.disabled || !event.dataTransfer) {
    event.preventDefault()
    return
  }
  draggingValue.value = value
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', value)
}

function onChipDrop(event: DragEvent, targetValue: string): void {
  event.preventDefault()
  const sourceValue = draggingValue.value ?? event.dataTransfer?.getData('text/plain')
  if (sourceValue) reorder(sourceValue, targetValue)
  draggingValue.value = null
}

function onChipKeydown(event: KeyboardEvent, value: string): void {
  if (!props.reorderable || props.disabled || !event.altKey) return
  const rtl = root.value && getComputedStyle(root.value).direction === 'rtl'
  const backward = props.vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  const forward = props.vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  if (event.key !== backward && event.key !== forward) return
  const fromIndex = values.value.indexOf(value)
  const toIndex = fromIndex + (event.key === forward ? 1 : -1)
  if (toIndex < 0 || toIndex >= values.value.length) return
  event.preventDefault()
  reorder(value, values.value[toIndex]!)
}

function commit(): void {
  if (props.disabled) return
  const value = draft.value.trim()
  if (!value) return
  const original = editing.value
  if (original !== null) {
    if (value !== original && !values.value.includes(value)) {
      changeValues(
        values.value.map((item) => (item === original ? value : item)),
        { type: 'edit', value, oldValue: original },
      )
    }
  } else if (!values.value.includes(value)) {
    changeValues([...values.value, value], { type: 'add', value })
  }
  draft.value = ''
  editing.value = null
  pendingRemoval.value = null
}

function remove(value: string): void {
  if (props.disabled || !values.value.includes(value)) return
  changeValues(
    values.value.filter((item) => item !== value),
    { type: 'remove', value },
  )
  if (editing.value === value) editing.value = null
  pendingRemoval.value = null
  nextTick(() => input.value?.focus())
}

function edit(value: string): void {
  if (props.disabled) return
  editing.value = value
  draft.value = value
  pendingRemoval.value = null
  nextTick(() => {
    input.value?.focus()
    input.value?.select()
  })
}

function onInputKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  if (event.key === 'Enter') {
    event.preventDefault()
    commit()
  } else if (event.key === 'Escape' && editing.value !== null) {
    event.preventDefault()
    editing.value = null
    draft.value = ''
  } else if (event.key === 'Backspace' && draft.value === '' && editing.value === null) {
    const last = values.value.at(-1)
    if (!last) return
    event.preventDefault()
    if (pendingRemoval.value === last) remove(last)
    else pendingRemoval.value = last
  } else if (event.key !== 'Shift' && event.key !== 'Tab') {
    pendingRemoval.value = null
  }
}

function onSetKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented || props.disabled || !root.value) return
  const rtl = getComputedStyle(root.value).direction === 'rtl'
  const back = props.vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  const forward = props.vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  if (event.key !== back && event.key !== forward) return
  if (event.target === input.value) {
    if (event.key !== back) return
    const field = input.value
    if (!field) return
    if (field.value && (field.selectionStart !== 0 || field.selectionEnd !== 0)) return
  }
  const targets = [
    ...root.value.querySelectorAll<HTMLElement>(
      '.yam3x-input-chip button:not(:disabled), .yam3x-input-chip-set__input:not(:disabled)',
    ),
  ]
  const index = targets.indexOf(event.target as HTMLElement)
  if (index < 0 || targets.length < 2) return
  const next = targets[(index + (event.key === forward ? 1 : -1) + targets.length) % targets.length]
  event.preventDefault()
  next?.focus()
}

function onFocusOut(event: FocusEvent): void {
  if (root.value?.contains(event.relatedTarget as Node | null)) return
  focused.value = false
  pendingRemoval.value = null
}
</script>

<template>
  <div
    ref="root"
    class="yam3x-input-chip-set"
    :class="{ 'yam3x-input-chip-set--vertical': vertical }"
    role="group"
    :aria-label="label"
    :aria-disabled="disabled ? 'true' : undefined"
    @focusin="focused = true"
    @focusout="onFocusOut"
    @keydown="onSetKeydown"
  >
    <InputChip
      v-for="value in visibleValues"
      :key="value"
      :label="value"
      :value="value"
      :disabled="disabled"
      :selected="pendingRemoval === value"
      :draggable="reorderable && !disabled"
      :data-reordering="draggingValue === value || undefined"
      @dragstart="onChipDragStart($event, value)"
      @dragover.prevent
      @drop="onChipDrop($event, value)"
      @dragend="draggingValue = null"
      @keydown="onChipKeydown($event, value)"
      @click.prevent="edit(value)"
      @remove="remove"
    >
      <template
        v-if="$slots.avatar"
        #avatar
        ><slot
          name="avatar"
          :value="value"
      /></template>
      <template
        v-else-if="$slots.icon"
        #icon
        ><slot
          name="icon"
          :value="value"
      /></template>
    </InputChip>
    <span
      v-if="overflow > 0"
      class="yam3x-input-chip-set__overflow"
      :aria-label="`${overflow} more values`"
      >+{{ overflow }}</span
    >
    <input
      ref="input"
      v-model="draft"
      class="yam3x-input-chip-set__input"
      type="text"
      :aria-label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="pendingRemoval = null"
      @keydown="onInputKeydown"
    />
    <template v-if="name">
      <input
        v-for="value in values"
        :key="value"
        type="hidden"
        :name="name"
        :value="value"
        :form="form"
        :disabled="disabled"
      />
    </template>
  </div>
</template>

<style scoped>
.yam3x-input-chip-set {
  --_yam3x-input-chip-set-gap: max(
    8px,
    var(--md-sys-spacing-8, calc(8px * var(--md-sys-density-spacing-scale, 1)))
  );
  --_yam3x-input-chip-set-padding: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-input-chip-set-outline: var(--md-sys-color-outline-variant);
  --_yam3x-input-chip-set-shape: var(--md-sys-shape-corner-small);
  --_yam3x-input-chip-set-container: var(--md-sys-color-surface);
  --_yam3x-input-chip-set-focus-outline: var(--md-sys-color-primary);
  --_yam3x-input-chip-set-label: var(--md-sys-color-on-surface);
  --_yam3x-input-chip-set-secondary-label: var(--md-sys-color-on-surface-variant);
  display: inline-flex;
  max-width: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--_yam3x-input-chip-set-gap);
  padding: 0 var(--_yam3x-input-chip-set-padding);
  border: 1px solid var(--_yam3x-input-chip-set-outline);
  border-radius: var(--_yam3x-input-chip-set-shape);
  background: var(--_yam3x-input-chip-set-container);
}
.yam3x-input-chip-set:focus-within {
  border-color: var(--_yam3x-input-chip-set-focus-outline);
}
.yam3x-input-chip-set--vertical {
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
}
.yam3x-input-chip-set :deep(.yam3x-input-chip[draggable='true']) {
  cursor: grab;
}
.yam3x-input-chip-set :deep(.yam3x-input-chip[data-reordering]) {
  opacity: 0.55;
}
.yam3x-input-chip-set__input {
  min-width: 96px;
  min-height: 48px;
  flex: 1 1 96px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--_yam3x-input-chip-set-label);
  font: inherit;
}
.yam3x-input-chip-set__overflow {
  color: var(--_yam3x-input-chip-set-secondary-label);
  font-size: 14px;
}
@media (forced-colors: active) {
  .yam3x-input-chip-set {
    border-color: CanvasText;
  }
  .yam3x-input-chip-set:focus-within {
    outline: 2px solid Highlight;
  }
}
</style>
