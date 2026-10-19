import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import { Cascader, type CascaderOption } from '../../../../registry/components/cascader'
import { LocaleProvider } from '../../../../registry/components/localization'
import OptionPanel from '../../../../registry/components/option/option-panel.vue'
import {
  cascaderPaths,
  resolveCascaderPath,
  validateCascaderOptions,
} from '../../../../registry/components/cascader/cascader.utils'

enableAutoUnmount(afterEach)
const options: CascaderOption[] = [
  {
    value: 'east',
    label: 'East',
    children: [
      { value: 'shared', label: 'Shared' },
      { value: 'locked', label: 'Locked', disabled: true },
    ],
  },
  {
    value: 'west',
    label: 'West',
    children: [
      { value: 'shared', label: 'Shared' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    value: 'blocked',
    label: 'Blocked',
    disabled: true,
    children: [{ value: 'child', label: 'Hidden disabled child' }],
  },
]
async function choose(panel: HTMLElement, level: number, value: string) {
  const option = [
    ...panel.querySelectorAll<HTMLElement>(`[data-cascader-level="${level}"] [role="option"]`),
  ].find((element) => element.dataset.value === value)!
  option.click()
  await flushPromises()
}
function search(panel: HTMLElement, query: string) {
  const input = panel.querySelector<HTMLInputElement>('input[type="search"]')!
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
}
it('cascader.path.commit: exploring branches changes the draft without committing and accepts a complete leaf path', async () => {
  const wrapper = mount(Cascader, {
    attachTo: document.body,
    props: { options, label: 'Location', name: 'location' },
  })
  wrapper.vm.show()
  await flushPromises()
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  await choose(panel, 0, 'west')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await choose(panel, 1, 'shared')
  await flushPromises()
  expect(wrapper.emitted('update:modelValue')).toEqual([[['west', 'shared']]])
  expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('["west","shared"]')
  expect(wrapper.get('.yam3x-cascader__trigger').text()).toContain('West / Shared')
})
it('cascader.path.commit: replacing an ancestor discards its draft suffix without changing the accepted path', async () => {
  const wrapper = mount(Cascader, {
    attachTo: document.body,
    props: { options, label: 'Location', modelValue: ['east', 'shared'] },
  })
  wrapper.vm.show()
  await flushPromises()
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  await choose(panel, 0, 'west')
  expect(panel.querySelector('.yam3x-cascader__path')?.textContent).toBe('West')
  expect(wrapper.get('.yam3x-cascader__trigger').text()).toContain('East / Shared')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})
it('cascader.path.commit: cancels acceptance while retaining the accepted path', async () => {
  const onBeforeinput = vi.fn((event: Event) => event.preventDefault())
  const wrapper = mount(Cascader, {
    attachTo: document.body,
    props: { options, label: 'Location', modelValue: ['east', 'shared'], onBeforeinput },
  })
  wrapper.vm.show()
  await flushPromises()
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  await choose(panel, 0, 'west')
  expect(onBeforeinput).not.toHaveBeenCalled()
  await choose(panel, 1, 'other')
  expect(onBeforeinput).toHaveBeenCalledOnce()
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.get('.yam3x-cascader__trigger').attributes('aria-expanded')).toBe('true')
})
it('cascader.path.commit: permits explicit intermediate selection without making branch exploration commit values', async () => {
  const wrapper = mount(Cascader, {
    attachTo: document.body,
    props: { options, label: 'Location', selectBranches: true },
  })
  wrapper.vm.show()
  await flushPromises()
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  await choose(panel, 0, 'east')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  ;[...panel.querySelectorAll<HTMLButtonElement>('button')]
    .find((button) => button.textContent === 'Select this path')!
    .click()
  await flushPromises()
  expect(wrapper.emitted('update:modelValue')).toEqual([[['east']]])
})
it('cascader.search.paths: matches complete paths, reconciles the Tab entry, and retains disabled ancestry', async () => {
  const wrapper = mount(Cascader, {
    attachTo: document.body,
    props: { options, label: 'Location', searchable: true },
  })
  wrapper.vm.show()
  await flushPromises()
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  search(panel, 'East / Shared')
  await flushPromises()
  expect(panel.querySelectorAll('[role="option"]')).toHaveLength(1)
  search(panel, 'West / Other')
  await flushPromises()
  const option = panel.querySelector<HTMLElement>('[role="option"]')!
  expect(option.tabIndex).toBe(0)
  option.click()
  await flushPromises()
  expect(wrapper.emitted('update:modelValue')).toEqual([[['west', 'other']]])
  wrapper.vm.show()
  await flushPromises()
  search(panel, 'Blocked')
  await flushPromises()
  expect(panel.querySelector('[role="option"]')?.getAttribute('aria-disabled')).toBe('true')
})
it('cascader.form.native: preserves unknown accepted paths across catalog changes and resets initial native values', async () => {
  const form = document.createElement('form')
  form.id = 'cascader-external-form'
  document.body.append(form)
  try {
    const wrapper = mount(Cascader, {
      attachTo: document.body,
      props: {
        options,
        label: 'Location',
        form: form.id,
        name: 'location',
        modelValue: ['missing', 'unknown'],
        required: true,
      },
    })
    await wrapper.setProps({ options: [] })
    expect(wrapper.get('.yam3x-cascader__trigger').text()).toContain('missing / unknown')
    expect(new FormData(form).get('location')).toBe('["missing","unknown"]')
    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.get<HTMLSelectElement>('select').element.validity.valueMissing).toBe(true)
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true })
    form.reset()
    await flushPromises()
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('')
    form.reset()
    await flushPromises()
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('["missing","unknown"]')
  } finally {
    form.remove()
  }
})
it('cascader.path.commit: validates sibling identity and cycles while allowing repeated values in distinct branches', () => {
  expect(() => validateCascaderOptions(options)).not.toThrow()
  expect(cascaderPaths(options, false).map((path) => path.values)).toContainEqual([
    'west',
    'shared',
  ])
  expect(resolveCascaderPath(options, ['blocked', 'child']).disabled).toBe(true)
  expect(() =>
    validateCascaderOptions([
      { value: 'x', label: 'One' },
      { value: 'x', label: 'Two' },
    ]),
  ).toThrow('sibling')
  const cyclic: CascaderOption = { value: 'cycle', label: 'Cycle' }
  cyclic.children = [cyclic]
  expect(() => validateCascaderOptions([cyclic])).toThrow('acyclic')
})
it('cascader.form.native: server rendering isolates localized dialogs and serializes path values unambiguously', async () => {
  async function render(locale: string) {
    const context: SSRContext = {}
    const html = await renderToString(
      h(
        LocaleProvider,
        { locale },
        {
          default: () =>
            h(Cascader, {
              options,
              label: 'Location',
              searchable: true,
              open: true,
              modelValue: ['east', 'shared'],
            }),
        },
      ),
      context,
    )
    return html + context.teleports?.body
  }
  const [english, chinese] = await Promise.all([render('en-US'), render('zh-CN')])
  expect(english).toContain('Search paths')
  expect(english).not.toContain('搜索路径')
  expect(chinese).toContain('搜索路径')
  expect(english).toContain('[&quot;east&quot;,&quot;shared&quot;]')
})

