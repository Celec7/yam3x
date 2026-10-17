import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Middleware,
  type Placement,
} from '@floating-ui/dom'
import { nextTick, onBeforeUnmount, onMounted, watch, type ComputedRef, type Ref } from 'vue'

export interface TooltipControllerOptions {
  id: ComputedRef<string>
  forId: ComputedRef<string | undefined>
  surface: Ref<HTMLElement | null>
  open: Ref<boolean>
  disabled: ComputedRef<boolean>
  position: ComputedRef<string | undefined>
  distance: ComputedRef<number>
  showDelay: ComputedRef<number>
  hideDelay: ComputedRef<number>
  touchGestures: ComputedRef<'auto' | 'on' | 'off'>
  interactive: ComputedRef<boolean>
  persistent: ComputedRef<boolean>
  kind: 'plain' | 'rich'
  emitBeforeToggle(event: Event): void
  emitToggle(event: Event): void
}

let activeTooltipClose: (() => void) | undefined

function isDisabledTarget(element: HTMLElement): boolean {
  return element.matches(':disabled, [aria-disabled="true"]')
}

function isPopoverOpen(element: HTMLElement): boolean {
  try {
    return element.matches(':popover-open')
  } catch {
    return false
  }
}

function withToggleState(open: boolean): ToggleEvent {
  return new ToggleEvent('toggle', {
    oldState: open ? 'closed' : 'open',
    newState: open ? 'open' : 'closed',
    bubbles: true,
  })
}

const alignViewportShift: Middleware = {
  name: 'alignViewportShift',
  fn({ x, y, middlewareData }) {
    const shiftData = middlewareData.shift
    const remainder = (delta: number | undefined) => {
      if (!delta) return 0
      const aligned = Math.sign(delta) * Math.ceil(Math.abs(delta) / 8) * 8
      return aligned - delta
    }
    return {
      x: x + remainder(shiftData?.x),
      y: y + remainder(shiftData?.y),
    }
  },
}

