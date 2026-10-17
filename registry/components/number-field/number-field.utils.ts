export function createNumberCodec(locale: string) {
  const formatter = new Intl.NumberFormat(locale, { maximumSignificantDigits: 21 })
  const parts = formatter.formatToParts(-1234567890123.5)
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.'
  const group = parts.find((part) => part.type === 'group')?.value
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-'
  const digits = new Intl.NumberFormat(locale, { useGrouping: false })
  const digitMap = Array.from(
    { length: 10 },
    (_, digit) => [digits.format(digit), String(digit)] as const,
  )
  const integers = parts
    .filter((part) => part.type === 'integer')
    .map((part) => Array.from(part.value).length)
  const primaryGroupSize = integers.at(-1) ?? 3
  const secondaryGroupSize = integers.at(-2) ?? primaryGroupSize
  return {
    format(value: number | null): string {
      return value === null ? '' : formatter.format(value)
    },
    parse(text: string): number | null {
      let normalized = text.replace(/[\u061c\u200e\u200f\u2066-\u2069]/g, '').trim()
      for (const [localized, ascii] of digitMap)
        normalized = normalized.replaceAll(localized, ascii)
      normalized = normalized.replaceAll(minus, '-')
      const sign = /^[+-]/.test(normalized) ? normalized[0] : ''
      if (sign) normalized = normalized.slice(1)
      const [integer = '', fraction, extra] = normalized.split(decimal)
      if (extra !== undefined || (fraction !== undefined && !/^\d*$/.test(fraction))) return null
      let whole = integer
      if (group && integer.includes(group)) {
        const groups = integer.split(group)
        if (
          !groups.every((item) => /^\d+$/.test(item)) ||
          groups.at(-1)!.length !== primaryGroupSize ||
          groups[0]!.length > secondaryGroupSize ||
          !groups.slice(1, -1).every((item) => item.length === secondaryGroupSize)
        )
          return null
        whole = groups.join('')
      }
      if (!/^\d*$/.test(whole) || (!whole && !fraction)) return null
      const value = Number(`${sign}${whole || '0'}${fraction === undefined ? '' : `.${fraction}`}`)
      return Number.isFinite(value) ? value : null
    },
  }
}

// Add decimal steps before converting back to Number, avoiding binary addition artifacts.
export function addNumberStep(value: number, step: number, direction: 1 | -1): number {
  function decimalParts(number: number) {
    const [coefficient = '0', exponent = '0'] = number.toString().split('e')
    return {
      coefficient: BigInt(coefficient.replace('.', '')),
      scale: (coefficient.split('.')[1]?.length ?? 0) - Number(exponent),
    }
  }
  const left = decimalParts(value)
  const right = decimalParts(step)
  const scale = Math.max(left.scale, right.scale)
  const result =
    left.coefficient * 10n ** BigInt(scale - left.scale) +
    BigInt(direction) * right.coefficient * 10n ** BigInt(scale - right.scale)
  return Number(`${result}e${-scale}`)
}
