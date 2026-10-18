<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import type { TabItem, TabsLayout, TabsVariant } from './tabs.types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    locale?: string
    items: TabItem[]
    label?: string
    variant?: TabsVariant
    layout?: TabsLayout
    headerPosition?: 'before' | 'after'
    stretch?: boolean
    disablePagination?: boolean | 'auto'
    disableSwipe?: boolean
    previousPageLabel?: string
    nextPageLabel?: string
  }>(),
  {
    label: undefined,
    variant: 'secondary',
    layout: 'auto',
    headerPosition: 'before',
    stretch: false,
    disablePagination: false,
    disableSwipe: false,
    previousPageLabel: undefined,
    nextPageLabel: undefined,
  },
)
const model = defineModel<string>()
const emit = defineEmits<{
  select: [item: TabItem]
}>()
const slots = defineSlots<{
  panel(props: { item: TabItem; selected: boolean }): unknown
  'tab-content'?(props: { item: TabItem; selected: boolean }): unknown
  icon?(props: { item: TabItem }): unknown
  badge?(props: { item: TabItem }): unknown
  'previous-icon'?(): unknown
  'next-icon'?(): unknown
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ previousPage: props.previousPageLabel, nextPage: props.nextPageLabel }),
)

const attrs = useAttrs()
const host = ref<HTMLElement | null>(null)
const scrollport = ref<HTMLElement | null>(null)
const strip = ref<HTMLElement | null>(null)
const tabButtons = ref<HTMLButtonElement[]>([])
const overflow = ref(false)
const canPrevious = ref(false)
const canNext = ref(false)
const coarsePointer = ref(false)
const indicatorReady = ref(false)
const indicatorDirection = ref<'start' | 'end' | null>(null)
const panelMotion = ref<{ from: string; to: string; direction: 'start' | 'end' } | null>(null)
const indicatorStyle = ref<Record<string, string>>({
  '--_yam3x-tabs-indicator-left': '0px',
  '--_yam3x-tabs-indicator-right': '0px',
})
const instanceId = useId()
const variant = computed<TabsVariant>(() => (props.variant === 'primary' ? 'primary' : 'secondary'))
const headerPosition = computed(() => (props.headerPosition === 'after' ? 'after' : 'before'))
const layout = computed(() =>
  props.layout === 'fixed' || props.layout === 'scrollable'
    ? props.layout
    : props.items.length > 4
      ? 'scrollable'
      : 'fixed',
)
const selectedValue = computed(
  () =>
    props.items.find((item) => item.value === model.value && !item.disabled)?.value ??
    props.items.find((item) => !item.disabled)?.value,
)
const selectedIndex = computed(() =>
  props.items.findIndex((item) => item.value === selectedValue.value),
)
const hasIcon = computed(
  () => (Boolean(slots.icon) || Boolean(slots['tab-content'])) && variant.value === 'primary',
)
const showPagination = computed(
  () =>
    overflow.value &&
    props.disablePagination !== true &&
    !(props.disablePagination === 'auto' && coarsePointer.value),
)
let resizeObserver: ResizeObserver | null = null
let touchStart: { id: number; x: number; y: number } | null = null
let readyFrame = 0
let panelMotionTimer = 0

