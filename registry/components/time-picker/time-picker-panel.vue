<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../icon/icon.vue'
import ScrollField from '../scroll-field/scroll-field.vue'
import TimePeriodToggle from './time-period-toggle.vue'
import type { HourDialItem, TimePickerView } from './time-picker.utils'

type TimePickerDialItem = HourDialItem | { value: number; label: string; angle: number }

const props = defineProps<{
  mode: 'dial' | 'input' | 'scroll'
  alternateMode: 'dial' | 'scroll'
  useScrollLabel: string
  setScrollPart: (part: 'hour' | 'minute' | 'second', value: number) => void
  showModeToggle?: boolean
  showActions?: boolean
  showHeadline?: boolean
  activeView: TimePickerView
  locale: string
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
  finishInputPart: (part: 'hour' | 'minute' | 'second') => void
  hourAllowed: (value: number) => boolean
  tickAllowed: (value: number) => boolean
}>()

const scrollMode = computed(() => props.mode === 'scroll' && !props.useInputOnly)
const inputMode = computed(
  () => !scrollMode.value && (props.mode === 'input' || props.useInputOnly),
)
const scrollHour = computed(() => (props.format === '12' ? props.hour % 12 || 12 : props.hour))
const scrollHourMin = computed(() => (props.format === '12' ? 1 : 0))
const scrollHourMax = computed(() => (props.format === '12' ? 12 : 23))
const toggleLabel = computed(() =>
  props.mode === 'input'
    ? props.alternateMode === 'scroll'
      ? props.useScrollLabel
      : props.useDialLabel
    : props.modeToggleLabel,
)
const toggleIcon = computed(() =>
  props.mode === 'input'
    ? props.alternateMode === 'scroll'
      ? 'swipe_vertical'
      : 'schedule'
    : 'keyboard',
)
const inlineModeToggle = computed(
  () => props.showModeToggle !== false && props.showActions === false && !props.hideModeToggle,
)
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

function updateScroll(part: 'hour' | 'minute' | 'second', value: number | undefined): void {
  if (value !== undefined) props.setScrollPart(part, value)
}

function onFieldPointerDown(event: PointerEvent, part: TimePickerView): void {
  if (event.button !== 0) return
  props.setView(part)
}

let suppressModeToggleClick = false
let resetModeToggleClickSuppression: number | undefined
let modeTogglePointerId: number | null = null

function toggleMode(): void {
  props.setMode(props.mode === 'input' ? props.alternateMode : 'input')
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
          :key="scrollMode ? 'scroll' : inputMode ? 'input' : 'dial'"
          class="yam3x-time-picker__view-content"
        >
          <div
            v-if="scrollMode"
            class="yam3x-time-picker__scroll"
            dir="ltr"
          >
            <ScrollField
              class="yam3x-time-picker__scroll-field"
              size="small"
              :model-value="scrollHour"
              :min="scrollHourMin"
              :max="scrollHourMax"
              loop
              :locale="locale"
              :label="hourLabel"
              :invalid="invalid"
              @update:model-value="updateScroll('hour', $event)"
            />
            <span
              class="yam3x-time-picker__scroll-separator"
              aria-hidden="true"
              >:</span
            >
            <ScrollField
              class="yam3x-time-picker__scroll-field"
              size="small"
              :model-value="minute"
              :min="0"
              :max="59"
              loop
              :locale="locale"
              :label="minuteLabel"
              :invalid="invalid"
              @update:model-value="updateScroll('minute', $event)"
            />
            <div
              class="yam3x-time-picker__scroll-tail"
              :class="{ 'is-toggle-only': !showPeriod && !showSeconds }"
            >
              <template v-if="showSeconds">
                <span
                  class="yam3x-time-picker__scroll-separator"
                  aria-hidden="true"
                  >:</span
                >
                <ScrollField
                  class="yam3x-time-picker__scroll-field"
                  size="small"
                  :model-value="second"
                  :min="0"
                  :max="59"
                  loop
                  :locale="locale"
                  :label="secondLabel"
                  :invalid="invalid"
                  @update:model-value="updateScroll('second', $event)"
                />
              </template>
              <div
                class="yam3x-time-picker__scroll-controls"
                :class="{ 'is-inline': inlineModeToggle, 'has-period': showPeriod }"
              >
                <TimePeriodToggle
                  v-if="showPeriod"
                  class="yam3x-time-picker__scroll-period"
                  :period="period"
                  :options="periodOptions"
                  :label="periodLabel"
                  :set-period="setPeriod"
                />
                <button
                  v-if="inlineModeToggle"
                  type="button"
                  class="yam3x-time-picker__inline-mode-toggle"
                  :aria-label="toggleLabel"
                  :title="toggleLabel"
                  @click="toggleMode"
                >
                  <Icon :name="toggleIcon" />
                </button>
              </div>
            </div>
            <p
              v-if="error"
              :id="errorId"
              class="yam3x-time-picker__error yam3x-time-picker__scroll-error"
              role="alert"
            >
              {{ error }}
            </p>
          </div>
          <div
            v-else-if="inputMode"
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
                      @focus="($event.target as HTMLInputElement).select()"
                      @click="($event.target as HTMLInputElement).select()"
                      @blur="finishInputPart(field.part)"
                    />
                    <span class="yam3x-time-picker__input-label">{{ field.label }}</span>
                  </label>
                </template>
              </div>
              <div
                class="yam3x-time-picker__input-side-controls"
                :class="{ 'is-inline': inlineModeToggle }"
              >
                <TimePeriodToggle
                  v-if="showPeriod"
                  :period="period"
                  :options="periodOptions"
                  :label="periodLabel"
                  :set-period="setPeriod"
                />
                <button
                  v-if="inlineModeToggle"
                  type="button"
                  class="yam3x-time-picker__inline-mode-toggle"
                  :aria-label="toggleLabel"
                  :title="toggleLabel"
                  @click="toggleMode"
                >
                  <Icon :name="toggleIcon" />
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
            <TimePeriodToggle
              v-if="showPeriod"
              :period="period"
              :options="periodOptions"
              :label="periodLabel"
              :set-period="setPeriod"
            />
          </div>
        </div>
      </div>
    </header>
    <div
      v-if="!inputMode && !scrollMode"
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
        v-if="showModeToggle !== false && !useInputOnly && !hideModeToggle"
        type="button"
        class="yam3x-time-picker__mode-toggle"
        :aria-label="toggleLabel"
        :title="toggleLabel"
        @pointerdown="onModeTogglePointerDown"
        @pointerup="onModeTogglePointerUp"
        @click="onModeToggleClick"
      >
        <Icon :name="toggleIcon" />
      </button>
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
