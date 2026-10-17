import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import Checkbox from '../../../../registry/components/checkbox/checkbox.vue'
import TriStateCheckbox from '../../../../registry/components/checkbox/tri-state-checkbox.vue'

describe('Material Checkbox', () => {
  it('renders the mixed state with a dash instead of the checked mark', async () => {
    const wrapper = mount(TriStateCheckbox, {
      props: { label: 'Select all', modelValue: 'indeterminate' },
    })
    await nextTick()

    expect(
      wrapper.get('[data-state="indeterminate"] .yam3x-checkbox__icon path').attributes('d'),
    ).toBe('M3.6 9h10.8')
    expect(wrapper.find('.yam3x-checkbox__mark').exists()).toBe(false)
  })

  it('lets click.prevent cancel activation before changing the model', async () => {
    const onChecked = vi.fn()
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
    const wrapper = mount(Checkbox, {
      attachTo: document.body,
      props: {
        label: 'Accept',
        'onUpdate:modelValue': onChecked,
        onClick,
      },
    })
    const input = wrapper.get('input').element as HTMLInputElement

    input.click()
    await nextTick()

    expect(onClick).toHaveBeenCalledOnce()
    expect(onChecked).not.toHaveBeenCalled()
    expect(input.checked).toBe(false)
    wrapper.unmount()
  })

  it('emits click, model update, input, and change in order when activated', async () => {
    const events: string[] = []
    const wrapper = mount(Checkbox, {
      attachTo: document.body,
      props: {
        label: 'Accept',
        onClick: () => events.push('click'),
        'onUpdate:modelValue': () => events.push('model'),
        onInput: () => events.push('input'),
        onChange: () => events.push('change'),
      },
    })

    ;(wrapper.get('input').element as HTMLInputElement).click()
    await nextTick()

    expect(events).toEqual(['click', 'model', 'input', 'change'])
    wrapper.unmount()
  })

  it('forwards native invalid events to the component listener', () => {
    const onInvalid = vi.fn()
    const wrapper = mount(Checkbox, {
      props: { label: 'Required option', required: true, onInvalid },
    })
    const input = wrapper.get('input').element as HTMLInputElement

    expect(input.checkValidity()).toBe(false)
    expect(onInvalid).toHaveBeenCalledOnce()
    expect(onInvalid.mock.calls[0][0]).toBeInstanceOf(Event)
    wrapper.unmount()
  })

  it('selects an indeterminate parent and clears its mixed state', async () => {
    const onState = vi.fn()
    const wrapper = mount(TriStateCheckbox, {
      attachTo: document.body,
      props: {
        label: 'Select all',
        modelValue: 'indeterminate',
        'onUpdate:modelValue': onState,
      },
    })
    const input = wrapper.get('input').element as HTMLInputElement

    await nextTick()
    expect(input.indeterminate).toBe(true)
    input.click()
    await nextTick()
    expect(onState).toHaveBeenCalledWith('checked')
    wrapper.unmount()
  })

  it('participates in native forms and restores its initial checked value on reset', async () => {
    const form = document.createElement('form')
    document.body.append(form)
    const wrapper = mount(Checkbox, {
      attachTo: form,
      props: { label: 'Updates', name: 'updates', value: 'yes', modelValue: true, required: true },
    })
    const input = wrapper.get('input').element as HTMLInputElement

    expect(new FormData(form).get('updates')).toBe('yes')
    input.click()
    await nextTick()
    expect(new FormData(form).has('updates')).toBe(false)
    expect(input.validity.valueMissing).toBe(true)

    form.reset()
    await Promise.resolve()
    await nextTick()
    expect(input.checked).toBe(true)
    expect(new FormData(form).get('updates')).toBe('yes')

    wrapper.unmount()
    form.remove()
  })

  it('omits mixed values from forms and restores the initial mixed state on reset', async () => {
    const form = document.createElement('form')
    document.body.append(form)
    const wrapper = mount(TriStateCheckbox, {
      attachTo: form,
      props: {
        label: 'All updates',
        name: 'updates',
        value: 'yes',
        modelValue: 'indeterminate',
      },
    })
    const input = wrapper.get('input').element as HTMLInputElement
    await nextTick()

    expect(input.indeterminate).toBe(true)
    expect(input.hasAttribute('name')).toBe(false)
    expect(new FormData(form).has('updates')).toBe(false)

    await wrapper.setProps({ modelValue: 'checked' })
    expect(input.getAttribute('name')).toBe('updates')
    expect(new FormData(form).get('updates')).toBe('yes')

    form.reset()
    await Promise.resolve()
    await nextTick()
    expect(input.checked).toBe(false)
    expect(input.indeterminate).toBe(true)
    expect(new FormData(form).has('updates')).toBe(false)

    wrapper.unmount()
    form.remove()
  })

  it('moves reset handling when the external form association changes', async () => {
    const firstForm = document.createElement('form')
    const secondForm = document.createElement('form')
    firstForm.id = 'checkbox-first-form'
    secondForm.id = 'checkbox-second-form'
    document.body.append(firstForm, secondForm)
    const onChecked = vi.fn()
    const wrapper = mount(Checkbox, {
      attachTo: document.body,
      props: {
        label: 'Updates',
        form: firstForm.id,
        modelValue: true,
        'onUpdate:modelValue': onChecked,
      },
    })
    const input = wrapper.get('input').element as HTMLInputElement

    await wrapper.setProps({ form: secondForm.id, modelValue: false })
    expect(input.form).toBe(secondForm)

    firstForm.reset()
    await Promise.resolve()
    expect(onChecked).not.toHaveBeenCalled()

    secondForm.reset()
    await Promise.resolve()
    expect(onChecked).toHaveBeenCalledWith(true)

    wrapper.unmount()
    firstForm.remove()
    secondForm.remove()
  })

  it('keeps a disabled control out of form submission', async () => {
    const form = document.createElement('form')
    document.body.append(form)
    const wrapper = mount(Checkbox, {
      attachTo: form,
      props: { label: 'Disabled option', name: 'disabled', modelValue: true, disabled: true },
    })

    expect(new FormData(form).has('disabled')).toBe(false)
    expect((wrapper.get('input').element as HTMLInputElement).disabled).toBe(true)
    wrapper.unmount()
    form.remove()
  })
})
