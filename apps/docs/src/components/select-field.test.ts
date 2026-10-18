import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h, ref } from 'vue'
import FormField from '../../../../registry/components/form-field/form-field.vue'
import Select from '../../../../registry/components/select/select.vue'
import { getFormValidationControl } from '../../../../registry/components/_shared/form-control'

enableAutoUnmount(afterEach)

it('keeps a searchable chip selection populated while its query is empty', async () => {
  const values = ref(['ts'])
  const wrapper = mount(FormField, {
    props: { label: 'Languages' },
    slots: {
      default: () =>
        h(Select, {
          searchable: true,
          multiple: true,
          selectionDisplay: 'chips',
          modelValue: values.value,
          options: [{ value: 'ts', label: 'TypeScript' }],
        }),
    },
  })
  await flushPromises()
  expect(wrapper.get<HTMLInputElement>('input[role="combobox"]').element.value).toBe('')
  expect(wrapper.classes()).toContain('yam3x-form-field--floating')
  values.value = []
  await flushPromises()
  expect(wrapper.classes()).not.toContain('yam3x-form-field--floating')
  await wrapper.get('input[role="combobox"]').setValue('unmatched query')
  await flushPromises()
  expect(wrapper.classes()).toContain('yam3x-form-field--populated')
})

it('resolves the accepted-value constraint proxy behind a native query input', async () => {
  const wrapper = mount(Select, {
    props: { searchable: true, required: true, options: [{ value: 'ts', label: 'TypeScript' }] },
  })
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]')
  const proxy = wrapper.get<HTMLSelectElement>('select')
  expect(getFormValidationControl(input.element)).toBe(proxy.element)
  expect(proxy.element.validity.valueMissing).toBe(true)
  await wrapper.setProps({ modelValue: 'ts' })
  await flushPromises()
  expect(input.element.required).toBe(false)
  expect(proxy.element.validity.valid).toBe(true)
})
