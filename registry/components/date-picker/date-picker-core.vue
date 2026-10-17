<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { trapTabKey } from '../_shared/focus-trap'
import Icon from '../icon/icon.vue'
import './date-picker.css'
import { DatePickerActions, DatePickerCalendar } from './date-picker.components'
import DatePickerRangeFields from './date-picker-range-fields.vue'
import type { DateRangeValue } from './date-utils'
import {
  addDays,
  addMonths,
  createUtcDate,
  formatDate,
  hasSelectableDateInMonth,
  hasSelectableDateInYear,
  isDateAllowed,
  monthStart,
  parseLocalizedDate,
  parseIsoDate,
  toIsoDate,
} from './date-utils'

type DateSelection = 'single' | 'range'
type DatePickerMode = 'docked' | 'modal' | 'auto'
type PickerValue = string | null | DateRangeValue

const props = withDefaults(
  defineProps<{
    mode?: DatePickerMode
    selection?: DateSelection
    modelValue?: PickerValue
    open?: boolean
    initialDate?: string
    minDate?: string
    maxDate?: string
    yearRange?: [number, number]
    isDateSelectable?: (date: string) => boolean
    locale?: string
    label?: string
    startDateLabel?: string
    endDateLabel?: string
    supportingText?: string
    placeholder?: string
    clearable?: boolean
    calendarLabel?: string
    previousMonthLabel?: string
    nextMonthLabel?: string
    previousYearLabel?: string
    nextYearLabel?: string
    confirmLabel?: string
    cancelLabel?: string
    clearLabel?: string
  }>(),
  {
    mode: 'auto',
    selection: 'single',
    modelValue: null,
    open: undefined,
    yearRange: () => [1900, 2100],
    locale: undefined,
    label: 'Select date',
    startDateLabel: 'Start date',
    endDateLabel: 'End date',
    supportingText: undefined,
    placeholder: undefined,
    clearable: false,
    calendarLabel: 'Open calendar',
    previousMonthLabel: 'Previous month',
    nextMonthLabel: 'Next month',
    previousYearLabel: 'Previous year',
    nextYearLabel: 'Next year',
    confirmLabel: 'OK',
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: PickerValue]
  'update:open': [value: boolean]
  change: [value: PickerValue]
  invalid: [value: string]
}>()

const locale = computed(
  () => props.locale || (typeof navigator === 'undefined' ? 'en-US' : navigator.language),
)
const availability = computed(() => ({
  minDate: props.minDate,
  maxDate: props.maxDate,
  yearRange: props.yearRange,
  isDateSelectable: props.isDateSelectable,
}))
const uid = useId()
const compactWindow = ref(false)
const resolvedMode = computed(() =>
  props.mode === 'auto' ? (compactWindow.value ? 'modal' : 'docked') : props.mode,
)
const dockedPlacement = ref<'below' | 'above'>('below')
const localToday = new Date()
const todayDate = createUtcDate(
  localToday.getFullYear(),
  localToday.getMonth(),
  localToday.getDate(),
)
const today = toIsoDate(todayDate)
const selectedSingle = computed(() =>
  typeof props.modelValue === 'string' ? props.modelValue : null,
)
const selectedRange = computed<DateRangeValue>(() => {
  return props.modelValue && typeof props.modelValue === 'object'
    ? (props.modelValue as DateRangeValue)
    : { start: null, end: null }
})
const initialVisibleDate =
  parseIsoDate(props.initialDate) ??
  parseIsoDate(selectedSingle.value) ??
  parseIsoDate(selectedRange.value.start) ??
  new Date(Date.UTC(localToday.getFullYear(), localToday.getMonth(), 1))
const visibleMonth = ref(monthStart(initialVisibleDate))
const draftSingle = ref(selectedSingle.value)
const draftRange = ref<DateRangeValue>({ ...selectedRange.value })
const opened = ref(false)
const view = ref<'days' | 'months' | 'years'>('days')
const inputMode = ref(false)
const typedValue = ref('')
const isTyping = ref(false)
const typedRange = ref<DateRangeValue>({ start: null, end: null })
const rangeDirty = ref({ start: false, end: false })
const errorMessage = ref('')
const root = ref<HTMLElement>()
const calendarButton = ref<HTMLButtonElement>()
const modeViewport = ref<HTMLElement>()
const rovingDate = ref(selectedSingle.value ?? selectedRange.value.start ?? today)

