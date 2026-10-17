import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface SelectOptionRecord {
  value: string
  label: string
  disabled: boolean
  selected: boolean
  id: string
  element: HTMLElement | null
}

export interface SelectOptionContext {
  values: ComputedRef<readonly string[]>
  activeValue: Ref<string | null>
  isSelected(value: string): boolean
  select(value: string, source: 'pointer' | 'keyboard' | 'programmatic'): void
  register(option: SelectOptionRecord): () => void
}

export const selectOptionContextKey: InjectionKey<SelectOptionContext> =
  Symbol('yam3x-select-options')