it('cascader.dialog.focus: type-ahead changes list focus without committing a path', async () => {
  const wrapper = mount(Cascader, {
    attachTo: document.body,
    props: { options, label: 'Location' },
  })
  wrapper.vm.show()
  await flushPromises()
  const panel = wrapper.getComponent(OptionPanel).vm.panel!
  const east = panel.querySelector<HTMLElement>('[data-value="east"]')!
  east.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', bubbles: true }))
  await flushPromises()
  expect((document.activeElement as HTMLElement).dataset.value).toBe('west')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('cascader.search.paths: locale changes preserve the open draft, query, and accepted path while explicit text wins', async () => {
  const locale = ref('en-US')
  const searchLabel = ref<string>()
  const wrapper = mount(
    () =>
      h(
        LocaleProvider,
        {
          locale: locale.value,
          messages: { cascader: { noResults: 'Custom empty' } },
        },
        {
          default: () =>
            h(Cascader, {
              options,
              label: 'Location',
              searchable: true,
              modelValue: ['east', 'shared'],
              searchLabel: searchLabel.value,
            }),
        },
      ),
    { attachTo: document.body },
  )
  const picker = wrapper.getComponent(Cascader)
  picker.vm.show()
  await flushPromises()
  const panel = picker.getComponent(OptionPanel).vm.panel!
  await choose(panel, 0, 'west')
  search(panel, 'missing')
  await flushPromises()
  expect(panel.textContent).toContain('Custom empty')
  locale.value = 'zh-CN'
  await flushPromises()
  expect(panel.textContent).toContain('搜索路径')
  expect(panel.textContent).toContain('West')
  expect(panel.querySelector<HTMLInputElement>('input')!.value).toBe('missing')
  expect(picker.get('.yam3x-cascader__trigger').text()).toContain('East / Shared')
  expect(picker.get('.yam3x-cascader__trigger').attributes('aria-expanded')).toBe('true')
  expect(picker.emitted('update:modelValue')).toBeUndefined()
  searchLabel.value = 'Find destination'
  await flushPromises()
  expect(panel.textContent).toContain('Find destination')
  expect(panel.textContent).not.toContain('搜索路径')
})
