import { getThemeTokenValues, type GeneratedTheme } from './generate'
import { foundationTokens } from '../tokens/foundation-tokens.mjs'
import type { ColorMode, ResolvedColorMode, ThemeApplicationOptions } from './types'

export function resolveColorMode(mode: ColorMode, systemPrefersDark: boolean): ResolvedColorMode {
  return mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode
}

export function applyTheme(
  theme: GeneratedTheme,
  target: HTMLElement,
  mode: ResolvedColorMode,
  options: ThemeApplicationOptions = {},
): void {
  const density = options.density ?? 0
  if (density !== 0 && density !== -1 && density !== -2) {
    throw new TypeError(`Unsupported theme density: "${density}".`)
  }
  const motion = options.motion ?? 'expressive'
  if (motion !== 'standard' && motion !== 'expressive') {
    throw new TypeError(`Unsupported theme motion: "${motion}".`)
  }

  const colorTokens = getThemeTokenValues(theme, mode)
  for (const [name, value] of Object.entries(colorTokens)) {
    target.style.setProperty(name, value)
  }

  target.style.setProperty('--md-sys-density-scale', String(density))
  const densityFactor = density === 0 ? 1 : density === -1 ? 0.875 : 0.75
  target.style.setProperty('--md-sys-density-spacing-scale', String(densityFactor))
  target.style.setProperty('--md-sys-density-container-scale', String(densityFactor))
  target.style.setProperty(
    '--yam3x-focus-ring-visibility',
    options.strongFocus ? 'visible' : 'hidden',
  )
  target.style.setProperty(
    '--yam3x-scrollbar-thumb-color',
    colorTokens['--md-ref-palette-neutral60']!,
  )
  target.style.setProperty('--yam3x-scrollbar-track-color', 'transparent')
  for (const [name, token] of Object.entries(foundationTokens.motion[motion])) {
    target.style.setProperty(`--md-sys-motion-spring-${name}`, `${token.duration} ${token.easing}`)
    target.style.setProperty(`--md-sys-motion-duration-${name}`, token.duration)
    target.style.setProperty(`--md-sys-motion-easing-${name}`, token.easing)
  }

  target.dataset.theme = mode
  target.style.colorScheme = mode
}
