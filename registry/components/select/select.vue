<script setup lang="ts">
import { useVirtualList, type VirtualListOptions } from '../_shared/use-virtual-list'
import { useComponentLocale } from '../localization/context'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  useAttrs,
  useId,
  watch,
} from 'vue'
import { selectOptionContextKey, type SelectOptionRecord } from '../_shared/select-option.context'
import type {
  OptionSelectionDetail,
  OptionSelectionSource,
  OptionToggleDetail,
} from '../option/option.types'
import type { SelectOption, SelectFilter } from './select.types'
import Option from '../option/option.vue'
import OptionPanel from '../option/option-panel.vue'
import Icon from '../icon/icon.vue'
import InputChip from '../chips/input-chip.vue'
import IconButton from '../icon-button/icon-button.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options?: readonly SelectOption[]
    virtual?: boolean | VirtualListOptions
    searchable?: boolean
    filter?: SelectFilter
    locale?: string
    id?: string
    name?: string
    form?: string
    required?: boolean
    disabled?: boolean
    multiple?: boolean
    selectionDisplay?: 'text' | 'chips'
    hideSelectionIndicator?: boolean
    panelClass?: string
    fitAnchorWidth?: boolean
    anchorOffset?: number
    closeOnTab?: boolean
  }>(),
  {
    options: undefined,
    virtual: false,
    searchable: false,
    filter: 'contains',
    id: undefined,
    name: undefined,
    form: undefined,
    required: false,
    disabled: false,
    multiple: false,
    selectionDisplay: 'text',
    hideSelectionIndicator: false,
    panelClass: '',
    fitAnchorWidth: true,
    anchorOffset: 4,
    closeOnTab: true,
  },
)

