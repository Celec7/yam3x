import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import ButtonGroupSelection from '../../../../registry/components/button-group/button-group-selection.vue'

const options = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Done', value: 'done' },
]

describe('ButtonGroupSelection', () => {
  it('renders a single selection as a radio group with one tab stop', () => {
    const wrapper = mount(ButtonGroupSelection, {
      props: { label: 'Task filters', options, modelValue: 'today' },
    })

    expect(wrapper.classes()).toContain('yam3x-button-group--standard')
    expect(wrapper.attributes('role')).toBe('radiogroup')
    expect(
      wrapper.findAll('[role="radio"]').map((radio) => radio.attributes('aria-checked')),
    ).toEqual(['false', 'true', 'false'])
    expect(
      wrapper.findAll('[role="radio"]').map((radio) => (radio.element as HTMLElement).tabIndex),
    ).toEqual([-1, 0, -1])
    wrapper.unmount()
  })

  it('keeps the selected radio selected and emits only when another option is chosen', async () => {
    const wrapper = mount(ButtonGroupSelection, {
      props: { label: 'Task filters', options, modelValue: 'today' },
    })
    const radios = wrapper.findAll('[role="radio"]')

    await radios[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await radios[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['done'])
    await wrapper.setProps({ modelValue: 'done' })
    expect(radios[2]!.attributes('aria-checked')).toBe('true')
    wrapper.unmount()
  })

  it('does not clear a selected item when selection is required', async () => {
    const wrapper = mount(ButtonGroupSelection, {
      props: { label: 'Task filters', options, modelValue: 'today', selectionRequired: true },
    })
    await wrapper.findAll('[role="radio"]')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.findAll('[role="radio"]')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['all'])
    wrapper.unmount()
  })

  it('supports multiple selected values with toggle-button semantics', async () => {
    const wrapper = mount(ButtonGroupSelection, {
      props: { label: 'Text style', options, selectionMode: 'multiple', modelValue: ['today'] },
    })

    expect(wrapper.attributes('role')).toBe('group')
    expect(
      wrapper.findAll('[aria-pressed]').map((button) => button.attributes('aria-pressed')),
    ).toEqual(['false', 'true', 'false'])
    await wrapper.findAll('button')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['today', 'done']])
    wrapper.unmount()
  })

  it('selects the first enabled choice when required and the model is empty', async () => {
    const wrapper = mount(ButtonGroupSelection, {
      props: {
        label: 'Task filters',
        options: [{ ...options[0]!, disabled: true }, options[1]!, options[2]!],
        selectionRequired: true,
      },
    })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['today'])
    wrapper.unmount()
  })

  it('renders custom icon option content while keeping the accessible name', () => {
    const wrapper = mount(ButtonGroupSelection, {
      props: {
        label: 'Text style',
        options: [{ label: 'Bold', value: 'bold', kind: 'icon' }],
        modelValue: 'bold',
      },
      slots: { option: ({ option }: { option: { label: string } }) => `Icon for ${option.label}` },
    })
    const iconButton = wrapper.get('.yam3x-icon-button')
    expect(iconButton.attributes('aria-label')).toBe('Bold')
    expect(iconButton.attributes('aria-checked')).toBe('true')
    expect(wrapper.text()).toContain('Icon for Bold')
    wrapper.unmount()
  })
})
