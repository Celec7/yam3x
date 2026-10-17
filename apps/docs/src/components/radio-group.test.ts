import { computed, defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { RadioButton, RadioGroup } from '@registry/components/radio-group'

describe('RadioGroup', () => {
  it('restores the current selection when a controlled parent rejects a value', async () => {
    const Parent = defineComponent({
      components: { RadioButton, RadioGroup },
      setup() {
        const selected = ref('first')
        const model = computed({
          get: () => selected.value,
          set: (value: string | null) => {
            if (value === 'first') selected.value = value
          },
        })

        return { model }
      },
      template: `<RadioGroup v-model="model" label="Choice">
        <RadioButton value="first">First</RadioButton>
        <RadioButton value="second">Second</RadioButton>
      </RadioGroup>`,
    })
    const wrapper = mount(Parent)
    const first = wrapper.find<HTMLInputElement>('input[value="first"]')
    const second = wrapper.find<HTMLInputElement>('input[value="second"]')

    await second.trigger('click')
    await nextTick()

    expect(first.element.checked).toBe(true)
    expect(second.element.checked).toBe(false)
    wrapper.unmount()
  })
})
