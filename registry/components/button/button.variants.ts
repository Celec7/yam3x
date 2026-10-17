import { tv } from 'tailwind-variants'

export const buttonVariants = tv({
  base: 'yam3x-button yam3x-state-layer yam3x-touch-target inline-flex items-center justify-center',
  variants: {
    variant: {
      filled: 'yam3x-button--filled',
      'filled-tonal': 'yam3x-button--filled-tonal',
      elevated: 'yam3x-button--elevated',
      outlined: 'yam3x-button--outlined',
      text: 'yam3x-button--text',
    },
    size: {
      'extra-small': 'yam3x-control-size--extra-small',
      small: 'yam3x-control-size--small',
      medium: 'yam3x-control-size--medium',
      large: 'yam3x-control-size--large',
      'extra-large': 'yam3x-control-size--extra-large',
    },
  },
  defaultVariants: {
    variant: 'filled',
    size: 'small',
  },
})

export type ButtonVariant = 'filled' | 'filled-tonal' | 'elevated' | 'outlined' | 'text'
export type ToggleButtonVariant = Exclude<ButtonVariant, 'text'>
export type ButtonSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'
export type ButtonShape = 'round' | 'square'
