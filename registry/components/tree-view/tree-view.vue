<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
} from 'vue'
import TreeViewNodeView from './tree-view-node.vue'
import EmptyState from '../empty-state/empty-state.vue'
import { treeViewKey } from './tree-view.context'
import {
  isTreeBranch,
  treeCheckState,
  treeRecords,
  updateTreeChecks,
  validateTreeChildren,
  visibleTreeRecords,
} from './tree-view.utils'
import type {
  TreeViewCheckMode,
  TreeViewKey,
  TreeViewLoader,
  TreeViewMessages,
  TreeViewNode,
  TreeViewSelectionMode,
} from './tree-view.types'
import './tree-view.css'

const props = withDefaults(
  defineProps<{
    nodes: readonly TreeViewNode[]
    label: string
    description?: string
    selectionMode?: TreeViewSelectionMode
    checkMode?: TreeViewCheckMode
    loadChildren?: TreeViewLoader
    disabled?: boolean
    locale?: string
    instructions?: string | false
    messages?: Partial<TreeViewMessages>
  }>(),
  {
    description: '',
    selectionMode: undefined,
    checkMode: 'none',
    loadChildren: undefined,
    disabled: false,
    locale: 'en-US',
    instructions: undefined,
    messages: undefined,
  },
)
const expandedKeys = defineModel<TreeViewKey[]>('expandedKeys', { default: () => [] })
const selectedKeys = defineModel<TreeViewKey[]>('selectedKeys', { default: () => [] })
const checkedKeys = defineModel<TreeViewKey[]>('checkedKeys', { default: () => [] })
const emit = defineEmits<{
  expand: [detail: { node: Readonly<TreeViewNode>; expanded: boolean; keys: TreeViewKey[] }]
  select: [detail: { node: Readonly<TreeViewNode>; keys: TreeViewKey[] }]
  check: [detail: { node: Readonly<TreeViewNode>; keys: TreeViewKey[] }]
  activate: [node: Readonly<TreeViewNode>]
  loadError: [detail: { node: Readonly<TreeViewNode>; error: unknown }]
  load: [detail: { node: Readonly<TreeViewNode>; children: readonly TreeViewNode[] }]
}>()
defineSlots<{
  leading?(scope: { node: TreeViewNode; expanded: boolean }): unknown
  empty?(): unknown
}>()
const tree = ref<HTMLElement>()
const scroller = ref<HTMLElement>()
const overflow = ref(false)
const focused = ref<TreeViewKey | null>(null)
const selectionMode = computed(
  () => props.selectionMode ?? (props.checkMode === 'none' ? 'single' : 'none'),
)
const checking = computed(() => props.checkMode !== 'none')
const cascade = computed(() => props.checkMode === 'cascade' && !props.loadChildren)
const expanded = computed(() => new Set(expandedKeys.value))
const selected = computed(
  () =>
    new Set(
      selectionMode.value === 'none'
        ? []
        : selectionMode.value === 'single'
          ? selectedKeys.value.slice(0, 1)
          : selectedKeys.value,
    ),
)
const checked = computed(() => new Set(checkedKeys.value))
const cache = shallowRef(new Map<TreeViewKey, readonly TreeViewNode[]>())
const states = shallowRef(new Map<TreeViewKey, 'loading' | 'error' | 'empty'>())
interface LoadOperation {
  node: TreeViewNode
  controller: AbortController
}
const active = new Map<TreeViewKey, LoadOperation>()
const elements = new Map<TreeViewKey, HTMLElement>()
const ids = new Map<TreeViewKey, string>()
const uid = `yam3x-tree-${useId().replace(/:/g, '')}`
const labelId = `${uid}-label`
const descriptionId = `${uid}-description`
const instructionsId = `${uid}-instructions`
const scrollId = `${uid}-scroll`
let idCount = 0
let disposed = false
let observer: ResizeObserver | undefined
let prefix = ''
let lastType = 0
const messages = computed<TreeViewMessages>(() => {
  const zh = /^zh/i.test(props.locale)
  return {
    instructions: zh
      ? '使用方向键移动焦点和展开分支。'
      : 'Use arrow keys to move focus and expand branches.',
    selectInstructions: zh ? '按 Enter 选择节点。' : 'Press Enter to select a node.',
    multipleInstructions: zh
      ? '按空格切换节点选择，无需按住修饰键。'
      : 'Press Space to toggle selection without holding a modifier key.',
    checkInstructions: zh
      ? '按空格切换独立的勾选状态。'
      : 'Press Space to toggle the separate check state.',
    checkOnlyInstructions: zh
      ? '按 Enter 或空格切换勾选。'
      : 'Press Enter or Space to toggle checks.',
    expand: (label) => (zh ? `展开 ${label}` : `Expand ${label}`),
    collapse: (label) => (zh ? `折叠 ${label}` : `Collapse ${label}`),
    check: (label) => (zh ? `勾选 ${label}` : `Check ${label}`),
    loading: (label) => (zh ? `正在加载“${label}”的子项…` : `Loading children of ${label}…`),
    failure: zh
      ? '无法加载子项。使用展开方向键或重试按钮重试。'
      : 'Children could not be loaded. Use the expand arrow key or Retry.',
    retry: (label) => (zh ? `重试加载 ${label}` : `Retry loading ${label}`),
    retryText: zh ? '重试' : 'Retry',
    emptyBranch: zh ? '此节点没有子项。' : 'This node has no children.',
    emptyTitle: zh ? '暂无条目' : 'No items yet',
    scroll: zh
      ? '此区域支持横向滚动，以查看较深层级的完整内容。'
      : 'Scroll this region horizontally to inspect deep hierarchy and complete labels.',
    ...props.messages,
  }
})
const instructionText = computed(() =>
  props.instructions === false
    ? ''
    : (props.instructions ??
      [
        messages.value.instructions,
        selectionMode.value !== 'none' ? messages.value.selectInstructions : '',
        checking.value
          ? selectionMode.value === 'none'
            ? messages.value.checkOnlyInstructions
            : messages.value.checkInstructions
          : selectionMode.value === 'multiple'
            ? messages.value.multipleInstructions
            : '',
      ]
        .filter(Boolean)
        .join(' ')),
)
function children(node: TreeViewNode) {
  return node.children ?? (node.hasChildren ? cache.value.get(node.key) : undefined)
}
const records = computed(() => treeRecords(props.nodes, children))
const visible = computed(() => visibleTreeRecords(records.value, expanded.value))
function branch(node: TreeViewNode) {
  return isTreeBranch(node, children)
}
function state(node: TreeViewNode) {
  return treeCheckState(
    node,
    checked.value,
    children,
    cascade.value,
    records.value.get(node.key)?.disabled,
  )
}
function elementLabelId(key: TreeViewKey) {
  if (!ids.has(key)) ids.set(key, `${uid}-node-${++idCount}`)
  return ids.get(key)!
}
function focus(key: TreeViewKey) {
  const element = elements.get(key)
  if (!element?.isConnected || !visible.value.some((record) => record.node.key === key))
    return false
  focused.value = key
  element.focus({ preventScroll: true })
  element.firstElementChild?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  return true
}
function unavailable(node: TreeViewNode) {
  return props.disabled || records.value.get(node.key)?.disabled === true
}
function toggle(node: TreeViewNode) {
  if (unavailable(node) || !branch(node)) return
  focus(node.key)
  const wanted = !expanded.value.has(node.key)
  const next = wanted
    ? [...expandedKeys.value, node.key]
    : expandedKeys.value.filter((key) => key !== node.key)
  expandedKeys.value = next
  emit('expand', { node, expanded: wanted, keys: next })
}
function select(node: TreeViewNode, toggleValue: boolean) {
  if (unavailable(node) || selectionMode.value === 'none' || node.selectable === false) return
  const next =
    selectionMode.value === 'single'
      ? [node.key]
      : toggleValue && selected.value.has(node.key)
        ? selectedKeys.value.filter((key) => key !== node.key)
        : Array.from(new Set([...selectedKeys.value, node.key]))
  selectedKeys.value = next
  emit('select', { node, keys: next })
}
function check(node: TreeViewNode, input?: HTMLInputElement) {
  if (!unavailable(node) && checking.value && node.checkable !== false) {
    const next = updateTreeChecks(
      node,
      state(node) !== 'checked',
      checkedKeys.value,
      records.value,
      children,
      cascade.value,
    )
    checkedKeys.value = next
    emit('check', { node, keys: next })
  }
  focus(node.key)
  if (input)
    void nextTick(() => {
      if (input.isConnected) {
        input.checked = state(node) === 'checked'
        input.indeterminate = state(node) === 'indeterminate'
      }
    })
}
function activate(node: TreeViewNode, toggleValue = true) {
  focus(node.key)
  if (unavailable(node)) return
  if (selectionMode.value === 'none' && checking.value) check(node)
  else select(node, toggleValue && selectionMode.value === 'multiple')
  emit('activate', node)
}
function setState(key: TreeViewKey, value?: 'loading' | 'error' | 'empty') {
  const next = new Map(states.value)
  if (value) next.set(key, value)
  else next.delete(key)
  states.value = next
}
function cancel(key: TreeViewKey) {
  active.get(key)?.controller.abort()
  active.delete(key)
  if (states.value.get(key) === 'loading') setState(key)
}
async function load(node: TreeViewNode) {
  if (disposed || active.has(node.key) || unavailable(node)) return
  const operation: LoadOperation = { node, controller: new AbortController() }
  active.set(node.key, operation)
  setState(node.key, 'loading')
  const current = () =>
    !disposed &&
    active.get(node.key) === operation &&
    !operation.controller.signal.aborted &&
    records.value.has(node.key)
  try {
    await Promise.resolve()
    if (!current()) return
    if (!props.loadChildren)
      throw new Error('TreeView requires loadChildren for unresolved branches.')
    const result = await props.loadChildren(node, { signal: operation.controller.signal })
    if (!current()) return
    validateTreeChildren(result, new Set(records.value.keys()))
    cache.value = new Map(cache.value).set(node.key, result)
    setState(node.key, result.length ? undefined : 'empty')
    emit('load', { node, children: result })
  } catch (error) {
    if (current()) {
      setState(node.key, 'error')
      emit('loadError', { node, error })
    }
  } finally {
    if (active.get(node.key) === operation) active.delete(node.key)
  }
}
function retry(node: TreeViewNode) {
  if (!unavailable(node)) {
    focus(node.key)
    void load(node)
  }
}
function reload(key: TreeViewKey) {
  const node = records.value.get(key)?.node
  if (!node || node.children !== undefined || !node.hasChildren || unavailable(node)) return false
  cancel(key)
  const next = new Map(cache.value)
  next.delete(key)
  cache.value = next
  setState(key)
  if (expanded.value.has(key)) void load(node)
  return true
}
watch(
  [records, expanded, () => props.disabled],
  () => {
    const shown = new Set(
      visible.value
        .filter((record) => expanded.value.has(record.node.key))
        .map((record) => record.node.key),
    )
    for (const key of active.keys()) {
      const record = records.value.get(key)
      if (
        !record ||
        !shown.has(key) ||
        record.node.children !== undefined ||
        !record.node.hasChildren
      )
        cancel(key)
    }
    const next = new Map(cache.value)
    let changed = false
    for (const key of next.keys()) {
      const node = records.value.get(key)?.node
      if (!node || node.children !== undefined || !node.hasChildren) {
        next.delete(key)
        changed = true
      }
    }
    if (changed) cache.value = next
    for (const key of states.value.keys()) if (!records.value.has(key)) setState(key)
    for (const key of ids.keys()) if (!records.value.has(key)) ids.delete(key)
    for (const record of visible.value)
      if (
        shown.has(record.node.key) &&
        record.node.hasChildren &&
        children(record.node) === undefined &&
        !active.has(record.node.key) &&
        states.value.get(record.node.key) !== 'error'
      )
        void load(record.node)
  },
  { immediate: true, flush: 'post' },
)
function preferred() {
  return (
    visible.value.find((record) => selected.value.has(record.node.key))?.node.key ??
    visible.value[0]?.node.key ??
    null
  )
}
watch(
  visible,
  (list, previous) => {
    const document = tree.value?.ownerDocument
    const before = document?.activeElement
    const owned = tree.value?.contains(before ?? null)
    if (!list.some((record) => record.node.key === focused.value)) {
      const old = new Map(previous?.map((record) => [record.node.key, record]))
      let key = focused.value
      while (key !== null && !list.some((record) => record.node.key === key))
        key = old.get(key)?.parent ?? null
      focused.value = key ?? preferred()
    }
    void nextTick(() => {
      if (
        owned &&
        document &&
        (document.activeElement === before || document.activeElement === document.body) &&
        focused.value !== null
      )
        focus(focused.value)
      measure()
    })
  },
  { immediate: true, flush: 'pre' },
)
watch(selected, () => {
  if (!tree.value?.contains(tree.value.ownerDocument.activeElement)) focused.value = preferred()
})
function onFocusOut(event: FocusEvent) {
  if (event.relatedTarget && !tree.value?.contains(event.relatedTarget as Node))
    void nextTick(() => {
      if (!tree.value?.contains(tree.value.ownerDocument.activeElement)) focused.value = preferred()
    })
}
function onKeydown(event: KeyboardEvent, node: TreeViewNode) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
  if ([...event.key].length !== 1 || event.key === ' ') prefix = ''
  const index = visible.value.findIndex((record) => record.node.key === node.key)
  const rtl = tree.value && getComputedStyle(tree.value).direction === 'rtl'
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
  const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
  const move = (position: number) => {
    const record = visible.value[Math.max(0, Math.min(visible.value.length - 1, position))]
    if (record) focus(record.node.key)
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(index + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(index - 1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    move(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    move(visible.value.length - 1)
  } else if (event.key === forward) {
    event.preventDefault()
    if (unavailable(node)) return
    if (states.value.get(node.key) === 'error' && expanded.value.has(node.key)) retry(node)
    else if (branch(node) && !expanded.value.has(node.key)) toggle(node)
    else if (branch(node) && (children(node)?.length ?? 0)) move(index + 1)
  } else if (event.key === backward) {
    event.preventDefault()
    if (branch(node) && expanded.value.has(node.key) && !unavailable(node)) toggle(node)
    else {
      const parent = records.value.get(node.key)?.parent
      if (parent !== undefined && parent !== null) focus(parent)
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    activate(node, false)
  } else if (event.key === ' ') {
    event.preventDefault()
    if (checking.value) check(node)
    else select(node, selectionMode.value === 'multiple')
  } else if ([...event.key].length === 1) {
    event.preventDefault()
    const now = performance.now()
    prefix = now - lastType > 700 ? event.key : prefix + event.key
    lastType = now
    const repeated = [...prefix].every((character) => character === [...prefix][0])
    const needle = repeated ? event.key : prefix
    let collator: Intl.Collator
    try {
      collator = new Intl.Collator(props.locale, { usage: 'search', sensitivity: 'base' })
    } catch {
      collator = new Intl.Collator('en', { usage: 'search', sensitivity: 'base' })
    }
    for (let offset = repeated ? 1 : 0; offset <= visible.value.length; offset++) {
      const record = visible.value[(index + offset) % visible.value.length]
      if (record && collator.compare(record.node.label.slice(0, needle.length), needle) === 0) {
        focus(record.node.key)
        break
      }
    }
  }
}
function measure() {
  if (scroller.value) overflow.value = scroller.value.scrollWidth > scroller.value.clientWidth + 1
}
onMounted(() => {
  observer = new ResizeObserver(measure)
  if (scroller.value) observer.observe(scroller.value)
  if (tree.value) observer.observe(tree.value)
  measure()
})
onUpdated(measure)
onBeforeUnmount(() => {
  disposed = true
  for (const key of active.keys()) cancel(key)
  observer?.disconnect()
})
provide(treeViewKey, {
  records,
  expanded,
  selected,
  focused,
  selectionMode,
  checking,
  disabled: computed(() => props.disabled),
  messages,
  children,
  branch,
  checkState: state,
  loadState: (key) => states.value.get(key),
  labelId: elementLabelId,
  register: (key, element) => {
    if (element instanceof HTMLElement) elements.set(key, element)
    else elements.delete(key)
  },
  focus,
  toggle,
  activate,
  check,
  retry,
  keydown: onKeydown,
})
defineExpose({ focus, reload })
</script>

<template>
  <div class="yam3x-tree-view">
    <p
      :id="labelId"
      class="yam3x-tree-view__title"
    >
      {{ label }}
    </p>
    <p
      v-if="description"
      :id="descriptionId"
      class="yam3x-tree-view__support"
    >
      {{ description }}
    </p>
    <p
      v-if="instructionText"
      :id="instructionsId"
      class="yam3x-tree-view__support"
    >
      {{ instructionText }}
    </p>
    <p
      :id="scrollId"
      class="yam3x-tree-view__sr-only"
    >
      {{ messages.scroll }}
    </p>
    <div
      ref="scroller"
      class="yam3x-tree-view__scroll"
      role="region"
      :aria-labelledby="labelId"
      :aria-describedby="scrollId"
      :tabindex="overflow ? 0 : undefined"
    >
      <ul
        ref="tree"
        role="tree"
        class="yam3x-tree-view__tree"
        :aria-labelledby="labelId"
        :aria-describedby="
          [description && descriptionId, instructionText && instructionsId]
            .filter(Boolean)
            .join(' ') || undefined
        "
        :aria-multiselectable="
          selectionMode === 'multiple' || (checking && selectionMode === 'none')
            ? 'true'
            : undefined
        "
        :aria-disabled="disabled ? 'true' : undefined"
        :tabindex="visible.length ? undefined : 0"
        @focusout="onFocusOut"
      >
        <TreeViewNodeView
          v-for="node in nodes"
          :key="node.key"
          :node="node"
        >
          <template
            v-if="$slots.leading"
            #leading="scope"
            ><slot
              name="leading"
              v-bind="scope"
          /></template>
        </TreeViewNodeView>
      </ul>
    </div>
    <slot
      v-if="!nodes.length"
      name="empty"
      ><EmptyState :title="messages.emptyTitle"
    /></slot>
  </div>
</template>
