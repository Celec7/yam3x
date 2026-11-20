export function decimalPlaces(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 0
  const text = Math.abs(value).toString()
  const exponent = text.match(/e-(\d+)$/)
  if (exponent) return Number(exponent[1])
  return (text.split('.')[1] ?? '').length
}

export function roundToPlaces(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function createScrollFieldOptions(min: number, max: number, step: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0) {
    return []
  }
  if (max < min) return []
  const places = decimalPlaces(step)
  const count = Math.floor((max - min) / step + 1e-9) + 1
  return Array.from({ length: count }, (_, index) => roundToPlaces(min + index * step, places))
}

export function scrollFieldIndex(
  options: readonly number[],
  value: number | undefined,
  fallback = 0,
): number {
  if (!options.length) return 0
  if (value === undefined) return Math.min(fallback, options.length - 1)
  let closest = 0
  let distance = Number.POSITIVE_INFINITY
  for (let index = 0; index < options.length; index += 1) {
    const next = Math.abs(options[index]! - value)
    if (next < distance) {
      distance = next
      closest = index
    }
  }
  return closest
}

export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return ((index % count) + count) % count
}

export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(Math.max(index, 0), count - 1)
}

function localeDigits(locale: string | undefined): string[] {
  const format = new Intl.NumberFormat(locale, { useGrouping: false })
  return Array.from({ length: 10 }, (_, digit) => format.format(digit))
}

export interface ScrollFieldCodec {
  format(value: number | null | undefined): string
  parse(text: string): number | null
  readonly inputMode: 'numeric' | 'decimal'
  readonly places: number
}

/**
 * Formats and parses numbers in the field's locale. The formatter avoids group
 * separators so the wheel and input share a compact numeric token.
 */
export function createScrollFieldCodec(locale: string | undefined, step: number): ScrollFieldCodec {
  const places = decimalPlaces(step)
  const format = new Intl.NumberFormat(locale, {
    maximumFractionDigits: places,
    minimumFractionDigits: places,
    useGrouping: false,
  })
  const structure = new Intl.NumberFormat(locale, { useGrouping: false }).formatToParts(-1234.5)
  const minusSign = structure.find((part) => part.type === 'minusSign')?.value ?? '-'
  const decimalSeparator = structure.find((part) => part.type === 'decimal')?.value ?? '.'
  const groupSeparator = structure.find((part) => part.type === 'group')?.value
  const digits = localeDigits(locale)
  const digitMap = new Map(digits.map((glyph, digit) => [glyph, String(digit)]))

  function normalize(text: string): string {
    let normalized = text.trim()
    if (groupSeparator) normalized = normalized.split(groupSeparator).join('')
    normalized = normalized.replace(/\s/gu, '')
    if (digitMap.size) {
      for (const [glyph, ascii] of digitMap) {
        if (glyph !== ascii) normalized = normalized.split(glyph).join(ascii)
      }
    }
    if (minusSign !== '-') normalized = normalized.split(minusSign).join('-')
    if (decimalSeparator !== '.') normalized = normalized.split(decimalSeparator).join('.')
    return normalized
  }

  return {
    format(value) {
      if (value === null || value === undefined || !Number.isFinite(value)) return ''
      return format.format(value)
    },
    parse(text) {
      const normalized = normalize(text)
      if (!normalized) return null
      if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null
      const parsed = Number(normalized)
      return Number.isFinite(parsed) ? parsed : null
    },
    inputMode: places === 0 ? 'numeric' : 'decimal',
    places,
  }
}

/** Nearest equivalent virtual index for a value in a looping list. */
export function nearestLoopIndex(
  target: number,
  current: number,
  count: number,
  cycles: number,
): number {
  if (count <= 1) return Math.floor(cycles / 2) * count
  const center = Math.floor(cycles / 2) * count
  const base = center + target
  let best = base
  for (const shift of [-count, count]) {
    const candidate = base + shift
    if (Math.abs(candidate - current) < Math.abs(best - current)) best = candidate
  }
  return Math.min(Math.max(best, 1), cycles * count - 2)
}

/**
 * Progress of the fast spatial spring used by the scroll field selection
 * (damping 0.9, stiffness 1400). Mirrors the generated
 * `--md-sys-motion-spring-shape-morph` curve at runtime for scroll animation.
 */
export function scrollFieldSpringProgress(time: number): number {
  const dampingRatio = 0.9
  const naturalFrequency = Math.sqrt(1400)
  const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatio * dampingRatio)
  const decay = Math.exp(-dampingRatio * naturalFrequency * time)
  return (
    1 -
    decay *
      (Math.cos(dampedFrequency * time) +
        ((dampingRatio * naturalFrequency) / dampedFrequency) * Math.sin(dampedFrequency * time))
  )
}
