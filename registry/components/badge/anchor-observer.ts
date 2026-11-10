type AnchorRoot = Document | ShadowRoot

type Subscription = {
  id: string
  ancestors: Element[]
  notify: () => void
}

type RootState = {
  observer: MutationObserver
  ids: Map<string, Set<Subscription>>
  ancestors: WeakMap<Element, Set<Subscription>>
}

const roots = new WeakMap<AnchorRoot, RootState>()

function updateAncestors(root: AnchorRoot, state: RootState, subscription: Subscription) {
  for (const ancestor of subscription.ancestors) {
    state.ancestors.get(ancestor)?.delete(subscription)
  }
  subscription.ancestors = []
  let ancestor: Element | null = root.getElementById(subscription.id)
  while (ancestor) {
    let subscriptions = state.ancestors.get(ancestor)
    if (!subscriptions) {
      subscriptions = new Set()
      state.ancestors.set(ancestor, subscriptions)
    }
    subscriptions.add(subscription)
    subscription.ancestors.push(ancestor)
    ancestor = ancestor.parentElement
  }
}

function createRootState(root: AnchorRoot): RootState {
  const ids = new Map<string, Set<Subscription>>()
  const ancestors = new WeakMap<Element, Set<Subscription>>()
  const state: RootState = {
    ids,
    ancestors,
    observer: new MutationObserver((records) => {
      const affected = new Set<Subscription>()
      const collectId = (id: string | null) => {
        if (!id) return
        for (const subscription of ids.get(id) ?? []) affected.add(subscription)
      }
      const collectSubtree = (node: Node) => {
        if (!(node instanceof Element)) return
        collectId(node.id)
        // Only changed subtrees are searched, never the observed root or its subscribers.
        for (const element of node.querySelectorAll('[id]')) collectId(element.id)
      }
      for (const record of records) {
        if (record.type === 'childList') {
          for (const node of record.addedNodes) collectSubtree(node)
          for (const node of record.removedNodes) collectSubtree(node)
        } else if (record.attributeName === 'id') {
          collectId(record.oldValue)
          collectId((record.target as Element).id)
        } else {
          for (const subscription of ancestors.get(record.target as Element) ?? []) {
            affected.add(subscription)
          }
        }
      }
      for (const subscription of affected) {
        updateAncestors(root, state, subscription)
        subscription.notify()
      }
    }),
  }
  state.observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id', 'dir'],
    attributeOldValue: true,
  })
  return state
}

export function observeAnchor(root: AnchorRoot, id: string, notify: () => void): () => void {
  let state = roots.get(root)
  if (!state) {
    state = createRootState(root)
    roots.set(root, state)
  }
  const subscription: Subscription = { id, ancestors: [], notify }
  let subscriptions = state.ids.get(id)
  if (!subscriptions) {
    subscriptions = new Set()
    state.ids.set(id, subscriptions)
  }
  subscriptions.add(subscription)
  updateAncestors(root, state, subscription)
  let active = true
  return () => {
    if (!active) return
    active = false
    for (const ancestor of subscription.ancestors) {
      state.ancestors.get(ancestor)?.delete(subscription)
    }
    subscriptions.delete(subscription)
    if (!subscriptions.size) state.ids.delete(id)
    if (!state.ids.size) {
      state.observer.disconnect()
      roots.delete(root)
    }
  }
}
