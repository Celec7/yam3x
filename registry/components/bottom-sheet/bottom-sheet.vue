<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useId,
  useSlots,
  watch,
} from 'vue'
import { Dialog } from '@ark-ui/vue/dialog'
import { bottomSheetCloseKey } from './bottom-sheet.context'
import Icon from '../icon/icon.vue'
import type { BottomSheetDetent, BottomSheetVariant } from './bottom-sheet.types'
import './bottom-sheet.css'

type DragSession = {
  y: number
  height: number
  pointerId: number
  currentY: number
  samples: Array<{ y: number; time: number }>
}

const props = withDefaults(
  defineProps<{
    variant?: BottomSheetVariant
    label?: string
    maxWidth?: string
    detents?: BottomSheetDetent[]
    hideable?: boolean
    handle?: boolean
    handleLabel?: string
    closeLabel?: string
    collapseLabel?: string
  }>(),
  {
    variant: 'standard',
    label: undefined,
    maxWidth: '640px',
    detents: undefined,
    hideable: false,
    handle: false,
    handleLabel: 'Resize sheet',
    closeLabel: 'Close sheet',
    collapseLabel: 'Collapse sheet',
  },
)
const open = defineModel<boolean>('open', { default: false })
const detent = defineModel<BottomSheetDetent>('detent')
const emit = defineEmits<{
  opening: [event: Event]
  opened: [event: Event]
  closing: [event: Event]
  closed: [event: Event]
  cancel: [event: Event]
}>()
const slots = useSlots()

const id = `yam3x-bottom-sheet-${useId()}`
const headerId = `${id}-heading`
const accessibleLabel = computed(() => props.label || (!slots.header ? 'Bottom sheet' : undefined))
const panel = ref<HTMLElement | null>(null)
const returnFocus = ref<HTMLElement | null>(null)
const dragStart = ref<DragSession | null>(null)
const isDragging = ref(false)
const currentHeight = ref(0)
const suppressNextClick = ref(false)
let resizeObserver: ResizeObserver | undefined
let contentObserver: MutationObserver | undefined
let hasModalOpened = false
let expectedTransition: boolean | undefined
let dragFrame: number | undefined
const resolvedDetents = computed<BottomSheetDetent[]>(() =>
  props.detents?.length
    ? props.detents
    : props.variant === 'modal'
      ? ['partially-expanded', 'expanded']
      : ['fit', 'expanded'],
)
const activeDetent = computed<BottomSheetDetent>(() => {
  const requested = detent.value
  if (requested !== undefined && resolvedDetents.value.includes(requested)) return requested
  return resolvedDetents.value[0] ?? (props.variant === 'modal' ? 'partially-expanded' : 'fit')
})
const hasResizeControl = computed(() => !props.handle && resolvedDetents.value.length > 1)
const fullHeight = () => Math.max(0, window.innerHeight - (window.innerWidth > 640 ? 56 : 72))
const isFullHeight = computed(
  () => typeof window !== 'undefined' && detentHeight(activeDetent.value) >= fullHeight() - 1,
)

