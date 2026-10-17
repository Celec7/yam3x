import type { ComputedRef, InjectionKey } from 'vue'

export type SegmentedButtonValue = string | string[] | null

export interface SegmentedButtonChangeDetail<
  T extends SegmentedButtonValue = SegmentedButtonValue,
> {
  previousValue: T
  value: T
}

export interface SegmentedButtonItemRecord {
  value: string
  element: HTMLButtonElement
  disabled: boolean
}

export interface SegmentedButtonGroupContext {
  mode: 'single' | 'multiple'
  selectedValues: ComputedRef<string[]>
  disabled: ComputedRef<boolean>
  name: ComputedRef<string | undefined>
  isSelected: (value: string) => boolean
  isDisabled: (value: string) => boolean
  tabIndex: (value: string) => 0 | -1
  registerItem: (item: SegmentedButtonItemRecord) => () => void
  updateItem: (item: SegmentedButtonItemRecord) => void
  select: (value: string) => void
}

export const segmentedButtonGroupKey: InjectionKey<SegmentedButtonGroupContext> = Symbol(
  'yam3x-segmented-button-group',
)
