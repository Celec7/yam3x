// The initial light and dark color token CSS is generated from this MCU 2025 source and variant.
// Spring parameters: https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt
// Web easing and durations: https://m3.material.io/styles/motion/overview/specs
export const foundationTokens = {
  defaultTheme: {
    sourceColor: '#6750a4',
    variant: 'tonal-spot',
    contrast: 'standard',
  },
  motion: {
    expressive: {
      'fast-spatial': {
        damping: 0.6,
        stiffness: 800,
        duration: '350ms',
        easing: 'cubic-bezier(0.42, 1.67, 0.21, 0.9)',
      },
      'default-spatial': {
        damping: 0.8,
        stiffness: 380,
        duration: '500ms',
        easing: 'cubic-bezier(0.38, 1.21, 0.22, 1)',
      },
      'slow-spatial': {
        damping: 0.8,
        stiffness: 200,
        duration: '650ms',
        easing: 'cubic-bezier(0.39, 1.29, 0.35, 0.98)',
      },
      'fast-effects': {
        damping: 1,
        stiffness: 3800,
        duration: '150ms',
        easing: 'cubic-bezier(0.31, 0.94, 0.34, 1)',
      },
      'default-effects': {
        damping: 1,
        stiffness: 1600,
        duration: '200ms',
        easing: 'cubic-bezier(0.34, 0.8, 0.34, 1)',
      },
      'slow-effects': {
        damping: 1,
        stiffness: 800,
        duration: '300ms',
        easing: 'cubic-bezier(0.34, 0.88, 0.34, 1)',
      },
    },
    standard: {
      'fast-spatial': {
        damping: 0.9,
        stiffness: 1400,
        duration: '350ms',
        easing: 'cubic-bezier(0.27, 1.06, 0.18, 1)',
      },
      'default-spatial': {
        damping: 0.9,
        stiffness: 700,
        duration: '500ms',
        easing: 'cubic-bezier(0.27, 1.06, 0.18, 1)',
      },
      'slow-spatial': {
        damping: 0.9,
        stiffness: 300,
        duration: '750ms',
        easing: 'cubic-bezier(0.27, 1.06, 0.18, 1)',
      },
      'fast-effects': {
        damping: 1,
        stiffness: 3800,
        duration: '150ms',
        easing: 'cubic-bezier(0.31, 0.94, 0.34, 1)',
      },
      'default-effects': {
        damping: 1,
        stiffness: 1600,
        duration: '200ms',
        easing: 'cubic-bezier(0.34, 0.8, 0.34, 1)',
      },
      'slow-effects': {
        damping: 1,
        stiffness: 800,
        duration: '300ms',
        easing: 'cubic-bezier(0.34, 0.88, 0.34, 1)',
      },
    },
  },
}
