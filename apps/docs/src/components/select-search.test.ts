import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h, ref } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import Select from '../../../../registry/components/select/select.vue'
import { Option, OptionGroup } from '../../../../registry/components/option'

enableAutoUnmount(afterEach)
const options = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby', disabled: true },
]
it('select.search.query: filters separately from accepted native values, then accepts a keyboard choice', async () => {
  const wrapper = mount(Select, {
    props: { searchable: true, modelValue: 'ts', options, name: 'language' },
  })
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  await input.setValue('ru')
  await flushPromises()
  expect(wrapper.emitted('update:query')).toEqual([['ru']])
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('ts')
  expect(
    wrapper.findAllComponents(Option).filter((option) => option.attributes('hidden') === undefined),
  ).toHaveLength(2)
  expect(
    wrapper
      .findAllComponents(Option)
      .find((option) => option.props('value') === 'ts')!
      .attributes('hidden'),
  ).toBeDefined()
  await input.trigger('keydown', { key: 'Enter' })
  await flushPromises()
  expect(wrapper.emitted('update:modelValue')).toEqual([['rust']])
  expect(input.element.value).toBe('Rust')
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('rust')
})
it('select.search.query: preserves query and accepted values when selection is cancelled', async () => {
  const wrapper = mount(Select, {
    props: {
      searchable: true,
      multiple: true,
      modelValue: ['ts'],
      options,
      onBeforeinput: (event) => event.preventDefault(),
    },
  })
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  await input.setValue('rus')
  await input.trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(input.element.value).toBe('rus')
  await input.trigger('keydown', { key: 'Escape' })
  await flushPromises()
  expect(input.element.value).toBe('TypeScript')
})
it('select.search.composition: delays filtering and Enter acceptance until IME composition ends', async () => {
  const wrapper = mount(Select, { props: { searchable: true, options } })
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  await input.trigger('compositionstart')
  await input.setValue('rus')
  await input.trigger('keydown', { key: 'Enter', isComposing: true })
  expect(wrapper.emitted('update:query')).toBeUndefined()
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await input.trigger('compositionend')
  await flushPromises()
  expect(wrapper.emitted('update:query')).toEqual([['rus']])
  expect(
    wrapper.findAllComponents(Option).filter((option) => option.attributes('hidden') === undefined),
  ).toHaveLength(1)
})
it('select.search.slots: keeps grouped slotted metadata mounted through filtering and clearing', async () => {
  const wrapper = mount(Select, {
    props: { searchable: true, modelValue: 'ts' },
    slots: {
      default: () => [
        h(OptionGroup, { label: 'Languages' }, () =>
          options.map((option) => h(Option, { ...option, key: option.value })),
        ),
      ],
    },
  })
  await flushPromises()
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  await input.setValue('missing')
  expect(wrapper.findAllComponents(Option)).toHaveLength(3)
  expect(
    wrapper.findAllComponents(Option).every((option) => option.attributes('hidden') !== undefined),
  ).toBe(true)
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('ts')
  await input.setValue('')
  expect(
    wrapper.findAllComponents(Option).every((option) => option.attributes('hidden') === undefined),
  ).toBe(true)
})
it('select.search.filter: uses caller matching without changing browser editing keys', async () => {
  const wrapper = mount(Select, {
    props: { searchable: true, options, filter: (option, query) => option.value === query },
  })
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  await input.setValue('ts')
  expect(
    wrapper.findAllComponents(Option).filter((option) => option.attributes('hidden') === undefined),
  ).toHaveLength(1)
  for (const key of ['Home', 'End', ' ', 'Backspace']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    input.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  }
})

it('select.search.focus: closeOnTab=false retains the filtered popup when focus leaves', async () => {
  const wrapper = mount(Select, { props: { searchable: true, closeOnTab: false, options } })
  const input = wrapper.get('input[role="combobox"]')
  await input.setValue('rus')
  await input.trigger('keydown', { key: 'Tab' })
  await input.trigger('blur', { relatedTarget: document.createElement('button') })
  expect(input.attributes('aria-expanded')).toBe('true')
  expect(wrapper.emitted('update:open')).toEqual([[true]])
})
it('select.search.focus: chip activation clears an unrelated query before targeting its choice', async () => {
  const wrapper = mount(Select, {
    props: {
      searchable: true,
      multiple: true,
      selectionDisplay: 'chips',
      modelValue: ['ts'],
      options,
    },
  })
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  await input.setValue('rus')
  await wrapper.get('button[aria-label="TypeScript"]').trigger('click')
  await flushPromises()
  expect(input.element.value).toBe('')
  expect(input.attributes('aria-activedescendant')).toBe(
    wrapper
      .findAllComponents(Option)
      .find((option) => option.props('value') === 'ts')!
      .attributes('id'),
  )
})

it('select.search.slots: filters server-rendered rows before client registrations exist', async () => {
  const context: SSRContext = {}
  await renderToString(
    h(Select, { searchable: true, query: 'rus', open: true }, () =>
      options.map((option) => h(Option, option)),
    ),
    context,
  )
  const popup = document.createElement('div')
  popup.innerHTML = context.teleports?.body ?? ''
  expect(popup.querySelector('[data-value="ts"]')?.hasAttribute('hidden')).toBe(true)
  expect(popup.querySelector('[data-value="rust"]')?.hasAttribute('hidden')).toBe(false)
  expect(popup.querySelector('[data-value="ruby"]')?.hasAttribute('hidden')).toBe(true)
})

it('select.search.query: associates its unnamed query input and accepted native field with an external form', async () => {
  const form = document.createElement('form')
  form.id = 'search-external-form'
  document.body.append(form)
  const wrapper = mount(Select, {
    attachTo: document.body,
    props: { searchable: true, options, modelValue: 'ts', name: 'language', form: form.id },
  })
  try {
    const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
    expect(input.element.form).toBe(form)
    expect(input.element.name).toBe('')
    await input.setValue('rus')
    expect(new FormData(form).getAll('language')).toEqual(['ts'])
  } finally {
    wrapper.unmount()
    form.remove()
  }
})

it('select.search.query: controlled query updates filter independently and dismissal clears the caller model', async () => {
  const query = ref('rus')
  const wrapper = mount({
    render: () =>
      h(Select, {
        searchable: true,
        open: true,
        modelValue: 'ts',
        options,
        query: query.value,
        'onUpdate:query': (value: string) => {
          query.value = value
        },
      }),
  })
  await flushPromises()
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  expect(input.element.value).toBe('rus')
  query.value = 'type'
  await flushPromises()
  expect(input.element.value).toBe('type')
  expect(
    wrapper
      .findAllComponents(Option)
      .filter((option) => option.attributes('hidden') === undefined)
      .map((option) => option.props('value')),
  ).toEqual(['ts'])
  await input.setValue('ru')
  expect(query.value).toBe('ru')
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('ts')
  await input.trigger('keydown', { key: 'Escape' })
  await flushPromises()
  expect(query.value).toBe('')
})
