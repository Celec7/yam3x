import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ActionList from '../../../../registry/components/list/action-list.vue'
import ExpandableListItem from '../../../../registry/components/list/expandable-list-item.vue'
import ListAction from '../../../../registry/components/list/list-action.vue'
import ListItem from '../../../../registry/components/list/list-item.vue'
import ListOption from '../../../../registry/components/list/list-option.vue'
import SelectionList from '../../../../registry/components/list/selection-list.vue'

describe('SelectionList', () => {
  it('exposes a labelled listbox for Web selection semantics', () => {
    const wrapper = mount(SelectionList, { props: { label: 'Choose a grain' } })

    const listbox = wrapper.find('ul')
    expect(listbox.element.tagName).toBe('UL')
    expect(listbox.attributes('role')).toBe('listbox')
    expect(listbox.attributes('aria-label')).toBe('Choose a grain')
  })

  it('roves focus and selects the active option with keyboard input', async () => {
    const wrapper = mount(SelectionList, {
      props: { label: 'Choose a grain', modelValue: 'rice' },
      slots: {
        default: () => [
          h(ListOption, { value: 'rice' }, () => 'Rice'),
          h(ListOption, { value: 'oats' }, () => 'Oats'),
        ],
      },
      attachTo: document.body,
    })
    await nextTick()
    const options = wrapper.findAll('[role="option"]')
    expect(options[0].attributes('tabindex')).toBe('0')
    expect(options[1].attributes('tabindex')).toBe('-1')

    await options[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[1].element)
    expect(options[1].attributes('tabindex')).toBe('0')
    await options[1].trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['oats'])
    wrapper.unmount()
  })

  it('uses option semantics and toggles multiple values without allowing deselection in single mode', async () => {
    const wrapper = mount(SelectionList, {
      props: { label: 'Choose ingredients', mode: 'multiple', modelValue: ['salt'] },
      slots: {
        default: () => [
          h(ListOption, { value: 'salt' }, () => 'Salt'),
          h(ListOption, { value: 'pepper' }, () => 'Pepper'),
        ],
      },
    })
    const options = wrapper.findAll('[role="option"]')
    expect(wrapper.find('ul').attributes('aria-multiselectable')).toBe('true')
    await options[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['salt', 'pepper']])
    await options[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['salt']])
  })

  it('keeps single selection selected and emits input events in order', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(SelectionList, {
      props: {
        label: 'Choose a grain',
        modelValue: 'rice',
        onBeforeinput: () => eventOrder.push('beforeinput'),
        'onUpdate:modelValue': () => eventOrder.push('update:modelValue'),
        onInput: () => eventOrder.push('input'),
        onChange: () => eventOrder.push('change'),
      },
      slots: {
        default: () => [
          h(ListOption, { value: 'rice' }, () => 'Rice'),
          h(ListOption, { value: 'oats' }, () => 'Oats'),
        ],
      },
    })
    const options = wrapper.findAll('[role="option"]')

    await options[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await options[1].trigger('click')
    expect(eventOrder).toEqual(['beforeinput', 'update:modelValue', 'input', 'change'])
    await wrapper.setProps({ modelValue: 'oats' })
    expect(options[1].attributes('aria-selected')).toBe('true')
  })

  it('honors cancellation of beforeinput and skips disabled options', async () => {
    const wrapper = mount(SelectionList, {
      props: { label: 'Choose a grain', modelValue: 'rice' },
      slots: {
        default: () => [
          h(ListOption, { value: 'rice' }, () => 'Rice'),
          h(ListOption, { value: 'oats', disabled: true }, () => 'Oats'),
          h(ListOption, { value: 'barley' }, () => 'Barley'),
        ],
      },
      attachTo: document.body,
    })
    const options = wrapper.findAll('[role="option"]')
    wrapper.element.addEventListener('beforeinput', (event: Event) => event.preventDefault(), {
      once: true,
    })
    await options[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await options[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[2].element)
    wrapper.unmount()
  })

  it('submits selected values and omits disabled options from form data', () => {
    const form = document.createElement('form')
    document.body.append(form)
    const wrapper = mount(SelectionList, {
      props: {
        label: 'Choose grains',
        mode: 'multiple',
        name: 'grain',
        modelValue: ['rice', 'oats'],
      },
      slots: {
        default: () => [
          h(ListOption, { value: 'rice' }, () => 'Rice'),
          h(ListOption, { value: 'oats' }, () => 'Oats'),
          h(ListOption, { value: 'millet', disabled: true }, () => 'Millet'),
        ],
      },
      attachTo: form,
    })

    expect(new FormData(form).getAll('grain')).toEqual(['rice', 'oats'])
    wrapper.unmount()
    form.remove()
  })

  it('validates a required single choice, omits its proxy value, and restores the initial value on reset', async () => {
    const form = document.createElement('form')
    document.body.append(form)
    const wrapper = mount(SelectionList, {
      props: { label: 'Choose a grain', name: 'grain', required: true },
      slots: {
        default: () => [
          h(ListOption, { value: 'rice' }, () => 'Rice'),
          h(ListOption, { value: 'oats' }, () => 'Oats'),
        ],
      },
      attachTo: form,
    })
    const listbox = wrapper.find('[role="listbox"]')
    const proxy = form.querySelector<HTMLInputElement>('[data-yam3x-list-validation-input]')!
    expect(form.checkValidity()).toBe(false)
    await nextTick()
    expect(listbox.attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('invalid')).toHaveLength(1)

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    expect(form.checkValidity()).toBe(true)
    const submitted = new FormData(form)
    const formDataEvent = new Event('formdata')
    Object.defineProperty(formDataEvent, 'formData', { value: submitted })
    form.dispatchEvent(formDataEvent)
    expect(submitted.getAll('grain')).toEqual(['oats'])
    expect(submitted.has(proxy.name)).toBe(false)

    let resetEventDispatched = false
    form.addEventListener(
      'reset',
      () => {
        resetEventDispatched = true
      },
      { once: true },
    )
    form.reset()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(resetEventDispatched).toBe(true)
    expect(
      wrapper.findAll('[role="option"]').map((option) => option.attributes('aria-selected')),
    ).toEqual(['false', 'false'])
    expect(form.checkValidity()).toBe(false)
    wrapper.unmount()
    form.remove()
  })
})

