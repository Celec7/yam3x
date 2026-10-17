export type GestureInputKind =
  | 'pointerover'
  | 'pointerenter'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel'
  | 'pointerout'
  | 'pointerleave'
  | 'wheel'
export type PointerType = 'mouse' | 'pen' | 'touch'
export type PointerButton = 'primary' | 'secondary' | 'middle' | 'back' | 'forward'

export interface GestureInputBase {
  readonly inputId: number
  readonly kind: GestureInputKind
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  readonly currentTarget: HTMLElement
  readonly target: EventTarget | null
  readonly button: number
  readonly buttons: number
  readonly timestamp: number
}

export interface PointerInput extends GestureInputBase {
  readonly kind: Exclude<GestureInputKind, 'wheel'>
  readonly pointerType: PointerType
  readonly clientX: number
  readonly clientY: number
  readonly localX: number
  readonly localY: number
}

export interface WheelInput extends GestureInputBase {
  readonly kind: 'wheel'
  readonly deltaX: number
  readonly deltaY: number
  readonly deltaZ: number
  readonly deltaMode: number
}

export type GestureInput = PointerInput | WheelInput

export function normalizePointerEvent(event: PointerEvent, element: HTMLElement): PointerInput {
  const bounds = element.getBoundingClientRect()
  const pointerType = event.pointerType as PointerType
  return {
    inputId: event.pointerId,
    kind: event.type as PointerInput['kind'],
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    currentTarget: element,
    target: event.target,
    button: event.button,
    buttons: event.buttons,
    pointerType,
    clientX: event.clientX,
    clientY: event.clientY,
    localX: event.clientX - bounds.left,
    localY: event.clientY - bounds.top,
    timestamp: event.timeStamp,
  }
}

export function normalizeWheelEvent(event: WheelEvent, element: HTMLElement): WheelInput {
  return {
    inputId: -1,
    kind: 'wheel',
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    currentTarget: element,
    target: event.target,
    button: event.button,
    buttons: event.buttons,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    deltaZ: event.deltaZ,
    deltaMode: event.deltaMode,
    timestamp: event.timeStamp,
  }
}
