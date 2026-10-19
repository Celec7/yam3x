import type {
  TreeViewCheckState,
  TreeViewKey,
  TreeViewNode,
  TreeViewRecord,
} from './tree-view.types'

export type TreeChildren = (node: TreeViewNode) => readonly TreeViewNode[] | undefined
export function treeRecords(nodes: readonly TreeViewNode[], children: TreeChildren) {
  const records = new Map<TreeViewKey, TreeViewRecord>()
  function visit(
    list: readonly TreeViewNode[],
    parent: TreeViewKey | null,
    level: number,
    disabled: boolean,
  ) {
    list.forEach((node, index) => {
      records.set(node.key, {
        node,
        parent,
        level,
        position: index + 1,
        size: list.length,
        disabled: disabled || node.disabled === true,
      })
      const nested = children(node)
      if (nested) visit(nested, node.key, level + 1, disabled || node.disabled === true)
    })
  }
  visit(nodes, null, 1, false)
  return records
}
export function visibleTreeRecords(
  records: ReadonlyMap<TreeViewKey, TreeViewRecord>,
  expanded: ReadonlySet<TreeViewKey>,
) {
  return Array.from(records.values()).filter((record) => {
    let parent = record.parent
    while (parent !== null) {
      if (!expanded.has(parent)) return false
      parent = records.get(parent)?.parent ?? null
    }
    return true
  })
}
export function isTreeBranch(node: TreeViewNode, children: TreeChildren) {
  const nested = children(node)
  return nested ? nested.length > 0 : node.hasChildren === true
}
export function completeTree(node: TreeViewNode, children: TreeChildren): boolean {
  const nested = children(node)
  return nested ? nested.every((child) => completeTree(child, children)) : node.hasChildren !== true
}
interface CheckSummary {
  complete: boolean
  target: boolean
  hasTargets: boolean
  state: TreeViewCheckState
}
function summarizeChecks(
  node: TreeViewNode,
  checked: ReadonlySet<TreeViewKey>,
  children: TreeChildren,
  cache?: Map<TreeViewKey, CheckSummary>,
): CheckSummary {
  const cached = cache?.get(node.key)
  if (cached) return cached
  const nested = children(node)
  const summaries = nested?.map((child) => summarizeChecks(child, checked, children, cache))
  const complete = summaries ? summaries.every((child) => child.complete) : !node.hasChildren
  const eligible = summaries?.filter((child) => child.target) ?? []
  const own = node.checkable !== false && checked.has(node.key)
  const result: CheckSummary = {
    complete,
    target: !node.disabled && (node.checkable !== false || eligible.length > 0),
    hasTargets: eligible.length > 0,
    state:
      node.disabled || !complete || !eligible.length
        ? own
          ? 'checked'
          : 'unchecked'
        : eligible.every((child) => child.state === 'checked')
          ? 'checked'
          : own || eligible.some((child) => child.state !== 'unchecked')
            ? 'indeterminate'
            : 'unchecked',
  }
  cache?.set(node.key, result)
  return result
}
export function treeCheckState(
  node: TreeViewNode,
  checked: ReadonlySet<TreeViewKey>,
  children: TreeChildren,
  cascade: boolean,
  inheritedDisabled = false,
): TreeViewCheckState {
  const own = node.checkable !== false && checked.has(node.key)
  if (!cascade || inheritedDisabled || node.disabled) return own ? 'checked' : 'unchecked'
  return summarizeChecks(node, checked, children).state
}
export function updateTreeChecks(
  node: TreeViewNode,
  wanted: boolean,
  keys: readonly TreeViewKey[],
  records: ReadonlyMap<TreeViewKey, TreeViewRecord>,
  children: TreeChildren,
  cascade: boolean,
) {
  const next = new Set(keys)
  const affected = new Set<TreeViewKey>()
  const descend = cascade && completeTree(node, children)
  function visit(current: TreeViewNode) {
    if (current.disabled || records.get(current.key)?.disabled) return
    let ancestor: TreeViewKey | null = current.key
    while (ancestor !== null && !affected.has(ancestor)) {
      affected.add(ancestor)
      ancestor = records.get(ancestor)?.parent ?? null
    }
    if (current.checkable !== false) {
      if (wanted) next.add(current.key)
      else next.delete(current.key)
    }
    if (descend) for (const child of children(current) ?? []) visit(child)
  }
  visit(node)
  if (cascade) {
    const summaries = new Map<TreeViewKey, CheckSummary>()
    for (const record of Array.from(records.values()).reverse()) {
      if (!affected.has(record.node.key) || record.disabled || record.node.checkable === false)
        continue
      const summary = summarizeChecks(record.node, next, children, summaries)
      if (!summary.complete || !summary.hasTargets) continue
      // Ancestor keys reflect known descendant checks; a parent key never selects new children.
      if (summary.state === 'checked') next.add(record.node.key)
      else next.delete(record.node.key)
      summaries.delete(record.node.key)
    }
  }
  return Array.from(next)
}

export function validateTreeChildren(
  value: unknown,
  known: ReadonlySet<TreeViewKey>,
): asserts value is readonly TreeViewNode[] {
  const keys = new Set(known)
  function visit(list: unknown) {
    if (!Array.isArray(list)) throw new TypeError('TreeView loader must return an array of nodes.')
    for (const node of list) {
      if (
        !node ||
        typeof node.label !== 'string' ||
        !(
          typeof node.key === 'string' ||
          (typeof node.key === 'number' && Number.isFinite(node.key))
        )
      )
        throw new TypeError('TreeView loader returned an invalid node.')
      if (keys.has(node.key)) throw new Error('TreeView node keys must be unique across the tree.')
      keys.add(node.key)
      if (node.children !== undefined) visit(node.children)
    }
  }
  visit(value)
}
