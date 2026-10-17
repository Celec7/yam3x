import type { InjectionKey } from 'vue'

export type TooltipPosition = 'above' | 'below' | 'before' | 'after'
export type RichTooltipPosition =
  TooltipPosition | 'above-before' | 'above-after' | 'below-before' | 'below-after'
export type TooltipTouchGestures = 'auto' | 'on' | 'off'

export interface RichTooltipContext {
  hide(restoreFocus?: boolean): void
}

export const richTooltipContextKey: InjectionKey<RichTooltipContext> = Symbol('yam3x-rich-tooltip')
