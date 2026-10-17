export interface PaginationChange {
  page: number
  pageSize: number
}

export interface PaginationMessages {
  label: string
  previous: string
  next: string
  pageSize: string
  pending: string
  page: (page: string) => string
  current: (page: string, count: string) => string
  range: (start: string, end: string, total: string) => string
}
