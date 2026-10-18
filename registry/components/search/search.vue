<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
  type CSSProperties,
} from 'vue'
import { vRipple } from '../_shared/ripple'
import { acquirePageScrollLock } from '../_shared/page-scroll-lock'
import Icon from '../icon/icon.vue'
import type { SearchLayout, SearchVariant } from './search.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    locale?: string
    label?: string
    layout?: SearchLayout
    variant?: SearchVariant
    disabled?: boolean
    hideSearchIcon?: boolean
    clearable?: boolean
    closeLabel?: string
    clearLabel?: string
  }>(),
  {
    label: undefined,
    layout: 'auto',
    variant: 'contained',
    disabled: false,
    hideSearchIcon: false,
    clearable: true,
    closeLabel: undefined,
    clearLabel: undefined,
  },
)

const query = defineModel<string>('query', { default: '' })
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ search: [query: string]; clear: [] }>()
defineSlots<{
  default?(props: { query: string; close: () => void }): unknown
  'input-field'?(props: {
    inputProps: Record<string, unknown>
    query: string
    open: boolean
    disabled: boolean
  }): unknown
  leading?(): unknown
  trailing?(): unknown
  back?(): unknown
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ search: props.label, back: props.closeLabel, clear: props.clearLabel }),
)

const attrs = useAttrs()
const slots = useSlots()
const root = ref<HTMLElement | null>(null)
const barFrame = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const results = ref<HTMLElement | null>(null)
const viewMounted = ref(open.value)
const viewClosing = ref(false)
const viewReopening = ref(false)
const viewExitStartStyle = ref<CSSProperties>({})
const paneWidth = ref(0)
const dockedViewStyle = ref<CSSProperties>({})
const supportsPopover = ref(false)
const searchId = useId()
const searchboxId = `${searchId}-input`
const resultsId = `${searchId}-results`
const resolvedLayout = computed<Exclude<SearchLayout, 'auto'>>(() => {
  if (props.layout !== 'auto') return props.layout
  return paneWidth.value >= 600 ? 'docked' : 'fullscreen'
})
const rootClasses = computed(() => [
  `yam3x-search--${props.variant}`,
  open.value ? 'yam3x-search--open' : '',
  open.value ? `yam3x-search--${resolvedLayout.value}` : '',
  open.value ? `yam3x-search--open-${resolvedLayout.value}` : '',
  props.disabled ? 'yam3x-search--disabled' : '',
])

let resizeObserver: ResizeObserver | undefined
let releasePageScrollLock: (() => void) | undefined
let suppressFocusOpen = false
let anchorTrackingFrame = 0
let anchorTrackingUntil = 0
let viewCloseTimer = 0
let viewReopeningTimer = 0
let viewClosePending = false

function transitionDurationMs(element: HTMLElement): number {
  const style = getComputedStyle(element)
  const durations = style.transitionDuration.split(',').map((value) => value.trim())
  const delays = style.transitionDelay.split(',').map((value) => value.trim())
  const timeInMs = (value: string | undefined) => {
    if (!value) return 0
    const amount = Number.parseFloat(value)
    return value.endsWith('ms') ? amount : amount * 1000
  }
  return Math.max(
    0,
    ...durations.map(
      (duration, index) => timeInMs(duration) + timeInMs(delays[index % delays.length]),
    ),
  )
}

function finishViewClose(): void {
  if (viewCloseTimer) window.clearTimeout(viewCloseTimer)
  if (viewReopeningTimer) window.clearTimeout(viewReopeningTimer)
  viewCloseTimer = 0
  viewReopeningTimer = 0
  viewClosePending = false
  viewReopening.value = false
  viewExitStartStyle.value = {}
  if (supportsPopover.value && results.value?.matches(':popover-open')) {
    try {
      results.value.hidePopover()
    } catch {
      // Removing the view below also closes a browser-managed popover.
    }
  }
  viewMounted.value = false
  viewClosing.value = false
}

function onViewTransitionEnd(event: TransitionEvent): void {
  if (event.target !== results.value || event.propertyName !== 'transform') return
  if (viewClosing.value && !open.value) finishViewClose()
  else if (viewReopening.value) {
    if (viewReopeningTimer) window.clearTimeout(viewReopeningTimer)
    viewReopeningTimer = 0
    viewReopening.value = false
  }
}

function syncPaneWidth(): void {
  const previousWidth = paneWidth.value
  if (root.value) paneWidth.value = root.value.getBoundingClientRect().width
  syncDockedViewPosition()
  if (paneWidth.value !== previousWidth && open.value && resolvedLayout.value === 'docked')
    trackAnchorDuringMotion()
}

function syncDockedViewPosition(): void {
  if (!barFrame.value || !open.value || resolvedLayout.value !== 'docked') return
  const rect = barFrame.value.getBoundingClientRect()
  dockedViewStyle.value = {
    '--_yam3x-search-docked-top': `${rect.bottom}px`,
    '--_yam3x-search-docked-left': `${rect.left}px`,
    '--_yam3x-search-docked-width': `${rect.width}px`,
  }
}

