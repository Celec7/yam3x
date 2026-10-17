import type { InjectionKey, Ref } from 'vue'
import type { FabMenuPresentation } from './fab-menu.types'

export interface FloatingActionButtonMenuItemRegistration {
  element: Ref<HTMLElement | null>
  disabled: Ref<boolean>
  value: Ref<string>
  label: Ref<string>
}

export interface FloatingActionButtonMenuContext {
  expanded: Ref<boolean>
  presentation: Ref<FabMenuPresentation>
  openingSide: Ref<'up' | 'down'>
  activeIndex: Ref<number>
  items: Ref<FloatingActionButtonMenuItemRegistration[]>
  register: (item: FloatingActionButtonMenuItemRegistration) => () => void
  select: (item: FloatingActionButtonMenuItemRegistration, event: MouseEvent) => void
}

export const floatingActionButtonMenuKey: InjectionKey<FloatingActionButtonMenuContext> = Symbol(
  'FloatingActionButtonMenu',
)
