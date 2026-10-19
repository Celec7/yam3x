import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { useVirtualList } from '../../../../registry/components/_shared/use-virtual-list'

enableAutoUnmount(afterEach)
afterEach(() => vi.unstubAllGlobals())
it('virtual.window.measurement: preserves the viewport anchor when measured heights change and releases observers', async () => {
  const observers: Observer[] = []
  class Observer {
    observed = new Set<Element>()
    disconnected = false
    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this)
    }
    observe(element: Element) {
      this.observed.add(element)
    }
    unobserve(element: Element) {
      this.observed.delete(element)
    }
    disconnect() {
      this.disconnected = true
      this.observed.clear()
    }
    notify(elements: Element[], blockSize?: number) {
      this.callback(
        elements.map((target) => ({
          target,
          contentRect: target.getBoundingClientRect(),
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
          borderBoxSize: blockSize === undefined ? [] : [{ blockSize, inlineSize: 0 }],
        })),
        this as unknown as ResizeObserver,
      )
    }
  }
  vi.stubGlobal('ResizeObserver', Observer)
  const keys = shallowRef(Array.from({ length: 100 }, (_, index) => index))
  const active = ref<number | null>(null)
  const sizes = new Map<number, number>()
  let windowed!: ReturnType<typeof useVirtualList<number>>
  let element!: HTMLElement
  const wrapper = mount(
    defineComponent({
      setup() {
        const scroller = ref<HTMLElement | null>(null)
        windowed = useVirtualList({
          keys: () => keys.value,
          scroller: () => scroller.value,
          enabled: () => true,
          options: () => ({ estimateSize: 10, overscan: 2 }),
          keepMounted: () => active.value,
        })
        return () =>
          h(
            'div',
            {
              ref: (node) => {
                if (!node || node === element) return
                element = node as HTMLElement
                Object.defineProperty(element, 'clientHeight', { configurable: true, value: 108 })
                element.style.overflowAnchor = 'auto'
                element.style.paddingTop = '4px'
                element.style.paddingBottom = '4px'
                scroller.value = element
              },
            },
            windowed.items.value.map((item) =>
              h(
                'div',
                {
                  key: item.key,
                  'data-key': item.key,
                  ref: (node) => {
                    const row = node as HTMLElement | null
                    if (row)
                      row.getBoundingClientRect = () =>
                        ({ height: sizes.get(item.key) ?? 10 }) as DOMRect
                    windowed.measure(item.key, row)
                  },
                },
                String(item.key),
              ),
            ),
          )
      },
    }),
    { attachTo: document.body },
  )
  await nextTick()
  expect(getComputedStyle(element).paddingTop).toBe('4px')
  expect(windowed.items.value.length).toBeLessThan(20)
  element.scrollTop = 50
  element.dispatchEvent(new Event('scroll'))
  await nextTick()
  // A transient scale transform changes the rect, but not the row's layout size.
  sizes.set(3, 15)
  const row = wrapper.get('[data-key="3"]').element
  observers.at(-1)!.notify([row], 30)
  await nextTick()
  expect(windowed.totalSize.value).toBe(1020)
  expect(element.scrollTop).toBe(70)
  active.value = 99
  await nextTick()
  expect(windowed.items.value.some((item) => item.key === 99)).toBe(true)
  expect(windowed.items.value.length).toBeLessThan(20)
  windowed.scrollToKey(99)
  await nextTick()
  expect(element.scrollTop).toBe(916)
  expect(windowed.items.value.at(-1)?.key).toBe(99)
  sizes.set(99, 30)
  observers.at(-1)!.notify([wrapper.get('[data-key="99"]').element])
  await nextTick()
  expect(element.scrollTop).toBe(936)
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: 88 })
  observers.at(-1)!.notify([element])
  await nextTick()
  expect(element.scrollTop).toBe(956)
  const observer = observers.at(-1)!
  wrapper.unmount()
  expect(observer.disconnected).toBe(true)
  expect(element.style.overflowAnchor).toBe('auto')
})

