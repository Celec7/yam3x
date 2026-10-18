import { enableAutoUnmount, mount } from '@vue/test-utils'
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
  expect(element.scrollTop).toBe(920)
  expect(windowed.items.value.at(-1)?.key).toBe(99)
  sizes.set(99, 30)
  observers.at(-1)!.notify([wrapper.get('[data-key="99"]').element])
  await nextTick()
  expect(element.scrollTop).toBe(940)
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: 88 })
  observers.at(-1)!.notify([element])
  await nextTick()
  expect(element.scrollTop).toBe(960)
  const observer = observers.at(-1)!
  wrapper.unmount()
  expect(observer.disconnected).toBe(true)
  expect(element.style.overflowAnchor).toBe('auto')
})
