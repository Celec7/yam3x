<script setup lang="ts">
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import type { MenuItem, MenuPositionX, MenuPositionY, MenuVariant } from './menu.types'

defineOptions({ name: 'MenuPanel' })
const props = defineProps<{
  id: string
  label?: string
  initialFocus?: 'first' | 'last'
  closing: boolean
  items: MenuItem[]
  anchor: HTMLElement
  depth: number
  variant: MenuVariant
  positionX: MenuPositionX
  positionY: MenuPositionY
  checked: string[]
  selected: Record<string, string>
  dense: boolean
  activePanelId: string | null
  hasIconSlot: boolean
  hasTrailingIconSlot: boolean
}>()
const emit = defineEmits<{
  activate: [item: MenuItem, event: MouseEvent]
  activatePanel: [panelId: string]
  dismiss: [restoreFocus: boolean]
  closeSelf: []
  closeComplete: []
}>()
defineSlots<{
  icon?(props: { item: MenuItem }): unknown
  'trailing-icon'?(props: { item: MenuItem }): unknown
}>()
type IndexedMenuItem = { item: MenuItem; index: number }
type MenuGroup = {
  key: string
  entries: IndexedMenuItem[]
  hasGapBefore: boolean
  hasGapAfter: boolean
  firstActionIndex?: number
  lastActionIndex?: number
}
const panel = ref<HTMLElement | null>(null)
const itemElements = ref<Array<HTMLElement | null>>([])
const activeIndex = ref(0)
const isScrollable = ref(false)
const submenuIndex = ref<number | null>(null)
const closingSubmenuIndex = ref<number | null>(null)
const floating = ref<Record<string, string>>({ visibility: 'hidden' })
let stopPositioning: (() => void) | undefined
let directionObserver: MutationObserver | undefined
let focusFrame = 0
let typeahead = ''
let typeTimer = 0
let hoverTimer = 0
let scrollResizeObserver: ResizeObserver | undefined
let scrollMutationObserver: MutationObserver | undefined
const direction = ref<'ltr' | 'rtl'>('ltr')
const rtl = computed(() => direction.value === 'rtl')
const actionIndices = computed(() =>
  props.items.flatMap((item, index) =>
    item.type === 'divider' || item.type === 'label' || item.type === 'gap' ? [] : [index],
  ),
)
const groups = computed<MenuGroup[]>(() => {
  const rawGroups: Array<{
    entries: IndexedMenuItem[]
    hasGapBefore: boolean
    hasGapAfter: boolean
  }> = []
  let entries: IndexedMenuItem[] = []
  let hasGapBefore = false
  const finishGroup = () => {
    if (!entries.length) return
    rawGroups.push({ entries, hasGapBefore, hasGapAfter: false })
    entries = []
    hasGapBefore = false
  }
  props.items.forEach((item, index) => {
    if (item.type === 'gap') {
      finishGroup()
      if (rawGroups.length) {
        rawGroups[rawGroups.length - 1]!.hasGapAfter = true
        hasGapBefore = true
      }
    } else entries.push({ item, index })
  })
  finishGroup()
  return rawGroups.map((group, groupIndex) => {
    const groupActions = group.entries.flatMap(({ item, index }) =>
      item.type === 'divider' || item.type === 'label' ? [] : [index],
    )
    return {
      ...group,
      hasGapAfter: group.hasGapAfter && groupIndex < rawGroups.length - 1,
      key: `${groupIndex}-${group.entries[0]!.item.value}`,
      firstActionIndex: groupIndex === 0 ? groupActions[0] : undefined,
      lastActionIndex:
        groupIndex === rawGroups.length - 1 ? groupActions[groupActions.length - 1] : undefined,
    }
  })
})
const renderedSubmenuIndex = computed(() => submenuIndex.value ?? closingSubmenuIndex.value)
const renderedSubmenuItem = computed(() =>
  renderedSubmenuIndex.value === null ? null : props.items[renderedSubmenuIndex.value],
)
const placement = computed<Placement>(() =>
  props.depth
    ? rtl.value
      ? 'left-start'
      : 'right-start'
    : (`${props.positionY === 'above' ? 'top' : 'bottom'}-${props.positionX === 'before' ? 'end' : 'start'}` as Placement),
)
const submenuPanelId = (index: number) => `${props.id}-submenu-${index}`

