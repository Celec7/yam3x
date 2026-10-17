import { MultiPointerGestureRecognizer } from './multi-pointer'
import type { MultiPointerOptions } from './multi-pointer'
import type { GestureListener, GesturePhase } from './types'
import type { PanGestureDetail } from './pan'

export type ScaleGestureOptions = Omit<MultiPointerOptions, 'activationMode'>

export interface ScaleGestureDetail extends PanGestureDetail {
  readonly initialDistance: number
  readonly currentDistance: number
  readonly scale: number
  readonly scaleDelta: number
  readonly scaleVelocity: number
}

export const defaultScaleOptions: ScaleGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 2,
  minDisplacement: 4,
  maxPressInterval: 120,
}

export class ScaleGestureRecognizer extends MultiPointerGestureRecognizer<
  ScaleGestureDetail,
  ScaleGestureOptions
> {
  #pressDistance = 0
  #initialDistance = 0
  #previousDistance = 0
  #previousTimestamp = 0

  constructor(
    options: Partial<ScaleGestureOptions> = {},
    listener?: GestureListener<ScaleGestureDetail>,
  ) {
    super(options, defaultScaleOptions)
    if (listener) this.addListener(listener)
  }

  protected override onPointerSetReady(): void {
    this.#pressDistance = this.#distance()
  }
  protected override onActivated(): void {
    this.#initialDistance = this.#previousDistance = this.#distance()
    this.#previousTimestamp = Math.max(...this.activePointerInputs.map((input) => input.timestamp))
  }
  protected override onReset(): void {
    this.#pressDistance =
      this.#initialDistance =
      this.#previousDistance =
      this.#previousTimestamp =
        0
  }

  protected activationMagnitude(): number {
    return Math.abs(this.#distance() - this.#pressDistance)
  }

  protected createDetail(phase: GesturePhase): ScaleGestureDetail {
    const metrics = this.centroid()
    const currentDistance = this.#distance()
    const timestamp = Math.max(...this.activePointerInputs.map((input) => input.timestamp))
    const deltaTime = timestamp - this.#previousTimestamp
    const scale = this.#initialDistance > 0 ? currentDistance / this.#initialDistance : 1
    const scaleDelta =
      this.#initialDistance > 0
        ? (currentDistance - this.#previousDistance) / this.#initialDistance
        : 0
    const scaleVelocity = deltaTime > 0 ? scaleDelta / deltaTime : 0
    const detail: ScaleGestureDetail = {
      ...metrics,
      gestureName: 'scale',
      phase,
      inputId: this.pointerIds,
      timestamp,
      initialDistance: this.#initialDistance,
      currentDistance,
      scale,
      scaleDelta,
      scaleVelocity,
    }
    this.#previousDistance = currentDistance
    this.#previousTimestamp = timestamp
    return detail
  }

  #distance(): number {
    const inputs = this.activePointerInputs
    if (!inputs.length) return 0
    const centerX = inputs.reduce((sum, input) => sum + input.clientX, 0) / inputs.length
    const centerY = inputs.reduce((sum, input) => sum + input.clientY, 0) / inputs.length
    return (
      inputs.reduce(
        (sum, input) => sum + Math.hypot(input.clientX - centerX, input.clientY - centerY),
        0,
      ) / inputs.length
    )
  }
}

export function scale(): ScaleGestureRecognizer
export function scale(listener: GestureListener<ScaleGestureDetail>): ScaleGestureRecognizer
export function scale(options: Partial<ScaleGestureOptions>): ScaleGestureRecognizer
export function scale(
  listener: GestureListener<ScaleGestureDetail>,
  options: Partial<ScaleGestureOptions>,
): ScaleGestureRecognizer
export function scale(
  listenerOrOptions?: GestureListener<ScaleGestureDetail> | Partial<ScaleGestureOptions>,
  options?: Partial<ScaleGestureOptions>,
): ScaleGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new ScaleGestureRecognizer(options, listenerOrOptions)
    : new ScaleGestureRecognizer(listenerOrOptions, undefined)
}
