export type TimeValue = { hour: number; minute: number; second?: number }
export type TimePickerFormat = '12' | '24' | 'auto'
export type TimePickerView = 'hour' | 'minute' | 'second'
export type TimePickerMode = 'dial' | 'input'
export type TimePickerLayoutType = 'vertical' | 'horizontal'
export type TimePickerVariant = 'standard' | 'vibrant'

export interface TimePickerCommonProps {
  modelValue?: TimeValue | null
  format?: TimePickerFormat
  showSeconds?: boolean
  minTime?: TimeValue
  maxTime?: TimeValue
  isTimeSelectable?: (value: TimeValue) => boolean
  locale?: string
  hourLabel?: string
  minuteLabel?: string
  secondLabel?: string
  periodLabel?: string
  dialValueLabel?: (context: { value: number; unit: TimePickerView; max: number }) => string
  dialLabel?: string
  inputLabel?: string
}

export interface TimePickerControlProps extends TimePickerCommonProps {
  mode?: TimePickerMode
  layoutType?: TimePickerLayoutType
  inputOnly?: boolean
  showModeToggle?: boolean
  showActions?: boolean
  showHeadline?: boolean
  modeToggleLabel?: string
  useDialLabel?: string
  hideModeToggle?: boolean
  cancelLabel?: string
  confirmLabel?: string
}

export interface TimePickerProps extends TimePickerCommonProps {
  layoutType?: TimePickerLayoutType
}

export type TimeInputProps = TimePickerCommonProps

export interface TimePickerDialogProps extends TimePickerCommonProps {
  open?: boolean
  mode?: TimePickerMode
  presentation?: 'modal' | 'docked'
  orientation?: 'auto' | TimePickerLayoutType
  variant?: TimePickerVariant
  label?: string
  triggerLabel?: string
  modeToggleLabel?: string
  useDialLabel?: string
  hideModeToggle?: boolean
  cancelLabel?: string
  confirmLabel?: string
  disabled?: boolean
}
