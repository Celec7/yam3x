export type NavigationRailMode = 'collapsed' | 'expanded' | 'auto'

export interface NavigationRailItem {
  value: string
  label: string
  href: string
  ariaLabel?: string
  disabled?: boolean
  disabledInteractive?: boolean
  secondary?: boolean
  badge?: string | number
  badgeLabel?: string
  target?: string
  rel?: string
  download?: boolean | string
}
