import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface NavigationDrawerContext {
  current: Ref<string | undefined>
  parentDisabled: ComputedRef<boolean>
  ancestors: ComputedRef<readonly string[]>
  select(value: string, href: string | undefined, event: MouseEvent): void
  registerDisclosure(value: string, setOpen: ((open: boolean) => void) | null): void
}

export const navigationDrawerContextKey: InjectionKey<NavigationDrawerContext> = Symbol(
  'yam3x-navigation-drawer-context',
)
export const navigationDrawerParentControlKey: InjectionKey<ComputedRef<HTMLButtonElement | null>> =
  Symbol('yam3x-navigation-drawer-parent-control')
