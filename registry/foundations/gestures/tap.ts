import type { PointerInput } from './input'
import { PointerTracker } from './pointer-tracker'
import { GestureRecognizerBase } from './recognizer'
import type { GestureDetail, GestureListener, GestureOptions } from './types'

export interface TapGestureOptions extends GestureOptions {
  readonly pointers: number
  readonly maxDuration: number
  readonly maxDisplacement: number
  readonly maxPressInterval: number
  readonly maxReleaseInterval: number
}

export interface TapGestureDetail extends GestureDetail {
  readonly clientX: number
  readonly clientY: number
  readonly localX: number
  readonly localY: number
  readonly duration: number
}

const defaultTapOptions: TapGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 1,
  maxDuration: 180,
  maxDisplacement: 12,
  maxPressInterval: 120,
  maxReleaseInterval: 120,
}

type TapPointerState = {
  tracker: PointerTracker
  pressTimestamp: number
  releaseTimestamp?: number
  accepted: boolean
}

export class TapGestureRecognizer extends GestureRecognizerBase<
  TapGestureDetail,
  TapGestureOptions
> {
  #state = new Map<number, TapPointerState>()
  #timer?: ReturnType<typeof setTimeout>
  #started = false
  #cancelling = false

  constructor(
    options: Partial<TapGestureOptions> = {},
    listener?: GestureListener<TapGestureDetail>,
  ) {
    super(options, defaultTapOptions)
    if (listener) this.addListener(listener)
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
      accepted: false,
    })
    if (this.#state.size === 1 && this.options.maxDuration > 0) {
      this.#timer = setTimeout(() => this.#cancel(), this.options.maxDuration)
    }
    this.disposition(input.inputId, 'defer')
    if (!this.#started && this.#state.size === this.options.pointers) {
      this.#started = true
      this.emit(this.#detail('start'))
    }
  }

  protected override onPointerMove(input: PointerInput): void {
    const state = this.#state.get(input.inputId)
    if (!state) return
    state.tracker.append(input)
    if (
      this.#started &&
      PointerTracker.centroid(...this.#trackers()).totalDisplacement > this.options.maxDisplacement
    ) {
      this.#cancel()
    }
  }

  protected override onPointerUp(input: PointerInput): void {
    const state = this.#state.get(input.inputId)
    if (!state) return
    if (!this.#started) {
      this.#cancel()
      return
    }
    if (this.options.maxReleaseInterval > 0) {
      const priorReleases = [...this.#state.values()]
        .map((pointer) => pointer.releaseTimestamp)
        .filter((time): time is number => time !== undefined)
      if (
        priorReleases.length &&
        input.timestamp - Math.min(...priorReleases) > this.options.maxReleaseInterval
      ) {
        this.#cancel()
        return
      }
    }
    state.tracker.append(input)
    state.releaseTimestamp = input.timestamp
    if ([...this.#state.values()].every((pointer) => pointer.releaseTimestamp !== undefined)) {
      clearTimeout(this.#timer)
      this.#timer = undefined
    }
    this.disposition(input.inputId, 'accept')
  }

  protected override onPointerCancel(input: PointerInput): void {
    if (this.#state.has(input.inputId)) this.#cancel()
  }

  protected override onAccept(inputId: number): void {
    const state = this.#state.get(inputId)
    if (!state) return
    state.accepted = true
    if (this.#started && [...this.#state.values()].every((pointer) => pointer.accepted)) {
      this.emit(this.#detail('end'))
      this.reset()
    }
  }

  protected override onReject(inputId: number): void {
    if (this.#state.has(inputId)) this.#cancel(inputId)
  }

  reset(): void {
    clearTimeout(this.#timer)
    this.#timer = undefined
    this.#state.clear()
    this.#started = false
  }

  #trackers(): PointerTracker[] {
    return [...this.#state.values()].map((state) => state.tracker)
  }

  #cancel(excludeInputId?: number): void {
    if (!this.#state.size || this.#cancelling) return
    this.#cancelling = true
    try {
      if (this.#started) this.emit(this.#detail('cancel'))
      for (const inputId of [...this.#state.keys()].filter((id) => id !== excludeInputId))
        this.disposition(inputId, 'reject')
      this.reset()
    } finally {
      this.#cancelling = false
    }
  }

  #detail(phase: TapGestureDetail['phase']): TapGestureDetail {
    const trackers = this.#trackers()
    const centroid = PointerTracker.centroid(...trackers)
    return {
      gestureName: 'tap',
      phase,
      inputId: [...this.#state.keys()],
      timestamp: Math.max(...trackers.map((tracker) => tracker.current.timestamp)),
      clientX: centroid.startClientX,
      clientY: centroid.startClientY,
      localX: centroid.startLocalX,
      localY: centroid.startLocalY,
      duration:
        trackers.reduce((sum, tracker) => sum + tracker.detail.duration, 0) / trackers.length,
    }
  }
}

export function tap(): TapGestureRecognizer
export function tap(listener: GestureListener<TapGestureDetail>): TapGestureRecognizer
export function tap(options: Partial<TapGestureOptions>): TapGestureRecognizer
export function tap(
  listener: GestureListener<TapGestureDetail>,
  options: Partial<TapGestureOptions>,
): TapGestureRecognizer
export function tap(
  listenerOrOptions?: GestureListener<TapGestureDetail> | Partial<TapGestureOptions>,
  options?: Partial<TapGestureOptions>,
): TapGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new TapGestureRecognizer(options, listenerOrOptions)
    : new TapGestureRecognizer(listenerOrOptions, undefined)
}