function detentHeight(value: BottomSheetDetent): number {
  const max = fullHeight()
  if (typeof value === 'number') return Math.max(0, Math.min(max, value))
  if (value === 'expanded') return max
  if (value === 'partially-expanded') return Math.min(max, window.innerHeight * 0.5)
  if (value === 'collapsed') {
    const peek = panel.value
      ? Number.parseFloat(
          getComputedStyle(panel.value).getPropertyValue('--_yam3x-bottom-sheet-peek-height'),
        )
      : 0
    return Math.min(max, Number.isFinite(peek) && peek > 0 ? peek : 96)
  }
  if (value === 'fit') {
    if (!panel.value) return max
    const body = panel.value.querySelector<HTMLElement>('.yam3x-bottom-sheet__body')
    const header = panel.value.querySelector<HTMLElement>('.yam3x-bottom-sheet__header')
    const handle = panel.value.querySelector<HTMLElement>('.yam3x-bottom-sheet__handle-row')
    const footer = panel.value.querySelector<HTMLElement>('.yam3x-bottom-sheet__resize-control')
    const bodyStyle = body ? getComputedStyle(body) : null
    const bodyPadding = bodyStyle
      ? Number.parseFloat(bodyStyle.paddingBlockStart) +
        Number.parseFloat(bodyStyle.paddingBlockEnd)
      : 0
    const bodyContent = body
      ? [...body.childNodes].reduce((sum, child) => {
          if (child instanceof HTMLElement) {
            const style = getComputedStyle(child)
            return (
              sum +
              child.getBoundingClientRect().height +
              Number.parseFloat(style.marginBlockStart) +
              Number.parseFloat(style.marginBlockEnd)
            )
          }
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            const range = document.createRange()
            range.selectNode(child)
            return sum + range.getBoundingClientRect().height
          }
          return sum
        }, bodyPadding)
      : 0
    return Math.min(
      max,
      bodyContent +
        (header?.offsetHeight ?? 0) +
        (handle?.offsetHeight ?? 0) +
        (footer?.offsetHeight ?? 0),
    )
  }
  if (value.endsWith('%'))
    return Math.min(max, (window.innerHeight * Number.parseFloat(value)) / 100)
  return Math.min(max, Number.parseFloat(value))
}

function setPanelElement(value: unknown): void {
  const candidate =
    value && typeof value === 'object' && '$el' in value ? (value as { $el: unknown }).$el : value
  panel.value =
    typeof HTMLElement !== 'undefined' && candidate instanceof HTMLElement ? candidate : null
}

function syncHeight(): void {
  if (isDragging.value) return
  const height = detentHeight(activeDetent.value)
  currentHeight.value =
    props.variant === 'modal' && !detent.value ? Math.min(height, window.innerHeight * 0.5) : height
}

function initialModalDetent(): BottomSheetDetent {
  const limit = window.innerHeight * 0.5
  const initial = resolvedDetents.value
    .filter((candidate) => detentHeight(candidate) <= limit)
    .reduce<BottomSheetDetent | undefined>(
      (best, candidate) =>
        best === undefined || detentHeight(candidate) > detentHeight(best) ? candidate : best,
      undefined,
    )
  return initial ?? resolvedDetents.value[0] ?? 'partially-expanded'
}

function requestOpen(next: boolean, reason: 'trigger' | 'dismiss' = 'trigger'): boolean {
  if (next === open.value || next === expectedTransition) return false
  if (next && props.variant === 'modal' && document.activeElement instanceof HTMLElement)
    returnFocus.value = document.activeElement
  if (!next && reason === 'dismiss') {
    const cancel = new Event('cancel', { cancelable: true })
    emit('cancel', cancel)
    if (cancel.defaultPrevented) return false
  }
  const event = new Event(next ? 'opening' : 'closing', { cancelable: true })
  if (next) emit('opening', event)
  else emit('closing', event)
  if (event.defaultPrevented) {
    if (next) returnFocus.value = null
    return false
  }
  if (next && props.variant === 'modal' && !hasModalOpened && detent.value === undefined)
    detent.value = initialModalDetent()
  expectedTransition = next
  open.value = next
  void nextTick(() => {
    if (expectedTransition === next && open.value !== next) expectedTransition = undefined
  })
  return true
}

function close(): boolean {
  return requestOpen(false, 'dismiss')
}
provide(bottomSheetCloseKey, close)

function requestDetent(next: BottomSheetDetent): void {
  if (next === activeDetent.value) {
    syncHeight()
    return
  }
  detent.value = next
  syncHeight()
  if (next === 'collapsed' && props.hideable) close()
}

