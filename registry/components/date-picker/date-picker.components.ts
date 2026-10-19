import {
  computed,
  defineComponent,
  h,
  nextTick as vueNextTick,
  onBeforeUnmount as vueOnBeforeUnmount,
  ref as vueRef,
  Transition,
  watch as vueWatch,
  type PropType,
} from 'vue'
import Icon from '../icon/icon.vue'
import { addMonths, formatDate, toIsoDate, type DateRangeValue } from './date-utils'

type CalendarMonth = { month: Date; dates: Date[]; title: string }

export const DatePickerCalendar = defineComponent({
  props: {
    view: { type: String, required: true },
    continuousMonths: { type: Array as () => CalendarMonth[], default: () => [] },
    visibleMonth: { type: Date, required: true },
    dates: { type: Array as () => Date[], required: true },
    weekdays: { type: Array as () => string[], required: true },
    weekdayFullLabels: { type: Array as () => string[], required: true },
    years: { type: Array as () => number[], required: true },
    months: { type: Array as () => string[], required: true },
    monthAvailability: { type: Array as () => boolean[], required: true },
    previousMonthAvailable: { type: Boolean, required: true },
    nextMonthAvailable: { type: Boolean, required: true },
    locale: { type: String, required: true },
    titleMonth: { type: String, required: true },
    titleMonthOnly: { type: String, required: true },
    titleYearOnly: { type: String, required: true },
    selectedSingle: { type: String as PropType<string | null>, default: null },
    range: { type: Object as PropType<DateRangeValue>, required: true },
    selection: { type: String, required: true },
    today: { type: String, required: true },
    rovingDate: { type: String, required: true },
    allowed: { type: Function as PropType<(value: string) => boolean>, required: true },
    isSelected: { type: Function as PropType<(value: string) => boolean>, required: true },
    isInRange: { type: Function as PropType<(value: string) => boolean>, required: true },
    chooseMonthLabel: { type: Function as PropType<(month?: string) => string>, required: true },
    chooseYearLabel: { type: Function as PropType<(year?: string) => string>, required: true },
    previousMonthLabel: { type: String, required: true },
    nextMonthLabel: { type: String, required: true },
    previousYearLabel: { type: String, required: true },
    nextYearLabel: { type: String, required: true },
  },
  emits: [
    'month',
    'year',
    'select-month',
    'select-month-view',
    'select-year-view',
    'select-date',
    'day-keydown',
  ],
  setup(props, { emit }) {
    const fullDateFormatter = computed(
      () =>
        new Intl.DateTimeFormat(props.locale, {
          timeZone: 'UTC',
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
    )
    const focusedOptionIndex = vueRef<number | null>(null)
    const monthDirection = vueRef<'next' | 'previous'>('next')
    const viewViewport = vueRef<HTMLElement | null>(null)
    let swipe: {
      pointerId: number
      x: number
      y: number
      active: boolean
      viewport: HTMLElement
    } | null = null
    let suppressClick = false
    const clearSwipe = () => {
      window.removeEventListener('pointermove', moveMonthSwipe)
      window.removeEventListener('pointerup', endMonthSwipe)
      window.removeEventListener('pointercancel', cancelMonthSwipe)
      swipe?.viewport.classList.remove('is-swiping')
      swipe = null
    }
    const moveMonthSwipe = (event: PointerEvent) => {
      if (!swipe || event.pointerId !== swipe.pointerId) return
      const deltaX = event.clientX - swipe.x
      const deltaY = event.clientY - swipe.y
      if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) swipe.active = true
      if (swipe.active) {
        event.preventDefault()
        swipe.viewport.classList.add('is-swiping')
      }
    }
    const endMonthSwipe = (event: PointerEvent) => {
      if (!swipe || event.pointerId !== swipe.pointerId) return
      const deltaX = event.clientX - swipe.x
      const deltaY = event.clientY - swipe.y
      const shouldPage =
        swipe.active && Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3
      if (shouldPage) {
        event.preventDefault()
        suppressClick = true
        window.setTimeout(() => {
          suppressClick = false
        }, 0)
      }
      clearSwipe()
      if (shouldPage) navigateMonth(deltaX < 0 ? 1 : -1)
    }
    const cancelMonthSwipe = (event: PointerEvent) => {
      if (swipe?.pointerId === event.pointerId) clearSwipe()
    }
    const startMonthSwipe = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      swipe = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        active: false,
        viewport: event.currentTarget as HTMLElement,
      }
      window.addEventListener('pointermove', moveMonthSwipe, { passive: false })
      window.addEventListener('pointerup', endMonthSwipe)
      window.addEventListener('pointercancel', cancelMonthSwipe)
    }
    vueOnBeforeUnmount(clearSwipe)
    vueWatch(
      () => props.view,
      () => {
        focusedOptionIndex.value = null
      },
    )
    vueWatch(
      () => props.view,
      async () => {
        const viewport = viewViewport.value
        if (!viewport) return
        const startHeight = viewport.getBoundingClientRect().height
        viewport.style.height = `${startHeight}px`
        void viewport.offsetHeight
        await vueNextTick()
        const endHeight =
          viewport
            .querySelector<HTMLElement>('.yam3x-date-picker__view-page')
            ?.getBoundingClientRect().height ?? viewport.scrollHeight
        requestAnimationFrame(() => {
          if (
            matchMedia('(prefers-reduced-motion: reduce)').matches ||
            Math.abs(endHeight - startHeight) < 1
          )
            viewport.style.height = 'auto'
          else viewport.style.height = `${endHeight}px`
        })
      },
    )
    const navigateMonth = (delta: number) => {
      if (!(delta < 0 ? props.previousMonthAvailable : props.nextMonthAvailable)) return
      monthDirection.value = delta < 0 ? 'previous' : 'next'
      emit('month', delta)
    }
    const iconButton = (
      label: string,
      direction: 'previous' | 'next',
      available: boolean,
      onClick: () => void,
    ) =>
      h(
        'button',
        {
          class: 'yam3x-date-picker__nav',
          type: 'button',
          disabled: !available,
          'aria-label': `${label}, ${formatDate(addMonths(props.visibleMonth, direction === 'previous' ? -1 : 1), props.locale, { month: 'long', year: 'numeric' })}`,
          title: `${label} (${direction === 'previous' ? 'Page Up' : 'Page Down'})`,
          'aria-keyshortcuts': direction === 'previous' ? 'PageUp' : 'PageDown',
          onClick,
        },
        [h(Icon, { name: direction === 'previous' ? 'chevron_left' : 'chevron_right' })],
      )
    const optionKeydown = (event: KeyboardEvent) => {
      const key = event.key
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return
      const listbox = (event.currentTarget as HTMLElement).closest<HTMLElement>('[role="listbox"]')
      const items = [
        ...(listbox?.querySelectorAll<HTMLButtonElement>('button[role="option"]') ?? []),
      ]
      const current = Number((event.currentTarget as HTMLElement).dataset.optionIndex)
      const active = items.filter((item) => !item.disabled)
      if (!active.length) return
      const direction = getComputedStyle(event.currentTarget as HTMLElement).direction
      const delta =
        key === 'ArrowDown'
          ? 3
          : key === 'ArrowUp'
            ? -3
            : key === 'ArrowRight'
              ? direction === 'rtl'
                ? -1
                : 1
              : direction === 'rtl'
                ? 1
                : -1
      let next = key === 'Home' ? active[0] : key === 'End' ? active[active.length - 1] : undefined
      if (!next) {
        for (let index = current + delta; index >= 0 && index < items.length; index += delta) {
          if (!items[index].disabled) {
            next = items[index]
            break
          }
        }
      }
      if (!next) return
      event.preventDefault()
      const index = items.indexOf(next)
      focusedOptionIndex.value = index
      void vueNextTick(() =>
        listbox?.querySelector<HTMLButtonElement>(`[data-option-index="${index}"]`)?.focus(),
      )
    }
    const dayCell = (date: Date, displayedMonth = props.visibleMonth, continuous = false) => {
      const value = toIsoDate(date)
      const outsideMonth =
        date.getUTCMonth() !== displayedMonth.getUTCMonth() ||
        date.getUTCFullYear() !== displayedMonth.getUTCFullYear()
      if (continuous && outsideMonth)
        return h('div', {
          key: value,
          class: 'yam3x-date-picker__day-placeholder',
          role: 'gridcell',
          'aria-hidden': 'true',
        })
      return h(
        'button',
        {
          key: value,
          class: [
            'yam3x-date-picker__day',
            {
              'is-selected': props.isSelected(value),
              'is-in-range': props.isInRange(value),
              'is-range-start': value === props.range.start,
              'is-range-end': value === props.range.end,
              'is-today': value === props.today,
              'is-outside': outsideMonth,
            },
          ],
          type: 'button',
          role: 'gridcell',
          disabled: !props.allowed(value),
          tabindex: value === props.rovingDate ? 0 : -1,
          'data-date': value,
          'aria-label': fullDateFormatter.value.format(date),
          'aria-selected': props.isSelected(value) || props.isInRange(value),
          'aria-current': value === props.today ? 'date' : undefined,
          onClick: () => {
            if (suppressClick) {
              suppressClick = false
              return
            }
            emit('select-date', date)
          },
          onKeydown: (event: KeyboardEvent) => emit('day-keydown', event, date),
        },
        String(date.getUTCDate()),
      )
    }
    const monthGrid = () =>
      h('div', { class: 'yam3x-date-picker__grid', role: 'grid', 'aria-label': props.titleMonth }, [
        h(
          'div',
          { class: 'yam3x-date-picker__week-row yam3x-date-picker__weekday-row', role: 'row' },
          props.weekdays.map((day, index) =>
            h(
              'div',
              {
                key: `w${index}`,
                class: 'yam3x-date-picker__weekday',
                role: 'columnheader',
                'aria-label': props.weekdayFullLabels[index],
                title: props.weekdayFullLabels[index],
              },
              day,
            ),
          ),
        ),
        h(
          'div',
          {
            class: 'yam3x-date-picker__month-viewport',
            role: 'rowgroup',
            style: { height: `calc(${Math.ceil(props.dates.length / 7)} * 48px)` },
            onPointerdown: startMonthSwipe,
          },
          [
            h(
              Transition,
              {
                name: `yam3x-date-month-${monthDirection.value}`,
                onLeave: (element: Element) => {
                  ;(element as HTMLElement).inert = true
                  element.setAttribute('aria-hidden', 'true')
                },
              },
              {
                default: () =>
                  h(
                    'div',
                    {
                      key: toIsoDate(props.visibleMonth),
                      class: 'yam3x-date-picker__date-rows',
                      role: 'presentation',
                    },
                    Array.from({ length: Math.ceil(props.dates.length / 7) }, (_, week) =>
                      h(
                        'div',
                        { key: `week-${week}`, class: 'yam3x-date-picker__week-row', role: 'row' },
                        props.dates
                          .slice(week * 7, week * 7 + 7)
                          .map((date) => dayCell(date, props.visibleMonth)),
                      ),
                    ),
                  ),
              },
            ),
          ],
        ),
      ])
    const continuousMonthGrid = (month: CalendarMonth) =>
      h('section', { key: toIsoDate(month.month), class: 'yam3x-date-picker__continuous-month' }, [
        h('h3', { class: 'yam3x-date-picker__continuous-month-title' }, month.title),
        h('div', { class: 'yam3x-date-picker__grid', role: 'grid', 'aria-label': month.title }, [
          h(
            'div',
            { class: 'yam3x-date-picker__week-row yam3x-date-picker__weekday-row', role: 'row' },
            props.weekdays.map((day, index) =>
              h(
                'div',
                {
                  key: `w${index}`,
                  class: 'yam3x-date-picker__weekday',
                  role: 'columnheader',
                  'aria-label': props.weekdayFullLabels[index],
                  title: props.weekdayFullLabels[index],
                },
                day,
              ),
            ),
          ),
          h(
            'div',
            { class: 'yam3x-date-picker__month-viewport', role: 'rowgroup' },
            Array.from({ length: Math.ceil(month.dates.length / 7) }, (_, week) =>
              h(
                'div',
                { key: `week-${week}`, class: 'yam3x-date-picker__week-row', role: 'row' },
                month.dates
                  .slice(week * 7, week * 7 + 7)
                  .map((date) => dayCell(date, month.month, true)),
              ),
            ),
          ),
        ]),
      ])
    const optionGrid = (optionView: 'months' | 'years') =>
      h(
        'div',
        {
          class: 'yam3x-date-picker__option-grid',
          role: 'listbox',
          'aria-label':
            optionView === 'months' ? props.chooseMonthLabel() : props.chooseYearLabel(),
        },
        (() => {
          const isMonths = optionView === 'months'
          const selectedIndex = isMonths
            ? props.visibleMonth.getUTCMonth()
            : props.years.indexOf(props.visibleMonth.getUTCFullYear())
          const activeIndex = focusedOptionIndex.value ?? (selectedIndex >= 0 ? selectedIndex : 0)
          return isMonths
            ? props.months.map((month, index) =>
                h(
                  'button',
                  {
                    key: index,
                    type: 'button',
                    role: 'option',
                    'aria-selected': index === selectedIndex,
                    disabled: !props.monthAvailability[index],
                    tabindex: index === activeIndex ? 0 : -1,
                    'data-option-index': index,
                    onClick: () => emit('select-month', index),
                    onKeydown: optionKeydown,
                  },
                  month,
                ),
              )
            : props.years.map((year, index) =>
                h(
                  'button',
                  {
                    key: year,
                    type: 'button',
                    role: 'option',
                    'aria-selected': year === props.visibleMonth.getUTCFullYear(),
                    tabindex: index === activeIndex ? 0 : -1,
                    'data-option-index': index,
                    onClick: () => emit('year', year),
                    onKeydown: optionKeydown,
                  },
                  String(year),
                ),
              )
        })(),
      )
    const viewContent = () => {
      if (props.view === 'days') {
        if (props.continuousMonths.length)
          return h(
            'div',
            { class: 'yam3x-date-picker__continuous-months' },
            props.continuousMonths.map(continuousMonthGrid),
          )
        return monthGrid()
      }
      if (props.view === 'months') return optionGrid('months')
      return h('div', { class: 'yam3x-date-picker__year-view' }, [
        h(
          'div',
          { class: 'yam3x-date-picker__year-background', inert: '', 'aria-hidden': 'true' },
          [monthGrid()],
        ),
        h('div', { class: 'yam3x-date-picker__year-overlay' }, [
          h(
            Transition,
            {
              name: 'yam3x-date-year',
              appear: true,
              onLeave: (element: Element) => {
                ;(element as HTMLElement).inert = true
                element.setAttribute('aria-hidden', 'true')
              },
            },
            {
              default: () =>
                h('div', { key: 'year-options', class: 'yam3x-date-picker__year-options' }, [
                  optionGrid('years'),
                ]),
            },
          ),
        ]),
      ])
    }
    return () =>
      h('div', { class: 'yam3x-date-picker__calendar' }, [
        h('div', { class: 'yam3x-date-picker__calendar-header' }, [
          iconButton(props.previousMonthLabel, 'previous', props.previousMonthAvailable, () =>
            navigateMonth(-1),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'yam3x-date-picker__period',
              'aria-label': props.chooseMonthLabel(props.titleMonthOnly),
              onClick: () => emit('select-month-view'),
            },
            props.titleMonthOnly,
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'yam3x-date-picker__period',
              'aria-label': props.chooseYearLabel(props.titleYearOnly),
              onClick: () => emit('select-year-view'),
            },
            props.titleYearOnly,
          ),
          iconButton(props.nextMonthLabel, 'next', props.nextMonthAvailable, () =>
            navigateMonth(1),
          ),
        ]),
        h(
          'div',
          {
            class: [
              'yam3x-date-picker__view-viewport',
              {
                'is-continuous-range': props.selection === 'range' && props.continuousMonths.length,
              },
            ],
            ref: viewViewport,
            onTransitionend: (event: TransitionEvent) => {
              if (event.target === viewViewport.value && event.propertyName === 'height')
                viewViewport.value!.style.height = 'auto'
            },
          },
          [
            h(
              Transition,
              {
                name: 'yam3x-date-view',
                onLeave: (element: Element) => {
                  ;(element as HTMLElement).inert = true
                  element.setAttribute('aria-hidden', 'true')
                },
              },
              {
                default: () =>
                  h('div', { key: props.view, class: 'yam3x-date-picker__view-page' }, [
                    viewContent(),
                  ]),
              },
            ),
          ],
        ),
      ])
  },
})

export const DatePickerActions = defineComponent({
  props: {
    clearable: Boolean,
    clearLabel: { type: String, required: true },
    cancelLabel: { type: String, required: true },
    confirmLabel: { type: String, required: true },
  },
  emits: ['clear', 'cancel', 'confirm'],
  setup(props, { emit }) {
    return () =>
      h('footer', { class: 'yam3x-date-picker__actions' }, [
        props.clearable
          ? h(
              'button',
              {
                type: 'button',
                class: 'yam3x-date-picker__text-action',
                onClick: () => emit('clear'),
              },
              props.clearLabel,
            )
          : null,
        h('span', { class: 'yam3x-date-picker__action-spacer' }),
        h(
          'button',
          {
            type: 'button',
            class: 'yam3x-date-picker__text-action',
            onClick: () => emit('cancel'),
          },
          props.cancelLabel,
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'yam3x-date-picker__text-action',
            onClick: () => emit('confirm'),
          },
          props.confirmLabel,
        ),
      ])
  },
})
