import { applyTheme, resolveColorMode } from './apply'
import { generateTheme } from './generate'
import type { ColorMode, ResolvedColorMode, ThemeApplicationOptions, ThemeOptions } from './types'

export type ThemeControllerOptions = ThemeOptions &
  ThemeApplicationOptions & {
    color: string
    mode?: ColorMode
  }

export type ThemeController = {
  update(options: Partial<ThemeControllerOptions>): void
  getMode(): ResolvedColorMode
  dispose(): void
}

/** Applies a theme, follows system dark mode when requested, and restores the target on disposal. */
export function createThemeController(
  target: HTMLElement,
  initial: ThemeControllerOptions,
): ThemeController {
  let options = { ...initial }
  const document = target.ownerDocument
  const rootTarget = target === document.documentElement || target === document.body
  const body = document.body
  const previousStyle = target.getAttribute('style')
  const previousTheme = target.getAttribute('data-theme')
  const previousBodyStyle = body?.getAttribute('style') ?? null
  const previousRootStyle = document.documentElement.getAttribute('style')
  const media =
    typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : undefined
  const forcedColors =
    typeof matchMedia === 'function' ? matchMedia('(forced-colors: active)') : undefined
  let disposed = false
  let lastSignature = ''

  const getMode = () => resolveColorMode(options.mode ?? 'system', media?.matches ?? false)
  const signature = () =>
    JSON.stringify({
      ...options,
      mode: getMode(),
      forcedColors: rootTarget && forcedColors?.matches,
    })
  const applyDocumentStyle = () => {
    if (!rootTarget || !body) return
    document.documentElement.style.colorScheme =
      (options.mode ?? 'system') === 'system' ? 'light dark' : getMode()
    if (forcedColors?.matches) {
      body.style.removeProperty('background-color')
      body.style.removeProperty('color')
      body.style.removeProperty('scrollbar-color')
      body.style.removeProperty('font-size')
      body.style.removeProperty('font-weight')
      body.style.removeProperty('line-height')
      body.style.removeProperty('letter-spacing')
      return
    }
    body.style.backgroundColor = 'var(--md-sys-color-background)'
    body.style.color = 'var(--md-sys-color-on-background)'
    body.style.scrollbarColor =
      'var(--yam3x-scrollbar-thumb-color) var(--yam3x-scrollbar-track-color)'
    body.style.fontSize = 'var(--md-sys-typescale-body-large-font-size, 1rem)'
    body.style.fontWeight = 'var(--md-sys-typescale-body-large-font-weight, 400)'
    body.style.lineHeight = 'var(--md-sys-typescale-body-large-line-height, 1.5rem)'
    body.style.letterSpacing = 'var(--md-sys-typescale-body-large-tracking, 0.03125rem)'
  }
  const render = (dispatchChange: boolean) => {
    const nextSignature = signature()
    if (nextSignature === lastSignature) return
    const theme = generateTheme(options.color, options)
    applyTheme(theme, target, getMode(), options)
    applyDocumentStyle()
    lastSignature = nextSignature
    if (dispatchChange) {
      target.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          detail: { ...options, resolvedMode: getMode() },
        }),
      )
    }
  }
  const onSystemChange = () => {
    if (!disposed && (options.mode ?? 'system') === 'system') render(true)
  }
  const onForcedColorsChange = () => {
    if (!disposed && rootTarget) render(true)
  }

  media?.addEventListener('change', onSystemChange)
  forcedColors?.addEventListener('change', onForcedColorsChange)
  render(false)

  return {
    update(next) {
      if (disposed) return
      options = { ...options, ...next }
      render(true)
    },
    getMode,
    dispose() {
      if (disposed) return
      disposed = true
      media?.removeEventListener('change', onSystemChange)
      forcedColors?.removeEventListener('change', onForcedColorsChange)
      if (previousStyle === null) target.removeAttribute('style')
      else target.setAttribute('style', previousStyle)
      if (previousTheme === null) target.removeAttribute('data-theme')
      else target.setAttribute('data-theme', previousTheme)
      if (rootTarget && target !== body && body) {
        if (previousBodyStyle === null) body.removeAttribute('style')
        else body.setAttribute('style', previousBodyStyle)
      }
      if (rootTarget && target !== document.documentElement) {
        if (previousRootStyle === null) document.documentElement.removeAttribute('style')
        else document.documentElement.setAttribute('style', previousRootStyle)
      }
    },
  }
}
