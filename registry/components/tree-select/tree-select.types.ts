import type { TreeViewNode } from '../tree-view/tree-view.types'

export interface TreeSelectNode extends Omit<TreeViewNode, 'key' | 'children' | 'checkable'> {
  key: string
  children?: readonly TreeSelectNode[]
}
export type TreeSelectLoader = (
  node: Readonly<TreeSelectNode>,
  context: { signal: AbortSignal },
) => Promise<readonly TreeSelectNode[]>
