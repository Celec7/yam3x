<script setup lang="ts">
import { autoUpdate, computePosition, offset, shift, size } from '@floating-ui/dom'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  toRef,
  useId,
  watch,
} from 'vue'
import type { FloatingActionButtonMenuContext } from './floating-action-button-menu.context'
import type { FloatingActionButtonMenuItemRegistration } from './floating-action-button-menu.context'
import { floatingActionButtonMenuKey } from './floating-action-button-menu.context'
import type { FabMenuHorizontalAlignment } from './fab-menu.types'
import type { FabMenuPresentation, FabMenuVariant } from './fab-menu.types'
import {
  createFabMenuComponentTokens,
  findFabMenuThemeTarget,
  syncFabMenuSystemTokens,
} from './fab-menu.tokens'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: FabMenuVariant
    presentation?: FabMenuPresentation
    horizontalAlignment?: FabMenuHorizontalAlignment
    disabled?: boolean
  }>(),
  {
    label: 'Actions',
    variant: 'primary',
    presentation: 'pill-stack',
    horizontalAlignment: 'end',
    disabled: false,
  },
)
const expanded = defineModel<boolean>('expanded', { default: false })
const emit = defineEmits<{
  beforetoggle: [event: CustomEvent<{ expanded: boolean }>]
  toggle: [detail: { expanded: boolean }]
  open: []
  close: []
  select: [detail: { value: string; label: string; source: 'pointer' | 'keyboard' }]
}>()
defineSlots<{
  default?(): unknown
  trigger?(props: {
    expanded: boolean
    toggle: () => void
    setExpanded: (expanded: boolean) => void
    triggerProps: Record<string, unknown>
  }): unknown
}>()

const host = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const items = shallowRef<FloatingActionButtonMenuItemRegistration[]>([])
const activeIndex = ref(-1)
const menuVisible = ref(false)
const animationOpen = ref(false)
const openingSide = ref<'up' | 'down'>('up')
const menuId = `${useId()}-menu`
const positionStyle = ref<Record<string, string>>({ visibility: 'hidden' })
const componentTokens = computed(() =>
  createFabMenuComponentTokens(props.variant, props.presentation),
)
let stopPositioning: (() => void) | undefined
let outsidePointerListener: ((event: PointerEvent) => void) | undefined
let styleObserver: MutationObserver | undefined
let themeObserver: MutationObserver | undefined
let hideTimer = 0
let itemAnimationFrame = 0

const context: FloatingActionButtonMenuContext = {
  expanded,
  presentation: toRef(props, 'presentation'),
  openingSide,
  activeIndex,
  items,
  register(item: FloatingActionButtonMenuItemRegistration) {
    items.value = [...items.value, item]
    if (expanded.value && activeIndex.value < 0 && !item.disabled.value)
      activeIndex.value = items.value.length - 1
    return () => {
      const index = items.value.indexOf(item)
      if (index === -1) return
      items.value = items.value.filter((registered) => registered !== item)
      if (!expanded.value) return
      if (index < activeIndex.value) activeIndex.value -= 1
      else if (index === activeIndex.value) {
        activeIndex.value = items.value.findIndex((registered) => !registered.disabled.value)
      }
    }
  },
  select(item: FloatingActionButtonMenuItemRegistration, event: MouseEvent) {
    if (item.disabled.value) {
      event.preventDefault()
      return
    }
    const source = event.detail === 0 ? 'keyboard' : 'pointer'
    emit('select', { value: item.value.value, label: item.label.value, source })
    requestExpanded(false)
    void nextTick(() => trigger.value?.focus())
  },
}
provide(floatingActionButtonMenuKey, context)

