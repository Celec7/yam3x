import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '../../../../registry/components/localization'
import { DatePicker, DateRangePicker } from '../../../../registry/components/date-picker'

enableAutoUnmount(afterEach)
describe('Date picker shared localization', () => {
  it('inherits docked field labels and preserves explicit label and language overrides', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () => [
          h(DatePicker, { mode: 'docked' }),
          h(DatePicker, { mode: 'docked', label: 'Event', calendarLabel: 'Pick', locale: 'en-US' }),
        ],
      },
    })
    expect(wrapper.text()).toContain('选择日期')
    expect(wrapper.find('[aria-label="打开日历"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Event')
    expect(wrapper.find('[aria-label="Pick"]').exists()).toBe(true)
  })
  // date-picker.behavior.locale-draft
  it('preserves a single-date edit and parses it in its original language after switching language', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(DatePicker, { mode: 'docked' }) },
    })
    const input = wrapper.get('input')
    await input.setValue('10/05/2026')
    await wrapper.setProps({ locale: 'de-DE' })
    expect((input.element as HTMLInputElement).value).toBe('10/05/2026')
    expect(wrapper.getComponent(DatePicker).emitted('update:modelValue')).toBeUndefined()
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.getComponent(DatePicker).emitted('update:modelValue')).toEqual([['2026-10-05']])
  })
  it('retains independent parsing languages for pending range endpoints', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(DateRangePicker, { mode: 'modal', open: true }) },
    })
    await wrapper.get('[aria-label="Enter date manually"]').trigger('click')
    const start = wrapper.get('input[id$="-start"]')
    await start.setValue('10/05/2026')
    await wrapper.setProps({ locale: 'de-DE' })
    await wrapper.get('input[id$="-end"]').setValue('07.10.2026')
    await wrapper
      .get('.yam3x-date-picker__actions .yam3x-date-picker__text-action:last-child')
      .trigger('click')
    expect(wrapper.getComponent(DateRangePicker).emitted('update:modelValue')).toEqual([
      [{ start: '2026-10-05', end: '2026-10-07' }],
    ])
  })
  it('keeps range validation active when the shared error message is empty', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { messages: { datePicker: { invalidDate: '' } } },
      slots: { default: () => h(DateRangePicker, { mode: 'modal', open: true }) },
    })
    await wrapper.get('[aria-label="Enter date manually"]').trigger('click')
    await wrapper.get('input[id$="-start"]').setValue('bad date')
    await wrapper
      .get('.yam3x-date-picker__actions .yam3x-date-picker__text-action:last-child')
      .trigger('click')
    expect(wrapper.getComponent(DateRangePicker).emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('input[id$="-start"]').attributes('aria-invalid')).toBe('true')
  })
  it('keeps the focused date and provisional calendar selection across language changes', async () => {
    const wrapper = mount(LocaleProvider, {
      attachTo: document.body,
      props: { locale: 'en-US' },
      slots: {
        default: () => h(DatePicker, { mode: 'modal', open: true, initialDate: '2026-10-04' }),
      },
    })
    await wrapper.get('button[data-date="2026-10-04"]').trigger('click')
    wrapper.get<HTMLButtonElement>('button[data-date="2026-10-04"]').element.focus()
    await wrapper.setProps({ locale: 'zh-CN' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('button[data-date="2026-10-04"]').element)
    expect(wrapper.getComponent(DatePicker).emitted('update:modelValue')).toBeUndefined()
    await wrapper
      .get('.yam3x-date-picker__actions .yam3x-date-picker__text-action:last-child')
      .trigger('click')
    expect(wrapper.getComponent(DatePicker).emitted('update:modelValue')).toEqual([['2026-10-04']])
  })
  it('keeps a provisional range when an equivalent model object is rendered again', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(DateRangePicker, {
            mode: 'modal',
            open: true,
            initialDate: '2026-10-04',
            modelValue: { start: '2026-10-04', end: null },
          }),
      },
    })
    await wrapper.get('button[data-date="2026-10-07"]').trigger('click')
    await wrapper.setProps({ locale: 'zh-CN' })
    await wrapper
      .get('.yam3x-date-picker__actions .yam3x-date-picker__text-action:last-child')
      .trigger('click')
    expect(wrapper.getComponent(DateRangePicker).emitted('update:modelValue')).toEqual([
      [{ start: '2026-10-04', end: '2026-10-07' }],
    ])
  })
  it('uses the new language for a fresh edit after the field has been emptied', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(DatePicker, { mode: 'docked' }) },
    })
    await wrapper.get('input').setValue('')
    await wrapper.setProps({ locale: 'de-DE' })
    await wrapper.get('input').setValue('10.05.2026')
    await wrapper.get('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.getComponent(DatePicker).emitted('update:modelValue')).toEqual([['2026-05-10']])
  })
  it.each(['bad date', '10/05/2026'])(
    'keeps parsing context aligned after confirming a manual edit with Enter: %s',
    async (text) => {
      const wrapper = mount(LocaleProvider, {
        props: { locale: 'en-US' },
        slots: {
          default: () => h(DatePicker, { mode: 'modal', open: true, modelValue: '2026-10-05' }),
        },
      })
      await wrapper.get('[aria-label="Enter date manually"]').trigger('click')
      const input = wrapper.get('input')
      await input.setValue(text)
      await wrapper.setProps({ locale: 'de-DE' })
      await input.trigger('keydown', { key: 'Enter' })
      expect((input.element as HTMLInputElement).value).toBe('5.10.2026')
      await wrapper
        .get('.yam3x-date-picker__actions .yam3x-date-picker__text-action:last-child')
        .trigger('click')
      expect(wrapper.getComponent(DatePicker).emitted('update:modelValue')).toEqual([
        ['2026-10-05'],
      ])
    },
  )
  it('formats controlled docked range values on mount and after inherited locale updates', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(DateRangePicker, {
            mode: 'docked',
            modelValue: { start: '2026-10-05', end: '2026-10-07' },
          }),
      },
    })
    expect(wrapper.get<HTMLInputElement>('input[id$="-start"]').element.value).toBe('10/5/2026')
    expect(wrapper.get<HTMLInputElement>('input[id$="-end"]').element.value).toBe('10/7/2026')
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get<HTMLInputElement>('input[id$="-start"]').element.value).toBe('2026/10/5')
    expect(wrapper.get<HTMLInputElement>('input[id$="-end"]').element.value).toBe('2026/10/7')
    expect(wrapper.getComponent(DateRangePicker).emitted('update:modelValue')).toBeUndefined()
  })
  it('renders concurrent scoped languages without sharing labels across SSR trees', async () => {
    const render = (locale: string) =>
      renderToString(
        h(LocaleProvider, { locale }, { default: () => h(DateRangePicker, { mode: 'docked' }) }),
      )
    const [english, chinese] = await Promise.all([render('en-US'), render('zh-CN')])
    expect(english).toContain('Start date')
    expect(english).not.toContain('开始日期')
    expect(chinese).toContain('开始日期')
    expect(chinese).not.toContain('Start date')
  })
})
