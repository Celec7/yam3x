import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '../../../../registry/components/localization'
import { TimeInput, TimePicker } from '../../../../registry/components/time-picker'
import TimePickerControl from '../../../../registry/components/time-picker/time-picker-control.vue'

enableAutoUnmount(afterEach)
describe('Time picker shared localization', () => {
  it('inherits dial and field labels while keeping standalone selection unchanged', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () => h(TimePicker, { modelValue: { hour: 13, minute: 7 }, format: '12' }),
      },
    })
    expect(wrapper.find('[aria-label="小时"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="8 小时，共 12 小时"]').exists()).toBe(true)
    expect(wrapper.getComponent(TimePicker).emitted('update:modelValue')).toBeUndefined()
  })
  // time-picker.behavior.locale-draft
  it('keeps invalid text and its original automatic cycle across language changes until correction', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () => h(TimeInput, { modelValue: { hour: 13, minute: 7 } }),
      },
    })
    const input = wrapper.getComponent(TimeInput)
    await input.get('input[aria-label="Hour"]').setValue('99')
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(input.get<HTMLInputElement>('input[aria-label="小时"]').element.value).toBe('99')
    expect(input.text()).toContain('请输入有效的小时。')
    expect(input.find('[role="radiogroup"]').exists()).toBe(true)
    expect(input.emitted('update:modelValue')).toBeUndefined()
    await input.get('input[aria-label="小时"]').setValue('11')
    expect(input.emitted('update:modelValue')?.[0]).toEqual([{ hour: 23, minute: 7 }])
    expect(input.get<HTMLInputElement>('input[aria-label="小时"]').element.value).toBe('23')
    expect(input.find('[role="radiogroup"]').exists()).toBe(false)
  })
  it('gives explicit language and accessible label props priority over a different provider language', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages: { timePicker: { hour: '共享小时' } } },
      slots: {
        default: () =>
          h(TimeInput, {
            locale: 'en-US',
            hourLabel: 'Custom hour',
            modelValue: { hour: 13, minute: 7 },
          }),
      },
    })
    expect(wrapper.find('input[aria-label="Custom hour"]').exists()).toBe(true)
    expect(wrapper.find('input[aria-label="Minute"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('共享小时')
  })
  it('keeps invalid confirmation disabled when a shared validation formatter returns empty text', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { messages: { timePicker: { invalidPart: () => '' } } },
      slots: {
        default: () => h(TimePickerControl, { mode: 'input', modelValue: { hour: 13, minute: 7 } }),
      },
    })
    await wrapper.get('input[aria-label="Hour"]').setValue('99')
    expect(wrapper.get('.yam3x-time-picker__action--confirm').attributes('disabled')).toBeDefined()
    expect(wrapper.get('input[aria-label="Hour"]').attributes('aria-invalid')).toBe('true')
  })
  it('retains browser-language fallback and lets a provider override wrapper direction', () => {
    const language = vi.spyOn(navigator, 'language', 'get').mockReturnValue('ar')
    try {
      expect(mount(TimeInput).attributes('dir')).toBe('rtl')
      const wrapper = mount(LocaleProvider, {
        props: { locale: 'en-US' },
        slots: { default: () => h(TimeInput) },
      })
      expect(wrapper.getComponent(TimeInput).attributes('dir')).toBeUndefined()
    } finally {
      language.mockRestore()
    }
  })
  it('returns focus to the hour field when a language change removes the focused period control', async () => {
    const wrapper = mount(LocaleProvider, {
      attachTo: document.body,
      props: { locale: 'en-US' },
      slots: {
        default: () => h(TimeInput, { modelValue: { hour: 13, minute: 7 } }),
      },
    })
    wrapper.get<HTMLButtonElement>('[role="radio"][aria-checked="true"]').element.focus()
    await wrapper.setProps({ locale: 'zh-CN' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('input[aria-label="小时"]').element)
    expect(wrapper.getComponent(TimeInput).emitted('update:modelValue')).toBeUndefined()
  })
  it('gives a component dial formatter priority over the shared formatter', () => {
    const wrapper = mount(LocaleProvider, {
      props: {
        locale: 'zh-CN',
        messages: { timePicker: { dialValue: ({ value }) => `Shared ${value}` } },
      },
      slots: {
        default: () =>
          h(TimePicker, { format: '12', dialValueLabel: ({ value }) => `Local ${value}` }),
      },
    })
    expect(wrapper.find('[aria-label="Local 8"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Shared 8"]').exists()).toBe(false)
  })
  it('renders independent scoped language and message overrides during concurrent SSR', async () => {
    const render = (locale: string, hour: string) =>
      renderToString(
        h(
          LocaleProvider,
          { locale, messages: { timePicker: { hour } } },
          { default: () => h(TimeInput, { modelValue: { hour: 13, minute: 7 } }) },
        ),
      )
    const [first, second] = await Promise.all([
      render('en-US', 'Hours A'),
      render('zh-CN', '小时 B'),
    ])
    expect(first).toContain('aria-label="Hours A"')
    expect(first).not.toContain('小时 B')
    expect(second).toContain('aria-label="小时 B"')
    expect(second).not.toContain('Hours A')
  })
})
