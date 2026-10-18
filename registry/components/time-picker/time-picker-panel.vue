<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../icon/icon.vue'
import type { HourDialItem, TimePickerView } from './time-picker.utils'

type TimePickerDialItem = HourDialItem | { value: number; label: string; angle: number }

const props = defineProps<{
  mode: 'dial' | 'input'
  showModeToggle?: boolean
  showActions?: boolean
  showHeadline?: boolean
  activeView: TimePickerView
  format: '12' | '24'
  showSeconds: boolean
  hour: number
  minute: number
  second: number
  period: 'AM' | 'PM'
  hourText: string
  minuteText: string
  secondText: string
  hourLabel: string
  minuteLabel: string
  secondLabel: string
  periodLabel: string
  periodOptions: Array<{ value: 'AM' | 'PM'; label: string }>
  cancelLabel: string
  confirmLabel: string
  modeToggleLabel: string
  useDialLabel: string
  dialValueLabel: (context: {
    value: number
    unit: 'hour' | 'minute' | 'second'
    max: number
  }) => string
  dialLabel: string
  inputLabel: string
  hideModeToggle: boolean
  invalid: boolean
  error: string
  canConfirm: boolean
  hours: HourDialItem[]
  ticks: Array<{ value: number; label: string; angle: number }>
  errorId: string
  dialSize: number
  outerNumeralRadius: number
  innerNumeralRadius: number
  selectorPoint: { x: number; y: number }
  showPeriod: boolean
  useInputOnly: boolean
  dialPointerClick: (event: MouseEvent) => void
  startDrag: (event: PointerEvent) => void
  selectorKeydown: (event: KeyboardEvent, view: TimePickerView) => void
  setView: (view: string) => void
  setMode: (mode: string) => void
  setPeriod: (period: 'AM' | 'PM') => void
  setInputPart: (part: 'hour' | 'minute' | 'second', value: string) => void
  hourAllowed: (value: number) => boolean
  tickAllowed: (value: number) => boolean
}>()

const inputMode = computed(() => props.mode === 'input' || props.useInputOnly)
const fields = computed(() => [
  { part: 'hour' as const, text: props.hourText, label: props.hourLabel },
  { part: 'minute' as const, text: props.minuteText, label: props.minuteLabel },
  ...(props.showSeconds
    ? [{ part: 'second' as const, text: props.secondText, label: props.secondLabel }]
    : []),
])
const hourValue = computed(() => (props.format === '12' ? props.hour % 12 || 12 : props.hour))
const currentValue = computed(() =>
  props.activeView === 'hour'
    ? hourValue.value
    : props.activeView === 'minute'
      ? props.minute
      : props.second,
)
const currentLabel = computed(() =>
  props.activeView === 'hour'
    ? props.hourLabel
    : props.activeView === 'minute'
      ? props.minuteLabel
      : props.secondLabel,
)
const selectorAllowed = computed(() =>
  props.activeView === 'hour'
    ? props.hourAllowed(currentValue.value)
    : props.tickAllowed(currentValue.value),
)
const dialItems = computed<TimePickerDialItem[]>(() =>
  props.activeView === 'hour' ? props.hours : props.ticks,
)

function onPeriodKeydown(event: KeyboardEvent, index: number): void {
  const delta =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : 0
  if (!delta) return
  event.preventDefault()
  const nextIndex = (index + delta + props.periodOptions.length) % props.periodOptions.length
  const next = props.periodOptions[nextIndex]!
  props.setPeriod(next.value)
  ;(event.currentTarget as HTMLElement).parentElement
    ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    [nextIndex]?.focus()
}

function onFieldPointerDown(event: PointerEvent, part: TimePickerView): void {
  if (event.button !== 0) return
  props.setView(part)
}

let suppressModeToggleClick = false
let resetModeToggleClickSuppression: number | undefined
let modeTogglePointerId: number | null = null

function toggleMode(): void {
  props.setMode(props.mode === 'input' ? 'dial' : 'input')
}

function onModeTogglePointerDown(event: PointerEvent): void {
  modeTogglePointerId = event.button === 0 ? event.pointerId : null
}

function onModeTogglePointerUp(event: PointerEvent): void {
  if (event.button !== 0 || modeTogglePointerId !== event.pointerId) return
  modeTogglePointerId = null
  suppressModeToggleClick = true
  window.clearTimeout(resetModeToggleClickSuppression)
  resetModeToggleClickSuppression = window.setTimeout(() => {
    suppressModeToggleClick = false
  }, 0)
  toggleMode()
}

function onModeToggleClick(): void {
  if (suppressModeToggleClick) {
    suppressModeToggleClick = false
    window.clearTimeout(resetModeToggleClickSuppression)
    return
  }
  // Keep click as a fallback for keyboard, assistive technology, and browsers
  // that do not deliver the pointerup event to this button.
  toggleMode()
}

function isInner(item: TimePickerDialItem): boolean {
  return 'inner' in item && item.inner
}

function dialItemLabel(value: number): string {
  const unit = props.activeView
  const max = unit === 'hour' ? (props.format === '24' ? 24 : 12) : 60
  return props.dialValueLabel({ value, unit, max })
}
</script>

