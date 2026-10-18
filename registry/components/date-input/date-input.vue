<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import Icon from '../icon/icon.vue'
import { useComponentLocale } from '../localization/context'
import english from '../localization/locales/en-US'
import {
  dateFromSegments,
  getDateInputSegmentLabel,
  getDateInputParts,
  getSegmentDisplayValue,
  parseTimeBound,
  resolveTimeFormat,
  type DateInputSegment,
  type DateInputTimeFormat,
  type DateInputType,
} from './date-input.utils'

type TimeParts = { hour: number; minute: number; second?: number }
type SegmentLabel = Partial<Record<DateInputSegment, string>>

const props = withDefaults(
  defineProps<{
    modelValue?: Date | null
    /** m3e-compatible controlled-value alias. */
    value?: Date | null
    type?: DateInputType
    showSeconds?: boolean
    timeFormat?: DateInputTimeFormat
    minDate?: Date | null
    maxDate?: Date | null
    minTime?: string | TimeParts | null
    maxTime?: string | TimeParts | null
    isDateSelectable?: (date: Date) => boolean
    isTimeSelectable?: (time: TimeParts) => boolean
    blackoutDates?: (date: Date) => boolean
    blackoutTimes?: (time: TimeParts) => boolean
    label?: string
    labels?: SegmentLabel
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    name?: string
    locale?: string
    requiredMessage?: string
    invalidMessage?: string
  }>(),
  {
    modelValue: undefined,
    value: undefined,
    type: 'date',
    showSeconds: false,
    timeFormat: 'auto',
    minDate: null,
    maxDate: null,
    minTime: null,
    maxTime: null,
    label: undefined,
    disabled: false,
    readonly: false,
    required: false,
    name: '',
    locale: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
  'update:value': [value: Date | null]
  beforeinput: [event: InputEvent]
  input: [value: Date | null]
  change: [value: Date | null]
  invalid: [
    value: {
      message: string
      validity: 'valueMissing' | 'typeMismatch' | 'rangeUnderflow' | 'rangeOverflow' | 'customError'
    },
  ]
}>()

const root = ref<HTMLElement>()
const uid = useId()
const fields = new Map<DateInputSegment, HTMLInputElement>()
const currentValue = ref<Date | null>(copyDate(props.modelValue ?? props.value ?? null))
const initialValue = copyDate(props.modelValue ?? props.value ?? null)
const draft = ref<Partial<Record<DateInputSegment, string>>>({})
const activeSegment = ref<DateInputSegment>('month')
const changedSinceFocus = ref(false)
const { locale, messages } = useComponentLocale(
  'dateInput',
  () => props.locale,
  () => ({ required: props.requiredMessage, invalid: props.invalidMessage }),
  () => (typeof navigator === 'undefined' ? 'en-US' : navigator.language),
)
const resolvedLabel = computed(() => props.label ?? messages.value[props.type])
const draftTimeFormat = ref<'12' | '24'>()
const hasPendingTimeDraft = computed(() =>
  (['hour', 'minute', 'second', 'period'] as const).some((id) => draft.value[id] !== undefined),
)
const resolvedTimeFormat = computed(() =>
  props.timeFormat === 'auto' && hasPendingTimeDraft.value && draftTimeFormat.value
    ? draftTimeFormat.value
    : resolveTimeFormat(locale.value, props.timeFormat),
)
function setDraft(value: typeof draft.value): void {
  if (!hasPendingTimeDraft.value) draftTimeFormat.value = resolvedTimeFormat.value
  draft.value = value
}
const parts = computed(() =>
  getDateInputParts(locale.value, props.type, resolvedTimeFormat.value, props.showSeconds).map(
    (part) =>
      part.kind === 'field'
        ? {
            ...part,
            label:
              props.labels?.[part.id] ??
              messages.value[part.id] ??
              getDateInputSegmentLabel(locale.value, part.id),
          }
        : part,
  ),
)
const visibleParts = computed(() =>
  parts.value.filter(
    (part) => part.kind !== 'field' || part.id !== 'period' || resolvedTimeFormat.value === '12',
  ),
)
const direction = computed(() => (/^(ar|fa|he|ur)(-|$)/i.test(locale.value) ? 'rtl' : 'ltr'))
const visibleValue = (id: DateInputSegment) =>
  draft.value[id] ?? getSegmentDisplayValue(currentValue.value, id, resolvedTimeFormat.value)

function copyDate(value: Date | null | undefined): Date | null {
  return value instanceof Date && Number.isFinite(value.getTime())
    ? new Date(value.getTime())
    : null
}
function timeLimit(value: string | TimeParts | null): number | null {
  if (typeof value === 'string') return parseTimeBound(value)
  return value ? value.hour * 3600 + value.minute * 60 + (value.second ?? 0) : null
}
function partsFromValue(value: Date | null): Partial<Record<DateInputSegment, number>> {
  if (!value) return {}
  const hour = value.getHours()
  return {
    month: value.getMonth() + 1,
    day: value.getDate(),
    year: value.getFullYear(),
    hour: resolvedTimeFormat.value === '12' ? hour % 12 || 12 : hour,
    minute: value.getMinutes(),
    second: value.getSeconds(),
    period: hour >= 12 ? 1 : 0,
  }
}
function activeDateParts(): Partial<Record<DateInputSegment, number>> {
  const values = partsFromValue(currentValue.value)
  for (const [id, raw] of Object.entries(draft.value) as Array<[DateInputSegment, string]>) {
    if (raw !== undefined && raw !== '')
      values[id] =
        id === 'period' ? (raw === '1' || raw.toLowerCase() === 'pm' ? 1 : 0) : Number(raw)
  }
  return values
}
function validCandidate(
  date: Date,
): { message: string; validity: 'rangeUnderflow' | 'rangeOverflow' | 'customError' } | null {
  const text = messages.value
  if (props.type !== 'time') {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    if (props.minDate && day < props.minDate)
      return { message: text.earlyDate, validity: 'rangeUnderflow' }
    if (props.maxDate && day > props.maxDate)
      return { message: text.lateDate, validity: 'rangeOverflow' }
    if (props.isDateSelectable?.(new Date(day)) === false || props.blackoutDates?.(new Date(day)))
      return { message: text.unavailable, validity: 'customError' }
  }
  if (props.type !== 'date') {
    const parts = { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() }
    const value = parts.hour * 3600 + parts.minute * 60 + parts.second
    const min = timeLimit(props.minTime),
      max = timeLimit(props.maxTime)
    if (min !== null && value < min) return { message: text.earlyTime, validity: 'rangeUnderflow' }
    if (max !== null && value > max) return { message: text.lateTime, validity: 'rangeOverflow' }
    if (props.isTimeSelectable?.(parts) === false || props.blackoutTimes?.(parts))
      return { message: text.unavailable, validity: 'customError' }
  }
  return null
}
const problem = computed(() => {
  if (props.disabled || props.readonly) return null
  const values = activeDateParts()
  const any = Object.values(values).some((value) => value !== undefined)
  const completeDate =
    props.type === 'time' ||
    (values.year !== undefined && values.month !== undefined && values.day !== undefined)
  const completeTime =
    props.type === 'date' ||
    (values.hour !== undefined &&
      values.minute !== undefined &&
      (resolvedTimeFormat.value === '24' || values.period !== undefined) &&
      (!props.showSeconds || values.second !== undefined))
  if (!any && props.required) return messages.value.required
  if (any && (!completeDate || !completeTime)) return messages.value.invalid
  if (!completeDate || !completeTime) return null
  const date = dateFromSegments(
    values,
    props.type,
    resolvedTimeFormat.value,
    props.showSeconds,
    currentValue.value,
  )
  if (!date) return messages.value.invalid
  return validCandidate(date)?.message ?? null
})

const error = computed(() => problem.value ?? '')
const nativeValidationMessage = computed(() =>
  problem.value === null
    ? ''
    : problem.value || messages.value.invalid || english.dateInput.invalid,
)

watch(
  () => [props.modelValue, props.value] as const,
  ([modelValue, value]) => {
    const incoming = copyDate(modelValue !== undefined ? modelValue : value)
    if (incoming?.getTime() !== currentValue.value?.getTime()) {
      currentValue.value = incoming
      setDraft({})
    }
  },
)
watch(
  [nativeValidationMessage, parts],
  ([message]) => {
    for (const field of fields.values()) field.setCustomValidity('')
    firstField()?.setCustomValidity(message)
  },
  { flush: 'post', immediate: true },
)
watch(
  parts,
  async (value) => {
    const document = root.value?.ownerDocument
    const focused = [...fields].find(([, field]) => field === document?.activeElement)?.[0]
    const first = value.find((part) => part.kind === 'field')
    if (focused && value.some((part) => part.kind === 'field' && part.id === focused))
      activeSegment.value = focused
    else if (first?.kind === 'field') activeSegment.value = first.id
    if (!focused || !document) return
    await nextTick()
    if (document.activeElement === document.body || root.value?.contains(document.activeElement))
      fields.get(activeSegment.value)?.focus()
  },
  { immediate: true },
)

function registerField(id: DateInputSegment, element: Element | null): void {
  if (element instanceof HTMLInputElement) fields.set(id, element)
  else fields.delete(id)
}
function firstField(): HTMLInputElement | undefined {
  const first = parts.value.find((part) => part.kind === 'field')
  return first?.kind === 'field' ? fields.get(first.id) : undefined
}
function focusField(id: DateInputSegment): void {
  fields.get(id)?.focus()
}
function moveField(id: DateInputSegment, step: number): void {
  const sequence = visibleParts.value
    .filter((part): part is Extract<typeof part, { kind: 'field' }> => part.kind === 'field')
    .map((part) => part.id)
  const index = sequence.indexOf(id)
  const target = sequence[index + step]
  if (target) focusField(target)
}
function emitValue(value: Date | null, input = true): void {
  currentValue.value = copyDate(value)
  emit('update:modelValue', copyDate(value))
  emit('update:value', copyDate(value))
  if (input) emit('input', copyDate(value))
  changedSinceFocus.value = true
}
function clearPart(id: DateInputSegment): void {
  const nextDraft = { ...draft.value, [id]: '' }
  setDraft(nextDraft)
  const values = activeDateParts()
  delete values[id]
  const value = dateFromSegments(
    values,
    props.type,
    resolvedTimeFormat.value,
    props.showSeconds,
    currentValue.value,
  )
  if (
    value === null ||
    (props.type !== 'time' &&
      (values.year === undefined || values.month === undefined || values.day === undefined))
  )
    emitValue(null)
}
function commitDraft(id: DateInputSegment): void {
  const text = draft.value[id]
  if (text === undefined || text === '') return
  const values = activeDateParts()
  const segment = parts.value.find((part) => part.kind === 'field' && part.id === id)
  if (!segment || segment.kind !== 'field') return
  const number =
    id === 'period' ? (text === '1' || text.toLowerCase() === 'pm' ? 1 : 0) : Number(text)
  const maximum =
    id === 'day' && values.month !== undefined && values.year !== undefined
      ? new Date(values.year, values.month, 0).getDate()
      : id === 'hour' && resolvedTimeFormat.value === '12'
        ? 12
        : segment.max
  if (number < segment.min || number > maximum || !Number.isFinite(number)) return
  values[id] = number
  const value = dateFromSegments(
    values,
    props.type,
    resolvedTimeFormat.value,
    props.showSeconds,
    currentValue.value,
  )
  if (value) {
    const problem = validCandidate(value)
    if (!problem) {
      setDraft({})
      emitValue(value)
    }
  }
}
function inputSegment(event: Event, id: DateInputSegment, maxLength: number): void {
  const input = event.target as HTMLInputElement
  let text = input.value
  if (id === 'period') {
    if (/^a/i.test(text)) text = '0'
    else if (/^p/i.test(text)) text = '1'
    else if (!/^[01]?$/.test(text))
      text =
        draft.value[id] ?? getSegmentDisplayValue(currentValue.value, id, resolvedTimeFormat.value)
  } else {
    const numeric = text.replace(/\D/g, '').slice(0, maxLength)
    if (numeric !== text) text = numeric
  }
  if (text.length > maxLength) text = text.slice(0, maxLength)
  setDraft({ ...draft.value, [id]: text })
  input.value = text
  const values = activeDateParts()
  const segment = parts.value.find((part) => part.kind === 'field' && part.id === id)
  if (text !== '' && segment?.kind === 'field') {
    const number = id === 'period' ? Number(text) : Number(text)
    const max =
      id === 'day' && values.month !== undefined && values.year !== undefined
        ? new Date(values.year, values.month, 0).getDate()
        : segment.max
    if (Number.isFinite(number) && number >= segment.min && number <= max) commitDraft(id)
  } else if (text === '') clearPart(id)
  const numeric = text === '' ? 0 : Number(text)
  if (
    text.length >= maxLength ||
    (text !== '' && numeric * 10 > (segment?.kind === 'field' ? segment.max : 99))
  ) {
    const seq = visibleParts.value
      .filter((part): part is Extract<typeof part, { kind: 'field' }> => part.kind === 'field')
      .map((part) => part.id)
    const next = seq[seq.indexOf(id) + 1]
    if (next) void nextTick(() => focusField(next))
  }
}
function onBeforeInput(event: InputEvent): void {
  emit('beforeinput', event)
  if (props.readonly || props.disabled) event.preventDefault()
}
function onSegmentFocus(event: FocusEvent, id: DateInputSegment): void {
  if (!(event.relatedTarget instanceof Node) || !root.value?.contains(event.relatedTarget))
    changedSinceFocus.value = false
  activeSegment.value = id
  ;(event.target as HTMLInputElement).select()
}
function onInvalid(event: Event): void {
  const validity = (event.target as HTMLInputElement).validity
  const reason = validity.valueMissing
    ? 'valueMissing'
    : validity.rangeUnderflow
      ? 'rangeUnderflow'
      : validity.rangeOverflow
        ? 'rangeOverflow'
        : validity.customError
          ? 'customError'
          : 'typeMismatch'
  emit('invalid', { message: nativeValidationMessage.value, validity: reason })
}
function increment(id: DateInputSegment, amount: number): void {
  const format = resolvedTimeFormat.value
  const segment = parts.value.find((part) => part.kind === 'field' && part.id === id)
  if (!segment || segment.kind !== 'field') return
  const values = activeDateParts()
  let current =
    values[id] ??
    (id === 'hour'
      ? resolvedTimeFormat.value === '12'
        ? 12
        : 0
      : id === 'period'
        ? 0
        : segment.min)
  const min = segment.min,
    max =
      id === 'day' && values.month && values.year
        ? new Date(values.year, values.month, 0).getDate()
        : segment.max
  if (id === 'hour' && resolvedTimeFormat.value === '12') {
    const hour24 = ((current % 12) + (values.period ?? 0) * 12 + amount + 24) % 24
    current = hour24 % 12 || 12
    values.period = hour24 >= 12 ? 1 : 0
  } else {
    current =
      ((((current - min + amount) % (max - min + 1)) + (max - min + 1)) % (max - min + 1)) + min
  }
  values[id] = current
  setDraft({ ...draft.value, [id]: undefined })
  const candidate = dateFromSegments(
    values,
    props.type,
    format,
    props.showSeconds,
    currentValue.value,
  )
  if (candidate && !validCandidate(candidate)) {
    setDraft({})
    emitValue(candidate)
  } else if (id === 'period' && currentValue.value) {
    const adjusted = new Date(currentValue.value)
    adjusted.setHours(adjusted.getHours() + (current === 1 ? 12 : -12))
    if (!validCandidate(adjusted)) emitValue(adjusted)
  }
}
function keydown(event: KeyboardEvent, id: DateInputSegment): void {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    const physicalDirection = event.key === 'ArrowRight' ? 1 : -1
    moveField(id, direction.value === 'rtl' ? -physicalDirection : physicalDirection)
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    if (props.readonly || props.disabled) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    const before =
      draft.value[id] ?? getSegmentDisplayValue(currentValue.value, id, resolvedTimeFormat.value)
    if (before.length > 0) clearPart(id)
    else moveField(id, -1)
  } else if (
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown' ||
    event.key === 'Home' ||
    event.key === 'End' ||
    event.key === 'PageUp' ||
    event.key === 'PageDown'
  ) {
    event.preventDefault()
    if (props.readonly || props.disabled) return
    if (event.key === 'Home' || event.key === 'End') {
      const segment = parts.value.find((part) => part.kind === 'field' && part.id === id)
      if (segment?.kind === 'field') {
        const limits = segmentLimits(id, segment.max)
        setDraft({ ...draft.value, [id]: String(event.key === 'Home' ? limits[0] : limits[1]) })
        commitDraft(id)
      }
    } else
      increment(
        id,
        event.key === 'ArrowUp' || event.key === 'PageUp'
          ? event.key === 'PageUp'
            ? 5
            : 1
          : event.key === 'PageDown'
            ? -5
            : -1,
      )
  }
}
function displayedFieldValue(id: DateInputSegment): string {
  const value = visibleValue(id)
  if (id !== 'period') return value
  if (value === '') return messages.value.periodPlaceholder
  const hour = value === '1' ? 13 : 1
  return (
    new Intl.DateTimeFormat(locale.value, { hour: 'numeric', hour12: true, timeZone: 'UTC' })
      .formatToParts(new Date(Date.UTC(2000, 0, 1, hour)))
      .find((part) => part.type === 'dayPeriod')?.value ||
    (value === '1' ? messages.value.pm : messages.value.am)
  )
}
function fieldNumber(id: DateInputSegment): number | undefined {
  const value = visibleValue(id)
  if (value === '') return undefined
  if (id === 'period') return value === '1' ? 1 : 0
  return Number(value)
}
function segmentLimits(id: DateInputSegment, fallbackMax: number): [number, number] {
  const values = activeDateParts()
  if (id === 'day' && values.month !== undefined && values.year !== undefined)
    return [1, new Date(values.year, values.month, 0).getDate()]
  if (id === 'hour' && resolvedTimeFormat.value === '12') return [1, 12]
  return [id === 'year' ? 1 : 0, fallbackMax]
}
function onGroupFocusOut(): void {
  void nextTick(() => {
    if (root.value?.contains(document.activeElement)) return
    const active = document.activeElement as HTMLInputElement | null
    if (active && [...fields.values()].includes(active)) return
    for (const id of Object.keys(draft.value) as DateInputSegment[]) commitDraft(id)
    setDraft({})
    if (changedSinceFocus.value) {
      changedSinceFocus.value = false
      emit('change', copyDate(currentValue.value))
    }
  })
}
function onFormReset(): void {
  currentValue.value = copyDate(initialValue)
  setDraft({})
  emit('update:modelValue', copyDate(initialValue))
  emit('update:value', copyDate(initialValue))
}
let form: HTMLFormElement | null = null
onMounted(() => {
  form = root.value?.closest('form') ?? null
  firstField()?.setCustomValidity(nativeValidationMessage.value)
  form?.addEventListener('reset', onFormReset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', onFormReset))

defineExpose({
  focus: () => firstField()?.focus(),
  blur: () => (document.activeElement as HTMLElement | null)?.blur(),
  checkValidity: () => problem.value === null,
  get validityMessage() {
    return nativeValidationMessage.value
  },
})
</script>

<template>
  <div class="yam3x-date-input-field">
    <label
      v-if="resolvedLabel"
      :id="`${uid}-label`"
      class="yam3x-date-input-field__label"
      >{{ resolvedLabel
      }}<span
        v-if="required"
        aria-hidden="true"
      >
        *</span
      ></label
    >
    <div
      ref="root"
      class="yam3x-date-input"
      role="group"
      :aria-labelledby="resolvedLabel ? `${uid}-label` : undefined"
      :aria-label="resolvedLabel ? undefined : messages.groupFallback"
      :aria-invalid="problem !== null ? 'true' : undefined"
      :aria-errormessage="error ? `${uid}-error` : undefined"
      :aria-describedby="error ? `${uid}-error` : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-required="required ? 'true' : undefined"
      :dir="direction"
      @focusout="onGroupFocusOut"
    >
      <template
        v-for="(part, index) in visibleParts"
        :key="`${part.kind}-${part.kind === 'field' ? part.id : index}`"
      >
        <span
          v-if="part.kind === 'literal'"
          class="yam3x-date-input__literal"
          aria-hidden="true"
          >{{ part.value }}</span
        >
        <input
          v-else
          :id="`yam3x-date-input-${uid}-${part.id}`"
          :ref="(element) => registerField(part.id, element as Element | null)"
          class="yam3x-date-input__segment"
          type="text"
          :class="{
            'is-active': visibleValue(part.id) !== '',
            'is-year': part.id === 'year',
            'is-period': part.id === 'period',
          }"
          :aria-label="part.label"
          role="spinbutton"
          :aria-valuemin="segmentLimits(part.id, part.max)[0]"
          :aria-valuemax="segmentLimits(part.id, part.max)[1]"
          :aria-valuenow="fieldNumber(part.id)"
          :aria-valuetext="part.id === 'period' ? displayedFieldValue(part.id) : undefined"
          :aria-invalid="problem !== null ? 'true' : undefined"
          :aria-errormessage="error ? `${uid}-error` : undefined"
          :aria-describedby="error ? `${uid}-error` : undefined"
          :disabled="disabled"
          :readonly="readonly"
          :required="
            required && index === visibleParts.findIndex((entry) => entry.kind === 'field')
          "
          :tabindex="disabled ? -1 : part.id === activeSegment ? 0 : -1"
          :inputmode="part.id === 'period' ? 'text' : 'numeric'"
          :maxlength="part.maxLength"
          :placeholder="
            part.id === 'period'
              ? messages.periodPlaceholder
              : part.id === 'year'
                ? 'YYYY'
                : part.id === 'minute' || part.id === 'second' || part.id === 'hour'
                  ? '––'
                  : part.id === 'month'
                    ? 'MM'
                    : 'DD'
          "
          :value="displayedFieldValue(part.id)"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          @beforeinput="onBeforeInput"
          @input="inputSegment($event, part.id, part.maxLength)"
          @keydown="keydown($event, part.id)"
          @focus="onSegmentFocus($event, part.id)"
          @invalid="onInvalid"
        />
      </template>
      <input
        v-if="name"
        class="yam3x-date-input__form-value"
        type="hidden"
        :name="name"
        :value="currentValue?.toISOString() || ''"
        :disabled="disabled"
      />
    </div>
    <p
      v-if="error"
      :id="`${uid}-error`"
      class="yam3x-date-input-field__error"
      role="alert"
    >
      <Icon
        name="error"
        aria-hidden="true"
      /><span>{{ error }}</span>
    </p>
  </div>
</template>

<style>
.yam3x-date-input-field {
  --_yam3x-date-input-system-color-error: var(--md-sys-color-error);
  --_yam3x-date-input-system-color-on-primary-container: var(--md-sys-color-on-primary-container);
  --_yam3x-date-input-system-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-date-input-system-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-date-input-system-color-outline: var(--md-sys-color-outline);
  --_yam3x-date-input-system-color-primary: var(--md-sys-color-primary);
  --_yam3x-date-input-system-color-primary-container: var(--md-sys-color-primary-container);
  --_yam3x-date-input-system-density-spacing-scale: var(--md-sys-density-spacing-scale);
  display: inline-grid;
  gap: calc(4px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
  max-width: 100%;
  color: var(--_yam3x-date-input-system-color-on-surface);
  font: inherit;
}
.yam3x-date-input-field__label {
  font-size: 14px;
  color: var(--_yam3x-date-input-system-color-on-surface-variant);
}
.yam3x-date-input {
  display: flex;
  align-items: center;
  gap: calc(2px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
  min-width: 0;
  min-height: 56px;
  padding: 0 calc(16px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
  border: 1px solid var(--_yam3x-date-input-system-color-outline);
  border-radius: 4px;
  box-sizing: border-box;
  color: var(--yam3x-date-input-color, var(--_yam3x-date-input-system-color-on-surface));
  font: inherit;
  direction: inherit;
}
.yam3x-date-input:focus-within {
  border: 2px solid var(--_yam3x-date-input-system-color-primary);
  padding-inline: calc(15px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
}
.yam3x-date-input[aria-invalid='true'] {
  border-color: var(--_yam3x-date-input-system-color-error);
}
.yam3x-date-input__segment {
  flex: 0 0 auto;
  width: 2ch;
  min-width: 2ch;
  max-width: 6ch;
  height: 48px;
  padding: calc(2px * var(--_yam3x-date-input-system-density-spacing-scale, 1))
    calc(3px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
  border: 0;
  border-radius: 4px;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: center;
  direction: ltr;
  box-sizing: content-box;
}
.yam3x-date-input__segment:lang(zh),
.yam3x-date-input__segment.is-year {
  width: 4ch;
}
.yam3x-date-input__segment.is-period {
  width: auto;
  min-width: 4ch;
}
.yam3x-date-input__segment::placeholder {
  color: var(--_yam3x-date-input-system-color-on-surface-variant);
  opacity: 1;
}
.yam3x-date-input__segment:focus {
  background: var(
    --yam3x-date-input-focused-container-color,
    var(--_yam3x-date-input-system-color-primary-container)
  );
  color: var(
    --yam3x-date-input-focused-color,
    var(--_yam3x-date-input-system-color-on-primary-container)
  );
}
.yam3x-date-input__segment:disabled {
  color: var(--yam3x-date-input-disabled-color, var(--_yam3x-date-input-system-color-on-surface));
  opacity: var(--yam3x-date-input-disabled-opacity, 0.38);
  cursor: default;
}
.yam3x-date-input__segment:read-only {
  cursor: text;
}
.yam3x-date-input__literal {
  white-space: pre;
  color: var(--yam3x-date-input-color, var(--_yam3x-date-input-system-color-on-surface-variant));
  user-select: none;
}
.yam3x-date-input-field__error {
  display: flex;
  align-items: center;
  gap: calc(4px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
  margin: 0;
  color: var(--_yam3x-date-input-system-color-error);
  font-size: 12px;
}
.yam3x-date-input-field__error :is(svg, .yam3x-icon) {
  width: 16px;
  height: 16px;
  flex: none;
  font-size: 16px;
}
.yam3x-date-input__form-value {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: calc(-1px * var(--_yam3x-date-input-system-density-spacing-scale, 1));
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (forced-colors: active) {
  .yam3x-date-input {
    border-color: CanvasText;
  }
  .yam3x-date-input__segment:focus {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
  .yam3x-date-input[aria-invalid='true'] {
    border-color: Mark;
  }
  .yam3x-date-input-field__error {
    color: Mark;
  }
}
</style>
