<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import MenuPanel from './menu-panel.vue'
import type { MenuItem, MenuPositionX, MenuPositionY, MenuVariant } from './menu.types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    items: MenuItem[]
    label?: string
    variant?: MenuVariant
    positionX?: MenuPositionX
    positionY?: MenuPositionY
    dense?: boolean
    triggerLabel?: string
  }>(),
  {
    label: 'Options',
    variant: 'standard',
    positionX: 'after',
    positionY: 'below',
    dense: false,
    triggerLabel: 'Open menu',
  },
)
const open = defineModel<boolean>('open', { default: false })
const checked = defineModel<string[]>('checked', { default: () => [] })
const selected = defineModel<Record<string, string>>('selected', { default: () => ({}) })
const emit = defineEmits<{
  beforetoggle: [event: CustomEvent<{ open: boolean }>]
  toggle: [event: CustomEvent<{ open: boolean }>]
  beforeselect: [item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>]
  select: [item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>]
}>()
const slots = defineSlots<{
  trigger?(props: {
    open: boolean
    toggle: (anchor?: HTMLElement | MouseEvent) => void
    triggerProps: Record<string, unknown>
  }): unknown
  icon?(props: { item: MenuItem }): unknown
  'trailing-icon'?(props: { item: MenuItem }): unknown
}>()
const activePanelId = ref<string | null>(null)
const panelRendered = ref(false)
const panelClosing = ref(false)
const host = ref<HTMLElement | null>(null)
const triggerElement = ref<HTMLElement | null>(null)
const anchor = ref<HTMLElement | null>(null)
const id = useId()
const validVariant = computed<MenuVariant>(() =>
  props.variant === 'vibrant' ? 'vibrant' : 'standard',
)
const triggerProps = computed(() => ({
  type: 'button' as const,
  'aria-haspopup': 'menu' as const,
  'aria-expanded': open.value,
  'aria-controls': `${id}-panel`,
  'aria-label': props.triggerLabel,
  onClick: (event: MouseEvent) => toggle(event),
  onKeydown: (event: KeyboardEvent) => onTriggerKeydown(event),
}))
let opener: HTMLElement | null = null
let internalChange = false
let restoreAfterClose = false
let panelCloseTimer = 0

const menuExitFallbackMs = 250

function finishPanelClose() {
  window.clearTimeout(panelCloseTimer)
  panelRendered.value = false
  panelClosing.value = false
}

function onPanelCloseComplete() {
  if (open.value) return
  finishPanelClose()
}

