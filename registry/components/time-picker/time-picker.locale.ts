import { useComponentLocale } from '../localization/context'
import type { TimePickerControlProps } from './time-picker.types'

export function useTimePickerLocale(props: TimePickerControlProps & { label?: string }) {
  return useComponentLocale(
    'timePicker',
    () => props.locale,
    () => ({
      label: props.label,
      hour: props.hourLabel,
      minute: props.minuteLabel,
      second: props.secondLabel,
      period: props.periodLabel,
      modeToggle: props.modeToggleLabel,
      useDial: props.useDialLabel,
      dial: props.dialLabel,
      input: props.inputLabel,
      cancel: props.cancelLabel,
      confirm: props.confirmLabel,
      dialValue: props.dialValueLabel,
    }),
    () => (typeof navigator === 'undefined' ? 'en-US' : navigator.language),
  )
}
