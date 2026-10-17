export type SideSheetMode = 'adaptive' | 'modal' | 'standard'

export type SideSheetToggleSlotProps = {
  expanded: boolean
  controls: string
  toggle: (event?: Event) => void
}
