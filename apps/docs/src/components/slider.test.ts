import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import RangeSlider from '../../../../registry/components/slider/range-slider.vue'
import Slider from '../../../../registry/components/slider/slider.vue'
import {
  sliderBounds,
  sliderFraction,
  sliderValue,
  sliderValues,
} from '../../../../registry/components/slider/slider-utils'

describe('Slider numeric model', () => {
  it('defaults RangeSlider to its minimum and maximum', () => {
    const wrapper = mount(RangeSlider, { props: { min: 10, max: 90, label: 'Price' } })
    expect(wrapper.findAll('input').map((input) => input.element.value)).toEqual(['10', '90'])
    expect(wrapper.classes()).toContain('yam3x-slider--range')
    wrapper.unmount()
  })

  it('normalizes invalid bounds and values and keeps range handles ordered', () => {
    expect(sliderBounds(10, 5)).toEqual([10, 110])
    expect(sliderValue(Number.NaN, 0, 100, 10)).toBe(0)
    expect(sliderValue(96, 0, 100, 10)).toBe(100)
    expect(sliderValues([80, 20], 'range', 0, 100, 10)).toEqual([20, 80])
    expect(sliderFraction(50, 0, 100)).toBe(0.5)
  })

  it('submits enabled values under predictable names and excludes disabled values', async () => {
    const wrapper = mount({
      components: { RangeSlider },
      template: '<form><RangeSlider :model-value="[25, 75]" label="Price" name="price" /></form>',
      attachTo: document.body,
    })
    const form = wrapper.element as HTMLFormElement
    expect([...new FormData(form).entries()]).toEqual([
      ['price-min', '25'],
      ['price-max', '75'],
    ])
    wrapper.unmount()
    const disabled = mount(Slider, {
      props: { modelValue: 40, label: 'Volume', name: 'volume', disabled: true },
    })
    expect(disabled.find('input').attributes('disabled')).toBeDefined()
  })

  it('restores the initial model and form value on reset', async () => {
    const value = ref(40)
    const wrapper = mount({
      components: { Slider },
      setup: () => ({ value }),
      template: '<form><Slider v-model="value" label="Volume" name="volume" /></form>',
      attachTo: document.body,
    })
    value.value = 70
    await nextTick()
    expect(new FormData(wrapper.element as HTMLFormElement).get('volume')).toBe('70')
    ;(wrapper.element as HTMLFormElement).reset()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
    expect(value.value).toBe(40)
    expect(new FormData(wrapper.element as HTMLFormElement).get('volume')).toBe('40')
    wrapper.unmount()
  })
})
