<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import english from '../localization/locales/en-US'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useVirtualList, type VirtualListOptions } from '../_shared/use-virtual-list'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import type {
  AutocompleteFilter,
  AutocompleteOption,
  AutocompleteSelectionSource,
  AutocompleteVariant,
} from './autocomplete.types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    virtual?: boolean | VirtualListOptions
    options: AutocompleteOption[]
    label: string
    locale?: string
    id?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    selectionRequired?: boolean
    name?: string
    form?: string
    autocomplete?: string
    filter?: AutocompleteFilter
    caseSensitive?: boolean
    autoActivate?: boolean
    openOnFocus?: boolean
    loading?: boolean
    loadingText?: string
    noDataText?: string
    resultsLabel?: string | ((count: number) => string)
    panelClass?: string
    variant?: AutocompleteVariant
    hideSelectionIndicator?: boolean
    hideLoading?: boolean
    hideNoData?: boolean
  }>(),
  {
    virtual: false,
    placeholder: '',
    disabled: false,
    readonly: false,
    required: false,
    selectionRequired: false,
    autocomplete: 'off',
    filter: 'contains',
    caseSensitive: false,
    autoActivate: false,
    openOnFocus: true,
    loading: false,
    loadingText: undefined,
    noDataText: undefined,
    panelClass: '',
    variant: 'standard',
    hideSelectionIndicator: false,
    hideLoading: false,
    hideNoData: false,
  },
)
const query = defineModel<string>({ default: '' })
const selected = defineModel<string | null>('selected', { default: null })
const emit = defineEmits<{
  query: [detail: { query: string }]
  beforeselect: [
    option: AutocompleteOption,
    event: CustomEvent<{ option: AutocompleteOption; source: AutocompleteSelectionSource }>,
  ]
  select: [detail: { option: AutocompleteOption; source: AutocompleteSelectionSource }]
  change: [
    detail: {
      option: AutocompleteOption | null
      value: string | null
      query: string
      source?: AutocompleteSelectionSource
    },
  ]
  toggle: [detail: { open: boolean }]
  open: []
  close: []
}>()
const slots = defineSlots<{
  input?(props: {
    inputProps: Record<string, unknown>
    query: string
    selected: AutocompleteOption | null
  }): unknown
  option?(props: {
    option: AutocompleteOption
    active: boolean
    selected: boolean
    query: string
  }): unknown
  loading?(): unknown
  'no-data'?(): unknown
  trailing?(): unknown
}>()
const { messages } = useComponentLocale(
  'autocomplete',
  () => props.locale,
  () => {
    const results = props.resultsLabel
    return {
      loading: props.loadingText,
      noData: props.noDataText,
      results: typeof results === 'string' ? () => results : results,
    }
  },
)
const host = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const anchor = ref<HTMLElement | null>(null)
const popup = ref<HTMLElement | null>(null)
const generatedId = useId()
const inputId = computed(() => props.id ?? `yam3x-autocomplete-${generatedId}`)
const listboxId = computed(() => `${inputId.value}-listbox`)
const open = ref(false)
const activeValue = ref<string | null>(null)
const activeSource = ref<'automatic' | 'keyboard' | 'pointer' | null>(null)
const floatingStyle = ref<Record<string, string>>({ visibility: 'hidden' })
const filteredOptions = computed(() =>
  props.options.filter((option) => {
    if (typeof props.filter === 'function') return props.filter(option, query.value)
    if (props.filter === 'none') return true
    const needle = props.caseSensitive ? query.value : query.value.toLocaleLowerCase()
    const label = props.caseSensitive ? option.label : option.label.toLocaleLowerCase()
    if (props.filter === 'starts-with') return label.startsWith(needle)
    if (props.filter === 'ends-with') return label.endsWith(needle)
    return label.includes(needle)
  }),
)
const virtualEnabled = computed(() => props.virtual !== false)
const windowed = useVirtualList({
  keys: () => (props.loading ? [] : filteredOptions.value.map((option) => option.value)),
  scroller: () => popup.value,
  enabled: () => virtualEnabled.value,
  options: () => (typeof props.virtual === 'object' ? props.virtual : undefined),
  keepMounted: () => activeValue.value,
})
const renderedOptions = computed(() => {
  if (props.loading) return []
  return virtualEnabled.value
    ? windowed.items.value.map((item) => ({ ...item, option: filteredOptions.value[item.index]! }))
    : filteredOptions.value.map((option, index) => ({
        key: option.value,
        option,
        index,
        offset: 0,
      }))
})
watch(
  () => [query.value, props.filter, props.caseSensitive],
  () => {
    if (!virtualEnabled.value) return
    const target = activeOption.value ?? filteredOptions.value[0]
    if (target) windowed.scrollToKey(target.value)
  },
)
let optionMovementGeneration = 0
const optionMovementCleanups = new WeakMap<HTMLElement, () => void>()
function captureOptionPositions(): Map<string, number> {
  if (
    !open.value ||
    !popup.value ||
    popup.value.hidden ||
    getComputedStyle(popup.value).visibility === 'hidden'
  )
    return new Map()
  const popupTop = popup.value?.getBoundingClientRect().top ?? 0
  return new Map(
    [...(popup.value?.querySelectorAll<HTMLElement>('.yam3x-autocomplete__option') ?? [])].map(
      (option) => [option.id, option.getBoundingClientRect().top - popupTop],
    ),
  )
}

