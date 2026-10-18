<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { autoUpdate } from '@floating-ui/dom'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import Icon from '../icon/icon.vue'
import type { SnackbarApi, SnackbarOptions, SnackbarResult } from './snackbar.context'
import { snackbarKey } from './snackbar.context'
import './snackbar.css'

interface SnackbarEntry {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void | Promise<void>
  dismissible: boolean
  dismissLabel?: string
  timeoutMs?: number
  key?: string
  resolve: (result: SnackbarResult) => void
  reject: (error: unknown) => void
  actionStarted: boolean
}

const props = withDefaults(
  defineProps<{
    locale?: string
    alignment?: 'center' | 'start'
    anchor?: HTMLElement | null
    bottomOffset?: number
    shortcut?: string | null
  }>(),
  { alignment: 'center', bottomOffset: 0, shortcut: 'Alt+G' },
)
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)

const current = shallowRef<SnackbarEntry | null>(null)
const queued = shallowRef<SnackbarEntry[]>([])
const transitioningOut = ref(false)
const host = ref<HTMLElement | null>(null)
const pointerInside = ref(false)
const focusInside = ref(false)
const obstructionOffset = ref(0)
const anchorOffset = ref(0)
let nextId = 1
let timer: number | undefined
let timerDeadline = 0
let timerRemaining = 0
let positionFrame: number | undefined
let restoreTarget: HTMLElement | null = null
let stopAnchorUpdates: (() => void) | undefined
let anchorAttributeObserver: MutationObserver | undefined
const isPaused = computed(
  () =>
    pointerInside.value ||
    focusInside.value ||
    (typeof document !== 'undefined' && document.hidden),
)

function clearTimer(): void {
  if (timer !== undefined && typeof window !== 'undefined') window.clearTimeout(timer)
  timer = undefined
}

function resumeTimer(): void {
  clearTimer()
  const entry = current.value
  if (!entry?.timeoutMs || entry.actionLabel || isPaused.value) return
  if (timerRemaining <= 0) {
    finishCurrent('dismissed')
    return
  }
  timerDeadline = performance.now() + timerRemaining
  timer = window.setTimeout(() => finishCurrent('dismissed'), timerRemaining)
}

function pauseTimer(): void {
  if (timer === undefined) return
  timerRemaining = Math.max(0, timerDeadline - performance.now())
  clearTimer()
}

function schedulePositionUpdate(): void {
  if (positionFrame !== undefined || typeof window === 'undefined') return
  positionFrame = window.requestAnimationFrame(() => {
    positionFrame = undefined
    updatePosition()
  })
}

function updateActionLayout(snackbar: HTMLElement | null): void {
  const action = snackbar?.querySelector<HTMLElement>('[data-snackbar-action]')
  if (!snackbar || !action) {
    snackbar?.classList.remove('yam3x-snackbar--long-action')
    return
  }

  const style = getComputedStyle(action)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return
  context.font = style.font
  const labelWidth = context.measureText(action.textContent?.trim() ?? '').width
  const cardStyle = getComputedStyle(snackbar)
  const message = snackbar.querySelector<HTMLElement>('.yam3x-snackbar__message')
  const messageStyle = message ? getComputedStyle(message) : null
  const close = snackbar.querySelector<HTMLElement>('[data-snackbar-close]')
  const inlinePadding =
    Number.parseFloat(cardStyle.paddingInlineStart) + Number.parseFloat(cardStyle.paddingInlineEnd)
  const actionPadding =
    Number.parseFloat(style.paddingInlineStart) + Number.parseFloat(style.paddingInlineEnd)
  const messageIndent = messageStyle ? Number.parseFloat(messageStyle.marginInlineStart) : 0
  const minimumMessageWidth = Number.parseFloat(
    cardStyle.getPropertyValue('--_yam3x-snackbar-message-min-inline-size'),
  )
  const closeWidth = close?.getBoundingClientRect().width ?? 0
  const requiredWidth =
    labelWidth + actionPadding + closeWidth + messageIndent + minimumMessageWidth + inlinePadding
  snackbar.classList.toggle('yam3x-snackbar--long-action', requiredWidth > snackbar.clientWidth)
}

function onBeforeEnter(element: Element): void {
  if (element instanceof HTMLElement) updateActionLayout(element)
}

