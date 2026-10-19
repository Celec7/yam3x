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
  filterColumn: (label: string) => string
  filterActive: (label: string, count: number) => string
  applyFilter: string
  clearFilter: string
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

export interface NumberFieldLocaleMessages {
  valueMissing: string
  badInput: string
  rangeUnderflow: (minimum: string) => string
  rangeOverflow: (maximum: string) => string
  customError: string
  increment: (label: string) => string
  decrement: (label: string) => string
}

export interface CalendarMessages {
  label: string
  previousMonth: string
  nextMonth: string
  previousYear: string
  nextYear: string
  previousMultiYear: string
  nextMultiYear: string
  specialDate: string
  rangeStart: string
  rangeEnd: string
  inRange: string
  choosePeriod: (period: string) => string
  chooseMonth: (year: string) => string
  chooseYear: (period: string) => string
}

export interface DateInputMessages {
  date: string
  time: string
  datetime: string
  groupFallback: string
  required: string
  invalid: string
  earlyDate: string
  lateDate: string
  earlyTime: string
  lateTime: string
  unavailable: string
  periodPlaceholder: string
  am: string
  pm: string
  month?: string
  day?: string
  year?: string
  hour?: string
  minute?: string
  second?: string
  period?: string
}

export interface TimePickerMessages {
  label: string
  hour: string
  minute: string
  second: string
  period?: string
  modeToggle: string
  useDial: string
  dial: string
  input: string
  cancel: string
  confirm: string
  dialValue: (context: { value: number; unit: 'hour' | 'minute' | 'second'; max: number }) => string
  invalidPart: (part: 'hour' | 'minute' | 'second') => string
  outsideRange: string
}

export interface DatePickerMessages {
  label: string
  startDate: string
  endDate: string
  calendar: string
  previousMonth: string
  nextMonth: string
  previousYear: string
  nextYear: string
  confirm: string
  cancel: string
  clear: string
  showCalendar: string
  enterDate: string
  invalidDate: string
  invalidRange: string
  chooseMonth: (month?: string) => string
  chooseYear: (year?: string) => string
}

export interface OptionPanelMessages {
  loading: string
  noData: string
}

export interface AutocompleteMessages extends OptionPanelMessages {
  results: (count: number) => string
  showSuggestions: (label: string) => string
  suggestions: (label: string) => string
  selectionRequired: string
}

export interface ActionMessages {
  newNotification: string
  breadcrumb: string
  removeItem: (label: string) => string
  splitOptions: (label?: string) => string
  splitMoreOptions: (label?: string) => string
  rangeMinimum: (label?: string) => string
  rangeMaximum: (label?: string) => string
  close: string
  back: string
  clear: string
  search: string
  moreActions: string
  options: string
  actions: string
  openMenu: string
  closeNavigation: string
  expandNavigation: string
  collapseNavigation: string
  startPanel: string
  endPanel: string
  closePanel: string
  dismissMessage: string
  resizeSheet: string
  closeSheet: string
  collapseSheet: string
  bottomSheet: string
  previousPage: string
  nextPage: string
  characterCount: string
  dismissNotification: string
  searchResults: (label: string) => string
  carouselItem: (position: number, total: number, label: string) => string
}

export interface LocaleMessages {
  cascader: {
    search: string
    root: string
    empty: string
    noResults: string
    choosePath: string
    level: (position: number, parent: string) => string
    results: (label: string) => string
  }
  treeSelect: { search: string; empty: string; noResults: string }
  descriptions: { empty: string; missingValue: string }
  actions: ActionMessages
  optionPanel: OptionPanelMessages
  autocomplete: AutocompleteMessages
  select: { noData: string }
  datePicker: DatePickerMessages
  timePicker: TimePickerMessages
  dateInput: DateInputMessages
  calendar: CalendarMessages
  numberField: NumberFieldLocaleMessages
  pagination: PaginationMessages
  form: FormMessages
  fileUpload: FileUploadMessages
  dataTable: DataTableMessages
  treeView: TreeViewMessages
}
export type LocaleOverrides = { [K in keyof LocaleMessages]?: Partial<LocaleMessages[K]> }
