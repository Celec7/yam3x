<script setup lang="ts">
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
import type { SelectOption } from './select.types'
import Option from '../option/option.vue'
import OptionPanel from '../option/option-panel.vue'
import Icon from '../icon/icon.vue'
import InputChip from '../chips/input-chip.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options?: readonly SelectOption[]
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
const attrs = useAttrs()
const uid = useId().replace(/:/g, '')
const controlId = computed(() => props.id || `yam3x-select-${uid}`)
const listboxId = `yam3x-select-listbox-${uid}`
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
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
const activeValue = ref<string | null>(null)
const invalid = ref(false)
const values = computed<readonly string[]>(() => {
  const value = modelValue.value
  if (Array.isArray(value)) return value
  return value == null || value === '' ? [] : [value]
})
const selectedOptions = computed(() =>
  values.value
    .map((value) => options.value.find((option) => option.value === value))
    .filter((option): option is SelectOptionRecord => Boolean(option)),
)
const displayValue = computed(() =>
  values.value
    .map((value) => options.value.find((option) => option.value === value)?.label ?? value)
    .join(', '),
)
const nativeOptions = computed(() => [
  ...options.value,
  ...values.value
    .filter((value) => !options.value.some((option) => option.value === value))
    .map((value) => ({ value, label: value, disabled: false })),
])
const activeOption = computed(() =>
  options.value.find((option) => option.value === activeValue.value && !option.disabled),
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
  return values.value.includes(value)
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
  mountedOptions.value = sortOptions([
    ...mountedOptions.value.filter((item) => item.value !== option.value),
    option,
  ])
  if (option.selected && !values.value.length) {
    modelValue.value = selectedValuesForMode([option.value])
  } else if (props.multiple && option.selected && !values.value.includes(option.value)) {
    modelValue.value = selectedValuesForMode([...values.value, option.value])
  }
  return () => {
    mountedOptions.value = mountedOptions.value.filter((item) => item !== option)
  }
}
function setActive(value: string | null, scrollIntoView = true) {
  activeValue.value = value
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
    if (open.value && props.multiple) focusActiveOption()
    else if (!open.value && restoreFocusAfterClose) {
      restoreFocusAfterClose = false
      trigger.value?.focus({ preventScroll: true })
    }
  })
}
function firstEnabled(fromEnd = false) {
  const enabled = options.value.filter((option) => !option.disabled)
  return fromEnd ? enabled.at(-1) : enabled[0]
}
function activeOrSelected() {
  return (
    options.value.find((option) => values.value.includes(option.value) && !option.disabled) ??
    firstEnabled()
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
  trigger.value?.dispatchEvent(new Event(type, { bubbles: true }))
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
  else if (source === 'pointer' && open.value) option.element?.focus({ preventScroll: true })
}
function commitSelection(next: readonly string[], value: string, source: OptionSelectionSource) {
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  emit('beforeinput', before)
  trigger.value?.dispatchEvent(before)
  if (before.defaultPrevented) return false
  modelValue.value = selectedValuesForMode(next)
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
  requestOpen(true, 'trigger')
  if (open.value) {
    const option = options.value.find((option) => option.value === value)
    if (option && !option.disabled) setActive(value)
    scheduleFocusUpdate()
  }
}
async function removeChip(value: string, event: MouseEvent | KeyboardEvent) {
  if (props.disabled || !props.multiple || !values.value.includes(value)) return
  if (options.value.find((option) => option.value === value)?.disabled) return
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
  const enabled = options.value.filter((option) => !option.disabled)
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
  const enabled = options.value.filter((option) => !option.disabled)
  const current = enabled.findIndex((option) => option.value === activeValue.value)
  const rotated = [...enabled.slice(current + 1), ...enabled.slice(0, current + 1)]
  const match = rotated.find((option) => option.label.toLocaleLowerCase().startsWith(query))
  if (match) setActive(match.value)
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
watch(open, scheduleFocusUpdate, { flush: 'post' })
watch(
  options,
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
        :label="options.find((option) => option.value === value)?.label ?? value"
        :locale="props.locale"
        :disabled="disabled || options.find((option) => option.value === value)?.disabled"
        @click="openFromChip(value, $event)"
        @remove="removeChip"
      />
    </div>
    <button
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
      :anchor="chipDisplay ? root : trigger"
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
        @pointermove="onPointerMove"
        @keydown="onMultiListKeydown"
      >
        <template v-if="props.options !== undefined">
          <Option
            v-for="(option, index) in props.options"
            :id="`${listboxId}-option-${index}`"
            :key="option.value"
            :value="option.value"
            :label="option.label"
            :disabled="option.disabled"
            :selected="option.selected"
            :tabindex="multiple && activeValue === option.value ? 0 : -1"
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
          v-if="options.length === 0"
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