<template>
  <div class="yam3x-time-picker__content">
    <div
      v-if="showHeadline !== false"
      class="yam3x-time-picker__headline"
    >
      {{ inputMode ? inputLabel : dialLabel }}
    </div>
    <header class="yam3x-time-picker__header">
      <div class="yam3x-time-picker__header-value">
        <div
          :key="inputMode ? 'input' : 'dial'"
          class="yam3x-time-picker__view-content"
        >
          <div
            v-if="inputMode"
            class="yam3x-time-picker__input"
          >
            <div class="yam3x-time-picker__input-controls">
              <div
                class="yam3x-time-picker__fields"
                dir="ltr"
              >
                <template
                  v-for="(field, index) in fields"
                  :key="field.part"
                >
                  <span
                    v-if="index"
                    class="yam3x-time-picker__separator"
                    aria-hidden="true"
                    >:</span
                  >
                  <label class="yam3x-time-picker__input-slot">
                    <input
                      type="text"
                      dir="ltr"
                      inputmode="numeric"
                      maxlength="2"
                      pattern="[0-9]*"
                      :value="field.text"
                      :aria-label="field.label"
                      :aria-invalid="invalid"
                      :aria-describedby="error ? errorId : undefined"
                      @input="setInputPart(field.part, ($event.target as HTMLInputElement).value)"
                    />
                    <span class="yam3x-time-picker__input-label">{{ field.label }}</span>
                  </label>
                </template>
              </div>
              <div
                v-if="showPeriod"
                class="yam3x-time-picker__period"
                role="radiogroup"
                :aria-label="periodLabel"
              >
                <button
                  v-for="(option, index) in periodOptions"
                  :key="option.value"
                  type="button"
                  role="radio"
                  :aria-checked="option.value === period"
                  :tabindex="option.value === period ? 0 : -1"
                  @click="setPeriod(option.value)"
                  @keydown="onPeriodKeydown($event, index)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            <p
              v-if="error"
              :id="errorId"
              class="yam3x-time-picker__error"
              role="alert"
            >
              {{ error }}
            </p>
          </div>
          <div
            v-else
            class="yam3x-time-picker__time-selectors"
            dir="ltr"
          >
            <button
              v-for="field in fields"
              :key="field.part"
              type="button"
              class="yam3x-time-picker__selector"
              :aria-label="field.label"
              :aria-pressed="activeView === field.part"
              @pointerdown="onFieldPointerDown($event, field.part)"
              @click="setView(field.part)"
            >
              {{ field.text }}
            </button>
            <div
              v-if="showPeriod"
              class="yam3x-time-picker__period"
              role="radiogroup"
              :aria-label="periodLabel"
            >
              <button
                v-for="(option, index) in periodOptions"
                :key="option.value"
                type="button"
                role="radio"
                :aria-checked="option.value === period"
                :tabindex="option.value === period ? 0 : -1"
                @click="setPeriod(option.value)"
                @keydown="onPeriodKeydown($event, index)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
        <button
          v-if="showModeToggle !== false && !useInputOnly && !hideModeToggle"
          type="button"
          class="yam3x-time-picker__mode-toggle"
          :aria-label="mode === 'input' ? useDialLabel : modeToggleLabel"
          :title="mode === 'input' ? useDialLabel : modeToggleLabel"
          @pointerdown="onModeTogglePointerDown"
          @pointerup="onModeTogglePointerUp"
          @click="onModeToggleClick"
        >
          <Icon :name="mode === 'input' ? 'schedule' : 'dialpad'" />
        </button>
      </div>
    </header>
    <div
      v-if="!inputMode"
      class="yam3x-time-picker__dial-wrap"
    >
      <div
        :key="activeView"
        class="yam3x-time-picker__dial"
        role="group"
        :aria-label="currentLabel"
        @pointerdown="startDrag"
        @click="dialPointerClick"
      >
        <svg
          class="yam3x-time-picker__track"
          :viewBox="`0 0 ${dialSize} ${dialSize}`"
          aria-hidden="true"
        >
          <line
            :x1="dialSize / 2"
            :y1="dialSize / 2"
            :x2="selectorPoint.x"
            :y2="selectorPoint.y"
          />
        </svg>
        <button
          v-for="item in dialItems"
          :key="item.value"
          type="button"
          :class="[
            'yam3x-time-picker__dial-item',
            activeView === 'hour' && format === '24' && isInner(item) && 'is-inner',
          ]"
          :data-dial-value="item.value"
          :style="{
            left: `${dialSize / 2 + Math.sin((item.angle * Math.PI) / 180) * (isInner(item) ? innerNumeralRadius : outerNumeralRadius)}px`,
            top: `${dialSize / 2 - Math.cos((item.angle * Math.PI) / 180) * (isInner(item) ? innerNumeralRadius : outerNumeralRadius)}px`,
          }"
          :aria-label="dialItemLabel(item.value)"
          :aria-pressed="currentValue === item.value"
          :disabled="activeView === 'hour' ? !hourAllowed(item.value) : !tickAllowed(item.value)"
          :tabindex="currentValue === item.value ? 0 : -1"
          @keydown="selectorKeydown($event, activeView)"
        >
          {{ item.label }}
        </button>
        <span
          :class="['yam3x-time-picker__dial-center', !selectorAllowed && 'is-disabled']"
          aria-hidden="true"
        />
        <span
          :class="['yam3x-time-picker__dial-selector', !selectorAllowed && 'is-disabled']"
          :style="{ left: `${selectorPoint.x}px`, top: `${selectorPoint.y}px` }"
          aria-hidden="true"
        />
      </div>
    </div>
    <footer
      v-if="showActions !== false"
      class="yam3x-time-picker__actions"
    >
      <button
        type="button"
        class="yam3x-time-picker__action"
        @click="setMode('cancel')"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="button"
        class="yam3x-time-picker__action yam3x-time-picker__action--confirm"
        :disabled="!canConfirm"
        @click="setMode('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </footer>
  </div>
</template>
