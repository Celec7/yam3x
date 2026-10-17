import { normalizePointerEvent, normalizeWheelEvent } from './input'
import type { GestureRecognizer } from './types'
import { GestureResolver } from './resolver'

export class GestureBinding {
  #resolver = new GestureResolver()
  #destroyed = false
  #disabled = false
  #element: HTMLElement
  #capturedPointerIds = new Set<number>()
  #releasedPointerIds = new Set<number>()
  #pointerHandler: EventListener = (event) => this.#onPointer(event as PointerEvent)
  #wheelHandler = (event: WheelEvent) => this.#dispatch(normalizeWheelEvent(event, this.#element))
  #preventDefaultHandler: EventListener = (event) => event.preventDefault()

  constructor(element: HTMLElement, ...recognizers: GestureRecognizer[]) {
    this.#element = element
    for (const eventName of [
      'pointerover',
      'pointerenter',
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'pointerout',
      'pointerleave',
      'lostpointercapture',
    ]) {
      element.addEventListener(eventName, this.#pointerHandler)
    }
    element.addEventListener('wheel', this.#wheelHandler, { passive: true })
    element.addEventListener('gesturestart', this.#preventDefaultHandler)
    element.addEventListener('gesturechange', this.#preventDefaultHandler)
    element.addEventListener('gestureend', this.#preventDefaultHandler)
    for (const recognizer of recognizers) this.#resolver.add(recognizer)
  }

  get disabled(): boolean {
    return this.#disabled
  }
  set disabled(value: boolean) {
    this.#disabled = value
    if (value) this.reset()
  }

  addRecognizer(recognizer: GestureRecognizer): void {
    if (!this.#destroyed) this.#resolver.add(recognizer)
  }

  removeRecognizer(recognizer: GestureRecognizer): void {
    this.#resolver.remove(recognizer)
  }

  reset(): void {
    this.#releaseAllPointers()
    this.#resolver.clear()
    this.#resolver.dispatch(-1, (recognizer) => recognizer.reset())
  }

  destroy(): void {
    if (this.#destroyed) return
    this.#destroyed = true
    for (const eventName of [
      'pointerover',
      'pointerenter',
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'pointerout',
      'pointerleave',
      'lostpointercapture',
    ]) {
      this.#element.removeEventListener(eventName, this.#pointerHandler)
    }
    this.#element.removeEventListener('wheel', this.#wheelHandler)
    this.#element.removeEventListener('gesturestart', this.#preventDefaultHandler)
    this.#element.removeEventListener('gesturechange', this.#preventDefaultHandler)
    this.#element.removeEventListener('gestureend', this.#preventDefaultHandler)
    this.#releaseAllPointers()
    this.#resolver.destroy()
  }

  #dispatch(
    input: ReturnType<typeof normalizePointerEvent> | ReturnType<typeof normalizeWheelEvent>,
  ): void {
    if (this.#disabled || this.#destroyed) return
    this.#resolver.dispatch(input.inputId, (recognizer) => {
      if (recognizer.canReceiveInput(input)) recognizer.onInput(input)
    })
  }

  #onPointer(event: PointerEvent): void {
    if (event.type === 'lostpointercapture') {
      if (this.#releasedPointerIds.delete(event.pointerId)) return
      this.#capturedPointerIds.delete(event.pointerId)
    } else if (event.type === 'pointerdown') {
      this.#releasedPointerIds.delete(event.pointerId)
    }
    const input = normalizePointerEvent(event, this.#element)
    const normalized =
      event.type === 'lostpointercapture' ? { ...input, kind: 'pointercancel' as const } : input
    this.#dispatch(normalized)

    if (event.type === 'pointerdown' || event.type === 'pointermove') {
      const shouldCapture = this.#shouldCapture(normalized)
      if (shouldCapture && this.#element.setPointerCapture) {
        try {
          this.#element.setPointerCapture(event.pointerId)
          this.#capturedPointerIds.add(event.pointerId)
        } catch {
          /* Synthetic events and detached targets cannot be captured. */
        }
      }
    }

    if (
      event.type === 'pointerup' ||
      event.type === 'pointercancel' ||
      event.type === 'lostpointercapture'
    ) {
      this.#resolver.resolve(input.inputId)
      this.#releasePointer(event.pointerId)
    }
  }

  #releasePointer(pointerId: number): void {
    if (!this.#capturedPointerIds.delete(pointerId)) return
    if (!this.#element.hasPointerCapture?.(pointerId)) return
    this.#releasedPointerIds.add(pointerId)
    try {
      this.#element.releasePointerCapture(pointerId)
    } catch {
      this.#releasedPointerIds.delete(pointerId)
    }
  }

  #releaseAllPointers(): void {
    for (const pointerId of this.#capturedPointerIds) this.#releasePointer(pointerId)
  }

  #shouldCapture(input: ReturnType<typeof normalizePointerEvent>): boolean {
    let capture = false
    this.#resolver.dispatch(input.inputId, (recognizer) => {
      capture ||= recognizer.shouldCapturePointer?.(input) ?? false
    })
    return capture
  }
}

export function bindGestures(
  element: HTMLElement,
  ...recognizers: GestureRecognizer[]
): GestureBinding {
  return new GestureBinding(element, ...recognizers)
}
