<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import Option from '../option/option.vue'
import OptionPanel from '../option/option-panel.vue'
import FormField from '../form-field/form-field.vue'
import Heading from '../heading/heading.vue'
import Button from '../button/button.vue'
import Icon from '../icon/icon.vue'
import { useComponentLocale } from '../localization/context'
import type { CascaderOption } from './cascader.types'
import { cascaderPaths, resolveCascaderPath, validateCascaderOptions } from './cascader.utils'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    options: readonly CascaderOption[]
    label: string
    id?: string
    name?: string
    form?: string
    locale?: string
    disabled?: boolean
    required?: boolean
    searchable?: boolean
    clearable?: boolean
    selectBranches?: boolean
    separator?: string
    panelClass?: string
    searchLabel?: string
    noDataText?: string
  }>(),
  {
    disabled: false,
    required: false,
    searchable: false,
    clearable: false,
    selectBranches: false,
    separator: ' / ',
    panelClass: '',
  },
)
const modelValue = defineModel<string[]>({ default: () => [] })
const open = defineModel<boolean>('open', { default: false })
const query = defineModel<string>('query', { default: '' })
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [detail: { values: string[] }]
  change: [detail: { values: string[] }]
  invalid: [event: Event]
}>()
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const native = ref<HTMLSelectElement | null>(null)
const panel = ref<InstanceType<typeof OptionPanel> | null>(null)
const search = ref<HTMLInputElement | null>(null)
const uid = `yam3x-cascader-${useId().replace(/:/g, '')}`
const controlId = computed(() => props.id || uid)
const dialogId = `${uid}-dialog`
const { locale, messages } = useComponentLocale(
  'cascader',
  () => props.locale,
  () => ({ search: props.searchLabel, noResults: props.noDataText }),
)
const { messages: actions } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)
watch(() => props.options, validateCascaderOptions, { deep: true, immediate: true })
const draft = ref<string[]>([])
const depth = ref(0)
const active = ref<string[]>([])
const resultActive = ref('')
const inheritedDisabled = ref(false)
const disabled = computed(() => props.disabled || inheritedDisabled.value)
const invalid = ref(false)
const accepted = computed(() => resolveCascaderPath(props.options, modelValue.value))
function labelPath(values: readonly string[]) {
  const nodes = resolveCascaderPath(props.options, values).nodes
  return values.map((value, index) => nodes[index]?.label ?? value).join(props.separator)
}
const displayValue = computed(() => labelPath(modelValue.value))
const serialized = computed(() => (modelValue.value.length ? JSON.stringify(modelValue.value) : ''))
const levels = computed(() => {
  const result = [{ prefix: [] as string[], options: props.options, parent: '', disabled: false }]
  for (let index = 0; index < draft.value.length; index++) {
    const previous = result[index]!
    const option = previous.options.find((node) => node.value === draft.value[index])
    if (!option?.children?.length) break
    result.push({
      prefix: draft.value.slice(0, index + 1),
      options: option.children,
      parent: option.label,
      disabled: previous.disabled || !!option.disabled,
    })
  }
  return result
})
const levelEntries = computed(() =>
  levels.value.map((list, index) => {
    const enabled = list.disabled ? [] : list.options.filter((option) => !option.disabled)
    const entry =
      enabled.find((option) => option.value === active.value[index])?.value ??
      enabled.find((option) => option.value === draft.value[index])?.value ??
      enabled[0]?.value
    return { ...list, enabled, entry }
  }),
)
const searching = computed(() => props.searchable && query.value.trim().length > 0)
const results = computed(() => {
  if (!searching.value) return []
  const needle = query.value.trim().toLocaleLowerCase(locale.value)
  return cascaderPaths(props.options, props.selectBranches)
    .map((path) => ({
      ...path,
      key: JSON.stringify(path.values),
      label: path.nodes.map((node) => node.label).join(props.separator),
    }))
    .filter((path) => path.label.toLocaleLowerCase(locale.value).includes(needle))
})
function listElement(level: number) {
  return panel.value?.panel?.querySelector<HTMLElement>(`[data-cascader-level="${level}"]`)
}
function enabled(level: number) {
  return levelEntries.value[level]?.enabled ?? []
}
function onOptionFocus(level: number, value: string) {
  active.value = Object.assign([...active.value], { [level]: value })
  depth.value = level
}
function focusLevel(level = depth.value, wanted?: string) {
  const choices = enabled(level)
  const key =
    choices.find((option) => option.value === (wanted ?? active.value[level] ?? draft.value[level]))
      ?.value ?? choices[0]?.value
  depth.value = level
  if (key) active.value = Object.assign([...active.value], { [level]: key })
  void nextTick(() => {
    const list = listElement(level)
    const option = [...(list?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find(
      (row) => row.dataset.value === key,
    )
    ;(option ?? list)?.focus({ preventScroll: true })
    option?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })
}
function focusResult(key?: string) {
  const item =
    results.value.find(
      (result) => result.key === (key ?? resultActive.value) && !result.disabled,
    ) ?? results.value.find((result) => !result.disabled)
  resultActive.value = item?.key ?? ''
  void nextTick(() => {
    const list = panel.value?.panel?.querySelector<HTMLElement>('[data-cascader-results]')
    const option = [...(list?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find(
      (row) => row.dataset.value === item?.key,
    )
    ;(option ?? list)?.focus()
    option?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })
}
watch(
  results,
  async (items) => {
    const owned = panel.value?.panel?.contains(document.activeElement)
    if (!items.some((item) => item.key === resultActive.value && !item.disabled))
      resultActive.value = items.find((item) => !item.disabled)?.key ?? ''
    await nextTick()
    if (owned && document.activeElement === document.body && open.value) focusResult()
  },
  { immediate: true },
)
function canChange() {
  return !disabled.value && native.value?.matches(':disabled') !== true
}
let restoreFocus = true
let prefix = ''
let lastType = 0
let typeScope = ''
function close(restore = true) {
  restoreFocus = restore
  open.value = false
}
function focusPicker() {
  if (props.searchable) search.value?.focus()
  else focusLevel()
}
function show() {
  if (!canChange()) return
  if (open.value && panel.value?.positioned) focusPicker()
  else open.value = true
}
watch(
  open,
  async (value, previous) => {
    const owned = panel.value?.panel?.contains(document.activeElement)
    if (value && !canChange()) {
      close(false)
      return
    }
    if (value) {
      prefix = ''
      draft.value = resolveCascaderPath(props.options, modelValue.value).nodes.map(
        (node) => node.value,
      )
      depth.value = levels.value.length - 1
      active.value = []
    } else if (previous === true) query.value = ''
    await nextTick()
    if (!value && previous === true && owned && restoreFocus && !disabled.value)
      trigger.value?.focus()
    if (!open.value) restoreFocus = true
  },
  { immediate: true },
)
watch(
  () => open.value && panel.value?.positioned,
  async (ready) => {
    if (!ready) return
    await nextTick()
    if (open.value && panel.value?.positioned) focusPicker()
  },
)
watch(disabled, (value) => {
  if (value) close(false)
})
function accept(values: string[]) {
  if (!canChange() || resolveCascaderPath(props.options, values).disabled) return false
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  emit('beforeinput', before)
  root.value?.dispatchEvent(before)
  if (before.defaultPrevented) return false
  modelValue.value = [...values]
  invalid.value = false
  trigger.value?.removeAttribute('aria-invalid')
  emit('input', { values: [...values] })
  emit('change', { values: [...values] })
  void nextTick(() => {
    native.value?.dispatchEvent(new Event('input', { bubbles: true }))
    native.value?.dispatchEvent(new Event('change', { bubbles: true }))
  })
  close()
  return true
}
function choose(level: number, option: CascaderOption) {
  const list = levels.value[level]
  if (!list || list.disabled || option.disabled || !canChange()) return
  const values = [...list.prefix, option.value]
  if (!values.every((key, index) => draft.value[index] === key)) {
    draft.value = values
    active.value = active.value.slice(0, level + 1)
  }
  if (option.children?.length) focusLevel(level + 1)
  else {
    draft.value = values
    accept(values)
  }
}
function back() {
  prefix = ''
  if (depth.value > 0) focusLevel(depth.value - 1, draft.value[depth.value - 1])
}
function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !event.isComposing) {
    event.preventDefault()
    event.stopPropagation()
    close()
  }
}
function onSearchKeydown(event: KeyboardEvent) {
  if (
    event.key !== 'ArrowDown' ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return
  event.preventDefault()
  if (searching.value) focusResult()
  else focusLevel()
}
function moveKey(
  event: KeyboardEvent,
  keys: string[],
  current: string | undefined,
  focus: (key: string) => void,
) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !keys.length) return false
  event.preventDefault()
  prefix = ''
  const index = keys.indexOf(current ?? '')
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? keys.length - 1
        : Math.max(0, Math.min(keys.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))
  focus(keys[next]!)
  return true
}
function typeAhead(
  event: KeyboardEvent,
  scope: string,
  choices: Array<{ value: string; label: string }>,
  current: string | undefined,
  focus: (value: string) => void,
) {
  if ([...event.key].length !== 1 || event.key === ' ' || !choices.length) return
  event.preventDefault()
  const now = performance.now()
  prefix = scope !== typeScope || now - lastType > 700 ? event.key : prefix + event.key
  lastType = now
  typeScope = scope
  const repeated = [...prefix].every((character) => character === [...prefix][0])
  const needle = repeated ? event.key : prefix
  const collator = new Intl.Collator(locale.value, { usage: 'search', sensitivity: 'base' })
  const start = choices.findIndex((choice) => choice.value === current)
  for (let step = repeated ? 1 : 0; step <= choices.length; step++) {
    const choice = choices[(Math.max(start, 0) + step) % choices.length]!
    if (collator.compare(choice.label.slice(0, needle.length), needle) === 0) {
      focus(choice.value)
      break
    }
  }
}
function onLevelKeydown(event: KeyboardEvent, level: number) {
  if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
  const option = levels.value[level]?.options.find((node) => node.value === active.value[level])
  if (
    moveKey(
      event,
      enabled(level).map((node) => node.value),
      active.value[level],
      (key) => focusLevel(level, key),
    )
  )
    return
  const rtl = panel.value?.panel && getComputedStyle(panel.value.panel).direction === 'rtl'
  if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') && option?.children?.length) {
    event.preventDefault()
    prefix = ''
    choose(level, option)
  } else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft') && level > 0) {
    event.preventDefault()
    prefix = ''
    focusLevel(level - 1, draft.value[level - 1])
  } else
    typeAhead(
      event,
      JSON.stringify(levels.value[level]?.prefix),
      enabled(level),
      active.value[level],
      (key) => focusLevel(level, key),
    )
}
function onResultKeydown(event: KeyboardEvent) {
  if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
  if (
    !moveKey(
      event,
      results.value.filter((item) => !item.disabled).map((item) => item.key),
      resultActive.value,
      focusResult,
    )
  )
    typeAhead(
      event,
      'results',
      results.value
        .filter((item) => !item.disabled)
        .map((item) => ({ value: item.key, label: item.label })),
      resultActive.value,
      focusResult,
    )
}
watch(
  () => props.options,
  async () => {
    const owned = panel.value?.panel?.contains(document.activeElement)
    draft.value = resolveCascaderPath(props.options, draft.value).nodes.map((node) => node.value)
    depth.value = Math.min(depth.value, levels.value.length - 1)
    await nextTick()
    if (owned && document.activeElement === document.body && open.value) focusPicker()
  },
  { deep: true },
)
let focusFrame = 0
function onFocusOut() {
  cancelAnimationFrame(focusFrame)
  focusFrame = requestAnimationFrame(() => {
    if (open.value && !panel.value?.panel?.contains(document.activeElement)) close(false)
  })
}
let resetForm: HTMLFormElement | null = null
let initial: string[] = []
let disabledObserver: MutationObserver | undefined
function onReset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    modelValue.value = [...initial]
    invalid.value = false
    close(false)
    trigger.value?.removeAttribute('aria-invalid')
  })
}
function attachForm() {
  if (resetForm === native.value?.form) return
  resetForm?.removeEventListener('reset', onReset)
  resetForm = native.value?.form ?? null
  resetForm?.addEventListener('reset', onReset)
}
function onInvalid(event: Event) {
  const shouldFocus = !event.defaultPrevented
  event.preventDefault()
  invalid.value = true
  trigger.value?.dispatchEvent(new Event('invalid', { cancelable: true }))
  emit('invalid', event)
  if (shouldFocus) trigger.value?.focus()
}
watch(
  () => props.form,
  () => nextTick(attachForm),
)
watch(serialized, (value) => {
  if (value) {
    invalid.value = false
    trigger.value?.removeAttribute('aria-invalid')
  }
})
onMounted(() => {
  initial = [...modelValue.value]
  attachForm()
  const sync = () => {
    inheritedDisabled.value = !!native.value?.matches(':disabled') && !native.value.disabled
  }
  sync()
  disabledObserver = new MutationObserver(sync)
  for (let ancestor = root.value?.parentElement; ancestor; ancestor = ancestor.parentElement)
    disabledObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] })
})
onBeforeUnmount(() => {
  resetForm?.removeEventListener('reset', onReset)
  disabledObserver?.disconnect()
  cancelAnimationFrame(focusFrame)
})
defineExpose({ show, close, focus: () => trigger.value?.focus(), trigger })
</script>

