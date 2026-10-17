export type TreeViewKey = string | number
export interface TreeViewNode {
  key: TreeViewKey
  label: string
  description?: string
  icon?: string
  value?: unknown
  children?: readonly TreeViewNode[]
  hasChildren?: boolean
  disabled?: boolean
  selectable?: boolean
  checkable?: boolean
}
export type TreeViewSelectionMode = 'none' | 'single' | 'multiple'
export type TreeViewCheckMode = 'none' | 'independent' | 'cascade'
export type TreeViewCheckState = 'unchecked' | 'checked' | 'indeterminate'
export type TreeViewLoader = (
  node: Readonly<TreeViewNode>,
  context: { signal: AbortSignal },
) => Promise<readonly TreeViewNode[]>
export interface TreeViewMessages {
  instructions: string
  selectInstructions: string
  multipleInstructions: string
  checkInstructions: string
  checkOnlyInstructions: string
  expand: (label: string) => string
  collapse: (label: string) => string
  check: (label: string) => string
  loading: (label: string) => string
  failure: string
  retry: (label: string) => string
  retryText: string
  emptyBranch: string
  emptyTitle: string
  scroll: string
}
export interface TreeViewRecord {
  node: TreeViewNode
  parent: TreeViewKey | null
  level: number
  position: number
  size: number
  disabled: boolean
}
