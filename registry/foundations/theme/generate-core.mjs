import {
  argbFromHex,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  Variant,
  hexFromArgb,
} from '@material/material-color-utilities'
import { foundationTokens } from '../tokens/foundation-tokens.mjs'

const variants = {
  expressive: Variant.EXPRESSIVE,
  vibrant: Variant.VIBRANT,
  'tonal-spot': Variant.TONAL_SPOT,
  neutral: Variant.NEUTRAL,
}
const contrasts = { standard: 0, medium: 0.5, high: 1 }
const paletteTones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]

export const defaultThemeSource = Object.freeze({
  color: foundationTokens.defaultTheme.sourceColor,
  variant: foundationTokens.defaultTheme.variant,
  contrast: foundationTokens.defaultTheme.contrast,
})

export function generateTheme(sourceColor, options = {}) {
  const normalizedColor = sourceColor.startsWith('#') ? sourceColor : `#${sourceColor}`
  if (!/^#[\da-f]{6}$/i.test(normalizedColor)) {
    throw new TypeError(`Expected a six-digit hex color, received "${sourceColor}".`)
  }

  const sourceColorHct = Hct.fromInt(argbFromHex(normalizedColor))
  const variant = options.variant ?? defaultThemeSource.variant
  const contrast = options.contrast ?? defaultThemeSource.contrast
  if (!Object.hasOwn(variants, variant))
    throw new TypeError(`Unsupported theme variant: "${variant}".`)
  if (!Object.hasOwn(contrasts, contrast))
    throw new TypeError(`Unsupported theme contrast: "${contrast}".`)

  const createScheme = (isDark) =>
    new DynamicScheme({
      sourceColorHct,
      variant: variants[variant],
      contrastLevel: contrasts[contrast],
      isDark,
      specVersion: '2025',
    })

  return {
    sourceColor: normalizedColor.toLowerCase(),
    variant,
    contrast,
    schemes: { light: createScheme(false), dark: createScheme(true) },
  }
}

export function getThemeTokenValues(theme, mode) {
  const scheme = theme.schemes[mode]
  const palettes = {
    primary: scheme.primaryPalette,
    secondary: scheme.secondaryPalette,
    tertiary: scheme.tertiaryPalette,
    neutral: scheme.neutralPalette,
    'neutral-variant': scheme.neutralVariantPalette,
    error: scheme.errorPalette,
  }
  const reference = Object.fromEntries(
    Object.entries(palettes).flatMap(([name, palette]) =>
      paletteTones.map((tone) => [
        `--md-ref-palette-${name}${tone}`,
        hexFromArgb(palette.tone(tone)),
      ]),
    ),
  )

  const colors = new MaterialDynamicColors()
  const roles = [
    ...colors.allColors,
    colors.surfaceVariant(),
    colors.shadow(),
    colors.scrim(),
    colors.surfaceTint(),
  ]
  const semantic = Object.fromEntries(
    roles.map((color) => [
      `--md-sys-color-${color.name.replace(/_/g, '-').toLowerCase()}`,
      hexFromArgb(color.getArgb(scheme)),
    ]),
  )
  return { ...reference, ...semantic }
}