const modelValue = defineModel<string | string[] | null>({ default: null })
const open = defineModel<boolean>('open', { default: false })
const query = defineModel<string>('query', { default: '' })
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [detail: OptionSelectionDetail]
  change: [detail: OptionSelectionDetail]
  invalid: [event: Event]
  beforetoggle: [event: CustomEvent<OptionToggleDetail>]
  toggle: [detail: OptionToggleDetail]
  open: []
  close: []
}>()
defineSlots<{
  default?(scope: {
    values: readonly string[]
    selected(value: string): boolean
    select(value: string, source?: OptionSelectionSource): void
  }): unknown
  value?(scope: {
    value: string | string[] | null
    options: readonly SelectOptionRecord[]
  }): unknown
  option?(scope: { option: SelectOption; selected: boolean; active: boolean }): unknown
  arrow?(): unknown
  'no-data'?(): unknown
}>()
const { messages } = useComponentLocale(
  'select',
  () => props.locale,
  () => undefined,
)
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)
const attrs = useAttrs()
const uid = useId().replace(/:/g, '')
const controlId = computed(() => props.id || `yam3x-select-${uid}`)
const listboxId = `yam3x-select-listbox-${uid}`
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | HTMLInputElement | null>(null)
const chipDisplay = computed(() => props.multiple && props.selectionDisplay === 'chips')
const chipContainer = ref<HTMLElement | null>(null)
const nativeSelect = ref<HTMLSelectElement | null>(null)
const panel = ref<{
  show: () => void
  hide: () => void
  toggle: () => void
  panel: HTMLElement | null
} | null>(null)
const mountedOptions = shallowRef<SelectOptionRecord[]>([])
const options = computed<SelectOptionRecord[]>(() => {
  if (props.options === undefined) return mountedOptions.value
  const mounted = new Map(mountedOptions.value.map((option) => [option.value, option]))
  return props.options.map((option, index) => ({
    ...option,
    disabled: option.disabled ?? false,
    selected: option.selected ?? false,
    id: `${listboxId}-option-${index}`,
    element: mounted.get(option.value)?.element ?? null,
  }))
})
function matchesOption(option: SelectOption) {
  if (!props.searchable || !query.value || props.filter === 'none') return true
  if (typeof props.filter === 'function') return props.filter(option, query.value)
  const label = option.label.toLocaleLowerCase()
  const term = query.value.toLocaleLowerCase()
  if (props.filter === 'starts-with') return label.startsWith(term)
  if (props.filter === 'ends-with') return label.endsWith(term)
  return label.includes(term)
}
const visibleOptions = computed(() => options.value.filter(matchesOption))
const searchText = computed(() =>
  open.value
    ? query.value
    : props.multiple
      ? chipDisplay.value
        ? ''
        : displayValue.value
      : displayValue.value,
)
let composing = false
let dispatchingNativeInput = false
const activeValue = ref<string | null>(null)
const dataRecords = computed(() =>
  (props.options ?? []).map((option, index) => ({ option, index })),
)
const filteredDataRecords = computed(() =>
  dataRecords.value.filter((record) => matchesOption(record.option)),
)
watch(
  () => [props.virtual, props.options] as const,
  ([virtual, options]) => {
    if (virtual && options === undefined)
      throw new Error('Select virtualization requires a data-driven options catalog.')
  },
  { immediate: true },
)
const virtualEnabled = computed(() => Boolean(props.virtual))
const windowed = useVirtualList({
  keys: () => filteredDataRecords.value.map((record) => record.option.value),
  scroller: () => panel.value?.panel,
  enabled: () => virtualEnabled.value,
  options: () => (typeof props.virtual === 'object' ? props.virtual : undefined),
  keepMounted: () => activeValue.value,
})
const filteredPositions = computed(
  () => new Map(filteredDataRecords.value.map((record, index) => [record.option.value, index])),
)
const renderedDataRecords = computed(() =>
  virtualEnabled.value
    ? windowed.items.value.map((item) => ({
        ...filteredDataRecords.value[item.index]!,
        position: item.index,
        offset: item.offset,
      }))
    : dataRecords.value.map((record) => ({
        ...record,
        position: filteredPositions.value.get(record.option.value) ?? -1,
        offset: 0,
      })),
)
const invalid = ref(false)
const values = computed<readonly string[]>(() => {
  const value = modelValue.value
  if (Array.isArray(value)) return value
  return value == null || value === '' ? [] : [value]
})
const optionMap = computed(() => new Map(options.value.map((option) => [option.value, option])))
const selectedValues = computed(() => new Set(values.value))
const selectedOptions = computed(() =>
  values.value
    .map((value) => optionMap.value.get(value))
    .filter((option): option is SelectOptionRecord => Boolean(option)),
)
const displayValue = computed(() =>
  values.value.map((value) => optionMap.value.get(value)?.label ?? value).join(', '),
)
const nativeOptions = computed(() => [
  ...(virtualEnabled.value
    ? options.value.filter((option) => selectedValues.value.has(option.value))
    : options.value),
  ...values.value
    .filter((value) => !optionMap.value.has(value))
    .map((value) => ({ value, label: value, disabled: false })),
])
const activeOption = computed(() =>
  visibleOptions.value.find((option) => option.value === activeValue.value && !option.disabled),
)
const labelledby = ref('')
const typeahead = ref('')
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
let focusFrame = 0
let initialValue: string | string[] | null = null
let associatedForm: HTMLFormElement | null = null
let restoreFocusAfterClose = false