function scheduleDockedViewPosition(): void {
  if (anchorTrackingFrame) return
  anchorTrackingFrame = requestAnimationFrame(() => {
    anchorTrackingFrame = 0
    syncDockedViewPosition()
  })
}

function trackAnchorDuringMotion(): void {
  anchorTrackingUntil = performance.now() + 480
  if (anchorTrackingFrame) cancelAnimationFrame(anchorTrackingFrame)
  const update = () => {
    syncDockedViewPosition()
    if (performance.now() < anchorTrackingUntil) anchorTrackingFrame = requestAnimationFrame(update)
    else anchorTrackingFrame = 0
  }
  anchorTrackingFrame = requestAnimationFrame(update)
}

function onBarFrameTransitionEnd(): void {
  syncDockedViewPosition()
}

function showDockedPopover(): void {
  const view = results.value
  if (!supportsPopover.value || !view || view.matches(':popover-open')) return
  try {
    view.showPopover()
  } catch {
    // Retain the fixed-position fallback if the browser cannot show the popover.
  }
}

function lockPageScroll(): void {
  releasePageScrollLock ??= acquirePageScrollLock()
}

function unlockPageScroll(): void {
  releasePageScrollLock?.()
  releasePageScrollLock = undefined
}

async function focusSearchbox(): Promise<void> {
  await nextTick()
  if (!input.value || input.value.disabled) return
  suppressFocusOpen = true
  input.value.focus()
  suppressFocusOpen = false
}

function close(): void {
  if (!open.value) return
  open.value = false
}

function clear(): void {
  if (!query.value) return
  query.value = ''
  emit('clear')
  void focusSearchbox()
}

function onInputFocus(): void {
  if (!suppressFocusOpen && !props.disabled) open.value = true
}

function onInputClick(): void {
  if (!props.disabled) open.value = true
}

function setInputRef(value: unknown): void {
  if (typeof HTMLInputElement === 'undefined') return
  if (value instanceof HTMLInputElement) {
    input.value = value
    return
  }
  if (value && typeof value === 'object' && '$el' in value) {
    const element = (value as { $el?: unknown }).$el
    input.value = element instanceof HTMLInputElement ? element : null
    return
  }
  input.value = null
}

const inputProps = computed<Record<string, unknown>>(() => ({
  id: searchboxId,
  ref: setInputRef,
  value: query.value,
  class: 'yam3x-search__input',
  type: 'search',
  inputmode: 'search',
  placeholder: actionMessages.value.search,
  'aria-label': actionMessages.value.search,
  'aria-expanded': open.value,
  'aria-haspopup': 'dialog',
  'aria-controls': resultsId,
  disabled: props.disabled,
  autocomplete: 'off',
  onInput: (event: Event) => {
    query.value = (event.target as HTMLInputElement).value
  },
  onFocus: onInputFocus,
  onClick: onInputClick,
}))

function onBarClick(event: MouseEvent): void {
  const target = event.target
  if (target instanceof Element && target.closest('button, a, input, select, textarea')) return
  if (!props.disabled) input.value?.focus()
}

function onSubmit(): void {
  if (props.disabled) return
  emit('search', query.value)
  input.value?.blur()
  void nextTick(() => results.value?.focus())
}

function visibleElements(container: ParentNode, selector: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].filter(
    (element) => !element.hasAttribute('disabled') && element.getClientRects().length > 0,
  )
}

function visibleFocusableElements(container: ParentNode): HTMLElement[] {
  return visibleElements(
    container,
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )
}

function resultItems(): HTMLElement[] {
  if (!results.value) return []
  return visibleElements(
    results.value,
    '[role="option"], [data-search-result], a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )
}

function moveResultFocus(direction: 1 | -1): void {
  const items = resultItems()
  if (items.length === 0) return
  const active = document.activeElement
  const currentIndex = items.findIndex((item) => item === active || item.contains(active))
  const nextIndex =
    currentIndex < 0
      ? direction === 1
        ? 0
        : items.length - 1
      : (currentIndex + direction + items.length) % items.length
  items[nextIndex]?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.target === input.value && event.key === 'ArrowDown') {
    event.preventDefault()
    moveResultFocus(1)
    return
  }
  const target = event.target
  if (target instanceof Node && results.value?.contains(target)) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveResultFocus(event.key === 'ArrowDown' ? 1 : -1)
      return
    }
  }
  if (event.key === 'Tab') {
    const focusable = root.value ? visibleFocusableElements(root.value) : []
    if (focusable.length === 0) {
      event.preventDefault()
      input.value?.focus()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (
      event.shiftKey &&
      (document.activeElement === first || !root.value?.contains(document.activeElement))
    ) {
      event.preventDefault()
      last?.focus()
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || !root.value?.contains(document.activeElement))
    ) {
      event.preventDefault()
      first?.focus()
    }
  }
}

