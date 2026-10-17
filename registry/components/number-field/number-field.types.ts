export type NumberFieldInvalidReason =
  'valueMissing' | 'badInput' | 'rangeUnderflow' | 'rangeOverflow' | 'customError'
export interface NumberFieldInvalidDetail {
  reason: NumberFieldInvalidReason
  message: string
}
export interface NumberFieldMessages extends Record<NumberFieldInvalidReason, string> {
  increment: string
  decrement: string
}
