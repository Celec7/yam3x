import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Autocomplete from '../../../../registry/components/autocomplete/autocomplete.vue'

enableAutoUnmount(afterEach)
const options = Array.from({ length: 10000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index + 1}`,
  disabled: index === 9998,
}))
it('autocomplete.virtual.catalog: bounds rows while keyboard navigation traverses the complete catalog', async () => {
  const wrapper = mount(Autocomplete, { props: { options, label: 'Items', virtual: true } })
  expect(wrapper.findAll('[role="option"]').length).toBeLessThan(30)
  const input = wrapper.get('input')
  await input.trigger('keydown', { key: 'ArrowUp' })
  await flushPromises()
  const target = wrapper.get('[aria-posinset="10000"]')
  expect(target.attributes('aria-setsize')).toBe('10000')
  expect(input.attributes('aria-activedescendant')).toBe(target.attributes('id'))
  expect(wrapper.findAll('[role="option"]').length).toBeLessThan(30)
  await input.trigger('keydown', { key: 'ArrowUp' })
  await flushPromises()
  expect(input.attributes('aria-activedescendant')).toBe(
    wrapper.get('[aria-posinset="9998"]').attributes('id'),
  )
  await input.trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:selected')).toEqual([['item-9997']])
  expect(wrapper.emitted('update:modelValue')).toEqual([['Item 9998']])
})
it('autocomplete.virtual.catalog: filters all records and releases rows while loading', async () => {
  const wrapper = mount(Autocomplete, { props: { options, label: 'Items', virtual: true } })
  const input = wrapper.get('input')
  await input.setValue('Item 10000')
  await flushPromises()
  expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
  expect(wrapper.get('[role="option"]').attributes('aria-setsize')).toBe('1')
  await input.trigger('keydown', { key: 'ArrowDown' })
  await input.trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:selected')).toEqual([['item-9999']])
  await input.trigger('focus')
  expect(input.attributes('aria-activedescendant')).toBeDefined()
  await wrapper.setProps({ loading: true })
  await flushPromises()
  expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
  expect(input.attributes('aria-activedescendant')).toBeUndefined()
  await wrapper.setProps({ loading: false, modelValue: 'missing' })
  await flushPromises()
  expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
})
it('autocomplete.virtual.catalog: renders a bounded server window with logical result positions', async () => {
  const html = await renderToString(h(Autocomplete, { options, label: 'Items', virtual: true }))
  const host = document.createElement('div')
  host.innerHTML = html
  expect(host.querySelectorAll('[role="option"]').length).toBeLessThan(30)
  expect(host.querySelector('[role="option"]')?.getAttribute('aria-setsize')).toBe('10000')
})

it('autocomplete.virtual.catalog: switches windowing without changing query or accepted value', async () => {
  const wrapper = mount(Autocomplete, {
    props: {
      options: options.slice(0, 100),
      label: 'Items',
      virtual: true,
      filter: 'none',
      modelValue: 'typed',
      selected: 'item-99',
    },
  })
  await flushPromises()
  expect(wrapper.findAll('[role="option"]').length).toBeLessThan(30)
  await wrapper.setProps({ virtual: false })
  expect(wrapper.findAll('[role="option"]')).toHaveLength(100)
  await wrapper.setProps({ virtual: { estimateSize: 56, overscan: 2 } })
  await flushPromises()
  expect(wrapper.findAll('[role="option"]').length).toBeLessThan(30)
  expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('typed')
  expect(wrapper.emitted('update:selected')).toBeUndefined()
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})