watch(
  open,
  (expanded, wasOpen) => {
    if (expanded === wasOpen || !viewMounted.value || !results.value) return
    const style = getComputedStyle(results.value)
    viewExitStartStyle.value = {
      opacity: style.opacity,
      transform: style.transform,
      '--_yam3x-search-close-start-opacity': style.opacity,
    }
  },
  { flush: 'sync' },
)

watch(
  [open, resolvedLayout],
  async ([expanded, layout], [wasOpen]) => {
    if (expanded && props.disabled) {
      open.value = false
      return
    }
    const stateChanged = expanded !== wasOpen
    if (stateChanged) {
      if (expanded) lockPageScroll()
      else unlockPageScroll()
    }
    if (stateChanged && expanded) {
      const reversingClose =
        viewMounted.value && (viewClosePending || viewClosing.value || viewCloseTimer !== 0)
      if (viewCloseTimer) window.clearTimeout(viewCloseTimer)
      if (viewReopeningTimer) window.clearTimeout(viewReopeningTimer)
      viewCloseTimer = 0
      viewReopeningTimer = 0
      viewClosePending = false
      viewMounted.value = true
      viewClosing.value = false
      viewReopening.value = reversingClose
    } else if (stateChanged && wasOpen) {
      if (viewReopeningTimer) window.clearTimeout(viewReopeningTimer)
      viewReopeningTimer = 0
      viewReopening.value = false
      viewClosePending = true
      viewClosing.value = false
    }
    await nextTick()
    if (expanded && open.value && !viewClosing.value && layout === 'docked') {
      syncDockedViewPosition()
      showDockedPopover()
      trackAnchorDuringMotion()
    }
    if (stateChanged && expanded && open.value && viewReopening.value) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      if (!open.value || !viewReopening.value) return
      viewExitStartStyle.value = {}
      await nextTick()
      const duration = results.value ? transitionDurationMs(results.value) : 0
      if (duration <= 0) viewReopening.value = false
      else
        viewReopeningTimer = window.setTimeout(() => {
          viewReopeningTimer = 0
          viewReopening.value = false
        }, duration + 60)
    }
    if (stateChanged && !expanded && wasOpen && !open.value) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      if (open.value || !viewClosePending) return
      viewClosePending = false
      viewClosing.value = true
      viewExitStartStyle.value = {
        '--_yam3x-search-close-start-opacity': String(viewExitStartStyle.value.opacity ?? 1),
      }
      await nextTick()
      const duration = results.value ? transitionDurationMs(results.value) : 0
      if (duration <= 0) finishViewClose()
      else viewCloseTimer = window.setTimeout(finishViewClose, duration + 60)
    }
    if (stateChanged) await focusSearchbox()
  },
  { flush: 'post' },
)

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && open.value) close()
  },
)

onMounted(async () => {
  supportsPopover.value =
    typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function'
  syncPaneWidth()
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    resizeObserver = new ResizeObserver(syncPaneWidth)
    resizeObserver.observe(root.value)
  }
  window.addEventListener('scroll', scheduleDockedViewPosition, true)
  window.addEventListener('resize', syncPaneWidth)
  if (open.value) {
    lockPageScroll()
    await nextTick()
    if (open.value && resolvedLayout.value === 'docked') {
      syncDockedViewPosition()
      showDockedPopover()
    }
    if (open.value) await focusSearchbox()
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', scheduleDockedViewPosition, true)
  window.removeEventListener('resize', syncPaneWidth)
  if (anchorTrackingFrame) cancelAnimationFrame(anchorTrackingFrame)
  if (viewCloseTimer) window.clearTimeout(viewCloseTimer)
  if (viewReopeningTimer) window.clearTimeout(viewReopeningTimer)
  unlockPageScroll()
})

defineExpose({ close, clear, focus: focusSearchbox })
</script>

