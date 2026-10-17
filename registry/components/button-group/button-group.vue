<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  useAttrs,
  useSlots,
  watch,
} from 'vue'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import {
  buttonGroupKey,
  type ButtonGroupItemActivateEvent,
  type ButtonGroupItemRecord,
  type ButtonGroupOverflowItem,
  type ButtonGroupVariant,
} from './button-group.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: ButtonGroupVariant
    size?: ButtonSize
    shape?: ButtonShape
    label?: string
    role?: string
    overflow?: 'none' | 'menu'
    gap?: string | number
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  }>(),
  {
    variant: 'standard',
    size: 'small',
    shape: 'round',
    label: undefined,
    role: 'group',
    overflow: 'none',
    gap: undefined,
    justify: 'start',
  },
)
const emit = defineEmits<{ activate: [event: ButtonGroupItemActivateEvent] }>()
defineSlots<{
  default?(): unknown
  'overflow-indicator'?(props: {
    items: ButtonGroupOverflowItem[]
    activate: (value: string) => void
  }): unknown
}>()

const attrs = useAttrs()
const slots = useSlots()
const root = ref<HTMLElement | null>(null)
const indicator = ref<HTMLElement | null>(null)
const records = shallowRef<ButtonGroupItemRecord[]>([])
const overflowedValues = shallowRef<string[]>([])
const hasOverflowSlot = computed(() => Boolean(slots['overflow-indicator']))
const variant = computed<ButtonGroupVariant>(() => props.variant)
const gapStyle = computed(() =>
  props.gap === undefined
    ? undefined
    : typeof props.gap === 'number'
      ? `${props.gap}px`
      : props.gap,
)
const justifyStyle = computed(
  () =>
    ({
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    })[props.justify],
)
const overflowItems = computed(() =>
  records.value
    .filter((record) => overflowedValues.value.includes(record.value))
    .map(({ value, label, disabled }) => ({ value, label, disabled })),
)

let resizeObserver: ResizeObserver | undefined
let measureFrame = 0
const itemWidths = new WeakMap<HTMLElement, number>()
let pressedValue: string | undefined
let pressedPointerId: number | undefined
let pressedAt = 0
let releaseTimer: number | undefined
let cleanupTimer: number | undefined
let transitionElement: HTMLElement | undefined
let transitionHandler: ((event: TransitionEvent) => void) | undefined

function requestMeasure(): void {
  if (measureFrame) cancelAnimationFrame(measureFrame)
  measureFrame = requestAnimationFrame(() => {
    measureFrame = 0
    measureOverflow()
  })
}

function registerItem(record: ButtonGroupItemRecord): () => void {
  records.value = [...records.value, record]
  resizeObserver?.observe(record.element)
  requestMeasure()
  return () => {
    resizeObserver?.unobserve(record.element)
    records.value = records.value.filter((item) => item !== record)
    overflowedValues.value = overflowedValues.value.filter((value) => value !== record.value)
    requestMeasure()
  }
}

function updateItem(record: ButtonGroupItemRecord): void {
  const index = records.value.findIndex((item) => item.element === record.element)
  if (index < 0) return
  const next = [...records.value]
  next[index] = record
  records.value = next
  requestMeasure()
}

function activateItem(
  record: ButtonGroupItemRecord,
  source: 'button' | 'overflow',
  event?: MouseEvent,
): void {
  if (record.disabled) return
  emit('activate', { value: record.value, source, event })
}

function onOverflowActivate(value: string): void {
  const record = records.value.find((item) => item.value === value)
  if (record) activateItem(record, 'overflow')
}

function orderedItems(): ButtonGroupItemRecord[] {
  return records.value
    .filter((item) => item.element.isConnected)
    .sort((left, right) => {
      const position = left.element.compareDocumentPosition(right.element)
      return position & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : position & Node.DOCUMENT_POSITION_PRECEDING
          ? 1
          : 0
    })
}

function setOverflowedValues(values: string[]): void {
  overflowedValues.value = values
  records.value.forEach((item) => {
    item.element.removeAttribute('data-group-first')
    item.element.removeAttribute('data-group-last')
    if (values.includes(item.value)) item.element.setAttribute('data-overflowed', '')
    else item.element.removeAttribute('data-overflowed')
  })
  const visibleItems = orderedItems().filter((item) => !values.includes(item.value))
  visibleItems[0]?.element.setAttribute('data-group-first', '')
  visibleItems.at(-1)?.element.setAttribute('data-group-last', '')
}

