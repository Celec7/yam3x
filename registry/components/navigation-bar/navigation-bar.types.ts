import type { InjectionKey, Ref } from 'vue'

export type NavigationBarLayout = 'vertical' | 'horizontal' | 'auto'

export interface NavigationBarDestination {
  value: string
  label: string
  href: string
  ariaLabel?: string
  disabled?: boolean
  disabledInteractive?: boolean
  download?: boolean | string
  rel?: string
  target?: string
}

export interface NavigationBarContext {
  modelValue: Ref<string>
  activate(destination: NavigationBarDestination, event: MouseEvent): void
}

export const navigationBarContextKey: InjectionKey<NavigationBarContext> = Symbol(
  'yam3x-navigation-bar-context',
)
