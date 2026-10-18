import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '../../../../registry/components/localization'
import { useComponentLocale } from '../../../../registry/components/localization/context'
import type { LocaleOverrides } from '../../../../registry/components/localization'
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
