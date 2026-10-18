<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useSlots, watch } from 'vue'
import {
  sliderBounds,
  sliderFraction,
  sliderStep,
  sliderValue,
  sliderValues,
  type SliderValueModel,
  type SliderSize,
  type InternalSliderVariant,
} from './slider-utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    locale?: string
    variant?: InternalSliderVariant
    orientation?: 'horizontal' | 'vertical'
    size?: SliderSize
    min?: number
    max?: number
    step?: number
    center?: number
    stops?: boolean
    labelled?: boolean
    disabled?: boolean
    name?: string
    form?: string
    label?: string
    lowerLabel?: string
    upperLabel?: string
    formatValue?: (value: number) => string
  }>(),
  {
    variant: 'standard',
    orientation: 'horizontal',
    size: 'extra-small',
    min: 0,
    max: 100,
    step: 1,
    center: undefined,
    stops: false,
    labelled: false,
    disabled: false,
    name: undefined,
    form: undefined,
    label: undefined,
    lowerLabel: undefined,
    upperLabel: undefined,
    formatValue: undefined,
  },
)

const model = defineModel<SliderValueModel>({ default: 0 })
const emit = defineEmits<{
  beforeinput: [event: Event]
  input: [event: Event]
  change: [event: Event]
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)

const attrs = useAttrs()
const slots = useSlots()
const host = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const lowerInput = ref<HTMLInputElement | null>(null)
const upperInput = ref<HTMLInputElement | null>(null)
const activeLabel = ref<number | null>(null)
const activePointer = ref<number | null>(null)
const activeHandle = ref<number | null>(null)
const changedHandle = ref<number | null>(null)
const spaceHeld = ref(false)
const initial = ref<SliderValueModel>(0)
let formElement: HTMLFormElement | null = null

const variant = computed<InternalSliderVariant>(() =>
  ['standard', 'centered', 'range'].includes(props.variant) ? props.variant : 'standard',
)
const orientation = computed(() => (props.orientation === 'vertical' ? 'vertical' : 'horizontal'))
const size = computed<SliderSize>(() =>
  ['extra-small', 'small', 'medium', 'large', 'extra-large'].includes(props.size)
    ? props.size
    : 'extra-small',
)
const bounds = computed(() => sliderBounds(props.min, props.max))
const step = computed(() => sliderStep(props.step))
const values = computed(() =>
  sliderValues(model.value, variant.value, bounds.value[0], bounds.value[1], step.value),
)
const center = computed(() =>
  sliderValue(
    props.center ?? (bounds.value[0] + bounds.value[1]) / 2,
    bounds.value[0],
    bounds.value[1],
    step.value,
  ),
)
const vertical = computed(() => orientation.value === 'vertical')
const lowerFraction = computed(() => sliderFraction(values.value[0], ...bounds.value))
const upperFraction = computed(() => sliderFraction(values.value[1], ...bounds.value))
const centerFraction = computed(() => sliderFraction(center.value, ...bounds.value))
const activeStart = computed(() =>
  variant.value === 'range'
    ? lowerFraction.value
    : variant.value === 'centered'
      ? Math.min(centerFraction.value, lowerFraction.value)
      : 0,
)
const activeEnd = computed(() =>
  variant.value === 'range'
    ? upperFraction.value
    : variant.value === 'centered'
      ? Math.max(centerFraction.value, lowerFraction.value)
      : lowerFraction.value,
)
const startHasHandle = computed(
  () =>
    variant.value === 'range' ||
    (variant.value === 'centered' && lowerFraction.value < centerFraction.value),
)
const endHasHandle = computed(
  () => variant.value !== 'centered' || lowerFraction.value >= centerFraction.value,
)
const pct = (value: number) => `${(value * 100).toFixed(5)}%`
const tickPosition = (value: number) => {
  if (value === bounds.value[0]) return 'var(--_yam3x-slider-end-radius)'
  if (value === bounds.value[1]) return 'calc(100% - var(--_yam3x-slider-end-radius))'
  return pct(sliderFraction(value, ...bounds.value))
}
const trackStyle = computed(() => ({
  '--_yam3x-slider-before-size': `max(0px, calc(${pct(activeStart.value)} - ${startHasHandle.value ? 'var(--_yam3x-slider-handle-spacing)' : '0px'}))`,
  '--_yam3x-slider-active-offset': `calc(${pct(activeStart.value)} + ${startHasHandle.value ? 'var(--_yam3x-slider-handle-spacing)' : '0px'})`,
  '--_yam3x-slider-active-size': `max(0px, calc(${pct(activeEnd.value - activeStart.value)} - ${startHasHandle.value ? 'var(--_yam3x-slider-handle-spacing)' : '0px'} - ${endHasHandle.value ? 'var(--_yam3x-slider-handle-spacing)' : '0px'}))`,
  '--_yam3x-slider-after-offset': `calc(${pct(activeEnd.value)} + ${endHasHandle.value ? 'var(--_yam3x-slider-handle-spacing)' : '0px'})`,
  '--_yam3x-slider-after-size': `max(0px, calc(${pct(1 - activeEnd.value)} - ${endHasHandle.value ? 'var(--_yam3x-slider-handle-spacing)' : '0px'}))`,
}))
const tickValues = computed(() => {
  const [min, max] = bounds.value
  const result = new Set<number>()
  if (activeStart.value > 0) result.add(min)
  if (activeEnd.value < 1) result.add(max)
  if (variant.value === 'centered') result.add(center.value)
  if (props.stops && step.value > 1) {
    const interiorCount = Math.max(0, Math.ceil((max - min) / step.value) - 1)
    for (let i = 1; i <= interiorCount; i += 1) {
      const value = min + i * step.value
      if (value < max) result.add(Number(value.toFixed(10)))
    }
  }
  return [...result].sort((a, b) => a - b)
})
const iconVisible = computed(
  () =>
    !!slots.default &&
    variant.value === 'standard' &&
    ['medium', 'large', 'extra-large'].includes(size.value),
)
const iconOnActive = computed(() => lowerFraction.value >= 0.3)
const accessibleName = computed(() => props.label ?? (attrs['aria-label'] as string | undefined))
const activeIndexes = computed(() => (variant.value === 'range' ? [0, 1] : [0]))

