export const buttonVariantClasses = {
  filled: 'yam3x-button--filled',
  'filled-tonal': 'yam3x-button--filled-tonal',
  elevated: 'yam3x-button--elevated',
  outlined: 'yam3x-button--outlined',
  text: 'yam3x-button--text',
} as const

export const buttonSizeClasses = {
  'extra-small': 'yam3x-control-size--extra-small',
  small: 'yam3x-control-size--small',
  medium: 'yam3x-control-size--medium',
  large: 'yam3x-control-size--large',
  'extra-large': 'yam3x-control-size--extra-large',
} as const

export type ButtonVariant = keyof typeof buttonVariantClasses
export type ToggleButtonVariant = Exclude<ButtonVariant, 'text'>
export type ButtonSize = keyof typeof buttonSizeClasses
export type ButtonShape = 'round' | 'square'

export interface ButtonVariantOptions {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function buttonVariants({
  variant = 'filled',
  size = 'small',
}: ButtonVariantOptions = {}): string {
  return `yam3x-button yam3x-state-layer yam3x-touch-target ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]}`
}
