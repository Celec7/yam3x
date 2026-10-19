import { validateTreeChildren } from '../tree-view/tree-view.utils'
import type { TreeSelectNode } from './tree-select.types'

export function validateTreeSelectNodes(nodes: readonly TreeSelectNode[]) {
  validateTreeChildren(nodes, new Set())
  function visit(list: readonly TreeSelectNode[]) {
    for (const node of list) {
      if (typeof node.key !== 'string' || !node.key.length)
        throw new TypeError('TreeSelect keys must be non-empty strings.')
      if (node.children) visit(node.children)
    }
  }
  visit(nodes)
}

/** Matching records retain their ancestors, not unrelated descendants. */
export function filterTreeSelectNodes(
  nodes: readonly TreeSelectNode[],
  query: string,
  locale: string,
): TreeSelectNode[] {
  const needle = query.trim().toLocaleLowerCase(locale)
  return nodes.flatMap((node) => {
    const children = node.children ? filterTreeSelectNodes(node.children, query, locale) : undefined
    if (!node.label.toLocaleLowerCase(locale).includes(needle) && !children?.length) return []
    return [children ? { ...node, children } : node]
  })
}