function setInputRef(index: number, element: unknown) {
  if (index === 0) lowerInput.value = element as HTMLInputElement | null
  else upperInput.value = element as HTMLInputElement | null
}

function formatted(value: number): string {
  return props.formatValue?.(value) ?? `${value}`
}

function inputFor(index: number): HTMLInputElement | null {
  return index === 0 ? lowerInput.value : upperInput.value
}

function boundsFor(index: number): [number, number] {
  if (variant.value !== 'range') return bounds.value
  return index === 0 ? [bounds.value[0], values.value[1]] : [values.value[0], bounds.value[1]]
}

function setHandle(index: number, requested: number) {
  if (props.disabled) return
  const [min, max] = boundsFor(index)
  const value = Math.min(
    max,
    Math.max(min, sliderValue(requested, bounds.value[0], bounds.value[1], step.value)),
  )
  if (value === values.value[index]) return
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  emit('beforeinput', before)
  host.value?.dispatchEvent(before)
  if (before.defaultPrevented) return
  model.value =
    variant.value === 'range'
      ? index === 0
        ? [value, values.value[1]]
        : [values.value[0], value]
      : value
  changedHandle.value = index
  const input = new Event('input', { bubbles: true })
  emit('input', input)
  host.value?.dispatchEvent(input)
}

function commit() {
  if (changedHandle.value === null) return
  const change = new Event('change', { bubbles: true })
  emit('change', change)
  host.value?.dispatchEvent(change)
  changedHandle.value = null
}

function onBlur() {
  activeLabel.value = null
  commit()
}

