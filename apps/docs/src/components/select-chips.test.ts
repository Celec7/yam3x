import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import Select from '../../../../registry/components/select/select.vue'
import InputChip from '../../../../registry/components/chips/input-chip.vue'
import { LocaleProvider } from '../../../../registry/components/localization'
import { h } from 'vue'

enableAutoUnmount(afterEach)
const options = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'rust', label: 'Rust', disabled: true },
]
it('select.selection.chips: removes missing metadata values through the cancellable selection path', async () => {
  let cancel = true
  const wrapper = mount(Select, {
    props: {
      modelValue: ['ts', 'remote'],
      multiple: true,
      selectionDisplay: 'chips',
      options,
      onBeforeinput: (event) => {
        if (cancel) event.preventDefault()
      },
    },
  })
  await flushPromises()
  const remove = wrapper.get('button[aria-label="Remove remote"]')
  await remove.trigger('click', { detail: 1 })
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  cancel = false
  await remove.trigger('click', { detail: 1 })
  expect(wrapper.emitted('update:modelValue')).toEqual([[['ts']]])
  expect(wrapper.emitted('change')).toEqual([[{ value: 'remote', source: 'pointer' }]])
})
it('select.selection.chips: keyboard removal preserves disabled values and reports its source', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['ts', 'rust'], multiple: true, selectionDisplay: 'chips', options },
  })
  await flushPromises()
  await wrapper.get('button[aria-label="TypeScript"]').trigger('keydown', { key: 'Delete' })
  expect(wrapper.emitted('update:modelValue')).toEqual([[['rust']]])
  expect(wrapper.emitted('change')).toEqual([[{ value: 'ts', source: 'keyboard' }]])
  expect(wrapper.get('button[aria-label="Remove Rust"]').attributes('disabled')).toBeDefined()
  await wrapper.setProps({ disabled: true, modelValue: ['ts', 'rust'] })
  expect(wrapper.get('button[aria-label="Remove TypeScript"]').attributes('disabled')).toBeDefined()
})
it('select.selection.chips: chip bodies reopen the menu without toggling chip selection or nesting actions', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['ts'], multiple: true, selectionDisplay: 'chips', options },
  })
  await flushPromises()
  await wrapper.get('button[aria-label="TypeScript"]').trigger('click')
  expect(wrapper.emitted('update:open')).toEqual([[true]])
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.getComponent(InputChip).emitted('update:selected')).toBeUndefined()
  expect(wrapper.find('button button').exists()).toBe(false)
})
it('select.selection.chips: remove names inherit scoped locale updates without changing accepted values', async () => {
  const wrapper = mount(LocaleProvider, {
    props: { locale: 'zh-CN' },
    slots: {
      default: () =>
        h(Select, { modelValue: ['ts'], multiple: true, selectionDisplay: 'chips', options }),
    },
  })
  await flushPromises()
  expect(wrapper.getComponent(InputChip).find('button[aria-label="移除TypeScript"]').exists()).toBe(
    true,
  )
  await wrapper.setProps({ locale: 'en-US' })
  expect(
    wrapper.getComponent(InputChip).find('button[aria-label="Remove TypeScript"]').exists(),
  ).toBe(true)
  expect(wrapper.getComponent(Select).emitted('update:modelValue')).toBeUndefined()
})
