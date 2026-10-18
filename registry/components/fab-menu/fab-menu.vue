<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { vRipple } from '../_shared/ripple'
import ToggleFloatingActionButton from '../fab/toggle-floating-action-button.vue'
import type {
  FabMenuHorizontalAlignment,
  FabMenuTriggerSize,
  FabMenuItem,
  FabMenuPresentation,
  FabMenuSelectionSource,
  FabMenuVariant,
} from './fab-menu.types'
import {
  createFabMenuComponentTokens,
  findFabMenuThemeTarget,
  syncFabMenuSystemTokens,
} from './fab-menu.tokens'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    locale?: string
    items: FabMenuItem[]
    label?: string
    triggerLabel?: string
    variant?: FabMenuVariant
    presentation?: FabMenuPresentation
    horizontalAlignment?: FabMenuHorizontalAlignment
    triggerSize?: FabMenuTriggerSize
    disabled?: boolean
  }>(),
  {
    label: undefined,
    triggerLabel: undefined,
    variant: 'primary',
    presentation: 'pill-stack',
    horizontalAlignment: 'end',
    triggerSize: 'medium',
    disabled: false,
  },
)

const expanded = defineModel<boolean>('expanded', { default: false })
const emit = defineEmits<{
  toggle: [detail: { expanded: boolean }]
  open: []
  close: []
  beforeselect: [
    item: FabMenuItem,
    event: CustomEvent<{ item: FabMenuItem; source: FabMenuSelectionSource }>,
  ]
  select: [detail: { item: FabMenuItem; source: FabMenuSelectionSource }]
}>()
const slots = defineSlots<{
  trigger?(props: {
    expanded: boolean
    toggle: () => void
    triggerProps: Record<string, unknown>
    progress: number
  }): unknown
  'trigger-icon'?(props: { expanded: boolean; progress: number }): unknown
  icon?(props: { item: FabMenuItem }): unknown
  item?(props: {
    item: FabMenuItem
    expanded: boolean
    activate: () => void
    itemProps: Record<string, unknown>
  }): unknown
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ actions: props.label, moreActions: props.triggerLabel }),
)

const triggerExpanded = computed({
  get: () => expanded.value,
  set: (value: boolean) => requestExpanded(value),
})
const host = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const generatedId = useId()
const menuId = computed(() => `${generatedId}-menu`)
const menuVisible = ref(false)
const animationOpen = ref(false)
const openingSide = ref<'up' | 'down'>('up')
const activeIndex = ref(-1)
const progress = ref(0)
const positionStyle = ref<Record<string, string>>({ visibility: 'hidden' })
let stopPositioning: (() => void) | undefined
let motionFrame = 0
let itemAnimationFrame = 0
let hideTimer = 0
let outsidePointerListener: ((event: PointerEvent) => void) | undefined
let hookObserver: MutationObserver | undefined
let themeObserver: MutationObserver | undefined
const publicStyleHooks = [
  '--yam3x-fab-menu-spacing',
  '--yam3x-fab-menu-max-width',
  '--yam3x-fab-menu-item-container-color',
  '--yam3x-fab-menu-item-content-color',
  '--yam3x-primary-fab-color',
  '--yam3x-primary-fab-container-color',
  '--yam3x-primary-fab-hover-color',
  '--yam3x-primary-fab-focus-color',
  '--yam3x-primary-fab-ripple-color',
  '--yam3x-secondary-fab-color',
  '--yam3x-secondary-fab-container-color',
  '--yam3x-secondary-fab-hover-color',
  '--yam3x-secondary-fab-focus-color',
  '--yam3x-secondary-fab-ripple-color',
  '--yam3x-tertiary-fab-color',
  '--yam3x-tertiary-fab-container-color',
  '--yam3x-tertiary-fab-hover-color',
  '--yam3x-tertiary-fab-focus-color',
  '--yam3x-tertiary-fab-ripple-color',
  '--yam3x-fab-menu-item-height',
  '--yam3x-fab-menu-item-font-size',
  '--yam3x-fab-menu-item-font-weight',
  '--yam3x-fab-menu-item-line-height',
  '--yam3x-fab-menu-item-tracking',
  '--yam3x-fab-menu-item-shape',
  '--yam3x-fab-menu-item-leading-space',
  '--yam3x-fab-menu-item-trailing-space',
  '--yam3x-fab-menu-item-top-space',
  '--yam3x-fab-menu-item-bottom-space',
  '--yam3x-fab-menu-item-spacing',
  '--yam3x-fab-menu-item-icon-size',
  '--yam3x-fab-menu-item-disabled-container-color',
  '--yam3x-fab-menu-item-disabled-container-opacity',
  '--yam3x-fab-menu-item-disabled-color',
  '--yam3x-fab-menu-item-disabled-opacity',
]