function cycleDetent(): void {
  const choices = resolvedDetents.value
  const index = choices.findIndex((value) => value === activeDetent.value)
  if (index < 0) {
    requestDetent(choices[0])
    return
  }
  if (index >= choices.length - 1) {
    if (props.hideable) close()
    return
  }
  requestDetent(choices[index + 1])
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.variant === 'standard' && open.value) {
    event.preventDefault()
    close()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const index = resolvedDetents.value.findIndex((value) => value === activeDetent.value)
    if (index < resolvedDetents.value.length - 1) requestDetent(resolvedDetents.value[index + 1])
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    const index = resolvedDetents.value.findIndex((value) => value === activeDetent.value)
    if (index > 0) requestDetent(resolvedDetents.value[index - 1])
  }
}

function onModalTab(event: KeyboardEvent): void {
  if (props.variant !== 'modal' || !open.value || event.key !== 'Tab') return
  const content = event.currentTarget as HTMLElement
  const selector =
    'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  const tabbable = [...content.querySelectorAll<HTMLElement>(selector)].filter(
    (element) =>
      !element.closest('[hidden],[inert],[aria-hidden="true"]') &&
      element.getClientRects().length > 0,
  )
  const first = tabbable[0]
  const last = tabbable[tabbable.length - 1]
  if (!first || !last) {
    event.preventDefault()
    content.focus()
  } else if (
    event.shiftKey &&
    (document.activeElement === first || !content.contains(document.activeElement))
  ) {
    event.preventDefault()
    last.focus()
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || !content.contains(document.activeElement))
  ) {
    event.preventDefault()
    first.focus()
  }
}
function onModalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Tab') onModalTab(event)
  else onKeydown(event)
}

function beginDrag(event: PointerEvent): void {
  const sheet = (event.currentTarget as HTMLElement).closest<HTMLElement>('.yam3x-bottom-sheet')
  if (event.button !== 0 || !event.isPrimary || !sheet) return
  dragStart.value = {
    y: event.clientY,
    height: sheet.getBoundingClientRect().height,
    pointerId: event.pointerId,
    currentY: event.clientY,
    samples: [{ y: event.clientY, time: event.timeStamp }],
  }
  window.addEventListener('pointermove', moveDrag, true)
  window.addEventListener('pointerup', endDrag, true)
  window.addEventListener('pointercancel', cancelDrag, true)
}

function heightAtPointer(session: DragSession, y = session.currentY): number {
  const minimumHeight = props.variant === 'modal' || props.hideable ? 0 : 48
  return Math.max(minimumHeight, Math.min(fullHeight(), session.height + session.y - y))
}

function queueDragRender(): void {
  if (dragFrame !== undefined) return
  dragFrame = window.requestAnimationFrame(() => {
    dragFrame = undefined
    const session = dragStart.value
    if (!session || !isDragging.value) return
    // Direct manipulation should not wait for Vue's render scheduler. Keep the
    // live pointer height in the DOM and let Vue render only the final detent.
    panel.value?.style.setProperty('--_yam3x-bottom-sheet-height', `${heightAtPointer(session)}px`)
  })
}

function recordDragSample(session: DragSession, y: number, time: number): void {
  session.currentY = y
  session.samples.push({ y, time })
  const oldestKept = time - 120
  while (session.samples.length > 2 && session.samples[1]!.time < oldestKept)
    session.samples.shift()
}

function dragVelocity(session: DragSession): number {
  const latest = session.samples.at(-1)
  const oldest = session.samples[0]
  if (!latest || !oldest) return 0
  const elapsed = latest.time - oldest.time
  if (elapsed <= 0 || elapsed > 120) return 0
  return (latest.y - oldest.y) / elapsed
}

function moveDrag(event: PointerEvent): void {
  if (!dragStart.value || dragStart.value.pointerId !== event.pointerId) return
  const session = dragStart.value
  recordDragSample(session, event.clientY, event.timeStamp)
  const delta = session.y - event.clientY
  if (!isDragging.value && Math.abs(delta) < 8) return
  isDragging.value = true
  queueDragRender()
  event.preventDefault()
}

