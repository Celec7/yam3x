import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import Autocomplete from '../../../../registry/components/autocomplete/autocomplete.vue'

enableAutoUnmount(afterEach)

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
]

describe('Autocomplete controlled query', () => {
  it('uses the normalized parent query when settling a controlled input', async () => {
    const Host = defineComponent({
      setup() {
        const query = ref('')
        return () =>
          h(Autocomplete, {
            options,
            label: 'Fruit',
            modelValue: query.value,
            'onUpdate:modelValue': (value: string) => {
              query.value = value.replace(/[^a-z]/gi, '')
            },
            autoActivate: true,
          })
      },
    })
    const wrapper = mount(Host)
    const input = wrapper.get('input')
    await input.setValue('ap!')
    await flushPromises()
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('ap')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
  })

  it('announces only the settled result count', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Autocomplete, { props: { options, label: 'Fruit' } })
    try {
      const input = wrapper.get('input')
      await input.setValue('ap')
      await nextTick()
      const live = wrapper.get('.yam3x-autocomplete__live')
      expect(live.text()).toBe('')
      vi.advanceTimersByTime(199)
      await nextTick()
      expect(live.text()).toBe('')
      vi.advanceTimersByTime(1)
      await nextTick()
      expect(live.text()).toBe('2 options')
    } finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })
})
