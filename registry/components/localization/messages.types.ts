export type FileUploadRejection = 'type' | 'size' | 'count'

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

export interface FormMessages {
  summary: string
  validating: string
  submitting: string
  success: string
  failure: string
  validationFailure: string
  changed: string
  field: string
}

export interface FileUploadCounts {
  total: number
  completed: number
  failed: number
  active: number
  queued: number
  canceled: number
}

export interface FileUploadMessages {
  select: string
  drop: string
  drag: string
  empty: string
  queued: string
  waiting: string
  uploading: string
  processing: string
  completed: string
  canceling: string
  canceled: string
  canceledRemote: string
  unknownFailure: string
  removed: (name: string) => string
  cleared: string
  upload: string
  retry: string
  cancel: string
  remove: string
  uploadAll: string
  action: (action: string, name: string) => string
  summary: (counts: FileUploadCounts) => string
  types: (accept: string) => string
  size: (size: string) => string
  count: (count: number) => string
  rejection: (reason: FileUploadRejection) => string
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

export interface TreeViewMessages {
  instructions: string
  selectInstructions: string
  multipleInstructions: string
  checkInstructions: string
  checkOnlyInstructions: string
  expand: (label: string) => string
  collapse: (label: string) => string
  check: (label: string) => string
  loading: (label: string) => string
  failure: string
  retry: (label: string) => string
  retryText: string
  emptyBranch: string
  emptyTitle: string
  scroll: string
}

export interface LocaleMessages {
  pagination: PaginationMessages
  form: FormMessages
  fileUpload: FileUploadMessages
  dataTable: DataTableMessages
  treeView: TreeViewMessages
}
export type LocaleOverrides = { [K in keyof LocaleMessages]?: Partial<LocaleMessages[K]> }