function resolveDragTarget(session: DragSession): BottomSheetDetent | 'hidden' {
  const canHide = props.variant === 'modal' || props.hideable
  const anchors: Array<{ value: BottomSheetDetent | 'hidden'; height: number }> =
    resolvedDetents.value.map((value) => ({ value, height: detentHeight(value) }))
  if (canHide) anchors.push({ value: 'hidden', height: 0 })
  anchors.sort((a, b) => a.height - b.height)

  const velocityThreshold = 0.125 // Compose AnchoredDraggable default: 125 dp/s; CSS px are the Web layout unit.
  const velocityY = dragVelocity(session)
  if (Math.abs(velocityY) >= velocityThreshold) {
    const next =
      velocityY > 0
        ? anchors.filter((anchor) => anchor.height < currentHeight.value - 1).at(-1)
        : anchors.find((anchor) => anchor.height > currentHeight.value + 1)
    if (next) return next.value
  }

  return anchors.reduce(
    (best, candidate) =>
      Math.abs(candidate.height - currentHeight.value) < Math.abs(best.height - currentHeight.value)
        ? candidate
        : best,
    anchors[0],
  ).value
}

function endDrag(event: PointerEvent): void {
  if (!dragStart.value || dragStart.value.pointerId !== event.pointerId) return
  recordDragSample(dragStart.value, event.clientY, event.timeStamp)
  window.removeEventListener('pointermove', moveDrag, true)
  window.removeEventListener('pointerup', endDrag, true)
  window.removeEventListener('pointercancel', cancelDrag, true)
  if (dragFrame !== undefined) window.cancelAnimationFrame(dragFrame)
  dragFrame = undefined
  const dragged = Math.abs(event.clientY - dragStart.value.y) >= 8
  const session = dragStart.value
  currentHeight.value = heightAtPointer(session, event.clientY)
  dragStart.value = null
  isDragging.value = false
  if (!dragged) {
    suppressNextClick.value = true
    cycleDetent()
    window.setTimeout(() => {
      suppressNextClick.value = false
    }, 0)
    return
  }
  suppressNextClick.value = true
  const target = resolveDragTarget(session)
  if (target === 'hidden') {
    if (!close()) syncHeight()
  } else {
    requestDetent(target)
  }
  window.setTimeout(() => {
    suppressNextClick.value = false
  }, 0)
}
function cancelDrag(event: PointerEvent): void {
  if (!dragStart.value || dragStart.value.pointerId !== event.pointerId) return
  window.removeEventListener('pointermove', moveDrag, true)
  window.removeEventListener('pointerup', endDrag, true)
  window.removeEventListener('pointercancel', cancelDrag, true)
  if (dragFrame !== undefined) window.cancelAnimationFrame(dragFrame)
  dragFrame = undefined
  dragStart.value = null
  isDragging.value = false
  suppressNextClick.value = false
  syncHeight()
}
function onHandleClick(): void {
  if (!suppressNextClick.value) cycleDetent()
}

function observePanelContent(): void {
  resizeObserver?.disconnect()
  contentObserver?.disconnect()
  if (!panel.value) return
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (activeDetent.value === 'fit' && !isDragging.value) syncHeight()
    })
    resizeObserver.observe(panel.value)
    panel.value
      .querySelectorAll('.yam3x-bottom-sheet__body > *, .yam3x-bottom-sheet__header')
      .forEach((element) => resizeObserver?.observe(element))
  }
  if (typeof MutationObserver !== 'undefined') {
    contentObserver = new MutationObserver(() => {
      if (activeDetent.value === 'fit' && !isDragging.value) syncHeight()
      panel.value
        ?.querySelectorAll('.yam3x-bottom-sheet__body > *, .yam3x-bottom-sheet__header')
        .forEach((element) => resizeObserver?.observe(element))
    })
    contentObserver.observe(panel.value, { subtree: true, childList: true, characterData: true })
  }
}

