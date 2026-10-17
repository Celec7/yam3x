<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  watch,
  useAttrs,
  useId,
} from 'vue'
import {
  listVariantKey,
  selectionListKey,
  type ListOptionRecord,
  type ListSelectionMode,
  type ListVariant,
} from './list.types'
import './list.css'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    mode?: ListSelectionMode
    variant?: ListVariant
    name?: string
    form?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
  }>(),
  {
    mode: 'single',
    variant: 'standard',
    name: undefined,
    form: undefined,
    required: false,
    disabled: false,
    invalid: false,
  },
)
const model = defineModel<string | string[] | null>({ default: null })
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [event: Event]
  change: [event: Event]
  invalid: [event: Event]
}>()
const attrs = useAttrs()
const id = useId()
const root = ref<HTMLUListElement | null>(null)
const validationInput = ref<HTMLInputElement | null>(null)
const validationFailed = ref(false)
const optionRevision = ref(0)
const records = new Map<HTMLLIElement, ListOptionRecord>()
const initialValue = Array.isArray(model.value) ? [...model.value] : model.value
const variant = computed<ListVariant>(() =>
  props.variant === 'segmented' ? 'segmented' : 'standard',
)
const mode = computed<ListSelectionMode>(() => (props.mode === 'multiple' ? 'multiple' : 'single'))
const selectedValues = computed(() => {
  if (mode.value === 'multiple')
    return Array.isArray(model.value) ? model.value : model.value == null ? [] : [model.value]
  return typeof model.value === 'string'
    ? [model.value]
    : Array.isArray(model.value)
      ? model.value.slice(0, 1)
      : []
})
const hasError = computed(() => props.invalid || validationFailed.value)
const proxyName = `yam3x-list-proxy-${id}`
const proxyType = computed(() => (mode.value === 'multiple' ? 'checkbox' : 'radio'))
const proxyChecked = computed(() => selectedValues.value.length > 0)
const internalActiveValue = ref<string | null>(null)

function orderedRecords(): ListOptionRecord[] {
  void optionRevision.value
  return [...records.values()].sort((a, b) => {
    const position = a.element.compareDocumentPosition(b.element)
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
    return 0
  })
}

const activeValue = computed(() => {
  const options = orderedRecords()
  const active = options.find(
    (option) => option.value === internalActiveValue.value && !option.disabled,
  )
  if (active) return active.value
  const selected = options.find(
    (option) => selectedValues.value.includes(option.value) && !option.disabled,
  )
  return selected?.value ?? options.find((option) => !option.disabled)?.value ?? null
})

function registerOption(record: ListOptionRecord): () => void {
  const duplicate = orderedRecords().find(
    (option) => option.value === record.value && option.element !== record.element,
  )
  if (duplicate)
    console.warn(`SelectionList option values must be unique. Duplicate value: "${record.value}".`)
  records.set(record.element, record)
  optionRevision.value++
  return () => {
    records.delete(record.element)
    optionRevision.value++
  }
}

function isOptionDisabled(value: string): boolean {
  return orderedRecords().find((record) => record.value === value)?.disabled ?? false
}

function dispatchSelectionEvent(type: 'input' | 'change'): void {
  const event = new Event(type, { bubbles: true })
  root.value?.dispatchEvent(event)
  if (type === 'input') emit('input', event)
  else emit('change', event)
}

function selectOption(value: string): void {
  if (props.disabled || isOptionDisabled(value)) return
  const current = selectedValues.value
  if (mode.value === 'single' && current[0] === value) return

  const next =
    mode.value === 'multiple'
      ? current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      : value
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  emit('beforeinput', before)
  const accepted = root.value?.dispatchEvent(before) ?? true
  if (!accepted || before.defaultPrevented) return

  validationFailed.value = false
  model.value = next
  internalActiveValue.value = value
  dispatchSelectionEvent('input')
  dispatchSelectionEvent('change')
}

function focusOption(value: string): void {
  const option = orderedRecords().find((record) => record.value === value)?.element
  if (!option || option.getAttribute('aria-disabled') === 'true') return
  internalActiveValue.value = value
  option.focus({ preventScroll: true })
}

