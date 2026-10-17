import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { Calendar } from '../../../../registry/components/calendar'

describe('Calendar', () => {
  it('allows replacing the period/navigation header with a scoped header slot', () => {
    const wrapper = mount(Calendar, {
      props: { startAt: '2026-10-05', locale: 'en-US' },
      slots: {
        header: (slotProps: { periodLabel: string; canPrevious: boolean; canNext: boolean }) =>
          h(
            'div',
            { 'data-testid': 'custom-calendar-header' },
            `${slotProps.periodLabel}:${slotProps.canPrevious}:${slotProps.canNext}`,
          ),
      },
    })

    expect(wrapper.get('[data-testid="custom-calendar-header"]').text()).toBe(
      'October 2026:true:true',
    )
    expect(wrapper.find('.yam3x-calendar__header').exists()).toBe(false)
    wrapper.unmount()
  })

  it('exposes period, focus, and today methods for composed calendars', async () => {
    const wrapper = mount(Calendar, { props: { startAt: '2026-10-05', locale: 'en-US' } })
    const instance = wrapper.vm as unknown as {
      togglePeriod: () => void
      resetActiveView: () => void
      moveNextPeriod: () => void
      updateTodayDate: () => void
      focusActiveCell: () => Promise<void>
    }

    instance.togglePeriod()
    await nextTick()
    expect(wrapper.get('.yam3x-calendar').attributes('data-view')).toBe('multi-year')
    instance.resetActiveView()
    await nextTick()
    expect(wrapper.get('.yam3x-calendar').attributes('data-view')).toBe('month')
    instance.moveNextPeriod()
    await nextTick()
    expect(wrapper.get('[role="grid"]').attributes('aria-label')).toBe('November 2026')
    instance.updateTodayDate()
    await instance.focusActiveCell()
    wrapper.unmount()
  })
})
