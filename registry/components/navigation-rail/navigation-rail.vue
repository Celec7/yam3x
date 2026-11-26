<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import {
  acquireOverlayLayer,
  setOverlayLayerProperty,
  type OverlayLayer,
} from '../_shared/overlay-layer'
import Icon from '../icon/icon.vue'
import NavigationRailLink from './navigation-rail-link.vue'
import type {
  NavigationRailDensity,
  NavigationRailItem,
  NavigationRailMode,
} from './navigation-rail.types'

const props = withDefaults(
  defineProps<{
    locale?: string
    items: NavigationRailItem[]
    label: string
    mode?: NavigationRailMode
    presentation?: 'standard' | 'modal'
    hideWhenCollapsed?: boolean
    alignment?: 'top' | 'center'
    density?: NavigationRailDensity
    divider?: boolean
    showMenu?: boolean
    menuLabel?: string
    closeLabel?: string
  }>(),
  {
    mode: 'collapsed',
    presentation: 'standard',
    hideWhenCollapsed: false,
    alignment: 'top',
    density: 'standard',
    divider: false,
    showMenu: true,
    menuLabel: undefined,
    closeLabel: undefined,
  },
)
const model = defineModel<string>({ default: '' })
const expandedModel = defineModel<boolean | undefined>('expanded')
const emit = defineEmits<{
  navigate: [item: NavigationRailItem, event: MouseEvent]
  beforeinput: [item: NavigationRailItem, event: Event]
  input: [item: NavigationRailItem, event: Event]
  change: [item: NavigationRailItem, event: Event]
}>()
const slots = defineSlots<{
  icon(props: { item: NavigationRailItem; selected: boolean }): unknown
  'selected-icon'?(props: { item: NavigationRailItem }): unknown
  badge?(props: { item: NavigationRailItem; selected: boolean }): unknown
  fab?(props: { expanded: boolean }): unknown
  'menu-icon'?(): unknown
  'close-icon'?(): unknown
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ expandNavigation: props.menuLabel, collapseNavigation: props.closeLabel }),
)

const root = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const wide = ref(false)
const ready = ref(false)
const id = useId()
const resolvedExpanded = computed(
  () => expandedModel.value ?? (props.mode === 'expanded' || (props.mode === 'auto' && wide.value)),
)
const menuActionLabel = computed(() =>
  resolvedExpanded.value
    ? actionMessages.value.collapseNavigation
    : actionMessages.value.expandNavigation,
)
const modalOpen = computed(() => resolvedExpanded.value && props.presentation === 'modal')
const layerZ = ref<number>()
let layer: OverlayLayer | undefined
watch(
  modalOpen,
  (value) => {
    if (value) {
      layer?.release()
      layer = acquireOverlayLayer('dialog', close)
      layerZ.value = layer.zIndex
    } else {
      layer?.release()
      layer = undefined
      layerZ.value = undefined
    }
  },
  { immediate: true },
)
watch([layerZ, root], () => {
  setOverlayLayerProperty(root.value, '--_yam3x-navigation-rail-layer-z', layerZ.value)
})
const childEntries = computed(() =>
  props.items.flatMap((parent) => (parent.children ?? []).map((item) => ({ item, parent }))),
)
const visibleItems = computed(() =>
  props.items.filter(
    (item) =>
      resolvedExpanded.value ||
      !item.secondary ||
      item.value === model.value ||
      item.children?.some((child) => child.value === model.value),
  ),
)
const currentEntry = computed(() => {
  const top = props.items.find((item) => item.value === model.value && !item.disabled)
  if (top) return { item: top, parent: null as NavigationRailItem | null }
  return (
    childEntries.value.find((entry) => entry.item.value === model.value && !entry.item.disabled) ??
    null
  )
})
const fallbackItem = computed(() => props.items.find((item) => !item.disabled) ?? null)
const selectedValue = computed(() => {
  const entry = currentEntry.value
  if (!entry) return fallbackItem.value?.value
  if (entry.parent && !resolvedExpanded.value) return entry.parent.value
  return entry.item.value
})
let media: MediaQueryList | null = null
let opener: HTMLElement | null = null
let oldOverflow: string | null = null

