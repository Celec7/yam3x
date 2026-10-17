import type { PointerInput } from './input'
import { PointerTracker } from './pointer-tracker'
import { GestureRecognizerBase } from './recognizer'
import type { GestureDetail, GestureOptions, GesturePhase } from './types'

export interface MultiPointerOptions extends GestureOptions {
  readonly pointers: number
  readonly minDisplacement: number
  readonly maxPressInterval: number
  readonly activationMode?: 'press' | 'move'
}

export const defaultMultiPointerOptions: MultiPointerOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  pointers: 2,
  minDisplacement: 4,
  maxPressInterval: 120,
  activationMode: 'press',
}

type PointerState = {
  tracker: PointerTracker
  pressedAt: number
  active: boolean
  accepted: boolean
}

/** Shared multi-pointer lifecycle and resolver integration for transform recognizers. */
export abstract class MultiPointerGestureRecognizer<
  TDetail extends GestureDetail,
  TOptions extends MultiPointerOptions = MultiPointerOptions,
> extends GestureRecognizerBase<TDetail, TOptions> {
  #state = new Map<number, PointerState>()
  #started = false
  #invalid = false
  #cancelling = false

  protected constructor(
    options: Partial<TOptions> = {},
    defaults: TOptions = defaultMultiPointerOptions as TOptions,
  ) {
    super(options, defaults)
  }

  protected get trackers(): PointerTracker[] {
    return [...this.#state.values()].map((state) => state.tracker)
  }
  protected get pointerIds(): number[] {
    return [...this.#state.keys()]
  }
  protected get activePointerInputs(): PointerInput[] {
    return this.trackers.map((tracker) => tracker.current)
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
      const firstPressedAt = Math.min(...[...this.#state.values()].map((state) => state.pressedAt))
      if (input.timestamp - firstPressedAt > this.options.maxPressInterval) {
        this.#cancel()
        return
      }
    }
    this.#state.set(input.inputId, {
      tracker: new PointerTracker(input),
      pressedAt: input.timestamp,
      active: true,
      accepted: false,
    })
    this.disposition(input.inputId, 'defer')
    this.#invalid = (this.options.activationMode ?? 'press') === 'move'
    if (this.#ready()) this.onPointerSetReady()
  }

  protected override onPointerMove(input: PointerInput): void {
    if (this.#invalid) return
    if (!this.#state.has(input.inputId) && (this.options.activationMode ?? 'press') === 'move') {
      this.#state.set(input.inputId, {
        tracker: new PointerTracker(input),
        pressedAt: input.timestamp,
        active: true,
        accepted: false,
      })
      this.disposition(input.inputId, 'defer')
      if (this.#ready()) this.onPointerSetReady()
    }
    const state = this.#state.get(input.inputId)
    if (!state || !this.#allActive()) return
    state.tracker.append(input)
    if (!this.#started && this.activationMagnitude() >= this.options.minDisplacement) {
      this.onActivated()
      this.#started = true
      this.emit(this.createDetail('start'))
    } else if (this.#started) {
      this.emit(this.createDetail('update'))
    }
  }

  protected override onPointerUp(input: PointerInput): void {
    const state = this.#state.get(input.inputId)
    if (!state) return
    state.active = false
    state.tracker.append(input)
    if (this.#started) {
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
      this.emit(this.createDetail('end'))
      this.reset()
    }
  }

  protected override onReject(inputId: number): void {
    if (this.#state.has(inputId)) this.#cancel(inputId)
  }

  reset(): void {
    this.#state.clear()
    this.#started = this.#invalid = false
    this.onReset()
  }

  protected onPointerSetReady(): void {}
  protected onActivated(): void {}
  protected onReset(): void {}
  protected abstract activationMagnitude(): number
  protected abstract createDetail(phase: GesturePhase): TDetail

  protected centroid() {
    return PointerTracker.centroid(...this.trackers)
  }

  #ready(): boolean {
    return this.#state.size === this.options.pointers
  }

  #allActive(): boolean {
    return this.#ready() && [...this.#state.values()].every((state) => state.active)
  }

  #cancel(excludeInputId?: number): void {
    if (!this.#state.size || this.#cancelling) return
    this.#cancelling = true
    try {
      if (this.#started) this.emit(this.createDetail('cancel'))
      for (const id of this.pointerIds.filter((id) => id !== excludeInputId))
        this.disposition(id, 'reject')
      this.reset()
    } finally {
      this.#cancelling = false
    }
  }
}