watch(
  () => props.open,
  (value) => {
    if (value !== undefined) setOpen(value)
  },
  { immediate: true },
)
let breakpointQuery: MediaQueryList | undefined
function syncBreakpoint(): void {
  compactWindow.value = breakpointQuery?.matches ?? false
}
onMounted(() => {
  breakpointQuery = window.matchMedia('(max-width: 599px)')
  syncBreakpoint()
  breakpointQuery.addEventListener('change', syncBreakpoint)
  if ('fonts' in document) {
    void document.fonts
      .load('24px "Material Symbols Outlined"', 'calendar_month chevron_left chevron_right edit')
      .catch(() => {})
  }
})
onBeforeUnmount(() => breakpointQuery?.removeEventListener('change', syncBreakpoint))
watch(
  () => [props.modelValue, props.selection] as const,
  () => {
    draftSingle.value = selectedSingle.value
    draftRange.value = { ...selectedRange.value }
  },
)
watch(
  () => [props.initialDate, selectedSingle.value, selectedRange.value.start] as const,
  () => {
    const date =
      parseIsoDate(props.initialDate) ??
      parseIsoDate(selectedSingle.value) ??
      parseIsoDate(selectedRange.value.start)
    if (date && !opened.value) visibleMonth.value = monthStart(date)
  },
)
watch([opened, view, inputMode], async ([isOpen, currentView, isInput]) => {
  if (!isOpen) return
  await nextTick()
  if (isInput)
    root.value?.querySelector<HTMLInputElement>('.yam3x-date-picker__manual-entry input')?.focus()
  else if (currentView === 'days') {
    const target =
      root.value?.querySelector<HTMLButtonElement>(
        `.yam3x-date-picker__view-page:not([aria-hidden="true"]) [data-date="${rovingDate.value}"]:not(:disabled)`,
      ) ??
      root.value?.querySelector<HTMLButtonElement>(
        '.yam3x-date-picker__view-page:not([aria-hidden="true"]) .yam3x-date-picker__day:not(:disabled)',
      )
    target?.focus()
  } else {
    const target =
      root.value?.querySelector<HTMLButtonElement>(
        '.yam3x-date-picker__view-page:not([aria-hidden="true"]) .yam3x-date-picker__option-grid [aria-selected="true"]:not(:disabled)',
      ) ??
      root.value?.querySelector<HTMLButtonElement>(
        '.yam3x-date-picker__view-page:not([aria-hidden="true"]) .yam3x-date-picker__option-grid button:not(:disabled)',
      )
    target?.focus()
  }
})
watch([inputMode, () => props.selection], async () => {
  const viewport = modeViewport.value
  if (!viewport || !opened.value) return
  const startHeight = viewport.getBoundingClientRect().height
  viewport.style.height = `${startHeight}px`
  void viewport.offsetHeight
  await nextTick()
  const endHeight =
    viewport.querySelector<HTMLElement>('.yam3x-date-picker__mode-page')?.getBoundingClientRect()
      .height ?? viewport.scrollHeight
  requestAnimationFrame(() => {
    viewport.style.height =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      Math.abs(endHeight - startHeight) < 1
        ? 'auto'
        : `${endHeight}px`
  })
})
watch(resolvedMode, async () => {
  if (!opened.value) return
  await nextTick()
  const target =
    root.value?.querySelector<HTMLButtonElement>(
      `[data-date="${rovingDate.value}"]:not(:disabled)`,
    ) ?? root.value?.querySelector<HTMLButtonElement>('.yam3x-date-picker__day:not(:disabled)')
  target?.focus()
})

