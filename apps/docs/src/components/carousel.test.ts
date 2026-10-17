import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Carousel from '../../../../registry/components/carousel/carousel.vue'
import type { CarouselItem } from '../../../../registry/components/carousel/carousel.types'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Carousel keyboard interactions', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('emits activation for a focused link with Space while preserving native link behavior', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    const items: CarouselItem[] = [{ key: 'details', label: 'Details', href: '/details' }]
    const wrapper = mount(Carousel, {
      props: { items, label: 'Places', layout: 'uncontained' },
    })
    const link = wrapper.get('a')
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })

    link.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(link.attributes('href')).toBe('/details')
    expect(wrapper.emitted('activate')?.[0]?.[0]).toMatchObject({
      key: 'details',
      href: '/details',
    })
    wrapper.unmount()
  })

  it('does not take arrow keys away from controls inside a slide', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    const items: CarouselItem[] = [
      { key: 'details', label: 'Details' },
      { key: 'more', label: 'More' },
    ]
    const wrapper = mount(Carousel, {
      props: { items, label: 'Places', layout: 'uncontained' },
      slots: { default: '<button type="button">Nested action</button>' },
    })
    const nestedButton = wrapper.get('button')
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })

    nestedButton.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('skips disabled slides when navigating with arrow keys', () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    const items: CarouselItem[] = [
      { key: 'first', label: 'First' },
      { key: 'disabled', label: 'Disabled', disabled: true, actionable: true },
      { key: 'last', label: 'Last' },
    ]
    const wrapper = mount(Carousel, {
      props: { items, label: 'Places', layout: 'uncontained' },
      attachTo: document.body,
    })
    const slides = wrapper.findAll('[data-carousel-index]')
    ;(slides[0]!.element as HTMLElement).focus()
    slides[0]!.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    )

    expect(document.activeElement).toBe(slides[2]!.element)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2, items[2]])
    slides[2]!.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }),
    )
    expect(document.activeElement).toBe(slides[0]!.element)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([0, items[0]])
    wrapper.unmount()
  })

  it('renders actionable items as buttons and emits their activation', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    const item: CarouselItem = { key: 'save', label: 'Save', actionable: true }
    const wrapper = mount(Carousel, {
      props: { items: [item], label: 'Places', layout: 'uncontained' },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('activate')?.[0]?.slice(0, 2)).toEqual([item, 0])
    wrapper.unmount()
  })

  it('treats numeric sizing props as CSS pixels and preserves zero padding', () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    const wrapper = mount(Carousel, {
      props: {
        items: [{ key: 'coast', label: 'Coast' }],
        label: 'Places',
        layout: 'uncontained',
        itemWidth: 240,
        itemSpacing: 12,
        contentPadding: 0,
      },
    })
    const track = wrapper.get('.yam3x-carousel__track').element as HTMLElement

    expect(track.style.getPropertyValue('--_yam3x-carousel-item-spacing')).toBe('12px')
    expect(track.style.padding).toBe('0px')
    wrapper.unmount()
  })
})
