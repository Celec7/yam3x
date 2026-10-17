<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { trapTabKey } from '../_shared/focus-trap'
import type { DrawerMode, DrawerPanelRole, DrawerToggleSlotProps } from './drawer-container.types'
import './drawer-container.css'

const props = withDefaults(
  defineProps<{
    startMode?: DrawerMode
    endMode?: DrawerMode
    autoCompactBreakpoint?: number
    autoBreakpoint?: number
    width?: string
    maxWidth?: string
    startLabel?: string
    endLabel?: string
    startRole?: DrawerPanelRole
    endRole?: DrawerPanelRole
    closeLabel?: string
    startDivider?: boolean
    endDivider?: boolean
  }>(),
  {
    startMode: 'side',
    endMode: 'side',
    autoCompactBreakpoint: 600,
    autoBreakpoint: 840,
    width: '360px',
    maxWidth: '360px',
    startLabel: 'Start panel',
    endLabel: 'End panel',
    closeLabel: 'Close panel',
    startDivider: false,
    endDivider: false,
  },
)
const startOpen = defineModel<boolean>('open', { default: false })
const endOpen = defineModel<boolean>('endOpen', { default: false })
const emit = defineEmits<{
  change: [edge: 'start' | 'end', open: boolean, reason: 'toggle' | 'dismiss']
}>()
defineSlots<{
  default?: () => unknown
  start?: () => unknown
  end?: () => unknown
  'start-toggle'?: (props: DrawerToggleSlotProps) => unknown
  'end-toggle'?: (props: DrawerToggleSlotProps) => unknown
}>()
const slots = useSlots()
const id = `yam3x-drawer-${useId()}`
const frame = ref<HTMLElement | null>(null)
const startPanel = ref<HTMLElement | null>(null)
const endPanel = ref<HTMLElement | null>(null)
const startTrigger = ref<HTMLElement | null>(null)
const endTrigger = ref<HTMLElement | null>(null)
const measuredWidth = ref(0)
const dragging = ref<{
  edge: 'start' | 'end'
  pointerId: number
  x: number
  y: number
  currentX: number
} | null>(null)
const startOffset = ref(0)
const endOffset = ref(0)
let observer: ResizeObserver | undefined

function resolveMode(mode: DrawerMode): Exclude<DrawerMode, 'auto'> {
  if (mode !== 'auto') return mode
  if (measuredWidth.value < props.autoCompactBreakpoint) return 'overlay'
  if (measuredWidth.value < props.autoBreakpoint) return 'push'
  return 'side'
}
const startMode = computed(() => resolveMode(props.startMode))
const endMode = computed(() => resolveMode(props.endMode))
const hasStart = computed(() => Boolean(slots.start))
const hasEnd = computed(() => Boolean(slots.end))
const hasOverlaySurface = computed(
  () =>
    (hasStart.value && (props.startMode === 'overlay' || props.startMode === 'auto')) ||
    (hasEnd.value && (props.endMode === 'overlay' || props.endMode === 'auto')),
)
const showStart = computed(() => hasStart.value && (startMode.value === 'side' || startOpen.value))
const showEnd = computed(() => hasEnd.value && (endMode.value === 'side' || endOpen.value))
const startInFlow = computed(() => showStart.value && startMode.value !== 'overlay')
const endInFlow = computed(() => showEnd.value && endMode.value !== 'overlay')
const startModal = computed(() => showStart.value && startMode.value === 'overlay')
const endModal = computed(() => showEnd.value && endMode.value === 'overlay')
const hasModal = computed(() => startModal.value || endModal.value)
const controlsStyle = computed(
  () =>
    ({
      '--_yam3x-drawer-prop-width': props.width,
      '--_yam3x-drawer-prop-max-width': props.maxWidth,
      '--_yam3x-drawer-start-track': startInFlow.value ? 'var(--_yam3x-drawer-track-width)' : '0px',
      '--_yam3x-drawer-end-track': endInFlow.value ? 'var(--_yam3x-drawer-track-width)' : '0px',
      '--_yam3x-drawer-track-width': trackWidth.value,
      '--_yam3x-drawer-start-drag': `${startOffset.value}px`,
      '--_yam3x-drawer-end-drag': `${endOffset.value}px`,
    }) as CSSProperties,
)
const flowDrawerCount = computed(() => Number(startInFlow.value) + Number(endInFlow.value))
const trackWidth = computed(() => {
  if (!flowDrawerCount.value) return props.width
  if (!measuredWidth.value)
    return 'min(var(--yam3x-drawer-container-width, var(--_yam3x-drawer-prop-width, 360px)), var(--yam3x-drawer-container-max-width, var(--_yam3x-drawer-prop-max-width, 360px)))'
  const cap = Math.max(0, (measuredWidth.value - 320) / flowDrawerCount.value)
  return `min(var(--yam3x-drawer-container-width, var(--_yam3x-drawer-prop-width, 360px)), var(--yam3x-drawer-container-max-width, var(--_yam3x-drawer-prop-max-width, 360px)), ${cap}px)`
})

