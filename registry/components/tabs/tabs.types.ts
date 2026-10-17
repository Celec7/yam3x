export type TabsVariant = 'primary' | 'secondary'
export type TabsLayout = 'auto' | 'fixed' | 'scrollable'
export interface TabItem {
  value: string
  label: string
  ariaLabel?: string
  disabled?: boolean
  badge?: string | number
}