function onKeydown(event: KeyboardEvent): void {
  const options = orderedRecords().filter((record) => !record.disabled && !props.disabled)
  if (!options.length) return
  const target =
    event.target instanceof Element
      ? event.target.closest<HTMLLIElement>('[data-yam3x-list-option]')
      : null
  const currentValue = target?.dataset.listValue ?? activeValue.value
  const currentIndex = options.findIndex((option) => option.value === currentValue)
  let nextIndex: number

  if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = options.length - 1
  else {
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1 + options.length) % options.length
    else if (event.key === 'ArrowUp')
      nextIndex = (currentIndex - 1 + options.length) % options.length
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (currentValue != null) selectOption(currentValue)
      return
    } else return
  }

  event.preventDefault()
  focusOption(options[nextIndex].value)
}

function onInvalid(event: Event): void {
  if (event.target !== validationInput.value) return
  event.preventDefault()
  validationFailed.value = true
  emit('invalid', event)
  nextTick(() => {
    const targetValue =
      activeValue.value ?? orderedRecords().find((option) => !option.disabled)?.value
    if (targetValue != null) focusOption(targetValue)
  })
}

function removeProxyValue(event: Event): void {
  ;(event as FormDataEvent).formData?.delete(proxyName)
}

function resetGroup(): void {
  queueMicrotask(() => {
    validationFailed.value = false
    model.value = Array.isArray(initialValue) ? [...initialValue] : initialValue
    internalActiveValue.value =
      typeof initialValue === 'string'
        ? initialValue
        : Array.isArray(initialValue)
          ? (initialValue[0] ?? null)
          : null
  })
}

let associatedForm: HTMLFormElement | null = null
function syncAssociatedForm(): void {
  const nextForm = props.form
    ? (document.getElementById(props.form) as HTMLFormElement | null)
    : (root.value?.closest('form') ?? null)
  if (associatedForm === nextForm) return
  associatedForm?.removeEventListener('reset', resetGroup)
  associatedForm?.removeEventListener('formdata', removeProxyValue)
  associatedForm = nextForm
  associatedForm?.addEventListener('reset', resetGroup)
  associatedForm?.addEventListener('formdata', removeProxyValue)
}

watch(mode, (nextMode) => {
  if (nextMode === 'multiple' && !Array.isArray(model.value))
    model.value = model.value == null ? [] : [model.value]
  if (nextMode === 'single' && Array.isArray(model.value)) model.value = model.value[0] ?? null
})
watch(() => props.form, syncAssociatedForm)
provide(listVariantKey, { variant })
provide(selectionListKey, {
  mode,
  selectedValues,
  activeValue,
  disabled: computed(() => props.disabled),
  invalid: hasError,
  name: computed(() => props.name),
  form: computed(() => props.form),
  optionChanged: () => {
    optionRevision.value++
  },
  registerOption,
  focusOption,
  selectOption,
  isSelected: (value) => selectedValues.value.includes(value),
  isOptionDisabled,
})
onMounted(syncAssociatedForm)
onMounted(() => {
  optionRevision.value++
})
onUpdated(syncAssociatedForm)
onBeforeUnmount(() => {
  associatedForm?.removeEventListener('reset', resetGroup)
  associatedForm?.removeEventListener('formdata', removeProxyValue)
})
</script>

<template>
  <div
    class="yam3x-selection-field"
    @invalid.capture="onInvalid"
  >
    <ul
      ref="root"
      v-bind="attrs"
      class="yam3x-list yam3x-selection-list"
      :class="`yam3x-list--${variant}`"
      :data-variant="variant"
      role="listbox"
      :aria-label="label"
      :aria-multiselectable="mode === 'multiple' ? 'true' : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      @keydown="onKeydown"
    >
      <slot />
    </ul>
    <input
      ref="validationInput"
      class="yam3x-list__form-proxy"
      :type="proxyType"
      :name="proxyName"
      :form="form"
      :checked="proxyChecked"
      :required="required"
      :disabled="disabled || !required"
      tabindex="-1"
      aria-hidden="true"
      data-yam3x-list-validation-input
    />
  </div>
</template>
