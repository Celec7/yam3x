import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import Select from '../../../../registry/components/select/select.vue'
import { Option } from '../../../../registry/components/option'

enableAutoUnmount(afterEach)
const options = Array.from({ length: 10000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index}`,
}))
it('select.virtual.catalog: bounds mounted rows and native proxies while retaining offscreen labels and values', async () => {
  const wrapper = mount(Select, {
    props: {
      options,
      virtual: true,
      multiple: true,
      modelValue: ['item-9999', 'item-10', 'missing'],
      name: 'items',
    },
  })
  await flushPromises()
  expect(wrapper.findAllComponents(Option).length).toBeLessThan(30)
  expect(wrapper.get('.yam3x-select__trigger').text()).toContain('Item 9999, Item 10, missing')
  const native = wrapper.get<HTMLSelectElement>('select').element
  expect(native.options.length).toBe(3)
  expect([...native.selectedOptions].map((option) => option.value)).toEqual([
    'item-10',
    'item-9999',
    'missing',
  ])
})
it('select.virtual.navigation: mounts a far keyboard target with full positional semantics before acceptance', async () => {
  const wrapper = mount(Select, { props: { options, virtual: true } })
  await wrapper.get('button').trigger('keydown', { key: 'End' })
  await flushPromises()
  const last = wrapper
    .findAllComponents(Option)
    .find((option) => option.props('value') === 'item-9999')!
  expect(last.attributes('aria-posinset')).toBe('10000')
  expect(last.attributes('aria-setsize')).toBe('10000')
  expect(wrapper.get('button').attributes('aria-activedescendant')).toBe(last.attributes('id'))
  expect(wrapper.findAllComponents(Option).length).toBeLessThan(30)
  await wrapper.get('button').trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:modelValue')).toEqual([['item-9999']])
})
it('select.virtual.defaults: recycling an initially selected row cannot select it again after removal', async () => {
  const wrapper = mount(Select, {
    props: {
      options: options.map((option, index) => ({ ...option, selected: index === 0 })),
      virtual: true,
      multiple: true,
    },
  })
  await flushPromises()
  const first = wrapper
    .findAllComponents(Option)
    .find((option) => option.props('value') === 'item-0')!
  await first.trigger('click')
  expect(wrapper.get<HTMLSelectElement>('select').element.selectedOptions.length).toBe(0)
  await wrapper.get('button').trigger('keydown', { key: 'End' })
  await flushPromises()
  await wrapper.get('button').trigger('keydown', { key: 'Home' })
  await flushPromises()
  expect(wrapper.get<HTMLSelectElement>('select').element.selectedOptions.length).toBe(0)
})

it('select.virtual.catalog: server rendering bounds rows and retains a selected label beyond the initial window', async () => {
  const context: SSRContext = {}
  const html = await renderToString(
    h(Select, { options, virtual: true, modelValue: 'item-9999' }),
    context,
  )
  const host = document.createElement('div')
  host.innerHTML = html
  expect(host.querySelector('button')?.textContent).toContain('Item 9999')
  expect(host.querySelectorAll('select option')).toHaveLength(2)
  const popup = document.createElement('div')
  popup.innerHTML = context.teleports?.body ?? ''
  expect(popup.querySelectorAll('[role="option"]').length).toBeLessThan(30)
  expect(popup.querySelector('[role="option"]')?.getAttribute('aria-setsize')).toBe('10000')
})
