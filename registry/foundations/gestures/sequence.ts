import type { GestureInput } from './input'
import { GestureRecognizerBase } from './recognizer'
import type {
  GestureDetail,
  GestureListener,
  GestureOptions,
  GesturePhase,
  GestureRecognizer,
} from './types'

export interface SequenceGestureOptions extends GestureOptions {
  readonly maxInterval: number
}

export interface SequenceGestureDetail extends GestureDetail {
  readonly details: readonly GestureDetail[]
}

export const defaultSequenceOptions: SequenceGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  maxInterval: 250,
}

export class SequenceGestureRecognizer extends GestureRecognizerBase<
  SequenceGestureDetail,
  SequenceGestureOptions
> {
  #recognizers: GestureRecognizer[] = []
  #details: GestureDetail[] = []
  #accepted = new Set<number>()
  #timer?: ReturnType<typeof setTimeout>
  #resetting = false
  #childListener = (detail: GestureDetail) => this.#onDetail(detail)

  constructor(
    options: Partial<SequenceGestureOptions> = {},
    listener?: GestureListener<SequenceGestureDetail>,
    ...recognizers: GestureRecognizer[]
  ) {
    super(options, defaultSequenceOptions)
    this.setRecognizers(recognizers)
    if (listener) this.addListener(listener)
  }

  get recognizers(): readonly GestureRecognizer[] {
    return this.#recognizers
  }
  get recognizer(): GestureRecognizer | undefined {
    return this.#recognizers[this.#details.length]
  }

  setRecognizers(recognizers: readonly GestureRecognizer[]): void {
    for (const child of this.#recognizers) {
      child.removeListener(this.#childListener)
      child.onDisposition = undefined
      child.reset()
    }
    this.#recognizers = [...recognizers]
    for (const child of this.#recognizers) {
      child.addListener(this.#childListener)
      child.onDisposition = (inputId, disposition) =>
        this.#onDisposition(child, inputId, disposition)
      child.reset()
    }
    this.reset()
  }

  override canReceiveInput(input: GestureInput): boolean {
    return (
      Boolean(this.recognizer) &&
      super.canReceiveInput(input) &&
      this.recognizer!.canReceiveInput(input)
    )
  }
  override shouldCapturePointer(
    input: Extract<GestureInput, { kind: `pointer${string}` }>,
  ): boolean {
    return this.recognizer?.shouldCapturePointer?.(input) ?? false
  }
  override onInput(input: GestureInput): void {
    this.recognizer?.onInput(input)
  }

  reset(): void {
    clearTimeout(this.#timer)
    this.#timer = undefined
    this.#recognizers.forEach((child) => child.reset())
    const accepted = [...this.#accepted]
    this.#accepted.clear()
    this.#details = []
    if (!this.#resetting) {
      this.#resetting = true
      try {
        for (const inputId of accepted) this.disposition(inputId, 'release')
      } finally {
        this.#resetting = false
      }
    }
  }

  destroy(): void {
    this.reset()
    for (const child of this.#recognizers) {
      child.removeListener(this.#childListener)
      child.onDisposition = undefined
      child.reset()
    }
    this.#recognizers = []
  }

  protected override onAccept(inputId: number): void {
    if (!this.#accepted.delete(inputId)) return
    if (!this.#accepted.size && this.#details.length === this.#recognizers.length) {
      this.emit(this.#createDetail('end'))
      this.reset()
    }
  }

  protected override onReject(inputId: number): void {
    if (this.#accepted.has(inputId) || this.#details.length > 0) {
      this.emit(this.#createDetail('cancel'))
      this.reset()
    }
  }

  #onDisposition(
    child: GestureRecognizer,
    inputId: number,
    disposition: Parameters<NonNullable<GestureRecognizer['onDisposition']>>[1],
  ): void {
    switch (disposition) {
      case 'accept':
        if (!this.#accepted.has(inputId)) {
          this.#accepted.add(inputId)
          this.disposition(inputId, 'hold')
        }
        child.onResolution(inputId, 'accept')
        break
      case 'reject':
        if (!this.#accepted.has(inputId)) this.disposition(inputId, 'reject')
        this.reset()
        break
      case 'hold':
      case 'release':
      case 'defer':
        if (!this.#accepted.has(inputId)) this.disposition(inputId, disposition)
        break
    }
  }

  #onDetail(detail: GestureDetail): void {
    if (detail.phase === 'start' || detail.phase === 'update') return
    if (detail.phase === 'cancel') {
      if (this.#details.length) this.emit(this.#createDetail('cancel'))
      this.reset()
      return
    }
    this.#details.push(detail)
    if (this.#details.length === this.#recognizers.length) {
      for (const completed of this.#details) this.disposition(completed.inputId, 'accept')
      return
    }
    this.emit(this.#createDetail(this.#details.length === 1 ? 'start' : 'update'))
    if (this.options.maxInterval > 0) {
      clearTimeout(this.#timer)
      this.#timer = setTimeout(() => {
        this.emit(this.#createDetail('cancel'))
        this.reset()
      }, this.options.maxInterval)
    }
  }

  #createDetail(phase: GesturePhase): SequenceGestureDetail {
    const last = this.#details[this.#details.length - 1]
    return {
      gestureName: 'sequence',
      phase,
      inputId: this.#details.flatMap((detail) =>
        Array.isArray(detail.inputId) ? detail.inputId : [detail.inputId],
      ),
      timestamp: last?.timestamp ?? 0,
      details: [...this.#details],
    }
  }
}

export function sequence(
  ...args: Array<
    Partial<SequenceGestureOptions> | GestureRecognizer | GestureListener<SequenceGestureDetail>
  >
): SequenceGestureRecognizer {
  let listener: GestureListener<SequenceGestureDetail> | undefined
  let options: Partial<SequenceGestureOptions> = {}
  let index = 0
  if (typeof args[0] === 'function') {
    listener = args[0] as GestureListener<SequenceGestureDetail>
    index++
  }
  if (args[index] && typeof args[index] === 'object' && !('onInput' in args[index]!))
    options = args[index++] as Partial<SequenceGestureOptions>
  const recognizers = args
    .slice(index)
    .filter(
      (value): value is GestureRecognizer =>
        typeof value === 'object' && value !== null && 'onInput' in value,
    )
  return new SequenceGestureRecognizer(options, listener, ...recognizers)
}
