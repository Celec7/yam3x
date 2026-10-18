<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  addDays,
  addMonths,
  createUtcDate,
  formatDate,
  hasSelectableDateInMonth,
  hasSelectableDateInYear,
  isDateAllowed,
  monthStart,
  parseIsoDate,
  toIsoDate,
} from '../date-picker/date-utils'
import Icon from '../icon/icon.vue'
import { useComponentLocale } from '../localization/context'

type CalendarView = 'month' | 'year' | 'multi-year'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    rangeStart?: string | null
    rangeEnd?: string | null
    startAt?: string | null
    startView?: CalendarView
    selection?: 'single' | 'range'
    minDate?: string | null
    maxDate?: string | null
    isDateSelectable?: (date: string) => boolean
    isSpecialDate?: (date: string) => boolean
    locale?: string
    label?: string
    specialDateLabel?: string
    rangeStartLabel?: string
    rangeEndLabel?: string
    inRangeLabel?: string
    previousMonthLabel?: string
    nextMonthLabel?: string
    previousYearLabel?: string
    nextYearLabel?: string
    previousMultiYearLabel?: string
    nextMultiYearLabel?: string
  }>(),
  {
    modelValue: null,
    rangeStart: null,
    rangeEnd: null,
    startAt: null,
    startView: 'month',
    selection: 'single',
    minDate: null,
    maxDate: null,
    locale: undefined,
    label: undefined,
    previousMonthLabel: undefined,
    nextMonthLabel: undefined,
    previousYearLabel: undefined,
    nextYearLabel: undefined,
    previousMultiYearLabel: undefined,
    nextMultiYearLabel: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:rangeStart': [value: string | null]
  'update:rangeEnd': [value: string | null]
  change: [value: { date: string | null; rangeStart: string | null; rangeEnd: string | null }]
}>()

const { locale, messages } = useComponentLocale(
  'calendar',
  () => props.locale,
  () => ({
    label: props.label,
    previousMonth: props.previousMonthLabel,
    nextMonth: props.nextMonthLabel,
    previousYear: props.previousYearLabel,
    nextYear: props.nextYearLabel,
    previousMultiYear: props.previousMultiYearLabel,
    nextMultiYear: props.nextMultiYearLabel,
    specialDate: props.specialDateLabel,
    rangeStart: props.rangeStartLabel,
    rangeEnd: props.rangeEndLabel,
    inRange: props.inRangeLabel,
  }),
  () => (typeof navigator === 'undefined' ? 'en-US' : navigator.language),
)
const availability = computed(() => ({
  minDate: props.minDate,
  maxDate: props.maxDate,
  isDateSelectable: props.isDateSelectable,
}))
const localToday = new Date()
const today = ref(
  toIsoDate(
    new Date(Date.UTC(localToday.getFullYear(), localToday.getMonth(), localToday.getDate())),
  ),
)
const initialDate =
  parseIsoDate(props.startAt) ??
  parseIsoDate(props.modelValue) ??
  parseIsoDate(props.rangeStart) ??
  parseIsoDate(today.value)!
const activeDate = ref(nearestAllowedDate(initialDate))
const visibleMonth = ref(monthStart(activeDate.value))
const view = ref<CalendarView>(props.startView)
const root = ref<HTMLElement>()
const focusYear = ref<number | null>(null)
const focusMonth = ref<number | null>(null)
const direction = ref<'previous' | 'next'>('next')

watch(locale, async () => {
  const calendar = root.value
  const document = calendar?.ownerDocument
  const focused = document?.activeElement
  const date = focused && calendar?.contains(focused) ? focused.getAttribute('data-date') : null
  if (!date || !document) return
  await nextTick()
  if (document.activeElement === document.body || calendar?.contains(document.activeElement))
    calendar?.querySelector<HTMLButtonElement>(`[data-date="${date}"]:not(:disabled)`)?.focus()
})

watch(
  () => props.startView,
  (value) => {
    view.value = value
  },
)
watch(
  () => [props.modelValue, props.rangeStart, props.startAt] as const,
  ([selected, rangeStart, startAt]) => {
    const date = parseIsoDate(startAt) ?? parseIsoDate(selected) ?? parseIsoDate(rangeStart)
    if (date) {
      activeDate.value = date
      visibleMonth.value = monthStart(date)
    }
  },
)

