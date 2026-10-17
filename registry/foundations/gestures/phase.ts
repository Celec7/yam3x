import type { GestureDetail, GestureListener } from './types'

export interface GesturePhaseHandlers<TDetail extends GestureDetail> {
  onStart?: GestureListener<TDetail>
  onUpdate?: GestureListener<TDetail>
  onEnd?: GestureListener<TDetail>
  onCancel?: GestureListener<TDetail>
}

/** Route a gesture listener to a handler for its lifecycle phase. */
export function phase<TDetail extends GestureDetail>(
  handlers: GesturePhaseHandlers<TDetail>,
): GestureListener<TDetail> {
  return (detail) => {
    switch (detail.phase) {
      case 'start':
        handlers.onStart?.(detail)
        break
      case 'update':
        handlers.onUpdate?.(detail)
        break
      case 'end':
        handlers.onEnd?.(detail)
        break
      case 'cancel':
        handlers.onCancel?.(detail)
        break
    }
  }
}
