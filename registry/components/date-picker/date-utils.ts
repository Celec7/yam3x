export type DateRangeValue = { start: string | null; end: string | null }

export interface DateAvailabilityOptions {
  minDate?: string | null
  maxDate?: string | null
  yearRange?: readonly [number, number]
  isDateSelectable?: (date: string) => boolean
}

export function createUtcDate(year: number, month: number, day: number): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = createUtcDate(year, month - 1, day)
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null
}

export function parseLocalizedDate(value: string, locale: string): string | null {
  const exact = parseIsoDate(value)
  if (exact) return toIsoDate(exact)

  if (/^\d{8}$/.test(value)) {
    const order = getDateOrder(locale)
    const yearIndex = order.indexOf('year')
    if (yearIndex !== 0 && yearIndex !== 2) return null
    const segments =
      yearIndex === 0
        ? [value.slice(0, 4), value.slice(4, 6), value.slice(6, 8)]
        : [value.slice(0, 2), value.slice(2, 4), value.slice(4, 8)]
    const parts = Object.fromEntries(order.map((part, index) => [part, segments[index]]))
    const parsed = parseIsoDate(
      `${parts.year}-${String(Number(parts.month)).padStart(2, '0')}-${String(Number(parts.day)).padStart(2, '0')}`,
    )
    return parsed ? toIsoDate(parsed) : null
  }

  const match = value.match(/^(\d{1,4})[\s./-](\d{1,2})[\s./-](\d{1,4})$/)
  if (!match) return null

  const numbers = match.slice(1).map(Number)
  let year: number
  let month: number
  let day: number

  if (match[1].length === 4) {
    year = numbers[0]
    month = numbers[1]
    day = numbers[2]
  } else if (match[3].length === 4) {
    const dateOrder = getDateOrder(locale)
    const parts: Record<string, number> = {}
    dateOrder.forEach((part, index) => {
      parts[part] = numbers[index]
    })
    year = parts.year
    month = parts.month
    day = parts.day
  } else {
    return null
  }

  const date = parseIsoDate(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  )
  return date ? toIsoDate(date) : null
}

function getDateOrder(locale: string): Array<'day' | 'month' | 'year'> {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  })
    .formatToParts(new Date(Date.UTC(2006, 10, 22)))
    .filter((part) => part.type === 'day' || part.type === 'month' || part.type === 'year')
    .map((part) => part.type as 'day' | 'month' | 'year')
}

export function toIsoDate(date: Date): string {
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function monthStart(date: Date): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1)
}

export function addMonths(date: Date, amount: number): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)
}

export function addDays(date: Date, amount: number): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount)
}

export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(date)
}

export function isDateAllowed(value: string, options: DateAvailabilityOptions): boolean {
  const date = parseIsoDate(value)
  if (!date) return false
  if (
    options.yearRange &&
    (date.getUTCFullYear() < options.yearRange[0] || date.getUTCFullYear() > options.yearRange[1])
  )
    return false
  if (options.minDate && value < options.minDate) return false
  if (options.maxDate && value > options.maxDate) return false
  return options.isDateSelectable?.(value) !== false
}

export function hasSelectableDateInMonth(
  year: number,
  month: number,
  isAllowed: (value: string) => boolean,
): boolean {
  const lastDay = createUtcDate(year, month + 1, 0).getUTCDate()
  for (let day = 1; day <= lastDay; day += 1) {
    const value = toIsoDate(createUtcDate(year, month, day))
    if (isAllowed(value)) return true
  }
  return false
}

export function hasSelectableDateInYear(
  year: number,
  hasSelectableDateInMonth: (year: number, month: number) => boolean,
): boolean {
  for (let month = 0; month < 12; month += 1) {
    if (hasSelectableDateInMonth(year, month)) return true
  }
  return false
}
