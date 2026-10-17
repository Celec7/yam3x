import type { InjectionKey, Ref } from 'vue'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import type { IconButtonVariant } from '../icon-button/icon-button.types'
import type { SplitButtonVariant } from './split-button.types'

export type SplitButtonContext = {
  variant: Ref<SplitButtonVariant>
  size: Ref<ButtonSize>
  shape: Ref<ButtonShape>
}

export const splitButtonContextKey: InjectionKey<SplitButtonContext> = Symbol('SplitButtonContext')

export function buttonVariant(variant: SplitButtonVariant): IconButtonVariant {
  if (variant === 'filled-tonal') return 'tonal'
  // Elevated remains a SplitButton style; the trailing segment uses the
  // standard IconButton base and receives its elevated colors locally.
  if (variant === 'elevated') return 'standard'
  return variant
}
