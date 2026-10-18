import { dateInputSegmentFallbacks as fallbackLabels } from '../localization/locales/en-US'

export type DateInputType = 'date' | 'time' | 'datetime'
export type DateInputTimeFormat = '12' | '24' | 'auto'
export type DateInputSegment = 'month' | 'day' | 'year' | 'hour' | 'minute' | 'second' | 'period'

export type DateInputPart =
  | {
      kind: 'field'
      id: DateInputSegment
      label: string
      min: number
      max: number
      maxLength: number
    }
  | { kind: 'literal'; value: string }

export function getDateInputSegmentLabel(locale: string, id: DateInputSegment): string {
  try {
    const field = id === 'period' ? 'dayPeriod' : id
    return new Intl.DisplayNames(locale, { type: 'dateTimeField' }).of(field) || fallbackLabels[id]
  } catch {
    return fallbackLabels[id]
  }
}

export function resolveTimeFormat(locale: string, timeFormat: DateInputTimeFormat): '12' | '24' {
  if (timeFormat !== 'auto') return timeFormat
  const hour12 = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12
  return hour12 === false ? '24' : '12'
}

export function getDateInputParts(
  locale: string,
  type: DateInputType,
  timeFormat: '12' | '24',
  showSeconds: boolean,
): DateInputPart[] {
  const dateOptions: Intl.DateTimeFormatOptions =
    type === 'time' ? {} : { year: 'numeric', month: '2-digit', day: '2-digit' }
  const timeOptions: Intl.DateTimeFormatOptions =
    type === 'date'
      ? {}
      : {
          hour: '2-digit',
          minute: '2-digit',
          ...(showSeconds ? { second: '2-digit' as const } : {}),
          hour12: timeFormat === '12',
        }
  const formatter = new Intl.DateTimeFormat(locale, {
    ...dateOptions,
    ...timeOptions,
    timeZone: 'UTC',
  })
  const sample = new Date(Date.UTC(2006, 10, 22, 13, 4, 5))
  const parts = formatter.formatToParts(sample)
  const result: DateInputPart[] = []

  for (const part of parts) {
    const id = part.type === 'dayPeriod' ? 'period' : part.type
    if (['month', 'day', 'year', 'hour', 'minute', 'second', 'period'].includes(id)) {
      const segment = id as DateInputSegment
      const twelveHour = segment === 'hour' && timeFormat === '12'
      result.push({
        kind: 'field',
        id: segment,
        label: getDateInputSegmentLabel(locale, segment),
        min:
          segment === 'month' || segment === 'day' || segment === 'year' ? 1 : twelveHour ? 1 : 0,
        max:
          segment === 'month'
            ? 12
            : segment === 'day'
              ? 31
              : segment === 'year'
                ? 9999
                : segment === 'hour'
                  ? twelveHour
                    ? 12
                    : 23
                  : segment === 'period'
                    ? 1
                    : 59,
        maxLength: segment === 'year' ? 4 : segment === 'period' ? 2 : 2,
      })
    } else if (part.type === 'literal' && part.value) {
      result.push({ kind: 'literal', value: part.value })
    }
  }

  return result
}

export function getSegmentDisplayValue(
  value: Date | null,
  id: DateInputSegment,
  timeFormat: '12' | '24',
): string {
  if (!value) return ''
  let number: number
  switch (id) {
    case 'month':
      number = value.getMonth() + 1
      break
    case 'day':
      number = value.getDate()
      break
    case 'year':
      number = value.getFullYear()
      break
    case 'hour': {
      const hour = value.getHours()
      number = timeFormat === '12' ? hour % 12 || 12 : hour
      break
    }
    case 'minute':
      number = value.getMinutes()
      break
    case 'second':
      number = value.getSeconds()
      break
    case 'period':
      return value.getHours() >= 12 ? '1' : '0'
  }
  return String(number).padStart(id === 'year' ? 4 : 2, '0')
}

export function dateFromSegments(
  segments: Partial<Record<DateInputSegment, number>>,
  type: DateInputType,
  timeFormat: '12' | '24',
  showSeconds: boolean,
  previous: Date | null,
  now = new Date(),
): Date | null {
  const { year, month, day, hour, minute, second, period } = segments
  if (type !== 'time' && (year === undefined || month === undefined || day === undefined))
    return null
  if (
    type !== 'date' &&
    (hour === undefined ||
      minute === undefined ||
      (timeFormat === '12' && period === undefined) ||
      (showSeconds && second === undefined))
  )
    return null

  const dateParts =
    type === 'time' && previous
      ? { year: previous.getFullYear(), month: previous.getMonth() + 1, day: previous.getDate() }
      : type === 'time'
        ? { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
        : { year: year!, month: month!, day: day! }
  const inputHour = hour === undefined ? (previous?.getHours() ?? 0) : hour
  const resolvedHour =
    timeFormat === '12' && type !== 'date' ? (inputHour % 12) + (period === 1 ? 12 : 0) : inputHour
  const result = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    type === 'date' && hour === undefined ? (previous?.getHours() ?? 0) : resolvedHour,
    type === 'date' && minute === undefined ? (previous?.getMinutes() ?? 0) : (minute ?? 0),
    type === 'date' && second === undefined ? (previous?.getSeconds() ?? 0) : (second ?? 0),
  )
  if (
    type !== 'time' &&
    (result.getFullYear() !== dateParts.year ||
      result.getMonth() !== dateParts.month - 1 ||
      result.getDate() !== dateParts.day)
  )
    return null
  return result
}

export function parseTimeBound(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!match) return null
  const hour = Number(match[1]),
    minute = Number(match[2]),
    second = Number(match[3] ?? 0)
  if (hour > 23 || minute > 59 || second > 59) return null
  return hour * 3600 + minute * 60 + second
}
