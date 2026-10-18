<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { vRipple } from '../_shared/ripple'
import type {
  CarouselItem,
  CarouselItemSlotProps,
  CarouselLayout,
  CarouselLength,
} from './carousel.types'

const props = withDefaults(
  defineProps<{
    locale?: string
    items: CarouselItem[]
    label: string
    layout?: CarouselLayout
    snap?: boolean
    preferredItemWidth?: CarouselLength
    itemWidth?: CarouselLength
    itemSpacing?: CarouselLength
    contentPadding?: CarouselLength
    itemHeight?: string
  }>(),
  {
    layout: 'multi-browse',
    itemHeight: '320px',
  },
)

const activeIndex = defineModel<number>('activeIndex', { default: 0 })
const emit = defineEmits<{
  change: [index: number, item: CarouselItem]
  activate: [item: CarouselItem, index: number, event: MouseEvent]
}>()
defineSlots<{
  default(props: CarouselItemSlotProps): unknown
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const measuredItemSpacing = ref(8)
const measuredInlinePadding = ref(32)
const measuredPreferredItemWidth = ref(0)
const measuredItemWidth = ref(0)
const layoutProgress = ref({ anchor: 0, fraction: 0 })
let resizeObserver: ResizeObserver | undefined
let animationFrame = 0
let resizeFrame = 0
let interactionIndex: number | undefined
type MeasuredItem = { element: HTMLElement; index: number; rect: DOMRect }

const isVertical = computed(() => props.layout === 'full-screen')
const snapEnabled = computed(() => {
  if (props.layout === 'full-screen') return true
  return props.snap ?? !['uncontained', 'uncontained-multi-aspect-ratio'].includes(props.layout)
})
const itemSize = computed(() => {
  const width = containerWidth.value
  if (props.layout === 'multi-browse') {
    const available = Math.max(
      0,
      width - measuredInlinePadding.value - measuredItemSpacing.value * 3,
    )
    const small = Math.min(56, Math.max(40, available * 0.14))
    const large = Math.min(
      measuredPreferredItemWidth.value || Math.min(available * 0.45, 600),
      available,
    )
    const medium = Math.max(small, Math.min(large, (available - large - small) / 2))
    return {
      small,
      medium,
      large,
    }
  }
  if (props.layout === 'hero' || props.layout === 'center-aligned-hero') {
    const small = Math.max(40, Math.min(56, width * 0.12))
    const centerLarge = Math.max(
      0,
      width - measuredInlinePadding.value - small * 2 - measuredItemSpacing.value * 2,
    )
    const heroLarge =
      width >= 600
        ? Math.max(
            0,
            (width - measuredInlinePadding.value - measuredItemSpacing.value * 2 - small) / 2,
          )
        : Math.max(0, width - measuredInlinePadding.value - measuredItemSpacing.value - small)
    const large = Math.min(
      measuredPreferredItemWidth.value ||
        Math.min(props.layout === 'center-aligned-hero' ? centerLarge : heroLarge, 600),
      props.layout === 'center-aligned-hero' ? centerLarge : heroLarge,
    )
    return {
      small,
      medium: width * 0.2,
      large: Math.min(large, props.layout === 'center-aligned-hero' ? centerLarge : heroLarge),
    }
  }
  return {
    small: Math.max(40, Math.min(56, width * 0.12)),
    medium: width * 0.27,
    large: Math.min(width * 0.8, 600),
  }
})
const trackStyle = computed(() => ({
  '--_yam3x-carousel-small-size': `${itemSize.value.small}px`,
  '--_yam3x-carousel-medium-size': `${itemSize.value.medium}px`,
  '--_yam3x-carousel-large-size': `${itemSize.value.large}px`,
  '--_yam3x-carousel-item-height': props.itemHeight,
  '--_yam3x-carousel-item-spacing': toCssLength(
    props.itemSpacing ?? (props.layout === 'full-screen' ? 16 : 8),
  ),
  padding: props.contentPadding !== undefined ? toCssLength(props.contentPadding) : undefined,
}))

function toCssLength(value: CarouselLength): string {
  return typeof value === 'number' ? `${value}px` : value
}

function measureCssLength(value: CarouselLength | undefined): number {
  if (value === undefined || !root.value) return 0
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;inset-inline-start:0;visibility:hidden;pointer-events:none;box-sizing:border-box;width:${toCssLength(value)};height:0;`
  root.value.append(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()
  return width
}

function measureTrackDimensions(): void {
  if (!root.value || !track.value) return
  const style = getComputedStyle(track.value)
  const spacing = props.itemSpacing ?? (props.layout === 'full-screen' ? 16 : 8)
  measuredItemSpacing.value = measureCssLength(spacing) || Number.parseFloat(style.columnGap) || 0
  if (props.contentPadding !== undefined) {
    const probe = document.createElement('div')
    probe.style.cssText = `position:absolute;inset-inline-start:0;visibility:hidden;pointer-events:none;box-sizing:border-box;width:100%;padding:${toCssLength(props.contentPadding)};`
    root.value.append(probe)
    const probeStyle = getComputedStyle(probe)
    measuredInlinePadding.value =
      (Number.parseFloat(probeStyle.paddingLeft) || 0) +
      (Number.parseFloat(probeStyle.paddingRight) || 0)
    probe.remove()
  } else {
    measuredInlinePadding.value =
      (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0)
  }
  measuredPreferredItemWidth.value = measureCssLength(props.preferredItemWidth)
  measuredItemWidth.value = measureCssLength(props.itemWidth)
}

function sizeRoleFor(index: number): CarouselItemSlotProps['sizeRole'] {
  if (!['multi-browse', 'hero', 'center-aligned-hero'].includes(props.layout)) {
    return sizeRoleForAnchor(index, activeIndex.value)
  }
  const fromRole = sizeRoleForAnchor(index, layoutProgress.value.anchor)
  const toAnchor = Math.min(props.items.length - 1, layoutProgress.value.anchor + 1)
  const toRole = sizeRoleForAnchor(index, toAnchor)
  const fromWidth = itemSize.value[fromRole]
  const toWidth = itemSize.value[toRole]
  const width = fromWidth + (toWidth - fromWidth) * layoutProgress.value.fraction
  return (
    Object.entries(itemSize.value) as Array<[CarouselItemSlotProps['sizeRole'], number]>
  ).reduce((nearest, candidate) =>
    Math.abs(candidate[1] - width) < Math.abs(nearest[1] - width) ? candidate : nearest,
  )[0]
}
function sizeRoleForAnchor(index: number, anchor: number): CarouselItemSlotProps['sizeRole'] {
  if (props.layout === 'multi-browse') {
    const distance = Math.abs(index - anchor)
    return (['large', 'medium', 'small', 'medium'] as const)[distance % 4]!
  }
  if (props.layout === 'hero') {
    const largeCount = containerWidth.value >= 600 ? 2 : 1
    return index >= anchor && index < anchor + largeCount ? 'large' : 'small'
  }
  if (props.layout === 'center-aligned-hero') {
    return index === anchor ? 'large' : 'small'
  }
  return 'large'
}
function itemProps(item: CarouselItem, index: number): CarouselItemSlotProps {
  return { item, index, sizeRole: sizeRoleFor(index) }
}
function itemAspectRatio(item: CarouselItem): number | undefined {
  if (!item.aspectRatio) return undefined
  const [numerator, denominator] = item.aspectRatio.split(/[:/]/).map(Number)
  if (!numerator || !denominator) return undefined
  return Math.max(9 / 16, Math.min(16 / 9, numerator / denominator))
}
function aspectRatioItemWidth(item: CarouselItem): string | undefined {
  if (props.layout !== 'uncontained-multi-aspect-ratio' || !containerWidth.value) return undefined
  const ratio = itemAspectRatio(item)
  if (!ratio) return undefined
  const height = Math.min(containerWidth.value * 0.66, 360)
  return `${Math.max(0, Math.min(containerWidth.value * 0.82, height * ratio))}px`
}
function itemStyle(item: CarouselItem, index: number): Record<string, string> | undefined {
  if (
    props.layout === 'multi-browse' ||
    props.layout === 'hero' ||
    props.layout === 'center-aligned-hero'
  ) {
    const fromRole = sizeRoleForAnchor(index, layoutProgress.value.anchor)
    const toAnchor = Math.min(props.items.length - 1, layoutProgress.value.anchor + 1)
    const toRole = sizeRoleForAnchor(index, toAnchor)
    const fromWidth = itemSize.value[fromRole]
    const toWidth = itemSize.value[toRole]
    const width = fromWidth + (toWidth - fromWidth) * layoutProgress.value.fraction
    return { '--_yam3x-carousel-item-size': `${Math.max(0, width)}px` }
  }
  if (props.layout === 'uncontained' && measuredItemWidth.value > 0) {
    return { width: `${measuredItemWidth.value}px`, flexBasis: `${measuredItemWidth.value}px` }
  }
  const width = aspectRatioItemWidth(item)
  if (!width) return undefined
  const ratio = itemAspectRatio(item)
  if (!ratio) return undefined
  const height = Number.parseFloat(width) / ratio
  return { width, flexBasis: width, height: `${height}px` }
}
function updateContainerWidth(): void {
  containerWidth.value = root.value?.getBoundingClientRect().width ?? 0
  measureTrackDimensions()
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    updateLayoutProgress()
    updateParallax()
  })
}
function measureItems(): MeasuredItem[] {
  if (!track.value) return []
  return [...track.value.querySelectorAll<HTMLElement>('[data-carousel-index]')].map((element) => ({
    element,
    index: Number(element.dataset.carouselIndex),
    rect: element.getBoundingClientRect(),
  }))
}
function scrollTo(index: number, focus = false): void {
  const item = track.value?.querySelector<HTMLElement>(`[data-carousel-index="${index}"]`)
  if (!item) return
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
  item.scrollIntoView({
    behavior,
    block: isVertical.value ? 'start' : 'nearest',
    inline: props.layout === 'center-aligned-hero' ? 'center' : 'nearest',
  })
  if (focus) item.focus({ preventScroll: true })
}
function focusIndex(index: number, direction: -1 | 1): void {
  for (let next = index; next >= 0 && next < props.items.length; next += direction) {
    if (props.items[next]?.disabled) continue
    updateActiveIndex(next)
    scrollTo(next, true)
    return
  }
}
function updateActiveIndex(index: number): void {
  if (activeIndex.value === index) return
  interactionIndex = index
  activeIndex.value = index
  emit('change', index, props.items[index]!)
}
function onItemFocus(index: number): void {
  updateActiveIndex(index)
}
function onItemKeydown(event: KeyboardEvent, index: number): void {
  if (event.target !== event.currentTarget) return
  const item = props.items[index]
  if ((event.key === ' ' || event.key === 'Spacebar') && item?.href && !item.disabled) {
    event.preventDefault()
    ;(event.currentTarget as HTMLElement).click()
    return
  }
  const rtl = track.value ? getComputedStyle(track.value).direction === 'rtl' : false
  const backwardKey = isVertical.value ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  const forwardKey = isVertical.value ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  if (event.key === backwardKey) {
    event.preventDefault()
    focusIndex(index - 1, -1)
  } else if (event.key === forwardKey) {
    event.preventDefault()
    focusIndex(index + 1, 1)
  } else if (!isVertical.value && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault()
    focusOutside(event.key === 'ArrowDown' ? 'next' : 'previous')
  }
}
function focusOutside(direction: 'next' | 'previous'): void {
  const carousel = root.value
  if (!carousel) return
  const controls = [
    ...document.querySelectorAll<HTMLElement>(
      'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
    ),
  ].filter(
    (element) =>
      !carousel.contains(element) &&
      !element.closest('[hidden],[inert],[aria-hidden="true"]') &&
      element.getClientRects().length > 0,
  )
  const related = controls.filter((element) => {
    const relation = carousel.compareDocumentPosition(element)
    return direction === 'next'
      ? Boolean(relation & Node.DOCUMENT_POSITION_FOLLOWING)
      : Boolean(relation & Node.DOCUMENT_POSITION_PRECEDING)
  })
  const target = direction === 'next' ? related[0] : related.at(-1)
  target?.focus({ preventScroll: true })
}
function onItemClick(item: CarouselItem, index: number, event: MouseEvent): void {
  if (item.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (item.href || item.actionable) emit('activate', item, index, event)
}
function onScroll(): void {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(() => {
    animationFrame = 0
    if (!track.value) return
    const items = measureItems()
    const bounds = track.value.getBoundingClientRect()
    const center = isVertical.value
      ? bounds.top + bounds.height / 2
      : bounds.left + bounds.width / 2
    let nearestIndex = activeIndex.value
    let nearestDistance = Infinity
    for (const item of items) {
      if (props.items[item.index]?.disabled) continue
      const rect = item.rect
      const itemCenter = isVertical.value ? rect.top + rect.height / 2 : rect.left + rect.width / 2
      const distance = Math.abs(center - itemCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = item.index
      }
    }
    if (nearestIndex !== activeIndex.value && props.items[nearestIndex]) {
      updateActiveIndex(nearestIndex)
    }
    updateLayoutProgress(items)
    updateParallax(items)
  })
}
function updateLayoutProgress(measuredItems?: MeasuredItem[]): void {
  if (!track.value || props.items.length < 2) return
  const bounds = track.value.getBoundingClientRect()
  const direction = getComputedStyle(track.value).direction
  const rtl = direction === 'rtl'
  const trackStyle = getComputedStyle(track.value)
  const centeredHero = props.layout === 'center-aligned-hero'
  const startPadding =
    Number.parseFloat(
      isVertical.value
        ? trackStyle.paddingTop
        : rtl
          ? trackStyle.paddingRight
          : trackStyle.paddingLeft,
    ) || 0
  const keyline = centeredHero
    ? bounds.left + bounds.width / 2
    : isVertical.value
      ? bounds.top + startPadding
      : rtl
        ? bounds.right - startPadding
        : bounds.left + startPadding
  const positions = (measuredItems ?? measureItems())
    .map((item) => {
      const rect = item.rect
      return {
        index: item.index,
        position: centeredHero
          ? rect.left + rect.width / 2
          : isVertical.value
            ? rect.top
            : rtl
              ? rect.right
              : rect.left,
      }
    })
    .sort((a, b) => a.index - b.index)
  let best = { anchor: 0, fraction: 0, distance: Number.POSITIVE_INFINITY }
  for (let i = 0; i < positions.length - 1; i++) {
    const start = positions[i]!
    const end = positions[i + 1]!
    const span = end.position - start.position
    if (!span) continue
    const offset = keyline - start.position
    const fraction = Math.max(0, Math.min(1, offset / span))
    const distance = Math.abs(keyline - (start.position + span * fraction))
    if (distance < best.distance) best = { anchor: start.index, fraction, distance }
  }
  if (best.distance < Number.POSITIVE_INFINITY) {
    layoutProgress.value = { anchor: best.anchor, fraction: best.fraction }
  }
}
function updateParallax(measuredItems = measureItems()): void {
  if (!track.value) return
  const bounds = track.value.getBoundingClientRect()
  const center = isVertical.value ? bounds.top + bounds.height / 2 : bounds.left + bounds.width / 2
  for (const item of measuredItems) {
    const rect = item.rect
    const itemCenter = isVertical.value ? rect.top + rect.height / 2 : rect.left + rect.width / 2
    const cap = Math.min(28, (isVertical.value ? rect.height : rect.width) * 0.14)
    const offset = Math.max(-cap, Math.min(cap, (center - itemCenter) * 0.16))
    const content = item.element.querySelector<HTMLElement>('.yam3x-carousel__item-content')
    if (!content) continue
    const explicitTargets = [
      ...content.querySelectorAll<HTMLElement>('[data-yam3x-carousel-parallax]'),
    ]
    const targets = explicitTargets.length
      ? explicitTargets
      : [...content.querySelectorAll<HTMLElement>('img, video')]
    const scale =
      1 + (2 * Math.abs(offset)) / Math.max(1, isVertical.value ? rect.height : rect.width)
    for (const target of targets) {
      target.style.setProperty(
        '--_yam3x-carousel-parallax-inline',
        isVertical.value ? '0px' : `${offset}px`,
      )
      target.style.setProperty(
        '--_yam3x-carousel-parallax-block',
        isVertical.value ? `${offset}px` : '0px',
      )
      target.style.setProperty(
        '--_yam3x-carousel-parallax-scale-inline',
        isVertical.value ? '1' : `${scale}`,
      )
      target.style.setProperty(
        '--_yam3x-carousel-parallax-scale-block',
        isVertical.value ? `${scale}` : '1',
      )
    }
  }
}

watch(activeIndex, async (index) => {
  if (interactionIndex === index) {
    interactionIndex = undefined
    return
  }
  const safeIndex = Math.max(0, Math.min(props.items.length - 1, index))
  if (safeIndex !== index) activeIndex.value = safeIndex
  await nextTick()
  scrollTo(safeIndex)
})
watch(
  () => props.layout,
  async (layout) => {
    if (layout === 'center-aligned-hero' && props.items.length > 2 && activeIndex.value === 0) {
      activeIndex.value = 1
      layoutProgress.value = { anchor: 1, fraction: 0 }
    }
    await nextTick()
    updateContainerWidth()
    scrollTo(activeIndex.value)
  },
)
watch(
  () => props.items.length,
  async (length) => {
    if (length && activeIndex.value >= length) activeIndex.value = length - 1
    else if (!length) activeIndex.value = 0
    await nextTick()
    updateParallax()
  },
)
watch(
  () => [props.preferredItemWidth, props.itemWidth, props.itemSpacing, props.contentPadding],
  async () => {
    await nextTick()
    updateContainerWidth()
  },
)
onMounted(() => {
  updateContainerWidth()
  if (props.layout === 'center-aligned-hero' && props.items.length > 2 && activeIndex.value === 0) {
    activeIndex.value = 1
    layoutProgress.value = { anchor: 1, fraction: 0 }
  }
  if (root.value) {
    resizeObserver = new ResizeObserver(updateContainerWidth)
    resizeObserver.observe(root.value)
  }
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
})
</script>

<template>
  <section
    ref="root"
    class="yam3x-carousel"
    :class="[`yam3x-carousel--${layout}`, { 'yam3x-carousel--snap': snapEnabled }]"
    role="group"
    aria-roledescription="carousel"
    :aria-label="label"
  >
    <div
      ref="track"
      class="yam3x-carousel__track"
      :style="trackStyle"
      @scroll.passive="onScroll"
    >
      <component
        :is="item.href ? 'a' : item.actionable ? 'button' : 'div'"
        v-for="(item, index) in items"
        :key="item.key"
        v-ripple
        class="yam3x-carousel__item yam3x-state-layer"
        :class="[
          `yam3x-carousel__item--${sizeRoleFor(index)}`,
          { 'yam3x-carousel__item--disabled': item.disabled },
        ]"
        :style="itemStyle(item, index)"
        :href="item.href && !item.disabled ? item.href : undefined"
        :type="!item.href && item.actionable ? 'button' : undefined"
        :disabled="!item.href && item.actionable ? item.disabled : undefined"
        :aria-disabled="item.href && item.disabled ? 'true' : undefined"
        :aria-roledescription="'slide'"
        :aria-label="actionMessages.carouselItem(index + 1, items.length, item.label)"
        :role="!item.href && !item.actionable ? 'group' : undefined"
        :tabindex="item.disabled ? -1 : 0"
        :data-carousel-index="index"
        @focus="onItemFocus(index)"
        @keydown="onItemKeydown($event, index)"
        @click="onItemClick(item, index, $event)"
      >
        <div class="yam3x-carousel__item-content"><slot v-bind="itemProps(item, index)" /></div>
      </component>
    </div>
  </section>
</template>

<style>
.yam3x-carousel {
  --_yam3x-carousel-item-surface: var(--md-sys-color-surface);
  --_yam3x-carousel-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-carousel-focus-indicator: var(--md-sys-color-secondary);
  --_yam3x-carousel-motion: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-carousel-gap: 8px;
  --_yam3x-carousel-inline-padding: 16px;
  --_yam3x-carousel-block-padding: 8px;
  --_yam3x-carousel-item-shape: 28px;
  display: block;
  position: relative;
  width: 100%;
  min-width: 0;
  container-type: inline-size;
}
.yam3x-carousel__track {
  display: flex;
  align-items: center;
  gap: var(--_yam3x-carousel-item-spacing, var(--_yam3x-carousel-gap));
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: var(--_yam3x-carousel-block-padding) var(--_yam3x-carousel-inline-padding);
  overflow: auto hidden;
  overscroll-behavior-inline: contain;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.yam3x-carousel__track::-webkit-scrollbar {
  display: none;
}
.yam3x-carousel--snap .yam3x-carousel__track {
  scroll-snap-type: x mandatory;
}
.yam3x-carousel__item {
  --yam3x-state-layer-color: var(--_yam3x-carousel-on-surface);
  --yam3x-ripple-color: var(--_yam3x-carousel-on-surface);
  position: relative;
  display: block;
  flex: 0 0 var(--_yam3x-carousel-item-size, var(--_yam3x-carousel-large-size, min(80cqi, 600px)));
  width: var(--_yam3x-carousel-item-size, var(--_yam3x-carousel-large-size, min(80cqi, 600px)));
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--_yam3x-carousel-item-shape);
  padding: 0;
  color: inherit;
  background: var(--_yam3x-carousel-item-surface);
  text-align: start;
  text-decoration: none;
  scroll-snap-align: start;
  cursor: pointer;
  transition: border-radius var(--_yam3x-carousel-motion);
}
.yam3x-carousel__item--large {
  flex-basis: var(
    --_yam3x-carousel-item-size,
    var(--_yam3x-carousel-large-size, min(80cqi, 600px))
  );
  width: var(--_yam3x-carousel-item-size, var(--_yam3x-carousel-large-size, min(80cqi, 600px)));
}
.yam3x-carousel__item--medium {
  flex-basis: var(--_yam3x-carousel-item-size, var(--_yam3x-carousel-medium-size, 27cqi));
  width: var(--_yam3x-carousel-item-size, var(--_yam3x-carousel-medium-size, 27cqi));
}
.yam3x-carousel__item--small {
  flex-basis: var(
    --_yam3x-carousel-item-size,
    var(--_yam3x-carousel-small-size, clamp(40px, 12cqi, 56px))
  );
  width: var(
    --_yam3x-carousel-item-size,
    var(--_yam3x-carousel-small-size, clamp(40px, 12cqi, 56px))
  );
}
.yam3x-carousel__item-content {
  position: relative;
  width: 100%;
  height: min(55cqi, var(--_yam3x-carousel-item-height, 320px));
  min-height: 120px;
}
.yam3x-carousel__item-content :is([data-yam3x-carousel-parallax], img, video) {
  transform: translate3d(
      var(--_yam3x-carousel-parallax-inline, 0px),
      var(--_yam3x-carousel-parallax-block, 0px),
      0
    )
    scale(
      var(--_yam3x-carousel-parallax-scale-inline, 1),
      var(--_yam3x-carousel-parallax-scale-block, 1)
    );
  transform-origin: center;
}
.yam3x-carousel__item-content :is(img, video) {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
}
.yam3x-carousel .yam3x-carousel__item.yam3x-state-layer:focus-visible {
  outline: 3px solid var(--_yam3x-carousel-focus-indicator);
  outline-offset: 2px;
}
.yam3x-carousel__item:hover {
  border-radius: calc(var(--_yam3x-carousel-item-shape) * 0.75);
}
.yam3x-carousel__item:active {
  border-radius: calc(var(--_yam3x-carousel-item-shape) * 0.65);
}
.yam3x-carousel__item--disabled {
  cursor: not-allowed;
  opacity: 0.38;
}
.yam3x-carousel--uncontained .yam3x-carousel__track,
.yam3x-carousel--uncontained-multi-aspect-ratio .yam3x-carousel__track {
  padding-inline-end: 0;
}
.yam3x-carousel:is(.yam3x-carousel--multi-browse, .yam3x-carousel--hero) .yam3x-carousel__track {
  scroll-padding-inline: var(--_yam3x-carousel-inline-padding);
  clip-path: inset(0 var(--_yam3x-carousel-inline-padding) 0 0);
}
.yam3x-carousel:is(.yam3x-carousel--multi-browse, .yam3x-carousel--hero)
  .yam3x-carousel__track:dir(rtl) {
  clip-path: inset(0 0 0 var(--_yam3x-carousel-inline-padding));
}
.yam3x-carousel--uncontained .yam3x-carousel__track,
.yam3x-carousel--uncontained-multi-aspect-ratio .yam3x-carousel__track {
  scroll-padding-inline-start: var(--_yam3x-carousel-inline-padding);
  scroll-padding-inline-end: 0;
}
.yam3x-carousel--uncontained .yam3x-carousel__item {
  scroll-snap-align: start;
}
.yam3x-carousel--center-aligned-hero .yam3x-carousel__item {
  scroll-snap-align: center;
}
.yam3x-carousel--center-aligned-hero .yam3x-carousel__track {
  scroll-padding-inline: 50%;
}
.yam3x-carousel--uncontained-multi-aspect-ratio .yam3x-carousel__item-content {
  height: 100%;
}
.yam3x-carousel--full-screen {
  width: 100%;
  height: 100dvh;
}
.yam3x-carousel--full-screen.yam3x-carousel--snap .yam3x-carousel__track {
  scroll-snap-type: y mandatory;
}
.yam3x-carousel--full-screen .yam3x-carousel__track {
  flex-direction: column;
  gap: var(--_yam3x-carousel-item-spacing, 16px);
  padding: 0;
  overflow: hidden auto;
}
.yam3x-carousel--full-screen .yam3x-carousel__item {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  max-width: none;
  min-height: 100%;
  border-radius: 0;
  scroll-snap-align: start;
}
.yam3x-carousel--full-screen .yam3x-carousel__item-content {
  height: 100%;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-carousel__track {
    scroll-behavior: auto !important;
  }
  .yam3x-carousel__item {
    transition: none !important;
  }
  .yam3x-carousel__item:hover,
  .yam3x-carousel__item:active {
    border-radius: var(--_yam3x-carousel-item-shape);
  }
  .yam3x-carousel:is(
      .yam3x-carousel--multi-browse,
      .yam3x-carousel--hero,
      .yam3x-carousel--center-aligned-hero
    )
    .yam3x-carousel__item--medium,
  .yam3x-carousel:is(
      .yam3x-carousel--multi-browse,
      .yam3x-carousel--hero,
      .yam3x-carousel--center-aligned-hero
    )
    .yam3x-carousel__item--small {
    flex-basis: var(--_yam3x-carousel-large-size) !important;
    width: var(--_yam3x-carousel-large-size) !important;
  }
  .yam3x-carousel:not(.yam3x-carousel--full-screen) .yam3x-carousel__track {
    padding-inline: 0 !important;
    scroll-padding-inline: 0 !important;
  }
  .yam3x-carousel--center-aligned-hero .yam3x-carousel__track {
    scroll-padding-inline: 50% !important;
  }
  .yam3x-carousel__item-content :is([data-yam3x-carousel-parallax], img, video) {
    transform: none !important;
  }
  .yam3x-carousel:is(.yam3x-carousel--multi-browse, .yam3x-carousel--hero) .yam3x-carousel__track {
    clip-path: none;
  }
}
@media (forced-colors: active) {
  .yam3x-carousel__item {
    border: 1px solid CanvasText;
  }
  .yam3x-carousel__item:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-carousel__item--disabled {
    color: GrayText;
    border-color: GrayText;
  }
}
</style>
