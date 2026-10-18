import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h } from 'vue'
import { LocaleProvider } from '../../../../registry/components/localization'
import { InputChip } from '../../../../registry/components/chips'
import { Badge } from '../../../../registry/components/badge'
import { Breadcrumb } from '../../../../registry/components/breadcrumb'
import { RangeSlider } from '../../../../registry/components/slider'
import { SplitButton } from '../../../../registry/components/split-button'

enableAutoUnmount(afterEach)
describe('generated shared labels', () => {
  it('keeps Input chip selection and focus until its translated remove action is activated', async () => {
    const wrapper = mount(LocaleProvider, {
      attachTo: document.body,
      props: { locale: 'en-US' },
      slots: { default: () => h(InputChip, { label: 'Apple', selected: true }) },
    })
    const remove = wrapper.get<HTMLButtonElement>('[aria-label="Remove Apple"]')
    remove.element.focus()
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get('[aria-label="移除Apple"]').element).toBe(remove.element)
    expect(document.activeElement).toBe(remove.element)
    expect(wrapper.getComponent(InputChip).emitted('update:selected')).toBeUndefined()
    await remove.trigger('click')
    expect(wrapper.getComponent(InputChip).emitted('remove')).toEqual([
      ['Apple', expect.any(MouseEvent)],
    ])
  })
  it('keeps Range slider values and focused endpoint while updating spoken names', async () => {
    const wrapper = mount(LocaleProvider, {
      attachTo: document.body,
      props: { locale: 'en-US' },
      slots: { default: () => h(RangeSlider, { modelValue: [20, 80], label: 'Price' }) },
    })
    const lower = wrapper.get<HTMLInputElement>('input[aria-label="Price minimum"]')
    lower.element.focus()
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get('input[aria-label="Price最小值"]').element).toBe(lower.element)
    expect(document.activeElement).toBe(lower.element)
    expect(wrapper.findAll<HTMLInputElement>('input').map((input) => input.element.value)).toEqual([
      '20',
      '80',
    ])
    expect(wrapper.getComponent(RangeSlider).emitted('update:modelValue')).toBeUndefined()
  })
  it('preserves component-specific range endpoint labels over shared formatters', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () =>
          h(RangeSlider, { modelValue: [20, 80], lowerLabel: 'Lowest', upperLabel: 'Highest' }),
      },
    })
    expect(wrapper.find('input[aria-label="Lowest"]').exists()).toBe(true)
    expect(wrapper.find('input[aria-label="Highest"]').exists()).toBe(true)
  })
  it('keeps Breadcrumb item names and current item application-owned', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () => h(Breadcrumb, { items: [{ label: 'Home', href: '/' }, { label: 'Files' }] }),
      },
    })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get('nav').attributes('aria-label')).toBe('面包屑导航')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('Files')
    expect(wrapper.text()).toContain('Home')
  })
  it('updates a small Badge default while preserving explicit names', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => [h(Badge), h(Badge, { ariaLabel: 'Custom badge' })] },
    })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.find('[aria-label="新通知"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Custom badge"]').exists()).toBe(true)
  })
  it('keeps Split button popup state and custom action labels while translating generated labels', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(SplitButton, {
            label: 'Save',
            open: true,
            items: [{ value: 'copy', label: 'Save copy' }],
          }),
      },
    })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.find('[aria-label="更多Save选项"]').exists()).toBe(true)
    expect(wrapper.getComponent(SplitButton).props('open')).toBe(true)
    expect(wrapper.getComponent(SplitButton).emitted('update:open')).toBeUndefined()
    expect(wrapper.getComponent(SplitButton).emitted('select')).toBeUndefined()
  })
})
