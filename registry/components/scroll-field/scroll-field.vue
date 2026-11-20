<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import {
  clampIndex,
  createScrollFieldCodec,
  createScrollFieldOptions,
  nearestLoopIndex,
  roundToPlaces,
  scrollFieldSpringProgress,
  scrollFieldIndex,
  wrapIndex,
} from './scroll-field.utils'
import type {
  ScrollFieldInvalidDetail,
  ScrollFieldMode,
  ScrollFieldSize,
} from './scroll-field.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    min?: number
    max?: number
    step?: number
    size?: ScrollFieldSize
    loop?: boolean
    unit?: string
    locale?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    invalid?: boolean
    error?: string
    name?: string
    form?: string
    id?: string
  }>(),
  {
    min: 0,
    max: 59,
    step: 1,
    size: 'medium',
    loop: false,
    unit: '',
    locale: undefined,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    error: '',
    name: undefined,
    form: undefined,
    id: undefined,
  },
)

const value = defineModel<number>()
const mode = defineModel<ScrollFieldMode>('mode', { default: 'scroll' })
const emit = defineEmits<{
  change: [value: number]
  invalid: [detail: ScrollFieldInvalidDetail]
  valid: []
}>()

const uid = useId().replace(/:/g, '')
const errorId = `yam3x-scroll-field-error-${uid}`
const options = computed(() => createScrollFieldOptions(props.min, props.max, props.step))
const count = computed(() => options.value.length)
const codec = computed(() => createScrollFieldCodec(props.locale, props.step))
const committedValue = computed(() => value.value ?? options.value[0] ?? props.min)
const currentIndex = computed(() => scrollFieldIndex(options.value, committedValue.value))

const cycles = 5
const viewport = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const track = ref<HTMLElement>()
const containerHeight = ref(200)
const itemHeight = ref(64)
const gap = ref(16)
const stride = computed(() => itemHeight.value + gap.value)
const padding = computed(() => Math.max(0, (containerHeight.value - itemHeight.value) / 2))
const totalItems = computed(() =>
  count.value === 0 ? 0 : props.loop ? count.value * cycles : count.value,
)
const activeIndex = ref(0)
const scrollOffset = ref(0)
const dragging = ref(false)
const windowStart = ref(0)
const windowEnd = ref(0)
const draft = ref('')
const inputInvalid = ref(false)
const hasError = computed(() => Boolean(props.error) || props.invalid || inputInvalid.value)

const renderedItems = computed(() => {
  const items: Array<{ index: number; value: number; progress: number }> = []
  const center = scrollOffset.value + containerHeight.value / 2
  for (let index = windowStart.value; index <= windowEnd.value; index += 1) {
    const option = options.value[wrapIndex(index, count.value)]
    if (option === undefined) continue
    const itemCenter = itemTop(index) + itemHeight.value / 2
    const distance = Math.abs(itemCenter - center) / (stride.value || 1)
    items.push({ index, value: option, progress: Math.max(0, Math.min(1, 1 - distance)) })
  }
  return items
})

const trackHeight = computed(() => {
  if (!totalItems.value) return containerHeight.value
  return Math.max(
    containerHeight.value,
    padding.value * 2 + totalItems.value * stride.value - gap.value,
  )
})

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

function initialIndex(): number {
  if (props.loop) {
    return Math.floor(cycles / 2) * count.value + currentIndex.value
  }
  return currentIndex.value
}

function updateWindow(top = viewport.value?.scrollTop ?? 0) {
  if (!totalItems.value) {
    windowStart.value = 0
    windowEnd.value = -1
    return
  }
  const first = Math.floor((top - padding.value) / stride.value)
  const visible = Math.ceil(containerHeight.value / stride.value)
  windowStart.value = clampIndex(first - 2, totalItems.value)
  windowEnd.value = clampIndex(first + visible + 2, totalItems.value)
}

function itemTop(index: number): number {
  return padding.value + index * stride.value
}

function syncActiveFromScroll() {
  const element = viewport.value
  if (!element || !totalItems.value) return
  const next = clampIndex(Math.round(element.scrollTop / stride.value), totalItems.value)
  if (next !== activeIndex.value) {
    activeIndex.value = next
  }
  updateWindow(element.scrollTop)
}

let frame = 0
let settleTimer: ReturnType<typeof setTimeout> | undefined
let suppressValueWatch = false