function selectedValuesForMode(next: readonly string[]): string | string[] | null {
  return props.multiple ? [...next] : (next[0] ?? null)
}
function selected(value: string) {
  return selectedValues.value.has(value)
}
function sortOptions(records: SelectOptionRecord[]) {
  return records.sort((a, b) => {
    if (!a.element || !b.element || a.element === b.element) return 0
    const relation = a.element.compareDocumentPosition(b.element)
    return relation & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : relation & Node.DOCUMENT_POSITION_PRECEDING
        ? 1
        : 0
  })
}
function register(option: SelectOptionRecord) {
  if (virtualEnabled.value) windowed.measure(option.value, option.element)
  mountedOptions.value = sortOptions([
    ...mountedOptions.value.filter((item) => item.value !== option.value),
    option,
  ])
  if (props.options === undefined && option.selected && !values.value.length) {
    modelValue.value = selectedValuesForMode([option.value])
  } else if (
    props.options === undefined &&
    props.multiple &&
    option.selected &&
    !values.value.includes(option.value)
  ) {
    modelValue.value = selectedValuesForMode([...values.value, option.value])
  }
  return () => {
    if (mountedOptions.value.includes(option)) windowed.measure(option.value, null)
    mountedOptions.value = mountedOptions.value.filter((item) => item !== option)
  }
}
function setActive(value: string | null, scrollIntoView = true) {
  activeValue.value = value
  if (virtualEnabled.value && value !== null && scrollIntoView) windowed.scrollToKey(value)
  const option = options.value.find((item) => item.value === value)
  if (scrollIntoView && option?.element && panel.value) {
    option.element.scrollIntoView({ block: 'nearest' })
  }
}
function focusActiveOption() {
  const option = activeOption.value
  if (option?.element) option.element.focus({ preventScroll: true })
  else panel.value?.panel?.focus({ preventScroll: true })
}
function scheduleFocusUpdate() {
  cancelAnimationFrame(focusFrame)
  focusFrame = requestAnimationFrame(() => {
    focusFrame = 0
    if (open.value) activeOption.value?.element?.scrollIntoView({ block: 'nearest' })
    if (open.value && props.searchable) trigger.value?.focus({ preventScroll: true })
    else if (open.value && props.multiple) focusActiveOption()
    else if (!open.value && restoreFocusAfterClose) {
      restoreFocusAfterClose = false
      trigger.value?.focus({ preventScroll: true })
    }
  })
}
function firstEnabled(fromEnd = false) {
  const enabled = visibleOptions.value.filter((option) => !option.disabled)
  return fromEnd ? enabled.at(-1) : enabled[0]
}
function activeOrSelected() {
  return (
    visibleOptions.value.find(
      (option) => values.value.includes(option.value) && !option.disabled,
    ) ?? firstEnabled()
  )
}
function requestOpen(
  next: boolean,
  source: OptionToggleDetail['source'] | 'trigger' | 'keyboard' = 'programmatic',
) {
  if (props.disabled || open.value === next) return
  restoreFocusAfterClose = !next && props.multiple && source !== 'trigger'
  const event = new CustomEvent<OptionToggleDetail>('beforetoggle', {
    bubbles: true,
    cancelable: true,
    detail: {
      open: next,
      source: source === 'trigger' || source === 'keyboard' ? 'programmatic' : source,
    },
  })
  emit('beforetoggle', event)
  if (event.defaultPrevented) {
    restoreFocusAfterClose = false
    return
  }
  open.value = next
  if (next) {
    setActive(
      source === 'keyboard'
        ? (activeOrSelected()?.value ?? null)
        : (activeOrSelected()?.value ?? null),
    )
    void nextTick(() => {
      labelledby.value =
        trigger.value?.getAttribute('aria-labelledby') ||
        (typeof attrs['aria-labelledby'] === 'string' ? attrs['aria-labelledby'] : '')
    })
  } else {
    setActive(null)
  }
  scheduleFocusUpdate()
  const detail: OptionToggleDetail = {
    open: next,
    source: source === 'trigger' || source === 'keyboard' ? 'programmatic' : source,
  }
  emit('toggle', detail)
  if (next) emit('open')
  else emit('close')
}
function onPanelBeforeToggle(event: CustomEvent<OptionToggleDetail>) {
  emit('beforetoggle', event)
}
function onPanelToggle(detail: OptionToggleDetail) {
  if (open.value !== detail.open) open.value = detail.open
  if (detail.open) {
    restoreFocusAfterClose = false
    setActive(activeOrSelected()?.value ?? null)
  } else {
    restoreFocusAfterClose = props.multiple && detail.source !== 'outside'
    setActive(null)
  }
  scheduleFocusUpdate()
  emit('toggle', detail)
  if (detail.open) emit('open')
  else emit('close')
}
function dispatchNativeInput(type: 'input' | 'change') {
  dispatchingNativeInput = true
  try {
    trigger.value?.dispatchEvent(new Event(type, { bubbles: true }))
  } finally {
    dispatchingNativeInput = false
  }
}
function selectValue(value: string, source: OptionSelectionSource = 'pointer') {
  const option = options.value.find((item) => item.value === value)
  if (!option || option.disabled || props.disabled) return
  if (props.multiple && source !== 'programmatic') setActive(value, false)
  const current = [...values.value]
  const next = props.multiple
    ? current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    : current[0] === value
      ? current
      : [value]
  if (next.length === current.length && next.every((item, index) => item === current[index])) {
    if (!props.multiple) requestOpen(false, 'programmatic')
    return
  }
  if (!commitSelection(next, value, source)) return
  if (!props.multiple) requestOpen(false, 'programmatic')
  else if (props.searchable) trigger.value?.focus({ preventScroll: true })
  else if (source === 'pointer' && open.value) option.element?.focus({ preventScroll: true })
}
function commitSelection(next: readonly string[], value: string, source: OptionSelectionSource) {
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  emit('beforeinput', before)
  trigger.value?.dispatchEvent(before)
  if (before.defaultPrevented) return false
  modelValue.value = selectedValuesForMode(next)
  if (props.searchable) query.value = ''
  invalid.value = false
  trigger.value?.removeAttribute('aria-invalid')
  const detail: OptionSelectionDetail = { value, source }
  emit('input', detail)
  emit('change', detail)
  dispatchNativeInput('input')
  dispatchNativeInput('change')
  return true
}
function openFromChip(value: string, event: MouseEvent) {
  event.preventDefault()
  if (props.disabled) return
  if (props.searchable) query.value = ''
  requestOpen(true, 'trigger')
  if (open.value) {
    const option = optionMap.value.get(value)
    if (option && !option.disabled) setActive(value)
    scheduleFocusUpdate()
  }
}
async function removeChip(value: string, event: MouseEvent | KeyboardEvent) {
  if (props.disabled || !props.multiple || !values.value.includes(value)) return
  if (optionMap.value.get(value)?.disabled) return
  const index = values.value.indexOf(value)
  const next = values.value.filter((item) => item !== value)
  const source = event instanceof KeyboardEvent || event.detail === 0 ? 'keyboard' : 'pointer'
  if (!commitSelection(next, value, source)) return
  await nextTick()
  if (values.value.includes(value)) return
  const chips = Array.from(chipContainer.value?.querySelectorAll<HTMLElement>('[data-value]') ?? [])
  const candidates = [...values.value.slice(index), ...values.value.slice(0, index).reverse()]
  const action = candidates
    .map((candidate) =>
      chips
        .find((element) => element.dataset.value === candidate)
        ?.querySelector<HTMLButtonElement>('button:not(:disabled)'),
    )
    .find(Boolean)
  const focusTarget = action ?? trigger.value
  focusTarget?.focus({ preventScroll: true })
}

