import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from '../../../../registry/components/breadcrumb'

describe('Breadcrumb', () => {
  it('renders a labelled native navigation list and marks the last entry current by default', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'Current' },
        ],
      },
    })

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Breadcrumb')
    expect(wrapper.find('nav ol')?.exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.get('a[href="/reports"]').attributes('aria-current')).toBeUndefined()
    expect(wrapper.get('li:last-child > .yam3x-breadcrumb__item').attributes('aria-current')).toBe(
      'page',
    )
    expect(wrapper.findAll('.yam3x-breadcrumb__separator')).toHaveLength(2)
    expect(wrapper.findAll('.yam3x-breadcrumb__separator[aria-hidden="true"]')).toHaveLength(2)
    wrapper.unmount()
  })

  it('keeps current destinations as native current links and renders disabled items as non-links', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        ariaLabel: 'Page path',
        ariaLabelledby: 'visible-title',
        currentIndex: 1,
        items: [
          { label: 'Home', href: '/', target: '_self' },
          { label: 'Current', href: '/current' },
          { label: 'Unavailable', href: '/unavailable', disabled: true },
        ],
      },
    })

    const nav = wrapper.get('nav')
    expect(nav.attributes('aria-labelledby')).toBe('visible-title')
    expect(nav.attributes('aria-label')).toBeUndefined()
    expect(wrapper.get('a[href="/current"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('li:nth-child(3) .yam3x-breadcrumb__item').attributes('aria-disabled')).toBe(
      'true',
    )
    expect(wrapper.find('a[href="/unavailable"]').exists()).toBe(false)
    expect(
      wrapper.get('li:nth-child(3) .yam3x-breadcrumb__item').attributes('tabindex'),
    ).toBeUndefined()
    wrapper.unmount()
  })

  it('reacts to item/current changes and treats invalid current indices as no current page', async () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: 'A', href: '/a' }, { label: 'B' }] },
    })
    expect(wrapper.get('li:last-child .yam3x-breadcrumb__item').attributes('aria-current')).toBe(
      'page',
    )

    await wrapper.setProps({
      currentIndex: -1,
      items: [{ label: 'A', href: '/a' }, { label: 'B', href: '/b' }, { label: 'C' }],
    })
    await nextTick()
    expect(wrapper.find('[aria-current="page"]').exists()).toBe(false)
    expect(wrapper.findAll('li')).toHaveLength(3)

    await wrapper.setProps({ currentIndex: 99 })
    expect(wrapper.find('[aria-current="page"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('provides scoped slot data and keeps decorative icon/separator content hidden from assistive technology', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: 'Home', href: '/', iconOnly: true }, { label: 'Current' }] },
      slots: {
        icon: '<svg data-test="icon" />',
        separator: '<span data-test="separator">/</span>',
        item: (slotProps: { item: { label: string }; current: boolean }) =>
          h('strong', `${slotProps.item.label}${slotProps.current ? ' current' : ''}`),
      },
    })

    expect(
      wrapper
        .get('a[aria-label="Home"]')
        .get('[aria-hidden="true"]')
        .find('[data-test="icon"]')
        .exists(),
    ).toBe(true)
    expect(
      wrapper.get('a[aria-label="Home"]').get('.yam3x-breadcrumb__label').attributes('aria-hidden'),
    ).toBe('true')
    expect(
      wrapper
        .get('.yam3x-breadcrumb__separator[aria-hidden="true"]')
        .get('[data-test="separator"]')
        .text(),
    ).toBe('/')
    expect(wrapper.get('li:last-child strong').text()).toBe('Current current')
    wrapper.unmount()
  })

  it('keeps an icon-only non-link current item named without hiding its label', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: 'Current section', iconOnly: true }] },
      slots: { icon: '<svg data-test="icon" />' },
    })

    const current = wrapper.get('.yam3x-breadcrumb__item--current')
    expect(current.attributes('aria-current')).toBe('page')
    expect(current.attributes('aria-label')).toBe('Current section')
    expect(current.get('.yam3x-breadcrumb__label').attributes('aria-hidden')).toBeUndefined()
    wrapper.unmount()
  })
})