function onScroll() {
  if (mode.value !== 'scroll') return
  if (!frame) {
    frame = requestAnimationFrame(() => {
      frame = 0
      scrollOffset.value = viewport.value?.scrollTop ?? 0
      syncActiveFromScroll()
    })
  }
  if (drag) return
  if (settleTimer) clearTimeout(settleTimer)
  settleTimer = setTimeout(settle, 120)
}

function commit(index: number) {
  const option = options.value[wrapIndex(index, count.value)]
  if (option === undefined) return
  if (value.value !== option) {
    value.value = option
    emit('change', option)
  }
}

function settle() {
  const element = viewport.value
  if (!element || mode.value !== 'scroll' || !totalItems.value || animating) return
  if (props.readonly) {
    const target = props.loop
      ? nearestLoopIndex(currentIndex.value, activeIndex.value, count.value, cycles)
      : currentIndex.value
    animateScrollTo(target * stride.value, () => {
      scrollOffset.value = target * stride.value
      updateWindow(scrollOffset.value)
    })
    return
  }
  let index = clampIndex(Math.round(element.scrollTop / stride.value), totalItems.value)
  if (
    props.loop &&
    count.value > 0 &&
    (index < count.value || index >= totalItems.value - count.value)
  ) {
    // Whole cycles repeat the same values, so shifting the scroll origin is invisible.
    const recentered = Math.floor(cycles / 2) * count.value + wrapIndex(index, count.value)
    element.scrollTop = recentered * stride.value
    index = recentered
  }
  const targetTop = index * stride.value
  if (Math.abs(element.scrollTop - targetTop) > 1) {
    animateScrollTo(targetTop, () => finalizeSelection(index))
  } else {
    finalizeSelection(index)
  }
}

function finalizeSelection(index: number) {
  activeIndex.value = index
  scrollOffset.value = viewport.value?.scrollTop ?? 0
  updateWindow(scrollOffset.value)
  suppressValueWatch = false
  commit(index)
}

let animationFrame = 0
let animating = false

function cancelScrollAnimation() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
  animating = false
}

function animateScrollTo(target: number, done: () => void) {
  const element = viewport.value
  if (!element) return
  cancelScrollAnimation()
  const start = element.scrollTop
  const distance = target - start
  if (Math.abs(distance) < 1 || prefersReducedMotion()) {
    element.scrollTop = target
    scrollOffset.value = target
    done()
    return
  }
  animating = true
  const started = performance.now()
  const tick = () => {
    const elapsed = (performance.now() - started) / 1000
    element.scrollTop = start + distance * Math.min(scrollFieldSpringProgress(elapsed), 1.001)
    scrollOffset.value = element.scrollTop
    if (elapsed < 0.6 && Math.abs(element.scrollTop - target) > 0.5) {
      animationFrame = requestAnimationFrame(tick)
      return
    }
    element.scrollTop = target
    scrollOffset.value = target
    animating = false
    animationFrame = 0
    done()
  }
  animationFrame = requestAnimationFrame(tick)
}

function scrollToIndex(index: number, shouldCommit: boolean) {
  if (!totalItems.value) return
  const target = clampIndex(index, totalItems.value)
  activeIndex.value = target
  const element = viewport.value
  if (element) {
    animateScrollTo(target * stride.value, () => {
      scrollOffset.value = target * stride.value
      updateWindow(target * stride.value)
    })
  } else {
    updateWindow(target * stride.value)
  }
  if (shouldCommit) {
    suppressValueWatch = true
    commit(target)
  }
}

function scrollToValueIndex(valueIndex: number, shouldCommit: boolean) {
  const target = props.loop
    ? nearestLoopIndex(valueIndex, activeIndex.value, count.value, cycles)
    : valueIndex
  scrollToIndex(target, shouldCommit)
}

function moveSelection(delta: number) {
  if (!count.value) return
  const from = currentIndex.value
  const next = props.loop
    ? wrapIndex(from + delta, count.value)
    : clampIndex(from + delta, count.value)
  scrollToValueIndex(next, true)
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled || props.readonly || !count.value) return
  if (props.loop) {
    if (event.key === 'Home') {
      event.preventDefault()
      scrollToValueIndex(0, true)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      scrollToValueIndex(count.value - 1, true)
      return
    }
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    scrollToValueIndex(event.key === 'Home' ? 0 : count.value - 1, true)
    return
  }
  const deltas: Record<string, number> = {
    ArrowDown: 1,
    ArrowUp: -1,
    PageDown: 5,
    PageUp: -5,
  }
  const delta = deltas[event.key]
  if (delta === undefined) return
  event.preventDefault()
  moveSelection(delta)
}

