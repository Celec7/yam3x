export type MotionToken = {
  damping: number
  stiffness: number
  duration: `${number}ms`
  easing: string
}

export type FoundationTokens = {
  defaultTheme: {
    sourceColor: string
    variant: 'tonal-spot'
    contrast: 'standard'
  }
  motion: Record<'standard' | 'expressive', Record<string, MotionToken>>
}

export const foundationTokens: FoundationTokens