function updateActiveBy(delta: number) {
  const enabled = visibleOptions.value.filter((option) => !option.disabled)
  if (!enabled.length) return
  const currentIndex = enabled.findIndex((option) => option.value === activeValue.value)
  const nextIndex =
    currentIndex < 0
      ? delta < 0
        ? enabled.length - 1
        : 0
      : (currentIndex + delta + enabled.length) % enabled.length
  setActive(enabled[nextIndex]?.value ?? null)
}
function moveToEdge(end: boolean) {
  setActive(firstEnabled(end)?.value ?? null)
}
function findTypeaheadMatch(character: string) {
  const query = `${typeahead.value}${character}`.toLocaleLowerCase()
  typeahead.value = query
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => {
    typeahead.value = ''
  }, 700)
  const enabled = visibleOptions.value.filter((option) => !option.disabled)
  const current = enabled.findIndex((option) => option.value === activeValue.value)
  const rotated = [...enabled.slice(current + 1), ...enabled.slice(0, current + 1)]
  const match = rotated.find((option) => option.label.toLocaleLowerCase().startsWith(query))
  if (match) setActive(match.value)
}
function onSearchInput(event: Event) {
  if (dispatchingNativeInput || composing || props.disabled) return
  query.value = (event.target as HTMLInputElement).value
  requestOpen(true, 'keyboard')
  setActive(firstEnabled()?.value ?? null)
}
function onCompositionEnd(event: CompositionEvent) {
  composing = false
  onSearchInput(event)
}
function onSearchKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || composing || props.disabled) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    if (!open.value) {
      requestOpen(true, 'keyboard')
      if (!values.value.length && event.key === 'ArrowUp') moveToEdge(true)
    } else updateActiveBy(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'Enter' && open.value) {
    event.preventDefault()
    if (activeOption.value) selectValue(activeOption.value.value, 'keyboard')
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    requestOpen(false, 'keyboard')
  } else if (event.key === 'Tab' && props.closeOnTab && open.value) {
    requestOpen(false, 'keyboard')
    restoreFocusAfterClose = false
  }
}
function onSearchBlur(event: FocusEvent) {
  if (!props.closeOnTab) return
  const target = event.relatedTarget as Node | null
  if (target && (root.value?.contains(target) || panel.value?.panel?.contains(target))) return
  requestOpen(false, 'outside')
  restoreFocusAfterClose = false
}
function toggleSearch() {
  requestOpen(!open.value, 'trigger')
  trigger.value?.focus({ preventScroll: true })
}
function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || props.disabled) return
  if (event.key === 'Tab') {
    if (props.closeOnTab && open.value) requestOpen(false)
    return
  }
  if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      requestOpen(false)
    }
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!open.value) requestOpen(true, 'keyboard')
    else updateActiveBy(1)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      requestOpen(true, 'keyboard')
      if (!values.value.length) moveToEdge(true)
    } else updateActiveBy(-1)
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    if (!open.value) requestOpen(true, 'keyboard')
    moveToEdge(event.key === 'End')
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!open.value) requestOpen(true, 'keyboard')
    else if (activeOption.value) selectValue(activeOption.value.value, 'keyboard')
    return
  }
  if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    if (!open.value) requestOpen(true, 'keyboard')
    findTypeaheadMatch(event.key)
  }
}
function onMultiListKeydown(event: KeyboardEvent) {
  if (!props.multiple || !open.value || event.defaultPrevented || event.isComposing) return
  if (event.key === 'Escape') {
    event.preventDefault()
    requestOpen(false, 'keyboard')
    return
  }
  if (event.key === 'Tab') {
    if (props.closeOnTab) {
      requestOpen(false, 'keyboard')
      restoreFocusAfterClose = false
      trigger.value?.focus({ preventScroll: true })
    }
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    updateActiveBy(event.key === 'ArrowDown' ? 1 : -1)
    void nextTick(focusActiveOption)
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    moveToEdge(event.key === 'End')
    void nextTick(focusActiveOption)
    return
  }
  if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    findTypeaheadMatch(event.key)
    void nextTick(focusActiveOption)
  }
}
function onPointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const target = (event.target as Element | null)?.closest<HTMLElement>(
    '[role="option"][data-value]',
  )
  if (target && !target.getAttribute('aria-disabled'))
    setActive(target.dataset.value ?? null, false)
}
function onInvalid(event: Event) {
  const shouldFocus = !event.defaultPrevented
  event.preventDefault()
  invalid.value = true
  trigger.value?.setAttribute('aria-invalid', 'true')
  const forwarded = new Event('invalid', { cancelable: true })
  trigger.value?.dispatchEvent(forwarded)
  emit('invalid', event)
  if (shouldFocus) trigger.value?.focus()
}
function onFormReset() {
  queueMicrotask(() => {
    query.value = ''
    modelValue.value = Array.isArray(initialValue) ? [...initialValue] : initialValue
    invalid.value = false
    trigger.value?.removeAttribute('aria-invalid')
  })
}
function attachFormResetListener() {
  const nextForm = nativeSelect.value?.form ?? null
  if (associatedForm === nextForm) return
  associatedForm?.removeEventListener('reset', onFormReset)
  associatedForm = nextForm
  associatedForm?.addEventListener('reset', onFormReset)
}
watch(
  () => [props.form, props.name, props.required, props.disabled],
  () => nextTick(attachFormResetListener),
)
watch(
  open,
  (value) => {
    if (!value && props.searchable) query.value = ''
    scheduleFocusUpdate()
  },
  { flush: 'post' },
)
watch(query, (value) => {
  if (value && props.searchable && open.value)
    void nextTick(() => setActive(firstEnabled()?.value ?? null))
})
watch(virtualEnabled, (enabled) => {
  if (enabled)
    void nextTick(() => {
      for (const option of mountedOptions.value) windowed.measure(option.value, option.element)
      if (activeValue.value !== null) windowed.scrollToKey(activeValue.value)
    })
})
watch(
  visibleOptions,
  (current) => {
    if (
      activeValue.value &&
      !current.some((option) => option.value === activeValue.value && !option.disabled)
    ) {
      setActive(activeOrSelected()?.value ?? null)
    }
  },
  { deep: true },
)
watch(values, (current) => {
  if (current.length && !props.multiple && Array.isArray(modelValue.value))
    modelValue.value = current[0] ?? null
  if (invalid.value && current.length) {
    invalid.value = false
    trigger.value?.removeAttribute('aria-invalid')
  }
})
watch(
  () => props.multiple,
  (multiple) => {
    if (!multiple && Array.isArray(modelValue.value)) modelValue.value = modelValue.value[0] ?? null
    if (multiple && !Array.isArray(modelValue.value))
      modelValue.value = modelValue.value == null ? [] : [modelValue.value]
  },
)
onMounted(() => {
  if (props.options !== undefined) {
    const defaults = options.value
      .filter((option) => option.selected && !option.disabled)
      .map((option) => option.value)
    if (props.multiple && defaults.length)
      modelValue.value = [...new Set([...values.value, ...defaults])]
    else if (!values.value.length && defaults.length) modelValue.value = defaults[0]!
  }
  initialValue = Array.isArray(modelValue.value) ? [...modelValue.value] : modelValue.value
  if (!values.value.length) {
    const initiallySelected = options.value.find((option) => option.selected && !option.disabled)
    if (initiallySelected) modelValue.value = selectedValuesForMode([initiallySelected.value])
  }
  attachFormResetListener()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(focusFrame)
  associatedForm?.removeEventListener('reset', onFormReset)
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

provide(selectOptionContextKey, {
  values,
  activeValue,
  isVisible: matchesOption,
  isSelected: selected,
  select: selectValue,
  register,
})
defineExpose({ open, close: () => requestOpen(false), show: () => requestOpen(true), trigger })
</script>

<template>
  <div
    ref="root"
    class="yam3x-select"
    :class="{
      'yam3x-select--chips': chipDisplay,
      'yam3x-select--searchable': searchable,
      'yam3x-select--open': open,
      'yam3x-select--disabled': disabled,
    }"
  >
    <div
      v-if="chipDisplay && values.length"
      ref="chipContainer"
      class="yam3x-select__chips"
    >
      <InputChip
        v-for="value in values"
        :key="value"
        :value="value"
        :label="optionMap.get(value)?.label ?? value"
        :locale="props.locale"
        :disabled="disabled || optionMap.get(value)?.disabled"
        @click="openFromChip(value, $event)"
        @remove="removeChip"
      />
    </div>
    <input
      v-if="searchable"
      :id="controlId"
      ref="trigger"
      v-bind="attrs"
      class="yam3x-select__search"
      :data-form-field-control="controlId"
      type="text"
      role="combobox"
      autocomplete="off"
      :form="form"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? listboxId : undefined"
      :aria-activedescendant="open ? activeOption?.id : undefined"
      :aria-description="multiple && displayValue ? displayValue : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
      :disabled="disabled"
      :value="searchText"
      @click="requestOpen(true, 'trigger')"
      @input="onSearchInput"
      @keydown="onSearchKeydown"
      @compositionstart="composing = true"
      @compositionend="onCompositionEnd"
      @blur="onSearchBlur"
    />
    <button
      v-else
      :id="controlId"
      ref="trigger"
      v-bind="attrs"
      class="yam3x-select__trigger"
      :data-form-field-control="controlId"
      type="button"
      :role="multiple ? undefined : 'combobox'"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? listboxId : undefined"
      :aria-activedescendant="!multiple && open ? activeOption?.id : undefined"
      :aria-valuetext="!multiple ? displayValue || undefined : undefined"
      :aria-description="multiple && displayValue ? displayValue : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
      :disabled="disabled"
      :required="required || undefined"
      :value="displayValue"
      @click="requestOpen(!open, 'trigger')"
      @keydown="onKeydown"
    >
      <span class="yam3x-select__value">
        <slot
          name="value"
          :value="modelValue"
          :options="selectedOptions"
          >{{ chipDisplay ? '' : displayValue }}</slot
        >
      </span>
      <span
        class="yam3x-select__arrow"
        aria-hidden="true"
      >
        <slot name="arrow"><Icon name="arrow_drop_down" /></slot>
      </span>
    </button>
    <span
      v-if="searchable"
      class="yam3x-select__toggle"
    >
      <IconButton
        variant="standard"
        tabindex="-1"
        :aria-label="actionMessages.options"
        aria-haspopup="listbox"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="open ? listboxId : undefined"
        :disabled="disabled"
        @mousedown.prevent
        @click="toggleSearch"
        ><span
          class="yam3x-select__arrow"
          aria-hidden="true"
          ><slot name="arrow"><Icon name="arrow_drop_down" /></slot></span
      ></IconButton>
    </span>
    <select
      ref="nativeSelect"
      :data-form-field-focus="controlId"
      class="yam3x-select__native"
      :name="name"
      :form="form"
      :required="required"
      :disabled="disabled"
      :multiple="multiple"
      tabindex="-1"
      aria-hidden="true"
      @invalid="onInvalid"
    >
      <option
        v-if="!multiple"
        value=""
        disabled
        :selected="values.length === 0"
      ></option>
      <option
        v-for="option in nativeOptions"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
        :selected="selected(option.value)"
      >
        {{ option.label }}
      </option>
    </select>
    <OptionPanel
      :id="listboxId"
      ref="panel"
      v-model:open="open"
      :anchor="chipDisplay || searchable ? root : trigger"
      :locale="props.locale"
      :label="typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined"
      :labelledby="labelledby || undefined"
      :multiple="multiple"
      teleport
      :fit-anchor-width="fitAnchorWidth"
      :anchor-offset="anchorOffset"
      :panel-class="panelClass"
      :empty="false"
      :style="{
        '--yam3x-option-panel-container-max-width': 'var(--_yam3x-select-panel-max-width)',
      }"
      @beforetoggle="onPanelBeforeToggle"
      @toggle="onPanelToggle"
    >
      <div
        class="yam3x-select__options"
        :class="{
          'yam3x-select__options--searchable': searchable,
          'yam3x-select__options--virtual': virtualEnabled,
        }"
        :style="
          virtualEnabled && filteredDataRecords.length
            ? { blockSize: `${windowed.totalSize.value}px` }
            : undefined
        "
        @pointerdown="searchable && $event.preventDefault()"
        @pointermove="onPointerMove"
        @keydown="onMultiListKeydown"
      >
        <template v-if="props.options !== undefined">
          <Option
            v-for="{ option, index, position, offset } in renderedDataRecords"
            :id="`${listboxId}-option-${index}`"
            :key="option.value"
            :aria-setsize="virtualEnabled ? filteredDataRecords.length : undefined"
            :aria-posinset="virtualEnabled ? position + 1 : undefined"
            :first="position === 0"
            :last="position === filteredDataRecords.length - 1"
            :style="
              virtualEnabled
                ? { position: 'absolute', insetInline: '0', top: `${offset}px` }
                : undefined
            "
            :value="option.value"
            :label="option.label"
            :disabled="option.disabled"
            :selected="option.selected"
            :tabindex="multiple && !searchable && activeValue === option.value ? 0 : -1"
            :term="searchable ? query : ''"
            :hide-selection-indicator="hideSelectionIndicator"
          >
            <template
              v-if="$slots.option"
              #default
            >
              <slot
                name="option"
                :option="option"
                :selected="selected(option.value)"
                :active="activeValue === option.value"
              />
            </template>
          </Option>
        </template>
        <slot
          v-else
          :values="values"
          :selected="selected"
          :select="selectValue"
        />
        <div
          v-if="visibleOptions.length === 0"
          class="yam3x-option-panel__status"
          role="status"
        >
          <slot name="no-data">{{ messages.noData }}</slot>
        </div>
      </div>
    </OptionPanel>
  </div>
