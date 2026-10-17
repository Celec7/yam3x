import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DateInput from '../../../../registry/components/date-input/date-input.vue'
import {
  dateFromSegments,
  getDateInputParts,
  getSegmentDisplayValue,
  parseTimeBound,
  resolveTimeFormat,
} from '../../../../registry/components/date-input/date-input.utils'

describe('DateInput utilities', () => {
  it('orders date fields and separators by locale', () => {
    const us = getDateInputParts('en-US', 'date', '12', false)
      .filter((part) => part.kind === 'field')
      .map((part) => part.id)
    const chinese = getDateInputParts('zh-CN', 'date', '24', false)
      .filter((part) => part.kind === 'field')
      .map((part) => part.id)
    expect(us).toEqual(['month', 'day', 'year'])
    expect(chinese).toEqual(['year', 'month', 'day'])
  })

  it('builds valid local dates and rejects impossible calendar dates', () => {
    expect(
      dateFromSegments(
        { year: 2024, month: 2, day: 29 },
        'date',
        '24',
        false,
        null,
        new Date(2024, 0, 1),
      )?.getDate(),
    ).toBe(29)
    expect(
      dateFromSegments(
        { year: 2025, month: 2, day: 29 },
        'date',
        '24',
        false,
        null,
        new Date(2025, 0, 1),
      ),
    ).toBeNull()
  })

  it('converts 12-hour date-time segments and resolves locale hour cycle', () => {
    const value = dateFromSegments(
      { year: 2026, month: 10, day: 5, hour: 11, minute: 9, period: 1 },
      'datetime',
      '12',
      false,
      null,
    )
    expect(value?.getHours()).toBe(23)
    expect(value?.getMinutes()).toBe(9)
    expect(getSegmentDisplayValue(value, 'hour', '12')).toBe('11')
    expect(resolveTimeFormat('en-US', 'auto')).toBe('12')
    expect(resolveTimeFormat('de-DE', 'auto')).toBe('24')
  })

  it('parses bounded time values without accepting out-of-range parts', () => {
    expect(parseTimeBound('23:59:59')).toBe(86399)
    expect(parseTimeBound('24:00')).toBeNull()
    expect(parseTimeBound('12:60')).toBeNull()
  })
})

describe('DateInput accessible group label', () => {
  it.each([
    ['date', 'en-US', 'Date'],
    ['time', 'en-US', 'Time'],
    ['datetime', 'en-US', 'Date and time'],
    ['datetime', 'zh-CN', '日期与时间'],
  ] as const)('localizes the default %s label for %s', (type, locale, label) => {
    const wrapper = mount(DateInput, { props: { type, locale } })

    expect(wrapper.get('[role="group"]').attributes('aria-labelledby')).toBeTruthy()
    expect(wrapper.get('.yam3x-date-input-field__label').text()).toBe(label)
    wrapper.unmount()
  })

  it('keeps a caller-provided label', () => {
    const wrapper = mount(DateInput, { props: { type: 'time', label: 'Meeting start' } })

    expect(wrapper.get('.yam3x-date-input-field__label').text()).toBe('Meeting start')
    wrapper.unmount()
  })
})