function onOpenChange(details: { open: boolean }): void {
  if (!details.open) requestOpen(false, 'dismiss')
  else requestOpen(true)
}
function triggerProps(): Record<string, string | (() => void)> {
  return {
    'aria-controls': id,
    'aria-expanded': String(open.value),
    ...(props.variant === 'modal' ? { 'aria-haspopup': 'dialog' } : {}),
    onClick: () => requestOpen(true),
  }
}
function onTriggerSlotClick(): void {
  requestOpen(true)
}

watch(open, async (value, previous) => {
  if (value === previous) return
  if (expectedTransition === value) expectedTransition = undefined
  else {
    const event = new Event(value ? 'opening' : 'closing')
    if (value) emit('opening', event)
    else emit('closing', event)
  }
  if (value) {
    if (props.variant === 'modal' && !hasModalOpened && detent.value === undefined)
      detent.value = initialModalDetent()
    syncHeight()
    await nextTick()
    observePanelContent()
    syncHeight()
    if (props.variant === 'modal') hasModalOpened = true
    emit('opened', new Event('opened'))
  } else {
    emit('closed', new Event('closed'))
    await nextTick()
    returnFocus.value?.focus({ preventScroll: true })
    returnFocus.value = null
  }
})
watch(() => [props.variant, activeDetent.value], syncHeight)
watch(
  () => [detent.value, resolvedDetents.value] as const,
  ([value, choices]) => {
    if (import.meta.env.DEV && value !== undefined && !choices.includes(value)) {
      console.warn(`[yam3x] BottomSheet detent "${value}" must be included in the detents prop.`)
    }
  },
  { immediate: true },
)
onMounted(() => {
  syncHeight()
  observePanelContent()
  window.addEventListener('resize', syncHeight)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  contentObserver?.disconnect()
  window.removeEventListener('resize', syncHeight)
  window.removeEventListener('pointermove', moveDrag, true)
  window.removeEventListener('pointerup', endDrag, true)
  window.removeEventListener('pointercancel', cancelDrag, true)
  if (dragFrame !== undefined) window.cancelAnimationFrame(dragFrame)
})

defineExpose({ close, requestOpen, requestDetent })
</script>

