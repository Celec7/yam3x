import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '../../../../registry/components/heading/heading.vue'

describe('Heading', () => {
  it('defaults to a non-semantic block and opts into native heading levels', async () => {
    const wrapper = mount(Heading, { attrs: { id: 'title' }, slots: { default: 'Page title' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('id')).toBe('title')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-level')).toBeUndefined()
    expect(wrapper.text()).toBe('Page title')

    await wrapper.setProps({ level: 2 })
    expect(wrapper.element.tagName).toBe('H2')
    await wrapper.setProps({ level: 6 })
    expect(wrapper.element.tagName).toBe('H6')
    await wrapper.setProps({ level: undefined })
    expect(wrapper.element.tagName).toBe('SPAN')
    wrapper.unmount()

    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const heading = mount(Heading, { props: { level } })
      expect(heading.element.tagName).toBe(`H${level}`)
      heading.unmount()
    }
  })

  it('falls back for invalid runtime variant, size, and level values', () => {
    const wrapper = mount(Heading, {
      props: { variant: 'unknown' as never, size: 'huge' as never, level: 7 as never },
    })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('style')).toContain('--md-sys-typescale-display-medium-font-size')
    wrapper.unmount()
  })

  it('keeps native hidden state and forwards descriptive attributes', () => {
    const wrapper = mount(Heading, {
      props: { level: 3 },
      attrs: { hidden: true, 'aria-describedby': 'summary' },
    })
    expect(wrapper.element.tagName).toBe('H3')
    expect(wrapper.attributes('hidden')).toBeDefined()
    expect(wrapper.attributes('aria-describedby')).toBe('summary')
    wrapper.unmount()
  })
})