function setItemElement(element: Element | null, index: number) {
  itemElements.value[index] = element instanceof HTMLElement ? element : null
}
function isSelected(item: MenuItem) {
  return item.type === 'checkbox'
    ? props.checked.includes(item.value)
    : item.type === 'radio'
      ? props.selected[item.group || 'default'] === item.value
      : false
}
function hasLeadingIcon(item: MenuItem) {
  if (item.type === 'divider' || item.type === 'label' || item.type === 'gap') return false
  if (item.type === 'checkbox' || item.type === 'radio') return true
  return item.leadingIcon ?? props.hasIconSlot
}
function hasTrailingIcon(item: MenuItem) {
  if (item.type === 'divider' || item.type === 'label' || item.type === 'gap' || item.items?.length)
    return false
  return item.trailingIcon ?? props.hasTrailingIconSlot
}
function activatePanel() {
  emit('activatePanel', props.id)
}
function itemRole(item: MenuItem) {
  return item.type === 'checkbox'
    ? 'menuitemcheckbox'
    : item.type === 'radio'
      ? 'menuitemradio'
      : 'menuitem'
}
function focusItem(index: number) {
  activeIndex.value = index
  itemElements.value[index]?.focus({ preventScroll: true })
  itemElements.value[index]?.scrollIntoView({ block: 'nearest' })
}
function openSubmenu(index: number) {
  window.clearTimeout(hoverTimer)
  if (props.items[index]?.disabled || !props.items[index]?.items?.length) return
  closingSubmenuIndex.value = null
  submenuIndex.value = index
  activeIndex.value = index
}
function closeSubmenu() {
  const index = submenuIndex.value
  if (index === null) return
  const previous = index === null ? null : itemElements.value[index]
  submenuIndex.value = null
  closingSubmenuIndex.value = index
  activatePanel()
  if (index !== null)
    requestAnimationFrame(() => {
      if (previous) focusItem(index)
    })
}
function finishSubmenuClose(index: number | null) {
  if (index !== null && closingSubmenuIndex.value === index) closingSubmenuIndex.value = null
}
function onPanelAnimationEnd(event: AnimationEvent) {
  if (!props.closing || event.target !== panel.value || event.animationName !== 'yam3x-menu-exit')
    return
  emit('closeComplete')
}
watch(
  () => props.closing,
  async (closing, wasClosing) => {
    if (!closing) {
      if (!wasClosing) return
      await nextTick()
      const focusLast =
        props.initialFocus === 'last' || props.anchor.hasAttribute('data-yam3x-menu-focus-last')
      props.anchor.removeAttribute('data-yam3x-menu-focus-last')
      const indices = actionIndices.value
      if (indices.length) focusItem(focusLast ? indices[indices.length - 1]! : indices[0]!)
      else panel.value?.focus({ preventScroll: true })
      return
    }
    await nextTick()
    if (!panel.value) return
    const styles = getComputedStyle(panel.value)
    if (styles.animationName === 'none' || styles.animationDuration === '0s') emit('closeComplete')
  },
  { flush: 'post', immediate: true },
)
function updateScrollable() {
  if (!panel.value) return
  panel.value.classList.add('yam3x-menu__panel--measuring-gapless')
  const next = panel.value.scrollHeight > panel.value.clientHeight + 1
  panel.value.classList.remove('yam3x-menu__panel--measuring-gapless')
  isScrollable.value = next
}
function onItemMouseenter(item: MenuItem, index: number) {
  window.clearTimeout(hoverTimer)
  if (item.items?.length && !item.disabled)
    hoverTimer = window.setTimeout(() => openSubmenu(index), 500)
  else closeSubmenu()
}

