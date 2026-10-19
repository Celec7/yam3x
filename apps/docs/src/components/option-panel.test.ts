import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { OptionPanel } from '../../../../registry/components/option'

enableAutoUnmount(afterEach)
it('retains default listbox semantics and omits listbox-only state in dialog mode', async () => {
  const wrapper = mount(OptionPanel, { props: { label: 'Choose records', multiple: true } })
  expect(wrapper.get('.yam3x-option-panel').attributes('role')).toBe('listbox')
  expect(wrapper.get('.yam3x-option-panel').attributes('aria-multiselectable')).toBe('true')
  await wrapper.setProps({ role: 'dialog' })
  expect(wrapper.get('.yam3x-option-panel').attributes('role')).toBe('dialog')
  expect(wrapper.get('.yam3x-option-panel').attributes('aria-label')).toBe('Choose records')
  expect(wrapper.get('.yam3x-option-panel').attributes('aria-multiselectable')).toBeUndefined()
  expect(wrapper.get('.yam3x-option-panel').attributes('aria-modal')).toBeUndefined()
})
