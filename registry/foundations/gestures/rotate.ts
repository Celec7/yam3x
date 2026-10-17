import { MultiPointerGestureRecognizer } from './multi-pointer'
import type { MultiPointerOptions } from './multi-pointer'
import type { GestureDetail, GestureListener, GesturePhase } from './types'

export interface RotateGestureOptions extends MultiPointerOptions {
  readonly activationMode: 'press' | 'move'
}

export interface RotateGestureDetail extends GestureDetail {
  readonly rotation: number
  readonly rotationDelta: number
  readonly rotationVelocity: number
  readonly currentAngle: number
  readonly initialAngle: number
}

export const defaultRotateOptions: RotateGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 2,
  minDisplacement: 4,
  maxPressInterval: 120,
  activationMode: 'press',
}

function angleDelta(next: number, previous: number): number {
  let delta = next - previous
  while (delta > Math.PI) delta -= 2 * Math.PI
  while (delta < -Math.PI) delta += 2 * Math.PI
  return delta
}

export class RotateGestureRecognizer extends MultiPointerGestureRecognizer<
  RotateGestureDetail,
  RotateGestureOptions
> {
  #pressAngle = 0
  #pressDistance = 0
  #initialAngle = 0
  #previousAngle = 0
  #rotation = 0
  #previousTimestamp = 0

  constructor(
    options: Partial<RotateGestureOptions> = {},
    listener?: GestureListener<RotateGestureDetail>,
  ) {
    super(options, defaultRotateOptions)
    if (listener) this.addListener(listener)
  }

  protected override onPointerSetReady(): void {
    this.#pressAngle = this.#currentAngle()
    this.#pressDistance = this.#distance()
  }

  protected override onActivated(): void {
    this.#initialAngle = this.#previousAngle = this.#currentAngle()
    this.#rotation = 0
    this.#previousTimestamp = Math.max(...this.activePointerInputs.map((input) => input.timestamp))
  }

  protected override onReset(): void {
    this.#pressAngle =
      this.#pressDistance =
      this.#initialAngle =
      this.#previousAngle =
      this.#rotation =
      this.#previousTimestamp =
        0
  }

  protected activationMagnitude(): number {
    return Math.max(
      this.centroid().totalDisplacement,
      Math.abs(angleDelta(this.#currentAngle(), this.#pressAngle)) *
        Math.max(this.#distance(), this.#pressDistance),
    )
  }

  protected createDetail(phase: GesturePhase): RotateGestureDetail {
    const currentAngle = this.#currentAngle()
    const rotationDelta = phase === 'start' ? 0 : angleDelta(currentAngle, this.#previousAngle)
    if (phase !== 'start') this.#rotation += rotationDelta
    const timestamp = Math.max(...this.activePointerInputs.map((input) => input.timestamp))
    const deltaTime = timestamp - this.#previousTimestamp
    const detail: RotateGestureDetail = {
      gestureName: 'rotate',
      phase,
      inputId: this.pointerIds,
      timestamp,
      rotation: this.#rotation,
      rotationDelta,
      rotationVelocity: deltaTime > 0 ? rotationDelta / deltaTime : 0,
      currentAngle,
      initialAngle: this.#initialAngle,
    }
    this.#previousAngle = currentAngle
    this.#previousTimestamp = timestamp
    return detail
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

  #currentAngle(): number {
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

export function rotate(): RotateGestureRecognizer
export function rotate(listener: GestureListener<RotateGestureDetail>): RotateGestureRecognizer
export function rotate(options: Partial<RotateGestureOptions>): RotateGestureRecognizer
export function rotate(
  listener: GestureListener<RotateGestureDetail>,
  options: Partial<RotateGestureOptions>,
): RotateGestureRecognizer
export function rotate(
  listenerOrOptions?: GestureListener<RotateGestureDetail> | Partial<RotateGestureOptions>,
  options?: Partial<RotateGestureOptions>,
): RotateGestureRecognizer {
  return typeof listenerOrOptions === 'function'
    ? new RotateGestureRecognizer(options, listenerOrOptions)
    : new RotateGestureRecognizer(listenerOrOptions, undefined)
}