function setTriggerElement(element: unknown) {
  if (element == null) return
  if (element instanceof HTMLElement) trigger.value = element
  else if (
    element &&
    typeof element === 'object' &&
    'element' in element &&
    (element as { element?: unknown }).element instanceof HTMLElement
  )
    trigger.value = (element as { element: HTMLElement }).element
  else if (
    element &&
    typeof element === 'object' &&
    '$el' in element &&
    (element as { $el?: unknown }).$el instanceof HTMLElement
  )
    trigger.value = (element as { $el: HTMLElement }).$el
  else trigger.value = null
}
function requestExpanded(value: boolean) {
  if ((props.disabled && value) || value === expanded.value) return
  const event = new CustomEvent<{ expanded: boolean }>('beforetoggle', {
    bubbles: true,
    cancelable: true,
    detail: { expanded: value },
  })
  emit('beforetoggle', event)
  host.value?.dispatchEvent(event)
  if (!event.defaultPrevented) expanded.value = value
}
function toggle() {
  requestExpanded(!expanded.value)
}
function setActive(index: number) {
  const enabled = items.value
    .map((item, itemIndex) => (!item.disabled.value ? itemIndex : -1))
    .filter((itemIndex) => itemIndex >= 0)
  if (!enabled.length) return
  const next =
    index >= items.value.length - 1
      ? enabled.at(-1)!
      : index <= 0
        ? enabled[0]!
        : (enabled.find((itemIndex) => itemIndex >= index) ?? enabled[0]!)
  activeIndex.value = next
  void nextTick(() => items.value[next]?.element.value?.focus())
}
function moveActive(step: 1 | -1) {
  const enabled = items.value
    .map((item, itemIndex) => (!item.disabled.value ? itemIndex : -1))
    .filter((itemIndex) => itemIndex >= 0)
  if (!enabled.length) return
  const current = enabled.indexOf(activeIndex.value)
  const next = (current + step + enabled.length) % enabled.length
  setActive(enabled[next]!)
}
function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab' && expanded.value) requestExpanded(false)
  else if (expanded.value && event.key === 'ArrowDown') {
    event.preventDefault()
    setActive(0)
  } else if (expanded.value && event.key === 'ArrowUp') {
    event.preventDefault()
    setActive(items.value.length - 1)
  }
}
function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    setActive(event.key === 'Home' ? 0 : items.value.length - 1)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    requestExpanded(false)
    void nextTick(() => trigger.value?.focus())
  } else if (event.key === 'Tab') requestExpanded(false)
}
function onOutsidePointer(event: PointerEvent) {
  const target = event.target
  if (target instanceof Node && !host.value?.contains(target) && !panel.value?.contains(target))
    requestExpanded(false)
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
  const itemHeights = items.value.map(
    (item) => item.element.value?.getBoundingClientRect().height ?? 0,
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
  const opensDown = itemsFittingAbove < 2 && availableBelow > 0
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
      shift({ padding: windowMargin }),
      size({
        padding: windowMargin,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`
        },
      }),
    ],
  })
  openingSide.value = result.placement.startsWith('top') ? 'up' : 'down'
  if (expanded.value)
    positionStyle.value = { left: `${result.x}px`, top: `${result.y}px`, visibility: 'visible' }
}
function syncStyleHooks() {
  if (!host.value || !panel.value) return
  const styles = getComputedStyle(host.value)
  for (let index = 0; index < styles.length; index += 1) {
    const name = styles.item(index)
    if (!name.startsWith('--yam3x-fab-menu-') && !name.startsWith('--_yam3x-fab-menu-')) continue
    const value = styles.getPropertyValue(name).trim()
    if (value) panel.value.style.setProperty(name, value)
    else panel.value.style.removeProperty(name)
  }
  syncFabMenuSystemTokens(host.value, panel.value)
  panel.value.dir = styles.direction
}
watch(
  expanded,
  async (value) => {
    window.clearTimeout(hideTimer)
    if (value) {
      menuVisible.value = true
      animationOpen.value = false
      activeIndex.value = items.value.findIndex((item) => !item.disabled.value)
      emit('open')
      emit('toggle', { expanded: true })
      await nextTick()
      outsidePointerListener = onOutsidePointer
      document.addEventListener('pointerdown', outsidePointerListener, true)
      if (trigger.value && panel.value)
        stopPositioning = autoUpdate(trigger.value, panel.value, () => void updatePosition())
      if (host.value) {
        styleObserver = new MutationObserver(syncStyleHooks)
        styleObserver.observe(host.value, { attributes: true, attributeFilter: ['class', 'style'] })
        themeObserver = new MutationObserver(syncStyleHooks)
        themeObserver.observe(findFabMenuThemeTarget(host.value), {
          attributes: true,
          attributeFilter: ['class', 'data-theme', 'style'],
        })
      }
      await updatePosition()
      itemAnimationFrame = requestAnimationFrame(() => {
        animationOpen.value = true
      })
      trigger.value?.focus()
    } else {
      cancelAnimationFrame(itemAnimationFrame)
      animationOpen.value = false
      document.removeEventListener('pointerdown', outsidePointerListener!, true)
      outsidePointerListener = undefined
      stopPositioning?.()
      stopPositioning = undefined
      styleObserver?.disconnect()
      styleObserver = undefined
      themeObserver?.disconnect()
      themeObserver = undefined
      activeIndex.value = -1
      positionStyle.value = { visibility: 'hidden' }
      emit('close')
      emit('toggle', { expanded: false })
      hideTimer = window.setTimeout(
        () => (menuVisible.value = false),
        250 + items.value.length * 35,
      )
    }
  },
  { flush: 'post' },
)
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) requestExpanded(false)
  },
)
onBeforeUnmount(() => {
  window.clearTimeout(hideTimer)
  cancelAnimationFrame(itemAnimationFrame)
  document.removeEventListener('pointerdown', outsidePointerListener!, true)
  stopPositioning?.()
  styleObserver?.disconnect()
  themeObserver?.disconnect()
})

const triggerProps = computed(() => ({
  ref: setTriggerElement,
  type: 'button' as const,
  disabled: props.disabled,
  'aria-label': props.label,
  'aria-haspopup': 'menu' as const,
  'aria-expanded': expanded.value,
  'aria-controls': menuId,
  'data-fab-menu-trigger': '',
  onKeydown: onTriggerKeydown,
}))
defineExpose({ open: () => requestExpanded(true), close: () => requestExpanded(false), toggle })
</script>

<template>
  <div
    ref="host"
    class="yam3x-floating-action-button-menu"
    :class="{ 'yam3x-floating-action-button-menu--expanded': expanded }"
    :style="componentTokens"
    v-bind="$attrs"
  >
    <slot
      name="trigger"
      :expanded="expanded"
      :toggle="toggle"
      :set-expanded="requestExpanded"
      :trigger-props="triggerProps"
    />
    <Teleport to="body">
      <div
        v-if="menuVisible"
        :id="menuId"
        ref="panel"
        class="yam3x-floating-action-button-menu__panel"
        :class="[
          `yam3x-floating-action-button-menu__panel--${horizontalAlignment}`,
          `yam3x-floating-action-button-menu__panel--${presentation}`,
          `yam3x-floating-action-button-menu__panel--opening-${openingSide}`,
          { 'yam3x-floating-action-button-menu__panel--open': animationOpen },
        ]"
        :style="[positionStyle, componentTokens]"
        role="menu"
        :aria-label="label"
        :aria-hidden="!expanded"
        :inert="!expanded || undefined"
        @keydown="onPanelKeydown"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<style>
.yam3x-floating-action-button-menu {
  display: inline-flex;
  align-items: flex-end;
}
.yam3x-floating-action-button-menu--expanded {
  position: relative;
  z-index: 1001;
}
.yam3x-floating-action-button-menu__panel {
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
  scrollbar-width: none;
  overscroll-behavior: contain;
  padding: 0;
  border-radius: var(--_yam3x-fab-menu-panel-shape);
  background: transparent;
  transform: none;
  opacity: 1;
}
.yam3x-floating-action-button-menu__panel::-webkit-scrollbar {
  display: none;
}
.yam3x-floating-action-button-menu__panel--open {
  transform: translateY(0);
  opacity: 1;
}
.yam3x-floating-action-button-menu__panel--start {
  align-items: flex-start;
}
.yam3x-floating-action-button-menu__panel--center {
  align-items: center;
}
.yam3x-floating-action-button-menu__panel--web-menu {
  align-items: stretch;
  gap: 0;
  inline-size: max-content;
  min-width: var(--_yam3x-fab-menu-min-width);
  max-width: min(
    var(--_yam3x-fab-menu-max-width),
    calc(100vw - var(--_yam3x-fab-menu-window-margin) - var(--_yam3x-fab-menu-window-margin))
  );
  padding: 4px 0;
  border: 1px solid var(--_yam3x-fab-menu-outline);
  border-radius: var(--_yam3x-fab-menu-panel-shape);
  background: var(--_yam3x-fab-menu-surface);
  box-shadow: var(--_yam3x-fab-menu-elevation);
}
.yam3x-floating-action-button-menu__panel[aria-hidden='true'] {
  pointer-events: none;
}
@media (min-width: 1200px) {
  .yam3x-floating-action-button-menu__panel {
    --_yam3x-fab-menu-window-margin: 24px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-floating-action-button-menu-item {
    transition: none;
  }
}
</style>