describe('consumer drag state', () => {
  it('forwards dragged state to every row surface without implementing reorder behavior', () => {
    const passive = mount(ListItem, { props: { dragged: true }, slots: { default: 'Passive row' } })
    const action = mount(ListAction, { props: { dragged: true }, slots: { default: 'Action row' } })
    const option = mount(SelectionList, {
      props: { label: 'Choose a row' },
      slots: {
        default: () => h(ListOption, { value: 'row', dragged: true }, () => 'Selectable row'),
      },
    })
    const expandable = mount(ExpandableListItem, {
      props: { dragged: true },
      slots: { default: 'Expandable row' },
    })

    expect(passive.find('.yam3x-list-item').attributes('data-yam3x-dragged')).toBe('true')
    expect(action.find('.yam3x-list-action').attributes('data-yam3x-dragged')).toBe('true')
    expect(option.find('[role="option"]').attributes('data-yam3x-dragged')).toBe('true')
    expect(expandable.find('.yam3x-expandable-list-item').attributes('data-yam3x-dragged')).toBe(
      'true',
    )

    passive.unmount()
    action.unmount()
    option.unmount()
    expandable.unmount()
  })
})

describe('ActionList', () => {
  it('keeps anchors native and prevents disabled links from navigating or activating', async () => {
    const open = vi.fn()
    const disabled = vi.fn()
    const wrapper = mount(ActionList, {
      slots: {
        default: () => [
          h(
            ListAction,
            {
              href: 'https://example.com/mail',
              target: '_blank',
              rel: 'noreferrer',
              onClick: open,
            },
            () => 'Open mail',
          ),
          h(
            ListAction,
            { href: '#disabled', disabled: true, onClick: disabled },
            () => 'Disabled mail',
          ),
        ],
      },
    })
    const links = wrapper.findAll('a')
    expect(links[0].attributes('href')).toBe('https://example.com/mail')
    expect(links[0].attributes('target')).toBe('_blank')
    expect(links[0].attributes('rel')).toBe('noreferrer')
    expect(links[1].attributes('aria-disabled')).toBe('true')
    expect(links[1].attributes('tabindex')).toBe('-1')

    await links[1].trigger('click')
    expect(disabled).not.toHaveBeenCalled()
    await links[0].trigger('click')
    expect(open).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('keeps a single tab stop and moves it with vertical arrows', async () => {
    const wrapper = mount(ActionList, {
      slots: {
        default: () => [h(ListAction, {}, () => 'First'), h(ListAction, {}, () => 'Second')],
      },
      attachTo: document.body,
    })
    const buttons = wrapper.findAll('[data-yam3x-list-action]')
    expect(buttons.map((button) => button.attributes('tabindex'))).toEqual(['0', '-1'])
    await buttons[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[1].element)
    expect(buttons[1].attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('skips disabled and collapsed actions and supports Home and End', async () => {
    const wrapper = mount(ActionList, {
      slots: {
        default: () => [
          h(ListAction, {}, () => 'First'),
          h(ListAction, { disabled: true }, () => 'Disabled'),
          h(
            ExpandableListItem,
            {},
            { default: () => 'Folder', items: () => h(ListAction, {}, () => 'Hidden child') },
          ),
          h(ListAction, {}, () => 'Last'),
        ],
      },
      attachTo: document.body,
    })
    const actions = wrapper.findAll('[data-yam3x-list-action]')
    const disclosure = wrapper.find('[data-yam3x-expand-toggle]')
    expect(actions[0].attributes('tabindex')).toBe('0')
    expect(actions[1].attributes('tabindex')).toBe('-1')
    expect(actions[2].attributes('tabindex')).toBe('-1')

    await actions[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(disclosure.element)
    await disclosure.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(actions[3].element)
    await actions[3].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(actions[0].element)
    wrapper.unmount()
  })

  it('moves through secondary row actions without activating the primary action', async () => {
    const primary = vi.fn()
    const secondary = vi.fn()
    const wrapper = mount(ActionList, {
      slots: {
        default: () =>
          h(
            ListAction,
            { onClick: primary },
            {
              default: () => 'Open item',
              actions: () => h('button', { type: 'button', onClick: secondary }, 'More'),
            },
          ),
      },
      attachTo: document.body,
    })
    const primaryAction = wrapper.find('[data-yam3x-list-action]')
    const secondaryAction = wrapper.find('[data-yam3x-action-control]')
    expect(primaryAction.attributes('tabindex')).toBe('0')
    expect(secondaryAction.attributes('tabindex')).toBe('-1')
    await primaryAction.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(secondaryAction.element)
    await secondaryAction.trigger('click')
    expect(secondary).toHaveBeenCalledOnce()
    expect(primary).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

describe('ExpandableListItem', () => {
  it('keeps disabled disclosures inert and out of the tab order', async () => {
    const wrapper = mount(ExpandableListItem, {
      props: { disabled: true },
      slots: { default: () => 'Folder', items: () => h(ListAction, {}, () => 'Child') },
    })
    const disclosure = wrapper.find('[data-yam3x-expand-toggle]')
    const panel = wrapper.find('.yam3x-expandable-list-item__panel')

    expect((disclosure.element as HTMLButtonElement).disabled).toBe(true)
    expect(disclosure.attributes('tabindex')).toBe('-1')
    expect(disclosure.attributes('aria-expanded')).toBe('false')
    expect(panel.attributes('aria-hidden')).toBe('true')
    expect(panel.attributes('inert')).toBe('')
    await disclosure.trigger('click')
    expect(disclosure.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:open')).toBeUndefined()
    wrapper.unmount()
  })

  it('honors cancellation of beforetoggle', async () => {
    const wrapper = mount(ExpandableListItem, {
      props: { onBeforetoggle: (event) => event.preventDefault() },
      slots: { default: () => 'Folder', items: () => h(ListAction, {}, () => 'Child') },
    })
    const disclosure = wrapper.find('[data-yam3x-expand-toggle]')
    await disclosure.trigger('click')
    expect(disclosure.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:open')).toBeUndefined()
    wrapper.unmount()
  })

  it('exposes disclosure state, closes on Escape, and restores focus', async () => {
    const wrapper = mount(ActionList, {
      slots: {
        default: () =>
          h(
            ExpandableListItem,
            {},
            {
              default: () => 'Folder',
              items: () => h(ListAction, {}, () => 'Child'),
            },
          ),
      },
      attachTo: document.body,
    })
    const disclosure = wrapper.find('[data-yam3x-expand-toggle]')
    const panel = wrapper.find('.yam3x-expandable-list-item__panel')
    expect(disclosure.attributes('aria-expanded')).toBe('false')
    expect(panel.attributes('aria-hidden')).toBe('true')
    await disclosure.trigger('click')
    expect(disclosure.attributes('aria-expanded')).toBe('true')
    await disclosure.trigger('keydown', { key: 'Escape' })
    expect(disclosure.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(disclosure.element)
    wrapper.unmount()
  })
})