provide(buttonGroupKey, { variant, registerItem, updateItem, activateItem })

function measureOverflow(): void {
  const host = root.value
  if (!host || props.overflow !== 'menu' || !hasOverflowSlot.value) {
    setOverflowedValues([])
    return
  }

  const items = orderedItems()
  const available = host.clientWidth
  if (!available || !items.length) {
    setOverflowedValues([])
    return
  }

  const style = getComputedStyle(host)
  const gap = Number.parseFloat(style.columnGap) || 0
  const widths = items.map((item) => {
    if (!item.element.hasAttribute('data-overflowed')) {
      const width = item.element.getBoundingClientRect().width
      if (width > 0) itemWidths.set(item.element, width)
    }
    return itemWidths.get(item.element) ?? 0
  })
  const fullWidth =
    widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, items.length - 1)
  if (fullWidth <= available) {
    setOverflowedValues([])
    return
  }

  const fallbackWidth = Number.parseFloat(
    getComputedStyle(host).getPropertyValue('--_yam3x-button-group-overflow-indicator-width'),
  )
  const indicatorWidth = indicator.value?.getBoundingClientRect().width || fallbackWidth || 48
  let remaining = fullWidth
  const hidden: string[] = []
  for (
    let index = items.length - 1;
    index >= 0 && remaining + indicatorWidth + gap > available;
    index -= 1
  ) {
    const item = items[index]!
    hidden.unshift(item.value)
    remaining -= widths[index]! + gap
  }
  setOverflowedValues(hidden)
}

