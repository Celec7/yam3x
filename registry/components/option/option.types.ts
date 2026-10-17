export type OptionHighlightMode = 'contains' | 'starts-with' | 'ends-with'
export type OptionSelectionSource = 'pointer' | 'keyboard' | 'programmatic'

export interface OptionSelectionDetail {
  value: string
  source: OptionSelectionSource
}

export interface OptionToggleDetail {
  open: boolean
  source: 'programmatic' | 'outside' | 'anchor-scroll'
}