function fireToggle(next: boolean) {
  const event = new CustomEvent<{ open: boolean }>('beforetoggle', {
    bubbles: true,
    cancelable: true,
    detail: { open: next },
  })
  emit('beforetoggle', event)
  host.value?.dispatchEvent(event)
  return event
}
function setAnchorExpanded(element: HTMLElement | null, expanded: boolean) {
  if (!element) return
  element.setAttribute('aria-haspopup', 'menu')
  element.setAttribute('aria-expanded', String(expanded))
  element.setAttribute('aria-controls', `${id}-panel`)
  element.toggleAttribute('data-yam3x-pressed', expanded)
}
function show(element: HTMLElement = triggerElement.value!) {
  if (!element) return
  if (open.value) {
    if (anchor.value !== element) setAnchorExpanded(anchor.value, false)
    anchor.value = element
    setAnchorExpanded(element, true)
    return
  }
  const event = fireToggle(true)
  if (event.defaultPrevented) return
  const active = document.activeElement
  opener = active instanceof HTMLElement && active !== document.body ? active : element
  anchor.value = element
  setAnchorExpanded(element, true)
  internalChange = true
  open.value = true
  internalChange = false
}
function hide(restoreFocus = false) {
  if (!open.value) return
  const event = fireToggle(false)
  if (event.defaultPrevented) return
  restoreAfterClose = restoreFocus
  internalChange = true
  open.value = false
  internalChange = false
}
function toggle(target?: HTMLElement | MouseEvent) {
  if (open.value) {
    hide()
    return
  }
  const element = target instanceof MouseEvent ? target.currentTarget : target
  const resolved = element instanceof HTMLElement ? element : triggerElement.value
  if (resolved) {
    opener = resolved
    resolved.removeAttribute('data-yam3x-menu-focus-last')
    show(resolved)
  }
}
function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const element =
    event.currentTarget instanceof HTMLElement ? event.currentTarget : triggerElement.value
  if (element) {
    opener = element
    if (event.key === 'ArrowUp') element.setAttribute('data-yam3x-menu-focus-last', '')
    else element.removeAttribute('data-yam3x-menu-focus-last')
    show(element)
  }
}
function selectItem(item: MenuItem, source: MouseEvent) {
  if (item.disabled) {
    source.preventDefault()
    return
  }
  const event = new CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>('beforeselect', {
    bubbles: true,
    cancelable: true,
    detail: { item, sourceEvent: source },
  })
  emit('beforeselect', item, event)
  host.value?.dispatchEvent(event)
  if (event.defaultPrevented) {
    source.preventDefault()
    return
  }
  if (item.type === 'checkbox') {
    checked.value = checked.value.includes(item.value)
      ? checked.value.filter((value) => value !== item.value)
      : [...checked.value, item.value]
  } else if (item.type === 'radio') {
    selected.value = { ...selected.value, [item.group || 'default']: item.value }
  }
  const selectedEvent = new CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>('select', {
    bubbles: true,
    detail: { item, sourceEvent: source },
  })
  emit('select', item, selectedEvent)
  host.value?.dispatchEvent(selectedEvent)
  if (item.type !== 'checkbox') hide()
}
function dismiss(restoreFocus: boolean) {
  hide(restoreFocus)
}
function activatePanel(panelId: string) {
  activePanelId.value = panelId
}
function onDocumentPointer(event: PointerEvent) {
  const target = event.target as Node
  if (!host.value?.contains(target) && !anchor.value?.contains(target)) hide()
}
watch(
  open,
  async (value, previous) => {
    if (value === previous) return
    if (value) {
      window.clearTimeout(panelCloseTimer)
      panelRendered.value = true
      panelClosing.value = false
    } else if (panelRendered.value) {
      panelClosing.value = true
      window.clearTimeout(panelCloseTimer)
      panelCloseTimer = window.setTimeout(finishPanelClose, menuExitFallbackMs)
    }
    if (!internalChange) {
      const event = fireToggle(value)
      if (event.defaultPrevented) {
        window.clearTimeout(panelCloseTimer)
        panelRendered.value = previous && Boolean(anchor.value)
        panelClosing.value = false
        internalChange = true
        open.value = previous
        internalChange = false
        return
      }
    }
    if (!value) {
      activePanelId.value = null
      document.removeEventListener('pointerdown', onDocumentPointer, true)
      setAnchorExpanded(anchor.value, false)
      await nextTick()
      const closed = new CustomEvent<{ open: boolean }>('toggle', {
        bubbles: true,
        detail: { open: false },
      })
      emit('toggle', closed)
      host.value?.dispatchEvent(closed)
      if (restoreAfterClose) (opener ?? anchor.value)?.focus()
      restoreAfterClose = false
      return
    }
    if (!anchor.value) anchor.value = triggerElement.value
    activePanelId.value = `${id}-panel`
    setAnchorExpanded(anchor.value, true)
    await nextTick()
    document.addEventListener('pointerdown', onDocumentPointer, true)
    const opened = new CustomEvent<{ open: boolean }>('toggle', {
      bubbles: true,
      detail: { open: true },
    })
    emit('toggle', opened)
    host.value?.dispatchEvent(opened)
  },
  { flush: 'sync' },
)
onBeforeUnmount(() => {
  window.clearTimeout(panelCloseTimer)
  document.removeEventListener('pointerdown', onDocumentPointer, true)
  setAnchorExpanded(anchor.value, false)
})

defineExpose({ show, hide, toggle, root: host })
</script>

