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

export type {
  FileUploadMessages,
  FileUploadCounts,
  FileUploadRejection,
} from '../localization/messages.types'
