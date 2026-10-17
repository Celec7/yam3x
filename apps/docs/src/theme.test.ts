import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { hexFromArgb, MaterialDynamicColors, Variant } from '@material/material-color-utilities'
import { foundationTokens } from '../../../registry/foundations/tokens/foundation-tokens.mjs'
import { applyTheme, resolveColorMode } from '../../../registry/foundations/theme/apply'
import {
  defaultThemeSource,
  generateTheme,
  getThemeTokenValues,
} from '../../../registry/foundations/theme/generate'
import { createThemeController } from '../../../registry/foundations/theme/controller'
import { getColorFromImage } from '../../../registry/foundations/theme/image'

afterEach(() => vi.unstubAllGlobals())

describe('dynamic theme foundations', () => {
  it('generates a Material scheme from a source color and applies its semantic roles', () => {
    const theme = generateTheme('#6750A4')
    const target = document.createElement('div')

    applyTheme(theme, target, 'light')

    expect(target.style.getPropertyValue('--md-ref-palette-primary40')).toBe(
      hexFromArgb(theme.schemes.light.primaryPalette.tone(40)),
    )
    expect(target.style.getPropertyValue('--md-sys-color-primary')).not.toBe('')
    expect(target.style.getPropertyValue('--md-sys-color-surface')).not.toBe('')
    expect(target.style.getPropertyValue('--md-sys-color-surface-container-high')).not.toBe('')
    expect(target.style.getPropertyValue('--md-sys-color-primary-fixed')).not.toBe('')
    expect(target.style.getPropertyValue('--yam3x-scrollbar-thumb-color')).not.toBe('')
    expect(target.dataset.theme).toBe('light')
  })

  it('updates the newer surface-container roles for the selected color mode', () => {
    const theme = generateTheme('#6750A4')
    const lightTarget = document.createElement('div')
    const darkTarget = document.createElement('div')

    applyTheme(theme, lightTarget, 'light')
    applyTheme(theme, darkTarget, 'dark')

    expect(lightTarget.style.getPropertyValue('--md-sys-color-surface-container-high')).not.toBe(
      darkTarget.style.getPropertyValue('--md-sys-color-surface-container-high'),
    )
  })

  it('applies every dynamic color role exported by Material Color Utilities and m3e extras', () => {
    const dynamicColors = new MaterialDynamicColors()
    const roles = [
      ...dynamicColors.allColors,
      dynamicColors.surfaceVariant(),
      dynamicColors.shadow(),
      dynamicColors.scrim(),
      dynamicColors.surfaceTint(),
    ]
    const expected = [
      ...new Set(
        roles.map((color) => `--md-sys-color-${color.name.replace(/_/g, '-').toLowerCase()}`),
      ),
    ].sort()
    const baselineRoles = Object.keys(
      getThemeTokenValues(generateTheme(defaultThemeSource.color), 'light'),
    )
      .filter((name) => name.startsWith('--md-sys-color-'))
      .sort()
    expect(baselineRoles).toEqual(expected)
    const target = document.createElement('div')
    applyTheme(generateTheme('#6750a4'), target, 'light')
    const actual = Array.from({ length: target.style.length }, (_, index) =>
      target.style.item(index),
    )
      .filter((name) => name.startsWith('--md-sys-color-'))
      .sort()
    expect(actual).toEqual(expected)
  })

  it('rejects invalid source colors instead of silently generating a different palette', () => {
    expect(() => generateTheme('blue')).toThrow(/six-digit hex color/)
  })

  it('generates 2025 expressive schemes with palettes derived by each supported variant', () => {
    const variants = ['expressive', 'vibrant', 'tonal-spot', 'neutral'] as const
    const schemes = variants.map((variant) => generateTheme('#6750A4', { variant }))
    expect(schemes.every((theme) => theme.schemes.light.specVersion === '2025')).toBe(true)
    expect(schemes.every((theme) => theme.schemes.dark.specVersion === '2025')).toBe(true)
    expect(schemes.map((theme) => theme.schemes.light.variant)).toEqual([
      Variant.EXPRESSIVE,
      Variant.VIBRANT,
      Variant.TONAL_SPOT,
      Variant.NEUTRAL,
    ])
    expect(new Set(schemes.map((theme) => theme.schemes.light.primary)).size).toBeGreaterThan(1)
    expect(() => generateTheme('#6750A4', { variant: 'bad' as never })).toThrow(/variant/)
    expect(() => generateTheme('#6750A4', { variant: 'monochrome' as never })).toThrow(/variant/)

    const standard = generateTheme('#6750A4')
    expect(standard.variant).toBe('tonal-spot')
    const high = generateTheme('#6750A4', { contrast: 'high' })
    expect(standard.schemes.light.primary).not.toBe(high.schemes.light.primary)
    expect(generateTheme('#6750A4', { contrast: 'medium' }).contrast).toBe('medium')
    expect(() => generateTheme('#6750A4', { contrast: 'bad' as never })).toThrow(/contrast/)
  })

  it('generates the first-paint baseline from the shared MCU theme source', () => {
    expect(foundationTokens.defaultTheme.sourceColor).toMatch(/^#[\da-f]{6}$/i)
    expect(foundationTokens.defaultTheme.variant).toBe('tonal-spot')
    const theme = generateTheme(foundationTokens.defaultTheme.sourceColor)
    const light = getThemeTokenValues(theme, 'light')
    const dark = getThemeTokenValues(theme, 'dark')
    expect(light['--md-sys-color-primary']).toBe(
      hexFromArgb(new MaterialDynamicColors().primary().getArgb(theme.schemes.light)),
    )
    expect(light['--md-sys-color-surface']).not.toBe(dark['--md-sys-color-surface'])
    expect(light['--md-ref-palette-primary40']).toBe(
      hexFromArgb(theme.schemes.light.primaryPalette.tone(40)),
    )
    const generatedCss = readFileSync(
      resolve(process.cwd(), '../../registry/foundations/styles/tokens.css'),
      'utf8',
    )
    expect(generatedCss).toContain(`--md-sys-color-primary: ${light['--md-sys-color-primary']};`)
    expect(generatedCss).toContain(`--md-sys-color-primary: ${dark['--md-sys-color-primary']};`)
  })

  it('applies and resets density, focus, and expressive motion settings', () => {
    const theme = generateTheme('#6750A4')
    const target = document.createElement('div')

    applyTheme(theme, target, 'dark', { density: -2, motion: 'expressive', strongFocus: true })
    expect(target.style.getPropertyValue('--md-sys-density-scale')).toBe('-2')
    expect(target.style.getPropertyValue('--yam3x-focus-ring-visibility')).toBe('visible')
    expect(target.style.getPropertyValue('--md-sys-motion-spring-fast-spatial')).toBe(
      '350ms cubic-bezier(0.42, 1.67, 0.21, 0.9)',
    )
    expect(target.style.getPropertyValue('--md-sys-motion-spring-slow-spatial')).toBe(
      '650ms cubic-bezier(0.39, 1.29, 0.35, 0.98)',
    )
    expect(target.style.getPropertyValue('--md-sys-motion-spring-slow-effects')).toBe(
      '300ms cubic-bezier(0.34, 0.88, 0.34, 1)',
    )

    applyTheme(theme, target, 'light')
    expect(target.style.getPropertyValue('--md-sys-density-scale')).toBe('0')
    expect(target.style.getPropertyValue('--yam3x-focus-ring-visibility')).toBe('hidden')
    expect(target.style.getPropertyValue('--md-sys-motion-spring-fast-spatial')).toBe(
      '350ms cubic-bezier(0.42, 1.67, 0.21, 0.9)',
    )
    applyTheme(theme, target, 'light', { motion: 'standard' })
    expect(target.style.getPropertyValue('--md-sys-motion-spring-fast-spatial')).toBe(
      '350ms cubic-bezier(0.27, 1.06, 0.18, 1)',
    )
    expect(target.style.getPropertyValue('--md-sys-motion-spring-slow-spatial')).toBe(
      '750ms cubic-bezier(0.27, 1.06, 0.18, 1)',
    )
    expect(() => applyTheme(theme, target, 'light', { density: -3 as never })).toThrow(/density/)
  })

  it('resolves system mode from the operating-system preference', () => {
    expect(resolveColorMode('system', true)).toBe('dark')
    expect(resolveColorMode('system', false)).toBe('light')
    expect(resolveColorMode('dark', false)).toBe('dark')
  })

  it('rejects an image before it has loaded dimensions', async () => {
    await expect(getColorFromImage(document.createElement('img'))).rejects.toThrow(
      /fully loaded image/,
    )
  })

  it('tracks system mode, emits bubbling change events, and restores target styles on dispose', () => {
    const mediaQueries = new Map<string, { matches: boolean; listener?: () => void }>()
    vi.stubGlobal('matchMedia', (query: string) => {
      const state = { matches: false as boolean, listener: undefined as (() => void) | undefined }
      mediaQueries.set(query, state)
      return {
        get matches() {
          return state.matches
        },
        addEventListener: (_type: string, callback: () => void) => {
          state.listener = callback
        },
        removeEventListener: (_type: string, callback: () => void) => {
          if (state.listener === callback) state.listener = undefined
        },
      }
    })
    const target = document.createElement('div')
    target.setAttribute('style', '--original: yes;')
    target.dataset.theme = 'custom'
    const onChange = vi.fn()
    target.addEventListener('change', onChange)
    const controller = createThemeController(target, { color: '#6750a4' })

    expect(controller.getMode()).toBe('light')
    expect(target.dataset.theme).toBe('light')
    const systemMedia = mediaQueries.get('(prefers-color-scheme: dark)')!
    systemMedia.matches = true
    systemMedia.listener?.()
    expect(controller.getMode()).toBe('dark')
    expect(target.dataset.theme).toBe('dark')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]?.[0]).toMatchObject({ bubbles: true })

    controller.update({ mode: 'light' })
    systemMedia.matches = false
    systemMedia.listener?.()
    expect(target.dataset.theme).toBe('light')
    expect(onChange).toHaveBeenCalledTimes(2)
    controller.dispose()
    expect(target.getAttribute('style')).toBe('--original: yes;')
    expect(target.dataset.theme).toBe('custom')
    expect(systemMedia.listener).toBeUndefined()
    controller.update({ mode: 'dark' })
    expect(target.dataset.theme).toBe('custom')
  })

  it('applies document body colors, typography and scrollbars, and restores them around forced colors', () => {
    const mediaQueries = new Map<string, { matches: boolean; listener?: () => void }>()
    vi.stubGlobal('matchMedia', (query: string) => {
      const state = { matches: false as boolean, listener: undefined as (() => void) | undefined }
      mediaQueries.set(query, state)
      return {
        get matches() {
          return state.matches
        },
        addEventListener: (_type: string, callback: () => void) => {
          state.listener = callback
        },
        removeEventListener: (_type: string, callback: () => void) => {
          if (state.listener === callback) state.listener = undefined
        },
      }
    })
    const root = document.documentElement
    const body = document.body
    root.setAttribute('style', '--root-old: yes;')
    body.setAttribute('style', 'background-color: pink; color: purple;')
    const controller = createThemeController(root, { color: '#6750a4', mode: 'dark' })
    expect(body.style.backgroundColor).toBe('var(--md-sys-color-background)')
    expect(body.style.lineHeight).toContain('1.5rem')
    expect(root.style.colorScheme).toBe('dark')

    const forcedMedia = mediaQueries.get('(forced-colors: active)')!
    forcedMedia.matches = true
    forcedMedia.listener?.()
    expect(body.style.backgroundColor).toBe('')
    expect(body.style.color).toBe('')
    expect(body.style.scrollbarColor).toBe('')
    controller.dispose()
    expect(root.getAttribute('style')).toBe('--root-old: yes;')
    expect(body.getAttribute('style')).toBe('background-color: pink; color: purple;')
  })
})
