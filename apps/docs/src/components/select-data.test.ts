import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import OptionPanel from '../../../../registry/components/option/option-panel.vue'
import Option from '../../../../registry/components/option/option.vue'
import OptionGroup from '../../../../registry/components/option/option-group.vue'
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

it('keeps nonvirtual catalog registration and caller filtering bounded', async () => {
  const options = Array.from({ length: 200 }, (_, index) => ({
    value: `item-${index}`,
    label: `Item ${index}`,
  }))
  const filter = vi.fn((option: { label: string }, query: string) => option.label.includes(query))
  const comparisons = vi.spyOn(Node.prototype, 'compareDocumentPosition')
  try {
    const wrapper = mount(Select, {
      props: { options, searchable: true, query: 'Item', filter },
    })
    await flushPromises()
    expect(wrapper.findAllComponents(Option)).toHaveLength(options.length)
    expect(comparisons.mock.calls.length).toBeLessThan(options.length * 8)
    expect(filter).toHaveBeenCalledTimes(options.length)
    const input = wrapper.get('input[role="combobox"]')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('item-199')
    await wrapper.setProps({ options: [] })
    await flushPromises()
    expect(wrapper.findAllComponents(Option)).toHaveLength(0)
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('item-199')
  } finally {
    comparisons.mockRestore()
  }
})

it('keeps grouped slot navigation and native order aligned after keyed moves, insertions and removal', async () => {
  const groups = ref([
    {
      key: 'first',
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ],
    },
    { key: 'second', options: [{ value: 'c', label: 'Charlie' }] },
  ])
  const wrapper = mount(Select, {
    slots: {
      default: () =>
        groups.value.map((group) =>
          h(OptionGroup, { key: group.key, label: group.key }, () =>
            group.options.map((option) => h(Option, { ...option, key: option.value })),
          ),
        ),
    },
  })
  await flushPromises()
  groups.value = [
    groups.value[1]!,
    { key: 'first', options: [...groups.value[0]!.options].reverse() },
  ]
  await flushPromises()
  const button = wrapper.get('button')
  await button.trigger('keydown', { key: 'Home' })
  await button.trigger('keydown', { key: 'Enter' })
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('c')
  groups.value = [{ key: 'second', options: [{ value: 'd', label: 'Delta' }] }, groups.value[1]!]
  await flushPromises()
  expect(
    [...wrapper.get<HTMLSelectElement>('select').element.options].map((option) => option.value),
  ).toEqual(['', 'd', 'b', 'a', 'c'])
  await button.trigger('keydown', { key: 'Home' })
  await button.trigger('keydown', { key: 'ArrowDown' })
  await button.trigger('keydown', { key: 'Enter' })
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('b')
})

it('retains slotted selected defaults and reset values while metadata changes', async () => {
  const options = ref([
    { value: 'a', label: 'Alpha', selected: false },
    { value: 'b', label: 'Beta', selected: true },
  ])
  const form = document.createElement('form')
  document.body.append(form)
  try {
    const wrapper = mount(Select, {
      attachTo: form,
      props: { multiple: true, name: 'letters' },
      slots: {
        default: () => options.value.map((option) => h(Option, { ...option, key: option.value })),
      },
    })
    await flushPromises()
    expect(new FormData(form).getAll('letters')).toEqual(['b'])
    options.value = [
      { value: 'a', label: 'Alpha', selected: true },
      { value: 'b', label: 'Renamed beta', selected: true },
    ]
    await flushPromises()
    expect(wrapper.get('button').text()).toContain('Renamed beta')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b', 'a']])
    form.reset()
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
    expect(wrapper.get('button').text()).toContain('Renamed beta')
    wrapper.unmount()
  } finally {
    form.remove()
  }
})

it.each(['remove', 'disable'])(
  'repairs focused slotted options after batched %s and emptying without clearing accepted values',
  async (action) => {
    const options = ref([
      { value: 'a', label: 'Alpha', disabled: false },
      { value: 'b', label: 'Beta', disabled: false },
    ])
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { multiple: true, modelValue: ['a'] },
      slots: {
        default: () => options.value.map((option) => h(Option, { ...option, key: option.value })),
      },
    })
    await flushPromises()
    wrapper.vm.show()
    await flushPromises()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    ;(wrapper.findAllComponents(Option)[0]!.element as HTMLElement).focus()
    options.value =
      action === 'remove'
        ? options.value.slice(1)
        : options.value.map((option) => ({ ...option, disabled: option.value === 'a' }))
    await flushPromises()
    expect((document.activeElement as HTMLElement).dataset.value).toBe('b')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get<HTMLSelectElement>('select').element.selectedOptions[0]?.value).toBe('a')
    options.value = []
    await flushPromises()
    const panel = wrapper.getComponent(OptionPanel).vm.panel!
    expect(document.activeElement).toBe(panel)
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  },
)
