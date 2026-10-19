export interface CascaderOption {
  /** Stable, non-empty identity within its immediate sibling collection. */
  value: string
  label: string
  disabled?: boolean
  children?: readonly CascaderOption[]
}
