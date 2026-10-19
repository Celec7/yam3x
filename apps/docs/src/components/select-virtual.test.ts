import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import Select from '../../../../registry/components/select/select.vue'
import { Option, OptionPanel } from '../../../../registry/components/option'

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
it('select.virtual.catalog: recycling rows does not reread the complete catalog', async () => {
  let reads = 0
  const catalog = options.map((option) => ({
    value: option.value,
    get label() {
      reads++
      return option.label
    },
  }))
  const wrapper = mount(Select, {
    props: { options: catalog, virtual: true, modelValue: 'item-9999' },
  })
  await flushPromises()
  const before = reads
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  panel.scrollTop = 4000
  panel.dispatchEvent(new Event('scroll'))
  await flushPromises()
  expect(reads - before).toBeLessThan(200)
  expect(wrapper.findAllComponents(Option).length).toBeLessThan(30)
  expect(wrapper.get('.yam3x-select__trigger').text()).toContain('Item 9999')
  await wrapper.setProps({
    options: catalog.map((option) =>
      option.value === 'item-9999' ? { ...option, label: 'Renamed item' } : option,
    ),
  })
  expect(wrapper.get('.yam3x-select__trigger').text()).toContain('Renamed item')
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('item-9999')
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

it.each(
  [false, true].flatMap((virtual) => ['remove', 'disable'].map((action) => ({ virtual, action }))),
)(
  'select.options.focus: $action restores a usable entry without changing accepted values (virtual=$virtual)',
  async ({ virtual, action }) => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options: options.slice(0, 20), virtual, multiple: true, modelValue: ['item-0'] },
    })
    wrapper.vm.show()
    await flushPromises()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const first = wrapper
      .findAllComponents(Option)
      .find((option) => option.props('value') === 'item-0')!
    ;(first.element as HTMLElement).focus()
    await wrapper.setProps({
      options:
        action === 'remove'
          ? options.slice(1, 20)
          : options.slice(0, 20).map((option, index) => ({ ...option, disabled: index === 0 })),
    })
    await flushPromises()
    expect((document.activeElement as HTMLElement).dataset.value).toBe('item-1')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(
      [...wrapper.get<HTMLSelectElement>('select').element.selectedOptions].map(
        (option) => option.value,
      ),
    ).toEqual(['item-0'])
  },
)

it.each([false, true])(
  'select.options.focus: an emptied list retains keyboard dismissal (virtual=%s)',
  async (virtual) => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options: options.slice(0, 20), virtual, multiple: true },
    })
    wrapper.vm.show()
    await flushPromises()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    ;(wrapper.findAllComponents(Option)[0]!.element as HTMLElement).focus()
    await wrapper.setProps({ options: [] })
    await flushPromises()
    const panel = wrapper.getComponent(OptionPanel).vm.panel!
    expect(document.activeElement).toBe(panel)
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  },
)
it.each([false, true])(
  'select.options.focus: catalog reconciliation preserves unrelated focus (virtual=%s)',
  async (virtual) => {
    const outside = document.createElement('button')
    document.body.append(outside)
    try {
      const wrapper = mount(Select, {
        attachTo: document.body,
        props: { options: options.slice(0, 20), virtual, multiple: true },
      })
      wrapper.vm.show()
      await flushPromises()
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      outside.focus()
      await wrapper.setProps({ options: options.slice(1, 20) })
      await flushPromises()
      expect(document.activeElement).toBe(outside)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    } finally {
      outside.remove()
    }
  },
)
