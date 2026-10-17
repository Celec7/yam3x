import type { PointerInput } from './input'
import { PointerTracker } from './pointer-tracker'
import { GestureRecognizerBase } from './recognizer'
import type { GestureDetail, GestureListener, GestureOptions } from './types'

export interface LongPressOptions extends GestureOptions {
  readonly pointers: number
  readonly minDuration: number
  readonly maxDisplacement: number
  readonly maxPressInterval: number
  readonly discrete: boolean
}

export interface LongPressDetail extends GestureDetail {
  readonly clientX: number
  readonly clientY: number
  readonly localX: number
  readonly localY: number
  readonly duration: number
}

const defaultLongPressOptions: LongPressOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 1,
  minDuration: 500,
  maxDisplacement: 4,
  maxPressInterval: 120,
  discrete: false,
}

type LongPressPointerState = { tracker: PointerTracker; pressTimestamp: number; accepted: boolean }

/** Recognizes sustained primary-pointer contact and optionally remains discrete until release. */
export class LongPressGestureRecognizer extends GestureRecognizerBase<
  LongPressDetail,
  LongPressOptions
> {
  #state = new Map<number, LongPressPointerState>()
  #timer?: ReturnType<typeof setTimeout>
  #starting = false
  #started = false
  #cancelling = false

  constructor(
    options: Partial<LongPressOptions> = {},
    listener?: GestureListener<LongPressDetail>,
  ) {
    super(options, defaultLongPressOptions)
    if (listener) this.addListener(listener)
  }

  get eager(): boolean {
    return true
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
      const firstPressedAt = Math.min(
        ...[...this.#state.values()].map((state) => state.pressTimestamp),
      )
      if (input.timestamp - firstPressedAt > this.options.maxPressInterval) {
        this.#cancel()
        return
      }
    }
    this.#state.set(input.inputId, {
      tracker: new PointerTracker(input),
      pressTimestamp: input.timestamp,
      accepted: false,
    })
    this.disposition(input.inputId, 'defer')
    if (this.#state.size !== this.options.pointers) return

    if (this.options.discrete) {
      this.#starting = true
      this.#timer = setTimeout(
        () => {
          this.#timer = undefined
          if (!this.#state.size) return
          this.#started = true
          this.emit(this.#detail('start'))
        },
        Math.max(0, this.options.minDuration),
      )
    } else {
      this.#started = true
      this.emit(this.#detail('start'))
      this.#timer = setTimeout(
        () => {
          this.#timer = undefined
          if (!this.#state.size) return
          this.disposition([...this.#state.keys()], 'accept')
        },
        Math.max(0, this.options.minDuration),
      )
    }
  }

  protected override onPointerMove(input: PointerInput): void {
    const state = this.#state.get(input.inputId)
    if (!state) return
    state.tracker.append(input)
    if (!this.#started && !this.#starting) return
    if (
      PointerTracker.centroid(...this.#trackers()).totalDisplacement > this.options.maxDisplacement
    )
      this.#cancel()
  }

  protected override onPointerUp(input: PointerInput): void {
    const state = this.#state.get(input.inputId)
    if (!state) return
    if (this.options.discrete && this.#started) this.disposition([...this.#state.keys()], 'accept')
    else this.#cancel()
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
    this.#starting = this.#started = false
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

  #detail(phase: LongPressDetail['phase']): LongPressDetail {
    const trackers = this.#trackers()
    const centroid = PointerTracker.centroid(...trackers)
    return {
      gestureName: 'long-press',
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

export function longPress(): LongPressGestureRecognizer
export function longPress(listener: GestureListener<LongPressDetail>): LongPressGestureRecognizer
export function longPress(options: Partial<LongPressOptions>): LongPressGestureRecognizer
export function longPress(
  listener: GestureListener<LongPressDetail>,
  options: Partial<LongPressOptions>,
): LongPressGestureRecognizer
export function longPress(
  listenerOrOptions?: GestureListener<LongPressDetail> | Partial<LongPressOptions>,
  options?: Partial<LongPressOptions>,
): LongPressGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new LongPressGestureRecognizer(options, listenerOrOptions)
    : new LongPressGestureRecognizer(listenerOrOptions, undefined)
}
