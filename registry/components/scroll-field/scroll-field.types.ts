export type ScrollFieldSize = 'small' | 'medium' | 'large'
export type ScrollFieldMode = 'scroll' | 'input'

export interface ScrollFieldInvalidDetail {
  reason: 'badInput' | 'rangeUnderflow' | 'rangeOverflow' | 'stepMismatch'
  value: string
}
