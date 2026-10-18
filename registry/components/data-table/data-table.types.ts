export type DataTableKey = string | number
export type DataTableValue = string | number | boolean | Date | null | undefined
export interface DataTableSort {
  column: string
  direction: 'ascending' | 'descending'
}
export type DataTableFilters = Readonly<Record<string, readonly DataTableKey[]>>
export interface DataTableFilterOption {
  value: DataTableKey
  label: string
  disabled?: boolean
}
export interface DataTableColumnFilter<T> {
  options: readonly DataTableFilterOption[]
  matches?: (row: T, value: DataTableKey) => boolean
}
export interface DataTableQuery {
  filters?: DataTableFilters
  sort: DataTableSort | null
  page: number
  pageSize: number
}
export interface DataTableColumn<T> {
  id: string
  label: string
  value?: (row: T) => DataTableValue
  format?: (value: DataTableValue, row: T) => string
  supporting?: (row: T) => string
  sortable?: boolean
  compare?: (left: T, right: T) => number
  numeric?: boolean
  rowHeader?: boolean
  filter?: DataTableColumnFilter<T>
  fixed?: 'start' | 'end'
  width?: string
}
export interface DataTableSelection {
  selectedKeys: DataTableKey[]
  changedKeys: DataTableKey[]
  source: 'row' | 'page'
}
export interface DataTableCell<T> {
  row: T
  column: DataTableColumn<T>
  value: DataTableValue
  rowIndex: number
}

export type { DataTableMessages } from '../localization/messages.types'