<template>
  <div
    ref="host"
    class="yam3x-menu"
    :class="[
      `yam3x-menu--${validVariant}`,
      { 'yam3x-menu--dense': dense, 'yam3x-menu--open': open },
    ]"
    v-bind="$attrs"
  >
    <div
      ref="triggerElement"
      class="yam3x-menu__trigger-wrap"
    >
      <slot
        name="trigger"
        :open="open"
        :toggle="toggle"
        :trigger-props="triggerProps"
      >
        <button
          v-bind="triggerProps"
          class="yam3x-menu__trigger"
        >
          {{ triggerLabel }}
        </button>
      </slot>
    </div>
    <MenuPanel
      v-if="panelRendered && anchor"
      :id="`${id}-panel`"
      :items="items"
      :anchor="anchor"
      :depth="0"
      :variant="validVariant"
      :position-x="positionX"
      :position-y="positionY"
      :checked="checked"
      :selected="selected"
      :dense="dense"
      :label="label"
      :active-panel-id="activePanelId"
      :closing="panelClosing"
      :has-icon-slot="Boolean(slots.icon)"
      :has-trailing-icon-slot="Boolean(slots['trailing-icon'])"
      @activate="selectItem"
      @activate-panel="activatePanel"
      @dismiss="dismiss"
      @close-complete="onPanelCloseComplete"
    >
      <template #icon="scope"
        ><slot
          name="icon"
          v-bind="scope"
      /></template>
      <template #trailing-icon="scope"
        ><slot
          name="trailing-icon"
          v-bind="scope"
      /></template>
    </MenuPanel>
  </div>
</template>

