import type { PointerInput } from './input'

export interface PointerGestureDetail {
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

/** Tracks pointer samples and derives the same motion metrics used by Pan and Swipe. */
export class PointerTracker {
  #first: PointerInput
  #current: PointerInput
  #previousMove: PointerInput | undefined
  #lastMove: PointerInput | undefined

  constructor(initial: PointerInput) {
    this.#first = this.#current = initial
    if (initial.kind === 'pointermove') this.#lastMove = initial
  }

  get current(): PointerInput {
    return this.#current
  }
  get detail(): PointerGestureDetail {
    return this.#compute()
  }

  append(input: PointerInput): void {
    this.#current = input
    if (input.kind === 'pointermove') {
      this.#previousMove = this.#lastMove
      this.#lastMove = input
    }
  }

  static centroid(...trackers: PointerTracker[]): PointerGestureDetail {
    if (!trackers.length) throw new Error('PointerTracker.centroid requires at least one tracker')
    const details = trackers.map((tracker) => tracker.#compute())
    const average = (select: (detail: PointerGestureDetail) => number) =>
      details.reduce((sum, item) => sum + select(item), 0) / details.length
    const startClientX = average((x) => x.startClientX)
    const startClientY = average((x) => x.startClientY)
    const startLocalX = average((x) => x.startLocalX)
    const startLocalY = average((x) => x.startLocalY)
    const clientX = average((x) => x.clientX)
    const clientY = average((x) => x.clientY)
    const localX = average((x) => x.localX)
    const localY = average((x) => x.localY)
    const deltaX = average((x) => x.deltaX)
    const deltaY = average((x) => x.deltaY)
    const totalDeltaX = average((x) => x.totalDeltaX)
    const totalDeltaY = average((x) => x.totalDeltaY)
    const velocityX = average((x) => x.velocityX)
    const velocityY = average((x) => x.velocityY)
    const deltaTime = Math.max(...details.map((x) => x.deltaTime))
    const duration =
      Math.max(...trackers.map((x) => x.current.timestamp)) -
      Math.min(...trackers.map((x) => x.#first.timestamp))
    return {
      startClientX,
      startClientY,
      startLocalX,
      startLocalY,
      clientX,
      clientY,
      localX,
      localY,
      deltaX,
      deltaY,
      displacement: Math.hypot(deltaX, deltaY),
      totalDeltaX,
      totalDeltaY,
      totalDisplacement: Math.hypot(totalDeltaX, totalDeltaY),
      axis: Math.abs(totalDeltaX) >= Math.abs(totalDeltaY) ? 'x' : 'y',
      velocityX,
      velocityY,
      directionX: Math.sign(totalDeltaX),
      directionY: Math.sign(totalDeltaY),
      speed: Math.hypot(velocityX, velocityY),
      angle: totalDeltaX === 0 && totalDeltaY === 0 ? 0 : Math.atan2(totalDeltaY, totalDeltaX),
      duration,
      deltaTime,
    }
  }

  #compute(): PointerGestureDetail {
    const first = this.#first
    const current = this.#current
    const previous = this.#previousMove ?? first
    const last = this.#lastMove ?? first
    const deltaX = last.clientX - previous.clientX
    const deltaY = last.clientY - previous.clientY
    const totalDeltaX = last.clientX - first.clientX
    const totalDeltaY = last.clientY - first.clientY
    const deltaTime = last.timestamp - previous.timestamp
    const duration = current.timestamp - first.timestamp
    const velocityX = deltaTime > 0 ? deltaX / deltaTime : 0
    const velocityY = deltaTime > 0 ? deltaY / deltaTime : 0
    return {
      startClientX: first.clientX,
      startClientY: first.clientY,
      startLocalX: first.localX,
      startLocalY: first.localY,
      clientX: current.clientX,
      clientY: current.clientY,
      localX: current.localX,
      localY: current.localY,
      deltaX,
      deltaY,
      displacement: Math.hypot(deltaX, deltaY),
      totalDeltaX,
      totalDeltaY,
      totalDisplacement: Math.hypot(totalDeltaX, totalDeltaY),
      axis: Math.abs(totalDeltaX) >= Math.abs(totalDeltaY) ? 'x' : 'y',
      velocityX,
      velocityY,
      directionX: Math.sign(totalDeltaX),
      directionY: Math.sign(totalDeltaY),
      speed: Math.hypot(velocityX, velocityY),
      angle: totalDeltaX === 0 && totalDeltaY === 0 ? 0 : Math.atan2(totalDeltaY, totalDeltaX),
      duration,
      deltaTime,
    }
  }
}