const titleMonth = computed(() =>
  formatDate(visibleMonth.value, locale.value, { month: 'long', year: 'numeric' }),
)
const titleMonthOnly = computed(() =>
  formatDate(visibleMonth.value, locale.value, { month: 'long' }),
)
const titleYearOnly = computed(() =>
  formatDate(visibleMonth.value, locale.value, { year: 'numeric' }),
)
const localizedPlaceholder = computed(
  () =>
    props.placeholder ||
    formatDate(new Date(Date.UTC(2023, 0, 1)), locale.value, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }),
)
const weekdayLabels = computed(() => {
  const start = weekStart()
  const weekdayWidth: Intl.DateTimeFormatOptions['weekday'] = locale.value
    .toLowerCase()
    .startsWith('zh')
    ? 'narrow'
    : 'short'
  return Array.from({ length: 7 }, (_, index) =>
    formatDate(addDays(start, index), locale.value, { weekday: weekdayWidth }),
  )
})
const weekdayFullLabels = computed(() => {
  const start = weekStart()
  return Array.from({ length: 7 }, (_, index) =>
    formatDate(addDays(start, index), locale.value, { weekday: 'long' }),
  )
})
const calendarDates = computed(() => {
  return datesForMonth(visibleMonth.value)
})
function datesForMonth(date: Date): Date[] {
  const first = monthStart(date)
  const offset = (first.getUTCDay() - firstDayOfWeek() + 7) % 7
  const count = createUtcDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate()
  const slots = Math.ceil((offset + count) / 7) * 7
  const start = addDays(first, -offset)
  return Array.from({ length: slots }, (_, index) => addDays(start, index))
}
const continuousMonths = computed(() =>
  Array.from({ length: 12 }, (_, index) => monthStart(addMonths(visibleMonth.value, index)))
    .filter((month) => month.getUTCFullYear() <= props.yearRange[1])
    .map((month) => ({
      month,
      dates: datesForMonth(month),
      title: formatDate(month, locale.value, { month: 'long', year: 'numeric' }),
    })),
)
const years = computed(() =>
  Array.from(
    { length: props.yearRange[1] - props.yearRange[0] + 1 },
    (_, index) => props.yearRange[0] + index,
  ).filter(yearHasSelectableDate),
)
const months = computed(() =>
  Array.from({ length: 12 }, (_, index) =>
    formatDate(new Date(Date.UTC(2020, index, 1)), locale.value, { month: 'long' }),
  ),
)
const monthAvailability = computed(() =>
  Array.from({ length: 12 }, (_, index) =>
    monthHasSelectableDate(visibleMonth.value.getUTCFullYear(), index),
  ),
)
const previousMonthAvailable = computed(() => {
  const month = addMonths(visibleMonth.value, -1)
  return monthHasSelectableDate(month.getUTCFullYear(), month.getUTCMonth())
})
const nextMonthAvailable = computed(() => {
  const month = addMonths(visibleMonth.value, 1)
  return monthHasSelectableDate(month.getUTCFullYear(), month.getUTCMonth())
})
const fieldText = computed(() => {
  if (props.selection === 'range') {
    const { start, end } = selectedRange.value
    return start ? `${formatShort(start)}${end ? ` – ${formatShort(end)}` : ''}` : ''
  }
  return selectedSingle.value ? formatShort(selectedSingle.value) : ''
})
const calendarProps = computed(() => ({
  view: view.value,
  continuousMonths:
    props.selection === 'range' && resolvedMode.value === 'modal' ? continuousMonths.value : [],
  visibleMonth: visibleMonth.value,
  dates: calendarDates.value,
  weekdays: weekdayLabels.value,
  weekdayFullLabels: weekdayFullLabels.value,
  years: years.value,
  months: months.value,
  monthAvailability: monthAvailability.value,
  previousMonthAvailable: previousMonthAvailable.value,
  nextMonthAvailable: nextMonthAvailable.value,
  locale: locale.value,
  titleMonth: titleMonth.value,
  titleMonthOnly: titleMonthOnly.value,
  titleYearOnly: titleYearOnly.value,
  selectedSingle: draftSingle.value,
  range: draftRange.value,
  selection: props.selection,
  today,
  rovingDate: rovingDate.value,
  allowed,
  isSelected,
  isInRange,
  previousMonthLabel: props.previousMonthLabel,
  nextMonthLabel: props.nextMonthLabel,
  previousYearLabel: props.previousYearLabel,
  nextYearLabel: props.nextYearLabel,
}))

