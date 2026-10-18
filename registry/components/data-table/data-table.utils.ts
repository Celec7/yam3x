import type {
  DataTableColumn,
  DataTableKey,
  DataTableFilters,
  DataTableSort,
  DataTableValue,
} from './data-table.types'

function empty(value: DataTableValue) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'number' && !Number.isFinite(value)) ||
    (value instanceof Date && !Number.isFinite(value.getTime()))
  )
}

export function sortTableRows<T>(
  rows: readonly T[],
  columns: ReadonlyArray<DataTableColumn<T>>,
  sort: DataTableSort | null,
  locale: string,
): readonly T[] {
  const column = sort && columns.find((column) => column.id === sort.column && column.sortable)
  if (!sort || !column) return rows
  let collator: Intl.Collator
  try {
    collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
  } catch {
    collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' })
  }
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      let compared: number
      if (column.compare) compared = column.compare(left.row, right.row)
      else {
        const a = column.value?.(left.row)
        const b = column.value?.(right.row)
        if (empty(a) || empty(b))
          return Number(empty(a)) - Number(empty(b)) || left.index - right.index
        if (typeof a === 'number' && typeof b === 'number') compared = a - b
        else if (a instanceof Date && b instanceof Date) compared = a.getTime() - b.getTime()
        else if (typeof a === 'boolean' && typeof b === 'boolean') compared = Number(a) - Number(b)
        else compared = collator.compare(String(a), String(b))
      }
      return (
        (Number.isNaN(compared) ? 0 : compared * (sort.direction === 'ascending' ? 1 : -1)) ||
        left.index - right.index
      )
    })
    .map(({ row }) => row)
}

export function nextTableSort(sort: DataTableSort | null, column: string): DataTableSort | null {
  return sort?.column !== column
    ? { column, direction: 'ascending' }
    : sort.direction === 'ascending'
      ? { column, direction: 'descending' }
      : null
}

export function selectTablePage(
  selected: readonly DataTableKey[],
  pageKeys: readonly DataTableKey[],
  checked: boolean,
): DataTableKey[] {
  const next = new Set(selected)
  for (const key of pageKeys) {
    if (checked) next.add(key)
    else next.delete(key)
  }
  return Array.from(next)
}

export function filterTableRows<T>(
  rows: readonly T[],
  columns: ReadonlyArray<DataTableColumn<T>>,
  filters: DataTableFilters,
): readonly T[] {
  const active = columns.filter(
    (column) => column.filter && Object.hasOwn(filters, column.id) && filters[column.id]?.length,
  )
  if (!active.length) return rows
  return rows.filter((row) =>
    active.every((column) =>
      filters[column.id]!.some((value) =>
        column.filter!.matches
          ? column.filter!.matches(row, value)
          : Object.is(column.value?.(row), value),
      ),
    ),
  )
}
