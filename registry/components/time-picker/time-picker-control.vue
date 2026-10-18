<script setup lang="ts">
import { useTimePickerLocale } from './time-picker.locale'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useId } from 'vue'
import TimePickerPanel from './time-picker-panel.vue'
import {
  getHourDialItems,
  getTickDialItems,
  getTimePeriodLabels,
  parseTimeParts,
  resolveTimePickerFormat,
  timeToSeconds,
  validateTimeValue,
  type TimeParts,
  type TimePickerView,
} from './time-picker.utils'
import type { TimePickerControlProps, TimeValue } from './time-picker.types'

const props = withDefaults(defineProps<TimePickerControlProps>(), {
  modelValue: null,
  mode: 'dial',
  layoutType: 'vertical',
  inputOnly: false,
  showModeToggle: true,
  showActions: true,
  showHeadline: true,
  format: 'auto',
  showSeconds: false,
  locale: undefined,
  hourLabel: undefined,
  minuteLabel: undefined,
  secondLabel: undefined,
  modeToggleLabel: undefined,
  useDialLabel: undefined,
  dialLabel: undefined,
  inputLabel: undefined,
  hideModeToggle: false,
  cancelLabel: undefined,
  confirmLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: TimeValue]
  change: [value: TimeValue]
  'update:mode': [value: 'dial' | 'input']
  'update:dragging': [value: boolean]
  confirm: [value: TimeValue]
  cancel: []
}>()

const { locale, messages } = useTimePickerLocale(props)
const validationIssue = ref<'hour' | 'minute' | 'second' | 'range' | null>(null)
const pendingFormat = ref<'12' | '24'>()
const format = computed(() =>
  props.format === 'auto' &&
  currentMode.value === 'input' &&
  validationIssue.value !== null &&
  pendingFormat.value
    ? pendingFormat.value
    : resolveTimePickerFormat(props.format, locale.value),
)
const minimumTime = computed(() => parseTimeParts(props.minTime))
const maximumTime = computed(() => parseTimeParts(props.maxTime))
const periodLabels = computed(() => getTimePeriodLabels(locale.value))
const currentMode = ref<'dial' | 'input'>(props.mode)
const activeView = ref<TimePickerView>('hour')
const initial = props.modelValue ?? { hour: new Date().getHours(), minute: 0 }
const draft = ref<TimeParts>({ ...initial, second: initial.second ?? 0 })
const inputText = ref({ hour: '', minute: '', second: '' })
const validationMessage = computed(() =>
  validationIssue.value === null
    ? ''
    : validationIssue.value === 'range'
      ? messages.value.outsideRange
      : messages.value.invalidPart(validationIssue.value),
)
const errorId = `yam3x-time-picker-control-${useId()}-error`
const root = ref<HTMLElement>()
const dialGeometry = ref({ size: 256, numeralSize: 40, inset: 4, dialInset: 4 })
const dragging = ref(false)
const dragPointer = ref<number | null>(null)
const dragView = ref<TimePickerView>('hour')
let dragFrame = 0
let pendingDragPoint: { x: number; y: number } | null = null
let dragRect: DOMRect | null = null
let geometryObserver: MutationObserver | undefined
const hours = computed(() => getHourDialItems(format.value))
const ticks = computed(() => getTickDialItems())
const period = computed<'AM' | 'PM'>(() => (draft.value.hour >= 12 ? 'PM' : 'AM'))
const displayedHour = computed(() =>
  format.value === '12' ? draft.value.hour % 12 || 12 : draft.value.hour,
)
const hourText = computed(() =>
  currentMode.value === 'input'
    ? inputText.value.hour
    : String(displayedHour.value).padStart(2, '0'),
)
const minuteText = computed(() =>
  currentMode.value === 'input'
    ? inputText.value.minute
    : String(draft.value.minute).padStart(2, '0'),
)
const secondText = computed(() =>
  currentMode.value === 'input'
    ? inputText.value.second
    : String(draft.value.second ?? 0).padStart(2, '0'),
)
const showPeriod = computed(() => format.value === '12')
const allowedValue = computed(() =>
  isTimeValueAllowed({
    hour: draft.value.hour,
    minute: draft.value.minute,
    ...(props.showSeconds ? { second: draft.value.second ?? 0 } : {}),
  }),
)
const hourAvailability = computed(() => {
  const availability = new Map<number, boolean>()
  if (currentMode.value !== 'dial' || activeView.value !== 'hour') return availability
  for (const item of hours.value) availability.set(item.value, isHourAllowed(item.value))
  return availability
})
const tickAvailability = computed(() => {
  const availability = new Map<number, boolean>()
  if (currentMode.value !== 'dial' || activeView.value === 'hour') return availability
  for (const item of ticks.value) availability.set(item.value, isTickAllowed(item.value))
  return availability
})
const canConfirm = computed(() => allowedValue.value && validationIssue.value === null)
const outerNumeralRadius = computed(() =>
  Math.max(
    0,
    dialGeometry.value.size / 2 - dialGeometry.value.numeralSize / 2 - dialGeometry.value.inset,
  ),
)
const innerNumeralRadius = computed(() =>
  Math.max(0, outerNumeralRadius.value - dialGeometry.value.numeralSize),
)
const outerHandleRadius = computed(() =>
  Math.max(
    0,
    dialGeometry.value.size / 2 - dialGeometry.value.numeralSize / 2 - dialGeometry.value.dialInset,
  ),
)
const innerHandleRadius = computed(() =>
  Math.max(
    0,
    dialGeometry.value.size / 2 -
      dialGeometry.value.numeralSize * 1.5 -
      dialGeometry.value.dialInset,
  ),
)
const angle = computed(() =>
  activeView.value === 'hour'
    ? (format.value === '24' ? Math.floor(draft.value.hour / 2) : draft.value.hour % 12) * 30
    : (activeView.value === 'minute' ? draft.value.minute : (draft.value.second ?? 0)) * 6,
)
const radius = computed(() =>
  activeView.value === 'hour' && format.value === '24' && draft.value.hour % 2 === 0
    ? innerHandleRadius.value
    : outerHandleRadius.value,
)
const selectorPoint = computed(() => ({
  x: dialGeometry.value.size / 2 + Math.sin((angle.value * Math.PI) / 180) * radius.value,
  y: dialGeometry.value.size / 2 - Math.cos((angle.value * Math.PI) / 180) * radius.value,
}))
const panelProps = computed(() => ({
  mode: currentMode.value,
  showModeToggle: props.showModeToggle && !props.hideModeToggle,
  showActions: props.showActions,
  showHeadline: props.showHeadline,
  activeView: activeView.value,
  format: format.value,
  showSeconds: props.showSeconds,
  hour: draft.value.hour,
  minute: draft.value.minute,
  second: draft.value.second ?? 0,
  period: period.value,
  hourText: hourText.value,
  minuteText: minuteText.value,
  secondText: secondText.value,
  hourLabel: messages.value.hour,
  minuteLabel: messages.value.minute,
  secondLabel: messages.value.second,
  periodLabel: messages.value.period ?? periodLabels.value.group,
  periodOptions: [
    { value: 'AM' as const, label: periodLabels.value.am },
    { value: 'PM' as const, label: periodLabels.value.pm },
  ],
  modeToggleLabel: messages.value.modeToggle,
  useDialLabel: messages.value.useDial,
  cancelLabel: messages.value.cancel,
  confirmLabel: messages.value.confirm,
  dialValueLabel: messages.value.dialValue,
  dialLabel: messages.value.dial,
  inputLabel: messages.value.input,
  hideModeToggle: props.hideModeToggle,
  invalid: !allowedValue.value || validationIssue.value !== null,
  error: validationMessage.value,
  errorId,
  canConfirm: canConfirm.value,
  hours: hours.value,
  ticks: ticks.value,
  dialSize: dialGeometry.value.size,
  outerNumeralRadius: outerNumeralRadius.value,
  innerNumeralRadius: innerNumeralRadius.value,
  selectorPoint: selectorPoint.value,
  showPeriod: showPeriod.value,
  useInputOnly: props.inputOnly,
  dialPointerClick,
  startDrag,
  selectorKeydown,
  setView,
  setMode,
  setPeriod,
  setInputPart,
  hourAllowed,
  tickAllowed,
}))

