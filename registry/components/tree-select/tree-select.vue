<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useId,
  watch,
} from 'vue'
import FormField from '../form-field/form-field.vue'
import TreeView from '../tree-view/tree-view.vue'
import { treeRecords, validateTreeChildren } from '../tree-view/tree-view.utils'
import type { TreeViewKey, TreeViewNode } from '../tree-view/tree-view.types'
import type { VirtualListOptions } from '../_shared/use-virtual-list'
import OptionPanel from '../option/option-panel.vue'
import InputChip from '../chips/input-chip.vue'
import Button from '../button/button.vue'
import Icon from '../icon/icon.vue'
import { useComponentLocale } from '../localization/context'
import type { TreeSelectLoader, TreeSelectNode } from './tree-select.types'
import { filterTreeSelectNodes, validateTreeSelectNodes } from './tree-select.utils'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    nodes: readonly TreeSelectNode[]
    label: string
    id?: string
    name?: string
    form?: string
    locale?: string
    disabled?: boolean
    required?: boolean
    multiple?: boolean
    searchable?: boolean
    clearable?: boolean
    virtual?: boolean | VirtualListOptions
    loadChildren?: TreeSelectLoader
    panelClass?: string
    searchLabel?: string
    noDataText?: string
  }>(),
  {
    disabled: false,
    required: false,
    multiple: false,
    searchable: false,
    clearable: false,
    virtual: false,
    panelClass: '',
  },
)
const modelValue = defineModel<string | string[] | null>({ default: null })
const open = defineModel<boolean>('open', { default: false })
const query = defineModel<string>('query', { default: '' })
const expandedKeys = defineModel<string[]>('expandedKeys', { default: () => [] })
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [detail: { values: string[] }]
  change: [detail: { values: string[] }]
  invalid: [event: Event]
  load: [detail: { node: Readonly<TreeSelectNode>; children: readonly TreeSelectNode[] }]
  loadError: [detail: { node: Readonly<TreeSelectNode>; error: unknown }]
}>()
defineSlots<{ leading?(scope: { node: TreeSelectNode; expanded: boolean }): unknown }>()
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const native = ref<HTMLSelectElement | null>(null)
const search = ref<HTMLInputElement | null>(null)
const tree = ref<InstanceType<typeof TreeView> | null>(null)
const panel = ref<InstanceType<typeof OptionPanel> | null>(null)
const generatedId = `yam3x-tree-select-${useId().replace(/:/g, '')}`
const controlId = computed(() => props.id || generatedId)
const dialogId = `${generatedId}-dialog`
const searchId = `${generatedId}-search`
const { locale, messages } = useComponentLocale(
  'treeSelect',
  () => props.locale,
  () => ({ search: props.searchLabel, noResults: props.noDataText }),
)
const { messages: actions } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)
const inheritedDisabled = ref(false)
const disabled = computed(() => props.disabled || inheritedDisabled.value)
const invalid = ref(false)
const values = computed(() => {
  const list = Array.isArray(modelValue.value)
    ? modelValue.value
    : modelValue.value == null
      ? []
      : [modelValue.value]
  return [...new Set(list.filter((key) => key.length > 0))].slice(0, props.multiple ? undefined : 1)
})
const cache = shallowRef(
  new Map<string, { node: TreeSelectNode; children: readonly TreeSelectNode[] }>(),
)
const pending = new Map<string, { source: TreeSelectNode; release: () => void }>()
watch(() => props.nodes, validateTreeSelectNodes, { immediate: true, deep: true })
const resolved = computed(() => {
  const sources = new Map<string, TreeSelectNode>()
  function visit(nodes: readonly TreeSelectNode[]): TreeSelectNode[] {
    return nodes.map((node) => {
      sources.set(node.key, node)
      const cached = cache.value.get(node.key)
      const children = node.children ?? (cached?.node === node ? cached.children : undefined)
      return {
        ...node,
        checkable: node.selectable !== false,
        ...(children ? { children: visit(children) } : {}),
      }
    })
  }
  const nodes = visit(props.nodes)
  validateTreeSelectNodes(nodes)
  return { nodes, sources }
})
watch(
  () => resolved.value.sources,
  (sources) => {
    const next = new Map(cache.value)
    for (const [key, entry] of next)
      if (
        sources.get(key) !== entry.node ||
        entry.node.children !== undefined ||
        !entry.node.hasChildren
      )
        next.delete(key)
    if (next.size !== cache.value.size) cache.value = next
    for (const [key, operation] of pending)
      if (sources.get(key) !== operation.source) {
        tree.value?.reload(key)
        operation.release()
      }
  },
)
const records = computed(() => treeRecords(resolved.value.nodes, (node) => node.children))
const displayValue = computed(() =>
  values.value.map((key) => records.value.get(key)?.node.label ?? key).join(', '),
)
const filtering = computed(() => props.searchable && query.value.trim().length > 0)
const filteredNodes = computed(() =>
  filtering.value
    ? filterTreeSelectNodes(resolved.value.nodes, query.value, locale.value)
    : resolved.value.nodes,
)
const searchExpanded = ref<string[]>([])
function branchKeys(nodes: readonly TreeSelectNode[]) {
  return [...treeRecords(nodes, (node) => node.children).values()]
    .filter((record) => record.node.children?.length)
    .map((record) => String(record.node.key))
}
watch(
  [query, filteredNodes, filtering],
  ([text, nodes, active], previous) => {
    const keys = branchKeys(nodes)
    if (!previous[1] || text !== previous[0] || active !== previous[2]) searchExpanded.value = keys
    else {
      const previousKeys = new Set(branchKeys(previous[1]))
      searchExpanded.value = [
        ...new Set([
          ...searchExpanded.value.filter((key) => keys.includes(key)),
          ...keys.filter((key) => !previousKeys.has(key)),
        ]),
      ]
    }
  },
  { immediate: true },
)
const visibleExpanded = computed(() =>
  filtering.value ? searchExpanded.value : expandedKeys.value,
)
function updateExpanded(keys: TreeViewKey[]) {
  if (filtering.value) searchExpanded.value = keys as string[]
  else expandedKeys.value = keys as string[]
}
function isLocked(key: string) {
  return records.value.get(key)?.disabled === true
}
function canChange() {
  return !disabled.value && native.value?.matches(':disabled') !== true
}
let restoreFocus = true
function close(restore = true) {
  restoreFocus = restore
  open.value = false
}
function show() {
  if (!canChange()) return
  if (open.value && panel.value?.positioned) {
    if (props.searchable) search.value?.focus()
    else focusTree()
  } else open.value = true
}
function focusTree() {
  const items = panel.value?.panel?.querySelectorAll<HTMLElement>('[role="treeitem"]')
  const target =
    panel.value?.panel?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]') ?? items?.[0]
  if (target) tree.value?.focus(target.dataset.treeKey!)
  else panel.value?.panel?.focus()
}
watch(
  open,
  async (value, previous) => {
    const owned = panel.value?.panel?.contains(document.activeElement)
    if (value && !canChange()) {
      close(false)
      return
    }
    if (!value && previous === true) query.value = ''
    await nextTick()
    if (previous === true && !open.value && owned && restoreFocus && !disabled.value)
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
    if (!open.value || !panel.value?.positioned) return
    if (props.searchable) search.value?.focus()
    else focusTree()
  },
)
watch(
  () => props.multiple,
  (multiple) => {
    modelValue.value = multiple ? [...values.value] : (values.value[0] ?? null)
  },
)
watch(disabled, (value) => {
  if (value) close(false)
})
function accept(keys: string[]) {
  if (!canChange()) return false
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  emit('beforeinput', before)
  root.value?.dispatchEvent(before)
  if (before.defaultPrevented) return false
  modelValue.value = props.multiple ? [...keys] : (keys[0] ?? null)
  invalid.value = false
  trigger.value?.removeAttribute('aria-invalid')
  emit('input', { values: [...keys] })
  emit('change', { values: [...keys] })
  void nextTick(() => {
    native.value?.dispatchEvent(new Event('input', { bubbles: true }))
    native.value?.dispatchEvent(new Event('change', { bubbles: true }))
  })
  return true
}
function onTreeValue(keys: TreeViewKey[]) {
  if (accept(keys as string[]) && !props.multiple) close()
}
function onPanelKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.isComposing) return
  event.preventDefault()
  event.stopPropagation()
  close()
}
function onSearchKeydown(event: KeyboardEvent) {
  if (
    event.key !== 'ArrowDown' ||
    event.isComposing ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return
  event.preventDefault()
  focusTree()
}
function remove(key: string) {
  if (isLocked(key)) return
  const index = values.value.indexOf(key)
  if (accept(values.value.filter((value) => value !== key)))
    void nextTick(() => {
      const chips = root.value?.querySelectorAll<HTMLButtonElement>(
        '.yam3x-input-chip__main:not(:disabled)',
      )
      ;(chips?.[Math.min(index, chips.length - 1)] ?? trigger.value)?.focus()
    })
}
function clear() {
  if (accept(values.value.filter(isLocked))) close()
}
function onInvalid(event: Event) {
  const shouldFocus = !event.defaultPrevented
  event.preventDefault()
  invalid.value = true
  trigger.value?.dispatchEvent(new Event('invalid', { cancelable: true }))
  emit('invalid', event)
  if (shouldFocus) trigger.value?.focus()
}
let resetForm: HTMLFormElement | null = null
let initial: string | string[] | null = null
let disabledObserver: MutationObserver | undefined
let focusFrame = 0
function attachForm() {
  if (resetForm === native.value?.form) return
  resetForm?.removeEventListener('reset', onReset)
  resetForm = native.value?.form ?? null
  resetForm?.addEventListener('reset', onReset)
}
function onReset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    modelValue.value = Array.isArray(initial) ? [...initial] : initial
    invalid.value = false
    close(false)
    trigger.value?.removeAttribute('aria-invalid')
  })
}
watch(
  () => props.form,
  () => nextTick(attachForm),
)
watch(values, (current) => {
  if (current.length) {
    invalid.value = false
    trigger.value?.removeAttribute('aria-invalid')
  }
})
function syncDisabled() {
  inheritedDisabled.value = !!native.value?.matches(':disabled') && !native.value.disabled
}
onMounted(() => {
  initial = Array.isArray(modelValue.value) ? [...modelValue.value] : modelValue.value
  attachForm()
  syncDisabled()
  disabledObserver = new MutationObserver(syncDisabled)
  for (let ancestor = root.value?.parentElement; ancestor; ancestor = ancestor.parentElement)
    disabledObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] })
})
onBeforeUnmount(() => {
  resetForm?.removeEventListener('reset', onReset)
  disabledObserver?.disconnect()
  cancelAnimationFrame(focusFrame)
})
async function load(node: Readonly<TreeViewNode>, context: { signal: AbortSignal }) {
  const key = String(node.key)
  const source = resolved.value.sources.get(key) ?? (node as TreeSelectNode)
  const operation = {
    source,
    release() {
      context.signal.removeEventListener('abort', operation.release)
      if (pending.get(key) === operation) pending.delete(key)
    },
  }
  pending.set(key, operation)
  context.signal.addEventListener('abort', operation.release, { once: true })
  const children = await props.loadChildren!(source, context)
  if (context.signal.aborted || resolved.value.sources.get(key) !== source) {
    if (!context.signal.aborted) tree.value?.reload(key)
    operation.release()
    throw new DOMException('TreeSelect load superseded.', 'AbortError')
  }
  validateTreeSelectNodes(children)
  validateTreeChildren(children, new Set(records.value.keys()))
  return children
}
/** Hold source identity until Tree view accepts or rejects the adapter result. */
function finishLoad(key: string) {
  const operation = pending.get(key)
  const node = resolved.value.sources.get(key)
  if (!operation) return null
  if (operation.source !== node) {
    tree.value?.reload(key)
    operation.release()
    return null
  }
  operation.release()
  return node
}
function onLoad(detail: { node: Readonly<TreeViewNode>; children: readonly TreeViewNode[] }) {
  const node = finishLoad(String(detail.node.key))
  if (!node) return
  cache.value = new Map(cache.value).set(node.key, {
    node,
    children: detail.children as readonly TreeSelectNode[],
  })
  emit('load', { node, children: detail.children as readonly TreeSelectNode[] })
}
function onLoadError(detail: { node: Readonly<TreeViewNode>; error: unknown }) {
  const node = finishLoad(String(detail.node.key))
  if (node) emit('loadError', { node, error: detail.error })
}
function onFocusOut() {
  cancelAnimationFrame(focusFrame)
  focusFrame = requestAnimationFrame(() => {
    if (open.value && !panel.value?.panel?.contains(document.activeElement)) close(false)
  })
}
defineExpose({ show, close, focus: () => trigger.value?.focus(), trigger })
</script>