function valueAtPoint(event: PointerEvent): number {
  const rect = track.value?.getBoundingClientRect()
  if (!rect) return bounds.value[0]
  const rtl = !vertical.value && getComputedStyle(host.value!).direction === 'rtl'
  const fraction = vertical.value
    ? (rect.bottom - event.clientY) / rect.height
    : rtl
      ? (rect.right - event.clientX) / rect.width
      : (event.clientX - rect.left) / rect.width
  return bounds.value[0] + Math.min(1, Math.max(0, fraction)) * (bounds.value[1] - bounds.value[0])
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || (event.pointerType === 'mouse' && event.button !== 0)) return
  const target =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>('.yam3x-slider__thumb')
      : null
  const value = valueAtPoint(event)
  const index =
    variant.value === 'range'
      ? target
        ? Number(target.dataset.index)
        : Math.abs(value - values.value[0]) < Math.abs(value - values.value[1])
          ? 0
          : 1
      : 0
  activePointer.value = event.pointerId
  activeHandle.value = index
  activeLabel.value = index
  host.value?.setPointerCapture(event.pointerId)
  inputFor(index)?.focus({ preventScroll: true })
  setHandle(index, value)
  event.preventDefault()
}

function onPointerMove(event: PointerEvent) {
  if (activePointer.value !== event.pointerId || activeHandle.value === null) return
  setHandle(activeHandle.value, valueAtPoint(event))
}

function onPointerEnd(event: PointerEvent) {
  if (activePointer.value !== event.pointerId) return
  if (host.value?.hasPointerCapture(event.pointerId))
    host.value.releasePointerCapture(event.pointerId)
  activePointer.value = null
  activeHandle.value = null
  commit()
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (props.disabled || event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key === ' ') {
    spaceHeld.value = true
    event.preventDefault()
    return
  }
  const rtl = !vertical.value && getComputedStyle(host.value!).direction === 'rtl'
  const increment =
    event.key === 'ArrowUp' ||
    (event.key === 'ArrowRight' && !rtl) ||
    (event.key === 'ArrowLeft' && rtl)
  const decrement =
    event.key === 'ArrowDown' ||
    (event.key === 'ArrowLeft' && !rtl) ||
    (event.key === 'ArrowRight' && rtl)
  const [min, max] = boundsFor(index)
  const delta =
    step.value *
    (event.key === 'PageUp' || event.key === 'PageDown' || (spaceHeld.value && !props.stops)
      ? 10
      : 1)
  let next: number
  if (event.key === 'Home') next = min
  else if (event.key === 'End') next = max
  else if (increment || event.key === 'PageUp') next = values.value[index] + delta
  else if (decrement || event.key === 'PageDown') next = values.value[index] - delta
  else return
  event.preventDefault()
  setHandle(index, next)
}

function onKeyup(event: KeyboardEvent) {
  if (event.key === ' ') spaceHeld.value = false
  else if (
    [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ].includes(event.key)
  )
    commit()
}

function onReset() {
  queueMicrotask(() => {
    model.value = Array.isArray(initial.value)
      ? ([...initial.value] as [number, number])
      : initial.value
  })
}

function bindForm() {
  formElement?.removeEventListener('reset', onReset)
  const candidate = props.form ? document.getElementById(props.form) : host.value?.closest('form')
  formElement = candidate instanceof HTMLFormElement ? candidate : null
  formElement?.addEventListener('reset', onReset)
}

onMounted(() => {
  initial.value = Array.isArray(model.value) ? ([...model.value] as [number, number]) : model.value
  bindForm()
})
watch(
  () => props.form,
  () => nextTick(bindForm),
)
onBeforeUnmount(() => formElement?.removeEventListener('reset', onReset))
</script>