function resolvePanel(edge: 'start' | 'end'): HTMLElement | null {
  return edge === 'start' ? startPanel.value : endPanel.value
}
function setOpen(
  edge: 'start' | 'end',
  value: boolean,
  reason: 'toggle' | 'dismiss',
  trigger?: HTMLElement | null,
): void {
  if (edge === 'start') {
    if (trigger) startTrigger.value = trigger
    if (startOpen.value === value) return
    startOpen.value = value
  } else {
    if (trigger) endTrigger.value = trigger
    if (endOpen.value === value) return
    endOpen.value = value
  }
  emit('change', edge, value, reason)
}
function toggle(edge: 'start' | 'end', event?: Event): void {
  if ((edge === 'start' ? startMode.value : endMode.value) === 'side') return
  const target = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  setOpen(edge, edge === 'start' ? !startOpen.value : !endOpen.value, 'toggle', target)
}
function slotProps(edge: 'start' | 'end'): DrawerToggleSlotProps {
  return {
    expanded:
      edge === 'start'
        ? startMode.value === 'side' || startOpen.value
        : endMode.value === 'side' || endOpen.value,
    controls: `${id}-${edge}`,
    toggle: (event?: Event) => toggle(edge, event),
  }
}
function focusFirst(edge: 'start' | 'end'): void {
  const panel = resolvePanel(edge)
  if (!panel) return
  const target =
    panel.querySelector<HTMLElement>('[data-yam3x-drawer-initial-focus]') ??
    panel.querySelector<HTMLElement>(
      'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
    )
  ;(target ?? panel).focus({ preventScroll: true })
}
function restoreFocus(edge: 'start' | 'end'): void {
  const original = edge === 'start' ? startTrigger.value : endTrigger.value
  const canRestoreOriginal =
    original?.isConnected &&
    original.getClientRects().length > 0 &&
    !original.closest('[hidden],[inert],[aria-hidden="true"]')
  const fallback = frame.value?.querySelector<HTMLElement>(
    `.yam3x-drawer__toggles [aria-controls="${id}-${edge}"]`,
  )
  ;(canRestoreOriginal ? original : fallback)?.focus({ preventScroll: true })
}
function focusTrap(event: KeyboardEvent, edge: 'start' | 'end'): void {
  if (event.key !== 'Tab') return
  const panel = resolvePanel(edge)
  if (!panel) return
  trapTabKey(event, panel)
}
function dismiss(edge: 'start' | 'end'): void {
  setOpen(edge, false, 'dismiss')
}
function keydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !hasModal.value) return
  event.preventDefault()
  event.stopPropagation()
  if (endModal.value) dismiss('end')
  else dismiss('start')
}
function onScrimClick(): void {
  if (endModal.value) dismiss('end')
  else if (startModal.value) dismiss('start')
}
function beginDrag(event: PointerEvent, edge: 'start' | 'end'): void {
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
  dragging.value = {
    edge,
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    currentX: event.clientX,
  }
  window.addEventListener('pointermove', moveDrag, true)
  window.addEventListener('pointerup', endDrag, true)
  window.addEventListener('pointercancel', cancelDrag, true)
}
function moveDrag(event: PointerEvent): void {
  const session = dragging.value
  if (!session || session.pointerId !== event.pointerId) return
  const dx = event.clientX - session.x
  const dy = event.clientY - session.y
  if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return
  session.currentX = event.clientX
  const rtl = frame.value ? getComputedStyle(frame.value).direction === 'rtl' : false
  const logicalTowardEdge = (session.edge === 'start' ? -dx : dx) * (rtl ? -1 : 1)
  const limit = resolvePanel(session.edge)?.getBoundingClientRect().width ?? 0
  const offset = Math.max(0, Math.min(limit, logicalTowardEdge))
  if (session.edge === 'start') startOffset.value = offset
  else endOffset.value = offset
  event.preventDefault()
}
function removeDragListeners(): void {
  window.removeEventListener('pointermove', moveDrag, true)
  window.removeEventListener('pointerup', endDrag, true)
  window.removeEventListener('pointercancel', cancelDrag, true)
}
function endDrag(event: PointerEvent): void {
  const session = dragging.value
  if (!session || session.pointerId !== event.pointerId) return
  const offset = session.edge === 'start' ? startOffset.value : endOffset.value
  const width = resolvePanel(session.edge)?.getBoundingClientRect().width ?? 1
  const shouldClose = offset > Math.min(96, width * 0.35)
  if (session.edge === 'start') startOffset.value = 0
  else endOffset.value = 0
  dragging.value = null
  removeDragListeners()
  if (shouldClose) dismiss(session.edge)
}
function cancelDrag(event: PointerEvent): void {
  const session = dragging.value
  if (!session || session.pointerId !== event.pointerId) return
  if (session.edge === 'start') startOffset.value = 0
  else endOffset.value = 0
  dragging.value = null
  removeDragListeners()
}