<template>
  <div
    ref="root"
    v-bind="attrs"
    class="yam3x-search"
    :class="rootClasses"
    :role="open ? 'dialog' : undefined"
    :aria-label="open ? actionMessages.search : undefined"
    :aria-modal="open ? 'true' : undefined"
    :data-layout="open ? resolvedLayout : undefined"
    :data-open="open ? 'true' : undefined"
    @keydown="onKeydown"
  >
    <div
      ref="barFrame"
      class="yam3x-search__bar-frame"
      @transitionend="onBarFrameTransitionEnd"
      @transitioncancel="onBarFrameTransitionEnd"
    >
      <form
        v-ripple
        class="yam3x-search__bar yam3x-state-layer"
        role="search"
        @submit.prevent="onSubmit"
        @click="onBarClick"
      >
        <div
          v-if="open"
          class="yam3x-search__leading"
          @pointerdown.stop
        >
          <button
            v-ripple
            type="button"
            class="yam3x-search__icon-button yam3x-state-layer"
            :aria-label="actionMessages.back"
            @click="close"
          >
            <slot name="back">
              <Icon name="arrow_back" />
            </slot>
          </button>
        </div>
        <div
          v-else-if="slots.leading || !hideSearchIcon"
          class="yam3x-search__leading"
          @pointerdown.stop
        >
          <slot name="leading">
            <Icon
              class="yam3x-search__search-icon"
              name="search"
            />
          </slot>
        </div>
        <slot
          name="input-field"
          :input-props="inputProps"
          :query="query"
          :open="open"
          :disabled="disabled"
        >
          <input v-bind="inputProps" />
        </slot>
        <div
          v-if="clearable && query && open"
          class="yam3x-search__clear"
          @pointerdown.stop
        >
          <button
            v-ripple
            type="button"
            class="yam3x-search__icon-button yam3x-state-layer"
            :aria-label="actionMessages.clear"
            @click.stop="clear"
          >
            <Icon name="close" />
          </button>
        </div>
        <div
          v-if="slots.trailing"
          class="yam3x-search__trailing"
          :inert="disabled"
          :aria-hidden="disabled ? 'true' : undefined"
          @pointerdown.stop
        >
          <slot name="trailing" />
        </div>
      </form>
    </div>

    <div
      v-if="open && resolvedLayout === 'docked'"
      class="yam3x-search__scrim"
      aria-hidden="true"
      @click.self="close"
    />
    <section
      v-if="viewMounted"
      :id="resultsId"
      ref="results"
      :popover="supportsPopover && resolvedLayout === 'docked' ? 'manual' : undefined"
      :style="[resolvedLayout === 'docked' ? dockedViewStyle : undefined, viewExitStartStyle]"
      class="yam3x-search__view"
      :aria-hidden="!open || viewClosing ? 'true' : undefined"
      :inert="!open || viewClosing"
      :class="[
        `yam3x-search__view--${resolvedLayout}`,
        `yam3x-search__view--${variant}`,
        viewClosing ? 'yam3x-search__view--closing' : '',
        viewReopening ? 'yam3x-search__view--reopening' : '',
      ]"
      :aria-label="actionMessages.searchResults(actionMessages.search)"
      aria-live="polite"
      aria-relevant="additions text"
      tabindex="-1"
      @click.stop
      @transitionend="onViewTransitionEnd"
    >
      <div class="yam3x-search__results-scroll">
        <slot
          :query="query"
          :close="close"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.yam3x-search {
  /* Component mappings: official System roles and Search-specific geometry. */
  --_yam3x-search-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-search-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-search-color-surface-container-high: var(--md-sys-color-surface-container-high);
  --_yam3x-search-content-color: var(--_yam3x-search-color-on-surface);
  --_yam3x-search-bar-container-color: var(--_yam3x-search-color-surface-container-high);
  --_yam3x-search-bar-leading-icon-color: var(--_yam3x-search-color-on-surface);
  --_yam3x-search-bar-trailing-icon-color: var(--_yam3x-search-color-on-surface-variant);
  --_yam3x-search-bar-input-color: var(--_yam3x-search-color-on-surface);
  --_yam3x-search-bar-supporting-text-color: var(--_yam3x-search-color-on-surface-variant);
  --_yam3x-search-bar-focus-indicator-color: var(--md-sys-color-secondary);
  --_yam3x-search-bar-focus-indicator-thickness: 3px;
  --_yam3x-search-bar-focus-indicator-offset: 2px;
  --_yam3x-search-view-contained-container-color: var(--md-sys-color-surface-container-low);
  --_yam3x-search-view-container-color: var(--_yam3x-search-color-surface-container-high);
  --_yam3x-search-view-divider-color: var(--md-sys-color-outline);
  --_yam3x-search-scrollbar-color: var(--md-sys-color-outline-variant);
  --_yam3x-search-outline-color: var(--_yam3x-search-view-divider-color);
  --_yam3x-search-view-docked-scrim-color: var(--md-sys-color-scrim);
  --_yam3x-search-bar-container-height: 56px;
  --_yam3x-search-bar-height: var(--_yam3x-search-bar-container-height);
  --_yam3x-search-shape-corner-full: var(--md-sys-shape-corner-full);
  --_yam3x-search-bar-container-shape: var(--_yam3x-search-shape-corner-full);
  --_yam3x-search-bar-icon-size: 24px;
  --_yam3x-search-bar-actions-gap: 0px;
  --_yam3x-search-spacing-4: calc(4px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-search-spacing-16: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-search-bar-leading-space: var(--_yam3x-search-spacing-4);
  --_yam3x-search-bar-trailing-space: var(--_yam3x-search-spacing-4);
  --_yam3x-search-spacing-8: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-search-bar-no-actions-leading-space: var(--_yam3x-search-spacing-16);
  --_yam3x-search-bar-no-actions-trailing-space: var(--_yam3x-search-spacing-16);
  --_yam3x-search-bar-leading-actions-trailing-space: var(--_yam3x-search-spacing-4);
  --_yam3x-search-bar-trailing-actions-leading-space: var(--_yam3x-search-spacing-4);
  --_yam3x-search-text-font-family: var(--md-sys-typescale-body-large-font-family);
  --_yam3x-search-text-font-size: var(--md-sys-typescale-body-large-font-size);
  --_yam3x-search-text-font-weight: var(--md-sys-typescale-body-large-font-weight);
  --_yam3x-search-text-line-height: var(--md-sys-typescale-body-large-line-height);
  --_yam3x-search-text-tracking: var(--md-sys-typescale-body-large-tracking);
  --_yam3x-search-bar-input-text-font-size: var(--_yam3x-search-text-font-size);
  --_yam3x-search-bar-input-text-font-weight: var(--_yam3x-search-text-font-weight);
  --_yam3x-search-bar-input-text-line-height: var(--_yam3x-search-text-line-height);
  --_yam3x-search-bar-input-text-tracking: var(--_yam3x-search-text-tracking);
  --_yam3x-search-bar-supporting-text-font-size: var(--_yam3x-search-text-font-size);
  --_yam3x-search-bar-supporting-text-font-weight: var(--_yam3x-search-text-font-weight);
  --_yam3x-search-bar-supporting-text-line-height: var(--_yam3x-search-text-line-height);
  --_yam3x-search-bar-supporting-text-tracking: var(--_yam3x-search-text-tracking);
  --_yam3x-search-view-contained-leading-margin: 24px;
  --_yam3x-search-view-contained-trailing-margin: 24px;
  --_yam3x-search-view-contained-focused-leading-margin: 12px;
  --_yam3x-search-view-contained-focused-trailing-margin: 12px;
  --_yam3x-search-view-contained-docked-bar-results-gap: 2px;
  --_yam3x-search-view-contained-docked-results-shape: 12px;
  --_yam3x-search-view-contained-docked-bar-shape: var(--_yam3x-search-shape-corner-full);
  --_yam3x-search-view-contained-full-screen-bar-container-height: var(
    --_yam3x-search-bar-container-height
  );
  --_yam3x-search-view-docked-container-min-height: 240px;
  --_yam3x-search-view-docked-container-max-height: 66.6667dvh;
  --_yam3x-search-view-docked-container-shape: 28px;
  --_yam3x-search-view-docked-header-container-height: var(--_yam3x-search-bar-container-height);
  --_yam3x-search-view-docked-results-bottom-space: var(--_yam3x-search-spacing-16);
  --_yam3x-search-view-docked-scrim-opacity: var(--_yam3x-overlay-scrim-opacity);
  --_yam3x-search-view-full-screen-container-shape: 0px;
  --_yam3x-search-view-full-screen-header-container-height: calc(
    72px * var(--md-sys-density-spacing-scale, 1)
  );
  --_yam3x-search-view-contained-docked-results-space: var(--_yam3x-search-spacing-4);
  --_yam3x-search-view-divider-thickness: 1px;
  --_yam3x-search-inline-margin: var(--_yam3x-search-view-contained-leading-margin);
  --_yam3x-search-inline-end-margin: var(--_yam3x-search-view-contained-trailing-margin);
  --_yam3x-search-bar-width: min(
    720px,
    calc(100% - var(--_yam3x-search-inline-margin) - var(--_yam3x-search-inline-end-margin))
  );
  --_yam3x-search-docked-header-height: var(--_yam3x-search-view-docked-header-container-height);
  --_yam3x-search-docked-gap: var(--_yam3x-search-view-contained-docked-bar-results-gap);
  --_yam3x-search-motion-default-spatial: var(--md-sys-motion-spring-default-spatial);
  --_yam3x-search-motion-fast-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-search-motion-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-search-motion-default-effects: var(--md-sys-motion-spring-default-effects);
  --_yam3x-search-duration-default-spatial: var(--md-sys-motion-duration-default-spatial);
  --_yam3x-search-duration-default-effects: var(--md-sys-motion-duration-default-effects);
  --_yam3x-search-easing-default-spatial: var(--md-sys-motion-easing-default-spatial);
  --_yam3x-search-easing-default-effects: var(--md-sys-motion-easing-default-effects);
  box-sizing: border-box;
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  color: var(--_yam3x-search-content-color);
  font-family: inherit;
}
.yam3x-search[hidden] {
  display: none;
}
.yam3x-search--open {
  z-index: 1000;
}
.yam3x-search--open-fullscreen {
  --_yam3x-search-inline-margin: 12px;
  --_yam3x-search-inline-end-margin: 12px;
}
.yam3x-search--open-docked {
  --_yam3x-search-inline-margin: 12px;
  --_yam3x-search-inline-end-margin: 12px;
}
.yam3x-search__bar-frame {
  box-sizing: border-box;
  position: relative;
  width: var(--_yam3x-search-bar-width);
  margin-inline-start: var(--_yam3x-search-inline-margin);
  margin-inline-end: 0;
  transition:
    width var(--_yam3x-search-motion-default-spatial),
    margin var(--_yam3x-search-motion-default-spatial);
}
.yam3x-search__bar {
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--_yam3x-search-bar-height);
  padding-inline-start: var(--_yam3x-search-bar-leading-space);
  padding-inline-end: var(--_yam3x-search-bar-trailing-space);
  overflow: hidden;
  border: 0;
  border-radius: var(--_yam3x-search-bar-container-shape);
  background: var(--_yam3x-search-bar-container-color);
  color: var(--_yam3x-search-bar-input-color);
  text-align: start;
  cursor: text;
  font-family: var(--_yam3x-search-text-font-family);
  transition:
    background-color var(--_yam3x-search-motion-fast-effects),
    border-radius var(--_yam3x-search-motion-fast-spatial);
}
.yam3x-search__leading,
.yam3x-search__clear,
.yam3x-search__trailing {
  box-sizing: border-box;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--_yam3x-search-bar-leading-icon-color);
}
.yam3x-search__leading {
  min-width: 48px;
  padding-inline: var(--_yam3x-search-bar-leading-space);
}
.yam3x-search__trailing {
  gap: var(--_yam3x-search-bar-actions-gap);
  color: var(--_yam3x-search-bar-trailing-icon-color);
}
.yam3x-search__clear {
  min-width: 48px;
  color: var(--_yam3x-search-bar-trailing-icon-color);
}
.yam3x-search__icon-button {
  box-sizing: border-box;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.yam3x-search__icon-button svg,
.yam3x-search__leading :deep(svg) {
  display: block;
  width: var(--_yam3x-search-bar-icon-size);
  height: var(--_yam3x-search-bar-icon-size);
  fill: currentColor;
}
.yam3x-search__icon-button .yam3x-icon,
.yam3x-search__leading .yam3x-icon {
  width: var(--_yam3x-search-bar-icon-size);
  height: var(--_yam3x-search-bar-icon-size);
  font-size: var(--_yam3x-search-bar-icon-size);
}
.yam3x-search__search-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--_yam3x-search-bar-icon-size);
  height: var(--_yam3x-search-bar-icon-size);
  font-size: var(--_yam3x-search-bar-icon-size);
}
:deep(.yam3x-search__input) {
  box-sizing: border-box;
  flex: 1 1 auto;
  width: 0;
  min-width: 0;
  height: 100%;
  padding: 0;
  margin-inline: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--_yam3x-search-bar-input-color);
  font: inherit;
  font-size: var(--_yam3x-search-bar-input-text-font-size);
  font-weight: var(--_yam3x-search-bar-input-text-font-weight);
  line-height: var(--_yam3x-search-bar-input-text-line-height);
  letter-spacing: var(--_yam3x-search-bar-input-text-tracking);
  appearance: none;
}
:deep(.yam3x-search__input:placeholder-shown) {
  line-height: var(--_yam3x-search-bar-supporting-text-line-height);
}
:deep(.yam3x-search__input::placeholder) {
  color: var(--_yam3x-search-bar-supporting-text-color);
  opacity: 1;
  font-size: var(--_yam3x-search-bar-supporting-text-font-size);
  font-weight: var(--_yam3x-search-bar-supporting-text-font-weight);
  line-height: var(--_yam3x-search-bar-supporting-text-line-height);
  letter-spacing: var(--_yam3x-search-bar-supporting-text-tracking);
}
:deep(.yam3x-search__input::-webkit-search-cancel-button) {
  display: none;
}
.yam3x-search__bar:has(.yam3x-search__leading) {
  padding-inline-start: var(--_yam3x-search-bar-leading-space);
}
.yam3x-search__bar:not(:has(.yam3x-search__leading)) {
  padding-inline-start: var(--_yam3x-search-bar-no-actions-leading-space);
}
.yam3x-search__bar:not(:has(.yam3x-search__clear, .yam3x-search__trailing:not(:empty))) {
  padding-inline-end: var(--_yam3x-search-bar-no-actions-trailing-space);
}
.yam3x-search__bar:has(.yam3x-search__leading) :deep(.yam3x-search__input) {
  margin-inline-start: var(--_yam3x-search-bar-leading-actions-trailing-space);
}
.yam3x-search__bar:has(.yam3x-search__clear, .yam3x-search__trailing:not(:empty))
  :deep(.yam3x-search__input) {
  margin-inline-end: var(--_yam3x-search-bar-trailing-actions-leading-space);
}
.yam3x-search__bar--divided {
  border-radius: var(--_yam3x-search-view-docked-container-shape);
}
.yam3x-search__view {
  box-sizing: border-box;
  position: absolute;
  z-index: 1;
  top: calc(
    var(--_yam3x-search-docked-header-height) +
      var(--_yam3x-search-view-contained-docked-bar-results-gap)
  );
  inset-inline-start: var(--_yam3x-search-inline-margin);
  display: flex;
  flex-direction: column;
  width: var(--_yam3x-search-bar-width);
  min-height: max(
    0px,
    calc(
      var(--_yam3x-search-view-docked-container-min-height) -
        var(--_yam3x-search-docked-header-height) -
        var(--_yam3x-search-view-contained-docked-bar-results-gap)
    )
  );
  max-height: min(
    calc(
      var(--_yam3x-search-view-docked-container-max-height) -
        var(--_yam3x-search-docked-header-height) -
        var(--_yam3x-search-view-contained-docked-bar-results-gap)
    ),
    calc(100dvh - var(--_yam3x-search-docked-header-height) - 24px)
  );
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--_yam3x-search-view-contained-docked-results-shape);
  background: var(--_yam3x-search-view-container-color);
  color: var(--_yam3x-search-content-color);
  box-shadow: none;
  transform-origin: top;
  transition:
    opacity var(--_yam3x-search-motion-default-effects),
    transform var(--_yam3x-search-motion-default-spatial);
}
.yam3x-search__view--docked {
  position: fixed;
  inset: auto;
  top: var(--_yam3x-search-docked-top, 0px);
  left: var(--_yam3x-search-docked-left, 0px);
  right: auto;
  bottom: auto;
  width: var(--_yam3x-search-docked-width, var(--_yam3x-search-bar-width));
  margin: 0;
  margin-block-start: var(--_yam3x-search-docked-gap);
}
.yam3x-search--divided {
  --_yam3x-search-docked-gap: 0px;
}
.yam3x-search__view--divided {
  border-radius: var(--_yam3x-search-view-docked-container-shape);
}
.yam3x-search__view--divided .yam3x-search__results-scroll {
  border-top: var(--_yam3x-search-view-divider-thickness) solid
    var(--_yam3x-search-view-divider-color);
}
.yam3x-search__view--docked[style*='display: none'] {
  opacity: 0;
  transform: scaleY(0.96);
  pointer-events: none;
}
.yam3x-search__results-scroll {
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: var(--_yam3x-search-view-contained-docked-results-space);
  scrollbar-color: var(--_yam3x-search-scrollbar-color) transparent;
}
.yam3x-search__scrim {
  position: fixed;
  z-index: -1;
  inset: 0;
  background: color-mix(
    in srgb,
    var(--_yam3x-search-view-docked-scrim-color) var(--_yam3x-search-view-docked-scrim-opacity),
    transparent
  );
}
.yam3x-search--docked .yam3x-search__view {
  animation: yam3x-search-docked-enter var(--_yam3x-search-duration-default-spatial)
    var(--_yam3x-search-easing-default-spatial) both;
}
.yam3x-search--docked .yam3x-search__view--divided {
  border-radius: var(--_yam3x-search-view-docked-container-shape);
}
.yam3x-search__view--fullscreen {
  position: fixed;
  z-index: 1001;
  inset: 0;
  top: 0;
  width: 100vw;
  width: 100dvw;
  height: 100vh;
  height: 100dvh;
  max-height: none;
  min-height: 0;
  padding-block-start: var(--_yam3x-search-view-full-screen-header-container-height);
  border-radius: var(--_yam3x-search-view-full-screen-container-shape);
  background: var(--_yam3x-search-view-contained-container-color);
  animation: yam3x-search-fullscreen-enter var(--_yam3x-search-duration-default-spatial)
    var(--_yam3x-search-easing-default-spatial) both;
}
.yam3x-search__view--fullscreen.yam3x-search__view--divided {
  background: var(--_yam3x-search-view-container-color);
}
.yam3x-search__view--fullscreen .yam3x-search__results-scroll {
  height: 100%;
  padding: var(--_yam3x-search-view-docked-results-bottom-space) 0;
}
.yam3x-search__view--closing {
  pointer-events: none;
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
  animation: yam3x-search-view-exit var(--_yam3x-search-duration-default-effects)
    var(--_yam3x-search-easing-default-effects) both;
}
.yam3x-search--docked .yam3x-search__view--reopening,
.yam3x-search__view--fullscreen.yam3x-search__view--reopening {
  animation: none;
}
.yam3x-search--open-fullscreen .yam3x-search__bar-frame {
  position: fixed;
  z-index: 1002;
  top: env(safe-area-inset-top, 0px);
  inset-inline-start: var(--_yam3x-search-view-contained-focused-leading-margin);
  width: min(
    720px,
    calc(
      100vw - var(--_yam3x-search-view-contained-focused-leading-margin) -
        var(--_yam3x-search-view-contained-focused-trailing-margin)
    )
  );
  margin: var(--_yam3x-search-spacing-8) 0;
  transition:
    width var(--_yam3x-search-motion-default-spatial),
    inset-inline-start var(--_yam3x-search-motion-default-spatial);
}
.yam3x-search--open-fullscreen .yam3x-search__view--fullscreen {
  padding-block-start: calc(
    var(--_yam3x-search-view-full-screen-header-container-height) + env(safe-area-inset-top, 0px)
  );
}
.yam3x-search--open-docked .yam3x-search__view--docked {
  margin-block-start: var(--_yam3x-search-docked-gap);
}
.yam3x-search--open-docked.yam3x-search--contained .yam3x-search__bar {
  border-radius: var(--_yam3x-search-view-contained-docked-bar-shape);
}
.yam3x-search--divided .yam3x-search__view--docked {
  --_yam3x-search-view-contained-docked-bar-results-gap: 0px;
}
.yam3x-search--disabled {
  opacity: 0.38;
}
.yam3x-search--disabled .yam3x-search__bar {
  cursor: default;
}
.yam3x-search--open .yam3x-search__bar-frame {
  --_yam3x-search-inline-margin: var(--_yam3x-search-view-contained-focused-leading-margin);
  --_yam3x-search-inline-end-margin: var(--_yam3x-search-view-contained-focused-trailing-margin);
}
.yam3x-search--open-docked .yam3x-search__bar-frame {
  --_yam3x-search-bar-width: min(
    720px,
    calc(100% - var(--_yam3x-search-inline-margin) - var(--_yam3x-search-inline-end-margin))
  );
}
.yam3x-search__bar:focus-within {
  outline: var(--_yam3x-search-bar-focus-indicator-thickness) solid
    var(--_yam3x-search-bar-focus-indicator-color);
  outline-offset: var(--_yam3x-search-bar-focus-indicator-offset);
}
.yam3x-search__bar:focus-within :deep(.yam3x-search__input) {
  outline: 0;
}
.yam3x-search__icon-button:focus-visible,
.yam3x-search__trailing :deep(button:focus-visible),
.yam3x-search__trailing :deep(a:focus-visible) {
  outline: var(--_yam3x-search-bar-focus-indicator-thickness) solid
    var(--_yam3x-search-bar-focus-indicator-color);
  outline-offset: var(--_yam3x-search-bar-focus-indicator-offset);
}
.yam3x-search__trailing :deep(button),
.yam3x-search__trailing :deep(a) {
  min-width: 48px;
  min-height: 48px;
}
.yam3x-search--divided .yam3x-search__bar {
  border-radius: var(--_yam3x-search-view-docked-container-shape);
}
.yam3x-search--open-fullscreen .yam3x-search__bar {
  height: var(--_yam3x-search-view-contained-full-screen-bar-container-height);
}
.yam3x-search--open-docked .yam3x-search__view {
  border-radius: var(--_yam3x-search-view-contained-docked-results-shape);
}
.yam3x-search--open-docked.yam3x-search--divided .yam3x-search__view {
  border-radius: var(--_yam3x-search-view-docked-container-shape);
}
.yam3x-search__view h2:first-child,
.yam3x-search__view h3:first-child {
  margin-block-start: 0;
}
@keyframes yam3x-search-docked-enter {
  from {
    opacity: 0;
    transform: scaleY(0.94);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
@keyframes yam3x-search-fullscreen-enter {
  from {
    opacity: 0.92;
  }
  to {
    opacity: 1;
  }
}
@keyframes yam3x-search-view-exit {
  from {
    opacity: var(--_yam3x-search-close-start-opacity, 1);
  }
  to {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-search__bar-frame,
  .yam3x-search__bar,
  .yam3x-search--open .yam3x-search__view,
  .yam3x-search__view--closing,
  .yam3x-search__view--fullscreen.yam3x-search__view--closing,
  .yam3x-search__view--reopening {
    transition: none;
    animation: none;
  }
}
@media (forced-colors: active) {
  .yam3x-search__bar {
    border: 1px solid CanvasText;
  }
  .yam3x-search__bar:focus-within,
  .yam3x-search__icon-button:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-search__view {
    border: 1px solid CanvasText;
  }
  .yam3x-search__scrim {
    background: color-mix(in srgb, CanvasText 24%, transparent);
  }
  .yam3x-search__bar,
  .yam3x-search__view {
    forced-color-adjust: auto;
  }
}
@media (prefers-contrast: more) {
  .yam3x-search__bar {
    outline: 1px solid var(--_yam3x-search-outline-color);
  }
}
@media (max-width: 599px) {
  .yam3x-search--open-fullscreen .yam3x-search__bar-frame {
    width: calc(100vw - 24px);
  }
}
</style>
