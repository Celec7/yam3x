export type DrawerMode = 'overlay' | 'push' | 'side' | 'auto'
export type DrawerPanelRole = 'dialog' | 'complementary'

export type DrawerToggleSlotProps = {
  expanded: boolean
  controls: string
  toggle: (event?: Event) => void
}
