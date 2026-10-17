import type { DynamicScheme } from '@material/material-color-utilities'
import type { ThemeContrast, ThemeOptions, ThemeVariant, ResolvedColorMode } from './types'

export const defaultThemeSource: {
  readonly color: string
  readonly variant: ThemeVariant
  readonly contrast: ThemeContrast
}

export type GeneratedTheme = {
  sourceColor: string
  variant: ThemeVariant
  contrast: ThemeContrast
  schemes: { light: DynamicScheme; dark: DynamicScheme }
}

export function generateTheme(sourceColor: string, options?: ThemeOptions): GeneratedTheme
export function getThemeTokenValues(
  theme: GeneratedTheme,
  mode: ResolvedColorMode,
): Record<string, string>