<template>
  <div
    ref="host"
    v-bind="attrs"
    class="yam3x-slider"
    :class="[
      `yam3x-slider--${size}`,
      `yam3x-slider--${orientation}`,
      `yam3x-slider--${variant}`,
      { 'yam3x-slider--disabled': disabled, 'yam3x-slider--labelled': labelled },
    ]"
    :role="variant === 'range' ? 'group' : undefined"
    :aria-label="variant === 'range' ? accessibleName : undefined"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @pointercancel="onPointerEnd"
  >
    <div
      ref="track"
      class="yam3x-slider__track"
      :style="trackStyle"
      aria-hidden="true"
    >
      <span class="yam3x-slider__inactive yam3x-slider__inactive--before" />
      <span class="yam3x-slider__active" />
      <span class="yam3x-slider__inactive yam3x-slider__inactive--after" />
      <span
        v-for="tick in tickValues"
        :key="tick"
        class="yam3x-slider__tick"
        :class="{
          'yam3x-slider__tick--active':
            tick >= bounds[0] + activeStart * (bounds[1] - bounds[0]) &&
            tick <= bounds[0] + activeEnd * (bounds[1] - bounds[0]),
        }"
        :style="{ '--_yam3x-slider-tick-position': tickPosition(tick) }"
      />
      <span
        v-if="iconVisible"
        class="yam3x-slider__icon"
        :class="{ 'yam3x-slider__icon--active': iconOnActive }"
        aria-hidden="true"
        ><slot
      /></span>
    </div>
    <span
      v-for="index in activeIndexes"
      :key="index"
      class="yam3x-slider__thumb"
      :class="{ 'yam3x-slider__thumb--pressed': activePointer !== null && activeHandle === index }"
      :data-index="index"
      :style="{ '--_yam3x-slider-thumb-fraction': index === 0 ? lowerFraction : upperFraction }"
      @mouseenter="activeLabel = index"
      @mouseleave="activeLabel = null"
    >
      <span
        v-if="labelled && activeLabel === index"
        class="yam3x-slider__label"
        aria-hidden="true"
        >{{ formatted(values[index]) }}</span
      >
      <span
        class="yam3x-slider__handle"
        aria-hidden="true"
      />
      <input
        :ref="(element) => setInputRef(index, element)"
        type="range"
        class="yam3x-slider__input"
        :min="boundsFor(index)[0]"
        :max="boundsFor(index)[1]"
        step="any"
        :value="values[index]"
        :name="
          name ? (variant === 'range' ? `${name}-${index === 0 ? 'min' : 'max'}` : name) : undefined
        "
        :form="form"
        :disabled="disabled"
        :aria-label="
          variant === 'range'
            ? index === 0
              ? (lowerLabel ?? actionMessages.rangeMinimum(accessibleName))
              : (upperLabel ?? actionMessages.rangeMaximum(accessibleName))
            : accessibleName
        "
        :aria-labelledby="variant !== 'range' ? (attrs['aria-labelledby'] as string) : undefined"
        :aria-orientation="orientation"
        :aria-valuetext="
          formatted(values[index]) !== `${values[index]}` ? formatted(values[index]) : undefined
        "
        @focus="activeLabel = index"
        @blur="onBlur"
        @keydown="onKeydown($event, index)"
        @keyup="onKeyup"
      />
    </span>
  </div>
</template>