function animateOptionMovement(previousPositions: Map<string, number>): void {
  if (typeof window === 'undefined') return
  for (const option of popup.value?.querySelectorAll<HTMLElement>(
    '.yam3x-autocomplete__option.yam3x-autocomplete-option-shifting',
  ) ?? []) {
    optionMovementCleanups.get(option)?.()
  }
  const generation = ++optionMovementGeneration
  void nextTick(() => {
    if (
      generation !== optionMovementGeneration ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (generation !== optionMovementGeneration) return
        const options = [
          ...(popup.value?.querySelectorAll<HTMLElement>('.yam3x-autocomplete__option') ?? []),
        ]
        const popupTop = popup.value?.getBoundingClientRect().top ?? 0
        for (const option of options) {
          const previousTop = previousPositions.get(option.id)
          if (previousTop === undefined) continue
          const offset = previousTop - (option.getBoundingClientRect().top - popupTop)
          if (Math.abs(offset) < 1) continue
          option.style.transform = `translateY(${offset}px)`
          option.classList.add('yam3x-autocomplete-option-shifting')
          void option.offsetHeight
          requestAnimationFrame(() => {
            if (generation !== optionMovementGeneration) return
            option.style.transform = ''
            const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
            const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
              if (event.matches) cleanup()
            }
            const onTransitionEnd = (event: TransitionEvent) => {
              if (event.propertyName === 'transform') cleanup()
            }
            const cleanup = () => {
              option.style.removeProperty('transform')
              option.classList.remove('yam3x-autocomplete-option-shifting')
              motionPreference.removeEventListener('change', onMotionPreferenceChange)
              option.removeEventListener('transitionend', onTransitionEnd)
              optionMovementCleanups.delete(option)
            }
            optionMovementCleanups.set(option, cleanup)
            motionPreference.addEventListener('change', onMotionPreferenceChange)
            option.addEventListener('transitionend', onTransitionEnd)
          })
        }
      }),
    )
  })
}
const activeOption = computed(
  () =>
    filteredOptions.value.find(
      (option) => option.value === activeValue.value && !option.disabled,
    ) ?? null,
)
const selectedOption = computed(
  () => props.options.find((option) => option.value === selected.value) ?? null,
)
const popupAvailable = computed(
  () =>
    !props.disabled &&
    !props.readonly &&
    (props.loading
      ? !props.hideLoading && messages.value.loading.length > 0
      : filteredOptions.value.length > 0 ||
        (!props.hideNoData && messages.value.noData.length > 0)),
)
const liveMessage = computed(() =>
  props.loading
    ? messages.value.loading
    : filteredOptions.value.length === 0
      ? messages.value.noData
      : messages.value.results(filteredOptions.value.length),
)

let stopPositioning: (() => void) | undefined
let blurTimer = 0
let initialQuery = ''
let initialSelected: string | null = null
let resetForm: HTMLFormElement | null = null

