import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import Icon from '../../../../registry/components/icon/icon.vue'
import { registerIcon } from '../../../../registry/components/icon/icon-registry'

describe('Icon', () => {
  it('defaults to a decorative image and exposes a supplied accessible name', async () => {
    const decorative = mount(Icon, { props: { name: 'house' } })
    expect(decorative.attributes('role')).toBe('img')
    expect(decorative.attributes('aria-hidden')).toBe('true')
    expect(decorative.attributes('tabindex')).toBeUndefined()
    expect(decorative.get('.yam3x-icon__ligature').text()).toBe('house')
    expect(decorative.get('.yam3x-icon__ligature').attributes('aria-hidden')).toBe('true')

    const labelled = mount(Icon, { props: { name: 'house', ariaLabel: 'Home' } })
    expect(labelled.attributes('aria-label')).toBe('Home')
    expect(labelled.attributes('aria-hidden')).toBeUndefined()
    const referenced = mount(Icon, { props: { name: 'house', ariaLabelledby: 'home-label' } })
    expect(referenced.attributes('aria-labelledby')).toBe('home-label')
    expect(referenced.attributes('aria-hidden')).toBeUndefined()
    const explicitlyHidden = mount(Icon, {
      props: { name: 'house', ariaLabel: 'Home', ariaHidden: 'true' },
    })
    expect(explicitlyHidden.attributes('aria-hidden')).toBe('true')
    for (const wrapper of [decorative, labelled, referenced, explicitlyHidden]) wrapper.unmount()
  })

  it('uses Material Symbols family and all variable axes with pinned defaults and fallbacks', async () => {
    const wrapper = mount(Icon, { props: { name: 'tune' } })
    expect(wrapper.attributes('style')).toContain(
      '--_yam3x-icon-font-family: "Material Symbols Outlined"',
    )
    expect(wrapper.attributes('style')).toContain(
      "--_yam3x-icon-font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' var(--_yam3x-icon-auto-grade), 'opsz' 24",
    )

    await wrapper.setProps({
      variant: 'rounded',
      filled: true,
      grade: 'low',
      weight: 600,
      opticalSize: 36,
    })
    expect(wrapper.attributes('style')).toContain('Material Symbols Rounded')
    expect(wrapper.attributes('style')).toContain("'FILL' 1, 'wght' 600, 'GRAD' -25, 'opsz' 36")
    await wrapper.setProps({ grade: 'high' })
    expect(wrapper.attributes('style')).toContain("'GRAD' 200")
    await wrapper.setProps({
      variant: 'invalid' as never,
      grade: 'invalid' as never,
      weight: 450 as never,
    })
    expect(wrapper.attributes('style')).toContain('Material Symbols Outlined')
    expect(wrapper.attributes('style')).toContain(
      "'FILL' 1, 'wght' 400, 'GRAD' var(--_yam3x-icon-auto-grade), 'opsz' 36",
    )
    wrapper.unmount()
  })

  it('renders registered fill pairs and updates mounted icons when entries change', async () => {
    const wrapper = mount(Icon, { props: { name: 'runtime-added', variant: 'rounded' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    registerIcon('runtime-added', 'rounded', {
      outlined: { viewBox: '0 0 24 24', path: 'M2 12h20' },
      filled: { viewBox: '0 0 48 48', path: 'M3 3h18v18H3z' },
    })
    await nextTick()
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(wrapper.get('path').attributes('d')).toBe('M2 12h20')

    await wrapper.setProps({ filled: true })
    expect(wrapper.get('path').attributes('d')).toBe('M3 3h18v18H3z')
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 48 48')
    registerIcon('runtime-added', 'rounded', {
      outlined: { viewBox: '0 0 48 48', path: 'M4 24h40' },
      filled: { viewBox: '0 0 48 48', path: 'M4 4h40v40H4z' },
    })
    await nextTick()
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 48 48')
    expect(wrapper.get('path').attributes('d')).toBe('M4 4h40v40H4z')

    await wrapper.setProps({ variant: 'sharp', filled: false })
    expect(wrapper.find('svg').exists()).toBe(false)
    registerIcon('runtime-added', 'sharp', {
      outlined: { viewBox: '0 0 24 24', path: 'M4 4h16v16H4z' },
      filled: { viewBox: '0 0 24 24', path: 'M3 3h18v18H3z' },
    })
    await nextTick()
    expect(wrapper.get('path').attributes('d')).toBe('M4 4h16v16H4z')
    wrapper.unmount()
  })

  it('rejects unsafe SVG input before registration and honors native hidden state', () => {
    expect(() =>
      registerIcon('invalid-path', 'outlined', {
        outlined: { viewBox: '0 0 24 24', path: 'M0 0"><script>' },
        filled: { viewBox: '0 0 24 24', path: 'M0 0h24v24z' },
      }),
    ).toThrow(/Invalid path data/)
    expect(() =>
      registerIcon('invalid-box', 'outlined', {
        outlined: { viewBox: '0 0 24<script>', path: 'M0 0h24v24z' },
        filled: { viewBox: '0 0 24 24', path: 'M0 0h24v24z' },
      }),
    ).toThrow(/Invalid viewbox data/)

    const wrapper = mount(Icon, { props: { name: 'hidden-icon' }, attrs: { hidden: true } })
    expect(wrapper.attributes('hidden')).toBeDefined()
    wrapper.unmount()
  })
})
