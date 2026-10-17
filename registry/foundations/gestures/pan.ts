import type { PointerInput } from './input'
import { PointerTracker } from './pointer-tracker'
import type { PointerGestureDetail } from './pointer-tracker'
import { GestureRecognizerBase } from './recognizer'
import type { GestureDetail, GestureListener, GestureOptions } from './types'

export type PanActivationMode = 'press' | 'move'
export type PanLockAxis = 'x' | 'y' | 'auto' | 'none'

export interface PanGestureOptions extends GestureOptions {
  readonly pointers: number
  readonly activationMode: PanActivationMode
  readonly minDisplacement: number
  readonly lockAxis: PanLockAxis
  readonly axisThreshold: number
  readonly deltaThreshold: number
  readonly maxPressInterval: number
}

export interface PanGestureDetail extends GestureDetail {
  readonly startClientX: number
  readonly startClientY: number
  readonly startLocalX: number
  readonly startLocalY: number
  readonly clientX: number
  readonly clientY: number
  readonly localX: number
  readonly localY: number
  readonly deltaX: number
  readonly deltaY: number
  readonly displacement: number
  readonly totalDeltaX: number
  readonly totalDeltaY: number
  readonly totalDisplacement: number
  readonly axis: 'x' | 'y'
  readonly velocityX: number
  readonly velocityY: number
  readonly directionX: number
  readonly directionY: number
  readonly speed: number
  readonly angle: number
  readonly duration: number
  readonly deltaTime: number
}

export const defaultPanOptions: PanGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 1,
  activationMode: 'press',
  minDisplacement: 4,
  lockAxis: 'none',
  axisThreshold: 8,
  deltaThreshold: 0,
  maxPressInterval: 120,
}

type PointerState = {
  tracker: PointerTracker
  pressTimestamp: number
  active: boolean
  accepted: boolean
}

export class PanGestureRecognizer extends GestureRecognizerBase<
  PanGestureDetail,
  PanGestureOptions