<template>
  <template v-if="variant === 'modal'">
    <Dialog.Root
      :open="open"
      :modal="true"
      :lazy-mount="true"
      :unmount-on-exit="false"
      :close-on-escape="true"
      :close-on-interact-outside="true"
      :trap-focus="true"
      :prevent-scroll="true"
      :restore-focus="true"
      @open-change="onOpenChange"
    >
      <Dialog.Trigger
        v-if="$slots.trigger"
        as-child
        ><slot
          name="trigger"
          :trigger-props="triggerProps()"
          :activate="onTriggerSlotClick"
      /></Dialog.Trigger>
      <Dialog.Backdrop
        class="yam3x-bottom-sheet__scrim"
        @click="close"
      />
      <Dialog.Positioner class="yam3x-bottom-sheet__positioner">
        <Dialog.Content
          :id="id"
          :ref="setPanelElement"
          class="yam3x-bottom-sheet yam3x-bottom-sheet--modal"
          :data-detent="String(activeDetent)"
          :data-dragging="isDragging"
          :style="{
            '--_yam3x-bottom-sheet-height': `${currentHeight}px`,
            '--_yam3x-bottom-sheet-prop-max-width': maxWidth,
          }"
          :aria-label="accessibleLabel"
          :aria-labelledby="accessibleLabel ? undefined : headerId"
          @keydown.capture="onModalKeydown"
        >
          <div
            v-if="handle || hasResizeControl"
            class="yam3x-bottom-sheet__handle-row"
            :data-dragging="isDragging"
            @pointerdown="handle && beginDrag($event)"
          >
            <button
              v-if="handle"
              class="yam3x-bottom-sheet__handle-button"
              type="button"
              :aria-label="handleLabel"
              @click="onHandleClick"
            >
              <slot name="handle"><span class="yam3x-bottom-sheet__handle" /></slot>
            </button>
            <slot
              v-else
              name="resize-control"
              :resize="cycleDetent"
            >
              <button
                class="yam3x-bottom-sheet__resize"
                type="button"
                :aria-label="handleLabel"
                @click="cycleDetent"
              >
                Resize
              </button>
            </slot>
          </div>
          <header
            v-if="$slots.header || isFullHeight"
            class="yam3x-bottom-sheet__header"
          >
            <h2
              v-if="$slots.header"
              :id="headerId"
              class="yam3x-bottom-sheet__title"
            >
              <slot name="header" />
            </h2>
            <button
              v-if="isFullHeight"
              class="yam3x-bottom-sheet__close"
              type="button"
              :aria-label="closeLabel"
              @click="close"
            >
              <Icon name="close" />
            </button>
          </header>
          <div class="yam3x-bottom-sheet__body"><slot /></div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  </template>
  <template v-else>
    <slot
      name="trigger"
      :trigger-props="triggerProps()"
      :activate="onTriggerSlotClick"
    />
    <section
      :id="id"
      :ref="setPanelElement"
      class="yam3x-bottom-sheet yam3x-bottom-sheet--standard"
      :data-open="String(open)"
      :data-detent="String(activeDetent)"
      :data-dragging="isDragging"
      :style="{
        '--_yam3x-bottom-sheet-height': `${currentHeight}px`,
        '--_yam3x-bottom-sheet-prop-max-width': maxWidth,
      }"
      role="region"
      :aria-label="accessibleLabel"
      :aria-labelledby="accessibleLabel ? undefined : headerId"
      :aria-hidden="!open"
      :inert="!open"
      @keydown="onKeydown"
    >
      <div
        v-if="handle || hasResizeControl"
        class="yam3x-bottom-sheet__handle-row"
        :data-dragging="isDragging"
        @pointerdown="handle && beginDrag($event)"
      >
        <button
          v-if="handle"
          class="yam3x-bottom-sheet__handle-button"
          type="button"
          :aria-label="handleLabel"
          @click="onHandleClick"
        >
          <slot name="handle"><span class="yam3x-bottom-sheet__handle" /></slot>
        </button>
        <slot
          v-else
          name="resize-control"
          :resize="cycleDetent"
        >
          <button
            class="yam3x-bottom-sheet__resize"
            type="button"
            :aria-label="handleLabel"
            @click="cycleDetent"
          >
            Resize
          </button>
        </slot>
      </div>
      <header
        v-if="$slots.header || isFullHeight || variant === 'standard'"
        class="yam3x-bottom-sheet__header"
      >
        <h2
          v-if="$slots.header"
          :id="headerId"
          class="yam3x-bottom-sheet__title"
        >
          <slot name="header" />
        </h2>
        <button
          v-if="variant === 'standard'"
          class="yam3x-bottom-sheet__close"
          type="button"
          :aria-label="closeLabel"
          @click="close"
        >
          <Icon name="close" />
        </button>
        <div
          v-if="isFullHeight"
          class="yam3x-bottom-sheet__collapse-action"
        >
          <slot
            name="collapse-action"
            :collapse="() => requestDetent(resolvedDetents[0])"
          >
            <button
              class="yam3x-bottom-sheet__close"
              type="button"
              :aria-label="collapseLabel"
              @click="requestDetent(resolvedDetents[0])"
            >
              <Icon name="expand_more" />
            </button>
          </slot>
        </div>
      </header>
      <div class="yam3x-bottom-sheet__body"><slot /></div>
    </section>
  </template>
</template>
