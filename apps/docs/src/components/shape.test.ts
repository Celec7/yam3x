import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Shape from '../../../../registry/components/shape/shape.vue'

describe('Shape', () => {
  it('keeps the default and invalid runtime names unclipped and semantically neutral', async () => {
    const wrapper = mount(Shape, {
      attrs: { id: 'decoration', 'aria-hidden': 'true' },
      slots: { default: 'content' },
    })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('id')).toBe('decoration')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('data-name')).toBeUndefined()
    expect(wrapper.find('.yam3x-shape__wrapper').attributes('style')).toBeUndefined()
    expect(wrapper.text()).toBe('content')

    await wrapper.setProps({ name: 'unsupported' as never })
    expect(wrapper.attributes('data-name')).toBeUndefined()
    expect(wrapper.find('.yam3x-shape__wrapper').attributes('style')).toBeUndefined()
    wrapper.unmount()
  })

  it('clips the default slot to a named shape and preserves native state', () => {
    const wrapper = mount(Shape, {
      props: { name: 'sunny' },
      attrs: { hidden: true, 'aria-label': 'decoration' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-name')).toBe('sunny')
    expect(wrapper.attributes('hidden')).toBeDefined()
    expect(wrapper.attributes('aria-label')).toBe('decoration')
    expect(wrapper.find('.yam3x-shape__wrapper').attributes('style')).toContain(
      '--_yam3x-shape-clip-path: polygon(',
    )
    expect(wrapper.text()).toBe('content')
    wrapper.unmount()
  })
})
