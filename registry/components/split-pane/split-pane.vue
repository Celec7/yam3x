<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import type { SplitPaneOrientation } from './split-pane.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    detents?: number[]
    wrapDetents?: boolean
    orientation?: SplitPaneOrientation
    label: string
    valueText?: string
    disabled?: boolean
    overshootLimit?: number
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    detents: () => [],
    wrapDetents: false,
    orientation: 'horizontal',
    valueText: undefined,
    disabled: false,
    overshootLimit: 4,
  },
)

const model = defineModel<number>({ default: 50 })
const compactPane = defineModel<'primary' | 'supporting'>('compactPane', { default: 'primary' })
const emit = defineEmits<{
  beforeinput: [event: Event, value: number]
  input: [event: Event, value: number]
  change: [event: Event, value: number]
}>()
defineSlots<{
  start?(): unknown
  end?(): unknown
}>()

type DragState = {
  pointerId: number
  startValue: number
  lastValue: number
  startX: number
  startY: number
  availableSize: number
  changed: boolean
  moved: boolean
  interruptedSettle: boolean
}

const root = ref<HTMLElement | null>(null)
const startPane = ref<HTMLElement | null>(null)
const endPane = ref<HTMLElement | null>(null)
const hasStart = ref(false)
const hasEnd = ref(false)
const compact = ref(false)
const expanded = ref(false)
const dragging = ref(false)
const settling = ref(false)
const previewValue = ref<number | null>(null)
const measuredSize = ref({ inline: 0, track: 0 })
const startPaneId = `yam3x-split-pane-start-${useId().replace(/:/g, '')}`
const minValue = computed(() => finiteClamp(props.min, 0, 100))
const maxValue = computed(() =>
  Math.max(minValue.value, finiteClamp(props.max, minValue.value, 100)),
)
const stepValue = computed(() => (Number.isFinite(props.step) && props.step > 0 ? props.step : 1))
const overshootLimit = computed(() => finiteClamp(props.overshootLimit, 0, 100))
const value = computed(() => finiteClamp(model.value, minValue.value, maxValue.value))
const visualValue = computed(() => previewValue.value ?? value.value)
const resolvedOrientation = computed<'horizontal' | 'vertical'>(() => {
  if (props.orientation === 'auto') return expanded.value ? 'horizontal' : 'vertical'
  return props.orientation
})
const validDetents = computed(() =>
  [
    ...new Set(
      props.detents
        .filter(Number.isFinite)
        .map((detent) => finiteClamp(detent, minValue.value, maxValue.value)),
    ),
  ].sort((a, b) => a - b),
)
const collapsedValue = computed(() => validDetents.value[0] ?? minValue.value)
const ariaValueText = computed(
  () =>
    props.valueText ||
    `Start pane ${Math.round(value.value)}%, end pane ${Math.round(100 - value.value)}%`,
)
const style = computed(() => ({
  '--_yam3x-split-pane-start-size': `${Math.max(0, ((measuredSize.value.inline - measuredSize.value.track) * visualValue.value) / 100)}px`,
}))

let compactMedia: MediaQueryList | null = null
let expandedMedia: MediaQueryList | null = null
let observer: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null
let observedSeparator: HTMLElement | null = null
let drag: DragState | null = null
let pendingPointer: { pointerId: number; clientX: number; clientY: number } | null = null
let dragFrame: number | null = null
let settleTimer: ReturnType<typeof setTimeout> | undefined
let lastExpandedValue = 50

function finiteClamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}
function updatePanePresence() {
  const previousPresence = `${hasStart.value}:${hasEnd.value}`
  hasStart.value = [...(startPane.value?.children ?? [])].some(
    (element) => !element.hasAttribute('hidden'),
  )
  hasEnd.value = [...(endPane.value?.children ?? [])].some(
    (element) => !element.hasAttribute('hidden'),
  )
  if (previousPresence !== `${hasStart.value}:${hasEnd.value}`) observeSeparator()
}
function updateMeasuredSize() {
  if (!root.value) return
  const rootBounds = root.value.getBoundingClientRect()
  const separatorBounds = root.value
    .querySelector<HTMLElement>('[role="separator"]')
    ?.getBoundingClientRect()
  const horizontal = resolvedOrientation.value === 'horizontal'
  measuredSize.value = {
    inline: horizontal ? rootBounds.width : rootBounds.height,
    track: separatorBounds ? (horizontal ? separatorBounds.width : separatorBounds.height) : 0,
  }
}
function observeSeparator() {
  if (!resizeObserver || !root.value) return
  const next = root.value.querySelector<HTMLElement>('[role="separator"]')
  if (observedSeparator === next) return
  if (observedSeparator) resizeObserver.unobserve(observedSeparator)
  observedSeparator = next
  if (observedSeparator) resizeObserver.observe(observedSeparator)
  updateMeasuredSize()
}
function onMediaChange() {
  compact.value = !!compactMedia?.matches
  expanded.value = !!expandedMedia?.matches
}
function syncOrientation() {
  compactMedia?.removeEventListener('change', onMediaChange)
  expandedMedia?.removeEventListener('change', onMediaChange)
  compactMedia = null
  expandedMedia = null
  if (props.orientation !== 'auto' || typeof window === 'undefined') {
    compact.value = false
    expanded.value = false
    return
  }
  compactMedia = window.matchMedia('(max-width: 599.98px)')
  expandedMedia = window.matchMedia('(min-width: 840px)')
  onMediaChange()
  compactMedia.addEventListener('change', onMediaChange)
  expandedMedia.addEventListener('change', onMediaChange)
}
function dispatchCancelable(type: 'beforeinput', nextValue: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  emit(type, event, nextValue)
  root.value?.dispatchEvent(event)
  return !event.defaultPrevented
}
function dispatchValueEvent(type: 'input' | 'change', nextValue: number) {
  const event = new Event(type, { bubbles: true })
  if (type === 'input') emit('input', event, nextValue)
  else emit('change', event, nextValue)
  root.value?.dispatchEvent(event)
}
function updateValue(nextValue: number, final = false) {
  const next = finiteClamp(nextValue, minValue.value, maxValue.value)
  if (Math.abs(next - value.value) < 0.0001) return false
  if (!dispatchCancelable('beforeinput', next)) return false
  model.value = next
  if (next > collapsedValue.value) lastExpandedValue = next
  dispatchValueEvent('input', next)
  if (final) dispatchValueEvent('change', next)
  return true
}
function startSettling() {
  if (settleTimer) clearTimeout(settleTimer)
  settling.value = true
  settleTimer = setTimeout(() => {
    settling.value = false
    settleTimer = undefined
  }, 320)
}
function stopSettling() {
  if (settleTimer) clearTimeout(settleTimer)
  settleTimer = undefined
  settling.value = false
}
function nearestDetent(target: number) {
  const anchors = validDetents.value
  if (!anchors.length) return finiteClamp(target, minValue.value, maxValue.value)
  return anchors.reduce(
    (closest, anchor) =>
      Math.abs(anchor - target) < Math.abs(closest - target) ? anchor : closest,
    anchors[0]!,
  )
}
function adjacentDetent(direction: -1 | 1) {
  const anchors = validDetents.value
  const candidates = direction > 0 ? anchors : [...anchors].reverse()
  return candidates.find((anchor) =>
    direction > 0 ? anchor > value.value + 0.0001 : anchor < value.value - 0.0001,
  )
}
function snapToValue(target: number) {
  updateValue(nearestDetent(target), true)
}
function collapse() {
  snapToValue(minValue.value)
}
function expand() {
  snapToValue(maxValue.value)
}
function cycleDetent() {
  const anchors = validDetents.value
  if (!anchors.length) return
  const next = anchors.find((anchor) => anchor > value.value + 0.0001)
  const target = next ?? (props.wrapDetents ? anchors[0] : value.value)
  if (target !== value.value) snapToValue(target)
}
function keyboardTarget(key: string) {
  const horizontal = resolvedOrientation.value === 'horizontal'
  const rtl = horizontal && root.value ? getComputedStyle(root.value).direction === 'rtl' : false
  if ((horizontal && key === 'ArrowLeft') || (!horizontal && key === 'ArrowUp'))
    return value.value + (horizontal && rtl ? stepValue.value : -stepValue.value)
  if ((horizontal && key === 'ArrowRight') || (!horizontal && key === 'ArrowDown'))
    return value.value + (horizontal && rtl ? -stepValue.value : stepValue.value)
  return null
}
function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || props.disabled) return
  const target = keyboardTarget(event.key)
  if (target !== null) {
    event.preventDefault()
    if (validDetents.value.length) {
      const next = adjacentDetent(target > value.value ? 1 : -1)
      if (next !== undefined) updateValue(next, true)
    } else updateValue(target, true)
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    snapToValue(minValue.value)
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    snapToValue(maxValue.value)
    return
  }
  if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault()
    const direction = event.key === 'PageUp' ? -1 : 1
    if (validDetents.value.length) {
      const next = adjacentDetent(direction)
      if (next !== undefined) updateValue(next, true)
    } else updateValue(value.value + direction * Math.max(10, stepValue.value), true)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    if (Math.abs(value.value - collapsedValue.value) < 0.0001) snapToValue(lastExpandedValue)
    else {
      lastExpandedValue = value.value
      collapse()
    }
    return
  }
  if (event.key === ' ' && validDetents.value.length) {
    event.preventDefault()
    cycleDetent()
  }
}
function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0 || !event.isPrimary || !root.value) return
  event.preventDefault()
  const bounds = root.value.getBoundingClientRect()
  const separator = event.currentTarget as HTMLElement
  const separatorBounds = separator.getBoundingClientRect()
  const horizontal = resolvedOrientation.value === 'horizontal'
  const availableSize = horizontal
    ? bounds.width - separatorBounds.width
    : bounds.height - separatorBounds.height
  const interruptedSettle = settling.value
  const paneBounds = startPane.value?.getBoundingClientRect()
  const startValue =
    interruptedSettle && paneBounds
      ? finiteClamp(
          ((horizontal ? paneBounds.width : paneBounds.height) / Math.max(1, availableSize)) * 100,
          minValue.value,
          maxValue.value,
        )
      : value.value
  if (interruptedSettle) previewValue.value = startValue
  stopSettling()
  drag = {
    pointerId: event.pointerId,
    startValue,
    lastValue: startValue,
    startX: event.clientX,
    startY: event.clientY,
    availableSize,
    changed: false,
    moved: false,
    interruptedSettle,
  }
  dragging.value = true
  ;(event.currentTarget as HTMLElement).focus()
  try {
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  } catch {
    /* pointer may already be canceled */
  }
}
function applyPointerPosition(clientX: number, clientY: number) {
  if (!drag || props.disabled) return
  const horizontal = resolvedOrientation.value === 'horizontal'
  const direction =
    horizontal && root.value && getComputedStyle(root.value).direction === 'rtl' ? -1 : 1
  const displacement = (horizontal ? clientX - drag.startX : clientY - drag.startY) * direction
  const raw =
    drag.startValue + (drag.availableSize > 0 ? (displacement / drag.availableSize) * 100 : 0)
  const bounded = finiteClamp(raw, minValue.value, maxValue.value)
  const limit = overshootLimit.value
  const overrun =
    raw < minValue.value
      ? minValue.value - (limit * (minValue.value - raw)) / (minValue.value - raw + limit || 1)
      : raw > maxValue.value
        ? maxValue.value + (limit * (raw - maxValue.value)) / (raw - maxValue.value + limit || 1)
        : raw
  previewValue.value = overrun
  const accepted = updateValue(bounded)
  const appliedValue = accepted ? bounded : value.value
  if (accepted) drag.changed ||= Math.abs(appliedValue - drag.startValue) > 0.0001
  drag.lastValue = appliedValue
}
function cancelPendingPointerFrame() {
  if (dragFrame !== null) cancelAnimationFrame(dragFrame)
  dragFrame = null
  pendingPointer = null
}
function onPointerMove(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId || props.disabled) return
  drag.moved ||=
    Math.abs(event.clientX - drag.startX) > 0.25 || Math.abs(event.clientY - drag.startY) > 0.25
  pendingPointer = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY }
  if (dragFrame !== null) return
  dragFrame = requestAnimationFrame(() => {
    dragFrame = null
    const latest = pendingPointer
    pendingPointer = null
    if (latest && drag?.pointerId === latest.pointerId)
      applyPointerPosition(latest.clientX, latest.clientY)
  })
}
function onPointerUp(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId) return
  cancelPendingPointerFrame()
  const activeDrag = drag
  // Pointer-up can arrive before the queued animation frame. Consume its final
  // coordinates so the divider settles at the actual release position.
  const movedAtRelease =
    Math.abs(event.clientX - activeDrag.startX) > 0.25 ||
    Math.abs(event.clientY - activeDrag.startY) > 0.25
  activeDrag.moved ||= movedAtRelease
  if (activeDrag.moved) applyPointerPosition(event.clientX, event.clientY)
  const wasChanged = activeDrag.changed
  if (activeDrag.interruptedSettle && !activeDrag.moved) {
    drag = null
    dragging.value = false
    previewValue.value = null
    startSettling()
    return
  }
  const settled = nearestDetent(activeDrag.lastValue)
  drag = null
  dragging.value = false
  previewValue.value = null
  const snapped = Math.abs(settled - value.value) > 0.0001 ? updateValue(settled) : false
  if (snapped) startSettling()
  if (wasChanged || snapped) dispatchValueEvent('change', value.value)
}
function onPointerCancel(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId) return
  cancelPendingPointerFrame()
  const activeDrag = drag
  const startValue = activeDrag.startValue
  const changed = activeDrag.changed
  drag = null
  dragging.value = false
  if (activeDrag.interruptedSettle && !activeDrag.moved) {
    previewValue.value = null
    startSettling()
    return
  }
  previewValue.value = null
  settling.value = false
  if (changed) updateValue(startValue)
}

