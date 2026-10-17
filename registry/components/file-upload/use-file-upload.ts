import { computed, shallowRef } from 'vue'
import type {
  FileUploadAdapter,
  FileUploadContext,
  FileUploadCounts,
  FileUploadItem,
  FileUploadRejection,
  FileUploadResult,
} from './file-upload.types'

interface QueueOptions {
  prefix: string
  adapter: () => FileUploadAdapter | undefined
  disabled: () => boolean
  autoUpload: () => boolean
  concurrency: () => number
  limits: () => { accept?: string; multiple?: boolean; maxFiles?: number; maxFileSize?: number }
  rejection: (reason: FileUploadRejection) => string
  unknownFailure: () => string
  change: (items: Array<Readonly<FileUploadItem>>) => void
  failure: (detail: { item: Readonly<FileUploadItem>; error?: unknown }) => void
  outdated: (detail: {
    item: Readonly<FileUploadItem>
    result?: FileUploadResult
    error?: unknown
  }) => void
}
interface Operation {
  controller: AbortController
  item: FileUploadItem
}

function accepts(file: File, accept: string) {
  const tokens = accept
    .toLowerCase()
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
  return (
    !tokens.length ||
    tokens.some((token) =>
      token === '*/*'
        ? true
        : token.startsWith('.')
          ? file.name.toLowerCase().endsWith(token)
          : token.endsWith('/*')
            ? file.type.toLowerCase().startsWith(token.slice(0, -1))
            : file.type.toLowerCase() === token,
    )
  )
}
export function fileUploadLimit(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : Infinity
}

