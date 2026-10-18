import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '../../../../registry/components/localization'
import { useComponentLocale } from '../../../../registry/components/localization/context'
import type { LocaleOverrides } from '../../../../registry/components/localization'
import Calendar from '../../../../registry/components/calendar/calendar.vue'
import NumberField from '../../../../registry/components/number-field/number-field.vue'
import Pagination from '../../../../registry/components/pagination/pagination.vue'
import TreeView from '../../../../registry/components/tree-view/tree-view.vue'
import FileUpload from '../../../../registry/components/file-upload/file-upload.vue'
import DataTable from '../../../../registry/components/data-table/data-table.vue'
import Form from '../../../../registry/components/form/form.vue'

enableAutoUnmount(afterEach)
const Probe = defineComponent({
  props: { locale: String, next: String },
  setup(props) {
    const { locale, messages } = useComponentLocale(
      'pagination',
      () => props.locale,
      () => ({ next: props.next }),
    )
    return () => h('output', `${locale.value}|${messages.value.next}|${messages.value.previous}`)
  },
})
describe('shared localization', () => {
  it('retains standalone English defaults and falls back from invalid locale tags', () => {
    expect(mount(Probe).text()).toBe('en-US|Next page|Previous page')
    expect(mount(Probe, { props: { locale: 'not_a_locale' } }).text()).toBe(
      'en-US|Next page|Previous page',
    )
  })
  it('updates language and messages reactively without remounting or changing page identity', async () => {
    const locale = ref('en-US')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            LocaleProvider,
            { locale: locale.value },
            { default: () => h(Pagination, { total: 200, page: 5 }) },
          ),
      }),
    )
    const element = wrapper.getComponent(Pagination).element
    expect(wrapper.text()).toContain('41–50 of 200 results')
    locale.value = 'zh-CN'
    await wrapper.vm.$nextTick()
    expect(wrapper.getComponent(Pagination).element).toBe(element)
    expect(wrapper.text()).toContain('第 41–50 条，共 200 条')
    expect(wrapper.find('[aria-current="page"]').text()).toBe('5')
    expect(wrapper.getComponent(Pagination).emitted('change')).toBeUndefined()
  })
  it('merges overrides per key and preserves explicit empty translations', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages: { pagination: { next: '继续', previous: undefined } } },
      slots: { default: () => h(Probe, { next: '' }) },
    })
    expect(wrapper.text()).toBe('zh-CN||上一页')
  })
  it('inherits nested messages in the same language and resets them on a language boundary', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US', messages: { pagination: { next: 'Forward' } } },
      slots: {
        default: () => [
          h(
            LocaleProvider,
            { locale: 'en-GB', messages: { pagination: { previous: 'Back' } } },
            { default: () => h(Probe) },
          ),
          h(LocaleProvider, { locale: 'zh-CN' }, { default: () => h(Probe) }),
        ],
      },
    })
    expect(wrapper.findAll('output').map((el) => el.text())).toEqual([
      'en-GB|Forward|Back',
      'zh-CN|下一页|上一页',
    ])
  })
  it('gives component locale and messages precedence without leaking a different language', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages: { pagination: { next: '继续' } } },
      slots: { default: () => h(Probe, { locale: 'en-US', next: 'Proceed' }) },
    })
    expect(wrapper.text()).toBe('en-US|Proceed|Previous page')
  })
  it('uses English text for untranslated locales while retaining their number formatting', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'de-DE' },
      slots: { default: () => h(Pagination, { total: 2000 }) },
    })
    expect(wrapper.text()).toContain('of 2.000 results')
  })
  it('keeps separately mounted application trees isolated', () => {
    const first = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: { default: () => h(Probe) },
    })
    const second = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(Probe) },
    })
    expect(first.text()).toContain('下一页')
    expect(second.text()).toContain('Next page')
  })
  it('isolates concurrent server-rendered provider trees', async () => {
    const render = (locale: string) =>
      renderToString(h(LocaleProvider, { locale }, { default: () => h(Probe) }))
    const [chinese, english] = await Promise.all([render('zh-CN'), render('en-US')])
    expect(chinese).toContain('下一页')
    expect(english).toContain('Next page')
    expect(english).not.toContain('下一页')
  })
  it('uses the inherited locale for table sorting without changing selected keys', async () => {
    const locale = ref('en-US')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            LocaleProvider,
            { locale: locale.value },
            {
              default: () =>
                h(DataTable<{ name: string }>, {
                  caption: 'Records',
                  columns: [
                    {
                      id: 'name',
                      label: 'Name',
                      value: (row: { name: string }) => row.name,
                      sortable: true,
                    },
                  ],
                  rows: [{ name: 'å' }, { name: 'z' }],
                  rowKey: (row: { name: string }) => row.name,
                  sort: { column: 'name', direction: 'ascending' },
                  selectedKeys: ['å'],
                  selectable: true,
                }),
            },
          ),
      }),
    )
    expect(wrapper.findAll('tbody tr').map((row) => row.attributes('data-row-key'))).toEqual([
      'å',
      'z',
    ])
    locale.value = 'sv-SE'
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('tbody tr').map((row) => row.attributes('data-row-key'))).toEqual([
      'z',
      'å',
    ])
    expect(wrapper.get('tr[data-row-key="å"] input').element).toHaveProperty('checked', true)
    expect(wrapper.getComponent(DataTable).emitted('update:selectedKeys')).toBeUndefined()
  })
  it('reformats a pending numeric edit through inherited locale changes without committing it', async () => {
    const locale = ref('en-US')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            LocaleProvider,
            { locale: locale.value },
            {
              default: () => h(NumberField, { label: 'Amount', modelValue: 1234.5 }),
            },
          ),
      }),
    )
    const number = wrapper.getComponent(NumberField)
    const input = number.get<HTMLInputElement>('input[role="spinbutton"]')
    await input.setValue('1250.75')
    locale.value = 'de-DE'
    await wrapper.vm.$nextTick()
    expect(input.element.value).toBe('1.250,75')
    expect(input.attributes('lang')).toBe('de-DE')
    expect(number.emitted('update:modelValue')).toBeUndefined()
    await input.trigger('blur')
    expect(number.emitted('update:modelValue')).toEqual([[1250.75]])
  })
  it('formats numeric bounds for shared message functions and preserves local string overrides', async () => {
    const wrapper = mount(LocaleProvider, {
      props: {
        locale: 'de-DE',
        messages: {
          numberField: {
            rangeUnderflow: (minimum) => `Minimum: ${minimum}`,
            increment: (label) => `Add ${label}`,
          },
        },
      },
      slots: {
        default: () =>
          h(NumberField, { label: 'Amount', min: 1000.5, messages: { increment: 'More' } }),
      },
    })
    const input = wrapper.get('input[role="spinbutton"]')
    await input.setValue('3')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('Minimum: 1.000,5')
    expect(wrapper.find('[aria-label="More"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Add Amount"]').exists()).toBe(false)
  })
  it('preserves invalid numeric edits and an explicit field locale across provider updates', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(NumberField, {
            label: 'Amount',
            locale: 'fr-FR',
            messages: { badInput: 'Invalid amount' },
          }),
      },
    })
    const input = wrapper.get<HTMLInputElement>('input[role="spinbutton"]')
    await input.setValue('-')
    await input.trigger('blur')
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(input.element.value).toBe('-')
    expect(input.attributes('lang')).toBe('fr-FR')
    expect(wrapper.text()).toContain('Invalid amount')
    expect(wrapper.getComponent(NumberField).emitted('update:modelValue')).toBeUndefined()
  })
  it('inherits Calendar text and formatting without resetting its displayed period or selection', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(Calendar, { modelValue: '2026-10-05' }) },
    })
    const calendar = wrapper.getComponent(Calendar)
    await calendar.get('[aria-label="Next month"]').trigger('click')
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(calendar.get('[role="grid"]').attributes('aria-label')).toBe('2026年11月')
    expect(calendar.attributes('aria-label')).toBe('日历')
    expect(calendar.find('[aria-label="下个月"]').exists()).toBe(true)
    expect(calendar.emitted('update:modelValue')).toBeUndefined()
    expect(calendar.emitted('change')).toBeUndefined()
  })
  it('gives Calendar label props priority over scoped messages, including empty overrides', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages: { calendar: { nextMonth: '继续', label: '共享日历' } } },
      slots: {
        default: () =>
          h(Calendar, { label: 'Dates', nextMonthLabel: '', previousMonthLabel: 'Back' }),
      },
    })
    const calendar = wrapper.getComponent(Calendar)
    expect(calendar.attributes('aria-label')).toBe('Dates')
    expect(calendar.get('.yam3x-calendar__nav').attributes('aria-label')).toBe('Back')
    expect(calendar.findAll('.yam3x-calendar__nav')[1]!.attributes('aria-label')).toBe('')
  })
  it('localizes Calendar range and special-date descriptions with explicit descriptions taking priority', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () =>
          h(Calendar, {
            startAt: '2026-10-05',
            selection: 'range',
            rangeStart: '2026-10-05',
            rangeEnd: '2026-10-08',
            isSpecialDate: (date: string) => date === '2026-10-09',
            specialDateLabel: 'Holiday',
          }),
      },
    })
    expect(wrapper.get('[data-date="2026-10-05"]').attributes('aria-description')).toBe('范围开始')
    expect(wrapper.get('[data-date="2026-10-06"]').attributes('aria-description')).toBe(
      '已选范围内',
    )
    expect(wrapper.get('[data-date="2026-10-08"]').attributes('aria-description')).toBe('范围结束')
    expect(wrapper.get('[data-date="2026-10-09"]').attributes('aria-description')).toBe('Holiday')
  })
  it('retains Calendar browser-locale fallback while a provider takes priority', () => {
    const language = vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
    try {
      const standalone = mount(Calendar, { props: { startAt: '2026-10-05' } })
      expect(standalone.get('[role="grid"]').attributes('aria-label')).toBe('Oktober 2026')
      const scoped = mount(LocaleProvider, {
        props: { locale: 'en-US' },
        slots: { default: () => h(Calendar, { startAt: '2026-10-05' }) },
      })
      expect(scoped.get('[role="grid"]').attributes('aria-label')).toBe('October 2026')
    } finally {
      language.mockRestore()
    }
  })
  it('keeps an explicit Calendar language independent of a differently translated provider', () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages: { calendar: { nextMonth: '继续' } } },
      slots: { default: () => h(Calendar, { locale: 'en-US' }) },
    })
    expect(wrapper.find('[aria-label="Next month"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="继续"]').exists()).toBe(false)
  })
  it('uses scoped Calendar message functions for period, month, and year choices', async () => {
    const wrapper = mount(LocaleProvider, {
      props: {
        locale: 'en-US',
        messages: {
          calendar: {
            choosePeriod: (period) => `Period: ${period}`,
            chooseMonth: (year) => `Months: ${year}`,
            chooseYear: (period) => `Years: ${period}`,
          },
        },
      },
      slots: { default: () => h(Calendar, { startAt: '2026-10-05' }) },
    })
    const calendar = wrapper.getComponent(Calendar)
    expect(calendar.get('.yam3x-calendar__period').attributes('aria-label')).toBe(
      'Period: October 2026',
    )
    await calendar.get('.yam3x-calendar__period').trigger('click')
    expect(calendar.get('[role="listbox"]').attributes('aria-label')).toMatch(/^Years: /)
    await calendar.get('[role="option"][aria-selected="true"]').trigger('click')
    expect(calendar.get('[role="listbox"]').attributes('aria-label')).toBe('Months: 2026')
  })
  it('keeps the focused Calendar date when locale changes reorder the week rows', async () => {
    const wrapper = mount(LocaleProvider, {
      attachTo: document.body,
      props: { locale: 'en-US' },
      slots: { default: () => h(Calendar, { modelValue: '2026-10-04' }) },
    })
    const day = wrapper.get<HTMLButtonElement>('[data-date="2026-10-04"]')
    day.element.focus()
    await wrapper.setProps({ locale: 'de-DE' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('[data-date="2026-10-04"]').element)
    expect(wrapper.getComponent(Calendar).emitted('change')).toBeUndefined()
  })
  it('renders Calendar with isolated per-request provider language and messages', async () => {
    const render = (locale: string, nextMonth: string) =>
      renderToString(
        h(
          LocaleProvider,
          { locale, messages: { calendar: { nextMonth } } },
          { default: () => h(Calendar, { startAt: '2026-10-05' }) },
        ),
      )
    const [english, chinese] = await Promise.all([
      render('en-US', 'Forward'),
      render('zh-CN', '继续'),
    ])
    expect(english).toContain('aria-label="Forward"')
    expect(english).toContain('October 2026')
    expect(english).not.toContain('继续')
    expect(chinese).toContain('aria-label="继续"')
    expect(chinese).toContain('2026年10月')
    expect(chinese).not.toContain('Forward')
  })
  it('supplies all migrated namespaces from one provider', async () => {
    const messages: LocaleOverrides = { form: { summary: '自定义摘要' } }
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'zh-CN', messages },
      slots: {
        default: () => [
          h(TreeView, { label: 'Records', nodes: [] }),
          h(FileUpload, { label: 'Files' }),
          h(DataTable, { caption: 'Table', columns: [], rows: [], rowKey: () => 0 }),
          h(
            Form,
            { submit: () => undefined },
            {
              default: () => [
                h('input', { required: true, name: 'title', 'aria-label': 'Title' }),
                h('button', { type: 'submit' }, 'Send'),
              ],
            },
          ),
        ],
      },
    })
    expect(wrapper.text()).toContain('暂无条目')
    expect(wrapper.text()).toContain('选择文件')
    expect(wrapper.text()).toContain('暂无记录')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('自定义摘要')
  })
})