<template>
  <div
    ref="root"
    class="yam3x-cascader"
  >
    <button
      :id="controlId"
      ref="trigger"
      v-bind="attrs"
      :data-form-field-control="uid"
      class="yam3x-cascader__trigger"
      type="button"
      role="combobox"
      :aria-label="label"
      :aria-description="displayValue || undefined"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="open ? dialogId : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
      :disabled="disabled"
      :value="displayValue"
      @click="open ? close() : show()"
      @keydown="
        ($event.key === 'ArrowDown' || $event.key === 'ArrowUp') &&
        !$event.isComposing &&
        ($event.preventDefault(), show())
      "
    >
      <span>{{ displayValue }}</span
      ><Icon
        name="arrow_drop_down"
        aria-hidden="true"
      />
    </button>
    <select
      ref="native"
      :data-form-field-focus="uid"
      class="yam3x-cascader__native"
      :name="name"
      :form="form"
      :required="required"
      :disabled="props.disabled"
      tabindex="-1"
      aria-hidden="true"
      @invalid="onInvalid"
    >
      <option
        value=""
        disabled
        :selected="!serialized"
      ></option>
      <option
        v-if="serialized"
        :value="serialized"
        :selected="true"
        :disabled="accepted.disabled"
      >
        {{ displayValue }}
      </option>
    </select>
    <OptionPanel
      :id="dialogId"
      ref="panel"
      v-model:open="open"
      role="dialog"
      :anchor="root"
      :label="label"
      :locale="locale"
      teleport
      :panel-class="`yam3x-cascader__panel ${panelClass}`"
      :style="{
        '--yam3x-option-panel-container-min-width': '640px',
        '--yam3x-option-panel-container-max-width': 'min(800px, 100vw)',
        '--yam3x-option-panel-container-max-height': '520px',
      }"
      @beforetoggle="restoreFocus = false"
      @keydown.capture="onPanelKeydown"
      @focusout="onFocusOut"
    >
      <template v-if="open">
        <Heading
          variant="title"
          size="medium"
          >{{ label }}</Heading
        >
        <FormField
          v-if="searchable"
          class="yam3x-cascader__search-field"
          :label="messages.search"
          hide-subscript="always"
          ><input
            ref="search"
            v-model="query"
            type="search"
            autocomplete="off"
            @keydown="onSearchKeydown"
        /></FormField>
        <div class="yam3x-cascader__navigation">
          <Button
            v-if="!searching"
            :disabled="depth === 0"
            variant="text"
            @click="back"
            >{{ actions.back }}</Button
          >
          <p class="yam3x-cascader__path">{{ labelPath(draft) || messages.root }}</p>
        </div>
        <div
          v-if="searching"
          role="listbox"
          :aria-label="messages.results(label)"
          class="yam3x-cascader__results"
          data-cascader-results
          :tabindex="results.some((item) => !item.disabled) ? -1 : 0"
          @keydown="onResultKeydown"
        >
          <Option
            v-for="(item, index) in results"
            :key="item.key"
            :value="item.key"
            :label="item.label"
            :selected="item.key === serialized"
            :disabled="item.disabled"
            :tabindex="
              (resultActive || results.find((result) => !result.disabled)?.key) === item.key
                ? 0
                : -1
            "
            :first="index === 0"
            :last="index === results.length - 1"
            @focus="resultActive = item.key"
            @select="accept(item.values)"
          />
          <p
            v-if="!results.length"
            role="status"
          >
            {{ messages.noResults }}
          </p>
        </div>
        <div
          v-else
          class="yam3x-cascader__levels"
        >
          <div
            v-for="(list, index) in levelEntries"
            :key="JSON.stringify(list.prefix)"
            role="listbox"
            :data-cascader-level="index"
            :aria-label="messages.level(index + 1, list.parent)"
            :tabindex="enabled(index).length ? -1 : 0"
            class="yam3x-cascader__level"
            :class="{ 'yam3x-cascader__level--current': depth === index }"
            @keydown="onLevelKeydown($event, index)"
          >
            <Option
              v-for="(option, position) in list.options"
              :key="option.value"
              :value="option.value"
              :label="option.label"
              :disabled="list.disabled || option.disabled"
              :selected="draft[index] === option.value"
              :tabindex="list.entry === option.value ? 0 : -1"
              :first="position === 0"
              :last="position === list.options.length - 1"
              hide-selection-indicator
              @focus="onOptionFocus(index, option.value)"
              @select="choose(index, option)"
            >
              <template
                v-if="option.children?.length"
                #trailing
                ><Icon
                  name="chevron_right"
                  class="yam3x-cascader__forward"
                  aria-hidden="true"
              /></template>
            </Option>
            <p
              v-if="!list.options.length"
              role="status"
            >
              {{ messages.empty }}
            </p>
          </div>
        </div>
        <div class="yam3x-cascader__actions">
          <Button
            v-if="clearable && modelValue.length"
            variant="text"
            :disabled="accepted.disabled"
            @click="accept([])"
            >{{ actions.clear }}</Button
          >
          <Button
            v-if="selectBranches && !searching"
            variant="text"
            :disabled="!draft.length || resolveCascaderPath(options, draft).disabled"
            @click="accept(draft)"
            >{{ messages.choosePath }}</Button
          >
          <Button
            variant="text"
            @click="close()"
            >{{ actions.close }}</Button
          >
        </div>
      </template>
    </OptionPanel>
  </div>