const periodLabel = computed(() => {
  if (view.value === 'month')
    return formatDate(visibleMonth.value, locale.value, { month: 'long', year: 'numeric' })
  if (view.value === 'year')
    return formatDate(visibleMonth.value, locale.value, { year: 'numeric' })
  const [start, end] = yearPage.value
  return `${formatDate(new Date(Date.UTC(start, 0, 1)), locale.value, { year: 'numeric' })} – ${formatDate(new Date(Date.UTC(end, 0, 1)), locale.value, { year: 'numeric' })}`
})
const yearPage = computed(() => {
  const year = visibleMonth.value.getUTCFullYear()
  const firstYear = props.minDate
    ? Number(props.minDate.slice(0, 4))
    : props.maxDate
      ? Number(props.maxDate.slice(0, 4)) - 17
      : 0
  const offset = (((year - firstYear) % 18) + 18) % 18
  const first = year - offset
  return [first, first + 17] as const
})
const weekStartDay = computed(() => {
  try {
    const localeInfo = new Intl.Locale(locale.value) as Intl.Locale & {
      weekInfo?: { firstDay: number }
      getWeekInfo?: () => { firstDay: number }
    }
    const info = localeInfo.weekInfo ?? localeInfo.getWeekInfo?.()
    if (info) return info.firstDay % 7
    const region = localeInfo.region ?? locale.value.match(/-([A-Z]{2})(?:-|$)/)?.[1] ?? ''
    return [
      'US',
      'CA',
      'JP',
      'KR',
      'IL',
      'MX',
      'PH',
      'TH',
      'TW',
      'HK',
      'MO',
      'BR',
      'CO',
      'PE',
      'VE',
    ].includes(region)
      ? 0
      : 1
  } catch {
    return 0
  }
})
const weekdayLabels = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(2023, 0, 1 + ((weekStartDay.value + index) % 7)))
    return {
      short: formatDate(date, locale.value, { weekday: 'short' }),
      full: formatDate(date, locale.value, { weekday: 'long' }),
    }
  }),
)
const dates = computed(() => {
  const first = monthStart(visibleMonth.value)
  const offset = (first.getUTCDay() - weekStartDay.value + 7) % 7
  const days = createUtcDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate()
  const count = Math.ceil((offset + days) / 7) * 7
  return Array.from({ length: count }, (_, index) => addDays(first, index - offset))
})
const weeks = computed(() =>
  Array.from({ length: dates.value.length / 7 }, (_, index) =>
    dates.value.slice(index * 7, index * 7 + 7),
  ),
)
const years = computed(() => Array.from({ length: 18 }, (_, index) => yearPage.value[0] + index))
const months = computed(() =>
  Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: formatDate(new Date(Date.UTC(2020, index, 1)), locale.value, { month: 'long' }),
  })),
)