<template>
  <div
    ref="root"
    class="yam3x-tree-select"
    :class="{ 'yam3x-tree-select--multiple': multiple, 'yam3x-tree-select--disabled': disabled }"
  >
    <div
      v-if="multiple && values.length"
      class="yam3x-tree-select__chips"
    >
      <InputChip
        v-for="key in values"
        :key="key"
        :value="key"
        :label="records.get(key)?.node.label ?? key"
        :locale="locale"
        :disabled="disabled || isLocked(key)"
        @click.prevent="show"
        @remove="remove"
      />
    </div>
    <button
      :id="controlId"
      ref="trigger"
      v-bind="attrs"
      class="yam3x-tree-select__trigger"
      :data-form-field-control="generatedId"
      type="button"
      :role="multiple ? undefined : 'combobox'"
      :aria-label="label"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="open ? dialogId : undefined"
      :aria-description="displayValue || undefined"
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
      <span class="yam3x-tree-select__value">{{ multiple ? '' : displayValue }}</span
      ><Icon
        name="arrow_drop_down"
        aria-hidden="true"
      />
    </button>
    <select
      ref="native"
      class="yam3x-tree-select__native"
      :data-form-field-focus="generatedId"
      :name="name"
      :form="form"
      :multiple="multiple"
      :required="required"
      :disabled="props.disabled"
      tabindex="-1"
      aria-hidden="true"
      @invalid="onInvalid"
    >
      <option
        v-if="!multiple"
        value=""
        disabled
        :selected="!values.length"
      ></option>
      <option
        v-for="key in values"
        :key="key"
        :value="key"
        :selected="true"
        :disabled="isLocked(key)"
      >
        {{ records.get(key)?.node.label ?? key }}
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
      :panel-class="`yam3x-tree-select__panel ${panelClass}`"
      :style="{
        '--yam3x-option-panel-container-min-width': '400px',
        '--yam3x-option-panel-container-max-width': 'min(640px, 100vw)',
        '--yam3x-option-panel-container-max-height': '480px',
      }"
      @beforetoggle="restoreFocus = false"
      @keydown.capture="onPanelKeydown"
      @focusout="onFocusOut"
    >
      <template v-if="open">
        <FormField
          v-if="searchable"
          class="yam3x-tree-select__search-field"
          :label="messages.search"
          hide-subscript="always"
        >
          <input
            :id="searchId"
            ref="search"
            v-model="query"
            type="search"
            autocomplete="off"
            @keydown="onSearchKeydown"
          />
        </FormField>
        <TreeView
          ref="tree"
          :nodes="filteredNodes"
          :label="label"
          :locale="locale"
          :instructions="undefined"
          :expanded-keys="visibleExpanded"
          :selected-keys="multiple ? [] : values"
          :checked-keys="multiple ? values : []"
          :selection-mode="multiple ? 'none' : 'single'"
          :check-mode="multiple ? 'independent' : 'none'"
          :disabled="disabled"
          :virtual="virtual"
          :load-children="loadChildren ? load : undefined"
          @update:expanded-keys="updateExpanded"
          @update:selected-keys="onTreeValue"
          @update:checked-keys="onTreeValue"
          @load="onLoad"
          @load-error="onLoadError"
        >
          <template
            v-if="$slots.leading"
            #leading="scope"
            ><slot
              name="leading"
              :node="resolved.sources.get(String(scope.node.key)) ?? (scope.node as TreeSelectNode)"
              :expanded="scope.expanded"
          /></template>
          <template #empty
            ><p role="status">{{ filtering ? messages.noResults : messages.empty }}</p></template
          >
        </TreeView>
        <div class="yam3x-tree-select__actions">
          <Button
            v-if="clearable && values.length"
            variant="text"
            :disabled="disabled || values.every(isLocked)"
            @click="clear"
            >{{ actions.clear }}</Button
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
.yam3x-tree-select {
  --_yam3x-tree-select-focus: var(--md-sys-color-secondary);
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  inline-size: 100%;
  min-inline-size: 0;
  color: inherit;
  font: inherit;
}
.yam3x-tree-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1 1 auto;
  gap: 8px;
  min-inline-size: 32px;
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
.yam3x-tree-select__trigger:focus-visible {
  outline: 3px solid var(--_yam3x-tree-select-focus);
  outline-offset: 2px;
}
.yam3x-form-field__control .yam3x-tree-select__trigger:focus-visible {
  outline: none;
}
.yam3x-tree-select__value {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.yam3x-tree-select__chips {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 8px;
  min-inline-size: 0;
  padding-block: 8px;
}
.yam3x-tree-select--multiple .yam3x-tree-select__trigger {
  flex: 0 0 32px;
  margin-inline-start: auto;
}
.yam3x-tree-select__native {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
  pointer-events: none;
}
.yam3x-tree-select__panel {
  --_yam3x-tree-select-gap: calc(12px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-tree-select-focus: var(--md-sys-color-secondary);
  padding: var(--_yam3x-tree-select-gap);
}
.yam3x-tree-select__panel > .yam3x-tree-select__search-field {
  flex: none;
  inline-size: 100%;
}
.yam3x-tree-select__panel .yam3x-tree-view {
  min-block-size: 0;
}
.yam3x-tree-select__panel .yam3x-tree-view__scroll {
  max-block-size: 280px;
  overflow-y: auto;
}
.yam3x-tree-select__panel .yam3x-tree-view__title {
  margin-block-start: var(--_yam3x-tree-select-gap);
}
.yam3x-tree-select__actions {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 8px;
  margin-block-start: var(--_yam3x-tree-select-gap);
}
</style>
