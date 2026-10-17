import { shallowRef } from 'vue'
import type { ThemeControllerOptions } from '@registry/foundations/theme/controller'

/** Theme selected by the docs theme demo, shared by component demos across routes. */
export const docsDemoTheme = shallowRef<ThemeControllerOptions | null>(null)
