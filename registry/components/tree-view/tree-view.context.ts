import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  TreeViewCheckState,
  TreeViewKey,
  TreeViewMessages,
  TreeViewNode,
  TreeViewRecord,
  TreeViewSelectionMode,
} from './tree-view.types'
export interface TreeViewContext {
  records: ComputedRef<Map<TreeViewKey, TreeViewRecord>>
  expanded: ComputedRef<Set<TreeViewKey>>
  selected: ComputedRef<Set<TreeViewKey>>
  focused: Ref<TreeViewKey | null>
  selectionMode: ComputedRef<TreeViewSelectionMode>
  checking: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  messages: ComputedRef<TreeViewMessages>
  virtual: ComputedRef<boolean>
  renderedChildren: (node: TreeViewNode) => readonly TreeViewNode[]
  offset: (key: TreeViewKey) => number
  branch: (node: TreeViewNode) => boolean
  checkState: (node: TreeViewNode) => TreeViewCheckState
  loadState: (key: TreeViewKey) => 'loading' | 'error' | 'empty' | undefined
  labelId: (key: TreeViewKey) => string
  register: (key: TreeViewKey, element: unknown) => void
  focus: (key: TreeViewKey) => boolean
  toggle: (node: TreeViewNode) => void
  activate: (node: TreeViewNode, toggleValue?: boolean) => void
  check: (node: TreeViewNode, input?: HTMLInputElement) => void
  retry: (node: TreeViewNode) => void
  keydown: (event: KeyboardEvent, node: TreeViewNode) => void
}
export const treeViewKey: InjectionKey<TreeViewContext> = Symbol('yam3x-tree-view')
