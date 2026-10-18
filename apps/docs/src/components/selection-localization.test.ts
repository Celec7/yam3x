import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '../../../../registry/components/localization'
import { Autocomplete } from '../../../../registry/components/autocomplete'
import { Select } from '../../../../registry/components/select'
import { Option, OptionPanel } from '../../../../registry/components/option'

enableAutoUnmount(afterEach)
describe('selection shared localization', () => {
  it('updates Autocomplete announcements and native validity without changing query or selection', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(Autocomplete, {
            label: 'Fruit',
            options: [],
            modelValue: 'Unknown',
            selectionRequired: true,
          }),
      },
    })
    const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
    expect(input.element.validationMessage).toBe('Select an option from the list.')
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(input.element.value).toBe('Unknown')
    expect(input.element.validationMessage).toBe('请从列表中选择一个选项。')
    expect(wrapper.find('[aria-label="显示Fruit的建议"]').exists()).toBe(true)
    expect(wrapper.getComponent(Autocomplete).emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.getComponent(Autocomplete).emitted('update:selected')).toBeUndefined()
  })
  it('preserves Autocomplete custom text and results functions over scoped translations', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () =>
          h(Autocomplete, {
            label: 'Fruit',
            options: [{ value: 'apple', label: 'Apple' }],
            resultsLabel: (count) => `Found ${count}`,
          }),
      },
    })
    await wrapper.get('input[role="combobox"]').trigger('focus')
    expect(wrapper.text()).toContain('Found 1')
  })
  it('inherits Option panel text and gives local props and slots priority', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () => [
          h(OptionPanel, { open: true, empty: true }),
          h(OptionPanel, { open: true, loading: true, loadingText: 'Waiting' }),
          h(OptionPanel, { open: true, empty: true }, { 'no-data': () => 'Custom slot' }),
        ],
      },
    })
    expect(wrapper.text()).toContain('暂无选项')
    expect(wrapper.text()).toContain('Waiting')
    expect(wrapper.text()).toContain('Custom slot')
    await wrapper.setProps({ locale: 'en-US' })
    expect(wrapper.text()).toContain('No options')
  })
  it('does not disable required selection when its translated validity message is empty', () => {
    const wrapper = mount(LocaleProvider, {
      props: { messages: { autocomplete: { selectionRequired: '' } } },
      slots: {
        default: () =>
          h(Autocomplete, {
            label: 'Fruit',
            options: [],
            modelValue: 'Unknown',
            selectionRequired: true,
          }),
      },
    })
    expect(wrapper.get<HTMLInputElement>('input').element.validity.customError).toBe(true)
  })
  it('keeps Select open and updates its empty status without emitting selection changes', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(Select, { open: true }) },
    })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.getComponent(Select).props('open')).toBe(true)
    expect(document.body.textContent).toContain('暂无选项')
    expect(wrapper.getComponent(Select).emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.getComponent(Select).emitted('update:open')).toBeUndefined()
  })
  it('uses an explicit component language independently of a different provider language', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages: { optionPanel: { noData: 'Shared' } } },
      slots: {
        default: () => h(OptionPanel, { locale: 'en-US', open: true, empty: true }),
      },
    })
    expect(wrapper.text()).toContain('No options')
    expect(wrapper.text()).not.toContain('Shared')
  })
  it('keeps an open Autocomplete query and active option while translating its result count', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(Autocomplete, {
            label: 'Fruit',
            modelValue: 'Ap',
            options: [
              { value: 'apple', label: 'Apple' },
              { value: 'apricot', label: 'Apricot' },
            ],
          }),
      },
    })
    const input = wrapper.get('input[role="combobox"]')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    const active = input.attributes('aria-activedescendant')
    expect(active).toBeTruthy()
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(input.attributes('aria-activedescendant')).toBe(active)
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('2 个选项')
    expect(wrapper.getComponent(Autocomplete).emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.getComponent(Autocomplete).emitted('update:selected')).toBeUndefined()
  })
  it('preserves multiple Select values and checked option state across provider updates', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(
            Select,
            { modelValue: ['apple'], multiple: true, open: true },
            {
              default: () => [
                h(Option, { value: 'apple', label: 'Apple' }),
                h(Option, { value: 'pear', label: 'Pear' }),
              ],
            },
          ),
      },
    })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(
      document.body
        .querySelector('[role="option"][aria-label="Apple"]')
        ?.getAttribute('aria-selected'),
    ).toBe('true')
    expect(wrapper.getComponent(Select).emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.getComponent(Select).emitted('update:open')).toBeUndefined()
  })
  it('renders separately scoped suggestion names during concurrent SSR', async () => {
    const render = (locale: string) =>
      renderToString(
        h(
          LocaleProvider,
          { locale },
          {
            default: () =>
              h(Autocomplete, { label: 'Fruit', options: [{ value: 'apple', label: 'Apple' }] }),
          },
        ),
      )
    const [first, second] = await Promise.all([render('en-US'), render('zh-CN')])
    expect(first).toContain('Show Fruit suggestions')
    expect(second).toContain('显示Fruit的建议')
  })
})