function focusableItems(): HTMLElement[] {
  return orderedItems()
    .filter((item) => !item.disabled && !overflowedValues.value.includes(item.value))
    .map((item) =>
      item.element.querySelector<HTMLElement>(
        'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    )
    .filter((element): element is HTMLElement => element !== null)
}

function onKeydown(event: KeyboardEvent): void {
  const items = focusableItems()
  const current = (event.target as HTMLElement).closest<HTMLElement>(
    'button, a[href], [tabindex]:not([tabindex="-1"])',
  )
  const index = items.indexOf(current as HTMLElement)
  if (index < 0 || items.length < 2) return

  const direction = root.value && getComputedStyle(root.value).direction === 'rtl' ? -1 : 1
  const step = event.key === 'ArrowRight' ? direction : event.key === 'ArrowLeft' ? -direction : 0
  const verticalStep = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  const focusStep = step || verticalStep
  if (!focusStep) return
  event.preventDefault()
  items[(index + focusStep + items.length) % items.length]?.focus()
}

function resolveItem(target: EventTarget | null): ButtonGroupItemRecord | undefined {
  const element =
    target instanceof Element ? target.closest<HTMLElement>('[data-group-value]') : null
  return records.value.find((record) => record.element === element)
}

function startPress(record: ButtonGroupItemRecord): void {
  if (variant.value !== 'standard' || !record.animateWidth || record.disabled || pressedValue)
    return
  const host = root.value
  if (!host) return
  const visible = records.value.filter((item) => !overflowedValues.value.includes(item.value))
  const widths = visible.map((item) => item.element.getBoundingClientRect().width)
  const multiplier =
    Number.parseFloat(
      getComputedStyle(host).getPropertyValue('--_yam3x-button-group-pressed-width-multiplier'),
    ) / 100
  if (!Number.isFinite(multiplier)) return
  const groupWidth = host.getBoundingClientRect().width
  const index = visible.indexOf(record)
  if (index < 0) return

  host.dataset.groupPressed = ''
  host.style.setProperty('--_yam3x-button-group-pressed-width', `${groupWidth}px`)
  visible.forEach((item, itemIndex) => {
    const width = widths[itemIndex]!
    item.element.dataset.groupSizing = ''
    item.element.style.setProperty('--_yam3x-button-group-item-base-width', `${width}px`)
    item.element.style.setProperty('--_yam3x-button-group-item-delta', '0px')
    if (item === record) {
      item.element.dataset.groupPressed = ''
      item.element.style.setProperty('--_yam3x-button-group-item-delta', `${width * multiplier}px`)
    } else if (itemIndex === index - 1 || itemIndex === index + 1) {
      const shrink =
        (widths[index]! * multiplier) / (index > 0 && index < visible.length - 1 ? 2 : 1)
      item.element.dataset.groupAdjacent = ''
      item.element.style.setProperty('--_yam3x-button-group-item-delta', `${-shrink}px`)
    }
  })
  pressedValue = record.value
  pressedAt = performance.now()
}

function clearPressedLayout(): void {
  for (const item of records.value) {
    item.element.removeAttribute('data-group-sizing')
    item.element.removeAttribute('data-group-pressed')
    item.element.removeAttribute('data-group-adjacent')
    item.element.style.removeProperty('--_yam3x-button-group-item-base-width')
    item.element.style.removeProperty('--_yam3x-button-group-item-delta')
  }
  root.value?.removeAttribute('data-group-pressed')
  root.value?.style.removeProperty('--_yam3x-button-group-pressed-width')
  pressedValue = undefined
}

function finishPress(): void {
  const active = records.value.find((item) => item.value === pressedValue)
  if (!active) return
  active.element.removeAttribute('data-group-pressed')
  active.element.style.setProperty('--_yam3x-button-group-item-delta', '0px')
  records.value.forEach((item) => {
    if (item.element.hasAttribute('data-group-adjacent'))
      item.element.style.setProperty('--_yam3x-button-group-item-delta', '0px')
  })
  const finish = (event?: TransitionEvent): void => {
    if (event && (event.target !== active.element || event.propertyName !== 'width')) return
    if (transitionElement && transitionHandler)
      transitionElement.removeEventListener('transitionend', transitionHandler)
    transitionElement = undefined
    transitionHandler = undefined
    clearTimeout(cleanupTimer)
    cleanupTimer = undefined
    clearPressedLayout()
  }
  transitionElement = active.element
  transitionHandler = finish
  active.element.addEventListener('transitionend', finish)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish()
  else cleanupTimer = window.setTimeout(() => finish(), 700)
}

function releasePress(): void {
  if (!pressedValue) return
  const remaining = Math.max(0, 225 - (performance.now() - pressedAt))
  if (releaseTimer !== undefined) window.clearTimeout(releaseTimer)
  if (!remaining) finishPress()
  else
    releaseTimer = window.setTimeout(() => {
      releaseTimer = undefined
      finishPress()
    }, remaining)
}

function onPointerDown(event: PointerEvent): void {
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
  const record = resolveItem(event.target)
  if (!record || record.disabled) return
  pressedPointerId = event.pointerId
  startPress(record)
}

function onPointerEnd(event: PointerEvent): void {
  if (pressedPointerId !== event.pointerId) return
  pressedPointerId = undefined
  releasePress()
}

function onSpaceKeydown(event: KeyboardEvent): void {
  if (event.key !== ' ' || event.repeat) return
  const record = resolveItem(event.target)
  if (record) startPress(record)
}

function onKeyup(event: KeyboardEvent): void {
  if (event.key === ' ') releasePress()
}

function onBlur(): void {
  pressedPointerId = undefined
  releasePress()
}

watch([() => props.overflow, hasOverflowSlot], requestMeasure)

onMounted(async () => {
  await nextTick()
  resizeObserver = new ResizeObserver(requestMeasure)
  if (root.value) resizeObserver.observe(root.value)
  if (indicator.value) resizeObserver.observe(indicator.value)
  records.value.forEach((record) => resizeObserver?.observe(record.element))
  root.value?.addEventListener('pointerdown', onPointerDown, true)
  root.value?.addEventListener('keydown', onSpaceKeydown, true)
  window.addEventListener('pointerup', onPointerEnd)
  window.addEventListener('pointercancel', onPointerEnd)
  window.addEventListener('keyup', onKeyup)
  window.addEventListener('blur', onBlur)
  requestMeasure()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (measureFrame) cancelAnimationFrame(measureFrame)
  root.value?.removeEventListener('pointerdown', onPointerDown, true)
  root.value?.removeEventListener('keydown', onSpaceKeydown, true)
  window.removeEventListener('pointerup', onPointerEnd)
  window.removeEventListener('pointercancel', onPointerEnd)
  window.removeEventListener('keyup', onKeyup)
  window.removeEventListener('blur', onBlur)
  if (releaseTimer !== undefined) window.clearTimeout(releaseTimer)
  if (cleanupTimer !== undefined) window.clearTimeout(cleanupTimer)
  if (transitionElement && transitionHandler)
    transitionElement.removeEventListener('transitionend', transitionHandler)
})
</script>

<template>
  <div
    v-bind="attrs"
    ref="root"
    class="yam3x-button-group"
    :class="[
      `yam3x-button-group--${variant}`,
      `yam3x-button-group--size-${size}`,
      `yam3x-button-group--shape-${shape}`,
      { 'yam3x-button-group--overflow-menu': overflow === 'menu' },
    ]"
    :style="{
      '--yam3x-button-group-gap': gapStyle,
      '--_yam3x-button-group-justify': justifyStyle,
    }"
    :role="role"
    :aria-label="label || undefined"
    @keydown="onKeydown"
  >
    <slot />
    <div
      v-if="overflow === 'menu' && hasOverflowSlot"
      v-show="overflowItems.length > 0"
      ref="indicator"
      class="yam3x-button-group__overflow-indicator"
    >
      <slot
        name="overflow-indicator"
        :items="overflowItems"
        :activate="onOverflowActivate"
      />
    </div>
  </div>
