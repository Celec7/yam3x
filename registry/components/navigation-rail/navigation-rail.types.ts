export type NavigationRailMode = 'collapsed' | 'expanded' | 'auto'
export type NavigationRailDensity = 'standard' | 'compact'

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
  children?: readonly NavigationRailChild[]
}

export type NavigationRailChild = Omit<NavigationRailItem, 'children'>
