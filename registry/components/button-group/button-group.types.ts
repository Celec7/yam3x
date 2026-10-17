import type { ComputedRef, InjectionKey } from 'vue'
import type { ToggleButtonVariant } from '../button/button.variants'
import type { IconButtonVariant } from '../icon-button/icon-button.types'

export type ButtonGroupVariant = 'standard' | 'connected'
export type ButtonGroupSelectionMode = 'single' | 'multiple'
export type ButtonGroupValue = string | string[]

export interface ButtonGroupOverflowItem {
  value: string
  label?: string
  disabled: boolean
}

export interface ButtonGroupItemRecord extends ButtonGroupOverflowItem {
  element: HTMLElement
  weight: number
  animateWidth: boolean
}

export interface ButtonGroupContext {
  variant: ComputedRef<ButtonGroupVariant>
  registerItem: (item: ButtonGroupItemRecord) => () => void
  updateItem: (item: ButtonGroupItemRecord) => void
  activateItem: (
    item: ButtonGroupItemRecord,
    source: 'button' | 'overflow',
    event?: MouseEvent,
  ) => void
}

export const buttonGroupKey: InjectionKey<ButtonGroupContext> = Symbol('yam3x-button-group')

export interface ButtonGroupItemActivateEvent {
  value: string
  source: 'button' | 'overflow'
  event?: MouseEvent
}

export interface ButtonGroupOption {
  label: string
  value: string
  kind?: 'button' | 'icon'
  disabled?: boolean
  buttonVariant?: ToggleButtonVariant
  iconButtonVariant?: IconButtonVariant
}

export type ButtonGroupButtonVariant = NonNullable<ButtonGroupOption['buttonVariant']>
export type ButtonGroupIconButtonVariant = NonNullable<ButtonGroupOption['iconButtonVariant']>