function updatePosition(): void {
  const hostElement = host.value
  if (!hostElement || typeof window === 'undefined') return
  updateActionLayout(hostElement.querySelector<HTMLElement>('.yam3x-snackbar'))
  const anchor = props.anchor
  if (anchor?.isConnected) {
    const anchorBox = anchor.getBoundingClientRect()
    const anchorStyle = getComputedStyle(anchor)
    const anchorIsHidden =
      anchorStyle.display === 'none' ||
      anchorStyle.visibility === 'hidden' ||
      anchorStyle.visibility === 'collapse'
    anchorOffset.value =
      !anchorIsHidden && anchorBox.width > 0 && anchorBox.height > 0
        ? Math.max(0, window.innerHeight - anchorBox.top)
        : 0
  } else {
    anchorOffset.value = 0
  }

  const active = document.activeElement
  const isPageControl =
    active instanceof HTMLElement &&
    active !== document.body &&
    active !== document.documentElement &&
    active.matches(
      'a[href],area[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]',
    )
  if (!isPageControl || hostElement.contains(active)) {
    obstructionOffset.value = 0
    return
  }
  const box = hostElement.getBoundingClientRect()
  const focused = active.getBoundingClientRect()
  if (focused.width === 0 || focused.height === 0) {
    obstructionOffset.value = 0
    return
  }
  const existing = obstructionOffset.value
  const baseline = {
    top: box.top + existing,
    bottom: box.bottom + existing,
    left: box.left,
    right: box.right,
  }
  const overlaps =
    baseline.left < focused.right &&
    baseline.right > focused.left &&
    baseline.top < focused.bottom &&
    baseline.bottom > focused.top
  obstructionOffset.value = overlaps ? Math.max(0, baseline.bottom - focused.top + 8) : 0
}

function watchAnchorPosition(): void {
  stopAnchorUpdates?.()
  stopAnchorUpdates = undefined
  anchorAttributeObserver?.disconnect()
  anchorAttributeObserver = undefined
  const anchor = props.anchor
  const hostElement = host.value
  if (anchor && hostElement && typeof window !== 'undefined') {
    stopAnchorUpdates = autoUpdate(anchor, hostElement, schedulePositionUpdate)
    if (typeof MutationObserver !== 'undefined') {
      anchorAttributeObserver = new MutationObserver(schedulePositionUpdate)
      anchorAttributeObserver.observe(anchor, {
        attributes: true,
        attributeFilter: ['class', 'hidden', 'style'],
      })
    }
  }
  schedulePositionUpdate()
}

function restoreShortcutFocus(): void {
  const target = restoreTarget
  restoreTarget = null
  if (target?.isConnected) target.focus({ preventScroll: true })
}

function settleEntry(entry: SnackbarEntry, result: SnackbarResult, resolve = true): void {
  if (current.value !== entry) return
  clearTimer()
  timerRemaining = 0
  if (host.value?.contains(document.activeElement)) restoreShortcutFocus()
  transitioningOut.value = true
  current.value = null
  if (resolve) entry.resolve(result)
  schedulePositionUpdate()
}

function onAfterLeave(): void {
  transitioningOut.value = false
  if (!current.value) {
    current.value = queued.value.shift() ?? null
    queued.value = [...queued.value]
  }
}

function finishCurrent(result: SnackbarResult): void {
  const entry = current.value
  if (entry) settleEntry(entry, result)
}

function makeEntry(options: SnackbarOptions): Omit<SnackbarEntry, 'resolve' | 'reject'> {
  if (!options.message.trim()) throw new TypeError('Snackbar message must not be empty.')
  if (options.timeoutMs !== undefined) {
    if (!options.inlineFeedback)
      throw new TypeError('A timed snackbar requires inlineFeedback: true.')
    if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
      throw new RangeError('timeoutMs must be a positive finite number.')
  }

  const timeoutMs =
    options.timeoutMs === undefined
      ? undefined
      : Math.min(10_000, Math.max(4_000, options.timeoutMs))
  const hasAction = Boolean(options.actionLabel?.trim())
  return {
    id: nextId++,
    message: options.message,
    ...(hasAction ? { actionLabel: options.actionLabel!.trim(), onAction: options.onAction } : {}),
    dismissible: options.dismissible ?? (hasAction || timeoutMs === undefined),
    dismissLabel: options.dismissLabel?.trim() || undefined,
    ...(hasAction ? {} : timeoutMs === undefined ? {} : { timeoutMs }),
    ...(options.key === undefined ? {} : { key: options.key }),
    actionStarted: false,
  }
}

function replaceEntry(oldEntry: SnackbarEntry, entry: SnackbarEntry): void {
  oldEntry.resolve('dismissed')
  entry.id = oldEntry.id
  if (current.value === oldEntry) current.value = entry
  else queued.value = queued.value.map((candidate) => (candidate === oldEntry ? entry : candidate))
}

function show(options: SnackbarOptions): Promise<SnackbarResult> {
  const details = makeEntry(options)
  return new Promise<SnackbarResult>((resolve, reject) => {
    const entry: SnackbarEntry = { ...details, resolve, reject }
    if (entry.key !== undefined) {
      if (current.value?.key === entry.key) {
        if (host.value?.contains(document.activeElement)) restoreShortcutFocus()
        replaceEntry(current.value, entry)
        return
      }
      const queuedMatch = queued.value.find((candidate) => candidate.key === entry.key)
      if (queuedMatch) {
        replaceEntry(queuedMatch, entry)
        return
      }
    }
    if (!current.value && !transitioningOut.value) current.value = entry
    else queued.value = [...queued.value, entry]
  })
}

function dismiss(): void {
  finishCurrent('dismissed')
}

async function activateAction(): Promise<void> {
  const entry = current.value
  if (!entry?.actionLabel || entry.actionStarted) return
  entry.actionStarted = true
  settleEntry(entry, 'action', false)
  try {
    await entry.onAction?.()
    entry.resolve('action')
  } catch (error) {
    entry.reject(error)
  }
}

