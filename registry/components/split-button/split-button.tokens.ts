import type { ButtonSize } from '../button/button.variants'

export type SplitButtonTokens = {
  innerCornerRest: number
  innerCornerActive: number
  leadingPadding: [number, number]
  trailingIconSize: number
  trailingSpace: {
    unselected: [number, number]
    selected: [number, number]
  }
}

export const splitButtonTokens: Record<ButtonSize, SplitButtonTokens> = {
  'extra-small': {
    innerCornerRest: 4,
    innerCornerActive: 8,
    leadingPadding: [12, 10],
    trailingIconSize: 22,
    trailingSpace: { unselected: [12, 14], selected: [13, 13] },
  },
  small: {
    innerCornerRest: 4,
    innerCornerActive: 12,
    leadingPadding: [16, 12],
    trailingIconSize: 22,
    trailingSpace: { unselected: [12, 14], selected: [13, 13] },
  },
  medium: {
    innerCornerRest: 4,
    innerCornerActive: 12,
    leadingPadding: [24, 24],
    trailingIconSize: 26,
    trailingSpace: { unselected: [13, 17], selected: [15, 15] },
  },
  large: {
    innerCornerRest: 8,
    innerCornerActive: 20,
    leadingPadding: [48, 48],
    trailingIconSize: 38,
    trailingSpace: { unselected: [26, 32], selected: [29, 29] },
  },
  'extra-large': {
    innerCornerRest: 12,
    innerCornerActive: 20,
    leadingPadding: [64, 64],
    trailingIconSize: 50,
    trailingSpace: { unselected: [37, 49], selected: [43, 43] },
  },
}
