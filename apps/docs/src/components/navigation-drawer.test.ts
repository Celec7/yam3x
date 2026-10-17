import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerSection,
} from '@registry/components/navigation-drawer'

function mountDrawer(mode: 'modal' | 'standard' = 'modal') {
  return mount(NavigationDrawer, {
    attachTo: document.body,
    props: {
      mode,
      ...(mode === 'modal' ? { open: true } : {}),
      selected: 'inbox',
      label: 'Main navigation',
      navigationLabel: 'Primary destinations',
      onSelect: (_value: string, _href: string | undefined, event: MouseEvent) => {
        event.preventDefault()
      },
    },
    slots: {
      close: ({ close }: { close: () => void }) =>
        h('button', { type: 'button', 'aria-label': 'Close navigation', onClick: close }),
      toggle: ({
        expanded,
        controls,
        toggle,
      }: {
        expanded: boolean
        controls: string
        toggle: () => void
      }) =>
        h('button', {
          type: 'button',
          'aria-label': 'Toggle navigation',
          'aria-expanded': expanded,
          'aria-controls': controls,
          onClick: toggle,
        }),
      default: () => [
        h(
          NavigationDrawerSection,
          { label: 'Mail' },
          {
            default: () => [
              h(NavigationDrawerItem, { value: 'inbox', label: 'Inbox', href: '#inbox' }),
              h(NavigationDrawerItem, { value: 'sent', label: 'Sent', href: '#sent' }),
            ],
          },
        ),
      ],
    },
  })
}

describe('NavigationDrawer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('allows modal-capable modes without an in-panel close control', async () => {
    for (const mode of ['modal', 'auto'] as const) {
      const wrapper = mount(NavigationDrawer, {
        attachTo: document.body,
        props: {
          mode,
          open: true,
          selected: 'inbox',
          label: 'Main navigation',
        },
      })

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
      await wrapper.get('[role="dialog"]').trigger('keydown', { key: 'Escape' })
      await nextTick()
      expect(wrapper.get('.yam3x-drawer__panel').attributes('aria-hidden')).toBe('true')
      wrapper.unmount()
    }
  })

  it('provides separately named modal and navigation landmarks', async () => {
    const wrapper = mountDrawer()
    await nextTick()
    await nextTick()

    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('Main navigation')
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Primary destinations')
    expect(document.activeElement).toBe(wrapper.get('a[href="#inbox"]').element)
    wrapper.unmount()
  })

  it('closes a modal drawer after a destination is selected, even when the app handles its link', async () => {
    const wrapper = mountDrawer()
    await wrapper.get('a[href="#sent"]').trigger('click', { button: 0 })
    await nextTick()

    expect(wrapper.get('.yam3x-drawer__panel').attributes('aria-hidden')).toBe('true')
    expect(wrapper.emitted('select')?.[0]?.slice(0, 2)).toEqual(['sent', '#sent'])
    expect(wrapper.emitted('change')?.[0]).toEqual([false, 'select'])
    wrapper.unmount()
  })

  it('keeps a standard drawer non-modal and closes it through its supplied control', async () => {
    const wrapper = mountDrawer('standard')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Primary destinations')
    expect(wrapper.get('button[aria-label="Toggle navigation"]').attributes('aria-expanded')).toBe(
      'true',
    )
    await wrapper.get('button[aria-label="Toggle navigation"]').trigger('click')
    await nextTick()
    expect(wrapper.emitted('change')?.[0]).toEqual([false, 'toggle'])
    expect(wrapper.get('.yam3x-drawer__panel').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
})
