export type DividerThickness = number | string

export interface DividerProps {
  thickness?: DividerThickness
  color?: string
  inset?: boolean
  insetStart?: boolean
  insetEnd?: boolean
  decorative?: boolean
}

export type DividerOrientation = 'horizontal' | 'vertical'