<style>
.yam3x-menu {
  display: inline-block;
  position: relative;
  /* System inputs are mapped here; the panel and its submenus inherit these Component aliases. */
  --_yam3x-menu-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-menu-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-menu-motion-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-menu-motion-fast-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-menu-color-surface-container-low: var(--md-sys-color-surface-container-low);
  --_yam3x-menu-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-menu-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-menu-color-secondary-container: var(--md-sys-color-secondary-container);
  --_yam3x-menu-color-on-secondary-container: var(--md-sys-color-on-secondary-container);
  --_yam3x-menu-color-secondary: var(--md-sys-color-secondary);
  --_yam3x-menu-color-tertiary-container: var(--md-sys-color-tertiary-container);
  --_yam3x-menu-color-on-tertiary-container: var(--md-sys-color-on-tertiary-container);
  --_yam3x-menu-color-tertiary: var(--md-sys-color-tertiary);
  --_yam3x-menu-color-on-tertiary: var(--md-sys-color-on-tertiary);
  --_yam3x-menu-color-divider: var(--md-sys-color-outline-variant);
  --_yam3x-menu-color-shadow: var(--md-sys-color-shadow);
  --_yam3x-menu-shape-corner-large: var(--md-sys-shape-corner-large, 16px);
  --_yam3x-menu-shape-corner-medium: var(--md-sys-shape-corner-medium, 12px);
  --_yam3x-menu-shape-corner-small: var(--md-sys-shape-corner-small, 8px);
  --_yam3x-menu-shape-corner-extra-small: var(--md-sys-shape-corner-extra-small, 4px);
  --_yam3x-menu-container-color: var(--_yam3x-menu-color-surface-container-low);
  --_yam3x-menu-item-color: var(--_yam3x-menu-color-on-surface);
  --_yam3x-menu-item-selected-container-color: var(--_yam3x-menu-color-tertiary-container);
  --_yam3x-menu-item-selected-color: var(--_yam3x-menu-color-on-tertiary-container);
  --_yam3x-menu-item-container-hover-color: var(--_yam3x-menu-color-on-surface);
  --_yam3x-menu-item-container-focus-color: var(--_yam3x-menu-color-on-surface);
  --_yam3x-menu-item-ripple-color: var(--_yam3x-menu-color-on-surface);
  --_yam3x-menu-item-selected-container-hover-color: var(--_yam3x-menu-item-selected-color);
  --_yam3x-menu-item-selected-container-focus-color: var(--_yam3x-menu-item-selected-color);
  --_yam3x-menu-item-selected-ripple-color: var(--_yam3x-menu-item-selected-color);
  --_yam3x-menu-item-active-state-layer-color: var(--_yam3x-menu-color-on-surface);
  --_yam3x-menu-item-disabled-color: var(--_yam3x-menu-color-on-surface);
  --_yam3x-menu-container-min-width: var(--yam3x-menu-container-min-width, 112px);
  --_yam3x-menu-container-max-width: 280px;
  --_yam3x-menu-container-max-height: var(--yam3x-menu-container-max-height, 280px);
  --_yam3x-menu-container-padding-block: var(--yam3x-menu-container-padding-block, 2px);
  --_yam3x-menu-container-padding-inline: 4px;
  --_yam3x-menu-container-shape: var(
    --yam3x-menu-container-shape,
    var(--_yam3x-menu-shape-corner-large)
  );
  --_yam3x-menu-active-container-shape: var(
    --yam3x-menu-active-container-shape,
    var(--_yam3x-menu-shape-corner-large)
  );
  --_yam3x-menu-inactive-container-shape: var(
    --yam3x-menu-inactive-container-shape,
    var(--_yam3x-menu-shape-corner-small)
  );
  --_yam3x-menu-item-container-height: var(--yam3x-menu-item-container-height, 44px);
  --_yam3x-menu-item-icon-label-space: var(--yam3x-menu-item-icon-label-space, 12px);
  --_yam3x-menu-item-shape: var(
    --yam3x-menu-item-shape,
    var(--_yam3x-menu-shape-corner-extra-small)
  );
  --_yam3x-menu-group-shape: var(--_yam3x-menu-shape-corner-small);
  --_yam3x-menu-group-padding: 2px;
  --_yam3x-menu-gap: 2px;
  --_yam3x-menu-item-icon-size: 20px;
  --_yam3x-menu-item-padding-block: 8px;
  --_yam3x-menu-item-padding-start: 16px;
  --_yam3x-menu-item-padding-end: 16px;
  --_yam3x-menu-item-content-gap: 2px;
  --_yam3x-menu-divider-height: 1px;
  --_yam3x-menu-divider-spacing: 2px;
  --_yam3x-menu-divider-inset: 12px;
  --_yam3x-menu-focus-ring-thickness: 3px;
  --_yam3x-menu-item-label-text-font-family: var(
    --md-sys-typescale-label-large-font-family,
    Roboto
  );
  --_yam3x-menu-item-focus-ring-shape: var(--yam3x-menu-item-focus-ring-shape);
  --_yam3x-menu-item-label-text-font-size: var(
    --yam3x-menu-item-label-text-font-size,
    var(--md-sys-typescale-label-large-font-size, 14px)
  );
  --_yam3x-menu-item-label-text-font-weight: var(--md-sys-typescale-label-large-font-weight, 500);
  --_yam3x-menu-item-label-text-line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  --_yam3x-menu-item-label-text-tracking: var(--md-sys-typescale-label-large-tracking, 0.1px);
  --_yam3x-menu-item-supporting-text-font-family: var(
    --md-sys-typescale-body-small-font-family,
    Roboto
  );
  --_yam3x-menu-item-supporting-text-font-size: var(--md-sys-typescale-body-small-font-size, 12px);
  --_yam3x-menu-item-supporting-text-font-weight: var(
    --md-sys-typescale-body-small-font-weight,
    400
  );
  --_yam3x-menu-item-supporting-text-line-height: var(
    --md-sys-typescale-body-small-line-height,
    16px
  );
  --_yam3x-menu-item-supporting-text-tracking: var(--md-sys-typescale-body-small-tracking, 0.4px);
  --_yam3x-menu-item-trailing-supporting-text-font-family: var(
    --md-sys-typescale-label-large-font-family,
    Roboto
  );
  --_yam3x-menu-item-trailing-supporting-text-font-size: var(
    --md-sys-typescale-label-large-font-size,
    14px
  );
  --_yam3x-menu-item-trailing-supporting-text-font-weight: var(
    --md-sys-typescale-label-large-font-weight,
    500
  );
  --_yam3x-menu-item-trailing-supporting-text-line-height: var(
    --md-sys-typescale-label-large-line-height,
    20px
  );
  --_yam3x-menu-item-trailing-supporting-text-tracking: var(
    --md-sys-typescale-label-large-tracking,
    0.1px
  );
  --_yam3x-menu-container-elevation: 0 4px 8px 3px
    color-mix(in srgb, var(--_yam3x-menu-color-shadow) 15%, transparent);
  --_yam3x-menu-item-first-child-shape: var(
    --yam3x-menu-item-shape,
    var(--_yam3x-menu-shape-corner-medium)
  );
  --_yam3x-menu-item-first-child-inner-shape: var(
    --yam3x-menu-item-shape,
    var(--_yam3x-menu-shape-corner-extra-small)
  );
  --_yam3x-menu-item-last-child-inner-shape: var(
    --yam3x-menu-item-shape,
    var(--_yam3x-menu-shape-corner-extra-small)
  );
  --_yam3x-menu-item-last-child-shape: var(
    --yam3x-menu-item-shape,
    var(--_yam3x-menu-shape-corner-medium)
  );
}
.yam3x-menu__trigger {
  min-block-size: 48px;
  padding-inline: calc(16px * var(--_yam3x-menu-density-spacing-scale, 1));
  border: 0;
  border-radius: 999px;
  background: var(--_yam3x-menu-color-secondary-container);
  color: var(--_yam3x-menu-color-on-secondary-container);
  font: inherit;
  cursor: pointer;
}
.yam3x-menu__trigger:hover {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-color-on-secondary-container) 8%,
    var(--_yam3x-menu-color-secondary-container)
  );
}
.yam3x-menu__trigger:is(:active, [aria-expanded='true']) {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-color-on-secondary-container) 10%,
    var(--_yam3x-menu-color-secondary-container)
  );
}
.yam3x-menu__trigger:focus-visible {
  outline: 3px solid var(--_yam3x-menu-color-secondary);
  outline-offset: 2px;
}
.yam3x-menu__panel {
  box-sizing: border-box;
  position: fixed;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  gap: 0;
  inline-size: max-content;
  min-inline-size: var(--_yam3x-menu-container-min-width);
  max-inline-size: var(--_yam3x-menu-container-max-width);
  max-block-size: min(var(--_yam3x-menu-container-max-height), calc(100dvh - 16px));
  overflow: auto;
  overscroll-behavior: contain;
  padding: calc(
      var(--_yam3x-menu-container-padding-block) * var(--_yam3x-menu-density-spacing-scale)
    )
    var(--_yam3x-menu-container-padding-inline);
  border-radius: var(--_yam3x-menu-container-shape);
  background: var(--_yam3x-menu-container-color);
  color: var(--_yam3x-menu-color-on-surface);
  box-shadow: var(--_yam3x-menu-container-elevation);
  opacity: 1;
  transform-origin: center var(--_yam3x-menu-transform-origin, top);
  animation: yam3x-menu-enter 180ms cubic-bezier(0.2, 0, 0, 1) both;
  transition: border-radius var(--_yam3x-menu-motion-fast-spatial);
}
.yam3x-menu__panel--closing {
  pointer-events: none;
  animation: yam3x-menu-exit 180ms cubic-bezier(0.2, 0, 0, 1) both;
}
.yam3x-menu__group {
  display: contents;
}
.yam3x-menu__panel--has-gaps:not(.yam3x-menu__panel--scrollable) {
  background: transparent;
}
.yam3x-menu__group--separated {
  display: flex;
  flex-direction: column;
  flex: none;
  padding: var(--_yam3x-menu-group-padding);
  border-radius: var(--_yam3x-menu-group-shape);
  background: var(--_yam3x-menu-container-color);
}
.yam3x-menu__gap {
  display: block;
  flex: none;
  block-size: var(--_yam3x-menu-gap);
}
.yam3x-menu__gap-divider {
  display: none;
  flex: none;
  block-size: var(--_yam3x-menu-divider-height);
  margin-block: calc(var(--_yam3x-menu-divider-spacing) * var(--_yam3x-menu-density-spacing-scale));
  margin-inline: var(--_yam3x-menu-divider-inset);
  background: var(--_yam3x-menu-color-divider);
}
.yam3x-menu__panel--scrollable .yam3x-menu__gap,
.yam3x-menu__panel--measuring-gapless .yam3x-menu__gap {
  display: none;
}
.yam3x-menu__panel--scrollable .yam3x-menu__gap-divider,
.yam3x-menu__panel--measuring-gapless .yam3x-menu__gap-divider {
  display: block;
}
.yam3x-menu__panel--scrollable .yam3x-menu__group--separated,
.yam3x-menu__panel--measuring-gapless .yam3x-menu__group--separated {
  display: contents;
}
.yam3x-menu__panel--measuring-gapless.yam3x-menu__panel--has-gaps {
  background: var(--_yam3x-menu-container-color);
}
.yam3x-menu__panel--active {
  border-radius: var(--_yam3x-menu-active-container-shape);
}
.yam3x-menu__panel--inactive {
  border-radius: var(--_yam3x-menu-inactive-container-shape);
}
.yam3x-menu--vibrant .yam3x-menu__panel {
  --_yam3x-menu-container-color: var(--_yam3x-menu-color-tertiary-container);
  --_yam3x-menu-item-color: var(--_yam3x-menu-color-on-tertiary-container);
  --_yam3x-menu-item-selected-container-color: var(--_yam3x-menu-color-tertiary);
  --_yam3x-menu-item-selected-color: var(--_yam3x-menu-color-on-tertiary);
  --_yam3x-menu-item-container-hover-color: var(--_yam3x-menu-color-on-tertiary-container);
  --_yam3x-menu-item-container-focus-color: var(--_yam3x-menu-color-on-tertiary-container);
  --_yam3x-menu-item-ripple-color: var(--_yam3x-menu-color-on-tertiary-container);
  --_yam3x-menu-item-selected-container-hover-color: var(--_yam3x-menu-color-on-tertiary);
  --_yam3x-menu-item-selected-container-focus-color: var(--_yam3x-menu-color-on-tertiary);
  --_yam3x-menu-item-selected-ripple-color: var(--_yam3x-menu-color-on-tertiary);
  --_yam3x-menu-item-active-state-layer-color: var(--_yam3x-menu-color-on-tertiary-container);
  --_yam3x-menu-item-disabled-color: var(--_yam3x-menu-color-on-tertiary-container);
}
.yam3x-menu__item {
  position: relative;
  isolation: isolate;
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--_yam3x-menu-item-icon-label-space);
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: calc(
    var(--_yam3x-menu-item-container-height) * var(--_yam3x-menu-container-scale)
  );
  block-size: auto;
  padding-block: calc(
    var(--_yam3x-menu-item-padding-block) * var(--_yam3x-menu-density-spacing-scale)
  );
  padding-inline: var(--_yam3x-menu-item-padding-start) var(--_yam3x-menu-item-padding-end);
  border: 0;
  border-radius: var(--_yam3x-menu-item-shape);
  background: transparent;
  color: var(--_yam3x-menu-item-color);
  text-align: start;
  text-decoration: none;
  font: inherit;
  cursor: pointer;
  --yam3x-ripple-color: var(--_yam3x-menu-item-ripple-color, currentColor);
  transition:
    border-radius var(--_yam3x-menu-motion-fast-effects, 150ms cubic-bezier(0.31, 0.94, 0.34, 1)),
    background-color var(--_yam3x-menu-motion-fast-effects),
    color var(--_yam3x-menu-motion-fast-effects);
}
.yam3x-menu__item:hover {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-item-container-hover-color, currentColor) 8%,
    transparent
  );
}
.yam3x-menu__item::after {
  content: '';
  position: absolute;
  z-index: 2;
  inset: 0;
  box-sizing: border-box;
  border: var(--_yam3x-menu-focus-ring-thickness) solid transparent;
  border-radius: var(--_yam3x-menu-item-focus-ring-shape, inherit);
  pointer-events: none;
}
.yam3x-menu__item:focus-visible {
  z-index: 1;
  outline: none;
}
.yam3x-menu__item:focus-visible::after {
  border-color: var(--_yam3x-menu-color-secondary);
}
.yam3x-menu__item--selected {
  background: var(--_yam3x-menu-item-selected-container-color);
  color: var(--_yam3x-menu-item-selected-color);
  --yam3x-ripple-color: var(--_yam3x-menu-item-selected-ripple-color);
}
.yam3x-menu__item--selected:hover {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-item-selected-container-hover-color) 8%,
    var(--_yam3x-menu-item-selected-container-color)
  );
}
.yam3x-menu__item:not(.yam3x-menu__item--selected):focus-visible {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-item-container-focus-color, currentColor) 10%,
    transparent
  );
}
.yam3x-menu__item--selected:focus-visible {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-item-selected-container-focus-color) 10%,
    var(--_yam3x-menu-item-selected-container-color)
  );
}
.yam3x-menu__item--submenu-open {
  background: color-mix(
    in srgb,
    var(--_yam3x-menu-item-active-state-layer-color)
      var(
        --_yam3x-menu-item-active-state-layer-opacity,
        var(--_yam3x-menu-active-state-layer-opacity, 8%)
      ),
    transparent
  );
}
.yam3x-menu__item--first:not(.yam3x-menu__item--last) {
  border-start-start-radius: var(
    --_yam3x-menu-item-first-child-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-medium, 12px))
  );
  border-start-end-radius: var(
    --_yam3x-menu-item-first-child-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-medium, 12px))
  );
  border-end-start-radius: var(
    --_yam3x-menu-item-first-child-inner-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-extra-small, 4px))
  );
  border-end-end-radius: var(
    --_yam3x-menu-item-first-child-inner-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-extra-small, 4px))
  );
}
.yam3x-menu__item--last:not(.yam3x-menu__item--first) {
  border-start-start-radius: var(
    --_yam3x-menu-item-last-child-inner-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-extra-small, 4px))
  );
  border-start-end-radius: var(
    --_yam3x-menu-item-last-child-inner-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-extra-small, 4px))
  );
  border-end-start-radius: var(
    --_yam3x-menu-item-last-child-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-medium, 12px))
  );
  border-end-end-radius: var(
    --_yam3x-menu-item-last-child-shape,
    var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-medium, 12px))
  );
}
.yam3x-menu__item--first.yam3x-menu__item--last {
  border-radius: var(--_yam3x-menu-item-shape, var(--_yam3x-menu-shape-corner-extra-small, 4px));
}
.yam3x-menu__item.yam3x-menu__item--selected {
  border-radius: var(
    --_yam3x-menu-item-selected-shape,
    var(--_yam3x-menu-shape-corner-medium, 12px)
  );
}
.yam3x-menu__item[aria-disabled='true'] {
  color: color-mix(
    in srgb,
    var(--_yam3x-menu-item-disabled-color, var(--_yam3x-menu-color-on-surface))
      var(--_yam3x-menu-item-disabled-opacity, 38%),
    transparent
  );
  cursor: default;
}
.yam3x-menu__leading,
.yam3x-menu__trailing-icon,
.yam3x-menu__chevron {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: var(--_yam3x-menu-item-icon-size);
  block-size: var(--_yam3x-menu-item-icon-size);
}
.yam3x-menu__chevron .yam3x-icon {
  inline-size: var(--_yam3x-menu-item-icon-size);
  block-size: var(--_yam3x-menu-item-icon-size);
  font-size: var(--_yam3x-menu-item-icon-size);
}
.yam3x-menu__leading:empty,
.yam3x-menu__trailing-icon:empty {
  visibility: hidden;
}
.yam3x-menu__check {
  font-size: var(--_yam3x-menu-item-icon-size);
}
.yam3x-menu__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
  gap: calc(var(--_yam3x-menu-item-content-gap) * var(--_yam3x-menu-density-spacing-scale));
  font-family: var(--_yam3x-menu-item-label-text-font-family);
  font-size: var(--_yam3x-menu-item-label-text-font-size);
  font-weight: var(--_yam3x-menu-item-label-text-font-weight);
  line-height: var(--_yam3x-menu-item-label-text-line-height);
  letter-spacing: var(--_yam3x-menu-item-label-text-tracking);
}
.yam3x-menu__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.yam3x-menu__supporting {
  color: var(--_yam3x-menu-color-on-surface-variant);
  font-family: var(--_yam3x-menu-item-supporting-text-font-family);
  font-size: var(--_yam3x-menu-item-supporting-text-font-size);
  font-weight: var(--_yam3x-menu-item-supporting-text-font-weight);
  line-height: var(--_yam3x-menu-item-supporting-text-line-height);
  letter-spacing: var(--_yam3x-menu-item-supporting-text-tracking);
}
.yam3x-menu__trailing-text {
  flex: none;
  color: var(--_yam3x-menu-color-on-surface-variant);
  font-family: var(--_yam3x-menu-item-trailing-supporting-text-font-family);
  font-size: var(--_yam3x-menu-item-trailing-supporting-text-font-size);
  font-weight: var(--_yam3x-menu-item-trailing-supporting-text-font-weight);
  line-height: var(--_yam3x-menu-item-trailing-supporting-text-line-height);
  letter-spacing: var(--_yam3x-menu-item-trailing-supporting-text-tracking);
}
.yam3x-menu__badge {
  flex: none;
  color: var(--_yam3x-menu-color-on-surface-variant);
  font-size: 12px;
}
.yam3x-menu__badge {
  padding: calc(2px * var(--_yam3x-menu-density-spacing-scale)) 6px;
  border-radius: 999px;
  background: var(--_yam3x-menu-color-secondary-container);
}
.yam3x-menu__divider {
  flex: none;
  block-size: var(--_yam3x-menu-divider-height);
  margin-block: calc(var(--_yam3x-menu-divider-spacing) * var(--_yam3x-menu-density-spacing-scale));
  margin-inline: var(--_yam3x-menu-divider-inset);
  background: var(--_yam3x-menu-color-divider);
}
.yam3x-menu__group-label {
  display: flex;
  flex: none;
  align-items: center;
  box-sizing: border-box;
  min-block-size: var(--_yam3x-menu-group-label-min-height, 32px);
  padding-inline: var(--_yam3x-menu-group-label-padding-start, 12px)
    var(--_yam3x-menu-group-label-padding-end, 4px);
  color: var(--_yam3x-menu-color-on-surface-variant);
  font-size: 12px;
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  font-weight: 600;
}
.yam3x-menu--dense .yam3x-menu__panel {
  padding-block: max(
    calc(0px * var(--_yam3x-menu-density-spacing-scale)),
    calc(
      var(
          --_yam3x-menu-container-padding-block,
          calc(2px * var(--_yam3x-menu-density-spacing-scale))
        ) -
        calc(2px * var(--_yam3x-menu-density-spacing-scale))
    )
  );
}
.yam3x-menu__panel .yam3x-ripple-container {
  z-index: 0;
}
@keyframes yam3x-menu-enter {
  from {
    opacity: 0;
    clip-path: var(--_yam3x-menu-collapse-clip, inset(0 0 100% 0 round 4px));
  }
  to {
    opacity: 1;
    clip-path: inset(0 round 4px);
  }
}
@keyframes yam3x-menu-exit {
  from {
    opacity: 1;
    clip-path: inset(0 round 4px);
  }
  to {
    opacity: 0;
    clip-path: var(--_yam3x-menu-collapse-clip, inset(0 0 100% 0 round 4px));
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-menu__panel,
  .yam3x-menu__item {
    animation: none;
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-menu__panel {
    background: Menu;
    color: MenuText;
    border: 1px solid CanvasText;
  }
  .yam3x-menu__item {
    color: MenuText;
  }
  .yam3x-menu__item--selected {
    border: 1px solid Highlight;
  }
  .yam3x-menu__item[aria-disabled='true'] {
    color: GrayText;
  }
  .yam3x-menu__item:focus-visible::after {
    border-color: Highlight;
  }
}
</style>
