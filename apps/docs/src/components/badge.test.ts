import { afterEach, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import Badge from '../../../../registry/components/badge/badge.vue'

enableAutoUnmount(afterEach)
const hosts: HTMLElement[] = []
afterEach(() => {
  for (const host of hosts.splice(0)) host.remove()
  vi.restoreAllMocks()
})

function host() {
  const element = document.createElement('div')
  document.body.append(element)
  hosts.push(element)
  return element
}

async function settle() {
  await new Promise<void>((resolve) => {
    const probe = document.createTextNode('')
    const observer = new MutationObserver(() => {
      observer.disconnect()
      resolve()
    })
    observer.observe(probe, { characterData: true })
    probe.data = 'ready'
  })
  await nextTick()
  await flushPromises()
}

function trackGeometry() {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    return DOMRect.fromRect({
      x: this.tagName === 'BUTTON' ? 100 : 0,
      y: this.tagName === 'BUTTON' ? 100 : 0,
      width: this.tagName === 'BUTTON' ? 40 : 16,
      height: this.tagName === 'BUTTON' ? 40 : 16,
    })
  })
}

it.each([false, true])(
  'does not reread 50 badge labels or geometry for unrelated mutations (attached: %s)',
  async (attached) => {
    const target = host()
    const unrelated = host()
    const geometryReads = trackGeometry()
    const wrapper = mount(
      {
        render: () =>
          h('div', [
            h('button', { id: 'badge-performance-anchor' }),
            ...Array.from({ length: 50 }, (_, index) =>
              h(
                Badge,
                { for: attached ? 'badge-performance-anchor' : undefined, key: index },
                () => '7',
              ),
            ),
          ]),
      },
      { attachTo: target },
    )
    await settle()
    const labelReads = wrapper
      .findAll('.yam3x-badge__content')
      .map((content) => vi.spyOn(content.element, 'textContent', 'get'))
    geometryReads.mockClear()
    for (let index = 0; index < 10; index++) {
      const child = document.createElement('span')
      child.id = `unrelated-${index}`
      unrelated.append(child)
      unrelated.dir = index % 2 ? 'rtl' : 'ltr'
      await settle()
      child.id += '-renamed'
      child.remove()
      await settle()
    }
    for (const read of labelReads) expect(read).not.toHaveBeenCalled()
    expect(geometryReads).not.toHaveBeenCalled()
  },
)

it('finds late anchors, follows replacement and id changes, and switches the for target', async () => {
  const target = host()
  trackGeometry()
  const wrapper = mount(Badge, {
    attachTo: target,
    props: { for: 'badge-late-anchor' },
    slots: { default: '8' },
  })
  await settle()
  expect(wrapper.attributes('data-positioned')).toBeUndefined()

  const anchor = document.createElement('button')
  anchor.id = 'badge-late-anchor'
  target.append(anchor)
  await settle()
  await vi.waitFor(() => expect(wrapper.attributes('data-positioned')).toBe(''))

  anchor.id = 'badge-renamed-anchor'
  await settle()
  await vi.waitFor(() => expect(wrapper.attributes('data-positioned')).toBeUndefined())
  await wrapper.setProps({ for: 'badge-renamed-anchor' })
  await settle()
  await vi.waitFor(() => expect(wrapper.attributes('data-positioned')).toBe(''))

  const replacement = document.createElement('button')
  replacement.id = anchor.id
  anchor.replaceWith(replacement)
  await settle()
  await vi.waitFor(() => expect(wrapper.attributes('data-positioned')).toBe(''))
  replacement.remove()
  await settle()
  await vi.waitFor(() => expect(wrapper.attributes('data-positioned')).toBeUndefined())

  await wrapper.setProps({ for: undefined })
  await settle()
  expect(wrapper.element.style.left).toBe('')
  expect(wrapper.element.style.top).toBe('')
})

