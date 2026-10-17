export type AutocompleteFilterMode = 'contains' | 'starts-with' | 'ends-with' | 'none'

export interface AutocompleteOption {
  value: string
  label: string
  disabled?: boolean
}

export type AutocompleteFilter =
  AutocompleteFilterMode | ((option: AutocompleteOption, query: string) => boolean)
export type AutocompleteSelectionSource = 'keyboard' | 'pointer'
export type AutocompleteVariant = 'standard' | 'vibrant'