export function useFileUpload(options: QueueOptions) {
  const items = shallowRef<Array<Readonly<FileUploadItem>>>([])
  const active = new Map<string, Operation>()
  let nextId = 0
  let disposed = false
  const snapshot = () => items.value.map((item) => ({ ...item }))
  const counts = computed<FileUploadCounts>(() => ({
    total: items.value.length,
    completed: items.value.filter((item) => item.status === 'completed').length,
    failed: items.value.filter((item) => item.status === 'failed' || item.status === 'rejected')
      .length,
    active: items.value.filter((item) =>
      ['uploading', 'processing', 'canceling'].includes(item.status),
    ).length,
    queued: items.value.filter((item) => item.status === 'queued' || item.status === 'waiting')
      .length,
    canceled: items.value.filter((item) => item.status === 'canceled').length,
  }))
  function publish() {
    if (!disposed) options.change(snapshot())
  }
  function update(id: string, patch: Partial<FileUploadItem>) {
    items.value = items.value.map((item) => (item.id === id ? { ...item, ...patch } : item))
    publish()
  }
  function add(files: Iterable<File>) {
    if (disposed || options.disabled()) return []
    const limits = options.limits()
    const maxFiles = Math.min(
      fileUploadLimit(limits.maxFiles),
      limits.multiple === false ? 1 : Infinity,
    )
    let accepted = items.value.filter((item) => item.status !== 'rejected').length
    const added: FileUploadItem[] = []
    for (const file of files) {
      const reason: FileUploadRejection | undefined = !accepts(file, limits.accept ?? '')
        ? 'type'
        : file.size > fileUploadLimit(limits.maxFileSize)
          ? 'size'
          : accepted >= maxFiles
            ? 'count'
            : undefined
      const item: FileUploadItem = {
        id: `${options.prefix}-${++nextId}`,
        file,
        attempt: 0,
        loaded: 0,
        status: reason
          ? 'rejected'
          : options.autoUpload() && options.adapter()
            ? 'waiting'
            : 'queued',
        error: reason ? options.rejection(reason) : undefined,
      }
      if (!reason) accepted++
      added.push(item)
    }
    items.value = [...items.value, ...added]
    publish()
    pump()
    return added.map((item) => item.id)
  }
  function start(id?: string) {
    if (disposed || options.disabled() || !options.adapter()) return
    items.value = items.value.map((item) =>
      item.status === 'queued' && (!id || id === item.id) ? { ...item, status: 'waiting' } : item,
    )
    publish()
    pump()
  }
  function retry(id: string) {
    const item = items.value.find((item) => item.id === id)
    if (
      disposed ||
      options.disabled() ||
      !options.adapter() ||
      !item ||
      !['failed', 'canceled'].includes(item.status)
    )
      return
    update(id, {
      status: 'waiting',
      loaded: 0,
      total: undefined,
      error: undefined,
      result: undefined,
    })
    pump()
  }
  function cancel(id: string) {
    const item = items.value.find((item) => item.id === id)
    if (!item || disposed) return
    const operation = active.get(id)
    if (operation) {
      update(id, { status: 'canceling' })
      operation.controller.abort()
    } else if (item.status === 'queued' || item.status === 'waiting')
      update(id, { status: 'canceled' })
  }
  function remove(id: string) {
    if (disposed || !items.value.some((item) => item.id === id)) return false
    const operation = active.get(id)
    items.value = items.value.filter((item) => item.id !== id)
    operation?.controller.abort()
    publish()
    return true
  }
  function clear() {
    if (disposed) return
    items.value = []
    for (const operation of active.values()) operation.controller.abort()
    publish()
  }
  function isCurrent(operation: Operation) {
    return (
      !disposed &&
      !operation.controller.signal.aborted &&
      active.get(operation.item.id) === operation &&
      items.value.some((item) => item.id === operation.item.id)
    )
  }
  async function run(item: FileUploadItem, adapter: FileUploadAdapter) {
    const controller = new AbortController()
    const operation: Operation = {
      controller,
      item: { ...item, status: 'uploading', attempt: item.attempt + 1 },
    }
    active.set(item.id, operation)
    update(item.id, { status: 'uploading', attempt: item.attempt + 1 })
    const context: FileUploadContext = {
      id: item.id,
      file: item.file,
      attempt: item.attempt + 1,
      signal: controller.signal,
      reportProgress(loaded, total) {
        if (
          !isCurrent(operation) ||
          !Number.isFinite(loaded) ||
          loaded < 0 ||
          items.value.find((entry) => entry.id === item.id)?.status !== 'uploading'
        )
          return
        update(item.id, {
          loaded,
          total: total !== undefined && Number.isFinite(total) && total > 0 ? total : undefined,
        })
      },
      reportProcessing() {
        if (
          isCurrent(operation) &&
          items.value.find((entry) => entry.id === item.id)?.status === 'uploading'
        )
          update(item.id, { status: 'processing' })
      },
    }
    try {
      await Promise.resolve()
      if (!isCurrent(operation)) return
      const result = await adapter(context)
      if (!isCurrent(operation)) {
        if (!disposed) options.outdated({ item: { ...operation.item }, result })
      } else if (result.status === 'success')
        update(item.id, { status: 'completed', result: result.value })
      else {
        const failed: FileUploadItem = {
          ...items.value.find((entry) => entry.id === item.id)!,
          status: 'failed',
          error: result.message,
        }
        update(item.id, { status: 'failed', error: result.message })
        options.failure({ item: failed })
      }
    } catch (error) {
      if (!isCurrent(operation)) {
        if (!disposed) options.outdated({ item: { ...operation.item }, error })
      } else {
        const message = options.unknownFailure()
        const failed: FileUploadItem = {
          ...items.value.find((entry) => entry.id === item.id)!,
          status: 'failed',
          error: message,
        }
        update(item.id, { status: 'failed', error: message })
        options.failure({ item: failed, error })
      }
    } finally {
      active.delete(item.id)
      if (
        !disposed &&
        controller.signal.aborted &&
        items.value.some((entry) => entry.id === item.id)
      )
        update(item.id, { status: 'canceled' })
      pump()
    }
  }
  function pump() {
    if (disposed || options.disabled()) return
    const adapter = options.adapter()
    if (!adapter) return
    const configured = options.concurrency()
    const capacity = Number.isFinite(configured) ? Math.max(1, Math.floor(configured)) : 3
    let next: FileUploadItem | undefined
    while (
      active.size < capacity &&
      (next = items.value.find((item) => item.status === 'waiting' && !active.has(item.id)))
    )
      void run(next, adapter)
  }
  function dispose() {
    disposed = true
    for (const operation of active.values()) operation.controller.abort()
    active.clear()
  }
  return { items, counts, snapshot, add, start, retry, cancel, remove, clear, pump, dispose }
}