it('updates only badges whose anchor inherits the changed direction', async () => {
  const target = host()
  const reads = trackGeometry()
  const wrapper = mount(
    {
      render: () =>
        h('div', [
          h('section', { class: 'first-ancestor', dir: 'ltr', style: { direction: 'ltr' } }, [
            h('button', { id: 'badge-first-anchor' }),
          ]),
          h('section', { class: 'second-ancestor', dir: 'ltr' }, [
            h('button', { id: 'badge-second-anchor' }),
          ]),
          h(Badge, { for: 'badge-first-anchor', position: 'after' }),
          h(Badge, { for: 'badge-second-anchor', position: 'after' }),
        ]),
    },
    { attachTo: target },
  )
  await settle()
  reads.mockClear()
  const ancestor = wrapper.get<HTMLElement>('.first-ancestor').element
  ancestor.style.direction = 'rtl'
  ancestor.dir = 'rtl'
  await settle()
  await vi.waitFor(() =>
    expect(reads.mock.instances).toContain(wrapper.get('#badge-first-anchor').element),
  )
  expect(reads.mock.instances).not.toContain(wrapper.get('#badge-second-anchor').element)
})

it('keeps anchors isolated to their shadow root and releases an unmounted root', async () => {
  const outer = host()
  const shadowHost = host()
  const shadow = shadowHost.attachShadow({ mode: 'open' })
  const target = document.createElement('div')
  shadow.append(target)
  const outsideAnchor = document.createElement('button')
  outsideAnchor.id = 'badge-shadow-anchor'
  outer.append(outsideAnchor)
  const reads = trackGeometry()
  const wrapper = mount(Badge, { attachTo: target, props: { for: outsideAnchor.id } })
  await settle()
  expect(wrapper.attributes('data-positioned')).toBeUndefined()

  const insideAnchor = document.createElement('button')
  insideAnchor.id = outsideAnchor.id
  shadow.append(insideAnchor)
  await settle()
  await vi.waitFor(() => expect(wrapper.attributes('data-positioned')).toBe(''))
  reads.mockClear()
  outsideAnchor.remove()
  await settle()
  expect(wrapper.attributes('data-positioned')).toBe('')
  expect(reads).not.toHaveBeenCalled()

  wrapper.unmount()
  reads.mockClear()
  insideAnchor.id = 'badge-unmounted-anchor'
  insideAnchor.remove()
  await settle()
  expect(reads).not.toHaveBeenCalled()

  const remounted = mount(Badge, { attachTo: target, props: { for: 'badge-remounted-anchor' } })
  const newAnchor = document.createElement('button')
  newAnchor.id = 'badge-remounted-anchor'
  shadow.append(newAnchor)
  await settle()
  await vi.waitFor(() => expect(remounted.attributes('data-positioned')).toBe(''))
})

it('keeps remaining subscribers live after another badge unmounts', async () => {
  const target = host()
  trackGeometry()
  const first = mount(Badge, { attachTo: target, props: { for: 'badge-shared-anchor' } })
  const second = mount(Badge, { attachTo: target, props: { for: 'badge-shared-anchor' } })
  first.unmount()
  const anchor = document.createElement('button')
  anchor.id = 'badge-shared-anchor'
  target.append(anchor)
  await settle()
  await vi.waitFor(() => expect(second.attributes('data-positioned')).toBe(''))
  anchor.remove()
  await settle()
  await vi.waitFor(() => expect(second.attributes('data-positioned')).toBeUndefined())
})

it('keeps reactive and externally edited slot labels up to date', async () => {
  const label = ref('')
  const wrapper = mount({ render: () => h(Badge, null, () => label.value) })
  await settle()
  expect(wrapper.get('.yam3x-badge').classes()).toContain('yam3x-badge--small')
  label.value = '999+'
  await settle()
  expect(wrapper.get('.yam3x-badge').classes()).toContain('yam3x-badge--large')
  expect(wrapper.get('.yam3x-badge').attributes('data-long-label')).toBe('')
  wrapper.get('.yam3x-badge__content').element.replaceChildren(document.createTextNode(' '))
  await settle()
  expect(wrapper.get('.yam3x-badge').classes()).toContain('yam3x-badge--small')
  expect(wrapper.get('.yam3x-badge').attributes('aria-label')).toBe('New notification')
})
