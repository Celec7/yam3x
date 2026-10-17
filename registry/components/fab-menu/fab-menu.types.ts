export type FabMenuVariant = 'primary' | 'secondary' | 'tertiary'
export type FabMenuHorizontalAlignment = 'start' | 'center' | 'end'
export type FabMenuTriggerSize = 'small' | 'default' | 'medium' | 'large'
export type FabMenuPresentation = 'pill-stack' | 'web-menu'
export type FabMenuSelectionSource = 'pointer' | 'keyboard'

export interface FabMenuItem {
  value: string
  label: string
  disabled?: boolean
  selected?: boolean
  href?: string
  target?: string
  rel?: string
  download?: boolean | string
}
