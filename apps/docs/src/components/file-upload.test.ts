import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { h, ref } from 'vue'
import FileUpload from '../../../../registry/components/file-upload/file-upload.vue'
import Form from '../../../../registry/components/form/form.vue'
import type { FormContext } from '../../../../registry/components/form/form.types'
import { useFileUpload } from '../../../../registry/components/file-upload/use-file-upload'
import type {
  FileUploadAdapter,
  FileUploadContext,
  FileUploadResult,
  FileUploadItem,
} from '../../../../registry/components/file-upload/file-upload.types'

enableAutoUnmount(afterEach)

function deferred() {
  let resolve!: (result: FileUploadResult) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<FileUploadResult>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function fixture(
  adapter?: FileUploadAdapter,
  settings: {
    auto?: boolean
    concurrency?: number
    accept?: string
    maxFiles?: number
    maxFileSize?: number
    multiple?: boolean
  } = {},
) {
  const events = { change: vi.fn(), failure: vi.fn(), outdated: vi.fn() }
  const state = { disabled: false }
  const queue = useFileUpload({
    prefix: 'test',
    adapter: () => adapter,
    disabled: () => state.disabled,
    autoUpload: () => settings.auto ?? false,
    concurrency: () => settings.concurrency ?? 3,
    limits: () => settings,
    rejection: (reason) => `Rejected: ${reason}`,
    unknownFailure: () => 'Check the server before retrying.',
    ...events,
  })
  return { queue, events, state }
}
const file = (name: string, type = 'text/plain') => new File(['content'], name, { type })

describe('File upload queue', () => {
  it('lets a Form adapter submit the selection-only queue and clear it on native reset', async () => {
    const upload = ref<InstanceType<typeof FileUpload>>()
    let selected: Array<Readonly<FileUploadItem>> = []
    const submit = vi.fn(({ data }: FormContext) => {
      for (const item of selected)
        if (item.status === 'queued') data.append('attachments', item.file)
    })
    const wrapper = mount(Form, {
      attachTo: document.body,
      props: { submit, onReset: () => upload.value?.clear() },
      slots: {
        default: () =>
          h(FileUpload, {
            ref: upload,
            label: 'Attachments',
            accept: '.txt',
            onChange: (items) => {
              selected = items
            },
          }),
      },
    })
    upload.value!.add([file('accepted.txt'), file('rejected.pdf', 'application/pdf')])
    await wrapper.trigger('submit')
    await flushPromises()
    const data = submit.mock.calls[0]![0].data
    expect(data.getAll('attachments').map((value) => (value as File).name)).toEqual([
      'accepted.txt',
    ])
    expect(wrapper.get<HTMLInputElement>('input[type="file"]').element.name).toBe('')
    wrapper.element.reset()
    await flushPromises()
    expect(upload.value!.items).toHaveLength(0)
  })
  it('accepts a retry from the failure callback without overlapping attempts', async () => {
    let calls = 0
    const { queue, events } = fixture(
      async () =>
        ++calls === 1 ? { status: 'error', message: 'Try again.' } : { status: 'success' },
      { auto: true },
    )
    events.failure.mockImplementation(({ item }) => queue.retry(item.id))
    queue.add([file('one')])
    await flushPromises()
    expect(calls).toBe(2)
    expect(queue.items.value[0]).toMatchObject({ status: 'completed', attempt: 2 })
  })
  it('keeps picker, size, and count rejections beside their files without consuming accepted slots', () => {
    // file-upload.selection.constraints
    const { queue } = fixture(undefined, { accept: '.txt,image/*', maxFiles: 2, maxFileSize: 8 })
    queue.add([
      file('wrong.pdf', 'application/pdf'),
      new File(['too much content'], 'large.txt'),
      file('one.txt'),
      file('two.png', 'image/png'),
      file('three.txt'),
    ])
    expect(queue.items.value.map((item) => [item.file.name, item.status, item.error])).toEqual([
      ['wrong.pdf', 'rejected', 'Rejected: type'],
      ['large.txt', 'rejected', 'Rejected: size'],
      ['one.txt', 'queued', undefined],
      ['two.png', 'queued', undefined],
      ['three.txt', 'rejected', 'Rejected: count'],
    ])
    queue.remove(queue.items.value[2]!.id)
    queue.add([file('replacement.TXT')])
    expect(queue.items.value.at(-1)?.status).toBe('queued')
  })

  it('supports selection without a transport and rejects a second single-file entry explicitly', () => {
    const { queue, state } = fixture(undefined, { multiple: false })
    queue.add([file('first.txt'), file('second.txt')])
    queue.start()
    expect(queue.items.value.map((item) => item.status)).toEqual(['queued', 'rejected'])
    state.disabled = true
    expect(queue.add([file('ignored.txt')])).toEqual([])
    expect(queue.items.value).toHaveLength(2)
    const snapshot = queue.snapshot()
    snapshot[0]!.status = 'failed'
    expect(queue.items.value[0]?.status).toBe('queued')
  })

  it('limits independent attempts and does not equate full byte transfer with server completion', async () => {
    // file-upload.transfer.lifecycle
    const requests = [deferred(), deferred(), deferred()]
    const contexts: FileUploadContext[] = []
    const adapter = vi.fn((context: FileUploadContext) => {
      contexts.push(context)
      return requests[contexts.length - 1]!.promise
    })
    const { queue } = fixture(adapter, { auto: true, concurrency: 2 })
    queue.add([file('one'), file('two'), file('three')])
    await flushPromises()
    expect(adapter).toHaveBeenCalledTimes(2)
    expect(queue.items.value.map((item) => item.status)).toEqual([
      'uploading',
      'uploading',
      'waiting',
    ])
    contexts[0]!.reportProgress(7, 7)
    expect(queue.items.value[0]?.status).toBe('uploading')
    contexts[0]!.reportProcessing()
    contexts[0]!.reportProgress(1, 2)
    expect(queue.items.value[0]).toMatchObject({ status: 'processing', loaded: 7, total: 7 })
    requests[0]!.resolve({ status: 'success', value: { attachment: 'saved' } })
    await flushPromises()
    expect(queue.items.value[0]).toMatchObject({
      status: 'completed',
      result: { attachment: 'saved' },
    })
    expect(adapter).toHaveBeenCalledTimes(3)
    requests[1]!.resolve({ status: 'success' })
    requests[2]!.resolve({ status: 'success' })
    await flushPromises()
  })

  it('holds a canceled attempt until settlement and rejects its result and old progress after retry', async () => {
    // file-upload.transfer.cancellation
    const first = deferred()
    const second = deferred()
    const contexts: FileUploadContext[] = []
    const adapter = vi.fn((context: FileUploadContext) => {
      contexts.push(context)
      return contexts.length === 1 ? first.promise : second.promise
    })
    const { queue, events } = fixture(adapter, { auto: true })
    const [id] = queue.add([file('one.txt')])
    await flushPromises()
    queue.cancel(id!)
    expect(contexts[0]!.signal.aborted).toBe(true)
    expect(queue.items.value[0]?.status).toBe('canceling')
    queue.retry(id!)
    expect(adapter).toHaveBeenCalledTimes(1)
    first.resolve({ status: 'success', value: 'late server copy' })
    await flushPromises()
    expect(queue.items.value[0]?.status).toBe('canceled')
    expect(queue.items.value[0]?.result).toBeUndefined()
    expect(events.outdated).toHaveBeenCalledTimes(1)
    queue.retry(id!)
    await flushPromises()
    expect(contexts[1]?.attempt).toBe(2)
    contexts[1]!.reportProgress(1, 4)
    contexts[0]!.reportProgress(999, 999)
    expect(queue.items.value[0]).toMatchObject({ loaded: 1, total: 4 })
    second.resolve({ status: 'success' })
    await flushPromises()
    expect(queue.items.value[0]?.status).toBe('completed')
  })

  it('retains successes after another file fails and distinguishes a rejected response from an unknown outcome', async () => {
    const error = new Error('internal detail')
    const adapter = vi.fn(async ({ file }: FileUploadContext): Promise<FileUploadResult> => {
      if (file.name === 'expected')
        return { status: 'error', message: 'The server rejected this file.' }
      if (file.name === 'unknown') throw error
      return { status: 'success' }
    })
    const { queue, events } = fixture(adapter, { auto: true })
    queue.add([file('saved'), file('expected'), file('unknown')])
    await flushPromises()
    expect(queue.items.value.map((item) => item.status)).toEqual(['completed', 'failed', 'failed'])
    expect(queue.items.value[1]?.error).toBe('The server rejected this file.')
    expect(queue.items.value[2]?.error).toBe('Check the server before retrying.')
    expect(events.failure.mock.calls[1]?.[0].error).toBe(error)
    expect(queue.counts.value).toMatchObject({ completed: 1, failed: 2, active: 0 })
  })

  it('cancels removed work without resurrecting its row or starting more work before it settles', async () => {
    const first = deferred()
    const adapter = vi.fn((_context: FileUploadContext) => first.promise)
    const { queue } = fixture(adapter, { auto: true, concurrency: 1 })
    const [id] = queue.add([file('first'), file('next')])
    await flushPromises()
    queue.remove(id!)
    expect(queue.items.value[0]?.status).toBe('waiting')
    expect(adapter).toHaveBeenCalledTimes(1)
    first.resolve({ status: 'success' })
    await flushPromises()
    expect(queue.items.value).toHaveLength(1)
    expect(queue.items.value[0]?.file.name).toBe('next')
    expect(adapter).toHaveBeenCalledTimes(2)
  })

  it('clears waiting work, aborts active work, and ignores late unmounted feedback', async () => {
    const request = deferred()
    let context: FileUploadContext | undefined
    const { queue, events } = fixture(
      (value) => {
        context = value
        return request.promise
      },
      { auto: true, concurrency: 1 },
    )
    queue.add([file('one'), file('two')])
    await flushPromises()
    queue.clear()
    expect(context?.signal.aborted).toBe(true)
    expect(queue.items.value).toHaveLength(0)
    queue.dispose()
    events.change.mockClear()
    request.resolve({ status: 'success' })
    await flushPromises()
    expect(events.change).not.toHaveBeenCalled()
    expect(events.outdated).not.toHaveBeenCalled()
  })

  it('does not invoke an adapter after a change listener removes a just-started item', async () => {
    const adapter = vi.fn(async (): Promise<FileUploadResult> => ({ status: 'success' }))
    const { queue, events } = fixture(adapter, { auto: true })
    events.change.mockImplementation((items) => {
      if (items[0]?.status === 'uploading') queue.remove(items[0].id)
    })
    queue.add([file('one')])
    await flushPromises()
    expect(adapter).not.toHaveBeenCalled()
    expect(queue.items.value).toHaveLength(0)
  })
})
