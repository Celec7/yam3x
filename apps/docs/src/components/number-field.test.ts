import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberField from '../../../../registry/components/number-field/number-field.vue'
import {
  addNumberStep,
  createNumberCodec,
} from '../../../../registry/components/number-field/number-field.utils'

describe('Number field localized values', () => {
  it('reads decimal and grouping separators in the field locale', () => {
    const codec = createNumberCodec('de-DE')
    expect(codec.parse('1.234,5')).toBe(1234.5)
  })

  it.each([
    ['en-US', '1,234.5', 1234.5],
    ['fr-FR', '1\u202f234,5', 1234.5],
    ['ar-EG', '١٬٢٣٤٫٥', 1234.5],
    ['hi-IN', '12,34,567.5', 1234567.5],
    ['en-US', '-0.5', -0.5],
    ['en-US', '1.', 1],
    ['en-US', '-', null],
    ['en-US', '1,2', null],
    ['de-DE', '1,2,3', null],
    ['en-US', 'Infinity', null],
    ['en-US', '', null],
  ])('parses %s input %s without changing its meaning', (locale, text, value) => {
    expect(createNumberCodec(locale).parse(text)).toBe(value)
  })

  it('preserves finite small values when formatting and adds decimal steps exactly', () => {
    const codec = createNumberCodec('en-US')
    expect(codec.parse(codec.format(0.000000000000000000001))).toBe(1e-21)
    expect(addNumberStep(0.1, 0.2, 1)).toBe(0.3)
    expect(addNumberStep(1.2, 0.1, -1)).toBe(1.1)
  })
})

describe('Number field editing', () => {
  it.each([
    [true, 'Check this field.'],
    ['External error', 'External error'],
  ] as const)('shows an external error %s immediately', (error, message) => {
    const wrapper = mount(NumberField, { props: { label: 'Quantity', error } })
    expect(wrapper.text()).toContain(message)
    expect(wrapper.get<HTMLInputElement>('input[role="spinbutton"]').element.validity.valid).toBe(
      false,
    )
    wrapper.unmount()
  })

  it('keeps editing text separate and commits a valid value on blur', async () => {
    // number-field.editing.commit
    const wrapper = mount(NumberField, { props: { label: 'Quantity', modelValue: 2 } })
    const input = wrapper.get('input[role="spinbutton"]')
    await input.setValue('-')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.setValue('3.5')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toEqual([[3.5]])
    wrapper.unmount()
  })

  it('retains an invalid edit and committed value until the user corrects it', async () => {
    const wrapper = mount(NumberField, {
      props: { label: 'Quantity', modelValue: 2, min: 1, max: 5 },
    })
    const input = wrapper.get<HTMLInputElement>('input[role="spinbutton"]')
    await input.setValue('9')
    await input.trigger('blur')
    expect(input.element.value).toBe('9')
    expect(input.element.validity.valid).toBe(false)
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.[0]).toEqual([
      { reason: 'rangeOverflow', message: 'Enter a number no greater than 5.' },
    ])
    await input.setValue('4')
    await input.trigger('blur')
    expect(input.element.validity.valid).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[4]])
    wrapper.unmount()
  })

  it('commits an optional empty value as null and rejects a required empty value', async () => {
    const wrapper = mount(NumberField, { props: { label: 'Quantity', modelValue: 2 } })
    const input = wrapper.get('input[role="spinbutton"]')
    await input.setValue('')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    await wrapper.setProps({ required: true })
    await input.trigger('blur')
    expect(wrapper.emitted('invalid')?.at(-1)).toEqual([
      { reason: 'valueMissing', message: 'This field is required.' },
    ])
    wrapper.unmount()
  })

  it('steps decimals, respects limits, and retains text editing shortcuts', async () => {
    const wrapper = mount(NumberField, {
      props: { label: 'Quantity', modelValue: 0.1, min: 0, max: 0.3, step: 0.2 },
    })
    const input = wrapper.get('input[role="spinbutton"]')
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[0.3]])
    expect(
      wrapper.get('button[aria-label="Increase Quantity"]').attributes('disabled'),
    ).toBeDefined()
    await input.trigger('keydown', { key: 'ArrowUp', ctrlKey: true })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    await input.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    await input.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0.3])
    wrapper.unmount()
  })

  it.each(['disabled', 'readonly'] as const)('prevents stepping while %s', async (state) => {
    const wrapper = mount(NumberField, {
      props: { label: 'Quantity', modelValue: 2, [state]: true },
    })
    await wrapper.get('input[role="spinbutton"]').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(
      wrapper.findAll('button').every((button) => button.attributes('disabled') !== undefined),
    ).toBe(true)
    wrapper.unmount()
  })

  it('reformats an uncommitted value when locale changes without changing its number', async () => {
    const wrapper = mount(NumberField, {
      props: { label: 'Amount', modelValue: 2, locale: 'en-US' },
    })
    const input = wrapper.get<HTMLInputElement>('input[role="spinbutton"]')
    await input.setValue('1,234.5')
    await wrapper.setProps({ locale: 'de-DE' })
    expect(input.element.value).toBe('1.234,5')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toEqual([[1234.5]])
    wrapper.unmount()
  })
})
