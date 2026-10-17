export type ColorMode = 'light' | 'dark' | 'system'
export type ResolvedColorMode = Exclude<ColorMode, 'system'>
export type ThemeVariant = 'expressive' | 'vibrant' | 'tonal-spot' | 'neutral'
export type ThemeContrast = 'standard' | 'medium' | 'high'
export type ThemeMotion = 'standard' | 'expressive'

export type ThemeOptions = {
  variant?: ThemeVariant
  contrast?: ThemeContrast
}

export type ThemeApplicationOptions = {
  density?: 0 | -1 | -2
  motion?: ThemeMotion
  strongFocus?: boolean
}
