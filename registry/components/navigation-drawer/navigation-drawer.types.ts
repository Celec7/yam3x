export type NavigationDrawerMode = 'modal' | 'standard' | 'auto'

export type NavigationDrawerChangeReason = 'toggle' | 'dismiss' | 'select'

export type NavigationDrawerToggleSlotProps = {
  expanded: boolean
  controls: string
  toggle: (event?: Event) => void
}

export type NavigationDrawerCloseSlotProps = {
  closeLabel: string
  close: () => void
}
