import { flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { observeAnchor } from '../../../../registry/components/badge/anchor-observer'

const cleanup: Array<() => void> = []
afterEach(() => {
  while (cleanup.length) cleanup.pop()!()
})
function host() {
  const element = document.createElement('div')
  document.body.append(element)
  cleanup.push(() => element.remove())
  return element
}
function subscribe(root: Document | ShadowRoot, id: string, notify: () => void) {
  const stop = observeAnchor(root, id, notify)
  cleanup.push(stop)
  return stop
}

it('ignores unrelated mutations and notifies only the affected badge anchors', async () => {
  const container = host()
  const notifications = new Set<number>()
  for (let index = 0; index < 50; index++) {
    const anchor = document.createElement('button')
    anchor.id = `badge-anchor-${index}`
    container.append(anchor)
    subscribe(document, anchor.id, () => notifications.add(index))
  }
  await flushPromises()
  notifications.clear()
  const unrelated = document.createElement('span')
  container.append(unrelated)
  for (let index = 0; index < 10; index++) {
    unrelated.replaceChildren(document.createTextNode(String(index)))
    await flushPromises()
  }
  expect([...notifications]).toEqual([])

  container.querySelector('#badge-anchor-25')!.id = 'unrelated-id'
  await flushPromises()
  expect([...notifications]).toEqual([25])
})

it('follows late anchors, ancestor direction, reparenting, replacement and ID changes', async () => {
  const container = host()
  const notify = vi.fn()
  subscribe(document, 'badge-late-anchor', notify)
  const parent = document.createElement('div')
  const anchor = document.createElement('button')
  anchor.id = 'badge-late-anchor'
  parent.append(anchor)
  container.append(parent)
  await flushPromises()
  expect(notify).toHaveBeenCalledTimes(1)
  notify.mockClear()

  parent.dir = 'rtl'
  await flushPromises()
  expect(notify).toHaveBeenCalledTimes(1)
  const otherParent = document.createElement('div')
  container.append(otherParent)
  otherParent.append(anchor)
  await flushPromises()
  notify.mockClear()
  parent.dir = 'ltr'
  await flushPromises()
  expect(notify).not.toHaveBeenCalled()
  otherParent.dir = 'rtl'
  await flushPromises()
  expect(notify).toHaveBeenCalledTimes(1)
  notify.mockClear()

  const replacement = document.createElement('button')
  replacement.id = anchor.id
  anchor.replaceWith(replacement)
  await flushPromises()
  expect(notify).toHaveBeenCalledTimes(1)
  notify.mockClear()
  replacement.id = 'renamed-anchor'
  await flushPromises()
  expect(notify).toHaveBeenCalledTimes(1)
})

it('isolates shadow roots and releases subscriptions before queued mutations are delivered', async () => {
  const container = host()
  const shadow = container.attachShadow({ mode: 'open' })
  const documentNotify = vi.fn()
  const shadowNotify = vi.fn()
  subscribe(document, 'badge-isolated-anchor', documentNotify)
  const stop = subscribe(shadow, 'badge-isolated-anchor', shadowNotify)
  const anchor = document.createElement('button')
  anchor.id = 'badge-isolated-anchor'
  shadow.append(anchor)
  await flushPromises()
  expect(shadowNotify).toHaveBeenCalledTimes(1)
  expect(documentNotify).not.toHaveBeenCalled()
  shadowNotify.mockClear()

  anchor.remove()
  stop()
  await flushPromises()
  expect(shadowNotify).not.toHaveBeenCalled()
  const replacementNotify = vi.fn()
  subscribe(shadow, 'badge-isolated-anchor', replacementNotify)
  shadow.append(anchor)
  await flushPromises()
  expect(replacementNotify).toHaveBeenCalledTimes(1)
  expect(documentNotify).not.toHaveBeenCalled()
})