function currentValue(): TimeValue {
  return {
    hour: draft.value.hour,
    minute: draft.value.minute,
    ...(props.showSeconds ? { second: draft.value.second ?? 0 } : {}),
  }
}

function publish(): void {
  const next = currentValue()
  emit('update:modelValue', next)
  emit('change', next)
}

function cssLength(name: string, fallback: number, allowZero = false): number {
  if (!root.value) return fallback
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:0'
  probe.style.width = `var(${name}, ${fallback}px)`
  const styleRoot = root.value.closest<HTMLElement>('.yam3x-time-picker') ?? root.value
  styleRoot.append(probe)
  const size = probe.getBoundingClientRect().width
  probe.remove()
  return Number.isFinite(size) && (size > 0 || (allowZero && size === 0)) ? size : fallback
}

function readDialGeometry(): void {
  if (!root.value) return
  const next = {
    size: cssLength('--_yam3x-time-picker-dial-container-size', 256),
    numeralSize: cssLength('--_yam3x-time-picker-dial-layout-numeral-size', 40),
    inset: cssLength('--_yam3x-time-picker-dial-inset', 4, true),
    dialInset: cssLength('--_yam3x-time-picker-dial-dial-inset', 4, true),
  }
  if (
    Object.keys(next).some(
      (key) => next[key as keyof typeof next] !== dialGeometry.value[key as keyof typeof next],
    )
  )
    dialGeometry.value = next
}

function isTimeValueAllowed(value: TimeValue): boolean {
  const candidate = validateTimeValue(value)
  if (!candidate) return false
  const total = timeToSeconds(candidate)
  const min = minimumTime.value
  const max = maximumTime.value
  return (
    (!min || total >= timeToSeconds(min)) &&
    (!max || total <= timeToSeconds(max)) &&
    (!props.isTimeSelectable || props.isTimeSelectable(candidate))
  )
}

function toHour(value: number): number {
  return format.value === '24' ? value : (value % 12) + (period.value === 'PM' ? 12 : 0)
}

function hourAllowed(value: number): boolean {
  return hourAvailability.value.get(value) ?? false
}

function isHourAllowed(value: number): boolean {
  const hour = toHour(value)
  const minimum = minimumTime.value
  const maximum = maximumTime.value
  const lower = hour * 3600
  const upper = lower + 3599
  if ((minimum && timeToSeconds(minimum) > upper) || (maximum && timeToSeconds(maximum) < lower))
    return false
  if (!props.isTimeSelectable) return true
  for (let minute = 0; minute < 60; minute += 1) {
    if (
      isTimeValueAllowed({
        hour,
        minute,
        second: props.showSeconds ? (draft.value.second ?? 0) : 0,
      })
    )
      return true
  }
  return false
}

function tickAllowed(value: number): boolean {
  return tickAvailability.value.get(value) ?? false
}

function isTickAllowed(value: number): boolean {
  const candidate =
    activeView.value === 'minute'
      ? { hour: draft.value.hour, minute: value, second: 0 }
      : { hour: draft.value.hour, minute: draft.value.minute, second: value }
  return isTimeValueAllowed(candidate)
}

function setHour(value: number, advance = true): void {
  const hour = toHour(value)
  if (!hourAllowed(value)) return
  if (draft.value.hour !== hour) {
    draft.value.hour = hour
    publish()
  }
  if (advance) activeView.value = 'minute'
}

function setTick(value: number): void {
  if (!isTickAllowed(value)) return
  if (activeView.value === 'minute') {
    if (draft.value.minute !== value || draft.value.second !== 0) {
      draft.value.minute = value
      draft.value.second = 0
      publish()
    }
  } else if (draft.value.second !== value) {
    draft.value.second = value
    publish()
  }
}

function setPeriod(next: 'AM' | 'PM'): void {
  const hour = (draft.value.hour % 12) + (next === 'PM' ? 12 : 0)
  if (isTimeValueAllowed({ ...draft.value, hour })) {
    draft.value.hour = hour
    syncInputText()
    publish()
  }
}

function angleToValue(
  point: { x: number; y: number },
  rect: DOMRect,
  view: TimePickerView,
): number {
  const x = point.x - rect.left - rect.width / 2
  const y = point.y - rect.top - rect.height / 2
  const degrees = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360
  return view === 'hour'
    ? format.value === '24' &&
      Math.hypot(x, y) <
        Math.max(0, rect.width / 2 - dialGeometry.value.numeralSize - dialGeometry.value.inset)
      ? (Math.round(degrees / 30) % 12) * 2
      : format.value === '24'
        ? ((Math.round(degrees / 30) % 12) * 2 + 1) % 24
        : Math.round(degrees / 30) % 12 || 12
    : Math.round(degrees / 6) % 60
}

function dragSelect(point: { x: number; y: number }): void {
  if (!dragRect) return
  const radialDistance = Math.hypot(
    point.x - dragRect.left - dragRect.width / 2,
    point.y - dragRect.top - dragRect.height / 2,
  )
  if (dragView.value === 'hour' && radialDistance < 24) return
  const value = angleToValue(point, dragRect, dragView.value)
  if (dragView.value === 'hour') setHour(value, false)
  else {
    activeView.value = dragView.value
    setTick(value)
  }
}

function cancelPendingDrag(): void {
  if (dragFrame) cancelAnimationFrame(dragFrame)
  dragFrame = 0
  pendingDragPoint = null
}

function startDrag(event: PointerEvent): void {
  if (event.button !== 0) return
  cancelPendingDrag()
  dragRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  dragView.value = activeView.value
  dragging.value = true
  dragPointer.value = event.pointerId
  window.addEventListener('pointermove', moveDrag)
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  dragSelect({ x: event.clientX, y: event.clientY })
}

function moveDrag(event: PointerEvent): void {
  if (!dragging.value || dragPointer.value !== event.pointerId) return
  pendingDragPoint = { x: event.clientX, y: event.clientY }
  if (dragFrame) return
  dragFrame = requestAnimationFrame(() => {
    dragFrame = 0
    if (pendingDragPoint) dragSelect(pendingDragPoint)
    pendingDragPoint = null
  })
}

function endDrag(event: PointerEvent): void {
  if (dragPointer.value !== event.pointerId) return
  window.removeEventListener('pointermove', moveDrag)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  cancelPendingDrag()
  dragSelect({ x: event.clientX, y: event.clientY })
  dragging.value = false
  dragPointer.value = null
  dragRect = null
  if (dragView.value === 'hour' && activeView.value === 'hour') activeView.value = 'minute'
}

