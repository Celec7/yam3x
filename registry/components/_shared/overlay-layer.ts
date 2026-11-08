export type OverlayLayerKind = 'dialog' | 'popup'

export interface OverlayLayer {
  readonly zIndex: number
  release(): void
}

interface OverlayLayerEntry {
  id: number
  kind: OverlayLayerKind
  close?: () => void
}

const BASE_Z_INDEX = 1000
const LAYER_STEP = 10

let entries: OverlayLayerEntry[] = []
let sequence = 0
let nextId = 0

/**
 * Reserve a floating layer in open order. A dialog closes open popups before it
 * takes a layer, so a new modal always covers the popups of lower surfaces.
 */
export function acquireOverlayLayer(kind: OverlayLayerKind, close?: () => void): OverlayLayer {
  if (kind === 'dialog') {
    for (const entry of [...entries]) {
      if (entry.kind === 'popup') entry.close?.()
    }
  }

  const entry: OverlayLayerEntry = { id: ++nextId, kind, close }
  entries.push(entry)
  sequence += 1
  const zIndex = BASE_Z_INDEX + sequence * LAYER_STEP
  let released = false

  return {
    zIndex,
    release() {
      if (released) return
      released = true
      entries = entries.filter((candidate) => candidate.id !== entry.id)
      if (entries.length === 0) sequence = 0
    },
  }
}