</template>

<style scoped>
.yam3x-button-group {
  --_yam3x-button-group-standard-between-space: 12px;
  --_yam3x-button-group-connected-between-space: 2px;
  --_yam3x-button-group-gap: var(
    --yam3x-button-group-gap,
    var(--_yam3x-button-group-standard-between-space)
  );
  --_yam3x-button-group-connected-inner-corner: var(--md-sys-shape-corner-small);
  --_yam3x-button-group-connected-pressed-inner-corner: var(--md-sys-shape-corner-extra-small);
  --_yam3x-button-group-connected-square-outer-corner: var(--md-sys-shape-corner-small);
  --_yam3x-button-group-min-item-width: var(--md-sys-touch-target-size);
  --_yam3x-button-group-pressed-width-multiplier: 15%;
  --_yam3x-button-group-press-duration: 178ms;
  --_yam3x-button-group-container-width-motion: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-button-group-press-spring: linear(
    0,
    0.15 10%,
    0.407 20%,
    0.632 30%,
    0.792 40%,
    0.892 50%,
    0.949 60%,
    0.979 70%,
    0.993 80%,
    0.999 90%,
    1.001 100%
  );
  --_yam3x-button-group-overflow-indicator-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: var(--_yam3x-button-group-justify, flex-start);
  gap: var(--_yam3x-button-group-gap);
  width: fit-content;
  max-inline-size: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  transition: width var(--_yam3x-button-group-container-width-motion);
}

.yam3x-button-group--size-extra-small {
  --_yam3x-button-group-standard-between-space: 18px;
  --_yam3x-button-group-connected-square-outer-corner: var(--md-sys-shape-corner-extra-small);
}

.yam3x-button-group--size-medium,
.yam3x-button-group--size-large,
.yam3x-button-group--size-extra-large {
  --_yam3x-button-group-standard-between-space: 8px;
}

.yam3x-button-group--size-large {
  --_yam3x-button-group-connected-inner-corner: var(--md-sys-shape-corner-large);
  --_yam3x-button-group-connected-pressed-inner-corner: var(--md-sys-shape-corner-medium);
  --_yam3x-button-group-connected-square-outer-corner: var(--md-sys-shape-corner-large);
}

.yam3x-button-group--size-extra-large {
  --_yam3x-button-group-connected-inner-corner: var(--md-sys-shape-corner-large-increased);
  --_yam3x-button-group-connected-pressed-inner-corner: var(--md-sys-shape-corner-large);
  --_yam3x-button-group-connected-square-outer-corner: var(--md-sys-shape-corner-large-increased);
}

.yam3x-button-group--connected {
  display: flex;
  --_yam3x-button-group-gap: var(
    --yam3x-button-group-gap,
    var(--yam3x-connected-button-group-spacing, var(--_yam3x-button-group-connected-between-space))
  );
  gap: var(--_yam3x-button-group-gap);
  width: 100%;
  max-inline-size: min(100%, 720px);
  min-width: 0;
}

.yam3x-button-group--connected :deep(.yam3x-button-group__item) {
  flex: 1 1 auto;
  min-width: var(--_yam3x-button-group-min-item-width);
}

.yam3x-button-group--connected
  :deep(.yam3x-button-group__item :is(.yam3x-button, .yam3x-icon-button)) {
  --_yam3x-button-group-full-corner: calc(var(--yam3x-control-height) / 2);
  --_yam3x-button-group-current-inner-corner: var(--_yam3x-button-group-connected-inner-corner);
  --_yam3x-button-group-current-outer-corner: var(--_yam3x-button-group-connected-outer-corner);
  border-radius: var(--_yam3x-button-group-current-inner-corner);
}

