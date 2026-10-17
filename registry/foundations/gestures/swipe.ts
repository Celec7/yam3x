import type { GestureInput, PointerInput } from './input'
import { GestureRecognizerBase } from './recognizer'
import type { GestureDetail, GestureListener, GestureOptions } from './types'
import { PanGestureRecognizer } from './pan'
import type { PanGestureDetail } from './pan'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeGestureOptions extends GestureOptions {
  readonly pointers: number
  readonly startThreshold: number
  readonly minVelocity: number
  readonly directions: readonly SwipeDirection[]
  readonly directionThreshold: number
  readonly directionGracePeriod: number
  readonly minDisplacement: number
  readonly maxPressInterval: number
}

export interface SwipeGestureDetail extends GestureDetail {
  readonly direction: SwipeDirection
  readonly axis: 'x' | 'y'
  readonly startClientX: number
  readonly startClientY: number
  readonly startLocalX: number
  readonly startLocalY: number
  readonly translationX: number
  readonly translationY: number
  readonly velocityX: number
  readonly velocityY: number
  readonly speed: number
  readonly displacement: number
  readonly duration: number
}

export const defaultSwipeOptions: SwipeGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 1,
  startThreshold: 4,
  minVelocity: 0.3,
  directions: ['left', 'right', 'up', 'down'],
  directionThreshold: 12,
  directionGracePeriod: 0,
  minDisplacement: 24,
  maxPressInterval: 120,
}

type SwipeState = { pan: PanGestureDetail; direction: SwipeDirection; axis: 'x' | 'y' }

/** Interprets a Pan stream as a directional, velocity-qualified swipe. */
export class SwipeGestureRecognizer extends GestureRecognizerBase<
  SwipeGestureDetail,
  SwipeGestureOptions
> {
  #pan: PanGestureRecognizer
  #state?: SwipeState

  constructor(
    options: Partial<SwipeGestureOptions> = {},
    listener?: GestureListener<SwipeGestureDetail>,
  ) {
    super(options, defaultSwipeOptions)
    if (listener) this.addListener(listener)
    this.#pan = new PanGestureRecognizer({
      ...this.options,
      minDisplacement: this.options.startThreshold,
    })
    this.#pan.addListener((detail) => this.#onPan(detail))
    this.#pan.onDisposition = (inputId, disposition) => {
      if (disposition === 'accept') {
        const detail = this.#pan.currentDetail
        if (detail && this.#qualifies(detail)) this.disposition(inputId, 'accept')
        else this.disposition(inputId, 'reject')
      } else {
        this.disposition(inputId, disposition)
      }
    }
  }

  get eager(): boolean {
    return true
  }

  override set options(value: Partial<SwipeGestureOptions>) {
    super.options = value
    this.#syncPanOptions()
  }

  override get options(): SwipeGestureOptions {
    return super.options
  }

  override get disabled(): boolean {
    return super.disabled
  }
  override set disabled(value: boolean) {
    super.disabled = value
    this.#pan.disabled = value
  }
  override shouldCapturePointer(input: PointerInput): boolean {
    return this.#pan.shouldCapturePointer(input)
  }
  override onInput(input: GestureInput): void {
    this.#pan.onInput(input)
  }

  protected override onAccept(inputId: number): void {
    this.#pan.onResolution(inputId, 'accept')
  }
  protected override onReject(inputId: number): void {
    this.#pan.onResolution(inputId, 'reject')
  }

  reset(): void {
    this.#state = undefined
    this.#pan.reset()
  }

  #syncPanOptions(): void {
    if (!this.#pan) return
    this.#pan.options = {
      priority: this.options.priority,
      buttons: this.options.buttons,
      pointerTypes: this.options.pointerTypes,
      inputFilter: this.options.inputFilter,
      pointers: this.options.pointers,
      maxPressInterval: this.options.maxPressInterval,
      minDisplacement: this.options.startThreshold,
    }
  }

  #onPan(detail: PanGestureDetail): void {
    switch (detail.phase) {
      case 'start':
        this.#state = { pan: detail, direction: this.#direction(detail), axis: detail.axis }
        this.emit(this.#createDetail('start', this.#state))
        break
      case 'update': {
        const previousAxis = this.#state?.axis ?? detail.axis
        const next = { pan: detail, direction: this.#direction(detail), axis: detail.axis }
        this.#state = next
        if (
          this.options.directionGracePeriod > 0 &&
          detail.duration > this.options.directionGracePeriod &&
          (previousAxis !== next.axis || !this.options.directions.includes(next.direction))
        ) {
          this.disposition(detail.inputId, 'reject')
          break
        }
        this.emit(this.#createDetail('update', next))
        break
      }
      case 'end':
        if (this.#state)
          this.emit(
            this.#createDetail('end', {
              pan: detail,
              direction: this.#direction(detail),
              axis: detail.axis,
            }),
          )
        this.reset()
        break
      case 'cancel':
        if (this.#state)
          this.emit(
            this.#createDetail('cancel', {
              pan: detail,
              direction: this.#direction(detail),
              axis: detail.axis,
            }),
          )
        this.reset()
        break
    }
  }

  #qualifies(detail: PanGestureDetail): boolean {
    const direction = this.#direction(detail)
    const committed =
      detail.axis === 'x'
        ? Math.abs(detail.totalDeltaX) >= this.options.directionThreshold
        : Math.abs(detail.totalDeltaY) >= this.options.directionThreshold
    return (
      detail.totalDisplacement >= this.options.minDisplacement &&
      detail.speed >= this.options.minVelocity &&
      committed &&
      this.options.directions.includes(direction)
    )
  }

  #direction(detail: PanGestureDetail): SwipeDirection {
    if (detail.axis === 'x') return detail.totalDeltaX > 0 ? 'right' : 'left'
    return detail.totalDeltaY > 0 ? 'down' : 'up'
  }

  #createDetail(phase: SwipeGestureDetail['phase'], state: SwipeState): SwipeGestureDetail {
    const detail = state.pan
    return {
      gestureName: 'swipe',
      phase,
      inputId: detail.inputId,
      timestamp: detail.timestamp,
      direction: state.direction,
      axis: state.axis,
      startClientX: detail.startClientX,
      startClientY: detail.startClientY,
      startLocalX: detail.startLocalX,
      startLocalY: detail.startLocalY,
      translationX: detail.totalDeltaX,
      translationY: detail.totalDeltaY,
      velocityX: detail.velocityX,
      velocityY: detail.velocityY,
      speed: detail.speed,
      displacement: detail.totalDisplacement,
      duration: detail.duration,
    }
  }
}

export function swipe(): SwipeGestureRecognizer
export function swipe(listener: GestureListener<SwipeGestureDetail>): SwipeGestureRecognizer
export function swipe(options: Partial<SwipeGestureOptions>): SwipeGestureRecognizer
export function swipe(
  listener: GestureListener<SwipeGestureDetail>,
  options: Partial<SwipeGestureOptions>,
): SwipeGestureRecognizer
export function swipe(
  listenerOrOptions?: GestureListener<SwipeGestureDetail> | Partial<SwipeGestureOptions>,
  options?: Partial<SwipeGestureOptions>,
): SwipeGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new SwipeGestureRecognizer(options, listenerOrOptions)
    : new SwipeGestureRecognizer(listenerOrOptions, undefined)
}