let drag: { startY: number; startTop: number; moved: boolean } | null = null
let dragPoint: { y: number; time: number } | null = null
let dragVelocity = 0
let suppressClick = false

function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  if (props.disabled || props.readonly) return
  const element = viewport.value
  if (!element) return
  cancelScrollAnimation()
  suppressValueWatch = false
  drag = { startY: event.clientY, startTop: element.scrollTop, moved: false }
  dragPoint = { y: event.clientY, time: performance.now() }
  dragVelocity = 0
  dragging.value = true
  element.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!drag || !viewport.value) return
  const delta = event.clientY - drag.startY
  if (Math.abs(delta) > 3) drag.moved = true
  const now = performance.now()
  if (dragPoint) {
    const elapsed = Math.max(now - dragPoint.time, 1)
    dragVelocity = dragVelocity * 0.6 + ((event.clientY - dragPoint.y) / elapsed) * 0.4
  }
  dragPoint = { y: event.clientY, time: now }
  viewport.value.scrollTop = drag.startTop - delta
}

function onPointerUp(event: PointerEvent) {
  if (!drag) return
  const moved = drag.moved
  drag = null
  dragPoint = null
  dragging.value = false
  if (viewport.value?.hasPointerCapture(event.pointerId)) {
    viewport.value.releasePointerCapture(event.pointerId)
  }
  if (!moved) return
  suppressClick = true
  window.setTimeout(() => {
    suppressClick = false
  }, 0)
  const projected = (viewport.value?.scrollTop ?? 0) - dragVelocity * 180
  const index = clampIndex(Math.round(projected / stride.value), totalItems.value)
  if (Math.abs(dragVelocity) > 0.2 && index !== activeIndex.value) {
    scrollToIndex(index, true)
    return
  }
  settle()
}

function selectItem(index: number) {
  if (props.disabled || props.readonly || suppressClick) return
  scrollToIndex(index, true)
  viewport.value?.focus()
}

function measure() {
  const element = viewport.value
  if (!element) return
  const style = getComputedStyle(element)
  const nextItem = Number.parseFloat(
    style.getPropertyValue('--_yam3x-scroll-field-item-height') || '64',
  )
  const nextGap = Number.parseFloat(
    style.getPropertyValue('--_yam3x-scroll-field-item-gap') || '16',
  )
  const nextHeight = element.clientHeight
  if (Number.isFinite(nextItem) && nextItem > 0) itemHeight.value = nextItem
  if (Number.isFinite(nextGap) && nextGap >= 0) gap.value = nextGap
  if (nextHeight > 0) containerHeight.value = nextHeight
}

function resetPosition() {
  measure()
  const index = initialIndex()
  activeIndex.value = index
  scrollOffset.value = index * stride.value
  updateWindow(scrollOffset.value)
  if (viewport.value) viewport.value.scrollTop = scrollOffset.value
}

function openInput() {
  draft.value = codec.value.format(committedValue.value)
  inputInvalid.value = false
  void nextTick(() => {
    input.value?.focus()
    input.value?.select()
  })
}

watch(mode, (next) => {
  if (next === 'input') {
    openInput()
    return
  }
  void nextTick(() => {
    const element = viewport.value
    if (!element) return
    measure()
    const index = props.loop
      ? nearestLoopIndex(currentIndex.value, activeIndex.value, count.value, cycles)
      : currentIndex.value
    activeIndex.value = index
    element.scrollTop = index * stride.value
    updateWindow(element.scrollTop)
    element.focus()
  })
})

watch(committedValue, (next) => {
  if (suppressValueWatch) return
  if (mode.value === 'input' && document.activeElement !== input.value) {
    draft.value = codec.value.format(next)
    inputInvalid.value = false
  }
  const targetIndex = scrollFieldIndex(options.value, next)
  if (props.loop) {
    const current = activeIndex.value
    const optionIndex = wrapIndex(current, count.value)
    if (optionIndex !== targetIndex) scrollToValueIndex(targetIndex, false)
  } else if (activeIndex.value !== targetIndex) {
    scrollToIndex(targetIndex, false)
  }
})