function mountWindow({ paddingTop = 0, paddingBottom = 0, height = 100 } = {}) {
  const keys = shallowRef(Array.from({ length: 100 }, (_, index) => index))
  const scroller = ref<HTMLElement | null>(null)
  let windowed!: ReturnType<typeof useVirtualList<number>>
  const wrapper = mount(
    defineComponent({
      setup() {
        windowed = useVirtualList({
          keys: () => keys.value,
          scroller: () => scroller.value,
          enabled: () => true,
          options: () => ({ estimateSize: 10, overscan: 0 }),
        })
        return () =>
          h(
            'div',
            {
              ref: (node) => {
                if (!node) return
                const element = node as HTMLElement
                Object.defineProperty(element, 'clientHeight', {
                  configurable: true,
                  value: height,
                })
                scroller.value = element
              },
              style: { paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` },
            },
            windowed.items.value.map((item) =>
              h(
                'div',
                {
                  key: item.key,
                  'data-key': item.key,
                  ref: (node) => windowed.measure(item.key, node as HTMLElement | null),
                },
                String(item.key),
              ),
            ),
          )
      },
    }),
    { attachTo: document.body },
  )
  return {
    wrapper,
    keys,
    windowed,
    get element() {
      return scroller.value!
    },
  }
}

it('virtual.window.coordinates: padding scrolls with content and overscan zero still includes every visible row', async () => {
  const fixture = mountWindow({ paddingTop: 20, paddingBottom: 30 })
  await nextTick()
  fixture.element.scrollTop = 43
  fixture.element.dispatchEvent(new Event('scroll'))
  await nextTick()
  // Content coordinates 23..123 intersect rows 2 through 12 in a 100px viewport.
  expect(fixture.windowed.items.value.map((item) => item.key)).toEqual(
    Array.from({ length: 11 }, (_, index) => index + 2),
  )
  fixture.windowed.scrollToKey(99)
  await nextTick()
  // The final row ends at 1020px, including leading padding; 100px remains visible.
  expect(fixture.element.scrollTop).toBe(920)
  fixture.element.scrollTop = 950
  fixture.element.dispatchEvent(new Event('scroll'))
  await nextTick()
  expect(fixture.windowed.items.value.map((item) => item.key)).toEqual([93, 94, 95, 96, 97, 98, 99])
})

async function scrolledWindow() {
  const fixture = mountWindow({ paddingTop: 20, paddingBottom: 30 })
  await flushPromises()
  fixture.element.scrollTop = 253
  fixture.element.dispatchEvent(new Event('scroll'))
  await flushPromises()
  return fixture
}
it('virtual.window.anchor: prepend and removal above the viewport retain the same record and row-relative offset', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = [
    ...Array.from({ length: 10 }, (_, index) => index - 10),
    ...fixture.keys.value,
  ]
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(353)
  expect(fixture.windowed.items.value[0]?.key).toBe(23)
  fixture.keys.value = fixture.keys.value.slice(5)
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(303)
  expect(fixture.windowed.items.value[0]?.key).toBe(23)
})
it('virtual.window.anchor: removing the anchor prefers the next surviving record at its start', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = fixture.keys.value.filter((key) => key !== 23)
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(250)
  expect(fixture.windowed.items.value[0]?.key).toBe(24)
})
it('virtual.window.anchor: falls back to the preceding survivor or the start of a wholly new collection', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = [
    ...fixture.keys.value.slice(0, 23),
    ...Array.from({ length: 100 }, (_, index) => index + 200),
  ]
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(240)
  expect(fixture.windowed.items.value[0]?.key).toBe(22)
  fixture.keys.value = Array.from({ length: 100 }, (_, index) => index + 400)
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(0)
})
it('virtual.window.anchor: coalesces synchronous data updates around the original visible record', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = [-2, -1, ...fixture.keys.value]
  fixture.keys.value = [-4, -3, ...fixture.keys.value]
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(293)
  expect(fixture.windowed.items.value[0]?.key).toBe(23)
})
it('virtual.window.anchor: an explicit keyboard or search reveal wins over queued anchor restoration', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = [
    ...Array.from({ length: 10 }, (_, index) => index - 10),
    ...fixture.keys.value,
  ]
  fixture.windowed.scrollToKey(90)
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(930)
  expect(fixture.windowed.items.value.some((item) => item.key === 90)).toBe(true)
})

it('virtual.window.anchor: shrinking the current row clamps its internal offset instead of skipping the record', async () => {
  let notify!: ResizeObserverCallback
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  const fixture = await scrolledWindow()
  const row = fixture.wrapper.get('[data-key="23"]').element
  notify(
    [
      {
        target: row,
        borderBoxSize: [{ blockSize: 2, inlineSize: 100 }],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
        contentRect: row.getBoundingClientRect(),
      },
    ],
    {} as ResizeObserver,
  )
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(251)
  expect(fixture.windowed.items.value[0]?.key).toBe(23)
})

it('virtual.window.anchor: synchronous same-key metadata edits batch catalog work', async () => {
  const rows = ref(Array.from({ length: 50 }, (_, key) => ({ key, label: `Row ${key}` })))
  let reads = 0
  mount(
    defineComponent({
      setup() {
        useVirtualList({
          keys: () => {
            reads++
            return rows.value.filter((row) => row.label.length > 0).map((row) => row.key)
          },
          scroller: () => null,
          enabled: () => true,
          options: () => undefined,
        })
        return () => h('div')
      },
    }),
  )
  const before = reads
  for (const row of rows.value) row.label = `Updated ${row.key}`
  await flushPromises()
  expect(reads - before).toBeLessThan(5)
})
it('virtual.window.anchor: same-order metadata updates preserve subsequent anchoring', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = [...fixture.keys.value]
  await flushPromises()
  fixture.keys.value = [-1, ...fixture.keys.value]
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(263)
  expect(fixture.windowed.items.value[0]?.key).toBe(23)
})

it('virtual.window.navigation: a reveal after reconciliation overrides its pending post-render restoration', async () => {
  const fixture = await scrolledWindow()
  fixture.keys.value = [-2, -1, ...fixture.keys.value]
  await nextTick()
  fixture.windowed.scrollToKey(90)
  await flushPromises()
  expect(fixture.element.scrollTop).toBe(850)
})
it('virtual.window.anchor: unmount discards queued restoration and restores the scroller owner', async () => {
  const fixture = await scrolledWindow()
  const element = fixture.element
  fixture.keys.value = [-2, -1, ...fixture.keys.value]
  fixture.wrapper.unmount()
  await flushPromises()
  expect(element.scrollTop).toBe(253)
  expect(element.style.overflowAnchor).toBe('')
})
