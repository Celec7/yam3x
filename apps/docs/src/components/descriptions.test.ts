import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h, ref, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Descriptions, type DescriptionItem } from '../../../../registry/components/descriptions'
import { LocaleProvider } from '../../../../registry/components/localization'

enableAutoUnmount(afterEach)
it('descriptions.content.association: preserves native term/description order and labels the list from its heading', () => {
  const items: DescriptionItem[] = [
    { key: 'owner', label: 'Owner', value: 'Ada' },
    { key: 'budget', label: 'Budget', value: 0 },
  ]
  const wrapper = mount(Descriptions, {
    props: { title: 'Project details', headingLevel: 2, items },
  })
  expect(wrapper.get('h2').text()).toBe('Project details')
  expect(wrapper.get('dl').attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
  expect(wrapper.findAll('dl > div').map((group) => group.element.textContent)).toEqual([
    'OwnerAda',
    'Budget0',
  ])
  expect(wrapper.findAll('dl > div > dt + dd')).toHaveLength(2)
})
it('descriptions.content.empty: distinguishes missing values from zero, false, and an empty string', () => {
  const wrapper = mount(Descriptions, {
    props: {
      items: [
        { key: 'zero', label: 'Zero', value: 0 },
        { key: 'false', label: 'False', value: false },
        { key: 'blank', label: 'Blank', value: '' },
        { key: 'null', label: 'Null', value: null },
        { key: 'omitted', label: 'Omitted' },
      ],
    },
  })
  expect(wrapper.findAll('dd').map((value) => value.text())).toEqual([
    '0',
    'false',
    '',
    'Not provided',
    'Not provided',
  ])
})
it('descriptions.content.empty: resolves shared text reactively while retaining explicit overrides', async () => {
  const locale = ref('zh-CN')
  const wrapper = mount({
    setup: () => () =>
      h(
        LocaleProvider,
        { locale: locale.value, messages: { descriptions: { missingValue: 'Shared missing' } } },
        {
          default: () => [
            h(Descriptions, { items: [{ key: 'missing', label: 'Owner' }] }),
            h(Descriptions, { emptyText: 'Custom empty' }),
          ],
        },
      ),
  })
  expect(wrapper.get('dd').text()).toBe('Shared missing')
  expect(wrapper.text()).toContain('Custom empty')
  locale.value = 'en-US'
  await nextTick()
  expect(wrapper.get('dd').text()).toBe('Shared missing')
  expect(wrapper.text()).toContain('Custom empty')
})
it('descriptions.content.association: value slots retain application-owned interactive content', () => {
  const wrapper = mount(Descriptions, {
    props: { items: [{ key: 'contact', label: 'Contact', value: 'Ada' }] },
    slots: { value: ({ value }) => h('a', { href: 'mailto:ada@example.com' }, String(value)) },
  })
  expect(wrapper.get('dd a').attributes('href')).toBe('mailto:ada@example.com')
  expect(wrapper.get('dd a').text()).toBe('Ada')
})
it('descriptions.content.empty: empty-list slots replace built-in text without inventing terms', () => {
  const wrapper = mount(Descriptions, { slots: { empty: () => h('p', 'Details are private') } })
  expect(wrapper.find('dl').exists()).toBe(false)
  expect(wrapper.text()).toBe('Details are private')
})
it('descriptions.content.empty: isolates server-rendered localization across requests', async () => {
  const render = (locale: string) =>
    renderToString(
      h(
        LocaleProvider,
        { locale },
        { default: () => h(Descriptions, { items: [{ key: 'owner', label: 'Owner' }] }) },
      ),
    )
  const [chinese, english] = await Promise.all([render('zh-CN'), render('en-US')])
  expect(chinese).toContain('未提供')
  expect(english).toContain('Not provided')
  expect(english).not.toContain('未提供')
})
