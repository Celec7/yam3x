export type MenuVariant = 'standard' | 'vibrant'
export type MenuPositionX = 'before' | 'after'
export type MenuPositionY = 'above' | 'below'
export type MenuItemType = 'item' | 'checkbox' | 'radio' | 'submenu' | 'divider' | 'label' | 'gap'

interface MenuItemBase {
  value: string
  group?: string
  items?: MenuItem[]
  href?: string
  target?: string
  rel?: string
  download?: boolean | string
  disabled?: boolean
}

interface ActionMenuItem extends MenuItemBase {
  label: string
  type?: 'item' | 'checkbox' | 'radio'
  items?: never
  supportingText?: string
  trailingText?: string
  badge?: string | number
  shortcut?: string
  leadingIcon?: boolean
  trailingIcon?: boolean
}

interface SubmenuItem extends MenuItemBase {
  label: string
  type?: 'submenu'
  items: MenuItem[]
  supportingText?: string
  trailingText?: string
  badge?: string | number
  shortcut?: string
  leadingIcon?: boolean
  trailingIcon?: boolean
}

interface GroupLabelItem extends MenuItemBase {
  label: string
  type: 'label'
  items?: never
}

interface DividerItem extends MenuItemBase {
  type: 'divider'
  label?: never
  items?: never
}

interface GapItem extends MenuItemBase {
  type: 'gap'
  label?: never
  items?: never
}

export type MenuItem = ActionMenuItem | SubmenuItem | GroupLabelItem | DividerItem | GapItem