export function useTooltipController(options: TooltipControllerOptions) {
  let anchor: HTMLElement | null = null
  let rootObserver: MutationObserver | undefined
  let directionObserver: MutationObserver | undefined
  let stopPositioning: (() => void) | undefined
  let showTimer = 0
  let hideTimer = 0
  let longPressTimer = 0
  let longPressTriggered = false
  let interactionPinned = false
  let savedHasPopup: string | null = null
  let savedExpanded: string | null = null
  let savedControls: string | null = null
  let describedTooltipId: string | undefined
  let wasInteractive = false
  let savedTouchStyles:
    | {
        userSelect: string
        webkitUserDrag: string
        touchAction: string
        webkitTapHighlightColor: string
      }
    | undefined

  const surface = () => options.surface.value
  const isOpen = () =>
    !!surface() && (isPopoverOpen(surface()!) || surface()!.dataset.open === 'true')
  const shouldPersist = () => options.persistent.value || interactionPinned

  function getAnchor(id = options.forId.value): HTMLElement | null {
    if (!id) return null
    const root = surface()?.getRootNode()
    const element =
      root instanceof Document || root instanceof ShadowRoot
        ? root.getElementById(id)
        : document.getElementById(id)
    return element instanceof HTMLElement ? element : null
  }

  function resolvedPlacement(element: HTMLElement): Placement {
    const direction = getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr'
    const value =
      options.position.value ??
      (element.closest('[role="banner"], header, [data-yam3x-top-app-bar], .yam3x-top-app-bar')
        ? 'below'
        : 'above')
    const side = value.startsWith('above')
      ? 'top'
      : value.startsWith('below')
        ? 'bottom'
        : value === 'before'
          ? direction === 'rtl'
            ? 'right'
            : 'left'
          : value === 'after'
            ? direction === 'rtl'
              ? 'left'
              : 'right'
            : undefined
    if (!side || side === 'left' || side === 'right') return side ?? 'top'
    if (value.endsWith('-before'))
      return `${side}-${direction === 'rtl' ? 'end' : 'start'}` as Placement
    if (value.endsWith('-after'))
      return `${side}-${direction === 'rtl' ? 'start' : 'end'}` as Placement
    return side
  }

  function effectiveDistance(element: HTMLElement): number {
    if (options.distance.value >= 0) return options.distance.value
    if (options.kind === 'rich') return 8
    const styles = getComputedStyle(element)
    const hasBackground =
      styles.backgroundColor !== 'transparent' && !styles.backgroundColor.endsWith(', 0)')
    const hasBorder = ['Top', 'Right', 'Bottom', 'Left'].some((side) => {
      const width = Number.parseFloat(
        styles[`border${side}Width` as keyof CSSStyleDeclaration] as string,
      )
      const style = styles[`border${side}Style` as keyof CSSStyleDeclaration]
      return width > 0 && style !== 'none' && style !== 'hidden'
    })
    return hasBackground || hasBorder || styles.boxShadow !== 'none' ? 4 : 8
  }

  function clearTimers(): void {
    window.clearTimeout(showTimer)
    window.clearTimeout(hideTimer)
    window.clearTimeout(longPressTimer)
    showTimer = 0
    hideTimer = 0
    longPressTimer = 0
  }

  function updateDescription(): void {
    if (!anchor) return
    const enabled = !options.disabled.value && !options.interactive.value
    const id = options.id.value
    const current = (anchor.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    const next = new Set(current)
    if (describedTooltipId && describedTooltipId !== id) next.delete(describedTooltipId)
    if (enabled) next.add(id)
    else next.delete(id)
    describedTooltipId = enabled ? id : undefined
    const values = [...next]
    if (values.length) anchor.setAttribute('aria-describedby', values.join(' '))
    else anchor.removeAttribute('aria-describedby')
  }

  function removeDescription(): void {
    if (!anchor || !describedTooltipId) return
    const next = (anchor.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((value) => value && value !== describedTooltipId)
    if (next.length) anchor.setAttribute('aria-describedby', next.join(' '))
    else anchor.removeAttribute('aria-describedby')
    describedTooltipId = undefined
  }

  function updateInteractiveSemantics(): void {
    if (!anchor || options.kind !== 'rich') return
    const interactive = options.interactive.value
    if (interactive && !wasInteractive) {
      savedHasPopup = anchor.getAttribute('aria-haspopup')
      savedExpanded = anchor.getAttribute('aria-expanded')
      savedControls = anchor.getAttribute('aria-controls')
    }
    if (interactive) {
      anchor.setAttribute('aria-haspopup', 'dialog')
      anchor.setAttribute('aria-expanded', String(isOpen()))
      anchor.setAttribute('aria-controls', options.id.value)
    } else if (wasInteractive) {
      restoreInteractiveSemantics()
    }
    wasInteractive = interactive
    updateDescription()
  }

  function restoreInteractiveSemantics(): void {
    if (!anchor) return
    if (savedHasPopup === null) anchor.removeAttribute('aria-haspopup')
    else anchor.setAttribute('aria-haspopup', savedHasPopup)
    if (savedExpanded === null) anchor.removeAttribute('aria-expanded')
    else anchor.setAttribute('aria-expanded', savedExpanded)
    if (savedControls === null) anchor.removeAttribute('aria-controls')
    else anchor.setAttribute('aria-controls', savedControls)
    savedHasPopup = null
    savedExpanded = null
    savedControls = null
  }

  function updatePosition(): void {
    const element = surface()
    if (!element || !anchor || !isOpen()) return
    const reference = anchor
    void computePosition(reference, element, {
      strategy: 'fixed',
      placement: resolvedPlacement(reference),
      middleware: [
        offset(effectiveDistance(reference)),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        alignViewportShift,
      ],
    }).then(({ x, y }) => {
      if (anchor !== reference || surface() !== element || !isOpen()) return
      element.style.left = `${x}px`
      element.style.top = `${y}px`
    })
  }

  function stopAutoPositioning(): void {
    stopPositioning?.()
    stopPositioning = undefined
  }

  function startAutoPositioning(): void {
    const element = surface()
    if (!element || !anchor) return
    stopAutoPositioning()
    updatePosition()
    stopPositioning = autoUpdate(anchor, element, updatePosition)
  }

  function closeOnOutside(event: Event): void {
    if (!shouldPersist() && !options.interactive.value) return
    const path = event.composedPath()
    if ((anchor && path.includes(anchor)) || (surface() && path.includes(surface()!))) return
    requestClose(false)
  }

  function onDocumentKeydown(event: KeyboardEvent): void {
    if (
      event.key !== 'Escape' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !isOpen()
    )
      return
    event.preventDefault()
    requestClose(true)
  }

  function connectOpenListeners(): void {
    document.addEventListener('pointerdown', closeOnOutside, true)
    document.addEventListener('focusin', closeOnOutside, true)
    document.addEventListener('keydown', onDocumentKeydown)
  }

  function disconnectOpenListeners(): void {
    document.removeEventListener('pointerdown', closeOnOutside, true)
    document.removeEventListener('focusin', closeOnOutside, true)
    document.removeEventListener('keydown', onDocumentKeydown)
  }

  function requestShow(): void {
    const element = surface()
    if (!element || !anchor || options.disabled.value || isDisabledTarget(anchor)) return
    if (isOpen()) {
      options.open.value = true
      updateInteractiveSemantics()
      startAutoPositioning()
      return
    }
    activeTooltipClose?.()
    activeTooltipClose = () => requestClose(false)
    try {
      if (typeof element.showPopover === 'function') element.showPopover()
      else {
        const before = new Event('beforetoggle', { bubbles: true, cancelable: true })
        options.emitBeforeToggle(before)
        if (before.defaultPrevented) return
      }
    } catch {
      return
    }
    if (typeof element.showPopover !== 'function') {
      element.dataset.open = 'true'
      options.emitToggle(withToggleState(true))
    } else if (!isPopoverOpen(element)) return
    element.dataset.open = 'true'
    options.open.value = true
    updateInteractiveSemantics()
    updateDescription()
    connectOpenListeners()
    startAutoPositioning()
  }

  function requestClose(restoreFocus = false): void {
    const element = surface()
    clearTimers()
    if (!element || !isOpen()) {
      options.open.value = false
      interactionPinned = false
      if (activeTooltipClose === closeActive) activeTooltipClose = undefined
      return
    }
    try {
      if (isPopoverOpen(element) && typeof element.hidePopover === 'function') element.hidePopover()
      else {
        const before = new Event('beforetoggle', { bubbles: true, cancelable: true })
        options.emitBeforeToggle(before)
        if (before.defaultPrevented) return
        options.emitToggle(withToggleState(false))
      }
    } catch {
      return
    }
    if (isPopoverOpen(element)) return
    element.dataset.open = ''
    options.open.value = false
    updateDescription()
    if (options.kind === 'rich' && options.interactive.value && anchor) {
      anchor.setAttribute('aria-expanded', 'false')
      if (restoreFocus) anchor.focus({ preventScroll: true })
    }
    interactionPinned = false
    stopAutoPositioning()
    disconnectOpenListeners()
    if (activeTooltipClose === closeActive) activeTooltipClose = undefined
  }

  function closeActive(): void {
    requestClose(false)
  }

  function scheduleShow(): void {
    window.clearTimeout(hideTimer)
    hideTimer = 0
    if (options.disabled.value || isOpen()) return
    window.clearTimeout(showTimer)
    showTimer = window.setTimeout(requestShow, Math.max(0, options.showDelay.value))
  }

  function scheduleHide(): void {
    window.clearTimeout(showTimer)
    showTimer = 0
    if (shouldPersist()) return
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => requestClose(false), Math.max(0, options.hideDelay.value))
  }

  function onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === 'touch') return
    window.clearTimeout(hideTimer)
    hideTimer = 0
    if (!shouldPersist()) scheduleShow()
  }

  function onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === 'touch' || shouldPersist()) return
    scheduleHide()
  }

  function onFocusIn(event: FocusEvent): void {
    const target = event.target
    if (surface()?.contains(target as Node)) {
      window.clearTimeout(hideTimer)
      hideTimer = 0
      return
    }
    if (shouldPersist()) return
    if (target instanceof HTMLElement && target.matches(':focus-visible')) scheduleShow()
  }

  function onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget
    if (next instanceof Node && (anchor?.contains(next) || surface()?.contains(next))) return
    if (!shouldPersist()) scheduleHide()
  }

  function onClick(): void {
    if (options.disabled.value) return
    // A touch-and-hold already opened a transient tooltip; ignore the synthetic
    // click some browsers dispatch when that gesture ends.
    if (longPressTriggered) {
      longPressTriggered = false
      return
    }
    if (options.kind === 'rich' && (options.interactive.value || options.persistent.value)) {
      if (isOpen() && shouldPersist()) requestClose(true)
      else if (isOpen()) interactionPinned = true
      else {
        interactionPinned = true
        requestShow()
      }
    } else requestClose(false)
  }

  function onTouchStart(event: PointerEvent): void {
    if (
      event.pointerType !== 'touch' ||
      options.touchGestures.value === 'off' ||
      options.disabled.value ||
      options.persistent.value
    )
      return
    window.clearTimeout(longPressTimer)
    longPressTriggered = false
    longPressTimer = window.setTimeout(() => {
      longPressTriggered = true
      requestShow()
    }, 500)
  }

  function onTouchEnd(event: PointerEvent): void {
    if (event.pointerType !== 'touch') return
    window.clearTimeout(longPressTimer)
    longPressTimer = 0
    if (longPressTriggered) {
      scheduleHide()
      // Keep the flag through the native click dispatch, then allow future
      // keyboard or pointer activations to use the trigger normally.
      longPressTimer = window.setTimeout(() => {
        longPressTriggered = false
        longPressTimer = 0
      }, 0)
    }
  }

  const anchorListeners: Array<[string, EventListener]> = [
    ['pointerenter', onPointerEnter as EventListener],
    ['pointerleave', onPointerLeave as EventListener],
    ['focusin', onFocusIn as EventListener],
    ['focusout', onFocusOut as EventListener],
    ['click', onClick as EventListener],
    ['pointerdown', onTouchStart as EventListener],
    ['pointerup', onTouchEnd as EventListener],
    ['pointercancel', onTouchEnd as EventListener],
  ]

  function detachAnchor(): void {
    if (anchor) {
      anchorListeners.forEach(([name, listener]) => anchor?.removeEventListener(name, listener))
      removeDescription()
      restoreInteractiveSemantics()
      wasInteractive = false
      if (savedTouchStyles) {
        anchor.style.userSelect = savedTouchStyles.userSelect
        anchor.style.setProperty('-webkit-user-drag', savedTouchStyles.webkitUserDrag)
        anchor.style.touchAction = savedTouchStyles.touchAction
        anchor.style.setProperty(
          '-webkit-tap-highlight-color',
          savedTouchStyles.webkitTapHighlightColor,
        )
        savedTouchStyles = undefined
      }
    }
    directionObserver?.disconnect()
    directionObserver = undefined
    anchor = null
    requestClose(false)
  }

  function syncAnchor(): void {
    const next = getAnchor()
    if (next === anchor) {
      if (options.open.value) requestShow()
      return
    }
    detachAnchor()
    if (!next) return
    anchor = next
    anchorListeners.forEach(([name, listener]) => anchor?.addEventListener(name, listener))
    if (options.touchGestures.value === 'on') {
      savedTouchStyles = {
        userSelect: next.style.userSelect,
        webkitUserDrag: next.style.getPropertyValue('-webkit-user-drag'),
        touchAction: next.style.touchAction,
        webkitTapHighlightColor: next.style.getPropertyValue('-webkit-tap-highlight-color'),
      }
      next.style.userSelect = 'none'
      next.style.setProperty('-webkit-user-drag', 'none')
      next.style.touchAction = 'none'
      next.style.setProperty('-webkit-tap-highlight-color', 'transparent')
    }
    directionObserver = new MutationObserver(updatePosition)
    for (let parent: HTMLElement | null = next; parent; parent = parent.parentElement) {
      directionObserver.observe(parent, {
        attributes: true,
        attributeFilter: ['dir', 'class', 'style'],
      })
    }
    updateInteractiveSemantics()
    updateDescription()
    if (options.open.value) requestShow()
  }

  function onSurfacePointerEnter(): void {
    window.clearTimeout(hideTimer)
    hideTimer = 0
  }

  function onSurfacePointerLeave(): void {
    if (!shouldPersist()) scheduleHide()
  }

  function onBeforeToggle(event: Event): void {
    options.emitBeforeToggle(event)
  }

  function onToggle(event: Event): void {
    const next = (event as ToggleEvent).newState === 'open'
    const element = surface()
    if (element) element.dataset.open = next ? 'true' : ''
    options.open.value = next
    if (next) {
      updateInteractiveSemantics()
      connectOpenListeners()
      startAutoPositioning()
    } else {
      updateInteractiveSemantics()
      stopAutoPositioning()
      disconnectOpenListeners()
      if (activeTooltipClose === closeActive) activeTooltipClose = undefined
    }
    updateDescription()
    options.emitToggle(event)
  }

  watch(options.forId, () => nextTick(syncAnchor))
  watch(options.position, () => nextTick(updatePosition))
  watch(options.distance, () => nextTick(updatePosition))
  watch(options.id, () => {
    updateDescription()
    updateInteractiveSemantics()
  })
  watch(options.disabled, (disabled) => {
    if (disabled) requestClose(false)
    updateDescription()
  })
  watch(options.open, (open) => {
    if (open) requestShow()
    else requestClose(false)
  })
  watch(options.interactive, () => updateInteractiveSemantics())
  watch(options.persistent, (persistent) => {
    if (persistent && options.open.value) interactionPinned = true
  })

  onMounted(() => {
    const currentSurface = surface()
    currentSurface?.addEventListener('beforetoggle', onBeforeToggle)
    currentSurface?.addEventListener('toggle', onToggle)
    const root = currentSurface?.getRootNode()
    if (root instanceof Document || root instanceof ShadowRoot) {
      rootObserver = new MutationObserver(() => {
        void nextTick(syncAnchor)
      })
      rootObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id'],
      })
    }
    syncAnchor()
  })

  onBeforeUnmount(() => {
    clearTimers()
    rootObserver?.disconnect()
    detachAnchor()
    stopAutoPositioning()
    disconnectOpenListeners()
    const currentSurface = surface()
    currentSurface?.removeEventListener('beforetoggle', onBeforeToggle)
    currentSurface?.removeEventListener('toggle', onToggle)
  })

  return {
    show: requestShow,
    hide: requestClose,
    onSurfacePointerEnter,
    onSurfacePointerLeave,
    syncInteractiveSemantics: updateInteractiveSemantics,
  }
}
