export type FileUploadStatus =
  | 'queued'
  | 'waiting'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'canceling'
  | 'canceled'

export interface FileUploadItem {
  id: string
  file: File
  status: FileUploadStatus
  attempt: number
  loaded: number
  total?: number
  error?: string
  result?: unknown
}
export interface FileUploadContext {
  id: string
  file: File
  attempt: number
  signal: AbortSignal
  reportProgress: (loaded: number, total?: number) => void
  reportProcessing: () => void
}
export type FileUploadResult =
  { status: 'success'; value?: unknown } | { status: 'error'; message: string }
export type FileUploadAdapter = (context: FileUploadContext) => Promise<FileUploadResult>
export type FileUploadRejection = 'type' | 'size' | 'count'
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