function firstDayOfWeek(): number {
  try {
    const info = (
      new Intl.Locale(locale.value) as Intl.Locale & { weekInfo?: { firstDay: number } }
    ).weekInfo
    return info ? info.firstDay % 7 : 0
  } catch {
    return 0
  }
}
function weekStart(): Date {
  return new Date(Date.UTC(2023, 0, 1 + firstDayOfWeek()))
}
function formatShort(value: string): string {
  const date = parseIsoDate(value)
  return date ? formatDate(date, locale.value) : value
}
function dayLabel(value: string): string {
  const date = parseIsoDate(value)
  return date
    ? formatDate(date, locale.value, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : value
}
function allowed(value: string): boolean {
  return isDateAllowed(value, availability.value)
}
function monthHasSelectableDate(year: number, month: number): boolean {
  const count = createUtcDate(year, month + 1, 0).getUTCDate()
  const first = `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-01`
  const last = `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(count).padStart(2, '0')}`
  if (year < props.yearRange[0] || year > props.yearRange[1]) return false
  if (props.minDate && last < props.minDate) return false
  if (props.maxDate && first > props.maxDate) return false
  if (!props.isDateSelectable) return true
  return hasSelectableDateInMonth(year, month, allowed)
}
function yearHasSelectableDate(year: number): boolean {
  return hasSelectableDateInYear(year, monthHasSelectableDate)
}
function isSelected(value: string): boolean {
  return props.selection === 'single'
    ? draftSingle.value === value
    : draftRange.value.start === value || draftRange.value.end === value
}
function isInRange(value: string): boolean {
  const { start, end } = draftRange.value
  return Boolean(start && end && value >= start && value <= end)
}
function setOpen(value: boolean, restoreFocus = true): void {
  const wasOpen = opened.value
  opened.value = value
  emit('update:open', value)
  if (!value && restoreFocus && wasOpen) {
    void nextTick(() =>
      requestAnimationFrame(() =>
        root.value
          ?.querySelector<HTMLButtonElement>(
            '.yam3x-date-picker__icon-button, .yam3x-date-picker__modal-trigger',
          )
          ?.focus(),
      ),
    )
  }
  if (value) {
    draftSingle.value = selectedSingle.value
    draftRange.value = { ...selectedRange.value }
    typedValue.value = selectedSingle.value ? formatShort(selectedSingle.value) : ''
    typedRange.value = {
      start: selectedRange.value.start ? formatShort(selectedRange.value.start) : '',
      end: selectedRange.value.end ? formatShort(selectedRange.value.end) : '',
    }
    rangeDirty.value = { start: false, end: false }
    view.value = 'days'
    inputMode.value = false
    errorMessage.value = ''
    const date =
      parseIsoDate(selectedSingle.value) ??
      parseIsoDate(selectedRange.value.start) ??
      parseIsoDate(props.initialDate) ??
      todayDate
    visibleMonth.value = monthStart(date)
    rovingDate.value = toIsoDate(date)
  }
}
function toggleOpen(): void {
  setOpen(!opened.value)
}
function onFieldInput(event: Event): void {
  isTyping.value = true
  typedValue.value = (event.target as HTMLInputElement).value
}
function updateRangeInput(part: 'start' | 'end', value: string): void {
  typedRange.value = { ...typedRange.value, [part]: value }
  rangeDirty.value = { ...rangeDirty.value, [part]: true }
  errorMessage.value = ''
}
function writeRange(next: DateRangeValue): void {
  if (resolvedMode.value === 'modal') draftRange.value = next
  else commit(next)
}
function commitRangeInput(part: 'start' | 'end'): void {
  if (!rangeDirty.value[part]) return
  const raw = typedRange.value[part]?.trim() ?? ''
  const current = resolvedMode.value === 'modal' ? draftRange.value : selectedRange.value
  if (!raw) {
    const next = { ...current, [part]: null }
    if (part === 'start') next.end = null
    writeRange(next)
    rangeDirty.value = { ...rangeDirty.value, [part]: false }
    errorMessage.value = ''
    return
  }
  const parsed = parseLocalizedDate(raw, locale.value)
  if (!parsed || !allowed(parsed)) {
    errorMessage.value = 'Enter a valid date.'
    emit('invalid', raw)
    return
  }
  const next = { ...current, [part]: parsed }
  if (part === 'start' && next.end && parsed > next.end) next.end = null
  if (part === 'end' && next.start && parsed < next.start) {
    errorMessage.value = 'End date must be on or after the start date.'
    emit('invalid', raw)
    return
  }
  errorMessage.value = ''
  writeRange(next)
  rangeDirty.value = { ...rangeDirty.value, [part]: false }
}
function toggleInputMode(): void {
  if (!inputMode.value) {
    typedValue.value = draftSingle.value ? formatShort(draftSingle.value) : ''
    typedRange.value = {
      start: draftRange.value.start ? formatShort(draftRange.value.start) : '',
      end: draftRange.value.end ? formatShort(draftRange.value.end) : '',
    }
    rangeDirty.value = { start: false, end: false }
  }
  inputMode.value = !inputMode.value
}
function commitTypedDate(): void {
  const raw = typedValue.value.trim()
  if (!raw) {
    if (props.clearable && isTyping.value) {
      if (resolvedMode.value === 'modal') draftSingle.value = null
      else commit(null)
    }
    errorMessage.value = ''
    isTyping.value = false
    return
  }
  const parsed = parseLocalizedDate(raw, locale.value)
  if (!parsed || !allowed(parsed)) {
    errorMessage.value = 'Enter a valid date.'
    emit('invalid', raw)
    isTyping.value = false
    typedValue.value = fieldText.value
    return
  }
  errorMessage.value = ''
  if (resolvedMode.value === 'modal') draftSingle.value = parsed
  else commit(parsed)
  visibleMonth.value = monthStart(parseIsoDate(parsed)!)
  isTyping.value = false
}
function commit(value: PickerValue): void {
  emit('update:modelValue', value)
  emit('change', value)
}
function chooseDate(date: Date): void {
  const value = toIsoDate(date)
  if (!allowed(value)) return
  rovingDate.value = value
  if (props.selection === 'single') {
    draftSingle.value = value
  } else if (!draftRange.value.start || draftRange.value.end) {
    draftRange.value = { start: value, end: null }
  } else if (value < draftRange.value.start) {
    draftRange.value = { start: value, end: null }
  } else {
    draftRange.value = { ...draftRange.value, end: value }
  }
}
function confirm(): void {
  if (resolvedMode.value === 'modal' && inputMode.value && props.selection === 'range') {
    commitRangeInput('start')
    if (errorMessage.value) return
    commitRangeInput('end')
    if (errorMessage.value) return
  } else if (resolvedMode.value === 'modal' && inputMode.value && typedValue.value.trim()) {
    const parsed = parseLocalizedDate(typedValue.value.trim(), locale.value)
    if (!parsed || !allowed(parsed)) {
      errorMessage.value = 'Enter a valid date.'
      emit('invalid', typedValue.value)
      return
    }
    if (props.selection === 'single') draftSingle.value = parsed
    else
      draftRange.value =
        !draftRange.value.start || draftRange.value.end
          ? { start: parsed, end: null }
          : parsed < draftRange.value.start
            ? { start: parsed, end: null }
            : { ...draftRange.value, end: parsed }
  }
  commit(props.selection === 'single' ? draftSingle.value : { ...draftRange.value })
  typedValue.value = fieldText.value
  rangeDirty.value = { start: false, end: false }
  isTyping.value = false
  setOpen(false)
}
function cancel(restoreFocus = true): void {
  draftSingle.value = selectedSingle.value
  draftRange.value = { ...selectedRange.value }
  typedValue.value = selectedSingle.value ? formatShort(selectedSingle.value) : ''
  typedRange.value = {
    start: selectedRange.value.start ? formatShort(selectedRange.value.start) : '',
    end: selectedRange.value.end ? formatShort(selectedRange.value.end) : '',
  }
  rangeDirty.value = { start: false, end: false }
  isTyping.value = false
  setOpen(false, restoreFocus)
}
function clear(): void {
  const value: PickerValue = props.selection === 'single' ? null : { start: null, end: null }
  draftSingle.value = null
  draftRange.value = { start: null, end: null }
  typedValue.value = ''
  typedRange.value = { start: '', end: '' }
  rangeDirty.value = { start: false, end: false }
  commit(value)
  setOpen(false)
}
function shiftMonth(delta: number): void {
  const next = addMonths(visibleMonth.value, delta)
  if (!monthHasSelectableDate(next.getUTCFullYear(), next.getUTCMonth())) return
  visibleMonth.value = next
}
function showYear(year: number): void {
  const current = parseIsoDate(rovingDate.value) ?? visibleMonth.value
  const month = visibleMonth.value.getUTCMonth()
  const day = Math.min(current.getUTCDate(), createUtcDate(year, month + 1, 0).getUTCDate())
  moveFocus(createUtcDate(year, month, day))
  view.value = 'days'
}
function showMonth(month: number): void {
  const year = visibleMonth.value.getUTCFullYear()
  const current = parseIsoDate(rovingDate.value) ?? visibleMonth.value
  const day = Math.min(current.getUTCDate(), createUtcDate(year, month + 1, 0).getUTCDate())
  moveFocus(createUtcDate(year, month, day))
  view.value = 'days'
}
function moveFocus(date: Date): void {
  let target = date
  const origin = parseIsoDate(rovingDate.value) ?? date
  const direction = Math.sign(date.getTime() - origin.getTime()) || 1
  for (let attempt = 0; attempt < 370 && !allowed(toIsoDate(target)); attempt++) {
    const next = addDays(target, direction)
    if (direction < 0 && next.getUTCFullYear() < props.yearRange[0]) return
    if (direction > 0 && next.getUTCFullYear() > props.yearRange[1]) return
    target = next
  }
  if (!allowed(toIsoDate(target))) return
  rovingDate.value = toIsoDate(target)
  visibleMonth.value = monthStart(target)
  void nextTick(() =>
    root.value
      ?.querySelector<HTMLButtonElement>(`[data-date="${rovingDate.value}"]:not(:disabled)`)
      ?.focus(),
  )
}
function onDayKeydown(event: KeyboardEvent, date: Date): void {
  let target: Date | null = null
  if (event.key === 'ArrowRight') target = addDays(date, 1)
  if (event.key === 'ArrowLeft') target = addDays(date, -1)
  if (event.key === 'ArrowDown') target = addDays(date, 7)
  if (event.key === 'ArrowUp') target = addDays(date, -7)
  if (event.key === 'Home') target = createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1)
  if (event.key === 'End') target = createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  if (event.key === 'PageDown') target = adjacentDate(date, event.shiftKey ? 12 : 1)
  if (event.key === 'PageUp') target = adjacentDate(date, event.shiftKey ? -12 : -1)
  if (event.shiftKey && event.key.toLowerCase() === 'm') {
    view.value = 'months'
    event.preventDefault()
    return
  }
  if (event.shiftKey && event.key.toLowerCase() === 'y') {
    view.value = 'years'
    event.preventDefault()
    return
  }
  if (target) {
    event.preventDefault()
    moveFocus(target)
  }
}
function adjacentDate(date: Date, monthDelta: number): Date {
  const first = createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + monthDelta, 1)
  const lastDay = createUtcDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate()
  return createUtcDate(
    first.getUTCFullYear(),
    first.getUTCMonth(),
    Math.min(date.getUTCDate(), lastDay),
  )
}
function onModalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
    return
  }
  if (event.key !== 'Tab' || resolvedMode.value !== 'modal') return
  const modal = root.value?.querySelector<HTMLElement>('.yam3x-date-picker__modal')
  if (modal) trapTabKey(event, modal)
}
function onOutsideClick(event: MouseEvent): void {
  if (
    resolvedMode.value === 'docked' &&
    opened.value &&
    root.value &&
    !root.value.contains(event.target as Node)
  )
    cancel(false)
}
watch([opened, resolvedMode], async ([value, mode]) => {
  document.removeEventListener('pointerdown', onOutsideClick)
  document.removeEventListener('keydown', onDockedEscape, true)
  document.removeEventListener('keydown', onModalKeydown, true)
  window.removeEventListener('resize', updateDockedPlacement)
  window.removeEventListener('scroll', updateDockedPlacement, true)
  if (!value || mode !== 'docked') return
  document.addEventListener('pointerdown', onOutsideClick)
  document.addEventListener('keydown', onDockedEscape, true)
  window.addEventListener('resize', updateDockedPlacement)
  window.addEventListener('scroll', updateDockedPlacement, true)
  await nextTick()
  updateDockedPlacement()
  await nextTick()
  if (opened.value && resolvedMode.value === 'docked') {
    root.value
      ?.querySelector<HTMLButtonElement>(`[data-date="${rovingDate.value}"]:not(:disabled)`)
      ?.focus({ preventScroll: true })
  }
})
watch([opened, resolvedMode], ([value, mode]) => {
  document.removeEventListener('keydown', onModalKeydown, true)
  if (value && mode === 'modal') document.addEventListener('keydown', onModalKeydown, true)
})
function updateDockedPlacement(): void {
  if (!opened.value || resolvedMode.value !== 'docked') return
  const anchor = root.value?.querySelector<HTMLElement>('.yam3x-date-picker__field-wrap')
  const surface = root.value?.querySelector<HTMLElement>('.yam3x-date-picker__surface')
  if (!anchor || !surface) return
  const anchorRect = anchor.getBoundingClientRect()
  const surfaceHeight = surface.getBoundingClientRect().height
  const below = window.innerHeight - anchorRect.bottom - 4
  const above = anchorRect.top - 4
  dockedPlacement.value = below < surfaceHeight && above > below ? 'above' : 'below'
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutsideClick)
  document.removeEventListener('keydown', onDockedEscape, true)
  document.removeEventListener('keydown', onModalKeydown, true)
  window.removeEventListener('resize', updateDockedPlacement)
  window.removeEventListener('scroll', updateDockedPlacement, true)
})
function onDockedKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && opened.value) {
    event.preventDefault()
    cancel()
  }
}
function onDockedEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && opened.value && resolvedMode.value === 'docked') {
    event.preventDefault()
    cancel()
  }
}