function dialPointerClick(event: MouseEvent): void {
  if (event.detail !== 0) return
  const target = event.target as HTMLElement
  const value = Number(target.closest<HTMLElement>('[data-dial-value]')?.dataset.dialValue)
  if (!Number.isFinite(value)) return
  if (activeView.value === 'hour') setHour(value)
  else setTick(value)
}

function selectorKeydown(event: KeyboardEvent, kind: TimePickerView): void {
  const delta =
    event.key === 'ArrowUp' || event.key === 'ArrowRight'
      ? 1
      : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
        ? -1
        : 0
  if (!delta) return
  event.preventDefault()
  if (kind === 'hour')
    setHour(
      (displayedHour.value + delta + (format.value === '24' ? 24 : 12)) %
        (format.value === '24' ? 24 : 12) || (format.value === '12' ? 12 : 0),
    )
  else if (kind === 'minute') setTick((draft.value.minute + delta + 60) % 60)
  else setTick(((draft.value.second ?? 0) + delta + 60) % 60)
}

function setInputPart(part: 'hour' | 'minute' | 'second', raw: string): void {
  pendingFormat.value = format.value
  inputText.value[part] = raw
  const number = Number(raw)
  const valid =
    /^\d{1,2}$/.test(raw) &&
    Number.isInteger(number) &&
    number >= (part === 'hour' && format.value === '12' ? 1 : 0) &&
    number <= (part === 'hour' ? (format.value === '12' ? 12 : 23) : 59)
  if (!valid) {
    validationIssue.value = part
    return
  }
  const values = { ...inputText.value }
  const hourValue = Number(values.hour)
  const minuteValue = Number(values.minute)
  const secondValue = Number(values.second || 0)
  const next = {
    hour: format.value === '12' ? (hourValue % 12) + (period.value === 'PM' ? 12 : 0) : hourValue,
    minute: minuteValue,
    second: secondValue,
  }
  const allFieldsValid =
    /^\d{1,2}$/.test(values.hour) &&
    /^\d{1,2}$/.test(values.minute) &&
    (!props.showSeconds || /^\d{1,2}$/.test(values.second))
  if (!allFieldsValid) {
    const missingPart = (['hour', 'minute', 'second'] as const).find(
      (field) => (field === 'second' && !props.showSeconds) || !/^\d{1,2}$/.test(values[field]),
    )
    validationIssue.value = missingPart ?? null
    return
  }
  if (!isTimeValueAllowed(next)) {
    validationIssue.value = 'range'
    return
  }
  validationIssue.value = null
  draft.value = next
  syncInputText()
  publish()
}

function syncInputText(): void {
  const hour = format.value === '12' ? displayedHour.value : draft.value.hour
  inputText.value = {
    hour: String(hour).padStart(2, '0'),
    minute: String(draft.value.minute).padStart(2, '0'),
    second: String(draft.value.second ?? 0).padStart(2, '0'),
  }
}

function setView(view: string): void {
  if (view === 'hour' || view === 'minute' || view === 'second') activeView.value = view
}

function setMode(mode: string): void {
  if (mode === 'cancel') {
    emit('cancel')
    return
  }
  if (mode === 'confirm') {
    if (canConfirm.value) emit('confirm', currentValue())
    return
  }
  if (mode === 'dial' || mode === 'input') {
    currentMode.value = mode
    emit('update:mode', mode)
    activeView.value = 'hour'
    void nextTick(() =>
      root.value
        ?.closest('.yam3x-time-picker__surface')
        ?.querySelector<HTMLElement>(
          mode === 'input'
            ? '.yam3x-time-picker__input-slot input'
            : '.yam3x-time-picker__selector[aria-pressed="true"]',
        )
        ?.focus(),
    )
  }
}

watch(
  () => props.mode,
  (mode) => {
    if (mode) currentMode.value = mode
  },
)
watch(
  () => props.modelValue,
  (value) => {
    if (
      value &&
      (value.hour !== draft.value.hour ||
        value.minute !== draft.value.minute ||
        (value.second ?? 0) !== (draft.value.second ?? 0))
    )
      draft.value = { ...value, second: value.second ?? 0 }
  },
  { deep: true },
)
watch(
  () => [draft.value.hour, draft.value.minute, draft.value.second, format.value] as const,
  () => syncInputText(),
  { immediate: true },
)
watch(format, async () => {
  const document = root.value?.ownerDocument
  const focused = document?.activeElement
  if (!focused || !root.value?.contains(focused)) return
  await nextTick()
  if (document?.activeElement === document?.body)
    root.value
      ?.querySelector<HTMLElement>(
        currentMode.value === 'input'
          ? '.yam3x-time-picker__input-slot input'
          : '.yam3x-time-picker__selector[aria-pressed="true"]',
      )
      ?.focus()
})

watch(dragging, (value) => emit('update:dragging', value))
watch(
  [draft, showPeriod],
  () => {
    validationIssue.value = null
  },
  { deep: true },
)
onMounted(() => {
  readDialGeometry()
  const styleRoot = root.value?.closest('.yam3x-time-picker')
  if (styleRoot && typeof MutationObserver !== 'undefined') {
    geometryObserver = new MutationObserver(readDialGeometry)
    geometryObserver.observe(styleRoot, { attributes: true, attributeFilter: ['style', 'class'] })
  }
})
onBeforeUnmount(() => {
  cancelPendingDrag()
  window.removeEventListener('pointermove', moveDrag)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  geometryObserver?.disconnect()
})
</script>

<template>
  <div
    ref="root"
    class="yam3x-time-picker__control"
    :class="{ 'is-dragging': dragging }"
  >
    <TimePickerPanel v-bind="panelProps" />
  </div>
</template>

