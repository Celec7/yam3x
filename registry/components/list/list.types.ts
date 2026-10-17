import type { ComputedRef, InjectionKey } from 'vue'

export type ListVariant = 'standard' | 'segmented'
export type ListSelectionMode = 'single' | 'multiple'

export interface ListVariantContext {
  variant: ComputedRef<ListVariant>
}

export interface ListOptionRecord {
  value: string
  disabled: boolean
  element: HTMLLIElement
}

export interface SelectionListContext {
  mode: ComputedRef<ListSelectionMode>
  selectedValues: ComputedRef<string[]>
  activeValue: ComputedRef<string | null>
  disabled: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  name: ComputedRef<string | undefined>
  form: ComputedRef<string | undefined>
  optionChanged: () => void
  registerOption: (record: ListOptionRecord) => () => void
  focusOption: (value: string) => void
  selectOption: (value: string) => void
  isSelected: (value: string) => boolean
  isOptionDisabled: (value: string) => boolean
}

export const listVariantKey: InjectionKey<ListVariantContext> = Symbol('yam3x-list-variant')
export const selectionListKey: InjectionKey<SelectionListContext> = Symbol('yam3x-selection-list')
export const actionListKey: InjectionKey<boolean> = Symbol('yam3x-action-list')
