import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import OptionPanel from '../../../../registry/components/option/option-panel.vue'
import Option from '../../../../registry/components/option/option.vue'
import Select from '../../../../registry/components/select/select.vue'

enableAutoUnmount(afterEach)
it('select.options.catalog: renders data options and keeps selected labels independent of mounted records', async () => {
  const wrapper = mount(Select, {
    props: {
      modelValue: 'ts',
      options: [
        { value: 'ts', label: 'TypeScript' },
        { value: 'rust', label: 'Rust', disabled: true },
      ],
    },
  })
  await flushPromises()
  expect(wrapper.get('button').text()).toContain('TypeScript')
  expect(wrapper.findAllComponents(Option)).toHaveLength(2)
  expect(
    wrapper
      .findAllComponents(Option)
      .find((option) => option.props('value') === 'rust')!
      .attributes('aria-disabled'),
  ).toBe('true')
})
it('select.options.catalog: retains accepted unknown values in display and native form data while metadata changes', async () => {
  const wrapper = mount(Select, {
    props: {
      modelValue: ['ts', 'remote'],
      multiple: true,
      name: 'language',
      options: [{ value: 'ts', label: 'TypeScript' }],
    },
  })
  await flushPromises()
  expect(wrapper.get('button').text()).toContain('TypeScript, remote')
  expect(
    Array.from(
      wrapper.get<HTMLSelectElement>('select').element.selectedOptions,
      (option) => option.value,
    ),
  ).toEqual(['ts', 'remote'])
  await wrapper.setProps({ options: [{ value: 'remote', label: 'Remote language' }] })
  expect(wrapper.get('button').text()).toContain('ts, Remote language')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('uses a direct accessible name for the data listbox and preserves cancellation', async () => {
  const wrapper = mount(Select, {
    attrs: { 'aria-label': 'Languages' },
    props: {
      options: [{ value: 'ts', label: 'TypeScript' }],
      onBeforeinput: (event) => event.preventDefault(),
    },
  })
  await flushPromises()
  expect(wrapper.getComponent(OptionPanel).vm.panel?.getAttribute('aria-label')).toBe('Languages')
  await wrapper.getComponent(Option).trigger('click')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('select.options.catalog: renders accepted labels on the server without mounted option registrations', async () => {
  const html = await renderToString(
    h(Select, {
      modelValue: 'ts',
      options: [{ value: 'ts', label: 'Server label' }],
      'aria-label': 'Language',
    }),
  )
  expect(html).toContain('value="Server label"')
  expect(html).toContain('Server label')
})
