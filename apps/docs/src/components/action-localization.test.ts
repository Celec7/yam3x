import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '../../../../registry/components/localization'
import { InlineMessage } from '../../../../registry/components/inline-message'
import { Search } from '../../../../registry/components/search'
import { DrawerContainer } from '../../../../registry/components/drawer-container'
import { Menu } from '../../../../registry/components/menu'
import { FilterChip } from '../../../../registry/components/filter-chip'
import { SnackbarProvider, useSnackbar } from '../../../../registry/components/snackbar'
import type { SnackbarApi } from '../../../../registry/components/snackbar/snackbar.context'

enableAutoUnmount(afterEach)
describe('shared action localization', () => {
  it('retains Inline message identity and focus until the localized dismiss action is activated', async () => {
    const wrapper = mount(LocaleProvider, {
      attachTo: document.body,
      props: { locale: 'en-US' },
      slots: {
        default: () => h(InlineMessage, { dismissible: true }, { default: () => 'Saved content' }),
      },
    })
    const button = wrapper.get<HTMLButtonElement>('[aria-label="Dismiss message"]')
    button.element.focus()
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get('[aria-label="关闭消息"]').element).toBe(button.element)
    expect(document.activeElement).toBe(button.element)
    expect(wrapper.text()).toContain('Saved content')
    expect(wrapper.getComponent(InlineMessage).emitted('dismiss')).toBeUndefined()
    await button.trigger('click')
    expect(wrapper.getComponent(InlineMessage).emitted('dismiss')).toHaveLength(1)
  })
  it('preserves a Search query and open state while translating action and region names', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () => h(Search, { query: 'Pending query', open: true, layout: 'docked' }),
      },
    })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Pending query')
    expect(wrapper.find('[aria-label="清除"]').exists()).toBe(true)
    expect(wrapper.getComponent(Search).emitted('update:query')).toBeUndefined()
    expect(wrapper.getComponent(Search).emitted('update:open')).toBeUndefined()
    await wrapper.get('[aria-label="清除"]').trigger('click')
    expect(wrapper.getComponent(Search).emitted('update:query')).toEqual([['']])
  })
  it('keeps drawer state and component label overrides independent of shared action updates', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(
            DrawerContainer,
            { open: true, startMode: 'side', startLabel: 'Files' },
            { start: () => h('input', { value: 'Pending edit' }) },
          ),
      },
    })
    await wrapper.setProps({
      locale: 'zh-CN',
      messages: { actions: { startPanel: 'Shared name' } },
    })
    expect(wrapper.find('[aria-label="Files"]').exists()).toBe(true)
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Pending edit')
    expect(wrapper.getComponent(DrawerContainer).props('open')).toBe(true)
    expect(wrapper.getComponent(DrawerContainer).emitted('update:open')).toBeUndefined()
  })
  it('does not alter Menu checked values or open state when its default labels change', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () => h(Menu, { items: [], checked: ['saved'], open: false }),
      },
    })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.find('[aria-label="打开菜单"]').exists()).toBe(true)
    expect(wrapper.getComponent(Menu).props('checked')).toEqual(['saved'])
    expect(wrapper.getComponent(Menu).emitted('update:checked')).toBeUndefined()
    expect(wrapper.getComponent(Menu).emitted('update:open')).toBeUndefined()
  })
  it('preserves Filter chip selection and explicit action text over shared messages', async () => {
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () =>
          h(
            FilterChip,
            { selected: true, trailingActionLabel: 'Details' },
            { default: () => 'Saved', 'trailing-action': () => 'More' },
          ),
      },
    })
    await wrapper.setProps({ locale: 'zh-CN', messages: { actions: { moreActions: 'Shared' } } })
    expect(wrapper.find('[aria-label="Details"]').exists()).toBe(true)
    expect(wrapper.getComponent(FilterChip).props('selected')).toBe(true)
    expect(wrapper.getComponent(FilterChip).emitted('update:selected')).toBeUndefined()
  })
  it('translates an active Snackbar default without replacing its message or action promise', async () => {
    let snackbar!: SnackbarApi
    const child = defineComponent({
      setup() {
        snackbar = useSnackbar()
        return () => h('span')
      },
    })
    const wrapper = mount(LocaleProvider, {
      props: { locale: 'en-US' },
      slots: {
        default: () => h(SnackbarProvider, null, { default: () => h(child) }),
      },
    })
    const result = snackbar.show({ message: 'Saved', actionLabel: 'Undo', dismissible: true })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(document.body.textContent).toContain('Saved')
    expect(document.body.textContent).toContain('Undo')
    expect(document.body.querySelector('[aria-label="关闭通知"]')).not.toBeNull()
    snackbar.dismiss()
    expect(await result).toBe('dismissed')
  })
  it('keeps concurrent SSR action configurations isolated', async () => {
    const render = (locale: string, dismissMessage: string) =>
      renderToString(
        h(
          LocaleProvider,
          { locale, messages: { actions: { dismissMessage } } },
          { default: () => h(InlineMessage, { dismissible: true }, { default: () => 'Saved' }) },
        ),
      )
    const [first, second] = await Promise.all([
      render('en-US', 'Close A'),
      render('zh-CN', '关闭 B'),
    ])
    expect(first).toContain('aria-label="Close A"')
    expect(first).not.toContain('关闭 B')
    expect(second).toContain('aria-label="关闭 B"')
    expect(second).not.toContain('Close A')
  })
})
