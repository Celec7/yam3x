import type { GestureInput, PointerInput, WheelInput } from './input'
import { defaultGestureOptions, pointerButtonCode } from './types'
import type {
  GestureDetail,
  GestureDisposition,
  GestureListener,
  GestureOptions,
  GestureRecognizer,
  GestureResolution,
} from './types'

export abstract class GestureRecognizerBase<
  TDetail extends GestureDetail,
  TOptions extends GestureOptions = GestureOptions,
> implements GestureRecognizer<TDetail, TOptions> {
  #options: TOptions
  #disabled = false
  onDisposition?: (inputId: number, disposition: GestureDisposition) => void
  #listeners = new Set<GestureListener<TDetail>>()

  protected constructor(
    options: Partial<TOptions> = {},
    defaults: TOptions = defaultGestureOptions as TOptions,
  ) {
    this.#options = { ...defaults, ...options }
  }

  get options(): TOptions {
    return this.#options
  }
  set options(value: Partial<TOptions>) {
    this.#options = { ...this.#options, ...value }
  }

  get disabled(): boolean {
    return this.#disabled
  }
  set disabled(value: boolean) {
    this.#disabled = value
    if (value) this.reset()
  }

  canReceiveInput(input: GestureInput): boolean {
    if (this.disabled) return false
    if (input.kind !== 'wheel') {
      const pointer = input as PointerInput
      if (!this.options.pointerTypes.includes(pointer.pointerType)) return false
      if (
        pointer.kind === 'pointerdown' &&
        this.options.buttons.length &&
        !this.options.buttons.some(
          (button) => (pointer.buttons & (1 << pointerButtonCode[button])) !== 0,
        )
      )
        return false
    }
    return this.options.inputFilter?.(input) ?? true
  }

  addListener(listener: GestureListener<TDetail>): void {
    this.#listeners.add(listener)
  }

  removeListener(listener: GestureListener<TDetail>): void {
    this.#listeners.delete(listener)
  }

  protected emit(detail: TDetail): void {
    for (const listener of [...this.#listeners]) listener(detail)
  }

  protected disposition(
    inputId: number | readonly number[],
    disposition: GestureDisposition,
  ): void {
    const ids = Array.isArray(inputId) ? inputId : [inputId]
    for (const id of ids) this.onDisposition?.(id, disposition)
  }

  onInput(input: GestureInput): void {
    switch (input.kind) {
      case 'pointerdown':
        this.onPointerDown(input)
        break
      case 'pointermove':
        this.onPointerMove(input)
        break
      case 'pointerup':
        this.onPointerUp(input)
        break
      case 'pointercancel':
        this.onPointerCancel(input)
        break
      case 'wheel':
        this.onWheel(input)
        break
      default:
        this.onOtherPointerInput(input)
    }
  }

  onResolution(inputId: number, resolution: GestureResolution): void {
    if (resolution === 'accept') this.onAccept(inputId)
    else this.onReject(inputId)
  }

  shouldCapturePointer(_input: PointerInput): boolean {
    return false
  }
  protected onPointerDown(_input: PointerInput): void {}
  protected onPointerMove(_input: PointerInput): void {}
  protected onPointerUp(_input: PointerInput): void {}
  protected onPointerCancel(_input: PointerInput): void {}
  protected onOtherPointerInput(_input: PointerInput): void {}
  protected onWheel(_input: WheelInput): void {}
  protected abstract onAccept(inputId: number): void
  protected abstract onReject(inputId: number): void
  abstract reset(): void
}
