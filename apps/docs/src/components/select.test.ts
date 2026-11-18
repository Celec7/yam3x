import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import Select from '../../../../registry/components/select/select.vue'
import FormField from '../../../../registry/components/form-field/form-field.vue'
import Option from '../../../../registry/components/option/option.vue'

describe('Select required state', () => {
  it('does not mark an optional Select as required inside FormField', async () => {
    const wrapper = mount(
      defineComponent({
        components: { M3Select: Select, FormField, M3Option: Option },
        props: { required: Boolean },
        template:
          '<FormField label="Page size"><M3Select :required="required"><M3Option value="10" label="10" /></M3Select></FormField>',
      }),
    )
    await flushPromises()
    expect(wrapper.get('.yam3x-form-field__label').text()).toBe('Page size')
    await wrapper.setProps({ required: true })
    await flushPromises()
    expect(wrapper.get('.yam3x-form-field__label').text()).toContain('*')
    await wrapper.setProps({ required: false })
    await flushPromises()
    expect(wrapper.get('.yam3x-form-field__label').text()).toBe('Page size')
    wrapper.unmount()
  })

  it('exposes the selected value without incompatible combobox attributes', async () => {
    const wrapper = mount(
      defineComponent({
        components: { M3Select: Select, M3Option: Option },
        template: '<M3Select model-value="10"><M3Option value="10" label="Ten" /></M3Select>',
      }),
    )
    await flushPromises()
    const trigger = wrapper.get('[role="combobox"]')
    expect(trigger.attributes('aria-valuetext')).toBeUndefined()
    expect(trigger.text()).toContain('Ten')
    wrapper.unmount()
  })
})