<style>
.yam3x-slider {
  /* Component token map: shared roles reference System tokens; Slider geometry stays local. */
  --_yam3x-slider-color-active-track: var(--md-sys-color-primary);
  --_yam3x-slider-color-inactive-track: var(--md-sys-color-secondary-container);
  --_yam3x-slider-color-handle: var(--md-sys-color-primary);
  --_yam3x-slider-color-stop-active: var(--md-sys-color-on-primary, white);
  --_yam3x-slider-color-stop-inactive: var(--md-sys-color-on-secondary-container);
  --_yam3x-slider-color-value-container: var(--md-sys-color-inverse-surface);
  --_yam3x-slider-color-value-label: var(--md-sys-color-inverse-on-surface);
  --_yam3x-slider-color-disabled: var(--md-sys-color-on-surface);
  --_yam3x-slider-color-disabled-stop-active: var(--md-sys-color-on-primary, white);
  --_yam3x-slider-color-disabled-stop-inactive: var(--md-sys-color-on-surface);
  --_yam3x-slider-color-focus: var(--md-sys-color-secondary);
  --_yam3x-slider-focus-thickness: var(--yam3x-focus-ring-thickness, 3px);
  --_yam3x-slider-motion-handle: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-slider-handle-shape: var(--md-sys-shape-corner-full);
  --_yam3x-slider-value-font-family: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-slider-value-font-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-slider-value-font-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-slider-value-line-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-slider-value-tracking: var(--md-sys-typescale-body-medium-tracking);
  --_yam3x-slider-track-height-extra-small: 16px;
  --_yam3x-slider-track-height-small: 24px;
  --_yam3x-slider-track-height-medium: 40px;
  --_yam3x-slider-track-height-large: 56px;
  --_yam3x-slider-track-height-extra-large: 96px;
  --_yam3x-slider-track-shape-extra-small: var(--md-sys-shape-corner-small);
  --_yam3x-slider-track-shape-small: var(--md-sys-shape-corner-small);
  --_yam3x-slider-track-shape-medium: var(--md-sys-shape-corner-medium);
  --_yam3x-slider-track-shape-large: var(--md-sys-shape-corner-large);
  --_yam3x-slider-track-shape-extra-large: var(--md-sys-shape-corner-extra-large);
  --_yam3x-slider-handle-height-extra-small: 44px;
  --_yam3x-slider-handle-height-small: 44px;
  --_yam3x-slider-handle-height-medium: 52px;
  --_yam3x-slider-handle-height-large: 68px;
  --_yam3x-slider-handle-height-extra-large: 108px;
  --_yam3x-slider-handle-width: 4px;
  --_yam3x-slider-handle-focused-width: 2px;
  --_yam3x-slider-handle-pressed-width: 2px;
  --_yam3x-slider-handle-spacing: 6px;
  --_yam3x-slider-stop-size: 4px;
  --_yam3x-slider-stop-shape: var(--md-sys-shape-corner-full);
  --_yam3x-slider-label-width: 48px;
  --_yam3x-slider-label-height: 44px;
  --_yam3x-slider-label-shape: var(--md-sys-shape-corner-large);
  --_yam3x-slider-track-inset: 8px;
  --_yam3x-slider-icon-offset: 18px;
  --_yam3x-slider-icon-size: 24px;
  --_yam3x-slider-icon-size-extra-large: 32px;
  --_yam3x-slider-value-indicator-gap: 4px;
  --_yam3x-slider-focus-shape: 12px;
  --_yam3x-slider-touch-target-size: 48px;
  --_yam3x-slider-min-length: 200px;
  --_yam3x-slider-container-height: var(--_yam3x-slider-container-height-extra-small);
  --_yam3x-slider-container-height-extra-small: 48px;
  --_yam3x-slider-container-height-small: 48px;
  --_yam3x-slider-disabled-active-track-opacity: 0.38;
  --_yam3x-slider-disabled-inactive-track-opacity: 0.12;
  --_yam3x-slider-disabled-handle-opacity: 0.38;
  --_yam3x-slider-disabled-stop-opacity: 0.38;
  --_yam3x-slider-track-height: var(--_yam3x-slider-track-height-extra-small);
  --_yam3x-slider-handle-length: var(--_yam3x-slider-handle-height-extra-small);
  --_yam3x-slider-track-radius: var(--_yam3x-slider-track-shape-extra-small);
  --_yam3x-slider-inner-radius: 3px;
  --_yam3x-slider-end-radius: var(--_yam3x-slider-track-radius);
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  inline-size: 100%;
  min-inline-size: var(--_yam3x-slider-min-length);
  block-size: var(--_yam3x-slider-container-height);
  color: var(--_yam3x-slider-color-active-track);
  user-select: none;
  touch-action: none;
  cursor: pointer;
}
.yam3x-slider[hidden] {
  display: none;
}
.yam3x-slider--small {
  --_yam3x-slider-track-height: var(--_yam3x-slider-track-height-small);
  --_yam3x-slider-handle-length: var(--_yam3x-slider-handle-height-small);
  --_yam3x-slider-track-radius: var(--_yam3x-slider-track-shape-small);
  --_yam3x-slider-end-radius: var(--_yam3x-slider-track-radius);
  --_yam3x-slider-container-height: var(--_yam3x-slider-container-height-small);
}
.yam3x-slider--medium {
  --_yam3x-slider-track-height: var(--_yam3x-slider-track-height-medium);
  --_yam3x-slider-handle-length: var(--_yam3x-slider-handle-height-medium);
  --_yam3x-slider-track-radius: var(--_yam3x-slider-track-shape-medium);
  --_yam3x-slider-end-radius: var(--_yam3x-slider-track-radius);
  --_yam3x-slider-container-height: var(--_yam3x-slider-handle-height-medium);
}
.yam3x-slider--large {
  --_yam3x-slider-track-height: var(--_yam3x-slider-track-height-large);
  --_yam3x-slider-handle-length: var(--_yam3x-slider-handle-height-large);
  --_yam3x-slider-track-radius: var(--_yam3x-slider-track-shape-large);
  --_yam3x-slider-end-radius: var(--_yam3x-slider-track-radius);
  --_yam3x-slider-container-height: var(--_yam3x-slider-handle-height-large);
}
.yam3x-slider--extra-large {
  --_yam3x-slider-track-height: var(--_yam3x-slider-track-height-extra-large);
  --_yam3x-slider-handle-length: var(--_yam3x-slider-handle-height-extra-large);
  --_yam3x-slider-track-radius: var(--_yam3x-slider-track-shape-extra-large);
  --_yam3x-slider-end-radius: var(--_yam3x-slider-track-radius);
  --_yam3x-slider-container-height: var(--_yam3x-slider-handle-height-extra-large);
}
.yam3x-slider--vertical {
  inline-size: max(var(--_yam3x-slider-touch-target-size), var(--_yam3x-slider-handle-length));
  min-inline-size: 0;
  block-size: 200px;
  min-block-size: var(--_yam3x-slider-min-length);
}
.yam3x-slider__track {
  position: absolute;
  inset-inline: var(--_yam3x-slider-track-inset);
  block-size: var(--_yam3x-slider-track-height);
  inset-block-start: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.yam3x-slider--vertical .yam3x-slider__track {
  inset-inline-start: 50%;
  inset-inline-end: auto;
  inset-block: var(--_yam3x-slider-track-inset);
  inline-size: var(--_yam3x-slider-track-height);
  block-size: auto;
  transform: translateX(-50%);
}
.yam3x-slider__inactive,
.yam3x-slider__active {
  position: absolute;
  inset-block: 0;
  box-sizing: border-box;
}
.yam3x-slider__inactive {
  background: var(--_yam3x-slider-color-inactive-track);
}
.yam3x-slider__inactive--before {
  inset-inline-start: 0;
  inline-size: var(--_yam3x-slider-before-size);
  border-radius: var(--_yam3x-slider-end-radius) var(--_yam3x-slider-inner-radius)
    var(--_yam3x-slider-inner-radius) var(--_yam3x-slider-end-radius);
}
.yam3x-slider__inactive--after {
  inset-inline-start: var(--_yam3x-slider-after-offset);
  inline-size: var(--_yam3x-slider-after-size);
  border-radius: var(--_yam3x-slider-inner-radius) var(--_yam3x-slider-end-radius)
    var(--_yam3x-slider-end-radius) var(--_yam3x-slider-inner-radius);
}
.yam3x-slider__active {
  inset-inline-start: var(--_yam3x-slider-active-offset);
  inline-size: var(--_yam3x-slider-active-size);
  border-radius: var(--_yam3x-slider-track-radius);
  background: var(--_yam3x-slider-color-active-track);
}
.yam3x-slider--vertical .yam3x-slider__inactive,
.yam3x-slider--vertical .yam3x-slider__active {
  inset-inline: 0;
  inset-block-start: auto;
  inline-size: auto;
}
.yam3x-slider--vertical .yam3x-slider__inactive--before {
  inset-block-end: 0;
  block-size: var(--_yam3x-slider-before-size);
  border-radius: var(--_yam3x-slider-inner-radius) var(--_yam3x-slider-inner-radius)
    var(--_yam3x-slider-end-radius) var(--_yam3x-slider-end-radius);
}
.yam3x-slider--vertical .yam3x-slider__inactive--after {
  inset-block-end: var(--_yam3x-slider-after-offset);
  block-size: var(--_yam3x-slider-after-size);
  border-radius: var(--_yam3x-slider-end-radius) var(--_yam3x-slider-end-radius)
    var(--_yam3x-slider-inner-radius) var(--_yam3x-slider-inner-radius);
}
.yam3x-slider--vertical .yam3x-slider__active {
  inset-block-end: var(--_yam3x-slider-active-offset);
  block-size: var(--_yam3x-slider-active-size);
}
.yam3x-slider__tick {
  position: absolute;
  z-index: 1;
  inline-size: var(--_yam3x-slider-stop-size);
  block-size: var(--_yam3x-slider-stop-size);
  inset-inline-start: var(--_yam3x-slider-tick-position);
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
  border-radius: var(--_yam3x-slider-stop-shape);
  background: var(--_yam3x-slider-color-stop-inactive);
}
[dir='rtl'] .yam3x-slider__tick,
[dir='rtl'].yam3x-slider .yam3x-slider__tick {
  transform: translate(50%, -50%);
}
.yam3x-slider__tick--active {
  background: var(--_yam3x-slider-color-stop-active);
}
.yam3x-slider--vertical .yam3x-slider__tick {
  inset-inline-start: 50%;
  inset-block-start: auto;
  inset-block-end: var(--_yam3x-slider-tick-position);
  transform: translate(50%, 50%);
}
.yam3x-slider__thumb {
  position: absolute;
  z-index: 2;
  inset-inline-start: calc(
    var(--_yam3x-slider-track-inset) +
      (100% - var(--_yam3x-slider-track-inset) - var(--_yam3x-slider-track-inset)) *
      var(--_yam3x-slider-thumb-fraction)
  );
  inset-block-start: 50%;
  inline-size: var(--_yam3x-slider-touch-target-size);
  block-size: max(var(--_yam3x-slider-touch-target-size), var(--_yam3x-slider-handle-length));
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
}
.yam3x-slider__thumb {
  --_yam3x-slider-thumb-fraction: 0;
}
[dir='rtl'] .yam3x-slider__thumb,
[dir='rtl'].yam3x-slider .yam3x-slider__thumb {
  transform: translate(50%, -50%);
}
.yam3x-slider__handle {
  inline-size: var(--_yam3x-slider-handle-width);
  block-size: var(--_yam3x-slider-handle-length);
  border-radius: var(--_yam3x-slider-handle-shape);
  background: var(--_yam3x-slider-color-handle);
  transition: inline-size var(--_yam3x-slider-motion-handle);
}
.yam3x-slider__thumb--pressed .yam3x-slider__handle {
  inline-size: var(--_yam3x-slider-handle-pressed-width);
}
.yam3x-slider__thumb:has(.yam3x-slider__input:focus-visible) .yam3x-slider__handle {
  inline-size: var(--_yam3x-slider-handle-focused-width);
}
.yam3x-slider__input {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
  pointer-events: none;
}
.yam3x-slider__thumb:has(.yam3x-slider__input:focus-visible)::after {
  content: '';
  position: absolute;
  inset: 0;
  border: var(--_yam3x-slider-focus-thickness) solid var(--_yam3x-slider-color-focus);
  border-radius: var(--_yam3x-slider-focus-shape);
  pointer-events: none;
}
.yam3x-slider__label {
  position: absolute;
  inset-block-end: calc(100% + var(--_yam3x-slider-value-indicator-gap));
  inline-size: var(--_yam3x-slider-label-width);
  min-block-size: var(--_yam3x-slider-label-height);
  display: grid;
  place-items: center;
  border-radius: var(--_yam3x-slider-label-shape);
  background: var(--_yam3x-slider-color-value-container);
  color: var(--_yam3x-slider-color-value-label);
  font-family: var(--_yam3x-slider-value-font-family);
  font-size: var(--_yam3x-slider-value-font-size);
  font-weight: var(--_yam3x-slider-value-font-weight);
  line-height: var(--_yam3x-slider-value-line-height);
  letter-spacing: var(--_yam3x-slider-value-tracking);
  white-space: nowrap;
  pointer-events: none;
}
.yam3x-slider__icon {
  position: absolute;
  inset-inline-start: var(--_yam3x-slider-icon-offset);
  inset-block-start: 50%;
  transform: translateY(-50%);
  inline-size: var(--_yam3x-slider-icon-size);
  block-size: var(--_yam3x-slider-icon-size);
  color: var(--_yam3x-slider-color-stop-inactive);
  display: grid;
  place-items: center;
}
.yam3x-slider__icon--active {
  color: var(--_yam3x-slider-color-stop-active);
}
.yam3x-slider__icon:not(.yam3x-slider__icon--active) {
  inset-inline-start: auto;
  inset-inline-end: var(--_yam3x-slider-icon-offset);
}
.yam3x-slider--extra-large .yam3x-slider__icon {
  inline-size: var(--_yam3x-slider-icon-size-extra-large);
  block-size: var(--_yam3x-slider-icon-size-extra-large);
}
.yam3x-slider--vertical .yam3x-slider__thumb {
  inset-inline-start: 50%;
  inset-block-start: auto;
  inset-block-end: calc(
    var(--_yam3x-slider-track-inset) +
      (100% - var(--_yam3x-slider-track-inset) - var(--_yam3x-slider-track-inset)) *
      var(--_yam3x-slider-thumb-fraction)
  );
  inline-size: max(var(--_yam3x-slider-touch-target-size), var(--_yam3x-slider-handle-length));
  block-size: var(--_yam3x-slider-touch-target-size);
  transform: translate(-50%, 50%);
}
[dir='rtl'] .yam3x-slider--vertical .yam3x-slider__thumb,
[dir='rtl'].yam3x-slider--vertical .yam3x-slider__thumb {
  transform: translate(50%, 50%);
}
.yam3x-slider--vertical .yam3x-slider__handle {
  inline-size: var(--_yam3x-slider-handle-length);
  block-size: var(--_yam3x-slider-handle-width);
}
.yam3x-slider--vertical .yam3x-slider__thumb--pressed .yam3x-slider__handle {
  block-size: var(--_yam3x-slider-handle-pressed-width);
}
.yam3x-slider--vertical
  .yam3x-slider__thumb:has(.yam3x-slider__input:focus-visible)
  .yam3x-slider__handle {
  block-size: var(--_yam3x-slider-handle-focused-width);
}
.yam3x-slider--vertical .yam3x-slider__label {
  inset-block-end: auto;
  inset-inline-start: calc(100% + 4px);
}
.yam3x-slider--vertical .yam3x-slider__icon {
  inset-inline-start: 50%;
  inset-block-start: auto;
  inset-block-end: 18px;
  transform: translateX(-50%);
}
.yam3x-slider--vertical .yam3x-slider__icon:not(.yam3x-slider__icon--active) {
  inset-inline-end: auto;
  inset-block-end: auto;
  inset-block-start: 18px;
}
.yam3x-slider--disabled {
  cursor: default;
}
.yam3x-slider--disabled .yam3x-slider__active {
  background: var(--_yam3x-slider-color-disabled);
  opacity: var(--_yam3x-slider-disabled-active-track-opacity);
}
.yam3x-slider--disabled .yam3x-slider__inactive {
  background: var(--_yam3x-slider-color-disabled);
  opacity: var(--_yam3x-slider-disabled-inactive-track-opacity);
}
.yam3x-slider--disabled .yam3x-slider__handle {
  background: var(--_yam3x-slider-color-disabled);
  opacity: var(--_yam3x-slider-disabled-handle-opacity);
}
.yam3x-slider--disabled .yam3x-slider__tick--active {
  background: var(--_yam3x-slider-color-disabled-stop-active);
  opacity: var(--_yam3x-slider-disabled-stop-opacity);
}
.yam3x-slider--disabled .yam3x-slider__tick:not(.yam3x-slider__tick--active) {
  background: var(--_yam3x-slider-color-disabled-stop-inactive);
  opacity: var(--_yam3x-slider-disabled-stop-opacity);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-slider__handle {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-slider__inactive {
    background: CanvasText;
    opacity: 0.35;
  }
  .yam3x-slider__active,
  .yam3x-slider__handle {
    background: Highlight;
  }
  .yam3x-slider__tick {
    background: CanvasText;
  }
  .yam3x-slider__tick--active {
    background: HighlightText;
  }
  .yam3x-slider__thumb:has(.yam3x-slider__input:focus-visible)::after {
    border-color: Highlight;
  }
}
</style>
