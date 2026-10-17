import type { GestureInput, PointerButton, PointerInput, PointerType } from './input'

export type GesturePhase = 'start' | 'update' | 'end' | 'cancel'
export type GestureDisposition = 'accept' | 'reject' | 'hold' | 'release' | 'defer'
export type GestureResolution = 'accept' | 'reject'
export type GestureListener<TDetail extends GestureDetail> = (detail: TDetail) => void
export type GestureInputFilter = (input: GestureInput) => boolean

export interface GestureDetail {
  readonly gestureName: string
  readonly phase: GesturePhase
  readonly inputId: number | readonly number[]
  readonly timestamp: number
}

export interface GestureOptions {
  readonly priority: number
  readonly buttons: readonly PointerButton[]
  readonly pointerTypes: readonly PointerType[]
  readonly inputFilter?: GestureInputFilter
}

export const defaultGestureOptions: GestureOptions = {
  priority: 1,
  buttons: ['primary'],
  pointerTypes: ['mouse', 'pen', 'touch'],
}

export interface GestureRecognizer<
  TDetail extends GestureDetail = GestureDetail,
  TOptions extends GestureOptions = GestureOptions,
> {
  get options(): TOptions
  set options(value: Partial<TOptions>)
  disabled: boolean
  readonly eager?: boolean
  onDisposition?: (inputId: number, disposition: GestureDisposition) => void
  addListener(listener: GestureListener<TDetail>): void
  removeListener(listener: GestureListener<TDetail>): void
  canReceiveInput(input: GestureInput): boolean
  shouldCapturePointer?(input: PointerInput): boolean
  onInput(input: GestureInput): void
  onResolution(inputId: number, resolution: GestureResolution): void
  reset(): void
}

export const pointerButtonCode: Record<PointerButton, number> = {
  primary: 0,
  middle: 1,
  secondary: 2,
  back: 3,
  forward: 4,
}
