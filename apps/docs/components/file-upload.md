<script setup lang="ts">
import FileUploadExample from './demos/FileUploadExample.vue'
import FileUploadFormExample from './demos/FileUploadFormExample.vue'
</script>

# File upload

`FileUpload` is a project extension for selecting files, reviewing a queue, and recovering independent transfers. It combines a named selection button, an optional drop surface, per-file status, and a summary live region.

Material 3 Expressive defines the Button, List, and progress treatments used inside the component; the queue contract, limit policy, adapter API, and file-list composition are project decisions. The closest Compose Material 3 composition is an OutlinedCard or Surface for the drop area, a Button for selection, ListItem-style rows, a LinearProgressIndicator for measured work, and Compose Foundation drag-and-drop.

Use it when several files share one submission, when a transfer can fail without losing the rest of the queue, or when progress, retry, and cancellation must stay visible. For a single native file input inside a form, the platform control may be enough; `FileUpload` is useful when the queue itself must stay observable.

## Examples

### Basic and transfers

<div class="vp-raw yam3x-doc-demo-theme"><FileUploadExample /></div>

The field is ready to use immediately; the controls disable file actions and remove the drop surface. `accept`, `max-files`, and `max-file-size` describe accepted entries, while each active transfer exposes progress, server processing, completion, rejection, and removal. A failed file can be retried while completed files remain, and the completed count is reported separately from the transfer state.

::: details View demo source

<<< ./demos/FileUploadExample.vue{vue}

:::

### Form submission

<div class="vp-raw yam3x-doc-demo-theme"><FileUploadFormExample /></div>

Expand the block to mount a selection-only field with `:multiple="false"` and no `upload`. The form appends queued entries to `FormData` on submit, and reset clears the queue through the component ref. Selecting a second file while one is queued reports the count limit instead of replacing the entry.

::: details View demo source

<<< ./demos/FileUploadFormExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app:

```vue
<script setup lang="ts">
import { FileUpload, type FileUploadAdapter } from './components/yam3x/file-upload'

const upload: FileUploadAdapter = async ({ file, signal }) => {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/attachments', { method: 'POST', body, signal })
  if (!response.ok)
    return {
      status: 'error',
      message: 'The file was not accepted. Check the result before retrying.',
    }
  return { status: 'success', value: await response.json() }
}
</script>

<template>
  <FileUpload
    label="Attachments"
    description="Choose supporting documents."
    accept=".pdf,image/png"
    :max-files="3"
    :max-file-size="5 * 1024 * 1024"
    :upload="upload"
  />
</template>
```

The Fetch example uses indeterminate progress because it does not measure uploaded bytes. An adapter using an upload-progress API can call `reportProgress(loaded, total)` with measured values. Call `reportProcessing()` when transfer has finished but server work remains. Resolve with success only when the attachment is accepted, not when a byte counter reaches its total.

::: details Selection-only queues

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { FileUpload, type FileUploadItem } from './components/yam3x/file-upload'

const items = shallowRef<Array<Readonly<FileUploadItem>>>([])
const field = ref<InstanceType<typeof FileUpload> | null>(null)

function submit(event: SubmitEvent): void {
  const form = event.currentTarget as HTMLFormElement
  const body = new FormData(form)
  for (const item of items.value)
    if (item.status === 'queued') body.append('attachments', item.file, item.file.name)
  // Send body with fetch, then clear the queue for the next record.
  field.value?.clear()
}
</script>

<template>
  <form @submit.prevent="submit">
    <FileUpload
      ref="field"
      label="Attachments"
      multiple
      @change="items = $event"
    />
  </form>
</template>
```

:::

::: details Adapter result and progress

```ts
import type { FileUploadAdapter } from './components/yam3x/file-upload'