function onItemFocus(index: number) {
  activeIndex.value = index
  if (submenuIndex.value !== index) closeSubmenu()
}
function onClick(item: MenuItem, index: number, event: MouseEvent) {
  window.clearTimeout(hoverTimer)
  if (item.disabled) {
    event.preventDefault()
    return
  }
  if (item.items?.length) {
    event.preventDefault()
    openSubmenu(index)
    return
  }
  emit('activate', item, event)
}
function onKeydown(event: KeyboardEvent) {
  if ((event.target as HTMLElement).closest('.yam3x-menu__panel') !== panel.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    if (props.depth) emit('closeSelf')
    else emit('dismiss', true)
    return
  }
  if (event.key === 'Tab') {
    emit('dismiss', false)
    return
  }
  if (event.target === panel.value) {
    const items = actionIndices.value
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && items.length) {
      event.preventDefault()
      focusItem(event.key === 'ArrowDown' ? items[0] : items[items.length - 1])
    }
    return
  }
  const rawIndex = (event.target as HTMLElement)
    .closest('[data-menu-index]')
    ?.getAttribute('data-menu-index')
  if (rawIndex === null || rawIndex === undefined) return
  const index = Number(rawIndex)
  const indices = actionIndices.value
  if (!indices.length) return
  const current = indices.indexOf(index)
  const forward = rtl.value ? 'ArrowLeft' : 'ArrowRight'
  const backward = rtl.value ? 'ArrowRight' : 'ArrowLeft'
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.stopPropagation()
    event.preventDefault()
    closeSubmenu()
    focusItem(
      indices[(current + (event.key === 'ArrowDown' ? 1 : -1) + indices.length) % indices.length],
    )
  } else if (event.key === 'Home' || event.key === 'End') {
    event.stopPropagation()
    event.preventDefault()
    closeSubmenu()
    focusItem(event.key === 'Home' ? indices[0] : indices[indices.length - 1])
  } else if (event.key === forward) {
    if (props.items[index]?.items?.length) {
      event.preventDefault()
      event.stopPropagation()
      openSubmenu(index)
    }
  } else if (event.key === backward) {
    if (props.depth) {
      event.preventDefault()
      event.stopPropagation()
      emit('closeSelf')
    }
  } else if (event.key === ' ' && event.target instanceof HTMLAnchorElement) {
    event.preventDefault()
    event.target.click()
  } else if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    event.key !== ' '
  ) {
    typeahead += event.key.toLocaleLowerCase()
    window.clearTimeout(typeTimer)
    typeTimer = window.setTimeout(() => {
      typeahead = ''
    }, 700)
    const ordered = [...indices.slice(current + 1), ...indices.slice(0, current + 1)]
    const next = ordered.find((value) =>
      props.items[value]?.label?.toLocaleLowerCase().startsWith(typeahead),
    )
    if (next !== undefined) {
      event.preventDefault()
      focusItem(next)
    }
  }
}
async function updatePosition() {
  if (!panel.value) return
  const {
    x,
    y,
    placement: resolvedPlacement,
  } = await computePosition(props.anchor, panel.value, {
    strategy: 'fixed',
    placement: placement.value,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, elements }) {
          const configuredMaxHeight =
            getComputedStyle(elements.floating)
              .getPropertyValue('--_yam3x-menu-container-max-height')
              .trim() || '280px'
          elements.floating.style.maxHeight = `min(${configuredMaxHeight}, ${availableHeight}px)`
        },
      }),
    ],
  })
  floating.value = {
    left: `${x}px`,
    top: `${y}px`,
    visibility: 'visible',
    '--_yam3x-menu-transform-origin': resolvedPlacement.startsWith('top') ? 'bottom' : 'top',
    '--_yam3x-menu-collapse-clip': resolvedPlacement.startsWith('top')
      ? 'inset(100% 0 0 0 round 4px)'
      : 'inset(0 0 100% 0 round 4px)',
  }
}
onMounted(() => {
  direction.value = getComputedStyle(props.anchor).direction === 'rtl' ? 'rtl' : 'ltr'
  directionObserver = new MutationObserver(() => {
    direction.value = getComputedStyle(props.anchor).direction === 'rtl' ? 'rtl' : 'ltr'
  })
  for (
    let ancestor: HTMLElement | null = props.anchor;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    directionObserver.observe(ancestor, {
      attributes: true,
      attributeFilter: ['dir', 'class', 'style'],
    })
  }
  const focusLast =
    props.initialFocus === 'last' || props.anchor.hasAttribute('data-yam3x-menu-focus-last')
  props.anchor.removeAttribute('data-yam3x-menu-focus-last')
  if (actionIndices.value.length)
    focusFrame = requestAnimationFrame(() =>
      focusItem(
        focusLast ? actionIndices.value[actionIndices.value.length - 1] : actionIndices.value[0],
      ),
    )
  else focusFrame = requestAnimationFrame(() => panel.value?.focus({ preventScroll: true }))
  if (panel.value) {
    if (typeof ResizeObserver !== 'undefined') {
      scrollResizeObserver = new ResizeObserver(updateScrollable)
      scrollResizeObserver.observe(panel.value)
      for (const child of Array.from(panel.value.children)) scrollResizeObserver.observe(child)
    }
    scrollMutationObserver = new MutationObserver(() => {
      for (const child of Array.from(panel.value?.children ?? []))
        scrollResizeObserver?.observe(child)
      updateScrollable()
    })
    scrollMutationObserver.observe(panel.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    window.addEventListener('resize', updateScrollable)
    updateScrollable()
    stopPositioning = autoUpdate(props.anchor, panel.value, () => {
      void updatePosition()
    })
  }
})
onBeforeUnmount(() => {
  stopPositioning?.()
  directionObserver?.disconnect()
  scrollResizeObserver?.disconnect()
  scrollMutationObserver?.disconnect()
  window.removeEventListener('resize', updateScrollable)
  cancelAnimationFrame(focusFrame)
  window.clearTimeout(typeTimer)
  window.clearTimeout(hoverTimer)
})
watch(
  () => props.items,
  async () => {
    if (!actionIndices.value.includes(activeIndex.value))
      activeIndex.value = actionIndices.value[0] ?? 0
    if (submenuIndex.value !== null && !props.items[submenuIndex.value]?.items?.length) {
      submenuIndex.value = null
      closingSubmenuIndex.value = null
    }
    await nextTick()
    updateScrollable()
  },
)
</script>

<template>
  <div
    :id="id"
    ref="panel"
    class="yam3x-menu__panel"
    :class="{
      'yam3x-menu__panel--vibrant': variant === 'vibrant',
      'yam3x-menu__panel--dense': dense,
      'yam3x-menu__panel--submenu': depth > 0,
      'yam3x-menu__panel--active': activePanelId === id || closing,
      'yam3x-menu__panel--inactive': activePanelId !== id && !closing,
      'yam3x-menu__panel--scrollable': isScrollable,
      'yam3x-menu__panel--has-gaps': groups.some((group) => group.hasGapAfter),
      'yam3x-menu__panel--closing': closing,
    }"
    role="menu"
    :aria-label="label"
    :aria-labelledby="depth ? anchor.id : undefined"
    tabindex="-1"
    :aria-hidden="closing || undefined"
    :inert="closing"
    :style="floating"
    @keydown="onKeydown"
    @focusin="activatePanel"
    @mouseenter="activatePanel"
    @animationend="onPanelAnimationEnd"
  >
    <div
      v-for="group in groups"
      :key="group.key"
      class="yam3x-menu__group"
      :class="{
        'yam3x-menu__group--separated': !isScrollable && (group.hasGapBefore || group.hasGapAfter),
      }"
    >
      <template
        v-for="{ item, index } in group.entries"
        :key="item.value"
      >
        <div
          v-if="item.type === 'divider'"
          class="yam3x-menu__divider"
          role="separator"
        />
        <div
          v-else-if="item.type === 'label'"
          class="yam3x-menu__group-label"
          role="presentation"
        >
          {{ item.label }}
        </div>
        <component
          :is="item.href && !item.items?.length ? 'a' : 'button'"
          v-else-if="item.type !== 'gap'"
          :id="id + '-item-' + index"
          :ref="(element: unknown) => setItemElement(element as Element | null, index)"
          v-ripple
          class="yam3x-menu__item"
          :class="{
            'yam3x-menu__item--selected': isSelected(item),
            'yam3x-menu__item--submenu-open': submenuIndex === index,
            'yam3x-menu__item--first': index === group.firstActionIndex,
            'yam3x-menu__item--last': index === group.lastActionIndex,
          }"
          :data-menu-index="index"
          data-yam3x-ripple
          :type="item.href && !item.items?.length ? undefined : 'button'"
          :href="item.disabled ? undefined : item.href"
          :target="item.disabled ? undefined : item.target"
          :rel="item.disabled ? undefined : item.rel"
          :download="item.disabled ? undefined : item.download"
          :role="itemRole(item)"
          :tabindex="activeIndex === index ? 0 : -1"
          :aria-disabled="item.disabled || undefined"
          :aria-checked="
            item.type === 'checkbox' || item.type === 'radio' ? isSelected(item) : undefined
          "
          :aria-haspopup="item.items?.length ? 'menu' : undefined"
          :aria-expanded="item.items?.length ? submenuIndex === index : undefined"
          :aria-controls="item.items?.length ? submenuPanelId(index) : undefined"
          @focus="onItemFocus(index)"
          @mouseenter="onItemMouseenter(item, index)"
          @click="onClick(item, index, $event)"
        >
          <span
            v-if="hasLeadingIcon(item)"
            class="yam3x-menu__leading"
            aria-hidden="true"
            ><Icon
              v-if="isSelected(item)"
              class="yam3x-menu__check"
              name="check" /><slot
              v-else
              name="icon"
              :item="item"
          /></span>
          <span class="yam3x-menu__body"
            ><span class="yam3x-menu__label">{{ item.label }}</span
            ><span
              v-if="item.supportingText"
              class="yam3x-menu__supporting"
              >{{ item.supportingText }}</span
            ></span
          >
          <span
            v-if="item.badge !== undefined"
            class="yam3x-menu__badge"
            aria-hidden="true"
            >{{ item.badge }}</span
          >
          <span
            v-if="item.trailingText || item.shortcut"
            class="yam3x-menu__trailing-text"
            >{{ item.trailingText || item.shortcut }}</span
          >
          <span
            v-if="item.items?.length"
            class="yam3x-menu__chevron"
            aria-hidden="true"
            ><Icon :name="rtl ? 'chevron_left' : 'chevron_right'"
          /></span>
          <span
            v-else-if="hasTrailingIcon(item)"
            class="yam3x-menu__trailing-icon"
            aria-hidden="true"
            ><slot
              name="trailing-icon"
              :item="item"
          /></span>
        </component>
      </template>
      <div
        v-if="group.hasGapAfter"
        class="yam3x-menu__gap"
        aria-hidden="true"
      />
      <div
        v-if="group.hasGapAfter"
        class="yam3x-menu__gap-divider"
        :role="isScrollable ? 'separator' : undefined"
        :aria-hidden="isScrollable ? undefined : 'true'"
      />
    </div>
  </div>
  <MenuPanel
    v-if="
      renderedSubmenuIndex !== null &&
      renderedSubmenuItem?.items?.length &&
      itemElements[renderedSubmenuIndex]
    "
    :id="submenuPanelId(renderedSubmenuIndex)"
    :items="renderedSubmenuItem.items"
    :anchor="itemElements[renderedSubmenuIndex]!"
    :depth="depth + 1"
    :variant="variant"
    :position-x="positionX"
    :position-y="positionY"
    :checked="checked"
    :selected="selected"
    :dense="dense"
    :active-panel-id="activePanelId"
    :closing="closing || closingSubmenuIndex === renderedSubmenuIndex"
    :has-icon-slot="hasIconSlot"
    :has-trailing-icon-slot="hasTrailingIconSlot"
    initial-focus="first"
    @activate="(item, event) => emit('activate', item, event)"
    @activate-panel="(panelId) => emit('activatePanel', panelId)"
    @dismiss="(restore) => emit('dismiss', restore)"
    @close-self="closeSubmenu"
    @close-complete="finishSubmenuClose(renderedSubmenuIndex)"
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
</template>