</template>

<style>
.yam3x-cascader {
  --_yam3x-cascader-focus: var(--md-sys-color-secondary);
  inline-size: 100%;
  min-inline-size: 0;
  position: relative;
}
.yam3x-cascader__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 24px;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.yam3x-cascader__trigger > span {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.yam3x-cascader__trigger:focus-visible {
  outline: 3px solid var(--_yam3x-cascader-focus);
  outline-offset: 2px;
}
.yam3x-form-field__control .yam3x-cascader__trigger:focus-visible {
  outline: none;
}
.yam3x-cascader__trigger:disabled {
  cursor: default;
}
.yam3x-cascader__native {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
  pointer-events: none;
}
.yam3x-cascader__panel {
  --_yam3x-cascader-gap: calc(12px * var(--md-sys-density-spacing-scale, 1));
  container-type: inline-size;
  gap: var(--_yam3x-cascader-gap);
  padding: var(--_yam3x-cascader-gap);
}
.yam3x-cascader__panel > .yam3x-cascader__search-field {
  flex: none;
  inline-size: 100%;
}
.yam3x-cascader__navigation,
.yam3x-cascader__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.yam3x-cascader__path {
  min-inline-size: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
.yam3x-cascader__levels {
  display: flex;
  flex: 0 1 auto;
  min-block-size: 48px;
  gap: 8px;
  overflow: auto;
  overscroll-behavior: contain;
}
.yam3x-cascader__level {
  flex: 1 0 192px;
  min-inline-size: 0;
  max-block-size: 280px;
  overflow: auto;
  overscroll-behavior: contain;
}
.yam3x-cascader__results {
  flex: 0 1 auto;
  min-block-size: 48px;
  max-block-size: 280px;
  overflow: auto;
}
.yam3x-cascader__actions {
  justify-content: end;
}
.yam3x-cascader__panel:dir(rtl) .yam3x-cascader__forward {
  transform: rotate(180deg);
}
@container (max-width: 36rem) {
  .yam3x-cascader__level {
    display: none;
    flex: 1 1 100%;
  }
  .yam3x-cascader__level--current {
    display: block;
  }
}
</style>