> {
  #state = new Map<number, PointerState>()
  #invalid = false
  #started = false
  #axis: 'x' | 'y' | null = null
  #cancelling = false
  #currentDetail?: PanGestureDetail

  constructor(
    options: Partial<PanGestureOptions> = {},
    listener?: GestureListener<PanGestureDetail>,
  ) {
    super(options, defaultPanOptions)
    if (listener) this.addListener(listener)
  }

  get trackers(): PointerTracker[] {
    return [...this.#state.values()].map((state) => state.tracker)
  }
  get currentDetail(): PanGestureDetail | undefined {
    return this.#currentDetail
  }

  override shouldCapturePointer(input: PointerInput): boolean {
    return this.#state.has(input.inputId)
  }

  protected override onPointerDown(input: PointerInput): void {
    if (this.#state.has(input.inputId) || this.#state.size >= this.options.pointers) {
      this.#cancel()
      return
    }
    if (this.#state.size && this.options.maxPressInterval > 0) {
      const firstPress = Math.min(...[...this.#state.values()].map((state) => state.pressTimestamp))
      if (input.timestamp - firstPress > this.options.maxPressInterval) {
        this.#cancel()
        return
      }
    }
    this.#state.set(input.inputId, {
      tracker: new PointerTracker(input),
      pressTimestamp: input.timestamp,
      active: true,
      accepted: false,
    })
    this.#invalid = this.options.activationMode === 'move'
    if (!this.#invalid) {
      this.disposition(input.inputId, 'defer')
      if (!this.#started && this.options.minDisplacement <= 0 && this.#allPointersActive()) {
        this.#started = true
        this.#emit('start')
      }
    }
  }

  protected override onPointerMove(input: PointerInput): void {
    if (this.#invalid) return
    if (!this.#state.has(input.inputId) && this.options.activationMode === 'move') {
      this.#state.set(input.inputId, {
        tracker: new PointerTracker(input),
        pressTimestamp: input.timestamp,
        active: true,
        accepted: false,
      })
      this.disposition(input.inputId, 'defer')
      if (!this.#started && this.options.minDisplacement <= 0 && this.#allPointersActive()) {
        this.#started = true
        this.#emit('start')
        return
      }
    }
    const state = this.#state.get(input.inputId)
    if (!state || !this.#allPointersActive()) return
    state.tracker.append(input)
    const metrics = this.#metrics()
    if (this.#started) {
      this.#tryLockAxis()
      if (this.#axis === 'x' && Math.abs(metrics.deltaY) < this.options.deltaThreshold) return
      if (this.#axis === 'y' && Math.abs(metrics.deltaX) < this.options.deltaThreshold) return
      this.#emit('update')
    } else if (metrics.totalDisplacement >= this.options.minDisplacement) {
      this.#tryLockAxis()
      this.#started = true
      this.#emit('start')
    }
  }

  protected override onPointerUp(input: PointerInput): void {
    const state = this.#state.get(input.inputId)
    if (!state) return
    state.active = false
    state.tracker.append(input)
    if (this.#started) {
      this.#currentDetail = this.#createDetail('end')
      const pendingIds = [...this.#state.entries()]
        .filter(([, pointer]) => !pointer.accepted)
        .map(([id]) => id)
      this.disposition(pendingIds, 'accept')
    } else this.#cancel()
  }

  protected override onPointerCancel(input: PointerInput): void {
    if (this.#state.has(input.inputId)) this.#cancel()
  }

  protected override onAccept(inputId: number): void {
    const state = this.#state.get(inputId)
    if (!state) return
    state.accepted = true
    if (this.#started && [...this.#state.values()].every((pointer) => pointer.accepted)) {
      this.#emit('end')
      this.reset()
    }
  }

  protected override onReject(inputId: number): void {
    if (this.#state.has(inputId)) this.#cancel(inputId)
  }

  reset(): void {
    this.#state.clear()
    this.#invalid = this.#started = false
    this.#axis = null
    this.#currentDetail = undefined
  }

  #allPointersActive(): boolean {
    return (
      this.#state.size === this.options.pointers &&
      [...this.#state.values()].every((state) => state.active)
    )
  }

  #metrics(): PointerGestureDetail {
    return PointerTracker.centroid(...this.trackers)
  }

  #tryLockAxis(): void {
    if (this.options.lockAxis === 'x' || this.options.lockAxis === 'y') {
      this.#axis = this.options.lockAxis
    } else if (this.options.lockAxis === 'auto' && !this.#axis) {
      const metrics = this.#metrics()
      if (metrics.totalDisplacement >= this.options.axisThreshold) this.#axis = metrics.axis
    }
  }

  #emit(phase: PanGestureDetail['phase']): void {
    const detail = this.#createDetail(phase)
    this.#currentDetail = detail
    this.emit(detail)
  }

  #createDetail(phase: PanGestureDetail['phase']): PanGestureDetail {
    const metrics = this.#metrics()
    return {
      gestureName: 'pan',
      phase,
      inputId: [...this.#state.keys()],
      timestamp: Math.max(...this.trackers.map((tracker) => tracker.current.timestamp)),
      ...metrics,
      axis: this.#axis ?? metrics.axis,
    }
  }

  #cancel(excludeInputId?: number): void {
    if (!this.#state.size || this.#cancelling) return
    this.#cancelling = true
    try {
      if (this.#started) this.#emit('cancel')
      const ids = [...this.#state.keys()].filter((id) => id !== excludeInputId)
      for (const id of ids) this.disposition(id, 'reject')
      this.reset()
    } finally {
      this.#cancelling = false
    }
  }
}

export function pan(): PanGestureRecognizer
export function pan(listener: GestureListener<PanGestureDetail>): PanGestureRecognizer
export function pan(options: Partial<PanGestureOptions>): PanGestureRecognizer
export function pan(
  listener: GestureListener<PanGestureDetail>,
  options: Partial<PanGestureOptions>,
): PanGestureRecognizer
export function pan(
  listenerOrOptions?: GestureListener<PanGestureDetail> | Partial<PanGestureOptions>,
  options?: Partial<PanGestureOptions>,
): PanGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new PanGestureRecognizer(options, listenerOrOptions)
    : new PanGestureRecognizer(listenerOrOptions, undefined)
}
