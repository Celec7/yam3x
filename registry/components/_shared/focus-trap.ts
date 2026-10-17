function isEditable(element: HTMLElement): boolean {
  return (
    element.isContentEditable ||
    (element.hasAttribute('contenteditable') && element.getAttribute('contenteditable') !== 'false')
  )
}

function canReceiveSequentialFocus(element: HTMLElement, ancestors: readonly Element[]): boolean {
  if (
    element.matches(':disabled, [disabled], input[type="hidden"]') ||
    (element.tabIndex < 0 && !isEditable(element))
  )
    return false
  if (
    ancestors.some((ancestor) =>
      ancestor.matches('[hidden], [inert], [aria-hidden="true"], :disabled, [disabled]'),
    )
  )
    return false

  for (const current of [...ancestors, element]) {
    const style = getComputedStyle(current)
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse' ||
      style.contentVisibility === 'hidden'
    )
      return false
    if (current.localName === 'details' && !current.hasAttribute('open')) {
      const summary = current.querySelector<HTMLElement>(':scope > summary')
      if (!summary || (element !== summary && !summary.contains(element))) return false
    }
  }
  return true
}

function visitChildren(
  root: Element | ShadowRoot,
  ancestors: readonly Element[],
  result: HTMLElement[],
): void {
  for (const node of root.children) visitElement(node, ancestors, result)
}

function visitElement(
  element: Element,
  ancestors: readonly Element[],
  result: HTMLElement[],
): void {
  const htmlElement = element instanceof HTMLElement ? element : null
  if (
    htmlElement &&
    (htmlElement.tabIndex >= 0 ||
      isEditable(htmlElement) ||
      htmlElement.shadowRoot?.delegatesFocus) &&
    canReceiveSequentialFocus(htmlElement, ancestors)
  ) {
    result.push(htmlElement)
  }

  const currentAncestors = [...ancestors, element]
  if (element instanceof HTMLSlotElement) {
    const assigned = element.assignedElements({ flatten: true })
    if (assigned.length) for (const child of assigned) visitElement(child, currentAncestors, result)
    else visitChildren(element, currentAncestors, result)
  } else if (element.shadowRoot) {
    visitChildren(element.shadowRoot, currentAncestors, result)
  } else {
    visitChildren(element, currentAncestors, result)
  }
}

function radioGroupKey(input: HTMLInputElement): string | null {
  if (input.type !== 'radio' || !input.name) return null
  const rootId = getRootId(input.getRootNode())
  const formId = input.form ? getRootId(input.form) : 'no-form'
  return `${rootId}:${formId}:${input.name}`
}

const rootIds = new WeakMap<object, number>()
let nextRootId = 0
function getRootId(root: object): number {
  let id = rootIds.get(root)
  if (id === undefined) {
    id = ++nextRootId
    rootIds.set(root, id)
  }
  return id
}

/** Returns sequentially focusable descendants in composed DOM order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = []
  if (container.shadowRoot) visitChildren(container.shadowRoot, [container], result)
  else visitChildren(container, [container], result)

  const radios = new Map<string, HTMLInputElement[]>()
  for (const element of result) {
    if (!(element instanceof HTMLInputElement)) continue
    const key = radioGroupKey(element)
    if (!key) continue
    const group = radios.get(key) ?? []
    group.push(element)
    radios.set(key, group)
  }

  const radioSlots = new Map<string, { first: HTMLInputElement; selected: HTMLInputElement }>()
  for (const group of radios.values()) {
    const tabbableRadio = group.find((radio) => radio.checked) ?? group[0]
    const first = group[0]
    if (first && tabbableRadio)
      radioSlots.set(radioGroupKey(first)!, { first, selected: tabbableRadio })
  }

  const ordered: HTMLElement[] = []
  const emittedRadioGroups = new Set<string>()
  for (const element of result) {
    if (element instanceof HTMLInputElement) {
      const key = radioGroupKey(element)
      const slot = key ? radioSlots.get(key) : undefined
      if (slot) {
        if (element === slot.first && !emittedRadioGroups.has(key!)) {
          ordered.push(slot.selected)
          emittedRadioGroups.add(key!)
        }
        continue
      }
    }
    ordered.push(element)
  }
  return ordered
    .map((element, order) => ({ element, order }))
    .sort((left, right) => {
      const leftIndex = left.element.tabIndex > 0 ? left.element.tabIndex : Number.POSITIVE_INFINITY
      const rightIndex =
        right.element.tabIndex > 0 ? right.element.tabIndex : Number.POSITIVE_INFINITY
      return leftIndex - rightIndex || left.order - right.order
    })
    .map(({ element }) => element)
}

function deepActiveElement(document: Document): Element | null {
  let active: Element | null = document.activeElement
  while (active instanceof HTMLElement && active.shadowRoot?.activeElement)
    active = active.shadowRoot.activeElement
  return active
}

/** Keeps a modal Tab sequence inside its container. */
export function trapTabKey(event: KeyboardEvent, container: HTMLElement): void {
  if (
    event.key !== 'Tab' ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.defaultPrevented
  )
    return
  const tabbable = getTabbableElements(container)
  if (!tabbable.length) {
    event.preventDefault()
    container.focus({ preventScroll: true })
    return
  }

  const active = deepActiveElement(container.ownerDocument)
  const activeIndex = active ? tabbable.indexOf(active as HTMLElement) : -1
  const destination = event.shiftKey
    ? activeIndex <= 0
      ? tabbable.at(-1)
      : undefined
    : activeIndex === -1 || activeIndex === tabbable.length - 1
      ? tabbable[0]
      : undefined
  if (!destination) return
  event.preventDefault()
  destination.focus({ preventScroll: true })
}