<style>
.yam3x-time-picker {
  position: relative;
  display: inline-block;
  color: var(--_yam3x-time-picker-color-on-surface);
  font: inherit;
  --_yam3x-time-picker-modal-container-shape: var(--md-sys-shape-corner-extra-large);
  --_yam3x-time-picker-docked-container-shape: var(--md-sys-shape-corner-medium);
  --_yam3x-time-picker-input-field-container-shape: var(--md-sys-shape-corner-small);
  --_yam3x-time-picker-input-period-toggle-shape: var(--md-sys-shape-corner-small);
  --_yam3x-time-picker-dial-container-size: 256px;
  --_yam3x-time-picker-dial-inset: 4px;
  --_yam3x-time-picker-dial-dial-inset: 4px;
  --_yam3x-time-picker-dial-target-size: 48px;
  --_yam3x-time-picker-action-target-size: 48px;
  --_yam3x-time-picker-dial-center-size: 8px;
  --_yam3x-time-picker-dial-track-width: 2px;
  --_yam3x-time-picker-dial-layout-numeral-size: 40px;
  --_yam3x-time-picker-dial-label-font-size: 16px;
  --_yam3x-time-picker-dial-label-line-height: 24px;
  --_yam3x-time-picker-dial-label-tracking: 0.5px;
  --_yam3x-time-picker-time-selector-width: 96px;
  --_yam3x-time-picker-time-selector-height: 80px;
  --_yam3x-time-picker-time-selector-unselected-container-color: var(
    --_yam3x-time-picker-color-surface-container-highest
  );
  --_yam3x-time-picker-time-selector-label-font-size: 45px;
  --_yam3x-time-picker-time-selector-label-line-height: 52px;
  --_yam3x-time-picker-time-selector-label-tracking: 0;
  --_yam3x-time-picker-input-field-container-width: 96px;
  --_yam3x-time-picker-input-field-height: 72px;
  --_yam3x-time-picker-input-field-font-size: 45px;
  --_yam3x-time-picker-input-field-line-height: 52px;
  --_yam3x-time-picker-input-field-tracking: 0;
  --_yam3x-time-picker-input-field-separator-font-size: 57px;
  --_yam3x-time-picker-input-field-separator-line-height: 64px;
  --_yam3x-time-picker-input-field-separator-tracking: -0.25px;
  --_yam3x-time-picker-input-period-toggle-vertical-width: 52px;
  --_yam3x-time-picker-input-period-toggle-dial-height: 80px;
  --_yam3x-time-picker-input-period-toggle-horizontal-width: 216px;
  --_yam3x-time-picker-input-period-toggle-horizontal-height: 38px;
  --_yam3x-time-picker-input-period-toggle-field-height: 72px;
  --_yam3x-time-picker-input-period-toggle-label-font-size: 16px;
  --_yam3x-time-picker-input-period-toggle-label-line-height: 24px;
  --_yam3x-time-picker-input-period-toggle-label-tracking: 0.15px;
  --_yam3x-time-picker-headline-font-size: 12px;
  --_yam3x-time-picker-headline-font-weight: 500;
  --_yam3x-time-picker-headline-line-height: 16px;
  --_yam3x-time-picker-headline-tracking: 0.5px;
  --_yam3x-time-picker-color-error: var(--md-sys-color-error);
  --_yam3x-time-picker-color-error-container: var(--md-sys-color-error-container);
  --_yam3x-time-picker-color-on-error-container: var(--md-sys-color-on-error-container);
  --_yam3x-time-picker-color-on-primary: var(--md-sys-color-on-primary);
  --_yam3x-time-picker-color-on-primary-container: var(--md-sys-color-on-primary-container);
  --_yam3x-time-picker-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-time-picker-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-time-picker-color-on-tertiary-container: var(--md-sys-color-on-tertiary-container);
  --_yam3x-time-picker-color-outline: var(--md-sys-color-outline);
  --_yam3x-time-picker-color-outline-variant: var(--md-sys-color-outline-variant);
  --_yam3x-time-picker-color-primary: var(--md-sys-color-primary);
  --_yam3x-time-picker-color-primary-container: var(--md-sys-color-primary-container);
  --_yam3x-time-picker-color-scrim: var(--md-sys-color-scrim);
  --_yam3x-time-picker-color-surface-container-high: var(--md-sys-color-surface-container-high);
  --_yam3x-time-picker-color-surface-container-highest: var(
    --md-sys-color-surface-container-highest
  );
  --_yam3x-time-picker-color-tertiary-container: var(--md-sys-color-tertiary-container);
  --_yam3x-time-picker-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-time-picker-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
}
.yam3x-time-picker__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  min-width: 200px;
  min-height: 56px;
  padding: 0 calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  border: 1px solid var(--_yam3x-time-picker-color-outline);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.yam3x-time-picker__trigger:disabled {
  opacity: 0.38;
  cursor: default;
}
.yam3x-time-picker__trigger-icon {
  font-size: 20px;
}
.yam3x-time-picker__scrim {
  --_yam3x-time-picker-scrim-color: var(--_yam3x-time-picker-color-scrim);
  --_yam3x-time-picker-scrim-opacity: var(--_yam3x-overlay-scrim-opacity);
  position: fixed;
  z-index: 1100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  background: color-mix(
    in srgb,
    var(--_yam3x-time-picker-scrim-color) var(--_yam3x-time-picker-scrim-opacity),
    transparent
  );
}
.yam3x-time-picker-modal-enter-active,
.yam3x-time-picker-modal-leave-active {
  transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
}
.yam3x-time-picker-modal-enter-from,
.yam3x-time-picker-modal-leave-to {
  opacity: 0;
}
.yam3x-time-picker-modal-enter-active .yam3x-time-picker__surface,
.yam3x-time-picker-modal-leave-active .yam3x-time-picker__surface {
  transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
}
.yam3x-time-picker-modal-enter-from .yam3x-time-picker__surface,
.yam3x-time-picker-modal-leave-to .yam3x-time-picker__surface {
  transform: scale(0.96);
}
.yam3x-time-picker__surface {
  box-sizing: border-box;
  width: max-content;
  max-width: min(640px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  max-height: calc(100dvh - 32px);
  overflow: auto;
  padding: calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  border: 0;
  border-radius: var(--_yam3x-time-picker-modal-container-shape);
  background: var(
    --_yam3x-time-picker-modal-container-color,
    var(
      --_yam3x-time-picker-container-color,
      var(--_yam3x-time-picker-color-surface-container-high)
    )
  );
  box-shadow: var(--_yam3x-time-picker-container-elevation, 0 4px 8px 3px rgb(0 0 0 / 15%));
  color: inherit;
}
.yam3x-time-picker__surface.is-vibrant {
  border-radius: var(--_yam3x-time-picker-vibrant-container-shape, 36px);
  background: var(
    --_yam3x-time-picker-vibrant-container-color,
    var(--_yam3x-time-picker-color-surface-container-high)
  );
}
.yam3x-time-picker__surface--docked {
  position: absolute;
  z-index: 30;
  inset-block-start: calc(100% + 8px);
  inset-inline-start: 0;
  border-radius: var(--_yam3x-time-picker-docked-container-shape);
  background: var(
    --_yam3x-time-picker-docked-container-color,
    var(
      --_yam3x-time-picker-container-color,
      var(--_yam3x-time-picker-color-surface-container-high)
    )
  );
}
.yam3x-time-picker__content {
  display: grid;
  gap: calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  min-width: 308px;
}
.yam3x-time-picker__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__header-value {
  display: flex;
  align-items: center;
  gap: calc(4px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__selector {
  width: var(--_yam3x-time-picker-time-selector-width);
  height: var(--_yam3x-time-picker-time-selector-height);
  border: 0;
  border-radius: 8px;
  background: var(--_yam3x-time-picker-time-selector-unselected-container-color);
  color: var(--_yam3x-time-picker-color-on-surface);
  font-size: var(--_yam3x-time-picker-time-selector-label-font-size);
  line-height: var(--_yam3x-time-picker-time-selector-label-line-height);
  letter-spacing: var(--_yam3x-time-picker-time-selector-label-tracking);
  cursor: pointer;
}
.yam3x-time-picker__selector[aria-pressed='true'] {
  background: var(--_yam3x-time-picker-color-primary-container);
  color: var(--_yam3x-time-picker-color-on-primary-container);
}
.yam3x-time-picker__mode-toggle {
  display: grid;
  place-items: center;
  width: var(--_yam3x-time-picker-action-target-size);
  height: var(--_yam3x-time-picker-action-target-size);
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--_yam3x-time-picker-color-on-surface-variant);
  font-size: 20px;
  cursor: pointer;
}
/* Keep the dial in a fixed-size layout slot while the selected unit changes. */
.yam3x-time-picker__dial-wrap {
  position: relative;
  width: var(--_yam3x-time-picker-dial-container-size);
  height: var(--_yam3x-time-picker-dial-container-size);
}
.yam3x-time-picker__dial {
  position: absolute;
  inset: 0;
  flex: none;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(
    --_yam3x-time-picker-dial-container-color,
    var(--_yam3x-time-picker-color-surface-container-highest)
  );
  touch-action: none;
  user-select: none;
}
.yam3x-time-picker__view-content {
  display: flex;
  align-items: center;
  gap: calc(4px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  animation: yam3x-time-picker-view-enter 180ms cubic-bezier(0.2, 0, 0, 1) both;
}
.yam3x-time-picker__dial {
  animation: yam3x-time-picker-dial-enter 180ms cubic-bezier(0.2, 0, 0, 1) both;
}
@keyframes yam3x-time-picker-view-enter {
  from {
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes yam3x-time-picker-dial-enter {
  from {
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.yam3x-time-picker__dial::before {
  content: '';
  position: absolute;
  inset: 50%;
  width: 2px;
  height: var(--_yam3x-time-picker-dial-container-size);
  background: var(--_yam3x-time-picker-color-outline-variant);
  transform: translate(-50%, -50%);
  border-radius: 2px;
  pointer-events: none;
}
.yam3x-time-picker__track {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.yam3x-time-picker__track line {
  stroke: var(--_yam3x-time-picker-dial-handle-color, var(--_yam3x-time-picker-color-primary));
  stroke-width: 2;
}
.yam3x-time-picker__dial-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--_yam3x-time-picker-dial-center-size);
  height: var(--_yam3x-time-picker-dial-center-size);
  border-radius: 50%;
  background: var(--_yam3x-time-picker-dial-handle-color, var(--_yam3x-time-picker-color-primary));
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.yam3x-time-picker__dial-selector {
  position: absolute;
  width: var(--_yam3x-time-picker-dial-target-size);
  height: var(--_yam3x-time-picker-dial-target-size);
  border-radius: 50%;
  background: var(--_yam3x-time-picker-dial-handle-color, var(--_yam3x-time-picker-color-primary));
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.yam3x-time-picker__dial-item {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  width: var(--_yam3x-time-picker-dial-target-size);
  height: var(--_yam3x-time-picker-dial-target-size);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--_yam3x-time-picker-color-on-surface);
  font-size: var(--_yam3x-time-picker-dial-label-font-size);
  line-height: var(--_yam3x-time-picker-dial-label-line-height);
  letter-spacing: var(--_yam3x-time-picker-dial-label-tracking);
  cursor: pointer;
  transform: translate(-50%, -50%);
}
.yam3x-time-picker__dial-item[aria-pressed='true'] {
  color: var(--_yam3x-time-picker-color-on-primary);
}
.yam3x-time-picker__dial-item:hover:not(:disabled) {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-time-picker__dial-item:disabled {
  opacity: 0.38;
  cursor: default;
}
.yam3x-time-picker__input {
  display: grid;
  gap: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  min-height: 256px;
  align-content: center;
}
.yam3x-time-picker__fields {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: calc(4px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__input-slot {
  display: grid;
  gap: calc(4px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  text-align: center;
}
.yam3x-time-picker__input-label {
  color: var(--_yam3x-time-picker-color-on-surface-variant);
  font-size: 12px;
  line-height: calc((16px) * var(--_yam3x-time-picker-line-height-scale, 1.07));
}
.yam3x-time-picker__separator {
  align-self: flex-start;
  margin-block-start: calc(20px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__period {
  margin-block-start: calc(20px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__input-slot input {
  box-sizing: border-box;
  width: var(--_yam3x-time-picker-input-field-container-width);
  height: var(--_yam3x-time-picker-input-field-height);
  border: 0;
  border-radius: var(--_yam3x-time-picker-input-field-container-shape);
  outline: 0;
  background: var(
    --_yam3x-time-picker-input-field-unselected-container-color,
    var(--_yam3x-time-picker-color-surface-container-highest)
  );
  color: inherit;
  font: inherit;
  font-size: var(--_yam3x-time-picker-input-field-font-size);
  text-align: center;
}
.yam3x-time-picker__input-slot input:focus {
  outline: 2px solid var(--_yam3x-time-picker-color-primary);
  outline-offset: 2px;
  background: var(--_yam3x-time-picker-color-primary-container);
}
.yam3x-time-picker__separator {
  font-size: var(--_yam3x-time-picker-input-field-separator-font-size);
  line-height: var(--_yam3x-time-picker-input-field-separator-line-height);
  letter-spacing: var(--_yam3x-time-picker-input-field-separator-tracking);
}
.yam3x-time-picker__period {
  display: grid;
  gap: calc(4px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  margin-inline-start: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__period button {
  width: 52px;
  height: 38px;
  border: 1px solid var(--_yam3x-time-picker-color-outline);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.yam3x-time-picker__period button[aria-checked='true'] {
  background: var(--_yam3x-time-picker-color-tertiary-container);
  color: var(--_yam3x-time-picker-color-on-tertiary-container);
}
.yam3x-time-picker__error {
  margin: 0;
  color: var(--_yam3x-time-picker-color-error);
  font-size: 12px;
}
.yam3x-time-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  padding-block-start: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__action {
  min-width: 64px;
  min-height: 48px;
  padding: 0 calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: var(--_yam3x-time-picker-color-primary);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}
.yam3x-time-picker__action:hover:not(:disabled),
.yam3x-time-picker__mode-toggle:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-time-picker__action--confirm {
  background: var(--_yam3x-time-picker-color-primary);
  color: var(--_yam3x-time-picker-color-on-primary);
}
.yam3x-time-picker__action:disabled {
  opacity: 0.38;
  cursor: default;
}
.yam3x-time-picker button:focus-visible,
.yam3x-time-picker input:focus-visible,
.yam3x-time-picker__surface button:focus-visible,
.yam3x-time-picker__surface input:focus-visible {
  outline: 2px solid var(--_yam3x-time-picker-color-primary);
  outline-offset: 2px;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__content {
  grid-template-columns: auto auto;
  align-items: center;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__header {
  grid-column: 1 / -1;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__actions {
  grid-column: 1 / -1;
}
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__dial {
  display: none;
}
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__input {
  display: grid;
}
html.yam3x-time-picker-scroll-lock {
  overflow: hidden;
}
@media (max-width: 599px) {
  .yam3x-time-picker__scrim {
    padding: 0;
    place-items: stretch;
  }
  .yam3x-time-picker__surface--modal {
    width: 100%;
    max-width: none;
    max-height: 100vh;
    max-height: 100dvh;
    height: 100%;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1))
      max(
        calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1)),
        env(safe-area-inset-right)
      )
      max(
        calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1)),
        env(safe-area-inset-bottom)
      )
      max(
        calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1)),
        env(safe-area-inset-left)
      );
  }
  .yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__content {
    grid-template-columns: 1fr;
  }
  .yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__header,
  .yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__actions {
    grid-column: auto;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-time-picker * {
    scroll-behavior: auto !important;
    transition: none !important;
    animation: none !important;
  }
}
@media (forced-colors: active) {
  .yam3x-time-picker__surface {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
  .yam3x-time-picker__selector[aria-pressed='true'],
  .yam3x-time-picker__dial-item[aria-pressed='true'],
  .yam3x-time-picker__period button[aria-checked='true'] {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
  .yam3x-time-picker__dial:before,
  .yam3x-time-picker__track line {
    stroke: CanvasText;
    background: CanvasText;
  }
  .yam3x-time-picker__dial-center,
  .yam3x-time-picker__dial-selector {
    background: Highlight;
  }
}
.yam3x-time-picker__dial::before {
  display: none;
}
.yam3x-time-picker__surface.is-24-hour .yam3x-time-picker__selector:first-child {
  width: 114px;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__period {
  display: flex;
  width: 216px;
  height: 38px;
  margin-inline-start: 0;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__period button {
  width: 50%;
  height: 38px;
}
.yam3x-time-picker__surface.is-input-mode .yam3x-time-picker__period {
  height: 72px;
  align-content: stretch;
  gap: 0;
}
.yam3x-time-picker__surface.is-input-mode .yam3x-time-picker__period button {
  height: 36px;
}
.yam3x-time-picker__mode-toggle .yam3x-icon {
  width: 24px;
  height: 24px;
  font-size: 24px;
}
.yam3x-time-picker__trigger-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
  flex: none;
}
.yam3x-time-picker__surface {
  padding-block: var(
    --_yam3x-time-picker-container-padding-block,
    calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
  padding-inline: var(
    --_yam3x-time-picker-container-padding-inline,
    calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__content {
  gap: var(
    --_yam3x-time-picker-actions-space,
    calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__surface--docked {
  position: fixed;
  inset: auto;
  max-width: min(640px, calc(100vw - 16px));
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__header {
  grid-column: auto;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__content {
  justify-content: center;
}
.yam3x-time-picker__action--confirm {
  background: transparent;
  color: var(--_yam3x-time-picker-color-primary);
}
.yam3x-time-picker__selector:hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-primary)
      )
      8%,
    var(--_yam3x-time-picker-color-primary-container)
  );
}
.yam3x-time-picker__selector:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-primary)
      )
      12%,
    var(--_yam3x-time-picker-color-primary-container)
  );
}
.yam3x-time-picker__selector:focus-visible {
  outline-color: var(
    --_yam3x-time-picker-input-field-selected-focus-state-layer-color,
    var(--_yam3x-time-picker-color-primary)
  );
}
.yam3x-time-picker__input-slot input:hover:not(:focus) {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-unselected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      8%,
    var(
      --_yam3x-time-picker-input-field-unselected-container-color,
      var(--_yam3x-time-picker-color-surface-container-highest)
    )
  );
}
.yam3x-time-picker__input-slot input:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-unselected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-unselected-container-color,
      var(--_yam3x-time-picker-color-surface-container-highest)
    )
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true'] {
  outline-color: var(--_yam3x-time-picker-color-error);
}
.yam3x-time-picker__input-slot input[aria-invalid='true']:hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-invalid-hover-state-layer-color,
        var(--_yam3x-time-picker-color-error)
      )
      8%,
    var(--_yam3x-time-picker-color-surface-container-highest)
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true']:focus {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-invalid-focus-state-layer-color,
        var(--_yam3x-time-picker-color-error)
      )
      12%,
    var(--_yam3x-time-picker-color-surface-container-highest)
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true']:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-invalid-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-error)
      )
      12%,
    var(--_yam3x-time-picker-color-surface-container-highest)
  );
}
.yam3x-time-picker__surface.is-24-hour .yam3x-time-picker__selector:first-child {
  width: 114px;
}
.yam3x-time-picker__dial-selector {
  transition:
    left 160ms cubic-bezier(0.2, 0, 0, 1),
    top 160ms cubic-bezier(0.2, 0, 0, 1);
}
.yam3x-time-picker__mode-toggle .yam3x-icon {
  width: 24px;
  height: 24px;
  font-size: 24px;
}
.yam3x-time-picker__content {
  gap: 0;
}
.yam3x-time-picker__headline {
  margin-block-start: var(
    --_yam3x-time-picker-headline-top-space,
    calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
  color: var(
    --_yam3x-time-picker-headline-color,
    var(--_yam3x-time-picker-color-on-surface-variant)
  );
  font-size: 14px;
  font-weight: 500;
  line-height: calc((20px) * var(--_yam3x-time-picker-line-height-scale, 1.07));
  letter-spacing: 0.1px;
}
.yam3x-time-picker__header {
  margin-block-start: var(
    --_yam3x-time-picker-label-input-space,
    calc(20px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__dial-wrap {
  margin-block-start: var(
    --_yam3x-time-picker-vertical-input-dial-space,
    calc(36px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__input {
  margin-block-start: var(
    --_yam3x-time-picker-label-input-space,
    calc(20px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__actions {
  margin-block-start: var(
    --_yam3x-time-picker-actions-space,
    calc(24px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__headline,
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__actions {
  grid-column: 1 / -1;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__header {
  width: 280px;
  margin-block-start: var(
    --_yam3x-time-picker-label-input-space,
    calc(20px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
  align-items: flex-start;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__header-value {
  width: 216px;
  max-width: 216px;
  flex-wrap: wrap;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__period {
  flex: 0 0 216px;
  margin: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1)) 0 0;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__mode-toggle {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__dial-wrap {
  margin-block-start: 0;
  margin-inline-start: var(
    --_yam3x-time-picker-horizontal-input-dial-space,
    calc(52px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__surface.is-horizontal .yam3x-time-picker__input {
  margin-block-start: var(
    --_yam3x-time-picker-label-input-space,
    calc(20px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__period button[aria-checked='true'] {
  outline: 1px solid var(--_yam3x-time-picker-color-outline);
  outline-offset: -1px;
}
.yam3x-time-picker__surface.is-dragging .yam3x-time-picker__dial-selector {
  transition: none;
}
.yam3x-time-picker__selector[aria-pressed='true']:hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-primary)
      )
      8%,
    var(--_yam3x-time-picker-color-primary-container)
  );
}
.yam3x-time-picker__selector:not([aria-pressed='true']):hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-unselected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      8%,
    var(
      --_yam3x-time-picker-input-field-unselected-container-color,
      var(--_yam3x-time-picker-color-surface-container-highest)
    )
  );
}
.yam3x-time-picker__selector[aria-pressed='true']:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-primary)
      )
      12%,
    var(--_yam3x-time-picker-color-primary-container)
  );
}
.yam3x-time-picker__selector:not([aria-pressed='true']):active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-unselected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-unselected-container-color,
      var(--_yam3x-time-picker-color-surface-container-highest)
    )
  );
}
.yam3x-time-picker__input-slot input:focus:not([aria-invalid='true']) {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-unselected-focus-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-unselected-container-color,
      var(--_yam3x-time-picker-color-surface-container-highest)
    )
  );
}
.yam3x-time-picker__input-slot input:active:not([aria-invalid='true']) {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-unselected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-unselected-container-color,
      var(--_yam3x-time-picker-color-surface-container-highest)
    )
  );
}
.yam3x-time-picker__surface.is-input-only {
  padding-block: calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__headline {
  margin-block-start: 0;
}
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__header,
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__input,
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__actions {
  margin-block-start: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__input {
  min-height: 0;
}
.yam3x-time-picker__surface.is-input-only .yam3x-time-picker__actions {
  padding-block-start: 0;
}
.yam3x-time-picker__selector[aria-pressed='true']:focus-visible {
  outline-color: var(
    --_yam3x-time-picker-input-field-selected-focus-state-layer-color,
    var(--_yam3x-time-picker-color-primary)
  );
}
.yam3x-time-picker__selector:not([aria-pressed='true']):focus-visible {
  outline-color: var(
    --_yam3x-time-picker-input-field-unselected-focus-state-layer-color,
    var(--_yam3x-time-picker-color-primary)
  );
}
.yam3x-time-picker__time-selectors {
  display: flex;
  align-items: center;
  gap: calc(4px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__surface:dir(rtl):not(.is-input-mode)
  .yam3x-time-picker__time-selectors
  .yam3x-time-picker__period {
  order: -1;
  margin-inline-start: 0;
  margin-inline-end: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
}
.yam3x-time-picker__input-controls {
  display: flex;
  align-items: center;
  gap: calc(8px * var(--_yam3x-time-picker-density-spacing-scale, 1));
  flex-wrap: wrap;
}
.yam3x-time-picker__input-controls .yam3x-time-picker__period {
  width: 52px;
  height: 72px;
  margin: 0;
  gap: 0;
  align-content: stretch;
}
.yam3x-time-picker__input-controls .yam3x-time-picker__period button {
  width: 52px;
  height: 36px;
}
.yam3x-time-picker__surface.is-input-mode .yam3x-time-picker__input {
  display: block;
  min-height: 0;
  gap: 0;
  align-content: initial;
  margin-block-start: 0;
}
.yam3x-time-picker__surface.is-horizontal.is-input-mode .yam3x-time-picker__input,
.yam3x-time-picker__surface.is-horizontal.is-input-mode .yam3x-time-picker__input-controls {
  width: 216px;
}
.yam3x-time-picker__surface.is-horizontal.is-input-mode .yam3x-time-picker__period {
  display: grid;
  width: var(--_yam3x-time-picker-input-period-toggle-vertical-width);
  height: var(--_yam3x-time-picker-input-period-toggle-field-height);
  flex: 0 0 var(--_yam3x-time-picker-input-period-toggle-vertical-width);
  margin: 0;
  gap: 0;
}
.yam3x-time-picker__surface.is-horizontal.is-input-mode .yam3x-time-picker__period button {
  width: 52px;
  height: 36px;
}
.yam3x-time-picker__dial {
  border-radius: var(--_yam3x-time-picker-dial-container-shape, 50%);
}
.yam3x-time-picker__track line {
  stroke-width: var(--_yam3x-time-picker-dial-track-width);
}
.yam3x-time-picker__dial-center {
  width: var(--_yam3x-time-picker-dial-center-size);
  height: var(--_yam3x-time-picker-dial-center-size);
}
.yam3x-time-picker__dial-selector {
  width: var(--_yam3x-time-picker-dial-target-size);
  height: var(--_yam3x-time-picker-dial-target-size);
  border-radius: var(--_yam3x-time-picker-dial-numeral-shape, 50%);
  background: var(--_yam3x-time-picker-dial-handle-color, var(--_yam3x-time-picker-color-primary));
}
.yam3x-time-picker__dial-selector::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--_yam3x-time-picker-dial-handle-center-size, 4px);
  height: var(--_yam3x-time-picker-dial-handle-center-size, 4px);
  border-radius: 50%;
  background: var(
    --_yam3x-time-picker-dial-numeral-active-color,
    var(--_yam3x-time-picker-color-on-primary)
  );
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.yam3x-time-picker__dial-selector.is-disabled::after {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-dial-numeral-disabled-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      var(--_yam3x-time-picker-dial-numeral-disabled-opacity, 38%),
    transparent
  );
}
.yam3x-time-picker__dial-selector.is-disabled,
.yam3x-time-picker__dial-center.is-disabled {
  background: color-mix(
    in srgb,
    var(--_yam3x-time-picker-dial-handle-disabled-color, var(--_yam3x-time-picker-color-on-surface))
      var(--_yam3x-time-picker-dial-handle-disabled-opacity, 10%),
    transparent
  );
}
.yam3x-time-picker__dial-item {
  border-radius: var(--_yam3x-time-picker-dial-numeral-shape, 50%);
  color: var(--_yam3x-time-picker-dial-numeral-color, var(--_yam3x-time-picker-color-on-surface));
  font-size: var(--_yam3x-time-picker-dial-label-font-size);
  font-weight: var(--_yam3x-time-picker-dial-numeral-font-weight, 400);
  line-height: calc(
    (var(--_yam3x-time-picker-dial-numeral-line-height, 20px)) *
      var(--_yam3x-time-picker-line-height-scale, 1.07)
  );
  letter-spacing: var(--_yam3x-time-picker-dial-numeral-tracking, 0.1px);
}
.yam3x-time-picker__dial-item.is-inner {
  font-size: var(--_yam3x-time-picker-dial-inner-numeral-font-size, 12px);
  font-weight: var(--_yam3x-time-picker-dial-inner-numeral-font-weight, 400);
  line-height: calc(
    (var(--_yam3x-time-picker-dial-inner-numeral-line-height, 16px)) *
      var(--_yam3x-time-picker-line-height-scale, 1.07)
  );
  letter-spacing: var(--_yam3x-time-picker-dial-inner-numeral-tracking, 0.4px);
}
.yam3x-time-picker__dial-item[aria-pressed='true']:not(:disabled) {
  color: var(
    --_yam3x-time-picker-dial-numeral-active-color,
    var(--_yam3x-time-picker-color-on-primary)
  );
}
.yam3x-time-picker__dial-item:disabled {
  opacity: 1;
  color: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-dial-numeral-disabled-color,
        var(--_yam3x-time-picker-color-on-surface)
      )
      var(--_yam3x-time-picker-dial-numeral-disabled-opacity, 38%),
    transparent
  );
}
.yam3x-time-picker__headline {
  font-size: var(--_yam3x-time-picker-headline-font-size);
  font-weight: var(--_yam3x-time-picker-headline-font-weight, 500);
  line-height: var(--_yam3x-time-picker-headline-line-height);
  letter-spacing: var(--_yam3x-time-picker-headline-tracking, 0.1px);
}
.yam3x-time-picker__input-slot input {
  font-weight: var(--_yam3x-time-picker-input-field-font-weight, 400);
  line-height: var(--_yam3x-time-picker-input-field-line-height);
  letter-spacing: var(--_yam3x-time-picker-input-field-tracking, 0);
}
.yam3x-time-picker__input-slot input:not(:focus):not([aria-invalid='true']) {
  color: var(
    --_yam3x-time-picker-input-field-label-unselected-color,
    var(--_yam3x-time-picker-color-on-surface)
  );
}
.yam3x-time-picker__input-slot input:focus:not([aria-invalid='true']) {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-focus-state-layer-color,
        var(--_yam3x-time-picker-color-on-primary-container)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-selected-container-color,
      var(--_yam3x-time-picker-color-primary-container)
    )
  );
  color: var(
    --_yam3x-time-picker-input-field-label-selected-color,
    var(--_yam3x-time-picker-color-on-primary-container)
  );
}
.yam3x-time-picker__input-slot input:focus:not([aria-invalid='true']):hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-on-primary-container)
      )
      8%,
    var(
      --_yam3x-time-picker-input-field-selected-container-color,
      var(--_yam3x-time-picker-color-primary-container)
    )
  );
}
.yam3x-time-picker__input-slot input:focus:not([aria-invalid='true']):active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-selected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-on-primary-container)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-selected-container-color,
      var(--_yam3x-time-picker-color-primary-container)
    )
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true'] {
  background: var(
    --_yam3x-time-picker-input-field-invalid-container-color,
    var(--_yam3x-time-picker-color-error-container)
  );
  color: var(
    --_yam3x-time-picker-input-field-label-invalid-color,
    var(--_yam3x-time-picker-color-on-error-container)
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true']:hover:not(:focus) {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-invalid-hover-state-layer-color,
        var(--_yam3x-time-picker-color-error)
      )
      8%,
    var(
      --_yam3x-time-picker-input-field-invalid-container-color,
      var(--_yam3x-time-picker-color-error-container)
    )
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true']:focus {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-invalid-focus-state-layer-color,
        var(--_yam3x-time-picker-color-error)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-invalid-container-color,
      var(--_yam3x-time-picker-color-error-container)
    )
  );
}
.yam3x-time-picker__input-slot input[aria-invalid='true']:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-field-invalid-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-error)
      )
      12%,
    var(
      --_yam3x-time-picker-input-field-invalid-container-color,
      var(--_yam3x-time-picker-color-error-container)
    )
  );
}
.yam3x-time-picker__input-controls {
  column-gap: var(
    --_yam3x-time-picker-input-horizontal-period-toggle-space,
    calc(12px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
  row-gap: var(
    --_yam3x-time-picker-input-vertical-period-toggle-space,
    calc(16px * var(--_yam3x-time-picker-density-spacing-scale, 1))
  );
}
.yam3x-time-picker__separator {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--_yam3x-time-picker-input-field-separator-width, 24px);
  height: var(--_yam3x-time-picker-input-field-height);
  color: var(
    --_yam3x-time-picker-input-field-separator-color,
    var(--_yam3x-time-picker-color-on-surface)
  );
  font-size: var(--_yam3x-time-picker-input-field-separator-font-size);
  font-weight: var(--_yam3x-time-picker-input-field-separator-font-weight, 400);
  line-height: var(--_yam3x-time-picker-input-field-separator-line-height);
  letter-spacing: var(--_yam3x-time-picker-input-field-separator-tracking);
}
.yam3x-time-picker__surface .yam3x-time-picker__error {
  color: var(
    --_yam3x-time-picker-input-field-supporting-text-color,
    var(--_yam3x-time-picker-color-error)
  );
  font-size: var(--_yam3x-time-picker-input-field-supporting-text-font-size, 12px);
  font-weight: var(--_yam3x-time-picker-input-field-supporting-text-font-weight, 400);
  line-height: calc(
    (var(--_yam3x-time-picker-input-field-supporting-text-line-height, 16px)) *
      var(--_yam3x-time-picker-line-height-scale, 1.07)
  );
  letter-spacing: var(--_yam3x-time-picker-input-field-supporting-text-tracking, 0.4px);
}
.yam3x-time-picker__period {
  box-sizing: border-box;
  width: var(--_yam3x-time-picker-input-period-toggle-vertical-width);
  height: var(--_yam3x-time-picker-input-period-toggle-dial-height);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  margin-inline-start: 0;
  gap: 0;
  border: var(--_yam3x-time-picker-input-period-toggle-outline-thickness, 1px) solid
    var(
      --_yam3x-time-picker-input-period-toggle-outline-color,
      var(--_yam3x-time-picker-color-outline)
    );
  border-radius: var(--_yam3x-time-picker-input-period-toggle-shape);
  overflow: hidden;
}
.yam3x-time-picker__period button {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0;
  font-size: var(--_yam3x-time-picker-input-period-toggle-label-font-size);
  font-weight: var(--_yam3x-time-picker-input-period-toggle-label-font-weight, 500);
  line-height: var(--_yam3x-time-picker-input-period-toggle-label-line-height);
  letter-spacing: var(--_yam3x-time-picker-input-period-toggle-label-tracking);
}
.yam3x-time-picker__period button[aria-checked='true'] {
  background: var(
    --_yam3x-time-picker-input-period-toggle-selected-container-color,
    var(--_yam3x-time-picker-color-tertiary-container)
  );
  color: var(
    --_yam3x-time-picker-input-period-toggle-selected-label-color,
    var(--_yam3x-time-picker-color-on-tertiary-container)
  );
}
.yam3x-time-picker__period button[aria-checked='false'] {
  color: var(
    --_yam3x-time-picker-input-period-toggle-unselected-label-color,
    var(--_yam3x-time-picker-color-on-surface-variant)
  );
}
.yam3x-time-picker__period button[aria-checked='true']:hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-period-toggle-selected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-on-tertiary-container)
      )
      8%,
    var(
      --_yam3x-time-picker-input-period-toggle-selected-container-color,
      var(--_yam3x-time-picker-color-tertiary-container)
    )
  );
}
.yam3x-time-picker__period button[aria-checked='false']:hover {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-period-toggle-unselected-hover-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface-variant)
      )
      8%,
    transparent
  );
}
.yam3x-time-picker__period button[aria-checked='true']:focus {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-period-toggle-selected-focus-state-layer-color,
        var(--_yam3x-time-picker-color-on-tertiary-container)
      )
      12%,
    var(
      --_yam3x-time-picker-input-period-toggle-selected-container-color,
      var(--_yam3x-time-picker-color-tertiary-container)
    )
  );
}
.yam3x-time-picker__period button[aria-checked='false']:focus {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-period-toggle-unselected-focus-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface-variant)
      )
      12%,
    transparent
  );
}
.yam3x-time-picker__period button[aria-checked='true']:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-period-toggle-selected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-on-tertiary-container)
      )
      12%,
    var(
      --_yam3x-time-picker-input-period-toggle-selected-container-color,
      var(--_yam3x-time-picker-color-tertiary-container)
    )
  );
}
.yam3x-time-picker__period button[aria-checked='false']:active {
  background: color-mix(
    in srgb,
    var(
        --_yam3x-time-picker-input-period-toggle-unselected-pressed-state-layer-color,
        var(--_yam3x-time-picker-color-on-surface-variant)
      )
      12%,
    transparent
  );
}
.yam3x-time-picker__surface.is-horizontal:not(.is-input-mode) .yam3x-time-picker__period {
  width: var(--_yam3x-time-picker-input-period-toggle-horizontal-width);
  height: var(--_yam3x-time-picker-input-period-toggle-horizontal-height);
  flex: 0 0 var(--_yam3x-time-picker-input-period-toggle-horizontal-width);
  flex-direction: row;
  border-radius: var(--_yam3x-time-picker-input-period-toggle-shape);
}
.yam3x-time-picker__surface.is-horizontal:not(.is-input-mode) .yam3x-time-picker__time-selectors {
  width: var(--_yam3x-time-picker-input-period-toggle-horizontal-width);
  max-width: var(--_yam3x-time-picker-input-period-toggle-horizontal-width);
  flex-wrap: wrap;
}
.yam3x-time-picker__surface.is-horizontal:not(.is-input-mode) .yam3x-time-picker__period button {
  width: 50%;
  height: 100%;
}
.yam3x-time-picker__surface.is-input-mode .yam3x-time-picker__period {
  width: var(--_yam3x-time-picker-input-period-toggle-vertical-width);
  height: var(--_yam3x-time-picker-input-period-toggle-field-height);
}

.yam3x-time-picker__control {
  display: contents;
}
.yam3x-time-picker__surface--inline {
  width: max-content;
  max-width: none;
  max-height: none;
  overflow: visible;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.yam3x-time-picker__surface--inline .yam3x-time-picker__content {
  min-width: 0;
}
</style>
