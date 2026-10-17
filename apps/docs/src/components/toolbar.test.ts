import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Toolbar from '../../../../registry/components/toolbar/toolbar.vue'

describe('Toolbar runtime fallbacks', () => {
  it('maps unsupported enum values to the current Material defaults', () => {
    const wrapper = mount(Toolbar, {
      props: {
        layout: 'other' as 'floating',
        variant: 'other' as 'standard',
        shape: 'other' as 'rounded',
      },
    })
    expect(wrapper.classes()).toContain('yam3x-toolbar--floating')
    expect(wrapper.classes()).toContain('yam3x-toolbar--standard')
    expect(wrapper.classes()).toContain('yam3x-toolbar--rounded')
    expect(wrapper.classes()).toContain('yam3x-toolbar--elevated')
  })
})
