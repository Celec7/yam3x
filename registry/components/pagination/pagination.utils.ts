export function paginationItems(page: number, count: number): Array<number | string> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const current = Math.min(count, Math.max(1, page))
  const values = [...new Set([1, count, current - 1, current, current + 1])]
    .filter((value) => value >= 1 && value <= count)
    .sort((a, b) => a - b)
  const result: Array<number | string> = []
  for (const value of values) {
    const previous = result.at(-1)
    if (typeof previous === 'number') {
      if (value - previous === 2) result.push(previous + 1)
      else if (value - previous > 2) result.push(`gap-${previous}`)
    }
    result.push(value)
  }
  return result
}