watch(() => props.orientation, syncOrientation)
watch(resolvedOrientation, () => nextTick(updateMeasuredSize))
onMounted(() => {
  syncOrientation()
  updatePanePresence()
  updateMeasuredSize()
  resizeObserver = new ResizeObserver(updateMeasuredSize)
  if (root.value) resizeObserver.observe(root.value)
  observeSeparator()
  observer = new MutationObserver(updatePanePresence)
  if (root.value)
    observer.observe(root.value, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['hidden'],
    })
  lastExpandedValue =
    value.value > collapsedValue.value
      ? value.value
      : nearestDetent(Math.max(minValue.value, Math.min(maxValue.value, 50)))
})
onBeforeUnmount(() => {
  cancelPendingPointerFrame()
  if (settleTimer) clearTimeout(settleTimer)
  compactMedia?.removeEventListener('change', onMediaChange)
  expandedMedia?.removeEventListener('change', onMediaChange)
  observer?.disconnect()
  resizeObserver?.disconnect()
})

defineExpose({
  collapse,
  expand,
  snapToValue,
  separator: computed(() => root.value?.querySelector('[role="separator"]') ?? null),
})
</script>

<template>
  <div
    ref="root"
    class="yam3x-split-pane"
    :class="[
      `yam3x-split-pane--${resolvedOrientation}`,
      {
        'yam3x-split-pane--dragging': dragging,
        'yam3x-split-pane--settling': settling,
        'yam3x-split-pane--single':
          !hasStart || !hasEnd || (props.orientation === 'auto' && compact),
      },
    ]"
    :data-compact-pane="compactPane"
    :style="style"
    v-bind="$attrs"
  >
    <div
      v-show="props.orientation !== 'auto' || !compact || !hasEnd || compactPane === 'primary'"
      :id="startPaneId"
      ref="startPane"
      class="yam3x-split-pane__start"
      :class="{ 'yam3x-split-pane__pane--empty': !hasStart }"
      :inert="hasEnd && value <= 0"
    >
      <slot name="start" />
    </div>
    <div
      v-if="hasStart && hasEnd && !(props.orientation === 'auto' && compact)"
      class="yam3x-split-pane__separator yam3x-state-layer"
      role="separator"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      :aria-controls="startPaneId"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-orientation="resolvedOrientation === 'horizontal' ? 'vertical' : 'horizontal'"
      :aria-valuemin="minValue"
      :aria-valuemax="maxValue"
      :aria-valuenow="value"
      :aria-valuetext="ariaValueText"
      @keydown="onKeydown"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @lostpointercapture="onPointerCancel"
    >
      <span
        class="yam3x-split-pane__handle"
        aria-hidden="true"
      />
    </div>
    <div
      v-show="props.orientation !== 'auto' || !compact || !hasStart || compactPane === 'supporting'"
      ref="endPane"
      class="yam3x-split-pane__end"
      :class="{ 'yam3x-split-pane__pane--empty': !hasEnd }"
      :inert="hasStart && value >= 100"
    >
      <slot name="end" />
    </div>
  </div>