watch(
  () => [props.min, props.max, props.step, props.loop, count.value],
  () => {
    const clamped = options.value[scrollFieldIndex(options.value, value.value)]
    if (value.value !== undefined && clamped !== undefined && clamped !== value.value) {
      value.value = clamped
      emit('change', clamped)
    }
    resetPosition()
    if (mode.value === 'input') draft.value = codec.value.format(committedValue.value)
  },
)

function markInvalid(reason: ScrollFieldInvalidDetail['reason']) {
  inputInvalid.value = true
  emit('invalid', { reason, value: draft.value })
}

function commitInput() {
  const parsed = codec.value.parse(draft.value)
  if (parsed === null) {
    markInvalid('badInput')
    return false
  }
  const rounded = roundToPlaces(parsed, codec.value.places)
  const steps = (rounded - props.min) / props.step
  if (Math.abs(steps - Math.round(steps)) > 1e-9) {
    markInvalid('stepMismatch')
    return false
  }
  if (rounded < props.min) {
    markInvalid('rangeUnderflow')
    return false
  }
  if (rounded > props.max) {
    markInvalid('rangeOverflow')
    return false
  }
  inputInvalid.value = false
  draft.value = codec.value.format(rounded)
  const option = options.value[scrollFieldIndex(options.value, rounded)]
  if (option !== undefined && option !== value.value) {
    value.value = option
    emit('change', option)
  }
  emit('valid')
  return true
}

function onInput(event: Event) {
  draft.value = (event.target as HTMLInputElement).value
  inputInvalid.value = false
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    commitInput()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    draft.value = codec.value.format(committedValue.value)
    inputInvalid.value = false
  }
}

function onInputBlur() {
  commitInput()
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  resetPosition()
  if (typeof ResizeObserver !== 'undefined' && viewport.value) {
    resizeObserver = new ResizeObserver(() => resetPosition())
    resizeObserver.observe(viewport.value)
  }
  if (mode.value === 'input') openInput()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (frame) cancelAnimationFrame(frame)
  if (settleTimer) clearTimeout(settleTimer)
})
</script>

