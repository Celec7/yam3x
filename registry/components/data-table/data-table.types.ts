export type DataTableKey = string | number
export type DataTableValue = string | number | boolean | Date | null | undefined
export interface DataTableSort {
  column: string
  direction: 'ascending' | 'descending'
}
export interface DataTableQuery {
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
export interface DataTableMessages {
  sortInstructions: string
  selectPage: string
  selectRow: (label: string) => string
  selection: (count: number) => string
  loading: string
  refreshing: string
  retry: string
  unavailable: string
  invalidPage: string
  firstPage: string
  emptyTitle: string
  emptyDescription: string
  filteredTitle: string
  filteredDescription: string
  scroll: string
}