const api: SnackbarApi = { show, dismiss }
provide(snackbarKey, api)

function onShortcut(event: KeyboardEvent): void {
  if (!props.shortcut || !current.value || event.defaultPrevented) return
  const parts = props.shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
  const key = parts.at(-1)
  if (!key || event.key.toLowerCase() !== key) return
  if (
    parts.includes('alt') !== event.altKey ||
    parts.includes('control') !== event.ctrlKey ||
    parts.includes('ctrl') !== event.ctrlKey ||
    parts.includes('shift') !== event.shiftKey ||
    parts.includes('meta') !== event.metaKey
  )
    return
  event.preventDefault()
  if (
    document.activeElement instanceof HTMLElement &&
    !host.value?.contains(document.activeElement)
  ) {
    restoreTarget = document.activeElement
  }
  const firstAction = host.value?.querySelector<HTMLElement>(
    '[data-snackbar-action], [data-snackbar-close]',
  )
  firstAction?.focus({ preventScroll: true })
}

function onHostKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && host.value?.contains(event.target as Node)) {
    event.preventDefault()
    finishCurrent('dismissed')
  }
}

function onPointerEnter(): void {
  pointerInside.value = true
  pauseTimer()
}
function onPointerLeave(): void {
  pointerInside.value = false
  if (!focusInside.value) resumeTimer()
}
function onFocusIn(event: FocusEvent): void {
  if (event.relatedTarget instanceof HTMLElement && !host.value?.contains(event.relatedTarget))
    restoreTarget = event.relatedTarget
  focusInside.value = true
  pauseTimer()
  schedulePositionUpdate()
}
function onFocusOut(): void {
  void nextTick(() => {
    focusInside.value = Boolean(host.value?.contains(document.activeElement))
    if (!focusInside.value) restoreTarget = null
    if (!focusInside.value && !pointerInside.value) resumeTimer()
    schedulePositionUpdate()
  })
}
function onVisibilityChange(): void {
  if (document.hidden) pauseTimer()
  else if (!pointerInside.value && !focusInside.value) resumeTimer()
}

watch(
  current,
  (entry) => {
    clearTimer()
    timerRemaining = entry?.timeoutMs ?? 0
    if (entry) resumeTimer()
    schedulePositionUpdate()
  },
  { flush: 'post' },
)

watch(() => props.anchor, watchAnchorPosition, { flush: 'post' })

onMounted(() => {
  document.addEventListener('keydown', onShortcut, true)
  document.addEventListener('visibilitychange', onVisibilityChange)
  document.addEventListener('focusin', schedulePositionUpdate, true)
  document.addEventListener('focusout', schedulePositionUpdate, true)
  window.addEventListener('resize', schedulePositionUpdate)
  window.addEventListener('scroll', schedulePositionUpdate, true)
  watchAnchorPosition()
})

onBeforeUnmount(() => {
  clearTimer()
  stopAnchorUpdates?.()
  anchorAttributeObserver?.disconnect()
  if (positionFrame !== undefined) window.cancelAnimationFrame(positionFrame)
  document.removeEventListener('keydown', onShortcut, true)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  document.removeEventListener('focusin', schedulePositionUpdate, true)
  document.removeEventListener('focusout', schedulePositionUpdate, true)
  window.removeEventListener('resize', schedulePositionUpdate)
  window.removeEventListener('scroll', schedulePositionUpdate, true)
  current.value?.resolve('dismissed')
  queued.value.forEach((entry) => entry.resolve('dismissed'))
})
</script>

<template>
  <slot />
  <Teleport to="body">
    <div
      ref="host"
      class="yam3x-snackbar-host"
      :class="`yam3x-snackbar-host--${alignment}`"
      :style="{
        '--_yam3x-snackbar-anchor-offset': `${anchorOffset}px`,
        '--_yam3x-snackbar-bottom-offset': `${Math.max(0, bottomOffset)}px`,
        '--_yam3x-snackbar-obstruction-offset': `${obstructionOffset}px`,
      }"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
      @keydown="onHostKeydown"
    >
      <Transition
        name="yam3x-snackbar"
        mode="out-in"
        @before-enter="onBeforeEnter"
        @after-enter="schedulePositionUpdate"
        @after-leave="onAfterLeave"
      >
        <section
          v-if="current"
          :key="current.id"
          class="yam3x-snackbar"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p class="yam3x-snackbar__message">{{ current.message }}</p>
          <button
            v-if="current.actionLabel"
            class="yam3x-snackbar__action"
            type="button"
            data-snackbar-action
            @click="activateAction"
          >
            {{ current.actionLabel }}
          </button>
          <button
            v-if="current.dismissible"
            class="yam3x-snackbar__close"
            type="button"
            data-snackbar-close
            :aria-label="current.dismissLabel ?? actionMessages.dismissNotification"
            @click="finishCurrent('dismissed')"
          >
            <Icon name="close" />
          </button>
        </section>
      </Transition>
    </div>
  </Teleport>
</template>
