import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ThemePreviewIcon from '../../../registry/foundations/theme/theme-preview-icon.vue'

afterEach(() => vi.unstubAllGlobals())

describe('ThemePreviewIcon', () => {
  it('renders an accessible image and updates its palette when the variant changes', async () => {
    const wrapper = mount(ThemePreviewIcon, {
      props: { color: '#004f4f', scheme: 'light', label: 'Teal theme' },
    })
    const icon = wrapper.get('[role="img"]')
    expect(icon.attributes('aria-label')).toBe('Teal theme')
    const initial = icon.attributes('style')
    await wrapper.setProps({ variant: 'neutral' })
    expect(icon.attributes('style')).not.toBe(initial)
    expect(wrapper.findAll('svg path')).toHaveLength(3)
    wrapper.unmount()
  })

  it('follows automatic system mode and removes its media listener when unmounted', async () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined
    const media = {
      matches: false,
      addEventListener: (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listener = callback
      },
      removeEventListener: (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        if (listener === callback) listener = undefined
      },
    }
    vi.stubGlobal('matchMedia', () => media)
    const wrapper = mount(ThemePreviewIcon)
    const icon = wrapper.get('[role="img"]')
    const light = icon.attributes('style')
    media.matches = true
    listener?.({ matches: true } as MediaQueryListEvent)
    await wrapper.vm.$nextTick()
    expect(icon.attributes('style')).not.toBe(light)
    wrapper.unmount()
    expect(listener).toBeUndefined()
  })
})
