import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  formatDate,
  monthStart,
  parseIsoDate,
  parseLocalizedDate,
  toIsoDate,
} from '../../../../registry/components/date-picker/date-utils'

describe('date picker date arithmetic', () => {
  it('parses only real ISO calendar dates without local timezone drift', () => {
    expect(toIsoDate(parseIsoDate('2024-02-29')!)).toBe('2024-02-29')
    expect(parseIsoDate('2025-02-29')).toBeNull()
    expect(parseIsoDate('2025-13-01')).toBeNull()
    expect(parseIsoDate('2025-1-01')).toBeNull()
  })

  it('moves across month and year boundaries using UTC calendar days', () => {
    const date = parseIsoDate('2024-12-31')!
    expect(toIsoDate(addDays(date, 1))).toBe('2025-01-01')
    expect(toIsoDate(addMonths(date, 2))).toBe('2025-02-01')
    expect(toIsoDate(monthStart(date))).toBe('2024-12-01')
  })

  it('formats a stable localized day label in the UTC date domain', () => {
    expect(
      formatDate(parseIsoDate('2025-08-17')!, 'en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    ).toBe('Sunday, August 17, 2025')
  })

  it('parses complete compact dates in locale order without guessing incomplete values', () => {
    expect(parseLocalizedDate('10112026', 'en-US')).toBe('2026-10-11')
    expect(parseLocalizedDate('11102026', 'de-DE')).toBe('2026-10-11')
    expect(parseLocalizedDate('20261011', 'zh-CN')).toBe('2026-10-11')
    expect(parseLocalizedDate('02292024', 'en-US')).toBe('2024-02-29')
    expect(parseLocalizedDate('02292025', 'en-US')).toBeNull()
    expect(parseLocalizedDate('1122026', 'en-US')).toBeNull()
  })
})
