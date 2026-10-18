export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  selected?: boolean
}

export type SelectFilter =
  | 'contains'
  | 'starts-with'
  | 'ends-with'
  | 'none'
  | ((option: SelectOption, query: string) => boolean)
