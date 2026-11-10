import type {
  TreeViewCheckState,
  TreeViewKey,
  TreeViewNode,
  TreeViewRecord,
} from './tree-view.types'

export type TreeChildren = (node: TreeViewNode) => readonly TreeViewNode[] | undefined
export function treeRecords(nodes: readonly TreeViewNode[], children: TreeChildren) {
  const records = new Map<TreeViewKey, TreeViewRecord>()
  const stack = nodes
    .map((node, index) => ({
      node,
      parent: null as TreeViewKey | null,
      level: 1,
      position: index + 1,
      size: nodes.length,
      disabled: false,
    }))
    .reverse()
  while (stack.length) {
    const item = stack.pop()!
    item.disabled ||= item.node.disabled === true
    const disabled = item.disabled
    records.set(item.node.key, item)
    const nested = children(item.node)
    for (let index = (nested?.length ?? 0) - 1; index >= 0; index--)
      stack.push({
        node: nested![index]!,
        parent: item.node.key,
        level: item.level + 1,
        position: index + 1,
        size: nested!.length,
        disabled,
      })
  }
  return records
}
export function visibleTreeRecords(
  records: ReadonlyMap<TreeViewKey, TreeViewRecord>,
  expanded: ReadonlySet<TreeViewKey>,
) {
  const shown = new Set<TreeViewKey>()
  const visible: TreeViewRecord[] = []
  for (const record of records.values()) {
    if (record.parent !== null && !shown.has(record.parent)) continue
    visible.push(record)
    if (expanded.has(record.node.key)) shown.add(record.node.key)
  }
  return visible
}
export function isTreeBranch(node: TreeViewNode, children: TreeChildren) {
  const nested = children(node)
  return nested ? nested.length > 0 : node.hasChildren === true
}
interface CheckSummary {
  key: TreeViewKey
  parent: TreeViewKey | null
  order: number
  children: readonly TreeViewKey[]
  disabled: boolean
  inheritedDisabled: boolean
  checkable: boolean
  complete: boolean
  target: boolean
  targets: number
  checked: number
  active: number
  own: boolean
  state: TreeViewCheckState
}

/** Instance-owned summaries; rebuild when the record topology or node check flags change. */
export function createTreeChecks(
  records: ReadonlyMap<TreeViewKey, TreeViewRecord>,
  children: TreeChildren,
) {
  const summaries = new Map<TreeViewKey, CheckSummary>()
  let checked = new Set<TreeViewKey>()
  for (const record of records.values()) {
    const nested = children(record.node)
    summaries.set(record.node.key, {
      key: record.node.key,
      parent: record.parent,
      order: summaries.size,
      children: nested?.map((node) => node.key) ?? [],
      disabled: record.node.disabled === true,
      inheritedDisabled: record.disabled,
      checkable: record.node.checkable !== false,
      complete: nested !== undefined || !record.node.hasChildren,
      target: false,
      targets: 0,
      checked: 0,
      active: 0,
      own: false,
      state: 'unchecked',
    })
  }
  function derive(summary: CheckSummary): TreeViewCheckState {
    if (summary.disabled || !summary.complete || !summary.targets)
      return summary.own ? 'checked' : 'unchecked'
    if (summary.checked === summary.targets) return 'checked'
    return summary.own || summary.active ? 'indeterminate' : 'unchecked'
  }
  for (const summary of [...summaries.values()].reverse()) {
    summary.target = !summary.disabled && (summary.checkable || summary.targets > 0)
    const parent = summary.parent === null ? undefined : summaries.get(summary.parent)
    if (parent) {
      parent.complete &&= summary.complete
      if (summary.target) parent.targets++
    }
  }
  function affect(summary: CheckSummary, affected: Set<CheckSummary>) {
    let current: CheckSummary | undefined = summary
    while (current && !affected.has(current)) {
      affected.add(current)
      current = current.parent === null ? undefined : summaries.get(current.parent)
    }
  }
  function refresh(summary: CheckSummary) {
    const previous = summary.state
    summary.state = derive(summary)
    if (!summary.target || summary.state === previous || summary.parent === null) return
    const parent = summaries.get(summary.parent)!
    parent.checked += Number(summary.state === 'checked') - Number(previous === 'checked')
    parent.active += Number(summary.state !== 'unchecked') - Number(previous !== 'unchecked')
  }
  function apply(next: Set<TreeViewKey>, affected = new Set<CheckSummary>(), normalize = false) {
    for (const key of checked) {
      if (next.has(key)) continue
      const summary = summaries.get(key)
      if (!summary) continue
      summary.own = false
      affect(summary, affected)
    }
    for (const key of next) {
      if (checked.has(key)) continue
      const summary = summaries.get(key)
      if (!summary) continue
      summary.own = summary.checkable
      affect(summary, affected)
    }
    for (const summary of [...affected].sort((left, right) => right.order - left.order)) {
      refresh(summary)
      if (
        normalize &&
        !summary.inheritedDisabled &&
        summary.checkable &&
        summary.complete &&
        summary.targets > 0
      ) {
        // A stored parent key never selects newly added descendants.
        summary.own = summary.state === 'checked'
        if (summary.own) next.add(summary.key)
        else next.delete(summary.key)
        refresh(summary)
      }
    }
    checked = next
  }
  return {
    sync(keys: ReadonlySet<TreeViewKey>) {
      apply(new Set(keys))
    },
    state(key: TreeViewKey, cascade: boolean): TreeViewCheckState {
      const summary = summaries.get(key)!
      return cascade && !summary.inheritedDisabled
        ? summary.state
        : summary.own
          ? 'checked'
          : 'unchecked'
    },
    update(key: TreeViewKey, wanted: boolean, cascade: boolean) {
      const previous = checked
      const next = new Set(checked)
      const root = summaries.get(key)!
      const descend = cascade && root.complete
      const pending = [root]
      const affected = new Set<CheckSummary>()
      while (pending.length) {
        const summary = pending.pop()!
        if (summary.inheritedDisabled) continue
        affect(summary, affected)
        if (summary.checkable) {
          if (wanted) next.add(summary.key)
          else next.delete(summary.key)
        }
        if (descend)
          for (let index = summary.children.length - 1; index >= 0; index--)
            pending.push(summaries.get(summary.children[index]!)!)
      }
      apply(next, affected, cascade)
      const result = [...next]
      // Controlled models may reject the emitted value.
      apply(previous)
      return result
    },
  }
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