</template>

<style>
.yam3x-split-pane {
  --_yam3x-split-pane-system-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-split-pane-system-color-outline: var(--md-sys-color-outline);
  --_yam3x-split-pane-system-color-primary: var(--md-sys-color-primary);
  --_yam3x-split-pane-system-shape-corner-medium: var(--md-sys-shape-corner-medium, 12px);
  --_yam3x-split-pane-system-motion-default-spatial: var(--md-sys-motion-spring-default-spatial);
  --_yam3x-split-pane-system-motion-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-split-pane-system-state-hover-opacity: var(--md-sys-state-hover-opacity, 0.08);
  --_yam3x-split-pane-system-state-focus-opacity: var(--md-sys-state-focus-opacity, 0.1);
  --_yam3x-split-pane-handle-track: var(--yam3x-split-pane-drag-handle-container-width, 24px);
  --_yam3x-split-pane-handle-color: var(
    --yam3x-split-pane-drag-handle-color,
    var(--_yam3x-split-pane-system-color-outline)
  );
  --_yam3x-split-pane-handle-hover-color: var(
    --yam3x-split-pane-drag-handle-hover-color,
    var(--_yam3x-split-pane-system-color-on-surface)
  );
  --_yam3x-split-pane-handle-focus-color: var(
    --yam3x-split-pane-drag-handle-focus-color,
    var(--_yam3x-split-pane-system-color-on-surface)
  );
  --_yam3x-split-pane-handle-pressed-color: var(
    --yam3x-split-pane-drag-handle-pressed-color,
    var(--_yam3x-split-pane-system-color-on-surface)
  );
  --_yam3x-split-pane-handle-hover-opacity: var(
    --yam3x-split-pane-drag-handle-hover-opacity,
    var(--_yam3x-split-pane-system-state-hover-opacity)
  );
  --_yam3x-split-pane-handle-focus-opacity: var(
    --yam3x-split-pane-drag-handle-focus-opacity,
    var(--_yam3x-split-pane-system-state-focus-opacity)
  );
  --_yam3x-split-pane-handle-width: var(--yam3x-split-pane-drag-handle-width, 4px);
  --_yam3x-split-pane-handle-height: var(--yam3x-split-pane-drag-handle-height, 48px);
  --_yam3x-split-pane-handle-shape: var(--yam3x-split-pane-drag-handle-shape, 999px);
  --_yam3x-split-pane-handle-pressed-width: var(--yam3x-split-pane-drag-handle-pressed-width, 12px);
  --_yam3x-split-pane-handle-pressed-height: var(
    --yam3x-split-pane-drag-handle-pressed-height,
    52px
  );
  --_yam3x-split-pane-handle-pressed-shape: var(
    --yam3x-split-pane-drag-handle-pressed-shape,
    var(--_yam3x-split-pane-system-shape-corner-medium)
  );
  display: grid;
  grid-template-columns:
    minmax(0, var(--_yam3x-split-pane-start-size, 50%)) var(--_yam3x-split-pane-handle-track)
    minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  inline-size: 100%;
  block-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  contain: layout style;
}
.yam3x-split-pane--vertical {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows:
    minmax(0, var(--_yam3x-split-pane-start-size, 50%)) var(--_yam3x-split-pane-handle-track)
    minmax(0, 1fr);
}
.yam3x-split-pane__start,
.yam3x-split-pane__end {
  box-sizing: border-box;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
.yam3x-split-pane--settling {
  transition:
    grid-template-columns var(--_yam3x-split-pane-system-motion-default-spatial),
    grid-template-rows var(--_yam3x-split-pane-system-motion-default-spatial);
}
.yam3x-split-pane__pane--empty {
  display: none;
}
.yam3x-split-pane--single .yam3x-split-pane__start,
.yam3x-split-pane--single .yam3x-split-pane__end {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}
.yam3x-split-pane__separator {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  outline: none;
  touch-action: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  color: var(--_yam3x-split-pane-system-color-on-surface);
  cursor: grab;
  --yam3x-state-layer-color: var(--_yam3x-split-pane-handle-hover-color);
}
.yam3x-split-pane__separator[aria-disabled='true'] {
  cursor: default;
}
.yam3x-split-pane__separator::after {
  content: none;
}
.yam3x-split-pane__handle {
  position: relative;
  display: block;
  flex: none;
  inline-size: var(--_yam3x-split-pane-handle-width);
  block-size: var(--_yam3x-split-pane-handle-height);
  border-radius: var(--_yam3x-split-pane-handle-shape);
  background: var(--_yam3x-split-pane-handle-color);
  transition:
    background-color var(--_yam3x-split-pane-system-motion-fast-effects),
    border-radius var(--_yam3x-split-pane-system-motion-fast-effects),
    inline-size var(--_yam3x-split-pane-system-motion-fast-effects),
    block-size var(--_yam3x-split-pane-system-motion-fast-effects);
}
.yam3x-split-pane__handle::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--yam3x-state-layer-color);
  content: '';
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--_yam3x-split-pane-system-motion-fast-effects);
}
.yam3x-split-pane__separator:hover:not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-split-pane-handle-hover-color);
}
.yam3x-split-pane__separator:hover:not([aria-disabled='true']) .yam3x-split-pane__handle::after {
  opacity: var(--_yam3x-split-pane-handle-hover-opacity);
}
.yam3x-split-pane__separator:focus-visible {
  outline: 2px solid var(--_yam3x-split-pane-system-color-primary);
  outline-offset: -2px;
}
.yam3x-split-pane__separator:focus-visible {
  --yam3x-state-layer-color: var(--_yam3x-split-pane-handle-focus-color);
}
.yam3x-split-pane__separator:focus-visible .yam3x-split-pane__handle::after {
  opacity: var(--_yam3x-split-pane-handle-focus-opacity);
}
.yam3x-split-pane--dragging .yam3x-split-pane__separator {
  cursor: grabbing;
  --yam3x-state-layer-color: transparent;
}
.yam3x-split-pane--dragging .yam3x-split-pane__handle {
  inline-size: var(--_yam3x-split-pane-handle-pressed-width);
  block-size: var(--_yam3x-split-pane-handle-pressed-height);
  border-radius: var(--_yam3x-split-pane-handle-pressed-shape);
  background: var(--_yam3x-split-pane-handle-pressed-color);
}
.yam3x-split-pane--vertical .yam3x-split-pane__handle {
  inline-size: var(--_yam3x-split-pane-handle-height);
  block-size: var(--_yam3x-split-pane-handle-width);
}
.yam3x-split-pane--vertical.yam3x-split-pane--dragging .yam3x-split-pane__handle {
  inline-size: var(--_yam3x-split-pane-handle-pressed-height);
  block-size: var(--_yam3x-split-pane-handle-pressed-width);
}
.yam3x-split-pane--single .yam3x-split-pane__start,
.yam3x-split-pane--single .yam3x-split-pane__end {
  flex: 1 1 auto;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-split-pane--settling,
  .yam3x-split-pane__handle,
  .yam3x-split-pane__handle::after {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-split-pane__handle {
    background: ButtonText;
  }
  .yam3x-split-pane__separator:focus-visible {
    outline-color: Highlight;
  }
}
</style>