function tabId(index: number) {
  return `${instanceId}-tab-${index}`
}
function panelId(index: number) {
  return `${instanceId}-panel-${index}`
}
function badgeText(badge: string | number) {
  const text = `${badge}`
  return text.length <= 4 ? text : /^\d+$/.test(text) ? '999+' : `${text.slice(0, 3)}+`
}
function select(item: TabItem) {
  if (item.disabled) return
  if (item.value !== selectedValue.value) model.value = item.value
  emit('select', item)
}
function focusIndex(index: number) {
  const button = tabButtons.value[index]
  button?.focus({ preventScroll: true })
  button?.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
function onKeydown(event: KeyboardEvent, index: number) {
  const enabled = props.items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0)
  if (!enabled.length) return
  const rtl = getComputedStyle(host.value!).direction === 'rtl'
  const forward = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')
  const backward = event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')
  if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  if (event.key === 'Home') focusIndex(enabled[0])
  else if (event.key === 'End') focusIndex(enabled[enabled.length - 1])
  else {
    const position = enabled.indexOf(index)
    focusIndex(enabled[(position + (forward ? 1 : -1) + enabled.length) % enabled.length])
  }
}
function updateGeometry() {
  const viewport = scrollport.value
  const rail = strip.value
  if (!viewport || !rail) return
  overflow.value = rail.scrollWidth > viewport.clientWidth + 1
  const first = tabButtons.value[0]
  const last = tabButtons.value[props.items.length - 1]
  const visible = viewport.getBoundingClientRect()
  const rtl = getComputedStyle(viewport).direction === 'rtl'
  canPrevious.value =
    !!first &&
    (rtl
      ? first.getBoundingClientRect().right > visible.right + 1
      : first.getBoundingClientRect().left < visible.left - 1)
  canNext.value =
    !!last &&
    (rtl
      ? last.getBoundingClientRect().left < visible.left - 1
      : last.getBoundingClientRect().right > visible.right + 1)
  const selected = tabButtons.value[selectedIndex.value]
  if (!selected) {
    indicatorStyle.value = {
      '--_yam3x-tabs-indicator-left': '0px',
      '--_yam3x-tabs-indicator-right': '0px',
    }
    return
  }
  const label = selected.querySelector<HTMLElement>('.yam3x-tabs__label')
  const selectedRect = selected.getBoundingClientRect()
  const railRect = rail.getBoundingClientRect()
  const labelRect = label?.getBoundingClientRect()
  const width =
    variant.value === 'primary' && labelRect ? Math.max(28, labelRect.width) : selectedRect.width
  const left =
    variant.value === 'primary' && label
      ? labelRect!.left - railRect.left + (labelRect!.width - width) / 2
      : selectedRect.left - railRect.left
  indicatorStyle.value = {
    '--_yam3x-tabs-indicator-left': `${left}px`,
    '--_yam3x-tabs-indicator-right': `${railRect.width - left - width}px`,
  }
}
function page(direction: -1 | 1) {
  const viewport = scrollport.value
  if (!viewport) return
  const rtl = getComputedStyle(viewport).direction === 'rtl'
  viewport.scrollBy({
    left: direction * (rtl ? -1 : 1) * Math.max(48, viewport.clientWidth * 0.8),
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
function scrollSelectedIntoView() {
  if (layout.value !== 'scrollable') return
  tabButtons.value[selectedIndex.value]?.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
function onPointerDown(event: PointerEvent) {
  if (props.disableSwipe || event.pointerType !== 'touch') return
  const target = event.target instanceof Element ? event.target : null
  if (
    target?.closest(
      'button, a, input, select, textarea, [contenteditable], [role="button"], [role="slider"]',
    )
  )
    return
  touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
}
function onPointerUp(event: PointerEvent) {
  if (!touchStart || event.pointerId !== touchStart.id) return
  const dx = event.clientX - touchStart.x
  const dy = event.clientY - touchStart.y
  touchStart = null
  if (
    props.disableSwipe ||
    layout.value !== 'fixed' ||
    Math.abs(dx) < 50 ||
    Math.abs(dx) < Math.abs(dy) * 1.5
  )
    return
  const rtl = getComputedStyle(host.value!).direction === 'rtl'
  const step = (dx < 0 ? 1 : -1) * (rtl ? -1 : 1)
  for (
    let index = selectedIndex.value + step;
    index >= 0 && index < props.items.length;
    index += step
  ) {
    if (!props.items[index].disabled) {
      select(props.items[index])
      break
    }
  }
}
function setButton(element: unknown, index: number) {
  if (element) tabButtons.value[index] = element as HTMLButtonElement
}
onMounted(() => {
  coarsePointer.value = matchMedia('(hover: none) and (pointer: coarse)').matches
  resizeObserver = new ResizeObserver(updateGeometry)
  if (host.value) resizeObserver.observe(host.value)
  if (scrollport.value) resizeObserver.observe(scrollport.value)
  if (strip.value) resizeObserver.observe(strip.value)
  nextTick(() => {
    updateGeometry()
    readyFrame = requestAnimationFrame(() => {
      readyFrame = requestAnimationFrame(() => {
        indicatorReady.value = true
      })
    })
  })
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  cancelAnimationFrame(readyFrame)
  clearTimeout(panelMotionTimer)
})
watch(
  [selectedValue, variant, layout, () => props.items, () => props.stretch],
  () =>
    nextTick(() => {
      updateGeometry()
      scrollSelectedIntoView()
    }),
  { deep: true },
)
watch(selectedValue, (value, previous) => {
  clearTimeout(panelMotionTimer)
  panelMotion.value = null
  if (!indicatorReady.value || !value || !previous || value === previous) return
  const oldIndex = props.items.findIndex((item) => item.value === previous)
  const newIndex = props.items.findIndex((item) => item.value === value)
  if (oldIndex < 0 || newIndex < 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const rtl = getComputedStyle(host.value!).direction === 'rtl'
  const direction = newIndex > oldIndex !== rtl ? 'end' : 'start'
  indicatorDirection.value = direction
  panelMotion.value = { from: previous, to: value, direction }
  const styles = getComputedStyle(host.value!)
  const duration = styles.getPropertyValue('--_yam3x-tabs-motion-duration').trim()
  const milliseconds = duration.endsWith('ms')
    ? parseFloat(duration)
    : duration.endsWith('s')
      ? parseFloat(duration) * 1000
      : 707
  panelMotionTimer = window.setTimeout(
    () => {
      panelMotion.value = null
    },
    Number.isFinite(milliseconds) ? milliseconds : 500,
  )
})
watch(
  selectedValue,
  (value) => {
    if (value !== undefined && model.value !== value) model.value = value
  },
  { immediate: true },
)
</script>

<template>
  <div
    ref="host"
    v-bind="attrs"
    class="yam3x-tabs"
    :class="[
      `yam3x-tabs--${variant}`,
      `yam3x-tabs--${layout}`,
      `yam3x-tabs--header-${headerPosition}`,
      {
        'yam3x-tabs--stretch': stretch,
        'yam3x-tabs--with-icons': hasIcon,
        'yam3x-tabs--ready': indicatorReady,
        'yam3x-tabs--motion-start': indicatorDirection === 'start',
        'yam3x-tabs--motion-end': indicatorDirection === 'end',
      },
    ]"
  >
    <div class="yam3x-tabs__header">
      <button
        v-if="showPagination"
        type="button"
        class="yam3x-tabs__page yam3x-tabs__page--previous"
        :aria-label="actionMessages.previousPage"
        :disabled="!canPrevious"
        @click="page(-1)"
      >
        <slot name="previous-icon"><Icon name="chevron_left" /></slot>
      </button>
      <div
        ref="scrollport"
        class="yam3x-tabs__scrollport"
        @scroll="updateGeometry"
      >
        <div
          ref="strip"
          class="yam3x-tabs__strip"
          role="tablist"
          :aria-label="label ?? (attrs['aria-label'] as string | undefined)"
        >
          <button
            v-for="(item, index) in items"
            :id="tabId(index)"
            :key="item.value"
            :ref="(element) => setButton(element, index)"
            v-ripple
            type="button"
            class="yam3x-tabs__tab"
            :class="{ 'yam3x-tabs__tab--selected': item.value === selectedValue }"
            data-yam3x-ripple
            role="tab"
            :aria-selected="item.value === selectedValue"
            :aria-controls="panelId(index)"
            :aria-label="item.ariaLabel ?? item.label"
            :disabled="item.disabled"
            :aria-disabled="item.disabled || undefined"
            @click="select(item)"
            @keydown="onKeydown($event, index)"
          >
            <span
              class="yam3x-tabs__state"
              aria-hidden="true"
            />
            <span
              class="yam3x-tabs__content"
              :class="{ 'yam3x-tabs__content--custom': !!slots['tab-content'] }"
            >
              <slot
                name="tab-content"
                :item="item"
                :selected="item.value === selectedValue"
              >
                <span
                  v-if="hasIcon"
                  class="yam3x-tabs__icon"
                  aria-hidden="true"
                  ><slot
                    name="icon"
                    :item="item"
                /></span>
                <span class="yam3x-tabs__label">{{ item.label }}</span>
                <span
                  v-if="item.badge !== undefined || $slots.badge"
                  class="yam3x-tabs__badge"
                  aria-hidden="true"
                  ><slot
                    name="badge"
                    :item="item"
                    >{{ item.badge === undefined ? '' : badgeText(item.badge) }}</slot
                  ></span
                >
              </slot>
            </span>
          </button>
          <span
            class="yam3x-tabs__indicator"
            :style="indicatorStyle"
            aria-hidden="true"
          />
        </div>
      </div>
      <button
        v-if="showPagination"
        type="button"
        class="yam3x-tabs__page yam3x-tabs__page--next"
        :aria-label="actionMessages.nextPage"
        :disabled="!canNext"
        @click="page(1)"
      >
        <slot name="next-icon"><Icon name="chevron_right" /></slot>
      </button>
    </div>
    <div
      class="yam3x-tabs__panels"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="touchStart = null"
    >
      <div
        v-for="(item, index) in items"
        v-show="item.value === selectedValue || item.value === panelMotion?.from"
        :id="panelId(index)"
        :key="item.value"
        class="yam3x-tabs__panel"
        :class="{
          'yam3x-tabs__panel--enter-start':
            panelMotion?.to === item.value && panelMotion.direction === 'start',
          'yam3x-tabs__panel--enter-end':
            panelMotion?.to === item.value && panelMotion.direction === 'end',
          'yam3x-tabs__panel--leave-start':
            panelMotion?.from === item.value && panelMotion.direction === 'start',
          'yam3x-tabs__panel--leave-end':
            panelMotion?.from === item.value && panelMotion.direction === 'end',
        }"
        role="tabpanel"
        :aria-labelledby="tabId(index)"
        :aria-hidden="item.value !== selectedValue || undefined"
        :inert="item.value !== selectedValue"
        :tabindex="item.value === selectedValue ? 0 : -1"
      >
        <slot
          name="panel"
          :item="item"
          :selected="item.value === selectedValue"
        />
      </div>
    </div>
  </div>
</template>

<style>
.yam3x-tabs {
  --_yam3x-tabs-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-tabs-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-tabs-color-surface: var(--md-sys-color-surface);
  --_yam3x-tabs-color-primary: var(--md-sys-color-primary);
  --_yam3x-tabs-color-secondary: var(--md-sys-color-secondary);
  --_yam3x-tabs-color-outline: var(--md-sys-color-outline);
  --_yam3x-tabs-color-outline-variant: var(--md-sys-color-outline-variant);
  --_yam3x-tabs-color-error: var(--md-sys-color-error);
  --_yam3x-tabs-color-on-error: var(--md-sys-color-on-error);
  --_yam3x-tabs-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-tabs-type-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-tabs-color-selected: var(--yam3x-tab-selected-color, var(--_yam3x-tabs-color-primary));
  --_yam3x-tabs-color-unselected: var(--_yam3x-tabs-color-on-surface-variant);
  --_yam3x-tabs-color-interactive: var(--_yam3x-tabs-color-on-surface);
  --_yam3x-tabs-color-pressed-unselected: var(--_yam3x-tabs-color-primary);
  --_yam3x-tabs-state-hover-opacity: var(--md-sys-state-hover-opacity, 0.08);
  --_yam3x-tabs-state-focus-opacity: var(--md-sys-state-focus-opacity, 0.1);
  --_yam3x-tabs-focus-ring-thickness: var(--yam3x-focus-ring-thickness, 3px);
  --_yam3x-tabs-focus-ring-shape: 16px;
  --_yam3x-tabs-label-font-size: var(--yam3x-tab-font-size, 14px);
  --_yam3x-tabs-label-font-weight: 500;
  --_yam3x-tabs-label-line-height: 20px;
  --_yam3x-tabs-label-tracking: 0.1px;
  --_yam3x-tabs-spacing-inline-icon-label: 8px;
  --_yam3x-tabs-spacing-label-badge: 4px;
  --_yam3x-tabs-content-gap: var(--yam3x-tab-spacing, var(--_yam3x-tabs-spacing-inline-icon-label));
  --_yam3x-tabs-tab-padding-inline: 12px;
  --_yam3x-tabs-icon-size: 24px;
  --_yam3x-tabs-badge-overlap: 6px;
  --_yam3x-tabs-indicator-inset: 2px;
  --_yam3x-tabs-indicator-min-width: 24px;
  --_yam3x-tabs-indicator-primary-height: var(--yam3x-tabs-primary-active-indicator-thickness, 3px);
  --_yam3x-tabs-indicator-secondary-height: 2px;
  --_yam3x-tabs-indicator-color: var(
    --yam3x-tabs-active-indicator-color,
    var(--_yam3x-tabs-color-primary)
  );
  --_yam3x-tabs-indicator-primary-shape-before: 3px 3px 0 0;
  --_yam3x-tabs-indicator-primary-shape-after: 0 0 3px 3px;
  --_yam3x-tabs-paginator-icon-size: var(--_yam3x-tabs-icon-size);
  --_yam3x-tabs-motion-duration: var(--md-sys-motion-duration-slow-spatial, 650ms);
  --_yam3x-tabs-motion-easing: var(--md-sys-motion-easing-slow-spatial, cubic-bezier(0.2, 0, 0, 1));
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  min-inline-size: 0;
  color: var(--_yam3x-tabs-color-on-surface);
  background: var(--_yam3x-tabs-color-surface);
}
.yam3x-tabs--secondary {
  --_yam3x-tabs-color-selected: var(
    --yam3x-tab-selected-color,
    var(--_yam3x-tabs-color-on-surface)
  );
  --_yam3x-tabs-color-pressed-unselected: var(--_yam3x-tabs-color-on-surface);
}
.yam3x-tabs[hidden] {
  display: none;
}
.yam3x-tabs__header {
  display: flex;
  align-items: stretch;
  min-inline-size: 0;
  border-block-end: 1px solid var(--_yam3x-tabs-color-outline-variant);
}
.yam3x-tabs--header-after .yam3x-tabs__header {
  order: 1;
  border-block-end: 0;
  border-block-start: 1px solid var(--_yam3x-tabs-color-outline-variant);
}
.yam3x-tabs__scrollport {
  flex: 1 1 auto;
  min-inline-size: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.yam3x-tabs__scrollport::-webkit-scrollbar {
  display: none;
}
.yam3x-tabs__strip {
  position: relative;
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
  block-size: 48px;
  min-inline-size: 100%;
  inline-size: 100%;
}
.yam3x-tabs--primary.yam3x-tabs--with-icons .yam3x-tabs__strip {
  block-size: 64px;
}
.yam3x-tabs--scrollable .yam3x-tabs__strip {
  inline-size: max-content;
  padding-inline-start: 52px;
}
.yam3x-tabs__tab {
  position: relative;
  isolation: isolate;
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-inline-size: 0;
  block-size: 100%;
  padding-block: 0;
  padding-inline: calc(
    var(--_yam3x-tabs-tab-padding-inline) * var(--_yam3x-tabs-density-spacing-scale)
  );
  border: 0;
  border-radius: var(--_yam3x-tabs-focus-ring-shape);
  background: transparent;
  --_yam3x-tabs-ripple-color: var(--_yam3x-tabs-color-pressed-unselected);
  --yam3x-ripple-color: var(--_yam3x-tabs-ripple-color);
  color: var(--_yam3x-tabs-color-unselected);
  font-family: inherit;
  font-size: var(--_yam3x-tabs-label-font-size);
  font-weight: var(--_yam3x-tabs-label-font-weight);
  line-height: calc(
    var(--_yam3x-tabs-label-line-height) * var(--_yam3x-tabs-type-line-height-scale)
  );
  letter-spacing: var(--_yam3x-tabs-label-tracking);
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.yam3x-tabs--scrollable .yam3x-tabs__tab {
  flex: none;
  min-inline-size: 80px;
  max-inline-size: none;
}
.yam3x-tabs--stretch .yam3x-tabs__tab {
  flex-grow: 1;
}
.yam3x-tabs__tab--selected {
  color: var(--_yam3x-tabs-color-selected);
  --_yam3x-tabs-ripple-color: var(--_yam3x-tabs-color-selected);
  --yam3x-ripple-color: var(--_yam3x-tabs-ripple-color);
}
.yam3x-tabs__tab:not(:disabled):is(:hover, :focus-visible, :active) {
  color: var(--_yam3x-tabs-color-interactive);
}
.yam3x-tabs--primary .yam3x-tabs__tab--selected:not(:disabled):is(:hover, :focus-visible, :active) {
  color: var(--_yam3x-tabs-color-selected);
}
.yam3x-tabs--secondary
  .yam3x-tabs__tab--selected:not(:disabled):is(:hover, :focus-visible, :active) {
  color: var(--_yam3x-tabs-color-interactive);
}
.yam3x-tabs__tab:disabled {
  color: color-mix(in srgb, var(--_yam3x-tabs-color-on-surface) 38%, transparent);
  cursor: default;
}
.yam3x-tabs__state {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: var(--_yam3x-tabs-focus-ring-shape);
  opacity: 0;
}
.yam3x-tabs__tab:not(:disabled):hover .yam3x-tabs__state {
  background: var(--_yam3x-tabs-color-on-surface);
  opacity: var(--_yam3x-tabs-state-hover-opacity);
}
.yam3x-tabs__tab--selected:not(:disabled):hover .yam3x-tabs__state {
  background: var(--_yam3x-tabs-color-selected);
  opacity: var(--_yam3x-tabs-state-hover-opacity);
}
.yam3x-tabs__tab:not(:disabled):focus-visible .yam3x-tabs__state {
  background: var(--_yam3x-tabs-color-on-surface);
  opacity: var(--_yam3x-tabs-state-focus-opacity);
}
.yam3x-tabs__tab--selected:not(:disabled):focus-visible .yam3x-tabs__state {
  background: var(--_yam3x-tabs-color-selected);
  opacity: var(--_yam3x-tabs-state-focus-opacity);
}
.yam3x-tabs__tab:focus-visible {
  outline: var(--_yam3x-tabs-focus-ring-thickness) solid var(--_yam3x-tabs-color-secondary);
  outline-offset: -3px;
  border-radius: var(--_yam3x-tabs-focus-ring-shape);
  z-index: 2;
}
.yam3x-tabs--secondary .yam3x-tabs__tab--selected {
  --_yam3x-tabs-ripple-color: var(--_yam3x-tabs-color-on-surface);
  --yam3x-ripple-color: var(--_yam3x-tabs-ripple-color);
}
.yam3x-tabs__content {
  position: relative;
  z-index: 2;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  column-gap: var(--_yam3x-tabs-content-gap);
  min-inline-size: 0;
  pointer-events: none;
}
.yam3x-tabs--primary.yam3x-tabs--with-icons .yam3x-tabs__content {
  flex-direction: column;
  row-gap: calc(var(--_yam3x-tabs-spacing-label-badge) * var(--_yam3x-tabs-density-spacing-scale));
}
.yam3x-tabs--primary.yam3x-tabs--with-icons .yam3x-tabs__content--custom {
  flex-direction: row;
  row-gap: 0;
}
.yam3x-tabs__icon {
  display: grid;
  place-items: center;
  inline-size: var(--_yam3x-tabs-icon-size);
  block-size: var(--_yam3x-tabs-icon-size);
  font-size: var(--_yam3x-tabs-icon-size);
}
.yam3x-tabs__icon > * {
  inline-size: 1em;
  block-size: 1em;
}
.yam3x-tabs__label {
  display: inline-block;
  max-inline-size: 100%;
  overflow: hidden;
  overflow-wrap: anywhere;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.yam3x-tabs--scrollable .yam3x-tabs__label {
  max-inline-size: none;
  overflow: visible;
  line-clamp: unset;
  -webkit-line-clamp: unset;
}
.yam3x-tabs__badge {
  display: inline-grid;
  place-items: center;
  min-inline-size: 16px;
  block-size: 16px;
  padding-inline: calc(2px * var(--_yam3x-tabs-density-spacing-scale));
  border-radius: 8px;
  background: var(--_yam3x-tabs-color-error);
  color: var(--_yam3x-tabs-color-on-error);
  font-size: 11px;
  line-height: 1;
  margin-inline-start: calc(
    calc(var(--_yam3x-tabs-spacing-label-badge) * var(--_yam3x-tabs-density-spacing-scale)) -
      var(--_yam3x-tabs-content-gap)
  );
}
.yam3x-tabs__badge:empty {
  display: none;
}
.yam3x-tabs--primary.yam3x-tabs--with-icons .yam3x-tabs__badge {
  position: absolute;
  inset-block-start: -3px;
  inset-inline-start: calc(50% + var(--_yam3x-tabs-badge-overlap));
  margin: 0;
}
.yam3x-tabs__indicator {
  position: absolute;
  z-index: 1;
  inset-block-end: 0;
  left: calc(var(--_yam3x-tabs-indicator-left) + var(--_yam3x-tabs-indicator-inset));
  right: calc(var(--_yam3x-tabs-indicator-right) + var(--_yam3x-tabs-indicator-inset));
  min-inline-size: 0;
  block-size: var(--_yam3x-tabs-indicator-secondary-height);
  background: var(--_yam3x-tabs-indicator-color);
  pointer-events: none;
}
.yam3x-tabs--ready .yam3x-tabs__indicator {
  transition:
    left var(--_yam3x-tabs-motion-duration) var(--_yam3x-tabs-motion-easing),
    right var(--_yam3x-tabs-motion-duration) var(--_yam3x-tabs-motion-easing);
}
.yam3x-tabs--primary .yam3x-tabs__indicator {
  block-size: var(--_yam3x-tabs-indicator-primary-height);
  border-radius: var(--_yam3x-tabs-indicator-primary-shape-before);
  min-inline-size: var(--_yam3x-tabs-indicator-min-width);
}
.yam3x-tabs--primary.yam3x-tabs--header-after .yam3x-tabs__indicator {
  border-radius: var(--_yam3x-tabs-indicator-primary-shape-after);
}
.yam3x-tabs--header-after .yam3x-tabs__indicator {
  inset-block-end: auto;
  inset-block-start: 0;
}
.yam3x-tabs__page {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: 48px;
  block-size: 48px;
  padding: 0;
  border: 0;
  background: var(--_yam3x-tabs-color-surface);
  color: var(--_yam3x-tabs-color-on-surface);
  cursor: pointer;
}
.yam3x-tabs__page:disabled {
  color: var(--_yam3x-tabs-color-outline);
  cursor: default;
}
.yam3x-tabs__page:focus-visible {
  outline: var(--_yam3x-tabs-focus-ring-thickness) solid var(--_yam3x-tabs-color-secondary);
  outline-offset: -3px;
}
.yam3x-tabs__page svg {
  inline-size: var(--_yam3x-tabs-paginator-icon-size);
  block-size: var(--_yam3x-tabs-paginator-icon-size);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.yam3x-tabs__page .yam3x-icon {
  inline-size: var(--_yam3x-tabs-paginator-icon-size);
  block-size: var(--_yam3x-tabs-paginator-icon-size);
  font-size: var(--_yam3x-tabs-paginator-icon-size);
}
[dir='rtl'] .yam3x-tabs__page svg,
[dir='rtl'].yam3x-tabs .yam3x-tabs__page svg {
  transform: scaleX(-1);
}
[dir='rtl'] .yam3x-tabs__page .yam3x-icon,
[dir='rtl'].yam3x-tabs .yam3x-tabs__page .yam3x-icon {
  transform: scaleX(-1);
}
.yam3x-tabs__panels {
  position: relative;
  min-inline-size: 0;
  overflow: hidden;
}
.yam3x-tabs__panel {
  min-inline-size: 0;
  overflow: auto;
}
.yam3x-tabs__panel--leave-start,
.yam3x-tabs__panel--leave-end {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.yam3x-tabs__panel--enter-start {
  animation: yam3x-tabs-enter-start var(--_yam3x-tabs-motion-duration)
    var(--_yam3x-tabs-motion-easing) both;
}
.yam3x-tabs__panel--enter-end {
  animation: yam3x-tabs-enter-end var(--_yam3x-tabs-motion-duration)
    var(--_yam3x-tabs-motion-easing) both;
}
.yam3x-tabs__panel--leave-start {
  animation: yam3x-tabs-leave-start var(--_yam3x-tabs-motion-duration)
    var(--_yam3x-tabs-motion-easing) both;
}
.yam3x-tabs__panel--leave-end {
  animation: yam3x-tabs-leave-end var(--_yam3x-tabs-motion-duration)
    var(--_yam3x-tabs-motion-easing) both;
}
@keyframes yam3x-tabs-enter-start {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes yam3x-tabs-enter-end {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes yam3x-tabs-leave-start {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes yam3x-tabs-leave-end {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-tabs__indicator {
    transition: none;
  }
  .yam3x-tabs__scrollport {
    scroll-behavior: auto;
  }
  .yam3x-tabs__panel {
    animation: none;
  }
}
@media (forced-colors: active) {
  .yam3x-tabs {
    background: Canvas;
    color: CanvasText;
  }
  .yam3x-tabs__header {
    border-color: GrayText;
  }
  .yam3x-tabs__tab {
    color: ButtonText;
  }
  .yam3x-tabs__tab:disabled {
    color: GrayText;
  }
  .yam3x-tabs__indicator {
    background: Highlight;
    forced-color-adjust: none;
  }
  .yam3x-tabs__tab:focus-visible,
  .yam3x-tabs__page:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-tabs__badge {
    background: Highlight;
    color: HighlightText;
    forced-color-adjust: none;
  }
}
</style>
