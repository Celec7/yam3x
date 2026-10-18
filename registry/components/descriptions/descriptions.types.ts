export interface DescriptionItem {
  /** Stable identity within this description list. */
  key: string
  label: string
  value?: string | number | boolean | null
  fullWidth?: boolean
}