function findEnabled(from: number, direction: 1 | -1): AutocompleteOption | null {
  const options = filteredOptions.value
  if (props.loading || !options.length) return null
  for (let offset = 0; offset < options.length; offset++) {
    const index = (from + offset * direction + options.length) % options.length
    const option = options[index]!
    if (!option.disabled) return option
  }
  return null
}
function initialActiveOption() {
  if (props.loading) return null
  const current = filteredOptions.value.find(
    (option) => option.value === selected.value && !option.disabled,
  )
  return current ?? (props.autoActivate ? findEnabled(0, 1) : null)
}
function setActive(
  option: AutocompleteOption | null,
  source: 'automatic' | 'keyboard' | 'pointer' = 'keyboard',
) {
  activeValue.value = option?.value ?? null
  activeSource.value = option ? source : null
  if (option && source !== 'pointer') {
    if (virtualEnabled.value) windowed.scrollToKey(option.value)
    else
      void nextTick(() =>
        document.getElementById(optionId(option))?.scrollIntoView({ block: 'nearest' }),
      )
  }
}
function optionId(option: AutocompleteOption) {
  return `${listboxId.value}-option-${encodeURIComponent(option.value)}`
}
function highlightedLabel(option: AutocompleteOption) {
  const text = option.label
  if (typeof props.filter === 'function' || props.filter === 'none' || !query.value)
    return [{ text, match: false }]
  const candidate = props.caseSensitive ? text : text.toLocaleLowerCase()
  const needle = props.caseSensitive ? query.value : query.value.toLocaleLowerCase()
  const start =
    props.filter === 'starts-with'
      ? candidate.startsWith(needle)
        ? 0
        : -1
      : props.filter === 'ends-with'
        ? candidate.endsWith(needle)
          ? candidate.length - needle.length
          : -1
        : candidate.indexOf(needle)
  if (start < 0 || candidate.length !== text.length) return [{ text, match: false }]
  return [
    ...(start > 0 ? [{ text: text.slice(0, start), match: false }] : []),
    { text: text.slice(start, start + query.value.length), match: true },
    ...(start + query.value.length < text.length
      ? [{ text: text.slice(start + query.value.length), match: false }]
      : []),
  ]
}
function setCustomValidity() {
  if (!input.value) return
  input.value.setCustomValidity(
    props.selectionRequired && query.value && selectedOption.value?.label !== query.value
      ? messages.value.selectionRequired || english.autocomplete.selectionRequired
      : '',
  )
}
function onInput(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  const previousOptionPositions = captureOptionPositions()
  query.value = target.value
  if (selected.value !== null && selectedOption.value?.label !== target.value) {
    selected.value = null
    emit('change', { option: null, value: null, query: target.value })
  }
  emit('query', { query: target.value })
  setActive(initialActiveOption(), 'automatic')
  if (popupAvailable.value) show()
  else close()
  animateOptionMovement(previousOptionPositions)
  setCustomValidity()
}
function onFocus() {
  emit('query', { query: query.value })
  if (props.openOnFocus && popupAvailable.value) show()
}
function onClick() {
  if (popupAvailable.value) show()
}
function onBlur() {
  window.clearTimeout(blurTimer)
  blurTimer = window.setTimeout(() => {
    close()
    if (props.selectionRequired) query.value = selectedOption.value?.label ?? ''
    if (input.value) input.value.value = query.value
    setCustomValidity()
  }, 0)
}
function onKeydown(event: KeyboardEvent) {
  if (event.isComposing || props.disabled || props.readonly) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (!open.value) {
      if (!popupAvailable.value) return
      event.preventDefault()
      show()
      setActive(
        findEnabled(
          event.key === 'ArrowDown' ? 0 : filteredOptions.value.length - 1,
          event.key === 'ArrowDown' ? 1 : -1,
        ),
        'keyboard',
      )
      return
    }
    const current = filteredOptions.value.findIndex((option) => option.value === activeValue.value)
    const start =
      current < 0
        ? event.key === 'ArrowDown'
          ? 0
          : filteredOptions.value.length - 1
        : current + (event.key === 'ArrowDown' ? 1 : -1)
    const next = findEnabled(
      (start + filteredOptions.value.length) % filteredOptions.value.length,
      event.key === 'ArrowDown' ? 1 : -1,
    )
    if (next) {
      event.preventDefault()
      setActive(next)
    }
  } else if (event.key === 'Enter' && open.value && activeOption.value) {
    event.preventDefault()
    commit(activeOption.value, 'keyboard')
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    event.stopPropagation()
    close()
  } else if (event.key === 'Tab') {
    close()
  } else if ((event.key === 'Backspace' || event.key === 'Delete') && !query.value) {
    close()
  }
}
function commit(option: AutocompleteOption, source: AutocompleteSelectionSource) {
  if (option.disabled) return
  const event = new CustomEvent<{
    option: AutocompleteOption
    source: AutocompleteSelectionSource
  }>('beforeselect', {
    bubbles: true,
    cancelable: true,
    detail: { option, source },
  })
  emit('beforeselect', option, event)
  host.value?.dispatchEvent(event)
  if (event.defaultPrevented) return
  query.value = option.label
  selected.value = option.value
  if (input.value) {
    input.value.value = option.label
    input.value.setSelectionRange(option.label.length, option.label.length)
  }
  setActive(option)
  close()
  emit('select', { option, source })
  emit('change', { option, value: option.value, query: option.label, source })
  setCustomValidity()
}
function show() {
  if (open.value || !popupAvailable.value) return
  open.value = true
  setActive(initialActiveOption(), 'automatic')
  emit('open')
  emit('toggle', { open: true })
  void nextTick(() => {
    void updatePosition()
  })
}
function close() {
  if (!open.value) return
  open.value = false
  activeValue.value = null
  activeSource.value = null
  emit('close')
  emit('toggle', { open: false })
}
function onOptionPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse') event.preventDefault()
}
function onTrailingPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse') event.preventDefault()
}
function onOptionClick(option: AutocompleteOption) {
  if (!option.disabled) commit(option, 'pointer')
}
function onOutsidePointer(event: PointerEvent) {
  const target = event.target
  if (target instanceof Node && !host.value?.contains(target)) close()
}
const inputProps = computed(() => ({
  ref: (element: unknown) => {
    input.value = element instanceof HTMLInputElement ? element : null
    setCustomValidity()
  },
  id: inputId.value,
  type: 'text',
  role: 'combobox',
  value: query.value,
  disabled: props.disabled,
  readonly: props.readonly,
  required: props.required,
  name: props.name,
  form: props.form,
  autocomplete: props.autocomplete,
  placeholder: props.placeholder,
  'aria-label': props.label || undefined,
  'aria-autocomplete': 'list' as const,
  'aria-expanded': open.value,
  'aria-controls': listboxId.value,
  'aria-activedescendant':
    open.value && !props.loading && activeOption.value ? optionId(activeOption.value) : undefined,
  'aria-required': props.selectionRequired || undefined,
  onInput,
  onFocus,
  onBlur,
  onClick,
  onKeydown,
}))
async function updatePosition() {
  if (!anchor.value || !popup.value || !open.value) return
  const { x, y } = await computePosition(anchor.value, popup.value, {
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, rects, elements }) {
          const measure = (
            property: 'inlineSize' | 'blockSize',
            value: string,
            fallback: number,
          ) => {
            const probe = document.createElement('span')
            probe.style.cssText =
              'position:fixed;visibility:hidden;box-sizing:border-box;padding:0;border:0;'
            probe.style[property] = value || `${fallback}px`
            elements.floating.append(probe)
            const result =
              property === 'inlineSize'
                ? probe.getBoundingClientRect().width
                : probe.getBoundingClientRect().height
            probe.remove()
            return result > 0 ? result : fallback
          }
          const panel = getComputedStyle(elements.floating)
          const configuredMinimum = measure(
            'inlineSize',
            panel.getPropertyValue('--yam3x-autocomplete-popup-min-width'),
            112,
          )
          const configuredMaximum = measure(
            'inlineSize',
            panel.getPropertyValue('--yam3x-autocomplete-popup-max-width'),
            280,
          )
          const configuredMaximumHeight = measure(
            'blockSize',
            panel.getPropertyValue('--yam3x-autocomplete-popup-max-height'),
            280,
          )
          const maximumWidth = Math.min(configuredMaximum, availableWidth)
          const minimumWidth = Math.min(configuredMinimum, maximumWidth)
          elements.floating.style.width = `${Math.max(minimumWidth, Math.min(rects.reference.width, maximumWidth))}px`
          elements.floating.style.minInlineSize = `${minimumWidth}px`
          elements.floating.style.maxInlineSize = `${maximumWidth}px`
          elements.floating.style.maxHeight = `${Math.max(0, Math.min(configuredMaximumHeight, availableHeight))}px`
        },
      }),
    ],
  })
  floatingStyle.value = { left: `${x}px`, top: `${y}px`, visibility: 'visible' }
}
function onFormReset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    query.value = initialQuery
    selected.value = initialSelected
    activeValue.value = null
    activeSource.value = null
    close()
    void nextTick(() => {
      if (input.value) input.value.value = initialQuery
      setCustomValidity()
    })
  })
}
watch([query, selected, () => messages.value.selectionRequired], setCustomValidity)
watch(selected, (value) => {
  if (value === null) return
  const option = props.options.find((candidate) => candidate.value === value)
  if (option) query.value = option.label
})
watch(
  () => props.options,
  () => {
    if (
      activeValue.value &&
      !filteredOptions.value.some(
        (option) => option.value === activeValue.value && !option.disabled,
      )
    ) {
      setActive(props.autoActivate ? findEnabled(0, 1) : null, 'automatic')
    }
    if (open.value && !popupAvailable.value) close()
    else if (open.value && !activeValue.value) setActive(initialActiveOption(), 'automatic')
    void nextTick(() => {
      void updatePosition()
    })
  },
  { deep: true },
)
watch(
  () => [props.disabled, props.readonly],
  () => {
    if (!popupAvailable.value) close()
  },
)
watch(open, async (value) => {
  await nextTick()
  if (value && anchor.value && popup.value) {
    document.addEventListener('pointerdown', onOutsidePointer, true)
    stopPositioning = autoUpdate(anchor.value, popup.value, () => {
      void updatePosition()
    })
  } else {
    document.removeEventListener('pointerdown', onOutsidePointer, true)
    stopPositioning?.()
    stopPositioning = undefined
    floatingStyle.value = { visibility: 'hidden' }
  }
})
onMounted(() => {
  initialQuery = query.value
  initialSelected = selected.value
  resetForm = props.form
    ? (document.getElementById(props.form) as HTMLFormElement | null)
    : (input.value?.form ?? null)
  resetForm?.addEventListener('reset', onFormReset)
  setCustomValidity()
})
onBeforeUnmount(() => {
  window.clearTimeout(blurTimer)
  document.removeEventListener('pointerdown', onOutsidePointer, true)
  stopPositioning?.()
  resetForm?.removeEventListener('reset', onFormReset)
})

