import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import Search from '../../../../registry/components/search/search.vue'

describe('Search query and expanded models', () => {
  it('manages query and expanded state when the models are uncontrolled', async () => {
    const wrapper = mount(Search, { slots: { default: 'Suggestions' } })
    const input = wrapper.get('input')

    await input.setValue('Material')
    expect((input.element as HTMLInputElement).value).toBe('Material')
    expect(wrapper.emitted('update:query')).toEqual([['Material']])

    await input.trigger('focus')
    expect(wrapper.attributes('data-open')).toBe('true')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.text()).toContain('Suggestions')
    await wrapper.get('button[aria-label="Clear"]').trigger('click')
    expect((input.element as HTMLInputElement).value).toBe('')
    expect(wrapper.emitted('clear')).toEqual([[]])
    wrapper.unmount()
  })

  it('emits controlled model changes and follows the parent value', async () => {
    const wrapper = mount(Search, {
      props: {
        query: 'Initial query',
        open: false,
        'onUpdate:query': () => undefined,
        'onUpdate:open': () => undefined,
      },
      slots: { default: 'Suggestions' },
    })
    const input = wrapper.get('input')

    await input.setValue('Updated query')
    expect(wrapper.emitted('update:query')).toEqual([['Updated query']])
    await wrapper.setProps({ query: 'Parent query' })
    expect((input.element as HTMLInputElement).value).toBe('Parent query')

    await input.trigger('focus')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.attributes('data-open')).toBeUndefined()
    await wrapper.setProps({ open: true })
    expect(wrapper.attributes('data-open')).toBe('true')
    expect(wrapper.text()).toContain('Suggestions')
    wrapper.unmount()
  })

  it('keeps a slotted native input connected to Search state and focus behavior', async () => {
    const wrapper = mount(Search, {
      slots: {
        'input-field': ({ inputProps }) => h('input', { ...inputProps, 'data-custom-input': '' }),
        default: 'Suggestions',
      },
    })
    const input = wrapper.get('[data-custom-input]')

    expect(input.attributes('aria-label')).toBe('Search')
    expect(input.attributes('aria-controls')).toBeTruthy()
    await input.setValue('Material')
    expect(wrapper.emitted('update:query')).toEqual([['Material']])
    expect((input.element as HTMLInputElement).value).toBe('Material')

    await input.trigger('focus')
    expect(wrapper.attributes('data-open')).toBe('true')
    expect(wrapper.text()).toContain('Suggestions')
    wrapper.unmount()
  })

  it('initializes an externally expanded Search as an active modal', () => {
    const originalOverflow = document.body.style.overflow
    const wrapper = mount(Search, {
      props: { open: true, 'onUpdate:open': () => undefined },
      slots: { default: 'Suggestions' },
    })

    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.attributes('aria-modal')).toBe('true')
    expect(wrapper.find('.yam3x-search__view').exists()).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
    expect(document.body.style.overflow).toBe(originalOverflow)
  })
})
