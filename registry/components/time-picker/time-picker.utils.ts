import { timePickerPeriodFallbacks } from '../localization/locales/en-US'
import type { TimePickerFormat, TimeValue } from './time-picker.types'

export type { TimePickerFormat, TimePickerView, TimeValue } from './time-picker.types'
export type TimeParts = TimeValue
export type HourDialItem = { value: number; label: string; angle: number; inner: boolean }

export function parseTimeValue(value: TimeValue | null | undefined): TimeValue | null {
  return value ? validateTimeValue(value) : null
}

export function parseTimeParts(value: string | TimeValue | null | undefined): TimeValue | null {
  if (typeof value === 'string') {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim())
    if (!match) return null
    return validateTimeValue({
      hour: Number(match[1]),
      minute: Number(match[2]),
      second: Number(match[3] ?? 0),
    })
  }
  if (value) return validateTimeValue(value)
  return null
}

export function validateTimeValue(value: TimeValue): TimeValue | null {
  const { hour, minute, second = 0 } = value
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null
  if (!Number.isInteger(second) || second < 0 || second > 59) return null
  return value.second === undefined ? { hour, minute } : { hour, minute, second }
}

export function timeToSeconds(value: TimeValue): number {
  return value.hour * 3600 + value.minute * 60 + (value.second ?? 0)
}

export function resolveTimePickerFormat(format: TimePickerFormat, locale: string): '12' | '24' {
  if (format !== 'auto') return format
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle
  return cycle === 'h11' || cycle === 'h12' ? '12' : '24'
}

export function getTimePeriodLabels(locale: string): { am: string; pm: string; group: string } {
  const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
  const label = (hour: number) =>
    formatter.formatToParts(new Date(2026, 0, 1, hour)).find((part) => part.type === 'dayPeriod')
      ?.value
  const am = label(9) || timePickerPeriodFallbacks.am
  const pm = label(21) || timePickerPeriodFallbacks.pm
  return { am, pm, group: new Intl.ListFormat(locale, { type: 'disjunction' }).format([am, pm]) }
}

export function formatTimeValue(
  value: TimeValue | null,
  locale: string,
  format: '12' | '24',
  showSeconds: boolean,
): string {
  if (!value) return ''
  const date = new Date(2026, 0, 1, value.hour, value.minute, showSeconds ? (value.second ?? 0) : 0)
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12',
  }
  if (showSeconds) options.second = '2-digit'
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export function getHourDialItems(format: '12' | '24'): HourDialItem[] {
  if (format === '12') {
    return Array.from({ length: 12 }, (_, index) => {
      const value = index + 1
      return { value, label: String(value), angle: (value % 12) * 30, inner: false }
    })
  }
  return Array.from({ length: 24 }, (_, value) => ({
    value,
    label: value === 0 ? '00' : String(value),
    angle: Math.floor(value / 2) * 30,
    inner: value % 2 === 0,
  }))
}

export function getTickDialItems(): Array<{ value: number; label: string; angle: number }> {
  return Array.from({ length: 12 }, (_, index) => {
    const value = index * 5
    return { value, label: String(value).padStart(2, '0'), angle: value * 6 }
  })
}