defineExpose({ open, close, focus: () => input.value?.focus(), input })
</script>

<template>
  <div
    ref="host"
    class="yam3x-autocomplete"
    v-bind="$attrs"
    :class="{
      'yam3x-autocomplete--open': open,
      'yam3x-autocomplete--disabled': disabled,
      'yam3x-autocomplete--vibrant': props.variant === 'vibrant',
    }"
  >
    <label
      class="yam3x-autocomplete__label"
      :for="inputId"
      >{{ label }}</label
    >
    <div
      ref="anchor"
      class="yam3x-autocomplete__field"
      @click="onClick"
    >
      <slot
        v-if="slots.input"
        name="input"
        :input-props="inputProps"
        :query="query"
        :selected="selectedOption"
      >
        <input
          v-bind="inputProps"
          class="yam3x-autocomplete__input"
        />
      </slot>
      <input
        v-else
        v-bind="inputProps"
        class="yam3x-autocomplete__input"
      />
      <button
        class="yam3x-autocomplete__trailing"
        type="button"
        :tabindex="-1"
        :disabled="disabled || readonly"
        :aria-label="messages.showSuggestions(label)"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listboxId"
        @pointerdown="onTrailingPointerDown"
        @click="show"
      >
        <slot name="trailing"
          ><Icon
            aria-hidden="true"
            class="yam3x-autocomplete__chevron"
            :class="{ 'yam3x-autocomplete__chevron--open': open }"
            name="expand_more"
        /></slot>
      </button>
    </div>
    <div
      class="yam3x-autocomplete__live"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ open ? liveMessage : '' }}
    </div>
    <div
      :id="listboxId"
      ref="popup"
      class="yam3x-autocomplete__popup"
      :class="panelClass"
      :style="floatingStyle"
      role="listbox"
      :aria-label="messages.suggestions(label)"
      :aria-busy="loading ? 'true' : undefined"
      :hidden="!open"
    >
      <div
        v-if="loading && !hideLoading"
        class="yam3x-autocomplete__status"
        role="presentation"
      >
        <slot name="loading">{{ messages.loading }}</slot>
      </div>
      <div
        v-else-if="filteredOptions.length === 0 && !hideNoData"
        class="yam3x-autocomplete__status"
        role="presentation"
      >
        <slot name="no-data">{{ messages.noData }}</slot>
      </div>
      <TransitionGroup
        name="yam3x-autocomplete-option"
        tag="div"
        class="yam3x-autocomplete__options"
        :class="{ 'yam3x-autocomplete__options--virtual': virtualEnabled }"
        :css="!virtualEnabled"
        :style="
          virtualEnabled && !loading && filteredOptions.length
            ? { blockSize: `${windowed.totalSize.value}px` }
            : undefined
        "
      >
        <div
          v-for="{ option, index: resultIndex, offset: rowOffset } in renderedOptions"
          :id="optionId(option)"
          :ref="
            (element) =>
              windowed.measure(
                option.value,
                virtualEnabled ? (element as HTMLElement | null) : null,
              )
          "
          :key="option.value"
          v-ripple
          :style="
            virtualEnabled
              ? { position: 'absolute', insetInline: 0, top: `${rowOffset}px` }
              : undefined
          "
          class="yam3x-autocomplete__option yam3x-state-layer"
          :class="{
            'yam3x-autocomplete__option--active': option.value === activeValue,
            'yam3x-autocomplete__option--active-focus':
              option.value === activeValue && activeSource !== 'pointer',
            'yam3x-autocomplete__option--active-pointer':
              option.value === activeValue && activeSource === 'pointer',
            'yam3x-autocomplete__option--selected': option.value === selected,
            'yam3x-autocomplete__option--disabled': option.disabled,
            'yam3x-autocomplete__option--first': option.value === filteredOptions[0]?.value,
            'yam3x-autocomplete__option--last':
              option.value === filteredOptions[filteredOptions.length - 1]?.value,
          }"
          role="option"
          :aria-posinset="virtualEnabled ? resultIndex + 1 : undefined"
          :aria-setsize="virtualEnabled ? filteredOptions.length : undefined"
          :aria-label="option.label"
          :aria-selected="option.value === activeValue"
          :aria-disabled="option.disabled ? 'true' : undefined"
          @pointerdown="onOptionPointerDown"
          @pointerenter="!option.disabled && setActive(option, 'pointer')"
          @click="onOptionClick(option)"
        >
          <span class="yam3x-autocomplete__option-content">
            <slot
              name="option"
              :option="option"
              :active="option.value === activeValue"
              :selected="option.value === selected"
              :query="query"
            >
              <span class="yam3x-autocomplete__label-text">
                <template
                  v-for="(part, index) in highlightedLabel(option)"
                  :key="index"
                >
                  <mark
                    v-if="part.match"
                    class="yam3x-autocomplete__match"
                    >{{ part.text }}</mark
                  >
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
            </slot>
            <Icon
              v-if="option.value === selected && !hideSelectionIndicator"
              class="yam3x-autocomplete__check"
              aria-hidden="true"
              name="check"
            />
          </span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
