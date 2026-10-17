import type { IconVariant } from './icon.types'

export interface SvgIconInfo {
  viewBox: string
  path: string
}

export interface SvgIconFillSet {
  outlined: SvgIconInfo
  filled: SvgIconInfo
}

interface StoredIcon {
  outlinedViewBox: string
  filledViewBox: string
  outlinedPath: string
  filledPath: string
}

const variants: IconVariant[] = ['outlined', 'rounded', 'sharp']
const viewBoxPattern = /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?$/
const pathPattern = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/
const icons = new Map<string, StoredIcon>()
const observers = new Map<string, Set<() => void>>()

function keyFor(name: string, variant: IconVariant): string {
  return `${variant}-${name}`
}

function validateIconInfo(name: string, variant: IconVariant, info: SvgIconInfo): void {
  if (!viewBoxPattern.test(info.viewBox)) {
    throw new Error(
      `Unable to register icon '${name}' for variant '${variant}'. Invalid viewbox data.`,
    )
  }
  if (!pathPattern.test(info.path)) {
    throw new Error(
      `Unable to register icon '${name}' for variant '${variant}'. Invalid path data.`,
    )
  }
}

export function registerIcon(name: string, variant: IconVariant, fillSet: SvgIconFillSet): void {
  if (!variants.includes(variant)) {
    throw new Error(`Unable to register icon '${name}'. Invalid variant '${variant}'.`)
  }
  validateIconInfo(name, variant, fillSet.outlined)
  validateIconInfo(name, variant, fillSet.filled)

  const key = keyFor(name, variant)
  icons.set(key, {
    outlinedViewBox: fillSet.outlined.viewBox,
    filledViewBox: fillSet.filled.viewBox,
    outlinedPath: fillSet.outlined.path,
    filledPath: fillSet.filled.path,
  })
  for (const notify of [...(observers.get(key) ?? [])]) notify()
}

export function hasRegisteredIcon(name: string, variant: IconVariant): boolean {
  return icons.has(keyFor(name, variant))
}

export function getRegisteredIcon(name: string, variant: IconVariant): StoredIcon | undefined {
  return icons.get(keyFor(name, variant))
}

export function observeIcon(name: string, variant: IconVariant, callback: () => void): () => void {
  const key = keyFor(name, variant)
  const callbacks = observers.get(key) ?? new Set<() => void>()
  callbacks.add(callback)
  observers.set(key, callbacks)

  return () => {
    callbacks.delete(callback)
    if (callbacks.size === 0) observers.delete(key)
  }
}