</template>

<style>
.yam3x-select {
  --_yam3x-select-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-select-container-shape: var(
    --yam3x-select-container-shape,
    var(--md-sys-shape-corner-extra-small, 4px)
  );
  --_yam3x-select-chip-gap: max(8px, calc(8px * var(--_yam3x-select-spacing-scale)));
  --_yam3x-select-trigger-gap: calc(12px * var(--_yam3x-select-spacing-scale));
  --_yam3x-select-focus-color: var(--md-sys-color-primary);
  --_yam3x-select-icon-size: var(--yam3x-select-icon-size, 24px);
  --_yam3x-select-open-color: var(--md-sys-color-primary);
  --_yam3x-select-panel-max-width: var(--yam3x-select-panel-max-width, 100vw);
  --_yam3x-select-disabled-color: var(
    --yam3x-select-disabled-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-select-disabled-color-opacity: var(--yam3x-select-disabled-color-opacity, 38%);
  position: relative;
  display: flex;
  flex: 1 1 auto;
  inline-size: 100%;
  min-inline-size: 0;
  border-radius: var(--_yam3x-select-container-shape);
  color: inherit;
  font-family: inherit;
}
.yam3x-select__trigger {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--_yam3x-select-trigger-gap);
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 24px;
  padding: 0;
  border: 0;
  border-radius: inherit;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.yam3x-select--chips {
  align-items: center;
  gap: var(--_yam3x-select-chip-gap);
  padding-block: var(--_yam3x-select-chip-gap);
}
.yam3x-select__chips {
  display: flex;
  flex: 1 1 0;
  flex-wrap: wrap;
  min-inline-size: 0;
  gap: var(--_yam3x-select-chip-gap);
}
.yam3x-select--chips .yam3x-select__chips > .yam3x-input-chip {
  margin-block: var(--_yam3x-select-chip-gap);
}
.yam3x-select.yam3x-select--chips .yam3x-select__trigger {
  flex: 0 0 auto;
  inline-size: auto;
  min-inline-size: 48px;
  min-block-size: 48px;
  margin-inline-start: auto;
}
.yam3x-select.yam3x-select--searchable {
  flex-wrap: wrap;
  align-items: center;
}
.yam3x-select.yam3x-select--searchable .yam3x-select__search {
  flex: 1 1 96px;
  inline-size: 0;
  min-inline-size: 48px;
  min-block-size: 48px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.yam3x-select--searchable .yam3x-select__chips {
  flex: 1 1 100%;
}
.yam3x-select__toggle {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: 48px;
  block-size: 48px;
}
.yam3x-select.yam3x-select--searchable
  .yam3x-select__search:focus-visible:not(.yam3x-form-field__control *) {
  outline: 2px solid var(--_yam3x-select-focus-color);
  outline-offset: -2px;
  border-radius: inherit;
}
.yam3x-select__options--searchable .yam3x-option-group:not(:has(.yam3x-option:not([hidden]))) {
  display: none;
}
.yam3x-select__trigger:disabled {
  cursor: default;
}
.yam3x-select__trigger:focus-visible {
  outline: 2px solid var(--_yam3x-select-focus-color);
  outline-offset: -2px;
  border-radius: inherit;
}
.yam3x-select__value {
  flex: 1 1 auto;
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.yam3x-select__arrow {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: var(--_yam3x-select-icon-size);
  block-size: var(--_yam3x-select-icon-size);
}
.yam3x-select__arrow svg {
  inline-size: 100%;
  block-size: 100%;
  fill: currentColor;
}
.yam3x-select__arrow .yam3x-icon {
  inline-size: 100%;
  block-size: 100%;
  font-size: var(--_yam3x-select-icon-size);
}
.yam3x-select__native {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.yam3x-select__options--virtual {
  position: relative;
  flex: none;
  overflow-anchor: none;
}
.yam3x-select__options {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.yam3x-select--open .yam3x-select__trigger:not(:disabled) {
  color: var(--_yam3x-select-open-color);
}
.yam3x-select--disabled {
  color: color-mix(
    in srgb,
    var(--_yam3x-select-disabled-color) var(--_yam3x-select-disabled-color-opacity),
    transparent
  );
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-select__trigger {
    transition: none !important;
  }
}
@media (forced-colors: active) {
  .yam3x-select__trigger:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-select__arrow {
    color: ButtonText;
  }
}
</style>