const enabledIndices = computed(() =>
  props.items.flatMap((item, index) => (item.disabled ? [] : [index])),
)
watch(
  () => props.items.length,
  (count) => {
    if (import.meta.env.DEV && (count < 2 || count > 6))
      console.warn('[FabMenu] Material 3 Expressive specifies between 2 and 6 actions.')
  },
  { immediate: true },
)
const rootStyle = computed(() => createFabMenuComponentTokens(props.variant, props.presentation))

function requestExpanded(value: boolean) {
  if (props.disabled || value === expanded.value) return
  const event = new CustomEvent<{ expanded: boolean }>('beforetoggle', {
    bubbles: true,
    cancelable: true,
    detail: { expanded: value },
  })
  host.value?.dispatchEvent(event)
  if (event.defaultPrevented) return
  expanded.value = value
}
function toggle() {
  requestExpanded(!expanded.value)
}
function enabledIndex(from: number, direction: 1 | -1) {
  const indexes = enabledIndices.value
  if (!indexes.length) return -1
  if (direction === 1) return indexes.find((index) => index >= from) ?? indexes[0]!
  return [...indexes].reverse().find((index) => index <= from) ?? indexes[indexes.length - 1]!
}
function focusItem(index: number) {
  activeIndex.value = index
  void nextTick(() =>
    panel.value?.querySelector<HTMLElement>(`[data-fab-menu-index="${index}"]`)?.focus(),
  )
}
function itemProps(item: FabMenuItem, index: number) {
  return {
    'data-fab-menu-index': String(index),
    tabindex: index === activeIndex.value && !item.disabled ? 0 : -1,
    'aria-disabled': item.disabled ? 'true' : undefined,
  }
}
function selectItem(item: FabMenuItem, source: FabMenuSelectionSource, event: Event) {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  const before = new CustomEvent<{ item: FabMenuItem; source: FabMenuSelectionSource }>(
    'beforeselect',
    {
      bubbles: true,
      cancelable: true,
      detail: { item, source },
    },
  )
  emit('beforeselect', item, before)
  host.value?.dispatchEvent(before)
  if (before.defaultPrevented) {
    event.preventDefault()
    return
  }
  emit('select', { item, source })
  requestExpanded(false)
  void nextTick(() => trigger.value?.focus())
}
function activateItem(item: FabMenuItem) {
  selectItem(item, 'pointer', new Event('click'))
}
function setTriggerElement(element: unknown) {
  if (element instanceof HTMLButtonElement) {
    trigger.value = element
    return
  }
  if (element && typeof element === 'object') {
    const instance = element as { $el?: unknown; element?: unknown }
    const exposedElement = instance.element as { value?: unknown } | undefined
    const candidate =
      instance.$el ??
      (instance.element instanceof HTMLElement ? instance.element : exposedElement?.value)
    trigger.value = candidate instanceof HTMLButtonElement ? candidate : null
    return
  }
  trigger.value = null
}
function onTriggerKeydown(event: KeyboardEvent) {
  if (expanded.value && event.key === 'Tab') {
    requestExpanded(false)
    return
  }
  if (!expanded.value || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return
  event.preventDefault()
  focusItem(
    enabledIndex(
      event.key === 'ArrowDown' ? 0 : props.items.length - 1,
      event.key === 'ArrowDown' ? 1 : -1,
    ),
  )
}
function onMenuKeydown(event: KeyboardEvent) {
  const current = activeIndex.value
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const next = enabledIndex(current + direction, direction)
    focusItem(next)
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    focusItem(
      event.key === 'Home' ? (enabledIndices.value[0] ?? -1) : (enabledIndices.value.at(-1) ?? -1),
    )
  } else if (event.key === 'Escape') {
    event.preventDefault()
    requestExpanded(false)
    void nextTick(() => trigger.value?.focus())
  } else if (event.key === 'Tab') {
    requestExpanded(false)
  }
}
function onOutsidePointer(event: PointerEvent) {
  if (
    event.target instanceof Node &&
    !host.value?.contains(event.target) &&
    !panel.value?.contains(event.target)
  )
    requestExpanded(false)
}
function syncStyleHooks() {
  if (!host.value || !panel.value) return
  const styles = getComputedStyle(host.value)
  for (const name of publicStyleHooks) {
    const value = styles.getPropertyValue(name).trim()
    if (value) panel.value.style.setProperty(name, value)
    else panel.value.style.removeProperty(name)
  }
  syncFabMenuSystemTokens(host.value, panel.value)
  panel.value.dir = getComputedStyle(host.value).direction
}
async function updatePosition() {
  if (!trigger.value || !panel.value || !expanded.value) return
  syncStyleHooks()
  const triggerRect = trigger.value.getBoundingClientRect()
  const viewport = window.visualViewport
  const viewportTop = viewport?.offsetTop ?? 0
  const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight)
  const styles = getComputedStyle(panel.value)
  const windowMargin =
    Number.parseFloat(styles.getPropertyValue('--_yam3x-fab-menu-window-margin')) || 16
  const itemGap = Number.parseFloat(styles.rowGap) || Number.parseFloat(styles.gap) || 0
  const itemHeights = Array.from(
    panel.value.children,
    (item) => item.getBoundingClientRect().height,
  )
  const countFittingItems = (heights: number[], available: number) => {
    let count = 0
    let usedHeight = 0
    for (const height of heights) {
      if (!height || usedHeight + height > available) break
      usedHeight += height + itemGap
      count += 1
    }
    return count
  }
  const availableAbove = triggerRect.top - viewportTop - windowMargin
  const availableBelow = viewportBottom - triggerRect.bottom - windowMargin
  const itemsFittingAbove = countFittingItems([...itemHeights].reverse(), availableAbove)
  const opensDown =
    props.presentation === 'pill-stack' && itemsFittingAbove < 2 && availableBelow > 0
  const placement = opensDown
    ? props.horizontalAlignment === 'start'
      ? 'bottom-start'
      : props.horizontalAlignment === 'center'
        ? 'bottom'
        : 'bottom-end'
    : props.horizontalAlignment === 'start'
      ? 'top-start'
      : props.horizontalAlignment === 'center'
        ? 'top'
        : 'top-end'
  const result = await computePosition(trigger.value, panel.value, {
    strategy: 'fixed',
    placement,
    middleware: [
      offset(props.presentation === 'pill-stack' ? 8 : 4),
      ...(props.presentation === 'web-menu' ? [flip({ padding: windowMargin })] : []),
      shift({ padding: windowMargin }),
      size({
        padding: windowMargin,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`
        },
      }),
    ],
  })
  if (!expanded.value) return
  openingSide.value = result.placement.startsWith('top') ? 'up' : 'down'
  positionStyle.value = { left: `${result.x}px`, top: `${result.y}px`, visibility: 'visible' }
}
function animateProgress(to: number) {
  cancelAnimationFrame(motionFrame)
  const from = progress.value
  const start = performance.now()
  const duration = 250
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - (1 - t) ** 3
    progress.value = from + (to - from) * eased
    if (t < 1) motionFrame = requestAnimationFrame(tick)
  }
  motionFrame = requestAnimationFrame(tick)
}

watch(
  expanded,
  async (value) => {
    cancelAnimationFrame(itemAnimationFrame)
    animateProgress(value ? 1 : 0)
    if (value) {
      window.clearTimeout(hideTimer)
      menuVisible.value = true
      animationOpen.value = false
      activeIndex.value = enabledIndices.value[0] ?? -1
      emit('open')
      emit('toggle', { expanded: true })
      await nextTick()
      itemAnimationFrame = requestAnimationFrame(() => {
        animationOpen.value = true
      })
      outsidePointerListener = onOutsidePointer
      document.addEventListener('pointerdown', outsidePointerListener, true)
      stopPositioning = autoUpdate(trigger.value!, panel.value!, () => {
        void updatePosition()
      })
      hookObserver = new MutationObserver(syncStyleHooks)
      hookObserver.observe(host.value!, { attributes: true, attributeFilter: ['class', 'style'] })
      themeObserver = new MutationObserver(syncStyleHooks)
      themeObserver.observe(findFabMenuThemeTarget(host.value!), {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'style'],
      })
      await updatePosition()
      trigger.value?.focus()
    } else {
      animationOpen.value = false
      document.removeEventListener('pointerdown', outsidePointerListener!, true)
      outsidePointerListener = undefined
      hookObserver?.disconnect()
      hookObserver = undefined
      themeObserver?.disconnect()
      themeObserver = undefined
      stopPositioning?.()
      stopPositioning = undefined
      activeIndex.value = -1
      positionStyle.value = { visibility: 'hidden' }
      emit('close')
      emit('toggle', { expanded: false })
      hideTimer = window.setTimeout(
        () => {
          menuVisible.value = false
        },
        250 + props.items.length * 35,
      )
    }
  },
  { flush: 'post' },
)
watch(
  () => props.disabled,
  (value) => {
    if (value) requestExpanded(false)
  },
)
watch(
  () => props.items,
  () => {
    if (expanded.value) {
      activeIndex.value = enabledIndices.value[0] ?? -1
      void nextTick(updatePosition)
    }
  },
  { deep: true },
)
onBeforeUnmount(() => {
  cancelAnimationFrame(motionFrame)
  cancelAnimationFrame(itemAnimationFrame)
  window.clearTimeout(hideTimer)
  document.removeEventListener('pointerdown', outsidePointerListener!, true)
  hookObserver?.disconnect()
  themeObserver?.disconnect()
  stopPositioning?.()
})

defineExpose({ open: () => requestExpanded(true), close: () => requestExpanded(false), toggle })
</script>

<template>
  <div
    ref="host"
    class="yam3x-fab-menu"
    :class="{ 'yam3x-fab-menu--expanded': expanded, 'yam3x-fab-menu--disabled': disabled }"
    :style="rootStyle"
    v-bind="$attrs"
  >
    <ToggleFloatingActionButton
      v-if="!slots.trigger"
      :ref="setTriggerElement"
      v-model:checked="triggerExpanded"
      class="yam3x-fab-menu__trigger"
      :size="triggerSize"
      :variant="variant"
      :disabled="disabled"
      data-fab-menu-trigger
      :aria-label="actionMessages.moreActions"
      aria-haspopup="menu"
      :aria-expanded="expanded"
      :aria-controls="menuId"
      @keydown="onTriggerKeydown"
    >
      <template
        v-if="slots['trigger-icon']"
        #icon="{ checked: triggerChecked, progress: triggerProgress }"
      >
        <slot
          name="trigger-icon"
          :expanded="triggerChecked"
          :progress="triggerProgress"
        />
      </template>
    </ToggleFloatingActionButton>
    <slot
      v-else
      name="trigger"
      :expanded="expanded"
      :toggle="toggle"
      :trigger-props="{
        ref: setTriggerElement,
        type: 'button',
        'aria-label': actionMessages.moreActions,
        'aria-haspopup': 'menu',
        'aria-expanded': expanded,
        'aria-controls': menuId,
        onClick: toggle,
        onKeydown: onTriggerKeydown,
      }"
      :progress="progress"
    />

    <Teleport to="body">
      <div
        v-if="menuVisible"
        :id="menuId"
        ref="panel"
        class="yam3x-fab-menu__panel"
        :class="[
          `yam3x-fab-menu__panel--${horizontalAlignment}`,
          `yam3x-fab-menu__panel--${presentation}`,
          `yam3x-fab-menu__panel--opening-${openingSide}`,
          { 'yam3x-fab-menu__panel--open': expanded },
        ]"
        :style="[positionStyle, rootStyle]"
        role="menu"
        :aria-label="actionMessages.actions"
        :aria-hidden="!expanded"
        :inert="!expanded || undefined"
        @keydown="onMenuKeydown"
      >
        <component
          :is="item.href && !item.disabled ? 'a' : 'button'"
          v-for="(item, index) in items"
          :key="item.value"
          v-ripple
          class="yam3x-fab-menu__item yam3x-state-layer"
          :class="{
            'yam3x-fab-menu__item--disabled': item.disabled,
            'yam3x-fab-menu__item--selected': presentation === 'web-menu' && item.selected,
            'yam3x-fab-menu__item--open': animationOpen,
          }"
          :style="{
            '--item-index': index,
            '--item-count': items.length,
            transitionDelay: animationOpen
              ? `${(openingSide === 'down' ? index : items.length - index - 1) * 35}ms`
              : `${(openingSide === 'down' ? items.length - index - 1 : index) * 25}ms`,
          }"
          :data-fab-menu-index="index"
          :tabindex="index === activeIndex && !item.disabled ? 0 : -1"
          role="menuitem"
          :aria-disabled="item.disabled ? 'true' : undefined"
          :href="item.href && !item.disabled ? item.href : undefined"
          :target="item.href && !item.disabled ? item.target : undefined"
          :rel="item.href && !item.disabled ? item.rel : undefined"
          :download="item.href && !item.disabled ? item.download : undefined"
          :type="item.href ? undefined : 'button'"
          :disabled="item.disabled || undefined"
          @click="selectItem(item, $event.detail === 0 ? 'keyboard' : 'pointer', $event)"
        >
          <slot
            name="item"
            :item="item"
            :expanded="expanded"
            :activate="() => activateItem(item)"
            :item-props="itemProps(item, index)"
          >
            <slot
              name="icon"
              :item="item"
            />
            <span class="yam3x-fab-menu__item-label">{{ item.label }}</span>
          </slot>
        </component>
      </div>
    </Teleport>
  </div>
</template>

<style>
.yam3x-fab-menu {
  display: inline-flex;
  align-items: flex-end;
}
.yam3x-fab-menu--expanded {
  position: relative;
  z-index: 1001;
}
.yam3x-fab-menu__trigger {
  position: relative;
  z-index: 1;
  flex: none;
}
.yam3x-fab-menu__panel--web-menu {
  transform: none;
  gap: 0;
  padding: 4px 0;
  border: 1px solid var(--_yam3x-fab-menu-outline);
  border-radius: 4px;
  background: var(--_yam3x-fab-menu-surface);
  box-shadow: var(--_yam3x-fab-menu-elevation);
}
.yam3x-fab-menu__panel {
  --_yam3x-fab-menu-window-margin: 16px;
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--_yam3x-fab-menu-spacing);
  box-sizing: border-box;
  min-width: 56px;
  max-width: min(
    var(--_yam3x-fab-menu-max-width),
    calc(100vw - var(--_yam3x-fab-menu-window-margin) - var(--_yam3x-fab-menu-window-margin))
  );
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0;
  border-radius: var(--_yam3x-fab-menu-panel-shape);
  background: transparent;
}
.yam3x-fab-menu__panel--pill-stack {
  scrollbar-width: none;
}
.yam3x-fab-menu__panel--pill-stack::-webkit-scrollbar {
  display: none;
}
.yam3x-fab-menu__panel--web-menu {
  gap: 0;
  inline-size: max-content;
  min-width: var(--_yam3x-fab-menu-min-width, 112px);
  padding: 4px 0;
  background: var(--_yam3x-fab-menu-surface);
}
.yam3x-fab-menu__panel--web-menu,
.yam3x-fab-menu__panel--web-menu.yam3x-fab-menu__panel--start,
.yam3x-fab-menu__panel--web-menu.yam3x-fab-menu__panel--center {
  align-items: stretch;
}
.yam3x-fab-menu__panel--start {
  align-items: flex-start;
}
.yam3x-fab-menu__panel--center {
  align-items: center;
}
.yam3x-fab-menu__panel[aria-hidden='true'] {
  pointer-events: none;
}
.yam3x-fab-menu__item {
  position: relative;
  isolation: isolate;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-start;
  gap: var(--_yam3x-fab-menu-item-spacing);
  box-sizing: border-box;
  min-width: 56px;
  min-height: var(--_yam3x-fab-menu-item-height);
  max-width: 100%;
  padding-block-start: var(--_yam3x-fab-menu-item-top-space);
  padding-block-end: var(--_yam3x-fab-menu-item-bottom-space);
  padding-inline-start: var(--_yam3x-fab-menu-item-leading-space);
  padding-inline-end: var(--_yam3x-fab-menu-item-trailing-space);
  overflow: hidden;
  border: 0;
  border-radius: var(--_yam3x-fab-menu-item-shape);
  background: var(--_yam3x-fab-menu-item-container);
  color: var(--_yam3x-fab-menu-item-color);
  font-family: var(--_yam3x-fab-menu-item-font-family);
  font-size: var(--_yam3x-fab-menu-item-font-size);
  font-weight: var(--_yam3x-fab-menu-item-font-weight);
  line-height: var(--_yam3x-fab-menu-item-line-height);
  letter-spacing: var(--_yam3x-fab-menu-item-tracking);
  text-align: start;
  text-decoration: none;
  white-space: normal;
  cursor: pointer;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: right center;
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-state-color);
  --yam3x-ripple-color: var(--_yam3x-fab-menu-item-ripple-color);
  transition:
    opacity var(--_yam3x-fab-menu-motion-effects),
    transform var(--_yam3x-fab-menu-motion-spatial),
    background-color var(--_yam3x-fab-menu-motion-effects);
}
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item {
  inline-size: 100%;
  min-height: var(--_yam3x-fab-menu-item-height);
  padding-block: var(--_yam3x-fab-menu-item-top-space) var(--_yam3x-fab-menu-item-bottom-space);
  padding-inline: var(--_yam3x-fab-menu-item-leading-space)
    var(--_yam3x-fab-menu-item-trailing-space);
  border-radius: var(--_yam3x-fab-menu-item-shape);
  background: transparent;
  color: var(--_yam3x-fab-menu-item-color);
  font-family: var(--_yam3x-fab-menu-item-font-family);
  font-size: var(--_yam3x-fab-menu-item-font-size);
  font-weight: var(--_yam3x-fab-menu-item-font-weight);
  line-height: var(--_yam3x-fab-menu-item-line-height);
  letter-spacing: var(--_yam3x-fab-menu-item-tracking);
  transform-origin: center;
}
.yam3x-fab-menu__panel--web-menu.yam3x-fab-menu__panel--start .yam3x-fab-menu__item {
  justify-content: flex-start;
}
.yam3x-fab-menu__panel--web-menu.yam3x-fab-menu__panel--center .yam3x-fab-menu__item {
  justify-content: center;
}
.yam3x-fab-menu__panel--web-menu.yam3x-fab-menu__panel--end .yam3x-fab-menu__item {
  justify-content: flex-end;
}
.yam3x-fab-menu__panel--start .yam3x-fab-menu__item {
  transform-origin: left center;
}
.yam3x-fab-menu__panel--center .yam3x-fab-menu__item {
  transform-origin: center center;
}
.yam3x-fab-menu__item--open {
  opacity: 1;
  transform: scaleX(1);
}
.yam3x-fab-menu__item:hover:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-hover);
}
.yam3x-fab-menu__item:focus-visible {
  outline: 3px solid var(--_yam3x-fab-menu-focus-ring);
  outline-offset: 2px;
}
.yam3x-fab-menu__item:focus-visible:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-focus);
}
.yam3x-fab-menu__item:active:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-state-color);
}
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item--selected {
  background: var(--_yam3x-fab-menu-item-selected-container);
}
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item:hover:not(:disabled),
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item:focus-visible:not(:disabled),
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item:active:not(:disabled) {
  background-image: none;
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-state-color);
}
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item:focus-visible {
  outline: 3px solid var(--_yam3x-fab-menu-focus-ring);
  outline-offset: -3px;
}
.yam3x-fab-menu__item--disabled {
  background: color-mix(
    in srgb,
    var(--_yam3x-fab-menu-item-disabled-container)
      var(--_yam3x-fab-menu-item-disabled-container-opacity),
    transparent
  );
  color: color-mix(
    in srgb,
    var(--_yam3x-fab-menu-item-disabled-color) var(--_yam3x-fab-menu-item-disabled-opacity),
    transparent
  );
  cursor: default;
}
.yam3x-fab-menu__item-label {
  display: block;
  min-width: 0;
  overflow-wrap: anywhere;
}
.yam3x-fab-menu__item > .yam3x-icon,
.yam3x-fab-menu__item > svg,
.yam3x-fab-menu__item > :first-child:not(.yam3x-fab-menu__item-label) {
  flex: none;
  width: var(--_yam3x-fab-menu-item-icon-size);
  height: var(--_yam3x-fab-menu-item-icon-size);
  font-size: var(--_yam3x-fab-menu-item-icon-size);
}
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item > .yam3x-icon,
.yam3x-fab-menu__panel--web-menu .yam3x-fab-menu__item > svg,
.yam3x-fab-menu__panel--web-menu
  .yam3x-fab-menu__item
  > :first-child:not(.yam3x-fab-menu__item-label) {
  color: var(--_yam3x-fab-menu-item-icon-color);
}
.yam3x-fab-menu__panel .yam3x-ripple-container {
  z-index: 1;
}
@media (min-width: 1200px) {
  .yam3x-fab-menu__panel {
    --_yam3x-fab-menu-window-margin: 24px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-fab-menu__trigger,
  .yam3x-fab-menu__icon,
  .yam3x-fab-menu__item {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-fab-menu__trigger {
    border: 1px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
    box-shadow: none;
  }
  .yam3x-fab-menu__trigger:focus-visible,
  .yam3x-fab-menu__item:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-fab-menu__item {
    border: 1px solid ButtonText;
    background: Menu;
    color: MenuText;
  }
  .yam3x-fab-menu__item--disabled {
    background: Menu;
    color: GrayText;
  }
}
</style>
