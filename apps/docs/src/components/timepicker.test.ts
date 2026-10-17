import { describe, expect, it } from 'vitest'
import {
  formatTimeValue,
  getHourDialItems,
  getTickDialItems,
  getTimePeriodLabels,
  parseTimeValue,
  resolveTimePickerFormat,
  timeToSeconds,
  validateTimeValue,
} from '../../../../registry/components/time-picker/time-picker.utils'

describe('time picker utilities', () => {
  it('validates local time values independently from calendar dates', () => {
    expect(parseTimeValue({ hour: 9, minute: 5 })).toEqual({ hour: 9, minute: 5 })
    expect(parseTimeValue({ hour: 23, minute: 59, second: 59 })).toEqual({
      hour: 23,
      minute: 59,
      second: 59,
    })
    expect(validateTimeValue({ hour: 24, minute: 0 })).toBeNull()
    expect(validateTimeValue({ hour: 12, minute: 60 })).toBeNull()
    expect(validateTimeValue({ hour: 12, minute: 30, second: 60 })).toBeNull()
  })

  it('resolves localized format and formats time values without calendar data', () => {
    expect(resolveTimePickerFormat('auto', 'en-US')).toBe('12')
    expect(resolveTimePickerFormat('auto', 'de-DE')).toBe('24')
    expect(formatTimeValue({ hour: 13, minute: 7 }, 'en-US', '12', false)).toMatch(/1:07\s?PM/i)
    expect(formatTimeValue({ hour: 13, minute: 7, second: 9 }, 'de-DE', '24', true)).toContain(
      '13:07:09',
    )
    expect(formatTimeValue(null, 'en-US', '12', false)).toBe('')
  })

  it('localizes AM/PM labels and their accessible group name', () => {
    expect(getTimePeriodLabels('en-US')).toEqual({ am: 'AM', pm: 'PM', group: 'AM or PM' })
    expect(getTimePeriodLabels('zh-CN')).toEqual({ am: '上午', pm: '下午', group: '上午或下午' })
  })

  it('compares values across minute and optional second precision', () => {
    expect(timeToSeconds({ hour: 18, minute: 22, second: 31 })).toBe(18 * 3600 + 22 * 60 + 31)
    expect(timeToSeconds({ hour: 18, minute: 22 })).toBe(18 * 3600 + 22 * 60)
  })

  it('maps 24-hour odd values to the outer ring and even values to the inner ring', () => {
    const hours = getHourDialItems('24')
    expect(hours).toHaveLength(24)
    expect(hours.find((item) => item.value === 0)).toMatchObject({
      label: '00',
      angle: 0,
      inner: true,
    })
    expect(hours.find((item) => item.value === 20)).toMatchObject({ angle: 300, inner: true })
    expect(hours.find((item) => item.value === 23)).toMatchObject({ angle: 330, inner: false })
    expect(getHourDialItems('12')).toHaveLength(12)
    expect(getTickDialItems().map((item) => item.value)).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
    ])
  })
})
