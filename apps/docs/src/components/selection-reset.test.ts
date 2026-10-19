import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import type { Component } from 'vue'
import Select from '../../../../registry/components/select/select.vue'
import Autocomplete from '../../../../registry/components/autocomplete/autocomplete.vue'
import Cascader from '../../../../registry/components/cascader/cascader.vue'
import TreeSelect from '../../../../registry/components/tree-select/tree-select.vue'

const options = [
  { value: 'initial', label: 'Initial' },
  { value: 'edited', label: 'Edited' },
]
const cases: Array<{
  name: string
  component: Component
  initial: Record<string, unknown>
  edited: Record<string, unknown>
}> = [
  {
    name: 'Select',
    component: Select,
    initial: { options, multiple: true, searchable: true, modelValue: ['initial'] },
    edited: { modelValue: ['edited'], query: 'draft' },
  },
  {
    name: 'Autocomplete',
    component: Autocomplete,
    initial: { options, modelValue: 'Initial', selected: 'initial' },
    edited: { modelValue: 'Edited', selected: 'edited' },
  },
  {
    name: 'Cascader',
    component: Cascader,
    initial: { options, searchable: true, modelValue: ['initial'] },
    edited: { modelValue: ['edited'], query: 'draft' },
  },
  {
    name: 'TreeSelect',
    component: TreeSelect,
    initial: {
      nodes: options.map(({ value, label }) => ({ key: value, label })),
      multiple: true,
      searchable: true,
      modelValue: ['initial'],
    },
    edited: { modelValue: ['edited'], query: 'draft' },
  },
]
enableAutoUnmount(afterEach)
it.each(cases)(
  '$name retains application values when a later native reset listener cancels the reset',
  async ({ component, initial, edited }) => {
    const form = document.createElement('form')
    form.id = 'canceled-selection-reset'
    document.body.append(form)
    try {
      const wrapper = mount(component, {
        attachTo: document.body,
        props: { ...initial, label: 'Choice', form: form.id },
      })
      await wrapper.setProps(edited)
      await flushPromises()
      const before = Object.fromEntries(
        Object.keys(edited).map((key) => [key, wrapper.emitted(`update:${key}`)?.length ?? 0]),
      )
      form.addEventListener('reset', (event) => event.preventDefault(), { once: true })
      form.reset()
      await flushPromises()
      for (const key of Object.keys(edited)) {
        expect(wrapper.emitted(`update:${key}`)?.length ?? 0).toBe(before[key])
      }
      form.reset()
      await flushPromises()
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([initial.modelValue])
    } finally {
      form.remove()
    }
  },
)
