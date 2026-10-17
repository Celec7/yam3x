import { MultiPointerGestureRecognizer } from './multi-pointer'
import type { MultiPointerOptions } from './multi-pointer'
import type { GestureListener, GesturePhase } from './types'
import type { PanGestureDetail } from './pan'

export type TransformGestureOptions = MultiPointerOptions

export interface TransformGestureDetail extends PanGestureDetail {
  readonly translationX: number
  readonly translationY: number
  readonly initialDistance: number
  readonly currentDistance: number
  readonly scale: number
  readonly scaleDelta: number
  readonly scaleVelocity: number
  readonly initialAngle: number
  readonly currentAngle: number
  readonly rotation: number
  readonly rotationDelta: number
  readonly rotationVelocity: number
}

export const defaultTransformOptions: TransformGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 2,
  minDisplacement: 4,
  maxPressInterval: 120,
  activationMode: 'press',
}

function wrapAngle(value: number): number {
  while (value > Math.PI) value -= Math.PI * 2
  while (value < -Math.PI) value += Math.PI * 2
  return value
}

export class TransformGestureRecognizer extends MultiPointerGestureRecognizer<
  TransformGestureDetail,
  TransformGestureOptions
> {
  #pressDistance = 0
  #pressAngle = 0
  #initialDistance = 0
  #initialAngle = 0
  #previousDistance = 0
  #previousAngle = 0
  #rotation = 0
  #previousTimestamp = 0

  constructor(
    options: Partial<TransformGestureOptions> = {},
    listener?: GestureListener<TransformGestureDetail>,
  ) {
    super(options, defaultTransformOptions)
    if (listener) this.addListener(listener)
  }

  protected override onPointerSetReady(): void {
    this.#pressDistance = this.#distance()
    this.#pressAngle = this.#angle()
  }

  protected override onActivated(): void {
    this.#initialDistance = this.#previousDistance = this.#distance()
    this.#initialAngle = this.#previousAngle = this.#angle()
    this.#rotation = 0
    this.#previousTimestamp = Math.max(...this.activePointerInputs.map((input) => input.timestamp))
  }

  protected override onReset(): void {
    this.#pressDistance = this.#pressAngle = this.#initialDistance = this.#initialAngle = 0
    this.#previousDistance = this.#previousAngle = this.#rotation = this.#previousTimestamp = 0
  }

  protected activationMagnitude(): number {
    const centroidDisplacement = this.centroid().totalDisplacement
    const scaleDisplacement = Math.abs(this.#distance() - this.#pressDistance)
    const rotationDisplacement =
      Math.abs(wrapAngle(this.#angle() - this.#pressAngle)) *
      Math.max(this.#distance(), this.#pressDistance)
    return Math.max(centroidDisplacement, scaleDisplacement, rotationDisplacement)
  }

  protected createDetail(phase: GesturePhase): TransformGestureDetail {
    const metrics = this.centroid()
    const currentDistance = this.#distance()
    const currentAngle = this.#angle()
    const timestamp = Math.max(...this.activePointerInputs.map((input) => input.timestamp))
    const deltaTime = timestamp - this.#previousTimestamp
    const scale = this.#initialDistance > 0 ? currentDistance / this.#initialDistance : 1
    const scaleDelta =
      this.#initialDistance > 0
        ? (currentDistance - this.#previousDistance) / this.#initialDistance
        : 0
    const rotationDelta = phase === 'start' ? 0 : wrapAngle(currentAngle - this.#previousAngle)
    if (phase !== 'start') this.#rotation += rotationDelta
    const result: TransformGestureDetail = {
      ...metrics,
      gestureName: 'transform',
      phase,
      inputId: this.pointerIds,
      timestamp,
      translationX: metrics.totalDeltaX,
      translationY: metrics.totalDeltaY,
      initialDistance: this.#initialDistance,
      currentDistance,
      scale,
      scaleDelta,
      scaleVelocity: deltaTime > 0 ? scaleDelta / deltaTime : 0,
      initialAngle: this.#initialAngle,
      currentAngle,
      rotation: this.#rotation,
      rotationDelta,
      rotationVelocity: deltaTime > 0 ? rotationDelta / deltaTime : 0,
    }
    this.#previousDistance = currentDistance
    this.#previousAngle = currentAngle
    this.#previousTimestamp = timestamp
    return result
  }

  #center(): { x: number; y: number } {
    const inputs = this.activePointerInputs
    return {
      x: inputs.reduce((sum, input) => sum + input.clientX, 0) / inputs.length,
      y: inputs.reduce((sum, input) => sum + input.clientY, 0) / inputs.length,
    }
  }

  #distance(): number {
    const inputs = this.activePointerInputs
    if (!inputs.length) return 0
    const center = this.#center()
    return (
      inputs.reduce(
        (sum, input) => sum + Math.hypot(input.clientX - center.x, input.clientY - center.y),
        0,
      ) / inputs.length
    )
  }

  #angle(): number {
    const inputs = this.activePointerInputs
    if (inputs.length < 2) return 0
    if (inputs.length === 2)
      return Math.atan2(
        inputs[1]!.clientY - inputs[0]!.clientY,
        inputs[1]!.clientX - inputs[0]!.clientX,
      )
    const center = this.#center()
    const angles = inputs.map((input) =>
      Math.atan2(input.clientY - center.y, input.clientX - center.x),
    )
    return Math.atan2(
      angles.reduce((sum, angle) => sum + Math.sin(angle), 0),
      angles.reduce((sum, angle) => sum + Math.cos(angle), 0),
    )
  }
}

export function transform(): TransformGestureRecognizer
export function transform(
  listener: GestureListener<TransformGestureDetail>,
): TransformGestureRecognizer
export function transform(options: Partial<TransformGestureOptions>): TransformGestureRecognizer
export function transform(
  listener: GestureListener<TransformGestureDetail>,
  options: Partial<TransformGestureOptions>,
): TransformGestureRecognizer
export function transform(
  listenerOrOptions?: GestureListener<TransformGestureDetail> | Partial<TransformGestureOptions>,
  options?: Partial<TransformGestureOptions>,
): TransformGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new TransformGestureRecognizer(options, listenerOrOptions)
    : new TransformGestureRecognizer(listenerOrOptions, undefined)
}