watch(
  startModal,
  async (modal, previous) => {
    if (modal && !previous) {
      if (document.activeElement instanceof HTMLElement) startTrigger.value = document.activeElement
      await nextTick()
      focusFirst('start')
    }
    if (!modal && previous) {
      await nextTick()
      if (!showStart.value) restoreFocus('start')
    }
  },
  { immediate: true },
)
watch(
  endModal,
  async (modal, previous) => {
    if (modal && !previous) {
      if (document.activeElement instanceof HTMLElement) endTrigger.value = document.activeElement
      await nextTick()
      focusFirst('end')
    }
    if (!modal && previous) {
      await nextTick()
      if (!showEnd.value) restoreFocus('end')
    }
  },
  { immediate: true },
)
watch(
  [startOpen, endOpen, startMode, endMode],
  (
    [start, end, startPresentation, endPresentation],
    [oldStart, oldEnd, oldStartPresentation, oldEndPresentation],
  ) => {
    if (!start || !end || startPresentation === 'side' || endPresentation === 'side') return
    if (start !== oldStart) endOpen.value = false
    else if (end !== oldEnd) startOpen.value = false
    else if (startPresentation !== oldStartPresentation) endOpen.value = false
    else if (endPresentation !== oldEndPresentation) startOpen.value = false
  },
)
onMounted(() => {
  if (!frame.value) return
  const measure = () => {
    measuredWidth.value = frame.value?.getBoundingClientRect().width ?? 0
  }
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(frame.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  removeDragListeners()
})
</script>

<template>
  <div
    ref="frame"
    class="yam3x-drawer"
    :style="controlsStyle"
    @keydown="keydown"
  >
    <aside
      v-if="hasStart"
      :id="`${id}-start`"
      ref="startPanel"
      class="yam3x-drawer__panel yam3x-drawer__panel--start"
      :class="[
        `yam3x-drawer__panel--${startMode}`,
        {
          'yam3x-drawer__panel--open': showStart,
          'yam3x-drawer__panel--dragging': dragging?.edge === 'start',
        },
      ]"
      :role="startModal ? 'dialog' : startRole"
      :aria-modal="startModal && showStart ? 'true' : undefined"
      :aria-label="startLabel"
      :aria-hidden="!showStart"
      :inert="!showStart"
      :data-divider="startDivider || undefined"
      tabindex="-1"
      @pointerdown="startModal && beginDrag($event, 'start')"
      @keydown="startModal && focusTrap($event, 'start')"
    >
      <slot name="start" />
    </aside>
    <div
      class="yam3x-drawer__content"
      :inert="hasModal"
      :aria-hidden="hasModal || undefined"
    >
      <div
        v-if="
          ($slots['start-toggle'] && startMode !== 'side') ||
          ($slots['end-toggle'] && endMode !== 'side')
        "
        class="yam3x-drawer__toggles"
      >
        <slot
          v-if="$slots['start-toggle'] && startMode !== 'side'"
          name="start-toggle"
          v-bind="slotProps('start')"
        />
        <slot
          v-if="$slots['end-toggle'] && endMode !== 'side'"
          name="end-toggle"
          v-bind="slotProps('end')"
        />
      </div>
      <div class="yam3x-drawer__content-body"><slot /></div>
    </div>
    <aside
      v-if="hasEnd"
      :id="`${id}-end`"
      ref="endPanel"
      class="yam3x-drawer__panel yam3x-drawer__panel--end"
      :class="[
        `yam3x-drawer__panel--${endMode}`,
        {
          'yam3x-drawer__panel--open': showEnd,
          'yam3x-drawer__panel--dragging': dragging?.edge === 'end',
        },
      ]"
      :role="endModal ? 'dialog' : endRole"
      :aria-modal="endModal && showEnd ? 'true' : undefined"
      :aria-label="endLabel"
      :aria-hidden="!showEnd"
      :inert="!showEnd"
      :data-divider="endDivider || undefined"
      tabindex="-1"
      @pointerdown="endModal && beginDrag($event, 'end')"
      @keydown="endModal && focusTrap($event, 'end')"
    >
      <slot name="end" />
    </aside>
    <button
      v-if="hasOverlaySurface"
      class="yam3x-drawer__scrim"
      :class="{ 'yam3x-drawer__scrim--active': hasModal }"
      type="button"
      :aria-label="closeLabel"
      :aria-hidden="!hasModal"
      :inert="!hasModal"
      @click="onScrimClick"
      @wheel.prevent
      @touchmove.prevent
    />
  </div>
</template>
