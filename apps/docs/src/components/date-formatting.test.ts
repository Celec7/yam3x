import { afterEach, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import Calendar from '../../../../registry/components/calendar/calendar.vue'
import { DateRangePicker } from '../../../../registry/components/date-picker'

enableAutoUnmount(afterEach)
afterEach(() => vi.restoreAllMocks())

it.each(['calendar', 'range'] as const)(
  '%s reuses full-date formatters across cells and navigation while updating locale',
  async (kind) => {
    const spy = vi.spyOn(Intl, 'DateTimeFormat')
    const wrapper =
      kind === 'calendar'
        ? mount(Calendar, { props: { locale: 'en-US', startAt: '2026-10-05' } })
        : mount(DateRangePicker, {
            props: { locale: 'en-US', mode: 'modal', open: true, initialDate: '2026-10-05' },
          })
    const cell = wrapper.get('button[data-date="2026-10-05"]')
    expect(cell.attributes('aria-label')).toBe('Monday, October 5, 2026')
    await cell.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.setProps({ locale: 'zh-CN' })
    expect(wrapper.get('button[data-date="2026-10-05"]').attributes('aria-label')).toBe(
      '2026年10月5日星期一',
    )
    const fullDateConstructions = spy.mock.calls.filter(
      ([, options]) => options?.weekday === 'long' && options?.day === 'numeric',
    )
    expect(fullDateConstructions.length).toBeLessThan(10)
  },
)