<template>
  <div
    class="yam3x-scroll-field"
    :class="[
      `yam3x-scroll-field--${props.size}`,
      `yam3x-scroll-field--${mode}`,
      {
        'yam3x-scroll-field--disabled': props.disabled,
        'yam3x-scroll-field--invalid': hasError,
      },
    ]"
    v-bind="$attrs"
  >
    <div
      v-if="mode === 'scroll'"
      class="yam3x-scroll-field__frame"
    >
      <div
        :id="props.id"
        ref="viewport"
        class="yam3x-scroll-field__viewport"
        role="spinbutton"
        :tabindex="props.disabled ? -1 : 0"
        :aria-label="props.label"
        :aria-valuemin="props.min"
        :aria-valuemax="props.max"
        :aria-valuenow="committedValue"
        :aria-valuetext="`${codec.format(committedValue)}${props.unit ? ` ${props.unit}` : ''}`"
        :aria-required="props.required || undefined"
        :aria-disabled="props.disabled || undefined"
        :aria-readonly="props.readonly || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="props.error ? errorId : undefined"
        :class="{ 'yam3x-scroll-field__viewport--dragging': dragging }"
        @keydown="onKeydown"
        @scroll.passive="onScroll"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <div
          ref="track"
          class="yam3x-scroll-field__track"
          :style="{ height: `${trackHeight}px` }"
          :aria-hidden="true"
        >
          <div
            v-for="item in renderedItems"
            :key="item.index"
            class="yam3x-scroll-field__item"
            :class="{ 'yam3x-scroll-field__item--active': item.index === activeIndex }"
            :style="{
              transform: `translateY(${itemTop(item.index)}px)`,
              '--_yam3x-scroll-field-item-progress': String(item.progress),
            }"
            :data-value="item.value"
            :data-index="item.index"
            @click="selectItem(item.index)"
          >
            {{ codec.format(item.value) }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="yam3x-scroll-field__control"
    >
      <input
        :id="props.id"
        ref="input"
        class="yam3x-scroll-field__input"
        type="text"
        role="spinbutton"
        :inputmode="codec.inputMode"
        autocomplete="off"
        spellcheck="false"
        :value="draft"
        :aria-label="props.label"
        :aria-valuemin="props.min"
        :aria-valuemax="props.max"
        :aria-valuenow="committedValue"
        :aria-valuetext="`${codec.format(committedValue)}${props.unit ? ` ${props.unit}` : ''}`"
        :aria-required="props.required || undefined"
        :aria-disabled="props.disabled || undefined"
        :aria-readonly="props.readonly || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="props.error ? errorId : undefined"
        :disabled="props.disabled"
        :readonly="props.readonly"
        @input="onInput"
        @keydown="onInputKeydown"
        @blur="onInputBlur"
      />
    </div>
    <input
      v-if="props.name"
      type="hidden"
      :name="props.name"
      :form="props.form"
      :value="String(committedValue)"
      :disabled="props.disabled"
    />
    <p
      v-if="props.error"
      :id="errorId"
      class="yam3x-scroll-field__error"
      role="alert"
    >
      {{ props.error }}
    </p>
  </div>
</template>

<style scoped>
.yam3x-scroll-field {
  --_yam3x-scroll-field-width-fallback: 120px;
  --_yam3x-scroll-field-height: var(--yam3x-scroll-field-height, 200px);
  --_yam3x-scroll-field-min-height: 120px;
  --_yam3x-scroll-field-shape: var(--md-sys-shape-corner-large);
  --_yam3x-scroll-field-container-color: var(--md-sys-color-surface-container-lowest);
  --_yam3x-scroll-field-selected-color: var(--md-sys-color-on-surface);
  --_yam3x-scroll-field-unselected-color: var(--md-sys-color-outline);
  --_yam3x-scroll-field-active-color: var(--md-sys-color-primary);
  --_yam3x-scroll-field-outline-color: var(--md-sys-color-primary);
  --_yam3x-scroll-field-outline-width: 2px;
  --_yam3x-scroll-field-focus-color: var(--md-sys-color-secondary);
  --_yam3x-scroll-field-focus-width: 3px;
  --_yam3x-scroll-field-focus-offset: 2px;
  --_yam3x-scroll-field-state-layer-color: var(--md-sys-color-on-surface);
  --_yam3x-scroll-field-state-hover-opacity: var(--md-sys-state-hover-opacity);
  --_yam3x-scroll-field-state-pressed-opacity: var(--md-sys-state-pressed-opacity);
  --_yam3x-scroll-field-item-height: var(--yam3x-scroll-field-item-height, 64px);
  --_yam3x-scroll-field-item-gap: 16px;
  --_yam3x-scroll-field-inline-padding: 16px;
  --_yam3x-scroll-field-selected-size: var(--md-sys-typescale-display-large-font-size);
  --_yam3x-scroll-field-selected-line-height: var(
    --md-sys-typescale-display-large-line-height-small
  );
  --_yam3x-scroll-field-selected-weight: var(
    --md-sys-typescale-emphasized-display-large-font-weight
  );
  --_yam3x-scroll-field-unselected-size: var(--md-sys-typescale-display-medium-font-size);
  --_yam3x-scroll-field-unselected-line-height: var(
    --md-sys-typescale-display-medium-line-height-small
  );
  --_yam3x-scroll-field-unselected-weight: var(--md-sys-typescale-display-medium-font-weight);
  --_yam3x-scroll-field-disabled-opacity: 38%;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  inline-size: var(--yam3x-scroll-field-width, var(--_yam3x-scroll-field-width-fallback));
  max-inline-size: 100%;
  color: var(--_yam3x-scroll-field-selected-color);
  font-family: var(--md-sys-typescale-display-medium-font-family);
}
.yam3x-scroll-field--small {
  --_yam3x-scroll-field-width-fallback: 100px;
}
.yam3x-scroll-field--medium {
  --_yam3x-scroll-field-width-fallback: 120px;
}
.yam3x-scroll-field--large {
  --_yam3x-scroll-field-width-fallback: 186px;
  --_yam3x-scroll-field-inline-padding: 24px;
}
.yam3x-scroll-field__frame {
  position: relative;
  border-radius: var(--_yam3x-scroll-field-shape);
}
.yam3x-scroll-field__frame::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: inherit;
  background: var(--_yam3x-scroll-field-state-layer-color);
  content: '';
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-spring-fast-effects);
}
.yam3x-scroll-field__frame:hover::before {
  opacity: var(--_yam3x-scroll-field-state-hover-opacity);
}
.yam3x-scroll-field__frame:focus-within::before,
.yam3x-scroll-field__frame:active::before {
  opacity: var(--_yam3x-scroll-field-state-pressed-opacity);
}
.yam3x-scroll-field__viewport {
  position: relative;
  box-sizing: border-box;
  inline-size: 100%;
  block-size: var(--_yam3x-scroll-field-height);
  min-block-size: var(--_yam3x-scroll-field-min-height);
  padding-inline: var(--_yam3x-scroll-field-inline-padding);
  border-radius: var(--_yam3x-scroll-field-shape);
  background: var(--_yam3x-scroll-field-container-color);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  user-select: none;
  touch-action: pan-y;
  cursor: grab;
}
.yam3x-scroll-field__viewport--dragging {
  cursor: grabbing;
}
.yam3x-scroll-field__viewport::-webkit-scrollbar {
  display: none;
}
.yam3x-scroll-field__viewport:focus-visible {
  outline: var(--_yam3x-scroll-field-focus-width) solid var(--_yam3x-scroll-field-focus-color);
  outline-offset: var(--_yam3x-scroll-field-focus-offset);
}
.yam3x-scroll-field__track {
  position: relative;
  inline-size: 100%;
}
.yam3x-scroll-field__item {
  position: absolute;
  inset-inline: 0;
  display: grid;
  place-items: center;
  --_yam3x-scroll-field-item-progress: 0;
  block-size: var(--_yam3x-scroll-field-item-height);
  color: var(--_yam3x-scroll-field-unselected-color);
  color: color-mix(
    in srgb,
    var(--_yam3x-scroll-field-unselected-color)
      calc((1 - var(--_yam3x-scroll-field-item-progress)) * 100%),
    var(--_yam3x-scroll-field-selected-color)
  );
  font-size: calc(
    var(--_yam3x-scroll-field-unselected-size) +
      (var(--_yam3x-scroll-field-selected-size) - var(--_yam3x-scroll-field-unselected-size)) *
      var(--_yam3x-scroll-field-item-progress)
  );
  font-weight: var(--_yam3x-scroll-field-unselected-weight);
  font-weight: calc(
    var(--_yam3x-scroll-field-unselected-weight) +
      (var(--_yam3x-scroll-field-selected-weight) - var(--_yam3x-scroll-field-unselected-weight)) *
      var(--_yam3x-scroll-field-item-progress)
  );
  line-height: calc(
    var(--_yam3x-scroll-field-unselected-line-height) +
      (
        var(--_yam3x-scroll-field-selected-line-height) -
          var(--_yam3x-scroll-field-unselected-line-height)
      ) *
      var(--_yam3x-scroll-field-item-progress)
  );
  cursor: pointer;
}
.yam3x-scroll-field__control {
  box-sizing: border-box;
  inline-size: 100%;
  block-size: var(--_yam3x-scroll-field-height);
  min-block-size: var(--_yam3x-scroll-field-min-height);
  border: var(--_yam3x-scroll-field-outline-width) solid var(--_yam3x-scroll-field-outline-color);
  border-radius: var(--_yam3x-scroll-field-shape);
  background: var(--_yam3x-scroll-field-container-color);
}
.yam3x-scroll-field__input {
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 100%;
  padding-inline: var(--_yam3x-scroll-field-inline-padding);
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: var(--_yam3x-scroll-field-active-color);
  font: inherit;
  font-family: var(--md-sys-typescale-display-large-font-family);
  font-size: var(--_yam3x-scroll-field-selected-size);
  font-weight: var(--_yam3x-scroll-field-selected-weight);
  line-height: var(--_yam3x-scroll-field-selected-line-height);
  text-align: center;
  caret-color: var(--_yam3x-scroll-field-active-color);
}
.yam3x-scroll-field__input:focus {
  outline: none;
}
.yam3x-scroll-field--disabled {
  opacity: var(--_yam3x-scroll-field-disabled-opacity);
  cursor: not-allowed;
}
.yam3x-scroll-field--disabled .yam3x-scroll-field__viewport {
  pointer-events: none;
}
.yam3x-scroll-field--invalid .yam3x-scroll-field__control {
  border-color: var(--md-sys-color-error);
}
.yam3x-scroll-field--invalid .yam3x-scroll-field__input {
  color: var(--md-sys-color-error);
  caret-color: var(--md-sys-color-error);
}
.yam3x-scroll-field__error {
  margin: 0;
  color: var(--md-sys-color-error);
  font-family: var(--md-sys-typescale-body-small-font-family);
  font-size: var(--md-sys-typescale-body-small-font-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-scroll-field__frame::before {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-scroll-field__viewport,
  .yam3x-scroll-field__control {
    border: 1px solid CanvasText;
  }
  .yam3x-scroll-field__item--active {
    color: CanvasText;
  }
}
</style>
