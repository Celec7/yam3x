import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FormField from '../../../../registry/components/form-field/form-field.vue'

describe('FormField external descriptions', () => {
  it('does not rewrite an unchanged external description when there is no supporting text', async () => {
    const wrapper = mount(FormField, {
      props: { label: 'Weight' },
      slots: { default: '<input aria-describedby="weight-unit" />' },
    })
    const input = wrapper.get('input')
    const setAttribute = vi.spyOn(input.element, 'setAttribute')
    try {
      await input.setValue('1.5')
      expect(input.attributes('aria-describedby')).toBe('weight-unit')
      expect(setAttribute.mock.calls.filter(([name]) => name === 'aria-describedby')).toEqual([])
    } finally {
      wrapper.unmount()
      setAttribute.mockRestore()
    }
  })
})

it('derives the required label from aria-required without requiring query text natively', async () => {
  const wrapper = mount(FormField, {
    props: { label: 'Language' },
    slots: { default: '<input role="combobox" aria-required="true" />' },
  })
  try {
    await flushPromises()
    expect(wrapper.text()).toContain('*')
    expect(wrapper.get<HTMLInputElement>('input').element.required).toBe(false)
    wrapper.get('input').element.setAttribute('aria-required', 'false')
    await flushPromises()
    expect(wrapper.text()).not.toContain('*')
  } finally {
    wrapper.unmount()
  }
})