const upload: FileUploadAdapter = async ({ file, signal, reportProgress, reportProcessing }) => {
  const body = new FormData()
  body.append('file', file)
  const request = new XMLHttpRequest()
  request.open('POST', '/api/attachments')
  request.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) reportProgress(event.loaded, event.total)
  })
  reportProcessing()
  signal.addEventListener('abort', () => request.abort(), { once: true })
  // Return success only after the service accepts the attachment.
  return { status: 'success' }
}
```

:::

## Behavior and accessibility

### Selection and limits

Selection uses a native file input behind a named Button. The input is hidden from assistive technology and cleared after each selection, so the same file can be chosen again. Dropped and picked files use the same constraints.

- Limits are checked when entries are added. Finite `maxFiles` and `maxFileSize` values are rounded down and bounded to zero.
- `multiple: false` accepts at most one entry. Choosing another file reports a count rejection until the existing entry is removed; rejected entries do not consume capacity.
- Repeated selections of the same file create distinct entries.
- The picker filter and client checks are conveniences. The receiving service must validate content, type, size, and count itself.
- With `droppable: false`, the drop surface and its instruction are not rendered. Dropping files elsewhere on the page is not captured.

### Transfers and cancellation

- `queued` waits for a start action. `waiting` is scheduled behind active attempts. `uploading` and `processing` are active; `completed`, `failed`, `rejected`, `canceling`, and `canceled` are settled or settling.
- `concurrency` bounds unsettled adapter attempts. Finite values are rounded down and clamped to at least one.
- `autoUpload` schedules accepted entries as they arrive when an adapter exists. Otherwise the selection button remains, and the queue exposes an Upload ready files action.
- A known total produces determinate progress; an omitted or non-positive total stays indeterminate. Progress reports after processing begins are ignored.
- Cancelling an active attempt requests an abort and shows `canceling` until the adapter settles; a queued or waiting entry becomes `canceled` immediately. The concurrency slot of an active attempt stays reserved during this period, even when the row is removed.
- A late result cannot restore a removed row or complete a canceled entry. A retry starts only after the previous attempt has settled; old progress callbacks cannot affect it.
- Cancellation does not prove that a remote copy was deleted. Removing or clearing started entries keeps a visible notice to check stored attachments before retrying.

### Focus and announcements

- The queue summary is a polite live region driven by state counts, not percentages. Individual progress indicators are named for their file and appear only for independently active tasks.
- Every row keeps its file name, size, status, and separately named actions. Successful files remain when another file fails.
- Removing the focused row returns focus to a remaining row action or the selection button; unrelated focus is preserved.
- Rows and actions wrap at narrow widths and enlarged text sizes. File names use direction isolation.
- The drop surface is not a nested interactive control. Its resting and drag states each show one boundary; dragging replaces the dashed outline with a primary focus boundary rather than adding a second one.

### Forms

The queue owns its File objects. The picker is unnamed and its native FileList does not represent the queue. For selection-only forms, omit `upload`, retain the `change` snapshot, and append entries with `status === 'queued'` to the form's `FormData` inside your submit callback. Use a Form validation adapter to report missing or rejected attachments according to your application rules. Call the upload ref's `clear()` from `@reset`, or change the component's Vue `key` for a new record session.

Queue removal never deletes a server attachment. The application owns network timeouts, durable request identity, idempotency, and storage cleanup.

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                | Kind      | Use                                                                      |
| --------------------- | --------- | ------------------------------------------------------------------------ |
| `FileUpload`          | Component | Selection surface, queue, and transfer scheduling.                       |
| `FileUploadAdapter`   | Type      | Async function that performs one attempt.                                |
| `FileUploadContext`   | Type      | Adapter argument with the file, attempt, signal, and progress callbacks. |
| `FileUploadResult`    | Type      | Success value or error message returned by an adapter.                   |
| `FileUploadItem`      | Type      | Immutable queue snapshot entry.                                          |
| `FileUploadStatus`    | Type      | Queue status union.                                                      |
| `FileUploadCounts`    | Type      | Status counts passed to the summary message.                             |
| `FileUploadMessages`  | Type      | Overrides for built-in interface text.                                   |
| `FileUploadRejection` | Type      | Client rejection reason: `'type'`, `'size'`, or `'count'`.               |

### Props

| Prop          | Type                          | Default            | Description                                                                              |
| ------------- | ----------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `label`       | `string`                      | Required           | Visible fieldset legend and accessible group name.                                       |
| `description` | `string`                      | `''`               | Persistent instructions associated with the selection action.                            |
| `accept`      | `string`                      | `''`               | Comma-separated extensions, MIME types, or MIME wildcards.                               |
| `multiple`    | `boolean`                     | `true`             | Allows more than one accepted queue entry.                                               |
| `maxFiles`    | `number`                      | Unlimited          | Maximum non-rejected entries, including completed and canceled entries.                  |
| `maxFileSize` | `number`                      | Unlimited          | Maximum bytes per file. Zero allows only empty files.                                    |
| `upload`      | `FileUploadAdapter`           | None               | Performs one transfer attempt; omit for selection-only usage.                            |
| `autoUpload`  | `boolean`                     | `false`            | Schedules accepted entries automatically when an adapter is available.                   |
| `concurrency` | `number`                      | `3`                | Maximum unsettled adapter attempts.                                                      |
| `droppable`   | `boolean`                     | `true`             | Offers a drop surface in addition to the native picker.                                  |
| `disabled`    | `boolean`                     | `false`            | Disables file actions and scheduling; active attempts continue.                          |
| `locale`      | `string`                      | Provider → `en-US` | Number formatting and built-in text. Other languages use English text unless overridden. |
| `messages`    | `Partial<FileUploadMessages>` | Built-in text      | Action labels, constraints, rejections, and summary text.                                |

### Events

| Event      | Payload                      | Description                                                                                            |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `change`   | `Readonly<FileUploadItem>[]` | Fresh queue snapshot, including progress changes. Treat it as read-only.                               |
| `failure`  | `{ item, error? }`           | An expected failure response or an unexpected exception for that attempt.                              |
| `outdated` | `{ item, result?, error? }`  | A discarded adapter outcome after cancellation or removal. It does not announce successful completion. |

### Slots

| Slot      | Props      | Description                                                                                                          |
| --------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `preview` | `{ item }` | Replaces the decorative file icon. Keep previews decorative or give informative images appropriate alternative text. |

### Methods

Access these through a template ref.

| Member       | Signature                     | Description                                                |
| ------------ | ----------------------------- | ---------------------------------------------------------- |
| `items`      | `Readonly<FileUploadItem>[]`  | Read-only queue snapshot.                                  |
| `add(files)` | `(files: File[]) => string[]` | Adds files and returns the new queue IDs.                  |
| `choose()`   | `() => void`                  | Opens the native file picker.                              |
| `start(id?)` | `(id?: string) => void`       | Starts one ready entry, or all ready entries when omitted. |
| `retry(id)`  | `(id: string) => void`        | Clears old progress and errors, then starts a new attempt. |
| `cancel(id)` | `(id: string) => void`        | Aborts an active attempt or marks a queued entry canceled. |
| `remove(id)` | `(id: string) => void`        | Removes an entry from the queue.                           |
| `clear()`    | `() => void`                  | Removes every entry from the queue.                        |

::: details Adapter types and queue item shape

```ts
interface FileUploadContext {
  id: string
  file: File
  attempt: number
  signal: AbortSignal
  reportProgress: (loaded: number, total?: number) => void
  reportProcessing: () => void
}