.yam3x-autocomplete {
  --_yam3x-autocomplete-option-container-height: var(
    --yam3x-autocomplete-option-container-height,
    44px
  );
  --_yam3x-autocomplete-option-first-child-shape: var(
    --yam3x-autocomplete-option-first-child-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-medium, 12px)
  );
  --_yam3x-autocomplete-option-first-child-inner-shape: var(
    --_yam3x-autocomplete-sys-shape-corner-extra-small,
    4px
  );
  --_yam3x-autocomplete-option-label-text-font-size: var(
    --yam3x-autocomplete-option-label-text-font-size,
    14px
  );
  --_yam3x-autocomplete-option-last-child-shape: var(
    --yam3x-autocomplete-option-last-child-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-medium, 12px)
  );
  --_yam3x-autocomplete-option-last-child-inner-shape: var(
    --_yam3x-autocomplete-sys-shape-corner-extra-small,
    4px
  );
  --_yam3x-autocomplete-popup-elevation: var(
    --yam3x-autocomplete-popup-elevation,
    0 4px 8px 3px rgb(0 0 0 / 15%),
    0 1px 3px rgb(0 0 0 / 30%)
  );
  --_yam3x-autocomplete-popup-max-height: var(--yam3x-autocomplete-popup-max-height, 280px);
  --_yam3x-autocomplete-popup-max-width: var(--yam3x-autocomplete-popup-max-width, 280px);
  --_yam3x-autocomplete-popup-min-width: var(--yam3x-autocomplete-popup-min-width, 112px);
  --_yam3x-autocomplete-popup-padding-block: var(
    --yam3x-autocomplete-popup-padding-block,
    calc(2px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  --_yam3x-autocomplete-popup-padding-inline: var(
    --yam3x-autocomplete-popup-padding-inline,
    calc(4px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  --_yam3x-autocomplete-popup-shape: var(
    --yam3x-autocomplete-popup-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-large, 16px)
  );
  --_yam3x-autocomplete-option-selected-shape: var(
    --yam3x-autocomplete-option-selected-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-medium, 12px)
  );
  --_yam3x-autocomplete-option-shape: var(
    --yam3x-autocomplete-option-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-extra-small, 4px)
  );
  --_yam3x-autocomplete-sys-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-autocomplete-sys-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-autocomplete-sys-color-on-tertiary-container: var(--md-sys-color-on-tertiary-container);
  --_yam3x-autocomplete-sys-color-outline: var(--md-sys-color-outline);
  --_yam3x-autocomplete-sys-color-primary: var(--md-sys-color-primary);
  --_yam3x-autocomplete-sys-color-surface: var(--md-sys-color-surface);
  --_yam3x-autocomplete-sys-color-surface-container-low: var(--md-sys-color-surface-container-low);
  --_yam3x-autocomplete-sys-color-on-tertiary: var(--md-sys-color-on-tertiary);
  --_yam3x-autocomplete-sys-color-tertiary-container: var(--md-sys-color-tertiary-container);
  --_yam3x-autocomplete-sys-color-tertiary: var(--md-sys-color-tertiary);
  --_yam3x-autocomplete-sys-density-spacing-scale: var(--md-sys-density-spacing-scale);
  --_yam3x-autocomplete-sys-motion-spring-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-autocomplete-sys-motion-spring-fast-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-autocomplete-sys-shape-corner-extra-small: var(--md-sys-shape-corner-extra-small);
  --_yam3x-autocomplete-sys-shape-corner-large: var(--md-sys-shape-corner-large);
  --_yam3x-autocomplete-sys-shape-corner-medium: var(--md-sys-shape-corner-medium);
  --_yam3x-autocomplete-sys-state-focus-opacity: var(--md-sys-state-focus-opacity);
  --_yam3x-autocomplete-sys-typescale-line-height-scale: var(--md-sys-typescale-line-height-scale);
  --_yam3x-autocomplete-popup-color: var(--_yam3x-autocomplete-sys-color-surface-container-low);
  --_yam3x-autocomplete-option-color: var(--_yam3x-autocomplete-sys-color-on-surface);
  --_yam3x-autocomplete-option-selected-container-color: var(
    --_yam3x-autocomplete-sys-color-tertiary-container
  );
  --_yam3x-autocomplete-option-selected-color: var(
    --_yam3x-autocomplete-sys-color-on-tertiary-container
  );
  --_yam3x-autocomplete-option-container-hover-color: var(
    --_yam3x-autocomplete-sys-color-on-surface
  );
  --_yam3x-autocomplete-option-container-focus-color: var(
    --_yam3x-autocomplete-sys-color-on-surface
  );
  --_yam3x-autocomplete-option-selected-container-hover-color: var(
    --_yam3x-autocomplete-option-selected-color
  );
  --_yam3x-autocomplete-option-selected-container-focus-color: var(
    --_yam3x-autocomplete-option-selected-color
  );
  --_yam3x-autocomplete-option-selected-ripple-color: var(
    --_yam3x-autocomplete-option-selected-color
  );
  --_yam3x-autocomplete-popup-foreground: var(--_yam3x-autocomplete-sys-color-on-surface);
  --_yam3x-autocomplete-status-color: var(--_yam3x-autocomplete-sys-color-on-surface-variant);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(4px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1));
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
  color: var(--_yam3x-autocomplete-sys-color-on-surface);
  font: inherit;
}
.yam3x-autocomplete--vibrant {
  --_yam3x-autocomplete-popup-color: var(--_yam3x-autocomplete-sys-color-tertiary-container);
  --_yam3x-autocomplete-option-color: var(--_yam3x-autocomplete-sys-color-on-tertiary-container);
  --_yam3x-autocomplete-option-selected-container-color: var(
    --_yam3x-autocomplete-sys-color-tertiary
  );
  --_yam3x-autocomplete-option-selected-color: var(--_yam3x-autocomplete-sys-color-on-tertiary);
  --_yam3x-autocomplete-option-container-hover-color: var(
    --_yam3x-autocomplete-sys-color-on-tertiary-container
  );
  --_yam3x-autocomplete-option-container-focus-color: var(
    --_yam3x-autocomplete-sys-color-on-tertiary-container
  );
  --_yam3x-autocomplete-popup-foreground: var(
    --_yam3x-autocomplete-sys-color-on-tertiary-container
  );
  --_yam3x-autocomplete-status-color: var(--_yam3x-autocomplete-sys-color-on-tertiary-container);
}
.yam3x-autocomplete__label {
  color: var(--_yam3x-autocomplete-sys-color-on-surface-variant);
  font: inherit;
}
.yam3x-autocomplete__field {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
  min-block-size: 56px;
  border: 1px solid var(--_yam3x-autocomplete-sys-color-outline);
  border-radius: var(--_yam3x-autocomplete-sys-shape-corner-extra-small, 4px);
  background: var(--_yam3x-autocomplete-sys-color-surface);
}
.yam3x-autocomplete__field:focus-within {
  border: 2px solid var(--_yam3x-autocomplete-sys-color-primary);
}
.yam3x-autocomplete__input {
  box-sizing: border-box;
  flex: 1 1 0%;
  inline-size: 0;
  min-inline-size: 0;
  max-inline-size: 100%;
  min-block-size: 52px;
  padding: 0 calc(16px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1));
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.yam3x-autocomplete__input::placeholder {
  color: var(--_yam3x-autocomplete-sys-color-on-surface-variant);
  opacity: 1;
}
.yam3x-autocomplete__trailing {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: 48px;
  block-size: 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--_yam3x-autocomplete-sys-color-on-surface-variant);
  cursor: pointer;
}
.yam3x-autocomplete__trailing:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-autocomplete__trailing:focus-visible {
  outline: 2px solid var(--_yam3x-autocomplete-sys-color-primary);
  outline-offset: -2px;
}
.yam3x-autocomplete__trailing:disabled {
  cursor: default;
}
.yam3x-autocomplete__chevron {
  inline-size: 24px;
  block-size: 24px;
  font-size: 24px;
  fill: currentColor;
  transition: transform var(--_yam3x-autocomplete-sys-motion-spring-fast-effects);
}
.yam3x-autocomplete__chevron--open {
  transform: rotate(180deg);
}
.yam3x-autocomplete__popup {
  position: fixed;
  z-index: 40;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: auto;
  overflow-anchor: none;
  overscroll-behavior: contain;
  min-inline-size: var(--_yam3x-autocomplete-popup-min-width, 112px);
  max-inline-size: var(--_yam3x-autocomplete-popup-max-width, 280px);
  max-block-size: var(--_yam3x-autocomplete-popup-max-height, 280px);
  border-radius: var(
    --_yam3x-autocomplete-popup-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-large, 16px)
  );
  padding: var(
      --_yam3x-autocomplete-popup-padding-block,
      calc(2px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
    )
    var(
      --_yam3x-autocomplete-popup-padding-inline,
      calc(4px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
    );
  background: var(--_yam3x-autocomplete-popup-color);
  color: var(--_yam3x-autocomplete-popup-foreground);
  box-shadow: var(
    --_yam3x-autocomplete-popup-elevation,
    0 4px 8px 3px rgb(0 0 0 / 15%),
    0 1px 3px rgb(0 0 0 / 30%)
  );
}
.yam3x-autocomplete__popup[hidden] {
  display: none;
}
.yam3x-autocomplete__options {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 0;
}
.yam3x-autocomplete__options--virtual {
  position: relative;
  overflow-anchor: none;
}
.yam3x-autocomplete-option-move {
  transition: none;
}
.yam3x-autocomplete__option.yam3x-autocomplete-option-shifting {
  transition: transform
    var(
      --_yam3x-autocomplete-sys-motion-spring-fast-spatial,
      472ms cubic-bezier(0.42, 1.67, 0.21, 0.9)
    );
}
.yam3x-autocomplete-option-enter-active,
.yam3x-autocomplete-option-leave-active {
  transition:
    opacity
      var(
        --_yam3x-autocomplete-sys-motion-spring-fast-effects,
        130ms cubic-bezier(0.31, 0.94, 0.34, 1)
      ),
    transform
      var(
        --_yam3x-autocomplete-sys-motion-spring-fast-spatial,
        472ms cubic-bezier(0.42, 1.67, 0.21, 0.9)
      );
}
.yam3x-autocomplete-option-enter-from,
.yam3x-autocomplete-option-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.yam3x-autocomplete-option-leave-active {
  position: absolute;
  inline-size: calc(100% - 8px);
}
.yam3x-autocomplete__option {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  box-sizing: border-box;
  isolation: isolate;
  min-block-size: 48px;
  block-size: max(48px, var(--_yam3x-autocomplete-option-container-height));
  padding: 0;
  border-radius: var(
    --_yam3x-autocomplete-option-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-extra-small, 4px)
  );
  background: transparent;
  color: var(--_yam3x-autocomplete-option-color);
  cursor: pointer;
  outline: none;
  --yam3x-state-layer-color: var(--_yam3x-autocomplete-option-container-hover-color);
  transition:
    border-radius
      var(
        --_yam3x-autocomplete-sys-motion-spring-fast-effects,
        150ms cubic-bezier(0.31, 0.94, 0.34, 1)
      ),
    background-color var(--_yam3x-autocomplete-sys-motion-spring-fast-effects);
}
.yam3x-autocomplete__option--first:not(:where(.yam3x-autocomplete__option--last)) {
  border-start-start-radius: var(--_yam3x-autocomplete-option-first-child-shape);
  border-start-end-radius: var(--_yam3x-autocomplete-option-first-child-shape);
  border-end-start-radius: var(--_yam3x-autocomplete-option-first-child-inner-shape);
  border-end-end-radius: var(--_yam3x-autocomplete-option-first-child-inner-shape);
}
.yam3x-autocomplete__option--last:not(:where(.yam3x-autocomplete__option--first)) {
  border-start-start-radius: var(--_yam3x-autocomplete-option-last-child-inner-shape);
  border-start-end-radius: var(--_yam3x-autocomplete-option-last-child-inner-shape);
  border-end-start-radius: var(--_yam3x-autocomplete-option-last-child-shape);
  border-end-end-radius: var(--_yam3x-autocomplete-option-last-child-shape);
}
.yam3x-autocomplete__option--first.yam3x-autocomplete__option--last:not(
    :where(.yam3x-autocomplete__option--selected)
  ) {
  border-radius: var(--_yam3x-autocomplete-option-first-child-shape);
}
.yam3x-autocomplete__option--selected {
  border-radius: var(
    --_yam3x-autocomplete-option-selected-shape,
    var(--_yam3x-autocomplete-sys-shape-corner-medium, 12px)
  );
  background: var(--_yam3x-autocomplete-option-selected-container-color);
  --yam3x-state-layer-color: var(--_yam3x-autocomplete-option-selected-container-hover-color);
  --yam3x-ripple-color: var(--_yam3x-autocomplete-option-selected-ripple-color);
}
.yam3x-autocomplete__option--selected:hover {
  --yam3x-state-layer-color: var(--_yam3x-autocomplete-option-selected-container-hover-color);
}
.yam3x-autocomplete__option--selected:focus-visible,
.yam3x-autocomplete__option.yam3x-autocomplete__option--selected.yam3x-autocomplete__option--active-focus {
  --yam3x-state-layer-color: var(--_yam3x-autocomplete-option-selected-container-focus-color);
}
.yam3x-autocomplete__option-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: var(
    --_yam3x-autocomplete-option-icon-label-space,
    calc(8px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  box-sizing: border-box;
  min-inline-size: 0;
  min-block-size: 100%;
  padding-inline-start: var(
    --_yam3x-autocomplete-option-padding-start,
    calc(12px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  padding-inline-end: var(
    --_yam3x-autocomplete-option-padding-end,
    calc(12px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  color: var(--_yam3x-autocomplete-option-color);
  font-size: var(--_yam3x-autocomplete-option-label-text-font-size, 14px);
  font-weight: var(--_yam3x-autocomplete-option-label-text-font-weight, 500);
  line-height: calc(
    (var(--_yam3x-autocomplete-option-label-text-line-height, 20px)) *
      var(--_yam3x-autocomplete-sys-typescale-line-height-scale, 1.07)
  );
  letter-spacing: var(--_yam3x-autocomplete-option-label-text-tracking, 0.1px);
}
.yam3x-autocomplete__option-content > svg {
  flex: none;
  inline-size: var(--_yam3x-autocomplete-option-icon-size, 20px);
  block-size: var(--_yam3x-autocomplete-option-icon-size, 20px);
}
.yam3x-autocomplete__option-content > :first-child {
  min-inline-size: 0;
}
.yam3x-autocomplete__option--selected .yam3x-autocomplete__option-content {
  color: var(--_yam3x-autocomplete-option-selected-color);
}
.yam3x-autocomplete__option--disabled .yam3x-autocomplete__option-content {
  color: color-mix(
    in srgb,
    var(
        --_yam3x-autocomplete-option-disabled-color,
        var(--_yam3x-autocomplete-sys-color-on-surface)
      )
      var(--_yam3x-autocomplete-option-disabled-opacity, 38%),
    transparent
  );
}
.yam3x-autocomplete__option:not(.yam3x-autocomplete__option--selected):focus-visible:not(
    .yam3x-autocomplete__option--disabled
  ),
.yam3x-autocomplete__option.yam3x-autocomplete__option--active-focus:not(
    .yam3x-autocomplete__option--selected
  ):not(.yam3x-autocomplete__option--disabled) {
  --yam3x-state-layer-color: var(--_yam3x-autocomplete-option-container-focus-color);
}
.yam3x-autocomplete__option.yam3x-state-layer.yam3x-autocomplete__option--active-focus:not(
    .yam3x-autocomplete__option--disabled
  ):not([aria-disabled='true'])::after {
  opacity: var(--_yam3x-autocomplete-sys-state-focus-opacity, 0.1);
}
.yam3x-autocomplete__option:not(.yam3x-autocomplete__option--selected):not(
    .yam3x-autocomplete__option--disabled
  ) {
  --yam3x-state-layer-color: var(
    --_yam3x-autocomplete-option-container-hover-color,
    var(--_yam3x-autocomplete-sys-color-on-surface)
  );
  --yam3x-ripple-color: var(
    --_yam3x-autocomplete-option-ripple-color,
    var(--_yam3x-autocomplete-sys-color-on-surface)
  );
}
.yam3x-autocomplete__option--disabled {
  --yam3x-state-layer-color: transparent;
  --yam3x-ripple-color: transparent;
}
.yam3x-autocomplete__option-content svg {
  color: inherit;
}
.yam3x-autocomplete .yam3x-autocomplete__option .yam3x-autocomplete__check {
  flex: none;
  inline-size: var(--_yam3x-autocomplete-option-icon-size, 20px);
  block-size: var(--_yam3x-autocomplete-option-icon-size, 20px);
  margin-inline-start: auto;
  fill: currentColor;
  font-size: var(--_yam3x-autocomplete-option-icon-size, 20px);
}
.yam3x-autocomplete__match {
  background: var(--_yam3x-autocomplete-match-container-color, transparent);
  color: var(--_yam3x-autocomplete-match-color, inherit);
  font-weight: 600;
}
.yam3x-autocomplete__status {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-block-size: var(--_yam3x-autocomplete-no-data-container-height, 44px);
  padding: var(
    --_yam3x-autocomplete-no-data-container-padding,
    calc(12px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  color: var(--_yam3x-autocomplete-status-color);
  font-size: var(--_yam3x-autocomplete-no-data-font-size, 14px);
  font-weight: var(--_yam3x-autocomplete-no-data-font-weight, 500);
  line-height: calc(
    (var(--_yam3x-autocomplete-no-data-line-height, 20px)) *
      var(--_yam3x-autocomplete-sys-typescale-line-height-scale, 1.07)
  );
  letter-spacing: var(--_yam3x-autocomplete-no-data-tracking, 0.1px);
}
.yam3x-autocomplete__popup[aria-busy='true'] .yam3x-autocomplete__status {
  min-block-size: var(--_yam3x-autocomplete-loading-container-height, 44px);
  padding: var(
    --_yam3x-autocomplete-loading-container-padding,
    calc(12px * var(--_yam3x-autocomplete-sys-density-spacing-scale, 1))
  );
  color: var(--_yam3x-autocomplete-status-color);
  font-size: var(--_yam3x-autocomplete-loading-font-size, 14px);
  font-weight: var(--_yam3x-autocomplete-loading-font-weight, 500);
  line-height: calc(
    (var(--_yam3x-autocomplete-loading-line-height, 20px)) *
      var(--_yam3x-autocomplete-sys-typescale-line-height-scale, 1.07)
  );
  letter-spacing: var(--_yam3x-autocomplete-loading-tracking, 0.1px);
}
.yam3x-autocomplete__option--disabled {
  cursor: default;
}
.yam3x-autocomplete__option .yam3x-ripple-container {
  z-index: 1;
}
.yam3x-autocomplete__live {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.yam3x-autocomplete--disabled {
  opacity: 0.38;
}
.yam3x-autocomplete:dir(rtl) .yam3x-autocomplete__input {
  text-align: start;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-autocomplete-option-move,
  .yam3x-autocomplete__option.yam3x-autocomplete-option-shifting,
  .yam3x-autocomplete-option-enter-active,
  .yam3x-autocomplete-option-leave-active {
    transition: none;
  }
  .yam3x-autocomplete-option-enter-from,
  .yam3x-autocomplete-option-leave-to {
    transform: none;
  }
  .yam3x-autocomplete__option,
  .yam3x-autocomplete__option-content,
  .yam3x-autocomplete__chevron {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-autocomplete__field {
    border: 1px solid ButtonText;
    background: Canvas;
  }
  .yam3x-autocomplete__field:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
  .yam3x-autocomplete__popup {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
  .yam3x-autocomplete__option--active {
    outline: 2px solid Highlight;
  }
  .yam3x-autocomplete__option--selected {
    outline: 2px solid SelectedItem;
  }
  .yam3x-autocomplete--disabled {
    opacity: 1;
    color: GrayText;
  }
  .yam3x-autocomplete--disabled .yam3x-autocomplete__field {
    border-color: GrayText;
  }
  .yam3x-autocomplete__option--disabled {
    color: GrayText;
  }
}
</style>