function isAllowed(value: string): boolean {
  return isDateAllowed(value, availability.value)
}
function nearestAllowedDate(date: Date): Date {
  if (isAllowed(toIsoDate(date))) return date
  const min = parseIsoDate(props.minDate)
  const max = parseIsoDate(props.maxDate)
  if (min && toIsoDate(date) < toIsoDate(min)) return min
  if (max && toIsoDate(date) > toIsoDate(max)) return max
  for (let distance = 1; distance <= 366; distance++) {
    const after = addDays(date, distance)
    if (isAllowed(toIsoDate(after))) return after
    const before = addDays(date, -distance)
    if (isAllowed(toIsoDate(before))) return before
  }
  return date
}
function hasAllowedYear(year: number): boolean {
  if (
    (props.minDate && toIsoDate(createUtcDate(year, 11, 31)) < props.minDate) ||
    (props.maxDate && toIsoDate(createUtcDate(year, 0, 1)) > props.maxDate)
  )
    return false
  if (!props.isDateSelectable) return true
  return hasSelectableDateInYear(year, hasAllowedMonth)
}
function hasAllowedMonth(year: number, month: number): boolean {
  const lastDay = createUtcDate(year, month + 1, 0).getUTCDate()
  const first = toIsoDate(createUtcDate(year, month, 1))
  const last = toIsoDate(createUtcDate(year, month, lastDay))
  if ((props.minDate && last < props.minDate) || (props.maxDate && first > props.maxDate))
    return false
  if (!props.isDateSelectable) return true
  return hasSelectableDateInMonth(year, month, isAllowed)
}
const canPrevious = computed(() => {
  const value = visibleMonth.value
  if (view.value === 'month')
    return !props.minDate || toIsoDate(addDays(value, -1)) >= props.minDate
  if (view.value === 'year')
    return (
      !props.minDate ||
      toIsoDate(createUtcDate(value.getUTCFullYear() - 1, 11, 31)) >= props.minDate
    )
  return !props.minDate || toIsoDate(createUtcDate(yearPage.value[0] - 1, 11, 31)) >= props.minDate
})
const canNext = computed(() => {
  const value = visibleMonth.value
  if (view.value === 'month')
    return (
      !props.maxDate ||
      toIsoDate(createUtcDate(value.getUTCFullYear(), value.getUTCMonth() + 1, 1)) <= props.maxDate
    )
  if (view.value === 'year')
    return (
      !props.maxDate || toIsoDate(createUtcDate(value.getUTCFullYear() + 1, 0, 1)) <= props.maxDate
    )
  return !props.maxDate || toIsoDate(createUtcDate(yearPage.value[1] + 1, 0, 1)) <= props.maxDate
})
function navigate(delta: number): void {
  if ((delta < 0 && !canPrevious.value) || (delta > 0 && !canNext.value)) return
  direction.value = delta < 0 ? 'previous' : 'next'
  if (view.value === 'month') visibleMonth.value = addMonths(visibleMonth.value, delta)
  else if (view.value === 'year') visibleMonth.value = addMonths(visibleMonth.value, delta * 12)
  else visibleMonth.value = addMonths(visibleMonth.value, delta * 18 * 12)
  activeDate.value = createUtcDate(
    visibleMonth.value.getUTCFullYear(),
    visibleMonth.value.getUTCMonth(),
    Math.min(
      activeDate.value.getUTCDate(),
      createUtcDate(
        visibleMonth.value.getUTCFullYear(),
        visibleMonth.value.getUTCMonth() + 1,
        0,
      ).getUTCDate(),
    ),
  )
}
function changeView(): void {
  view.value = view.value === 'month' ? 'multi-year' : 'month'
  focusYear.value = view.value === 'multi-year' ? visibleMonth.value.getUTCFullYear() : null
  focusMonth.value = null
  void nextTick(focusActive)
}
function movePreviousPeriod(): void {
  navigate(-1)
}
function moveNextPeriod(): void {
  navigate(1)
}
function togglePeriod(): void {
  changeView()
}
function resetActiveView(): void {
  view.value = props.startView
}
function updateTodayDate(): void {
  const date = new Date()
  today.value = toIsoDate(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())))
}
async function focusActiveCell(): Promise<void> {
  await nextTick()
  focusActive()
}
function focusActive(): void {
  if (view.value === 'month')
    root.value
      ?.querySelector<HTMLButtonElement>(
        `[data-date="${toIsoDate(activeDate.value)}"]:not(:disabled)`,
      )
      ?.focus()
  else
    root.value
      ?.querySelector<HTMLButtonElement>('[data-active-option="true"]:not(:disabled)')
      ?.focus()
}
function setActiveDate(date: Date): void {
  let target = date
  const step = Math.sign(target.getTime() - activeDate.value.getTime()) || 1
  for (let attempts = 0; attempts < 370 && !isAllowed(toIsoDate(target)); attempts++)
    target = addDays(target, step)
  if (!isAllowed(toIsoDate(target))) return
  activeDate.value = target
  visibleMonth.value = monthStart(target)
  void nextTick(focusActive)
}
function selectDate(date: Date): void {
  const value = toIsoDate(date)
  if (!isAllowed(value)) return
  activeDate.value = date
  let rangeStart = props.rangeStart ?? null
  let rangeEnd = props.rangeEnd ?? null
  let selected: string | null = value
  if (props.selection === 'range') {
    selected = null
    if (rangeStart !== null && rangeEnd === null) {
      if (value < rangeStart) {
        rangeStart = value
        rangeEnd = null
      } else rangeEnd = value
    } else {
      rangeStart = value
      rangeEnd = null
    }
    emit('update:rangeStart', rangeStart)
    emit('update:rangeEnd', rangeEnd)
  }
  emit('update:modelValue', selected)
  emit('change', { date: selected, rangeStart, rangeEnd })
}
function pickYear(year: number): void {
  if (!hasAllowedYear(year)) return
  const month = visibleMonth.value.getUTCMonth()
  const date = createUtcDate(
    year,
    month,
    Math.min(activeDate.value.getUTCDate(), createUtcDate(year, month + 1, 0).getUTCDate()),
  )
  visibleMonth.value = monthStart(date)
  activeDate.value = date
  view.value = 'year'
  focusYear.value = year
  focusMonth.value = month
  void nextTick(focusActive)
}
function pickMonth(month: number): void {
  const year = visibleMonth.value.getUTCFullYear()
  if (!hasAllowedMonth(year, month)) return
  const date = createUtcDate(
    year,
    month,
    Math.min(activeDate.value.getUTCDate(), createUtcDate(year, month + 1, 0).getUTCDate()),
  )
  visibleMonth.value = monthStart(date)
  activeDate.value = date
  view.value = 'month'
  void nextTick(focusActive)
}
function optionKeydown(
  event: KeyboardEvent,
  kind: 'year' | 'month' | 'multi-year',
  index: number,
): void {
  const columns = kind === 'month' ? 3 : 4
  let next = index
  let delta = 0
  if (event.key === 'ArrowRight')
    delta = getComputedStyle(event.currentTarget as Element).direction === 'rtl' ? -1 : 1
  else if (event.key === 'ArrowLeft')
    delta = getComputedStyle(event.currentTarget as Element).direction === 'rtl' ? 1 : -1
  else if (event.key === 'ArrowDown') delta = columns
  else if (event.key === 'ArrowUp') delta = -columns
  else if (event.key === 'Home') next = -Infinity
  else if (event.key === 'End') next = Infinity
  else if (event.key === 'PageDown' || event.key === 'PageUp') {
    navigate(event.key === 'PageDown' ? 1 : -1)
    event.preventDefault()
    void nextTick(focusActive)
    return
  } else return
  event.preventDefault()
  const max = kind === 'month' ? months.value.length - 1 : years.value.length - 1
  const options = [
    ...(root.value?.querySelectorAll<HTMLButtonElement>('[data-option-index]') ?? []),
  ]
  if (next === -Infinity) next = options.findIndex((option) => !option.disabled)
  else if (next === Infinity)
    next = options.length - 1 - [...options].reverse().findIndex((option) => !option.disabled)
  else {
    do {
      next += delta
    } while (next >= 0 && next <= max && options[next]?.disabled)
  }
  if (next < 0 || next > max || !options[next] || options[next].disabled) return
  if (kind === 'month') focusMonth.value = next
  else focusYear.value = years.value[next]
  options[next].focus()
}
function dayKeydown(event: KeyboardEvent, date: Date): void {
  if (event.shiftKey && event.key.toLowerCase() === 'm') {
    event.preventDefault()
    view.value = 'year'
    focusYear.value = visibleMonth.value.getUTCFullYear()
    focusMonth.value = visibleMonth.value.getUTCMonth()
    void nextTick(focusActive)
    return
  }
  if (event.shiftKey && event.key.toLowerCase() === 'y') {
    event.preventDefault()
    view.value = 'multi-year'
    focusYear.value = visibleMonth.value.getUTCFullYear()
    focusMonth.value = null
    void nextTick(focusActive)
    return
  }
  const dir = getComputedStyle(event.currentTarget as Element).direction === 'rtl' ? -1 : 1
  const offsets: Record<string, number> = {
    ArrowLeft: -dir,
    ArrowRight: dir,
    ArrowUp: -7,
    ArrowDown: 7,
  }
  if (event.key in offsets) {
    event.preventDefault()
    setActiveDate(addDays(date, offsets[event.key]))
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    setActiveDate(createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1))
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    setActiveDate(createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
    return
  }
  if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault()
    const step = event.key === 'PageUp' ? -1 : 1
    setActiveDate(shiftPreservingDay(date, step * (event.shiftKey || event.altKey ? 12 : 1)))
  }
}
function shiftPreservingDay(date: Date, amount: number): Date {
  const first = addMonths(monthStart(date), amount)
  const lastDay = createUtcDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate()
  return createUtcDate(
    first.getUTCFullYear(),
    first.getUTCMonth(),
    Math.min(date.getUTCDate(), lastDay),
  )
}
function fullDateLabel(date: Date): string {
  return formatDate(date, locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
function dateDescription(date: Date): string | undefined {
  const value = toIsoDate(date)
  if (props.isSpecialDate?.(value)) return messages.value.specialDate
  if (value === props.rangeStart) return messages.value.rangeStart
  if (value === props.rangeEnd) return messages.value.rangeEnd
  if (props.rangeStart && props.rangeEnd && value > props.rangeStart && value < props.rangeEnd)
    return messages.value.inRange
  return undefined
}
function rangeState(value: string): string {
  if (value === props.rangeStart) return 'is-range-start'
  if (value === props.rangeEnd) return 'is-range-end'
  if (props.rangeStart && props.rangeEnd && value > props.rangeStart && value < props.rangeEnd)
    return 'is-in-range'
  return ''
}

defineExpose({
  periodLabel,
  canMovePreviousPeriod: canPrevious,
  canMoveNextPeriod: canNext,
  movePreviousPeriod,
  moveNextPeriod,
  togglePeriod,
  resetActiveView,
  updateTodayDate,
  focusActiveCell,
})
</script>

<template>
  <section
    ref="root"
    class="yam3x-calendar"
    :class="{ 'has-complete-range': selection === 'range' && rangeStart && rangeEnd }"
    :aria-label="messages.label"
    :data-view="view"
  >
    <slot
      name="header"
      :view="view"
      :period-label="periodLabel"
      :can-previous="canPrevious"
      :can-next="canNext"
      :previous="movePreviousPeriod"
      :next="moveNextPeriod"
      :toggle="togglePeriod"
    >
      <header class="yam3x-calendar__header">
        <button
          class="yam3x-calendar__period"
          type="button"
          aria-haspopup="listbox"
          :aria-label="messages.choosePeriod(periodLabel)"
          @click="changeView"
        >
          {{ periodLabel
          }}<Icon
            class="yam3x-calendar__caret"
            name="expand_more"
          />
        </button>
        <span class="yam3x-calendar__spacer" />
        <button
          class="yam3x-calendar__nav"
          type="button"
          :aria-label="
            view === 'month'
              ? messages.previousMonth
              : view === 'year'
                ? messages.previousYear
                : messages.previousMultiYear
          "
          :disabled="!canPrevious"
          @click="movePreviousPeriod"
        >
          <Icon name="chevron_left" />
        </button>
        <button
          class="yam3x-calendar__nav"
          type="button"
          :aria-label="
            view === 'month'
              ? messages.nextMonth
              : view === 'year'
                ? messages.nextYear
                : messages.nextMultiYear
          "
          :disabled="!canNext"
          @click="moveNextPeriod"
        >
          <Icon name="chevron_right" />
        </button>
      </header>
    </slot>

    <Transition
      :name="`yam3x-calendar-${direction}`"
      mode="out-in"
      @after-enter="focusActive"
    >
      <div
        v-if="view === 'month'"
        :key="toIsoDate(visibleMonth)"
        class="yam3x-calendar__month-view"
      >
        <div
          class="yam3x-calendar__grid"
          role="grid"
          :aria-label="periodLabel"
        >
          <div
            class="yam3x-calendar__weekdays"
            role="row"
          >
            <span
              v-for="(weekday, index) in weekdayLabels"
              :key="index"
              role="columnheader"
              :aria-label="weekday.full"
              :title="weekday.full"
              >{{ weekday.short }}</span
            >
          </div>
          <div
            class="yam3x-calendar__days"
            role="rowgroup"
          >
            <div
              v-for="(week, weekIndex) in weeks"
              :key="weekIndex"
              class="yam3x-calendar__week"
              role="row"
            >
              <div
                v-for="date in week"
                :key="toIsoDate(date)"
                class="yam3x-calendar__cell"
                role="gridcell"
                :class="[
                  rangeState(toIsoDate(date)),
                  {
                    'is-selected': toIsoDate(date) === modelValue,
                    'is-today': toIsoDate(date) === today,
                    'is-special': isSpecialDate?.(toIsoDate(date)),
                    'is-outside': date.getUTCMonth() !== visibleMonth.getUTCMonth(),
                  },
                ]"
                :aria-selected="
                  toIsoDate(date) === modelValue || Boolean(rangeState(toIsoDate(date)))
                "
              >
                <button
                  type="button"
                  class="yam3x-calendar__day"
                  :data-date="toIsoDate(date)"
                  :tabindex="toIsoDate(date) === toIsoDate(activeDate) ? 0 : -1"
                  :disabled="!isAllowed(toIsoDate(date))"
                  :aria-label="fullDateLabel(date)"
                  :aria-description="dateDescription(date)"
                  :aria-pressed="
                    toIsoDate(date) === modelValue ||
                    toIsoDate(date) === rangeStart ||
                    toIsoDate(date) === rangeEnd
                  "
                  :aria-current="toIsoDate(date) === today ? 'date' : undefined"
                  :data-special="isSpecialDate?.(toIsoDate(date)) ? 'true' : undefined"
                  @click="selectDate(date)"
                  @keydown="dayKeydown($event, date)"
                >
                  {{ date.getUTCDate() }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="view === 'year'"
        :key="'months-' + visibleMonth.getUTCFullYear()"
        class="yam3x-calendar__options"
        role="listbox"
        :aria-label="messages.chooseMonth(formatDate(visibleMonth, locale, { year: 'numeric' }))"
      >
        <button
          v-for="month in months"
          :key="month.value"
          type="button"
          role="option"
          :data-option-index="month.value"
          :data-active-option="month.value === (focusMonth ?? visibleMonth.getUTCMonth())"
          :aria-selected="month.value === visibleMonth.getUTCMonth()"
          :tabindex="month.value === (focusMonth ?? visibleMonth.getUTCMonth()) ? 0 : -1"
          :disabled="!hasAllowedMonth(visibleMonth.getUTCFullYear(), month.value)"
          @click="pickMonth(month.value)"
          @keydown="optionKeydown($event, 'month', month.value)"
        >
          {{ month.label }}
        </button>
      </div>
      <div
        v-else
        :key="'years-' + yearPage[0]"
        class="yam3x-calendar__options yam3x-calendar__years"
        role="listbox"
        :aria-label="messages.chooseYear(periodLabel)"
      >
        <button
          v-for="(year, index) in years"
          :key="year"
          type="button"
          role="option"
          :data-option-index="index"
          :data-active-option="year === (focusYear ?? visibleMonth.getUTCFullYear())"
          :aria-selected="year === visibleMonth.getUTCFullYear()"
          :tabindex="year === (focusYear ?? visibleMonth.getUTCFullYear()) ? 0 : -1"
          :disabled="!hasAllowedYear(year)"
          @click="pickYear(year)"
          @keydown="optionKeydown($event, 'multi-year', index)"
        >
          {{ year }}
        </button>
      </div>
    </Transition>
  </section>
</template>

<style>
.yam3x-calendar {
  --_yam3x-calendar-system-color-on-primary: var(--md-sys-color-on-primary);
  --_yam3x-calendar-system-color-on-secondary-container: var(--md-sys-color-on-secondary-container);
  --_yam3x-calendar-system-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-calendar-system-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-calendar-system-color-on-tertiary-container: var(--md-sys-color-on-tertiary-container);
  --_yam3x-calendar-system-color-primary: var(--md-sys-color-primary);
  --_yam3x-calendar-system-color-secondary-container: var(--md-sys-color-secondary-container);
  --_yam3x-calendar-system-color-surface-container-high: var(--md-sys-color-surface-container-high);
  --_yam3x-calendar-system-color-tertiary-container: var(--md-sys-color-tertiary-container);
  --_yam3x-calendar-system-density-spacing-scale: var(--md-sys-density-spacing-scale);
  --_yam3x-calendar-system-motion-spring-default-spatial: var(
    --md-sys-motion-spring-default-spatial
  );
  --_yam3x-calendar-system-motion-spring-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-calendar-system-typescale-body-large-size: var(--md-sys-typescale-body-large-size);
  --_yam3x-calendar-system-typescale-body-large-weight: var(--md-sys-typescale-body-large-weight);
  --_yam3x-calendar-system-typescale-body-large-line-height: var(
    --md-sys-typescale-body-large-line-height
  );
  --_yam3x-calendar-system-typescale-body-large-tracking: var(
    --md-sys-typescale-body-large-tracking
  );
  --_yam3x-calendar-system-typescale-line-height-scale: var(--md-sys-typescale-line-height-scale);
  display: inline-flex;
  flex-direction: column;
  width: max-content;
  max-width: 100%;
  overflow: hidden;
  padding: var(
    --yam3x-calendar-padding,
    calc(8px * var(--_yam3x-calendar-system-density-spacing-scale, 1))
  );
  border-radius: var(--yam3x-calendar-container-shape, 28px);
  background: var(
    --yam3x-calendar-container-color,
    var(--_yam3x-calendar-system-color-surface-container-high)
  );
  color: var(--_yam3x-calendar-system-color-on-surface);
  box-sizing: border-box;
}
.yam3x-calendar__header {
  display: flex;
  align-items: center;
  min-height: 56px;
  gap: calc(4px * var(--_yam3x-calendar-system-density-spacing-scale, 1));
}
.yam3x-calendar__period {
  display: flex;
  align-items: center;
  gap: calc(8px * var(--_yam3x-calendar-system-density-spacing-scale, 1));
  min-width: 48px;
  min-height: 48px;
  padding: 0 calc(12px * var(--_yam3x-calendar-system-density-spacing-scale, 1));
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: var(
    --yam3x-calendar-period-button-text-color,
    var(--_yam3x-calendar-system-color-on-surface-variant)
  );
  font: inherit;
  cursor: pointer;
}
.yam3x-calendar__period:hover,
.yam3x-calendar__nav:hover:not(:disabled) {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-calendar__caret {
  font-size: 18px;
}
.yam3x-calendar__spacer {
  flex: 1;
}
.yam3x-calendar__nav {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--_yam3x-calendar-system-color-on-surface-variant);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}
.yam3x-calendar__nav:disabled {
  opacity: 0.38;
  cursor: default;
}
.yam3x-calendar__grid,
.yam3x-calendar__days,
.yam3x-calendar__options {
  display: grid;
  grid-template-columns: repeat(7, 48px);
  width: 336px;
  max-width: 100%;
  box-sizing: border-box;
}
.yam3x-calendar__weekdays {
  min-height: 48px;
  align-items: center;
  justify-items: center;
  color: var(
    --yam3x-calendar-weekday-color,
    var(--_yam3x-calendar-system-color-on-surface-variant)
  );
  font-size: var(
    --yam3x-calendar-weekday-font-size,
    var(--_yam3x-calendar-system-typescale-body-large-size, 16px)
  );
  font-weight: var(
    --yam3x-calendar-weekday-font-weight,
    var(--_yam3x-calendar-system-typescale-body-large-weight, 400)
  );
  line-height: calc(
    (
      var(
        --yam3x-calendar-weekday-line-height,
        var(--_yam3x-calendar-system-typescale-body-large-line-height, 24px)
      )
    )
  );
  letter-spacing: var(
    --yam3x-calendar-weekday-tracking,
    var(--_yam3x-calendar-system-typescale-body-large-tracking, 0.5px)
  );
}
.yam3x-calendar__weekdays span {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
}
.yam3x-calendar__days {
  grid-auto-rows: 48px;
  align-items: center;
  justify-items: center;
}
.yam3x-calendar__cell {
  position: relative;
  z-index: 0;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  color: var(--yam3x-calendar-item-color, var(--_yam3x-calendar-system-color-on-surface));
  font-size: var(
    --yam3x-calendar-date-font-size,
    var(--_yam3x-calendar-system-typescale-body-large-size, 16px)
  );
  font-weight: var(
    --yam3x-calendar-date-font-weight,
    var(--_yam3x-calendar-system-typescale-body-large-weight, 400)
  );
  line-height: calc(
    (
      var(
        --yam3x-calendar-date-line-height,
        var(--_yam3x-calendar-system-typescale-body-large-line-height, 24px)
      )
    )
  );
  letter-spacing: var(
    --yam3x-calendar-date-tracking,
    var(--_yam3x-calendar-system-typescale-body-large-tracking, 0.5px)
  );
}
.yam3x-calendar__cell.is-in-range {
  background: linear-gradient(
      var(
        --yam3x-calendar-range-container-color,
        var(--_yam3x-calendar-system-color-secondary-container)
      ),
      var(
        --yam3x-calendar-range-container-color,
        var(--_yam3x-calendar-system-color-secondary-container)
      )
    )
    center/100% 40px no-repeat;
  color: var(
    --yam3x-calendar-range-color,
    var(--_yam3x-calendar-system-color-on-secondary-container)
  );
}
.yam3x-calendar__cell.is-range-start {
  background: linear-gradient(
      to right,
      transparent 50%,
      var(
          --yam3x-calendar-range-container-color,
          var(--_yam3x-calendar-system-color-secondary-container)
        )
        50%
    )
    center/100% 40px no-repeat;
}
.yam3x-calendar__cell.is-range-end {
  background: linear-gradient(
      to left,
      transparent 50%,
      var(
          --yam3x-calendar-range-container-color,
          var(--_yam3x-calendar-system-color-secondary-container)
        )
        50%
    )
    center/100% 40px no-repeat;
}
.yam3x-calendar__day {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.yam3x-calendar__day:hover:not(:disabled) {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day {
  background: var(
    --yam3x-calendar-item-selected-container-color,
    var(--_yam3x-calendar-system-color-primary)
  );
  color: var(--yam3x-calendar-item-selected-color, var(--_yam3x-calendar-system-color-on-primary));
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day:hover,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day:hover,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day:hover {
  background: color-mix(
    in srgb,
    var(--yam3x-calendar-item-selected-hover-color, var(--_yam3x-calendar-system-color-on-primary))
      8%,
    var(--yam3x-calendar-item-selected-container-color, var(--_yam3x-calendar-system-color-primary))
  );
}
.yam3x-calendar__cell.is-today:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day {
  outline: var(--yam3x-calendar-item-current-outline-thickness, 1px) solid
    var(--yam3x-calendar-item-current-outline-color, var(--_yam3x-calendar-system-color-primary));
  outline-offset: -1px;
}
.yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end) {
  color: var(
    --yam3x-calendar-item-special-color,
    var(--_yam3x-calendar-system-color-on-tertiary-container)
  );
}
.yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day {
  background: var(
    --yam3x-calendar-item-special-container-color,
    var(--_yam3x-calendar-system-color-tertiary-container)
  );
}
.yam3x-calendar__cell.is-outside {
  color: var(--yam3x-calendar-item-color, var(--_yam3x-calendar-system-color-on-surface-variant));
  opacity: 0.72;
}
.yam3x-calendar__day:disabled {
  color: var(--yam3x-calendar-item-disabled-color, var(--_yam3x-calendar-system-color-on-surface));
  opacity: var(--yam3x-calendar-item-disabled-color-opacity, 0.38);
  cursor: default;
}
.yam3x-calendar__day:focus-visible,
.yam3x-calendar__period:focus-visible,
.yam3x-calendar__nav:focus-visible,
.yam3x-calendar__options button:focus-visible {
  outline: 2px solid var(--_yam3x-calendar-system-color-primary);
  outline-offset: 2px;
}
.yam3x-calendar__options {
  grid-template-columns: repeat(3, minmax(64px, 1fr));
  gap: calc(4px * var(--_yam3x-calendar-system-density-spacing-scale, 1));
  max-height: 336px;
  overflow: auto;
  padding: calc(4px * var(--_yam3x-calendar-system-density-spacing-scale, 1));
}
.yam3x-calendar__options.yam3x-calendar__years {
  grid-template-columns: repeat(4, minmax(56px, 1fr));
}
.yam3x-calendar__options button {
  min-height: 48px;
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: var(--yam3x-calendar-item-color, var(--_yam3x-calendar-system-color-on-surface));
  font: inherit;
  cursor: pointer;
}
.yam3x-calendar__options button[aria-selected='true'] {
  background: var(
    --yam3x-calendar-item-selected-container-color,
    var(--_yam3x-calendar-system-color-primary)
  );
  color: var(--yam3x-calendar-item-selected-color, var(--_yam3x-calendar-system-color-on-primary));
}
.yam3x-calendar__options button:disabled {
  opacity: var(--yam3x-calendar-item-disabled-color-opacity, 0.38);
  cursor: default;
}
.yam3x-calendar-next-enter-active,
.yam3x-calendar-next-leave-active,
.yam3x-calendar-previous-enter-active,
.yam3x-calendar-previous-leave-active {
  transition:
    opacity var(--yam3x-calendar-slide-animation-duration, 250ms) cubic-bezier(0.2, 0, 0, 1),
    transform var(--yam3x-calendar-slide-animation-duration, 250ms) cubic-bezier(0.2, 0, 0, 1);
}
.yam3x-calendar-next-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.yam3x-calendar-next-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.yam3x-calendar-previous-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.yam3x-calendar-previous-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-calendar-next-enter-active,
  .yam3x-calendar-next-leave-active,
  .yam3x-calendar-previous-enter-active,
  .yam3x-calendar-previous-leave-active {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-calendar {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
  .yam3x-calendar__cell.is-selected .yam3x-calendar__day,
  .yam3x-calendar__cell.is-range-start .yam3x-calendar__day,
  .yam3x-calendar__cell.is-range-end .yam3x-calendar__day,
  .yam3x-calendar__options button[aria-selected='true'] {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
  .yam3x-calendar__day:focus-visible,
  .yam3x-calendar__period:focus-visible,
  .yam3x-calendar__nav:focus-visible,
  .yam3x-calendar__options button:focus-visible {
    outline-color: Highlight;
  }
}
@media (max-width: 360px) {
  .yam3x-calendar__grid,
  .yam3x-calendar__days {
    grid-template-columns: repeat(7, minmax(40px, 1fr));
    width: 100%;
  }
  .yam3x-calendar__weekdays span {
    width: 100%;
  }
  .yam3x-calendar__cell {
    width: 100%;
  }
  .yam3x-calendar__day {
    width: 40px;
    height: 40px;
  }
}
.yam3x-calendar {
  width: 360px;
  padding: var(
    --yam3x-calendar-padding,
    0 calc(12px * var(--_yam3x-calendar-system-density-spacing-scale, 1))
      calc(8px * var(--_yam3x-calendar-system-density-spacing-scale, 1))
  );
  overflow-x: auto;
}
.yam3x-calendar__grid {
  display: flex;
  flex-direction: column;
}
.yam3x-calendar__days {
  display: flex;
  flex-direction: column;
}
.yam3x-calendar__week {
  display: grid;
  grid-template-columns: repeat(7, 48px);
  height: 48px;
}
.yam3x-calendar__weekdays {
  display: grid;
}
.yam3x-calendar__options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.yam3x-calendar__options.yam3x-calendar__years {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.yam3x-calendar:dir(rtl) .yam3x-calendar__cell.is-range-start {
  background: linear-gradient(
      to left,
      transparent 50%,
      var(
          --yam3x-calendar-range-container-color,
          var(--_yam3x-calendar-system-color-secondary-container)
        )
        50%
    )
    center/100% 40px no-repeat;
}
.yam3x-calendar:dir(rtl) .yam3x-calendar__cell.is-range-end {
  background: linear-gradient(
      to right,
      transparent 50%,
      var(
          --yam3x-calendar-range-container-color,
          var(--_yam3x-calendar-system-color-secondary-container)
        )
        50%
    )
    center/100% 40px no-repeat;
}
.yam3x-calendar__day {
  width: 48px;
  height: 48px;
  background: transparent;
}
.yam3x-calendar__day::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 4px;
  border-radius: 50%;
  pointer-events: none;
  background: transparent;
}
.yam3x-calendar__day:hover:not(:disabled) {
  background: transparent;
}
.yam3x-calendar__day:hover:not(:disabled)::before {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day,
.yam3x-calendar__cell.is-selected .yam3x-calendar__day:hover,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day:hover,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day:hover {
  background: transparent;
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day::before,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day::before,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day::before {
  background: var(
    --yam3x-calendar-item-selected-container-color,
    var(--_yam3x-calendar-system-color-primary)
  );
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day:hover::before,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day:hover::before,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day:hover::before {
  background: color-mix(
    in srgb,
    var(--yam3x-calendar-item-selected-hover-color, var(--_yam3x-calendar-system-color-on-primary))
      8%,
    var(--yam3x-calendar-item-selected-container-color, var(--_yam3x-calendar-system-color-primary))
  );
}
.yam3x-calendar__cell.is-today:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day {
  outline: none;
}
.yam3x-calendar__cell.is-today:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day::before {
  outline: var(--yam3x-calendar-item-current-outline-thickness, 1px) solid
    var(--yam3x-calendar-item-current-outline-color, var(--_yam3x-calendar-system-color-primary));
  outline-offset: -1px;
}
.yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day {
  background: transparent;
}
.yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day::before {
  background: var(
    --yam3x-calendar-item-special-container-color,
    var(--_yam3x-calendar-system-color-tertiary-container)
  );
}
.yam3x-calendar__options button {
  font-size: var(--yam3x-calendar-item-font-size, 14px);
  font-weight: var(--yam3x-calendar-item-font-weight, 400);
  line-height: calc(
    (var(--yam3x-calendar-item-line-height, 20px)) *
      var(--_yam3x-calendar-system-typescale-line-height-scale, 1.07)
  );
  letter-spacing: var(--yam3x-calendar-item-tracking, 0.25px);
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day:focus-visible,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day:focus-visible,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day:focus-visible {
  outline-color: var(
    --yam3x-calendar-item-selected-focus-color,
    var(--_yam3x-calendar-system-color-on-primary)
  );
}
.yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day:hover:not(:disabled)::before {
  background: color-mix(
    in srgb,
    var(
        --yam3x-calendar-item-special-hover-color,
        var(--_yam3x-calendar-system-color-on-tertiary-container)
      )
      8%,
    var(
      --yam3x-calendar-item-special-container-color,
      var(--_yam3x-calendar-system-color-tertiary-container)
    )
  );
}
.yam3x-calendar__cell.is-special .yam3x-calendar__day:focus-visible {
  outline-color: var(
    --yam3x-calendar-item-special-focus-color,
    var(--_yam3x-calendar-system-color-on-tertiary-container)
  );
}
.yam3x-calendar__day::after {
  content: '';
  position: absolute;
  z-index: 0;
  inset: 4px;
  border-radius: 50%;
  background: var(--yam3x-calendar-item-ripple-color, currentColor);
  opacity: 0;
  transform: scale(0.2);
  transition:
    opacity var(--_yam3x-calendar-system-motion-spring-fast-effects),
    transform var(--_yam3x-calendar-system-motion-spring-default-spatial);
  pointer-events: none;
}
.yam3x-calendar__day:active::after {
  opacity: 0.18;
  transform: scale(1);
}
.yam3x-calendar__cell.is-selected .yam3x-calendar__day::after,
.yam3x-calendar__cell.is-range-start .yam3x-calendar__day::after,
.yam3x-calendar__cell.is-range-end .yam3x-calendar__day::after {
  background: var(
    --yam3x-calendar-item-selected-ripple-color,
    var(--_yam3x-calendar-system-color-on-primary)
  );
}
.yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day::after {
  background: var(
    --yam3x-calendar-item-special-ripple-color,
    var(--_yam3x-calendar-system-color-on-tertiary-container)
  );
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-calendar__day::after {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-calendar__cell.is-selected .yam3x-calendar__day::before,
  .yam3x-calendar__cell.is-range-start .yam3x-calendar__day::before,
  .yam3x-calendar__cell.is-range-end .yam3x-calendar__day::before,
  .yam3x-calendar__options button[aria-selected='true'] {
    forced-color-adjust: none;
    background: Highlight;
  }
  .yam3x-calendar__cell.is-selected .yam3x-calendar__day,
  .yam3x-calendar__cell.is-range-start .yam3x-calendar__day,
  .yam3x-calendar__cell.is-range-end .yam3x-calendar__day,
  .yam3x-calendar__options button[aria-selected='true'] {
    color: HighlightText;
  }
  .yam3x-calendar__cell.is-in-range {
    background: Highlight;
    color: HighlightText;
  }
  .yam3x-calendar__cell.is-special:not(.is-selected):not(.is-range-start):not(.is-range-end)
    .yam3x-calendar__day::before {
    background: transparent;
    outline: 1px solid CanvasText;
  }
  .yam3x-calendar__day:disabled {
    color: GrayText;
  }
}
.yam3x-calendar__caret {
  width: 24px;
  height: 24px;
  font-size: 24px;
}
.yam3x-calendar__nav .yam3x-icon {
  width: 24px;
  height: 24px;
  font-size: 24px;
}
.yam3x-calendar:dir(rtl) .yam3x-calendar__nav .yam3x-icon {
  transform: scaleX(-1);
}
.yam3x-calendar__day {
  letter-spacing: inherit;
}
.yam3x-calendar__cell.is-today:not(.is-selected):not(.is-range-start):not(.is-range-end)
  .yam3x-calendar__day::before {
  outline-width: var(
    --yam3x-calendar-item-current-outline-thickness,
    var(--yam3x-calendar-date-current-outline-thickness, 1px)
  );
}
.yam3x-calendar__weekdays {
  grid-template-columns: repeat(7, 48px);
  width: 336px;
}
@media (max-width: 360px) {
  .yam3x-calendar__grid,
  .yam3x-calendar__days,
  .yam3x-calendar__weekdays {
    width: 336px;
    grid-template-columns: repeat(7, 48px);
  }
  .yam3x-calendar__weekdays span,
  .yam3x-calendar__cell {
    width: 48px;
  }
  .yam3x-calendar__day {
    width: 48px;
    height: 48px;
  }
}
.yam3x-calendar:not(.has-complete-range) .yam3x-calendar__cell.is-range-start,
.yam3x-calendar:not(.has-complete-range) .yam3x-calendar__cell.is-range-end {
  background: transparent;
}
</style>