type FileUploadResult =
  { status: 'success'; value?: unknown } | { status: 'error'; message: string }

type FileUploadAdapter = (context: FileUploadContext) => Promise<FileUploadResult>

type FileUploadStatus =
  | 'queued'
  | 'waiting'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'canceling'
  | 'canceled'

interface FileUploadItem {
  id: string
  file: File
  status: FileUploadStatus
  attempt: number
  loaded: number
  total?: number
  error?: string
  result?: unknown
}
```

The queue-local `id` stays stable across retries, and `attempt` starts at one. It is not a global idempotency key. Rejection messages belong to the application and should explain recovery. Unexpected exceptions use generic visible feedback about checking the server; raw details remain in the `failure` event.

:::

## Styling

`FileUpload` exposes no public CSS custom properties. Its structure, type scale, spacing, and colors map to Material System roles, and the theme supplies those values. Set local styles on the host or use the `preview` slot for file-specific content.

::: details Applied roles and measurements

| Part             | Treatment                                                                  |
| ---------------- | -------------------------------------------------------------------------- |
| Drop surface     | Surface Container Low, Outline Variant, dashed boundary, Medium corner.    |
| Dragging         | Primary focus boundary replaces the dashed outline.                        |
| Disabled surface | 12% on-surface boundary and 38% supporting text.                           |
| Title            | Title Medium.                                                              |
| File name        | Body Large with direction isolation.                                       |
| Supporting text  | Body Small; numeric values use tabular figures.                            |
| Row              | 56px minimum block size, growing for content.                              |
| Spacing          | 24px drop padding, 16px between regions, 8px between related instructions. |

:::

## Material references

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines)