defineExpose({
  open: () => setOpen(true),
  close: cancel,
  focus: () => calendarButton.value?.focus(),
})
</script>

<template>
  <div
    ref="root"
    class="yam3x-date-picker"
    :class="[`yam3x-date-picker--${resolvedMode}`, { 'is-open': opened }]"
    @keydown="resolvedMode === 'docked' ? onDockedKeydown : undefined"
  >
    <template v-if="resolvedMode === 'docked'">
      <div class="yam3x-date-picker__anchor">
        <div
          class="yam3x-date-picker__field-wrap"
          :class="{ 'is-range': selection === 'range' }"
        >
          <template v-if="selection === 'range'">
            <div
              class="yam3x-date-picker__range-inputs"
              role="group"
              :aria-label="label"
            >
              <DatePickerRangeFields
                :id-prefix="uid"
                :start-date-label="startDateLabel"
                :end-date-label="endDateLabel"
                :start-value="typedRange.start || ''"
                :end-value="typedRange.end || ''"
                :placeholder="localizedPlaceholder"
                :invalid="Boolean(errorMessage)"
                :error-id="`${uid}-error`"
                :support-id="supportingText ? `${uid}-support` : undefined"
                show-separator
                @update:start="updateRangeInput('start', $event)"
                @update:end="updateRangeInput('end', $event)"
                @commit:start="commitRangeInput('start')"
                @commit:end="commitRangeInput('end')"
              />
            </div>
            <button
              ref="calendarButton"
              class="yam3x-date-picker__icon-button"
              type="button"
              :aria-label="calendarLabel"
              :aria-expanded="opened"
              @click="toggleOpen"
            >
              <Icon name="calendar_month" />
            </button>
          </template>
          <template v-else>
            <label
              class="yam3x-date-picker__field-label"
              :for="`${uid}-field`"
              >{{ label }}</label
            >
            <input
              :id="`${uid}-field`"
              class="yam3x-date-picker__field"
              type="text"
              :value="isTyping ? typedValue : fieldText"
              :placeholder="localizedPlaceholder"
              :aria-describedby="
                errorMessage ? `${uid}-error` : supportingText ? `${uid}-support` : undefined
              "
              :aria-invalid="errorMessage ? 'true' : undefined"
              @input="onFieldInput"
              @keydown.enter.prevent="commitTypedDate"
              @blur="commitTypedDate"
            />
            <button
              ref="calendarButton"
              class="yam3x-date-picker__icon-button"
              type="button"
              :aria-label="calendarLabel"
              :aria-expanded="opened"
              @click="toggleOpen"
            >
              <Icon name="calendar_month" />
            </button>
          </template>
        </div>
        <div
          v-if="opened"
          class="yam3x-date-picker__surface"
          :class="`is-${dockedPlacement}`"
          role="dialog"
          :aria-label="label"
        >
          <DatePickerCalendar
            v-bind="calendarProps"
            @month="shiftMonth"
            @year="showYear"
            @select-month="showMonth"
            @select-date="chooseDate"
            @day-keydown="onDayKeydown"
            @select-month-view="view = 'months'"
            @select-year-view="view = 'years'"
          />
          <DatePickerActions
            :clearable="clearable"
            :clear-label="clearLabel"
            :cancel-label="cancelLabel"
            :confirm-label="confirmLabel"
            @clear="clear"
            @cancel="cancel"
            @confirm="confirm"
          />
        </div>
      </div>
      <p
        v-if="supportingText"
        :id="`${uid}-support`"
        class="yam3x-date-picker__support"
      >
        {{ supportingText }}
      </p>
      <p
        v-if="errorMessage"
        :id="`${uid}-error`"
        class="yam3x-date-picker__error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </template>

    <template v-else>
      <button
        class="yam3x-date-picker__modal-trigger"
        type="button"
        :aria-label="label"
        @click="toggleOpen"
      >
        <span>{{ fieldText || placeholder || label }}</span>
        <Icon name="calendar_month" />
      </button>
      <div
        v-if="opened"
        class="yam3x-date-picker__scrim"
        @pointerdown.self="() => cancel()"
      >
        <section
          class="yam3x-date-picker__modal"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          :aria-describedby="supportingText ? `${uid}-modal-support` : undefined"
        >
          <header class="yam3x-date-picker__modal-head">
            <p class="yam3x-date-picker__headline">{{ label }}</p>
            <p
              v-if="supportingText"
              :id="`${uid}-modal-support`"
              class="yam3x-date-picker__modal-support"
            >
              {{ supportingText }}
            </p>
            <div
              :class="['yam3x-date-picker__modal-value', { 'is-range': selection === 'range' }]"
              aria-live="polite"
            >
              <template v-if="selection === 'single'">{{
                draftSingle ? dayLabel(draftSingle) : 'Select date'
              }}</template>
              <template v-else
                >{{ draftRange.start ? dayLabel(draftRange.start) : 'Start date' }}<span> – </span
                >{{ draftRange.end ? dayLabel(draftRange.end) : 'End date' }}</template
              >
            </div>
            <button
              class="yam3x-date-picker__mode-toggle"
              type="button"
              :aria-label="inputMode ? 'Show calendar' : 'Enter date manually'"
              @click="toggleInputMode"
            >
              <Icon :name="inputMode ? 'calendar_month' : 'edit'" />
            </button>
          </header>
          <div
            ref="modeViewport"
            class="yam3x-date-picker__mode-viewport"
            @transitionend="
              (event) => {
                if (
                  event.target === modeViewport &&
                  event.propertyName === 'height' &&
                  modeViewport
                )
                  modeViewport.style.height = 'auto'
              }
            "
          >
            <Transition
              :name="inputMode ? 'yam3x-date-entry-input' : 'yam3x-date-entry-picker'"
              @leave="
                (element) => {
                  ;(element as HTMLElement).inert = true
                  element.setAttribute('aria-hidden', 'true')
                }
              "
            >
              <div
                v-if="inputMode && selection === 'range'"
                key="range-input"
                class="yam3x-date-picker__mode-page yam3x-date-picker__manual-entry yam3x-date-picker__manual-range"
              >
                <DatePickerRangeFields
                  :id-prefix="`${uid}-modal`"
                  :start-date-label="startDateLabel"
                  :end-date-label="endDateLabel"
                  :start-value="typedRange.start || ''"
                  :end-value="typedRange.end || ''"
                  :placeholder="localizedPlaceholder"
                  :invalid="Boolean(errorMessage)"
                  :error-id="`${uid}-error`"
                  :support-id="supportingText ? `${uid}-modal-support` : undefined"
                  @update:start="updateRangeInput('start', $event)"
                  @update:end="updateRangeInput('end', $event)"
                  @commit:start="commitRangeInput('start')"
                  @commit:end="commitRangeInput('end')"
                />
                <p
                  v-if="errorMessage"
                  :id="`${uid}-error`"
                  class="yam3x-date-picker__error"
                  role="alert"
                >
                  {{ errorMessage }}
                </p>
              </div>
              <div
                v-else-if="inputMode"
                key="single-input"
                class="yam3x-date-picker__mode-page yam3x-date-picker__manual-entry"
              >
                <label :for="`${uid}-manual`">{{ label }}</label>
                <input
                  :id="`${uid}-manual`"
                  v-model="typedValue"
                  type="text"
                  :placeholder="localizedPlaceholder"
                  :aria-invalid="errorMessage ? 'true' : undefined"
                  :aria-describedby="
                    errorMessage
                      ? `${uid}-error`
                      : supportingText
                        ? `${uid}-modal-support`
                        : undefined
                  "
                  @keydown.enter.prevent="commitTypedDate"
                />
                <p
                  v-if="errorMessage"
                  class="yam3x-date-picker__error"
                  role="alert"
                >
                  {{ errorMessage }}
                </p>
              </div>
              <DatePickerCalendar
                v-else
                key="calendar"
                class="yam3x-date-picker__mode-page"
                v-bind="calendarProps"
                @month="shiftMonth"
                @year="showYear"
                @select-month="showMonth"
                @select-date="chooseDate"
                @day-keydown="onDayKeydown"
                @select-month-view="view = 'months'"
                @select-year-view="view = 'years'"
              />
            </Transition>
          </div>
          <DatePickerActions
            :clearable="clearable"
            :clear-label="clearLabel"
            :cancel-label="cancelLabel"
            :confirm-label="confirmLabel"
            @clear="clear"
            @cancel="cancel"
            @confirm="confirm"
          />
        </section>
      </div>
    </template>
  </div>
</template>
