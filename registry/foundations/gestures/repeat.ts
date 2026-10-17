import type { GestureInput } from './input'
import { GestureRecognizerBase } from './recognizer'
import type {
  GestureDetail,
  GestureListener,
  GestureOptions,
  GesturePhase,
  GestureRecognizer,
} from './types'

export interface RepeatGestureOptions extends GestureOptions {
  readonly maxInterval: number
  readonly count: number
}

export interface RepeatGestureDetail<
  TDetail extends GestureDetail = GestureDetail,
> extends GestureDetail {
  readonly details: readonly TDetail[]
}

export const defaultRepeatOptions: RepeatGestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
  maxInterval: 250,
  count: 2,
}

export class RepeatGestureRecognizer<
  TDetail extends GestureDetail = GestureDetail,
> extends GestureRecognizerBase<RepeatGestureDetail<TDetail>, RepeatGestureOptions> {
  #recognizer?: GestureRecognizer<TDetail>
  #details: TDetail[] = []
  #accepted = new Set<number>()
  #timer?: ReturnType<typeof setTimeout>
  #resetting = false
  #childListener = (detail: TDetail) => this.#onDetail(detail)

  constructor(
    options?: Partial<RepeatGestureOptions>,
    listener?: GestureListener<RepeatGestureDetail<TDetail>>,
    recognizer?: GestureRecognizer<TDetail>,
  )
  constructor(
    recognizer: GestureRecognizer<TDetail>,
    options?: Partial<RepeatGestureOptions>,
    listener?: GestureListener<RepeatGestureDetail<TDetail>>,
  )
  constructor(
    first: Partial<RepeatGestureOptions> | GestureRecognizer<TDetail> = {},
    second?: GestureListener<RepeatGestureDetail<TDetail>> | Partial<RepeatGestureOptions>,
    third?: GestureRecognizer<TDetail> | GestureListener<RepeatGestureDetail<TDetail>>,
  ) {
    const recognizerFirst = 'onInput' in first
    const options = recognizerFirst ? (second && typeof second !== 'function' ? second : {}) : first
    const listener = recognizerFirst
      ? typeof third === 'function'
        ? third
        : undefined
      : typeof second === 'function'
        ? second
        : undefined
    const recognizer = recognizerFirst
      ? first
      : third && typeof third !== 'function'
        ? third
        : undefined
    super(options, defaultRepeatOptions)
    if (listener) this.addListener(listener)
    this.recognizer = recognizer
  }

  override get options(): RepeatGestureOptions {
    return super.options
  }
  override set options(value: Partial<RepeatGestureOptions>) {
    super.options = value
    this.#syncRecognizerOptions()
  }

  override get disabled(): boolean {
    return super.disabled
  }
  override set disabled(value: boolean) {
    super.disabled = value
    if (this.#recognizer) this.#recognizer.disabled = value
  }

  get recognizer(): GestureRecognizer<TDetail> | undefined {
    return this.#recognizer
  }
  set recognizer(value: GestureRecognizer<TDetail> | undefined) {
    if (this.#recognizer) {
      this.#recognizer.removeListener(this.#childListener)
      this.#recognizer.onDisposition = undefined
      this.#recognizer.reset()
    }
    this.#recognizer = value
    if (!value) return
    value.addListener(this.#childListener)
    value.onDisposition = (inputId, disposition) => this.#onDisposition(inputId, disposition)
    value.disabled = this.disabled
    this.#syncRecognizerOptions()
    value.reset()
  }
  override canReceiveInput(input: GestureInput): boolean {
    return (
      Boolean(this.#recognizer) &&
      super.canReceiveInput(input) &&
      this.#recognizer!.canReceiveInput(input)
    )
  }
  override shouldCapturePointer(
    input: Extract<GestureInput, { kind: `pointer${string}` }>,
  ): boolean {
    return this.#recognizer?.shouldCapturePointer?.(input) ?? false
  }
  override onInput(input: GestureInput): void {
    this.#recognizer?.onInput(input)
  }

  reset(): void {
    clearTimeout(this.#timer)
    this.#timer = undefined
    this.#recognizer?.reset()
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
    this.recognizer = undefined
  }

  protected override onAccept(inputId: number): void {
    if (!this.#accepted.delete(inputId)) return
    if (!this.#accepted.size && this.#details.length >= Math.max(1, this.options.count)) {
      this.emit(this.#detail('end'))
      this.reset()
    }
  }

  protected override onReject(inputId: number): void {
    if (this.#accepted.has(inputId) || this.#details.length > 0) {
      this.emit(this.#detail('cancel'))
      this.reset()
    }
  }

  #onDisposition(
    inputId: number,
    disposition: Parameters<NonNullable<GestureRecognizer<TDetail>['onDisposition']>>[1],
  ): void {
    switch (disposition) {
      case 'accept':
        if (!this.#accepted.has(inputId)) {
          this.#accepted.add(inputId)
          this.disposition(inputId, 'hold')
        }
        this.#recognizer?.onResolution(inputId, 'accept')
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

  #onDetail(detail: TDetail): void {
    if (detail.phase === 'start' || detail.phase === 'update') return
    if (detail.phase === 'cancel') {
      if (this.#details.length) this.emit(this.#detail('cancel'))
      this.reset()
      return
    }
    this.#details.push(detail)
    if (this.#details.length >= Math.max(1, this.options.count)) {
      for (const completed of this.#details) this.disposition(completed.inputId, 'accept')
      return
    }
    this.emit(this.#detail(this.#details.length === 1 ? 'start' : 'update'))
    this.#recognizer?.reset()
    if (this.options.maxInterval > 0) {
      clearTimeout(this.#timer)
      this.#timer = setTimeout(() => {
        this.emit(this.#detail('cancel'))
        this.reset()
      }, this.options.maxInterval)
    }
  }

  #detail(phase: GesturePhase): RepeatGestureDetail<TDetail> {
    const last = this.#details[this.#details.length - 1]
    return {
      gestureName: 'repeat',
      phase,
      inputId: this.#details.flatMap((detail) =>
        Array.isArray(detail.inputId) ? detail.inputId : [detail.inputId],
      ),
      timestamp: last?.timestamp ?? 0,
      details: [...this.#details],
    }
  }

  #syncRecognizerOptions(): void {
    if (!this.#recognizer) return
    this.#recognizer.options = {
      priority: this.options.priority,
      buttons: this.options.buttons,
      pointerTypes: this.options.pointerTypes,
      inputFilter: this.options.inputFilter,
    }
  }
}

export function repeat<TDetail extends GestureDetail>(
  recognizer: GestureRecognizer<TDetail>,
): RepeatGestureRecognizer<TDetail>
export function repeat<TDetail extends GestureDetail>(
  listener: GestureListener<RepeatGestureDetail<TDetail>>,
  recognizer: GestureRecognizer<TDetail>,
): RepeatGestureRecognizer<TDetail>
export function repeat<TDetail extends GestureDetail>(
  options: Partial<RepeatGestureOptions>,
  recognizer: GestureRecognizer<TDetail>,
): RepeatGestureRecognizer<TDetail>
export function repeat<TDetail extends GestureDetail>(
  listener: GestureListener<RepeatGestureDetail<TDetail>>,
  options: Partial<RepeatGestureOptions>,
  recognizer: GestureRecognizer<TDetail>,
): RepeatGestureRecognizer<TDetail>
export function repeat<TDetail extends GestureDetail>(
  recognizer: GestureRecognizer<TDetail>,
  options: Partial<RepeatGestureOptions>,
): RepeatGestureRecognizer<TDetail>
export function repeat<TDetail extends GestureDetail>(
  first:
    | GestureRecognizer<TDetail>
    | Partial<RepeatGestureOptions>
    | GestureListener<RepeatGestureDetail<TDetail>>,
  second?: GestureRecognizer<TDetail> | Partial<RepeatGestureOptions>,
  third?: GestureRecognizer<TDetail>,
): RepeatGestureRecognizer<TDetail> {
  let listener: GestureListener<RepeatGestureDetail<TDetail>> | undefined
  let options: Partial<RepeatGestureOptions> = {}
  let recognizer: GestureRecognizer<TDetail> | undefined
  if (typeof first === 'function') {
    listener = first
    if (second && 'onInput' in second) recognizer = second
    else {
      options = second ?? {}
      recognizer = third
    }
  } else if ('onInput' in first) {
    recognizer = first
    if (second && !('onInput' in second)) options = second
  } else {
    options = first
    if (second && 'onInput' in second) recognizer = second
  }
  if (!recognizer) throw new Error('repeat requires a child recognizer')
  return new RepeatGestureRecognizer(recognizer, options, listener)
}