.yam3x-button-group--connected.yam3x-button-group--shape-round
  :deep(.yam3x-button-group__item :is(.yam3x-button, .yam3x-icon-button)) {
  --_yam3x-button-group-connected-outer-corner: var(--_yam3x-button-group-full-corner);
}

.yam3x-button-group--connected.yam3x-button-group--shape-square
  :deep(.yam3x-button-group__item :is(.yam3x-button, .yam3x-icon-button)) {
  --_yam3x-button-group-connected-outer-corner: var(
    --_yam3x-button-group-connected-square-outer-corner
  );
}

.yam3x-button-group--connected
  :deep(
    .yam3x-button-group__item
      :is(.yam3x-button, .yam3x-icon-button):is([aria-pressed='true'], [aria-checked='true'])
  ) {
  --_yam3x-button-group-current-inner-corner: var(--_yam3x-button-group-full-corner);
  --_yam3x-button-group-current-outer-corner: var(--_yam3x-button-group-full-corner);
}

.yam3x-button-group--connected
  :deep(
    .yam3x-button-group__item
      :is(.yam3x-button, .yam3x-icon-button):is(:active, [data-yam3x-pressed])
  ) {
  --_yam3x-button-group-current-inner-corner: var(
    --_yam3x-button-group-connected-pressed-inner-corner
  );
  --_yam3x-button-group-current-outer-corner: var(--_yam3x-button-group-connected-outer-corner);
  border-radius: var(--_yam3x-button-group-current-inner-corner);
}

.yam3x-button-group--connected :deep(.yam3x-button-group__item[data-group-first] .yam3x-button),
.yam3x-button-group--connected
  :deep(.yam3x-button-group__item[data-group-first] .yam3x-icon-button) {
  border-start-start-radius: var(--_yam3x-button-group-current-outer-corner);
  border-end-start-radius: var(--_yam3x-button-group-current-outer-corner);
}

.yam3x-button-group--connected :deep(.yam3x-button-group__item[data-group-last] .yam3x-button),
.yam3x-button-group--connected
  :deep(.yam3x-button-group__item[data-group-last] .yam3x-icon-button) {
  border-start-end-radius: var(--_yam3x-button-group-current-outer-corner);
  border-end-end-radius: var(--_yam3x-button-group-current-outer-corner);
}

.yam3x-button-group--connected :deep(.yam3x-button-group__item .yam3x-icon-button) {
  margin-inline: 0;
  --_yam3x-icon-button-interaction-inset-inline: 0px;
}

.yam3x-button-group--connected :deep(.yam3x-button-group__item .yam3x-icon-button::before) {
  border-radius: inherit;
}

.yam3x-button-group--standard :deep(.yam3x-button-group__item[data-group-pressed] .yam3x-button) {
  --_yam3x-button-group-standard-pressed-corner: var(--yam3x-control-pressed-shape);
  border-radius: var(--_yam3x-button-group-standard-pressed-corner);
}

.yam3x-button-group--standard
  :deep(.yam3x-button-group__item[data-group-pressed] .yam3x-icon-button) {
  --_yam3x-icon-button-current-radius: var(--_yam3x-icon-button-shape-pressed-morph);
}

.yam3x-button-group--overflow-menu {
  overflow: hidden;
}

.yam3x-button-group--overflow-menu :deep(.yam3x-button-group__item) {
  flex: 0 0 auto;
}

.yam3x-button-group__overflow-indicator {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  min-width: var(--_yam3x-button-group-overflow-indicator-width, 48px);
  align-items: center;
}

.yam3x-button-group :deep(.yam3x-button-group__item[data-overflowed]) {
  display: none;
}

.yam3x-button-group[data-group-pressed] {
  width: var(--_yam3x-button-group-pressed-width);
  justify-content: space-between;
  transition: width var(--_yam3x-button-group-press-duration)
    var(--_yam3x-button-group-press-spring);
}

.yam3x-button-group :deep(.yam3x-button-group__item[data-group-sizing]) {
  flex: 0 0 auto;
  width: calc(
    var(--_yam3x-button-group-item-base-width) + var(--_yam3x-button-group-item-delta, 0px)
  );
  transition: width var(--_yam3x-button-group-press-duration)
    var(--_yam3x-button-group-press-spring);
}
</style>