function isDisabled(item: NavigationRailItem) {
  return !!(item.disabled || item.disabledInteractive)
}
function navigationLinks() {
  return Array.from(
    root.value?.querySelectorAll<HTMLAnchorElement>('.yam3x-navigation-rail__item') ?? [],
  )
}
function selectionEvent(type: 'input' | 'change', item: NavigationRailItem, target: EventTarget) {
  const event = new Event(type, { bubbles: true })
  target.dispatchEvent(event)
  if (type === 'input') emit('input', item, event)
  else emit('change', item, event)
}
function activate(item: NavigationRailItem, event: MouseEvent) {
  if (isDisabled(item)) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return
  const target = event.currentTarget
  if (!target) return
  const before = new Event('beforeinput', { bubbles: true, cancelable: true })
  target.dispatchEvent(before)
  emit('beforeinput', item, before)
  if (before.defaultPrevented) {
    event.preventDefault()
    return
  }
  model.value = item.value
  selectionEvent('input', item, target)
  selectionEvent('change', item, target)
  emit('navigate', item, event)
  if (modalOpen.value) close()
}
function onItemKeydown(event: KeyboardEvent) {
  if (event.key === ' ' && !event.repeat) {
    event.preventDefault()
    ;(event.currentTarget as HTMLElement).dataset.m3SpacePressed = 'true'
    return
  }
  const forward = event.key === 'ArrowDown'
  const backward = event.key === 'ArrowUp'
  if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return
  const enabled = navigationLinks().filter((link) => link.tabIndex >= 0)
  if (!enabled.length) return
  const position = enabled.indexOf(event.currentTarget as HTMLAnchorElement)
  if (position < 0) return
  event.preventDefault()
  const next =
    event.key === 'Home'
      ? enabled[0]
      : event.key === 'End'
        ? enabled[enabled.length - 1]
        : enabled[(position + (forward ? 1 : -1) + enabled.length) % enabled.length]
  next?.focus()
}
function onItemKeyup(item: NavigationRailItem, event: KeyboardEvent) {
  if (event.key !== ' ') return
  const target = event.currentTarget as HTMLElement
  const pressed = target.dataset.m3SpacePressed === 'true'
  delete target.dataset.m3SpacePressed
  event.preventDefault()
  if (pressed && !isDisabled(item))
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
}
function toggle() {
  if (!resolvedExpanded.value)
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  expandedModel.value = !resolvedExpanded.value
  if (!expandedModel.value) nextTick(() => opener?.focus())
}
function close() {
  if (!resolvedExpanded.value) return
  expandedModel.value = false
  nextTick(() => opener?.focus())
}
function onModalKeydown(event: KeyboardEvent) {
  if (!modalOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab' || !surface.value) return
  const focusables = [
    ...surface.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex="0"]',
    ),
  ].filter((element) => element.getClientRects().length > 0)
  if (!focusables.length) {
    event.preventDefault()
    return
  }
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
function updateWide() {
  wide.value = !!media?.matches
}
function focusFirstInteractive() {
  const fabControl = root.value?.querySelector<HTMLElement>(
    '.yam3x-navigation-rail__fab button:not([disabled]), .yam3x-navigation-rail__fab a[href], .yam3x-navigation-rail__fab [tabindex]:not([tabindex="-1"])',
  )
  const target = menuButton.value ?? fabControl ?? navigationLinks()[0] ?? surface.value
  target?.focus()
}
onMounted(() => {
  media = matchMedia('(min-width: 840px)')
  updateWide()
  media.addEventListener('change', updateWide)
  if (modalOpen.value) nextTick(focusFirstInteractive)
  requestAnimationFrame(() => {
    ready.value = true
  })
})
onBeforeUnmount(() => {
  layer?.release()
  layer = undefined
  media?.removeEventListener('change', updateWide)
  if (oldOverflow !== null) document.body.style.overflow = oldOverflow
})
watch(
  [currentEntry, fallbackItem],
  ([entry, fallback]) => {
    if (entry || !fallback) return
    if (model.value !== fallback.value) model.value = fallback.value
  },
  { immediate: true },
)
watch(resolvedExpanded, async (expanded, wasExpanded) => {
  if (expanded || !wasExpanded || props.presentation === 'modal') return
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) return
  const childLink = active.closest<HTMLElement>('.yam3x-navigation-rail__item--child')
  const parentValue = childLink?.dataset.parentValue
  if (!parentValue) return
  await nextTick()
  navigationLinks()
    .find((link) => link.dataset.value === parentValue)
    ?.focus()
})
watch(
  modalOpen,
  (value) => {
    if (typeof document === 'undefined') return
    if (value) {
      if (!opener && document.activeElement instanceof HTMLElement) opener = document.activeElement
      if (oldOverflow === null) {
        oldOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
      nextTick(focusFirstInteractive)
    } else if (oldOverflow !== null) {
      document.body.style.overflow = oldOverflow
      oldOverflow = null
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-show="(!hideWhenCollapsed || resolvedExpanded) && (props.mode !== 'auto' || wide)"
    ref="root"
    class="yam3x-navigation-rail"
    :class="{
      'yam3x-navigation-rail--expanded': resolvedExpanded,
      'yam3x-navigation-rail--modal': modalOpen,
      'yam3x-navigation-rail--ready': ready,
      'yam3x-navigation-rail--divider': divider,
      'yam3x-navigation-rail--center': alignment === 'center',
      'yam3x-navigation-rail--compact': density === 'compact',
    }"
    @keydown="onModalKeydown"
  >
    <div
      v-if="modalOpen"
      class="yam3x-navigation-rail__scrim"
      aria-hidden="true"
      @click="close"
    />
    <div
      ref="surface"
      class="yam3x-navigation-rail__surface"
      :role="modalOpen ? 'dialog' : undefined"
      :aria-modal="modalOpen || undefined"
      :aria-label="modalOpen ? label : undefined"
      tabindex="-1"
    >
      <div class="yam3x-navigation-rail__top">
        <button
          v-if="showMenu"
          ref="menuButton"
          type="button"
          class="yam3x-navigation-rail__menu"
          :aria-expanded="resolvedExpanded"
          :aria-controls="`${id}-destinations`"
          :aria-label="menuActionLabel"
          :title="menuActionLabel"
          @click="toggle"
        >
          <slot
            v-if="resolvedExpanded"
            name="close-icon"
            ><Icon name="menu_open"
          /></slot>
          <slot
            v-else
            name="menu-icon"
            ><Icon name="menu"
          /></slot>
        </button>
        <div
          v-if="slots.fab"
          class="yam3x-navigation-rail__fab"
        >
          <slot
            name="fab"
            :expanded="resolvedExpanded"
          />
        </div>
      </div>
      <nav
        :aria-label="label"
        class="yam3x-navigation-rail__nav"
        :class="{ 'yam3x-navigation-rail__nav--with-header': showMenu || slots.fab }"
      >
        <div
          :id="`${id}-destinations`"
          class="yam3x-navigation-rail__destinations"
          role="list"
        >
          <div
            v-for="(item, index) in visibleItems"
            :key="item.value"
            role="listitem"
          >
            <NavigationRailLink
              :item="item"
              :current="selectedValue === item.value"
              :label-id="`${id}-label-${index}`"
              :badge-id="`${id}-badge-${index}`"
              @click="activate(item, $event)"
              @keydown="onItemKeydown"
              @keyup="onItemKeyup(item, $event)"
            >
              <template #icon>
                <slot
                  v-if="selectedValue === item.value && slots['selected-icon']"
                  name="selected-icon"
                  :item="item"
                />
                <slot
                  v-else
                  name="icon"
                  :item="item"
                  :selected="selectedValue === item.value"
                />
              </template>
              <template
                v-if="slots.badge"
                #badge="{ text }"
              >
                <slot
                  name="badge"
                  :item="item"
                  :selected="selectedValue === item.value"
                  >{{ text }}</slot
                >
              </template>
            </NavigationRailLink>
            <div
              v-if="resolvedExpanded && item.children?.length"
              class="yam3x-navigation-rail__children"
              role="list"
              :aria-labelledby="`${id}-label-${index}`"
            >
              <div
                v-for="(child, childIndex) in item.children"
                :key="child.value"
                role="listitem"
              >
                <NavigationRailLink
                  :item="child"
                  :current="selectedValue === child.value"
                  :badge-id="`${id}-badge-${index}-${childIndex}`"
                  :parent-value="item.value"
                  child
                  @click="activate(child, $event)"
                  @keydown="onItemKeydown"
                  @keyup="onItemKeyup(child, $event)"
                >
                  <template
                    v-if="slots.badge"
                    #badge="{ text }"
                  >
                    <slot
                      name="badge"
                      :item="child"
                      :selected="selectedValue === child.value"
                      >{{ text }}</slot
                    >
                  </template>
                </NavigationRailLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<style>
.yam3x-navigation-rail {
  /* Material System → Navigation Rail Component mappings and local geometry. */
  --_yam3x-navigation-rail-color-container: var(--md-sys-color-surface-container);
  --_yam3x-navigation-rail-color-divider: var(--md-sys-color-outline-variant);
  --_yam3x-navigation-rail-color-menu: var(--md-sys-color-on-surface);
  --_yam3x-navigation-rail-color-inactive: var(--md-sys-color-on-surface-variant);
  --_yam3x-navigation-rail-color-active-icon: var(--md-sys-color-on-secondary-container);
  --_yam3x-navigation-rail-color-active-label-vertical: var(--md-sys-color-secondary);
  --_yam3x-navigation-rail-color-active-label-horizontal: var(
    --md-sys-color-on-secondary-container
  );
  --_yam3x-navigation-rail-color-indicator: var(--md-sys-color-secondary-container);
  --_yam3x-navigation-rail-color-badge: var(--md-sys-color-error);
  --_yam3x-navigation-rail-color-badge-content: var(--md-sys-color-on-error);
  --_yam3x-navigation-rail-color-state-inactive: var(--_yam3x-navigation-rail-color-inactive);
  --_yam3x-navigation-rail-color-state-active: var(--_yam3x-navigation-rail-color-active-icon);
  --_yam3x-navigation-rail-color-disabled: var(--md-sys-color-on-surface);
  --_yam3x-navigation-rail-color-scrim: var(--md-sys-color-scrim);
  --_yam3x-navigation-rail-state-hover-opacity: var(--md-sys-state-hover-opacity, 0.08);
  --_yam3x-navigation-rail-state-focus-opacity: var(--md-sys-state-focus-opacity, 0.1);
  --_yam3x-navigation-rail-state-pressed-opacity: var(--md-sys-state-pressed-opacity, 0.1);
  --_yam3x-navigation-rail-density-spacing: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-navigation-rail-density-container: var(--md-sys-density-container-scale, 1);
  --_yam3x-navigation-rail-typescale-line-height: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-navigation-rail-font-size-vertical: var(--md-sys-typescale-label-medium-font-size);
  --_yam3x-navigation-rail-font-weight-vertical: var(--md-sys-typescale-label-medium-font-weight);
  --_yam3x-navigation-rail-line-height-vertical: var(
    --md-sys-typescale-label-medium-line-height-small
  );
  --_yam3x-navigation-rail-letter-spacing-vertical: var(--md-sys-typescale-label-medium-tracking);
  --_yam3x-navigation-rail-font-size-horizontal: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-navigation-rail-font-weight-horizontal: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-navigation-rail-line-height-horizontal: var(
    --md-sys-typescale-label-large-line-height-small
  );
  --_yam3x-navigation-rail-letter-spacing-horizontal: var(--md-sys-typescale-label-large-tracking);
  --_yam3x-navigation-rail-motion-default-spatial: var(--md-sys-motion-spring-default-spatial);
  --_yam3x-navigation-rail-motion-fast-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-navigation-rail-motion-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-navigation-rail-shape-indicator: var(--md-sys-shape-corner-full);
  --_yam3x-navigation-rail-shadow-expanded: var(--md-sys-elevation-level3);
  --_yam3x-navigation-rail-scrim-opacity: var(--_yam3x-overlay-scrim-opacity);
  --_yam3x-navigation-rail-focus-ring-color: var(
    --_yam3x-navigation-rail-color-active-label-vertical
  );
  --_yam3x-navigation-rail-focus-ring-thickness: var(--yam3x-focus-ring-thickness, 3px);
  /* TODO: Add the Material narrow collapsed layout (80px); only the 96px layout is supported. */
  --_yam3x-navigation-rail-width-collapsed: 96px;
  --_yam3x-navigation-rail-width-expanded-min: 220px;
  --_yam3x-navigation-rail-width-expanded: var(--_yam3x-navigation-rail-width-expanded-min);
  --_yam3x-navigation-rail-width-expanded-max: 360px;
  --_yam3x-navigation-rail-top-space: 44px;
  --_yam3x-navigation-rail-bottom-space: 8px;
  --_yam3x-navigation-rail-inline-padding: 20px;
  --_yam3x-navigation-rail-menu-item-space: 16px;
  --_yam3x-navigation-rail-menu-inset: 4px;
  --_yam3x-navigation-rail-menu-inset-expanded: var(--_yam3x-navigation-rail-inline-padding);
  --_yam3x-navigation-rail-header-item-space: 40px;
  --_yam3x-navigation-rail-destination-space: 4px;
  --_yam3x-navigation-rail-destination-space-expanded: 0px;
  --_yam3x-navigation-rail-item-height-collapsed: 64px;
  --_yam3x-navigation-rail-item-height-minimum: 48px;
  --_yam3x-navigation-rail-item-padding-top: 6px;
  --_yam3x-navigation-rail-item-padding-bottom: 4px;
  --_yam3x-navigation-rail-indicator-width-vertical: 56px;
  --_yam3x-navigation-rail-indicator-height-vertical: 32px;
  --_yam3x-navigation-rail-indicator-offset-vertical: 0px;
  --_yam3x-navigation-rail-item-icon-label-space-vertical: 4px;
  --_yam3x-navigation-rail-item-height-expanded: 56px;
  --_yam3x-navigation-rail-item-icon-label-space-horizontal: 8px;
  --_yam3x-navigation-rail-item-inset-horizontal: 16px;
  --_yam3x-navigation-rail-item-focus-shape: 16px;
  --_yam3x-navigation-rail-icon-size: 24px;
  --_yam3x-navigation-rail-menu-target-size: 48px;
  --_yam3x-navigation-rail-badge-size: 16px;
  --_yam3x-navigation-rail-badge-inset-block: -4px;
  --_yam3x-navigation-rail-badge-inset-inline: -8px;
  --_yam3x-navigation-rail-badge-padding-inline: 2px;
  --_yam3x-navigation-rail-badge-shape: 8px;
  --_yam3x-navigation-rail-disabled-opacity: 38%;
  box-sizing: border-box;
  flex: none;
  inline-size: var(--_yam3x-navigation-rail-width-collapsed);
  block-size: 100%;
  min-block-size: 0;
  color: var(--_yam3x-navigation-rail-color-inactive);
  transition: inline-size var(--_yam3x-navigation-rail-motion-default-spatial);
}
.yam3x-navigation-rail[hidden] {
  display: none;
}
.yam3x-navigation-rail--compact {
  --_yam3x-navigation-rail-top-space: 16px;
  --_yam3x-navigation-rail-header-item-space: 8px;
  --_yam3x-navigation-rail-item-height-collapsed: 56px;
  --_yam3x-navigation-rail-item-height-expanded: 48px;
  --_yam3x-navigation-rail-item-padding-top: 2px;
  --_yam3x-navigation-rail-item-padding-bottom: 1px;
}
.yam3x-navigation-rail--expanded {
  inline-size: var(--_yam3x-navigation-rail-width-expanded);
  max-inline-size: var(--_yam3x-navigation-rail-width-expanded-max);
}
.yam3x-navigation-rail__surface {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  block-size: 100%;
  min-block-size: 0;
  overflow: hidden;
  background: var(--_yam3x-navigation-rail-color-container);
  padding-block-start: calc(
    var(--_yam3x-navigation-rail-top-space) * var(--_yam3x-navigation-rail-density-spacing)
  );
  padding-block-end: calc(
    var(--_yam3x-navigation-rail-bottom-space) * var(--_yam3x-navigation-rail-density-spacing)
  );
  padding-inline: calc(
    var(--_yam3x-navigation-rail-inline-padding) * var(--_yam3x-navigation-rail-density-spacing)
  );
}
.yam3x-navigation-rail--divider .yam3x-navigation-rail__surface {
  border-inline-end: 1px solid var(--_yam3x-navigation-rail-color-divider);
}
.yam3x-navigation-rail__top {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(
    var(--_yam3x-navigation-rail-menu-item-space) * var(--_yam3x-navigation-rail-density-spacing)
  );
}
.yam3x-navigation-rail__menu {
  display: grid;
  place-items: center;
  inline-size: var(--_yam3x-navigation-rail-menu-target-size);
  block-size: var(--_yam3x-navigation-rail-menu-target-size);
  margin-inline-start: calc(
    var(--_yam3x-navigation-rail-menu-inset) * var(--_yam3x-navigation-rail-density-spacing)
  );
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--_yam3x-navigation-rail-color-menu);
  cursor: pointer;
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__menu {
  margin-inline-start: calc(
    var(--_yam3x-navigation-rail-menu-inset-expanded) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
}
.yam3x-navigation-rail__menu:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.yam3x-navigation-rail__menu:focus-visible {
  outline: var(--_yam3x-navigation-rail-focus-ring-thickness) solid
    var(--_yam3x-navigation-rail-focus-ring-color);
  outline-offset: -3px;
}
.yam3x-navigation-rail__menu svg {
  inline-size: 24px;
  block-size: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.yam3x-navigation-rail__menu .yam3x-icon {
  inline-size: 24px;
  block-size: 24px;
  font-size: 24px;
}
:dir(rtl) .yam3x-navigation-rail--expanded .yam3x-navigation-rail__menu .yam3x-icon {
  transform: scaleX(-1);
}
.yam3x-navigation-rail__fab {
  max-inline-size: 100%;
}
.yam3x-navigation-rail__nav {
  min-block-size: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  flex: 1;
  margin-inline: calc(
    0px - var(--_yam3x-navigation-rail-inline-padding) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__nav {
  margin-inline: 0;
}
.yam3x-navigation-rail__nav--with-header {
  margin-block-start: calc(
    var(--_yam3x-navigation-rail-header-item-space) * var(--_yam3x-navigation-rail-density-spacing)
  );
}
.yam3x-navigation-rail__destinations,
.yam3x-navigation-rail__children {
  margin: 0;
  padding: 0;
  list-style: none;
}
.yam3x-navigation-rail__destinations {
  display: flex;
  flex-direction: column;
  gap: calc(
    var(--_yam3x-navigation-rail-destination-space) * var(--_yam3x-navigation-rail-density-spacing)
  );
  min-block-size: 100%;
  align-items: stretch;
}
.yam3x-navigation-rail--center .yam3x-navigation-rail__destinations {
  justify-content: center;
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__destinations {
  gap: var(--_yam3x-navigation-rail-destination-space-expanded);
}
.yam3x-navigation-rail__item {
  display: flex;
  position: relative;
  isolation: isolate;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex: none;
  inline-size: 100%;
  min-block-size: max(
    var(--_yam3x-navigation-rail-item-height-minimum),
    calc(
      var(--_yam3x-navigation-rail-item-height-collapsed) *
        var(--_yam3x-navigation-rail-density-container)
    )
  );
  padding-block: calc(
      var(--_yam3x-navigation-rail-item-padding-top) * var(--_yam3x-navigation-rail-density-spacing)
    )
    calc(
      var(--_yam3x-navigation-rail-item-padding-bottom) *
        var(--_yam3x-navigation-rail-density-spacing)
    );
  color: var(--_yam3x-navigation-rail-color-inactive);
  text-decoration: none;
  cursor: pointer;
  --yam3x-ripple-color: var(--_yam3x-navigation-rail-color-state-inactive);
}
.yam3x-navigation-rail .yam3x-navigation-rail__item {
  text-decoration: none;
}
.yam3x-navigation-rail__item[aria-disabled='true'] {
  cursor: default;
}
.yam3x-navigation-rail__item:focus-visible {
  outline: var(--_yam3x-navigation-rail-focus-ring-thickness) solid
    var(--_yam3x-navigation-rail-focus-ring-color);
  outline-offset: -3px;
  border-radius: var(--_yam3x-navigation-rail-item-focus-shape);
}
.yam3x-navigation-rail__content {
  display: inline-flex;
  position: relative;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  gap: calc(
    var(--_yam3x-navigation-rail-item-icon-label-space-vertical) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
  min-inline-size: var(--_yam3x-navigation-rail-indicator-width-vertical);
  max-inline-size: 100%;
}
.yam3x-navigation-rail__indicator {
  position: absolute;
  z-index: 0;
  inset-block-start: var(--_yam3x-navigation-rail-indicator-offset-vertical);
  inset-inline-start: 50%;
  transform: translateX(-50%);
  inline-size: var(--_yam3x-navigation-rail-indicator-width-vertical);
  block-size: var(--_yam3x-navigation-rail-indicator-height-vertical);
  border-radius: var(--_yam3x-navigation-rail-shape-indicator);
  background: var(--_yam3x-navigation-rail-color-indicator);
  opacity: 0;
  clip-path: inset(0 50% 0 50% round 999px);
  transition:
    clip-path var(--_yam3x-navigation-rail-motion-fast-spatial),
    opacity var(--_yam3x-navigation-rail-motion-fast-effects);
  pointer-events: none;
}
.yam3x-navigation-rail__indicator::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--_yam3x-navigation-rail-color-state-inactive);
  opacity: 0;
}
.yam3x-navigation-rail__item:where(:not(.yam3x-navigation-rail__item--child)):not(
    [aria-disabled='true']
  ):is(:hover, :focus-visible, :active, [data-yam3x-pressed])
  .yam3x-navigation-rail__indicator,
.yam3x-navigation-rail__item:where(:not(.yam3x-navigation-rail__item--child))[aria-current='page']
  .yam3x-navigation-rail__indicator {
  opacity: 1;
  clip-path: inset(0 0 0 0 round var(--_yam3x-navigation-rail-shape-indicator));
}
.yam3x-navigation-rail:not(.yam3x-navigation-rail--ready),
.yam3x-navigation-rail:not(.yam3x-navigation-rail--ready) .yam3x-navigation-rail__indicator {
  transition: none;
}
.yam3x-navigation-rail__item:not([aria-disabled='true']):hover
  .yam3x-navigation-rail__indicator::before {
  opacity: var(--_yam3x-navigation-rail-state-hover-opacity);
}
.yam3x-navigation-rail__item:not([aria-disabled='true']):focus-visible
  .yam3x-navigation-rail__indicator::before {
  background: var(--_yam3x-navigation-rail-color-state-inactive);
  opacity: var(--_yam3x-navigation-rail-state-focus-opacity);
}
.yam3x-navigation-rail__item:not([aria-disabled='true']):is(:active, [data-yam3x-pressed])
  .yam3x-navigation-rail__indicator::before {
  background: var(--_yam3x-navigation-rail-color-state-inactive);
  opacity: var(--_yam3x-navigation-rail-state-pressed-opacity);
}
.yam3x-navigation-rail__item[aria-current='page'] {
  --yam3x-ripple-color: var(--_yam3x-navigation-rail-color-state-active);
}
.yam3x-navigation-rail__item[aria-current='page']:not([aria-disabled='true']):hover
  .yam3x-navigation-rail__indicator::before {
  background: var(--_yam3x-navigation-rail-color-state-active);
}
.yam3x-navigation-rail__item[aria-current='page']:not([aria-disabled='true']):focus-visible
  .yam3x-navigation-rail__indicator::before {
  background: var(--_yam3x-navigation-rail-color-state-active);
}
.yam3x-navigation-rail__item[aria-current='page']:not([aria-disabled='true']):is(
    :active,
    [data-yam3x-pressed]
  )
  .yam3x-navigation-rail__indicator::before {
  background: var(--_yam3x-navigation-rail-color-state-active);
}
.yam3x-navigation-rail__icon {
  display: grid;
  position: relative;
  z-index: 2;
  place-items: center;
  inline-size: var(--_yam3x-navigation-rail-icon-size);
  block-size: var(--_yam3x-navigation-rail-indicator-height-vertical);
  font-size: var(--_yam3x-navigation-rail-icon-size);
  color: var(--_yam3x-navigation-rail-color-inactive);
}
.yam3x-navigation-rail__icon > * {
  inline-size: var(--_yam3x-navigation-rail-icon-size);
  block-size: var(--_yam3x-navigation-rail-icon-size);
}
.yam3x-navigation-rail__label {
  position: relative;
  z-index: 2;
  color: var(--_yam3x-navigation-rail-color-inactive);
  font-size: var(--_yam3x-navigation-rail-font-size-vertical);
  font-weight: var(--_yam3x-navigation-rail-font-weight-vertical);
  line-height: calc(
    var(--_yam3x-navigation-rail-line-height-vertical) *
      var(--_yam3x-navigation-rail-typescale-line-height)
  );
  letter-spacing: var(--_yam3x-navigation-rail-letter-spacing-vertical);
  text-align: center;
  overflow-wrap: anywhere;
}
.yam3x-navigation-rail__item[aria-current='page'] .yam3x-navigation-rail__icon {
  color: var(--_yam3x-navigation-rail-color-active-icon);
}
.yam3x-navigation-rail__item[aria-current='page'] .yam3x-navigation-rail__label {
  color: var(--_yam3x-navigation-rail-color-active-label-vertical);
}
.yam3x-navigation-rail__item[aria-disabled='true'] .yam3x-navigation-rail__icon {
  color: color-mix(
    in srgb,
    var(--_yam3x-navigation-rail-color-disabled) var(--_yam3x-navigation-rail-disabled-opacity),
    transparent
  );
}
.yam3x-navigation-rail__item[aria-disabled='true'] .yam3x-navigation-rail__label {
  color: color-mix(
    in srgb,
    var(--_yam3x-navigation-rail-color-disabled) var(--_yam3x-navigation-rail-disabled-opacity),
    transparent
  );
}
.yam3x-navigation-rail__badge {
  display: grid;
  position: absolute;
  z-index: 3;
  inset-block-start: var(--_yam3x-navigation-rail-badge-inset-block);
  inset-inline-end: var(--_yam3x-navigation-rail-badge-inset-inline);
  place-items: center;
  min-inline-size: var(--_yam3x-navigation-rail-badge-size);
  block-size: var(--_yam3x-navigation-rail-badge-size);
  padding-inline: calc(
    var(--_yam3x-navigation-rail-badge-padding-inline) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
  border-radius: var(--_yam3x-navigation-rail-badge-shape);
  background: var(--_yam3x-navigation-rail-color-badge);
  color: var(--_yam3x-navigation-rail-color-badge-content);
  font-size: 11px;
  line-height: 1;
}
.yam3x-navigation-rail__badge:empty {
  display: none;
}
.yam3x-navigation-rail__sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__item {
  justify-content: flex-start;
  min-block-size: var(--_yam3x-navigation-rail-item-height-expanded);
  padding-block: 0;
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__content {
  flex-direction: row;
  gap: calc(
    var(--_yam3x-navigation-rail-item-icon-label-space-horizontal) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
  max-inline-size: calc(
    100% - var(--_yam3x-navigation-rail-item-inset-horizontal) -
      var(--_yam3x-navigation-rail-item-inset-horizontal)
  );
  min-block-size: var(--_yam3x-navigation-rail-item-height-expanded);
  padding-inline: calc(
    var(--_yam3x-navigation-rail-item-inset-horizontal) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
  margin-inline: calc(
    var(--_yam3x-navigation-rail-item-inset-horizontal) *
      var(--_yam3x-navigation-rail-density-spacing)
  );
  border-radius: var(--_yam3x-navigation-rail-shape-indicator);
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__indicator {
  inset: 0;
  transform: none;
  inline-size: 100%;
  block-size: auto;
  min-block-size: var(--_yam3x-navigation-rail-item-height-expanded);
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__icon {
  flex: none;
  block-size: 24px;
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__label {
  text-align: start;
  font-size: var(--_yam3x-navigation-rail-font-size-horizontal);
  font-weight: var(--_yam3x-navigation-rail-font-weight-horizontal);
  line-height: calc(
    var(--_yam3x-navigation-rail-line-height-horizontal) *
      var(--_yam3x-navigation-rail-typescale-line-height)
  );
  letter-spacing: var(--_yam3x-navigation-rail-letter-spacing-horizontal);
}
.yam3x-navigation-rail--expanded
  .yam3x-navigation-rail__item[aria-current='page']
  .yam3x-navigation-rail__label {
  color: var(--_yam3x-navigation-rail-color-active-label-horizontal);
}
.yam3x-navigation-rail--expanded .yam3x-navigation-rail__badge {
  position: relative;
  inset: auto;
  flex: none;
}
.yam3x-navigation-rail__children {
  display: flex;
  flex-direction: column;
  margin-inline-start: calc(
    (
        2 * var(--_yam3x-navigation-rail-item-inset-horizontal) +
          var(--_yam3x-navigation-rail-item-icon-label-space-horizontal)
      ) *
      var(--_yam3x-navigation-rail-density-spacing) + var(--_yam3x-navigation-rail-icon-size) - 4px
  );
  margin-block-end: calc(8px * var(--_yam3x-navigation-rail-density-spacing));
  padding-inline-start: calc(4px * var(--_yam3x-navigation-rail-density-spacing));
  border-inline-start: 1px solid var(--_yam3x-navigation-rail-color-divider);
}
.yam3x-navigation-rail__item--child {
  --_yam3x-navigation-rail-shape-indicator: var(--md-sys-shape-corner-small, 8px);
}
.yam3x-navigation-rail--expanded
  .yam3x-navigation-rail__item--child
  .yam3x-navigation-rail__content {
  inline-size: 100%;
  max-inline-size: 100%;
  min-inline-size: 0;
  margin-inline: 0;
  padding-inline: calc(12px * var(--_yam3x-navigation-rail-density-spacing))
    calc(8px * var(--_yam3x-navigation-rail-density-spacing));
  padding-block: calc(8px * var(--_yam3x-navigation-rail-density-spacing));
}
.yam3x-navigation-rail--expanded
  .yam3x-navigation-rail__item--child
  .yam3x-navigation-rail__indicator {
  inset-block: calc(4px * var(--_yam3x-navigation-rail-density-spacing));
  min-block-size: 0;
  opacity: 1;
  clip-path: inset(0 round var(--_yam3x-navigation-rail-shape-indicator));
  transition: none;
}
.yam3x-navigation-rail__item--child:not([aria-current='page']) .yam3x-navigation-rail__indicator {
  background: transparent;
}
.yam3x-navigation-rail__item--child .yam3x-navigation-rail__indicator::before {
  transition: opacity var(--_yam3x-navigation-rail-motion-fast-effects);
}
.yam3x-navigation-rail__indicator .yam3x-ripple-container {
  z-index: 1;
}
.yam3x-navigation-rail--modal {
  position: fixed;
  inset: 0;
  z-index: var(--_yam3x-navigation-rail-layer-z, 1000);
  inline-size: auto;
  block-size: auto;
}
.yam3x-navigation-rail--modal .yam3x-navigation-rail__scrim {
  position: absolute;
  inset: 0;
  background: color-mix(
    in srgb,
    var(--_yam3x-navigation-rail-color-scrim) var(--_yam3x-navigation-rail-scrim-opacity),
    transparent
  );
}
.yam3x-navigation-rail--modal .yam3x-navigation-rail__surface {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: var(--_yam3x-navigation-rail-width-expanded);
  max-inline-size: min(100%, var(--_yam3x-navigation-rail-width-expanded-max));
  box-shadow: var(--_yam3x-navigation-rail-shadow-expanded);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-navigation-rail,
  .yam3x-navigation-rail__indicator {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-navigation-rail__surface {
    background: Canvas;
    color: CanvasText;
  }
  .yam3x-navigation-rail__item {
    color: LinkText;
  }
  .yam3x-navigation-rail__item[aria-current='page'] .yam3x-navigation-rail__indicator {
    border: 2px solid Highlight;
    background: Canvas;
  }
  .yam3x-navigation-rail__item:focus-visible,
  .yam3x-navigation-rail__menu:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-navigation-rail__item[aria-disabled='true'] {
    color: GrayText;
  }
}
</style>
