import type { DateRangeValue } from './date-utils'

export type DatePickerMode = 'docked' | 'modal' | 'auto'

export interface DatePickerCommonProps {
  mode?: DatePickerMode
  open?: boolean
  initialDate?: string
  minDate?: string
  maxDate?: string
  yearRange?: [number, number]
  isDateSelectable?: (date: string) => boolean
  locale?: string
  label?: string
  startDateLabel?: string
  endDateLabel?: string
  supportingText?: string
  placeholder?: string
  clearable?: boolean
  calendarLabel?: string
  previousMonthLabel?: string
  nextMonthLabel?: string
  previousYearLabel?: string
  nextYearLabel?: string
  confirmLabel?: string
  cancelLabel?: string
  clearLabel?: string
}

export interface DatePickerProps extends DatePickerCommonProps {
  modelValue?: string | null
}

export interface DateRangePickerProps extends DatePickerCommonProps {
  modelValue?: DateRangeValue
}

export type { DateRangeValue }
