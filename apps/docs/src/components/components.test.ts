import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import Card from '../../../../registry/components/card/card.vue'
import Button from '../../../../registry/components/button/button.vue'
import ToggleButton from '../../../../registry/components/button/toggle-button.vue'
import FilterChip from '../../../../registry/components/filter-chip/filter-chip.vue'
import FloatingActionButton from '../../../../registry/components/fab/floating-action-button.vue'
import ExtendedFloatingActionButton from '../../../../registry/components/fab/extended-fab.vue'
import IconButton from '../../../../registry/components/icon-button/icon-button.vue'
import IconToggleButton from '../../../../registry/components/icon-button/icon-toggle-button.vue'
import NavigationBar from '../../../../registry/components/navigation-bar/navigation-bar.vue'
import NavigationBarItem from '../../../../registry/components/navigation-bar/navigation-bar-item.vue'
import Avatar from '../../../../registry/components/avatar/avatar.vue'
import ToggleFloatingActionButton from '../../../../registry/components/fab/toggle-floating-action-button.vue'
import FloatingActionButtonMenu from '../../../../registry/components/fab-menu/floating-action-button-menu.vue'
import FloatingActionButtonMenuItem from '../../../../registry/components/fab-menu/floating-action-button-menu-item.vue'

describe('native Material components', () => {
  it('exports the composable FAB menu and toggle FAB APIs', async () => {
    const fabMenuApi = await import('../../../../registry/components/fab-menu')
    const fabApi = await import('../../../../registry/components/fab')

    expect(fabMenuApi.FloatingActionButtonMenu).toBeDefined()
    expect(fabMenuApi.FloatingActionButtonMenuItem).toBeDefined()
    expect(fabApi.ToggleFloatingActionButton).toBeDefined()
    expect(fabMenuApi.FabMenu).toBeDefined()
  })
  it('composes a toggle FAB with menu items and closes with focus restoration', async () => {
    const Harness = defineComponent({
      components: {
        FloatingActionButtonMenu,
        FloatingActionButtonMenuItem,
        ToggleFloatingActionButton,
      },
      setup() {
        return { expanded: ref(false) }
      },
      template: `<FloatingActionButtonMenu v-model:expanded="expanded" label="Create actions">
        <template #trigger="{ triggerProps }">
          <ToggleFloatingActionButton v-bind="triggerProps" v-model:checked="expanded" aria-label="Create" />
        </template>
        <FloatingActionButtonMenuItem value="camera" label="Take photo" />
        <FloatingActionButtonMenuItem value="upload" label="Upload file" />
      </FloatingActionButtonMenu>`,
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    const trigger = wrapper.get('button')

    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    await nextTick()
    await nextTick()

    const menu = document.body.querySelector('[role="menu"]')
    expect(menu?.getAttribute('aria-label')).toBe('Create actions')
    expect(menu?.getAttribute('aria-hidden')).toBe('false')
    const items = Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    expect(items.map((item) => item.textContent)).toEqual(['Take photo', 'Upload file'])
    expect(items[0]?.tabIndex).toBe(0)
    expect(items[1]?.tabIndex).toBe(-1)
    expect(trigger.attributes('aria-expanded')).toBe('true')

    items[0]!.focus()
    items[0]!.click()
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })
  it('exposes a controlled checked state and accessible toggle semantics on Toggle FAB', async () => {
    const wrapper = mount(ToggleFloatingActionButton, {
      attrs: { 'aria-label': 'Create actions' },
      slots: { icon: '<span>Icon</span>' },
    })

    expect(wrapper.attributes('aria-pressed')).toBe('false')
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true])
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    wrapper.unmount()
  })
  it('separates icon-only FABs from expandable Extended FABs', async () => {
    const onFabClick = vi.fn()
    const onExtendedFabClick = vi.fn()
    const fab = mount(FloatingActionButton, {
      props: { size: 'default', variant: 'primary', onClick: onFabClick },
      attrs: { 'aria-label': 'Create project' },
      slots: { default: '<svg data-test="icon"></svg>' },
    })
    const extended = mount(ExtendedFloatingActionButton, {
      props: {
        size: 'small',
        expanded: false,
        variant: 'secondary',
        onClick: onExtendedFabClick,
      },
      slots: {
        icon: '<svg data-test="extended-icon"></svg>',
        default: 'Create project',
      },
    })

    expect(fab.classes()).toContain('yam3x-floating-action-button')
    expect(fab.classes()).toContain('yam3x-floating-action-button--default')
    expect(fab.classes()).not.toContain('yam3x-extended-fab')
    expect(fab.find('[data-test="icon"]').exists()).toBe(true)
    expect(fab.text()).toBe('')
    await fab.trigger('click')
    expect(onFabClick).toHaveBeenCalledOnce()

    expect(extended.classes()).toContain('yam3x-extended-fab')
    expect(extended.classes()).toContain('yam3x-extended-fab--small')
    expect(extended.classes()).toContain('yam3x-extended-fab--collapsed')
    expect(extended.find('[data-test="extended-icon"]').exists()).toBe(true)
    expect(extended.get('.yam3x-fab__label').text()).toBe('Create project')
    await extended.setProps({ expanded: true })
    expect(extended.classes()).toContain('yam3x-extended-fab--expanded')
    await extended.trigger('click')
    expect(onExtendedFabClick).toHaveBeenCalledOnce()

    fab.unmount()
    extended.unmount()
  })

  it('uses component-specific sizes, colors, classes, and custom properties', () => {
    const fab = mount(FloatingActionButton, {
      props: { size: 'medium', variant: 'tertiary-container', lowered: true },
      slots: { default: '<svg></svg>' },
    })
    const extended = mount(ExtendedFloatingActionButton, {
      props: { size: 'large', variant: 'secondary' },
      slots: { default: 'Create', icon: '<svg></svg>' },
    })

    expect(fab.classes()).toContain('yam3x-floating-action-button--medium')
    expect(fab.classes()).toContain('yam3x-floating-action-button--tertiary-container')
    expect(fab.classes()).toContain('yam3x-floating-action-button--lowered')
    expect(fab.attributes('style')).toContain(
      '--yam3x-floating-action-button-medium-container-height',
    )
    expect(fab.attributes('style')).toContain(
      '--yam3x-tertiary-container-floating-action-button-container-color',
    )

    expect(extended.classes()).toContain('yam3x-extended-fab--large')
    expect(extended.classes()).toContain('yam3x-extended-fab--secondary')
    expect(extended.attributes('style')).toContain('--yam3x-extended-fab-large-container-height')
    expect(extended.attributes('style')).toContain('--yam3x-secondary-extended-fab-container-color')
    expect(fab.classes()).not.toContain('yam3x-fab--medium')

    fab.unmount()
    extended.unmount()
  })

  it('forwards standard FAB link and form attributes and preserves click behavior', async () => {
    const onClick = vi.fn()
    const button = mount(FloatingActionButton, {
      props: { type: 'submit', name: 'action', value: 'create', form: 'editor' },
      attrs: { 'aria-label': 'Create item' },
      slots: { default: '<svg data-test="icon"></svg>' },
    })
    const link = mount(FloatingActionButton, {
      props: { href: '#target', onClick },
      attrs: { 'aria-label': 'Create item', target: '_blank', rel: 'noreferrer' },
      slots: { default: '<svg></svg>' },
    })

    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes()).toMatchObject({
      type: 'submit',
      name: 'action',
      value: 'create',
      form: 'editor',
      'aria-label': 'Create item',
    })
    expect(link.element.tagName).toBe('A')
    expect(link.attributes()).toMatchObject({
      href: '#target',
      target: '_blank',
      rel: 'noreferrer',
      'aria-label': 'Create item',
    })

    link.element.addEventListener('click', (event: Event) => event.preventDefault(), { once: true })
    await link.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    button.unmount()
    link.unmount()
  })

  it('keeps disabled FAB links unavailable and disabled-interactive buttons focusable', async () => {
    const onClick = vi.fn()
    const disabledLink = mount(ExtendedFloatingActionButton, {
      props: { href: '#target', disabled: true, onClick },
      attrs: { 'aria-label': 'Unavailable action' },
      slots: { default: 'Create' },
    })
    const explainedButton = mount(FloatingActionButton, {
      props: { disabledInteractive: true, onClick },
      attrs: { 'aria-label': 'Unavailable but explained' },
      slots: { default: '<svg></svg>' },
    })

    expect(disabledLink.element.tagName).toBe('A')
    expect(disabledLink.attributes()).toMatchObject({
      role: 'link',
      tabindex: '-1',
      'aria-disabled': 'true',
    })
    expect(disabledLink.attributes('href')).toBeUndefined()
    expect(explainedButton.element.tagName).toBe('BUTTON')
    expect(explainedButton.attributes('disabled')).toBeUndefined()
    expect(explainedButton.attributes('aria-disabled')).toBe('true')

    await disabledLink.trigger('click')
    await explainedButton.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    disabledLink.unmount()
    explainedButton.unmount()
  })

  it('renders caller-owned avatar content and passes attributes through without adding a role', () => {
    const wrapper = mount(Avatar, {
      attrs: { 'aria-label': 'User: Jordan', hidden: true },
      slots: { default: 'JD' },
    })

    expect(wrapper.text()).toBe('JD')
    expect(wrapper.attributes('aria-label')).toBe('User: Jordan')
    expect(wrapper.attributes('hidden')).toBeDefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    wrapper.unmount()
  })

  it('defaults to a passive filled card', () => {
    const wrapper = mount(Card, { slots: { default: 'Profile details' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('yam3x-card--filled')
    expect(wrapper.classes()).not.toContain('yam3x-card--actionable')
    expect(wrapper.attributes('role')).toBeUndefined()
    wrapper.unmount()
  })

  it('supports inline horizontal layout and structured card slots', () => {
    const wrapper = mount(Card, {
      props: { orientation: 'horizontal', inline: true },
      slots: { header: 'Media', content: 'Details', actions: 'Open', footer: 'Updated today' },
    })

    expect(wrapper.classes()).toContain('yam3x-card--horizontal')
    expect(wrapper.classes()).toContain('yam3x-card--inline')
    expect(wrapper.get('.yam3x-card__header').text()).toBe('Media')
    expect(wrapper.get('.yam3x-card__content').text()).toBe('Details')
    expect(wrapper.get('.yam3x-card__content').classes()).toContain('yam3x-card__content--padded')
    expect(wrapper.get('.yam3x-card__actions').text()).toBe('Open')
    expect(wrapper.get('.yam3x-card__footer').text()).toBe('Updated today')
    wrapper.unmount()
  })

  it('leaves the default slot unpadded for caller-owned layouts', () => {
    const wrapper = mount(Card, { slots: { default: 'Profile details' } })

    expect(wrapper.get('.yam3x-card__content').classes()).not.toContain(
      'yam3x-card__content--padded',
    )
    wrapper.unmount()
  })

  it('passes submitter type, name, and value to the native card button', () => {
    const wrapper = mount(Card, {
      props: { interactive: true, type: 'submit', name: 'intent', value: 'open' },
      slots: { default: 'Submit' },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('name')).toBe('intent')
    expect(wrapper.attributes('value')).toBe('open')
    wrapper.unmount()
  })

  it('keeps disabledInteractive action cards focusable while suppressing activation', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Card, {
      props: { interactive: true, disabledInteractive: true, onClick },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.element.tabIndex).toBe(0)
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('keeps disabledInteractive link cards focusable with link semantics', () => {
    const wrapper = mount(Card, { props: { href: '#target', disabledInteractive: true } })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('link')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.element.tabIndex).toBe(0)
    wrapper.unmount()
  })

  it('does not call a consumer click handler on a disabled link card', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Card, { props: { href: '#target', disabled: true, onClick } })

    await wrapper.trigger('click')

    expect(onClick).not.toHaveBeenCalled()
    expect(wrapper.attributes('href')).toBeUndefined()

    await wrapper.setProps({ disabled: false })
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
  it('renders the selected Material button variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'filled-tonal' },
      slots: { default: 'Continue' },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('yam3x-button--filled-tonal')
    expect(wrapper.text()).toContain('Continue')
  })

  it('shows optional selected toggle content and emits the checked model update', async () => {
    const onChecked = vi.fn()
    const wrapper = mount(ToggleButton, {
      props: { checked: false, 'onUpdate:checked': onChecked },
      slots: { default: 'Save', selected: 'Saved' },
    })

    expect(wrapper.text()).toBe('Save')
    expect(wrapper.attributes('aria-pressed')).toBe('false')
    await wrapper.trigger('click')
    expect(onChecked).toHaveBeenCalledWith(true)

    await wrapper.setProps({ checked: true })
    expect(wrapper.text()).toBe('Saved')
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    wrapper.unmount()
  })

  it('renders a supported filled-tonal toggle style', async () => {
    const wrapper = mount(ToggleButton, {
      props: { variant: 'filled-tonal' },
      slots: { default: 'Follow' },
    })

    expect(wrapper.classes()).toContain('yam3x-button--filled-tonal')
    await wrapper.trigger('click')
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.classes()).toContain('yam3x-button--filled-tonal')
    wrapper.unmount()
  })

  it('matches the compound navigation-bar link, selection, slots, layout, and cancellable event contract', async () => {
    const onModelUpdate = vi.fn()
    const onNavigate = vi.fn((_destination: unknown, event: MouseEvent) => event.preventDefault())
    const wrapper = mount(NavigationBar, {
      props: {
        label: 'Primary destinations',
        modelValue: 'home',
        layout: 'horizontal',
        'onUpdate:modelValue': onModelUpdate,
        onNavigate,
      },
      slots: {
        default: () => [
          h(
            NavigationBarItem,
            { value: 'home', label: 'Home', href: '/home' },
            {
              icon: ({ selected }: { selected: boolean }) =>
                selected ? 'home selected' : 'home outline',
              'selected-icon': () => 'home selected',
            },
          ),
          h(
            NavigationBarItem,
            {
              value: 'docs',
              label: 'Docs',
              ariaLabel: 'Documentation library',
              href: '/docs',
              target: '_blank',
              rel: 'noreferrer',
              download: 'docs.html',
            },
            {
              icon: () => 'docs outline',
              'selected-icon': () => 'docs selected',
              badge: () => '3 updates',
            },
          ),
          h(
            NavigationBarItem,
            {
              value: 'blocked',
              label: 'Blocked',
              href: '/blocked',
              disabledInteractive: true,
            },
            { icon: () => 'blocked' },
          ),
        ],
      },
    })

    expect(wrapper.attributes('data-layout')).toBe('horizontal')
    expect(wrapper.get('[aria-current="page"] .yam3x-navigation-bar__icon').text()).toBe(
      'home selected',
    )
    expect(wrapper.get('a[href="/docs"]').attributes()).toMatchObject({
      'aria-label': 'Documentation library',
      target: '_blank',
      rel: 'noreferrer',
      download: 'docs.html',
    })
    expect(wrapper.get('a[href="/docs"] .yam3x-navigation-bar__badge').text()).toBe('3 updates')
    expect(wrapper.get('a[aria-disabled="true"]').attributes()).toMatchObject({
      role: 'link',
      tabindex: '0',
    })
    expect(wrapper.get('a[aria-disabled="true"]').attributes('href')).toBeUndefined()

    const docs = wrapper.get('a[href="/docs"]')
    const canceledClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    docs.element.dispatchEvent(canceledClick)
    expect(canceledClick.defaultPrevented).toBe(true)
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate.mock.calls[0]?.[0]).toMatchObject({ value: 'docs', href: '/docs' })
    expect(onModelUpdate).not.toHaveBeenCalled()

    onNavigate.mockImplementation(() => {})
    const acceptedClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    // Keep Happy DOM from fetching the accepted link while exercising the component handler.
    docs.element.addEventListener('click', (event) => event.preventDefault(), { once: true })
    docs.element.dispatchEvent(acceptedClick)
    expect(onModelUpdate).toHaveBeenCalledWith('docs')
    expect(wrapper.emitted('navigate')).toHaveLength(2)

    const blockedClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    wrapper.get('a[aria-disabled="true"]').element.dispatchEvent(blockedClick)
    expect(blockedClick.defaultPrevented).toBe(true)
    expect(wrapper.emitted('navigate')).toHaveLength(2)
    wrapper.unmount()
  })

  it('keeps IconButton action-only and exposes toggle state through IconToggleButton', async () => {
    const action = mount(IconButton, {
      props: { toggle: true, selected: true },
      attrs: { 'aria-label': 'Favorite' },
      slots: { default: 'Action icon' },
    })

    expect(action.classes()).toContain('yam3x-icon-button--filled')
    expect(action.classes()).toContain('yam3x-icon-button--width-default')
    expect(action.attributes('aria-label')).toBe('Favorite')
    expect(action.attributes('aria-pressed')).toBeUndefined()
    expect(action.attributes('checked')).toBeUndefined()
    expect(action.text()).toBe('Action icon')
    action.unmount()

    const wrapper = mount(IconToggleButton, {
      attrs: { 'aria-label': 'Favorite' },
      slots: { default: 'Outline icon', 'selected-icon': 'Filled icon' },
    })
    expect(wrapper.attributes('aria-pressed')).toBe('false')
    expect(wrapper.text()).toBe('Outline icon')

    await wrapper.trigger('click')

    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toBe('Filled icon')
    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true])
    wrapper.unmount()
  })

  it('does not deselect an activated radio IconToggleButton', async () => {
    const wrapper = mount(IconToggleButton, {
      props: { checked: true, role: 'radio' },
      attrs: { 'aria-label': 'Selected option' },
    })
    await wrapper.trigger('click')
    expect(wrapper.attributes('aria-checked')).toBe('true')
    expect(wrapper.emitted('update:checked')).toBeUndefined()
    wrapper.unmount()
  })

  it('supports disabled-interactive semantics', async () => {
    const onClick = vi.fn()
    const wrapper = mount(IconButton, {
      props: { disabledInteractive: true, onClick },
      attrs: { 'aria-label': 'Explain unavailable action' },
      slots: { default: 'Action icon' },
    })

    expect(wrapper.classes()).toContain('yam3x-icon-button--filled')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(false)
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('renders href mode as a native icon link without button-only behavior', async () => {
    const onClick = vi.fn()
    const wrapper = mount(IconButton, {
      props: {
        href: '#target',
        type: 'submit',
        name: 'action',
        value: 'save',
        form: 'settings',
        onClick,
      },
      attrs: {
        'aria-label': 'Open settings',
        target: '_blank',
        rel: 'noreferrer',
        download: 'settings.json',
      },
      slots: { default: 'Settings icon' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('#target')
    expect(wrapper.attributes('aria-label')).toBe('Open settings')
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toBe('noreferrer')
    expect(wrapper.attributes('download')).toBe('settings.json')
    expect(wrapper.attributes('type')).toBeUndefined()
    expect(wrapper.attributes('name')).toBeUndefined()
    expect(wrapper.attributes('value')).toBeUndefined()
    expect(wrapper.attributes('form')).toBeUndefined()
    expect(wrapper.attributes('aria-pressed')).toBeUndefined()

    wrapper.element.addEventListener('click', (event: Event) => event.preventDefault(), {
      once: true,
    })
    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:selected')).toBeUndefined()
    wrapper.unmount()
  })

  it('preserves native submitter attributes for form participation', () => {
    const wrapper = mount(IconButton, {
      props: {
        id: 'save-action',
        type: 'submit',
        name: 'intent',
        value: 'save',
        form: 'settings-form',
      },
      attrs: { 'aria-label': 'Save settings' },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes()).toMatchObject({
      id: 'save-action',
      type: 'submit',
      name: 'intent',
      value: 'save',
      form: 'settings-form',
      'aria-label': 'Save settings',
    })
    wrapper.unmount()
  })

  it('cancels disabled icon-link activation and omits its destination', () => {
    const onClick = vi.fn()
    const wrapper = mount(IconButton, {
      props: { href: '#target', disabled: true, onClick },
      attrs: { 'aria-label': 'Unavailable destination' },
    })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('link')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')
    wrapper.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(event.cancelBubble).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('renders href mode as a native link without button-only behavior', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: {
        href: '#target',
        type: 'submit',
        name: 'action',
        value: 'save',
        form: 'settings',
        toggle: true,
        selected: false,
        onClick,
      },
      attrs: { target: '_blank', rel: 'noreferrer' },
      slots: { default: 'Open settings' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('#target')
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toBe('noreferrer')
    expect(wrapper.attributes('type')).toBeUndefined()
    expect(wrapper.attributes('name')).toBeUndefined()
    expect(wrapper.attributes('value')).toBeUndefined()
    expect(wrapper.attributes('form')).toBeUndefined()
    expect(wrapper.attributes('aria-pressed')).toBeUndefined()

    // happy-dom tries to fetch fragment navigation; keep the unit test on the component event path.
    wrapper.element.addEventListener('click', (event: Event) => event.preventDefault(), {
      once: true,
    })
    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:selected')).toBeUndefined()
    wrapper.unmount()
  })

  it('cancels and does not emit activation for a disabled link', () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: { href: '#target', disabled: true, onClick },
      slots: { default: 'Unavailable' },
    })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('link')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')
    const parent = document.createElement('div')
    const onParentClick = vi.fn()
    parent.append(wrapper.element)
    parent.addEventListener('click', onParentClick)
    wrapper.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    expect(onParentClick).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('renders the elevated variant with its expressive elevation modifier', () => {
    const wrapper = mount(Button, { props: { variant: 'elevated' }, slots: { default: 'Lifted' } })

    expect(wrapper.classes()).toContain('yam3x-button--elevated')
  })

  it('toggles a filter chip through its public selected model', async () => {
    const wrapper = mount(FilterChip, { slots: { default: 'Today' } })

    await wrapper.get('button.yam3x-filter-chip').trigger('click')

    expect(wrapper.get('button.yam3x-filter-chip').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([true])
  })

  it('replaces an optional leading chip icon with a check without rebuilding the leading space', async () => {
    const wrapper = mount(FilterChip, {
      props: { selected: false, variant: 'elevated' },
      slots: { default: 'Today', icon: '<svg aria-hidden="true" />' },
    })
    expect(wrapper.get('button.yam3x-filter-chip').classes()).toContain(
      'yam3x-filter-chip--elevated',
    )
    expect(wrapper.find('.yam3x-filter-chip__leading').exists()).toBe(true)
    expect(wrapper.find('.yam3x-filter-chip__icon').exists()).toBe(true)
    expect(wrapper.find('.yam3x-filter-chip__check').exists()).toBe(true)
    await wrapper.setProps({ selected: true })
    expect(wrapper.find('.yam3x-filter-chip__leading').exists()).toBe(true)
    expect(wrapper.get('button.yam3x-filter-chip').attributes('aria-pressed')).toBe('true')
    wrapper.unmount()
  })

  it('optimistically selects the requested destination while exposing a route-controlled model', async () => {
    const wrapper = mount(NavigationBar, {
      props: {
        modelValue: 'overview',
        label: 'Example destinations',
      },
      slots: {
        default: () => [
          h(NavigationBarItem, { label: 'Overview', value: 'overview', href: '#top' }),
          h(NavigationBarItem, { label: 'Components', value: 'components', href: '#components' }),
        ],
      },
    })

    await wrapper.get('a[href="#components"]').trigger('click')

    expect(wrapper.emitted('navigate')?.[0]?.[0]).toMatchObject({ value: 'components' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['components'])
    expect(wrapper.find('a[href="#components"]').attributes('aria-current')).toBe('page')
    expect(wrapper.find('a[href="#top"]').attributes('aria-current')).toBeUndefined()

    await wrapper.setProps({ modelValue: 'components' })
    expect(wrapper.find('a[href="#components"]').attributes('aria-current')).toBe('page')
    wrapper.unmount()
  })

  it('keeps modified and canceled navigation from requesting a route change', async () => {
    const wrapper = mount(NavigationBar, {
      props: {
        modelValue: 'overview',
        label: 'Example destinations',
      },
      slots: {
        default: () => [
          h(NavigationBarItem, { label: 'Overview', value: 'overview', href: '#top' }),
          h(NavigationBarItem, { label: 'Components', value: 'components', href: '#components' }),
        ],
      },
    })
    const link = wrapper.get('a[href="#components"]')
    await link.trigger('click', { ctrlKey: true })
    const canceled = new MouseEvent('click', { bubbles: true, cancelable: true })
    canceled.preventDefault()
    link.element.dispatchEvent(canceled)

    expect(wrapper.emitted('navigate')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('a[href="#top"]').attributes('aria-current')).toBe('page')
    wrapper.unmount()
  })
})
