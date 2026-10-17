<script setup lang="ts">
import FileUploadExample from './demos/FileUploadExample.vue'
</script>

# File upload

`FileUpload` is a project extension for selecting files, reviewing a queue, and recovering independent transfers. Material 3 Expressive informs its button, list hierarchy, and progress presentation; it does not define a standalone upload component.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><FileUploadExample /></div>

::: details View demo source

<<< ./demos/FileUploadExample.vue{vue}

:::

## Use in your app

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

This Fetch example uses indeterminate progress because it does not measure uploaded bytes. An adapter using an upload-progress API can call `reportProgress(loaded, total)` with measured values. Call `reportProcessing()` when transfer has finished but server work remains. Resolve with success only when the attachment is accepted, rather than when the byte counter reaches its total.

## API

| Prop          | Default       | Use                                                                                                          |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `label`       | Required      | Visible fieldset legend, using Title Medium.                                                                 |
| `description` | Empty         | Persistent instructions associated with the selection action.                                                |
| `accept`      | Empty         | Comma-separated extensions, MIME types, or MIME wildcards.                                                   |
| `multiple`    | `true`        | Allows more than one accepted queue entry.                                                                   |
| `maxFiles`    | Unlimited     | Maximum non-rejected entries, including completed and canceled entries.                                      |
| `maxFileSize` | Unlimited     | Maximum bytes per file. Zero allows only empty files.                                                        |
| `upload`      | None          | `FileUploadAdapter`; omit for selection-only usage.                                                          |
| `autoUpload`  | `false`       | Schedule accepted entries automatically when an adapter is available.                                        |
| `concurrency` | `3`           | Maximum unsettled adapter attempts; finite values are rounded down and bounded to at least one.              |
| `droppable`   | `true`        | Offers a drop surface in addition to the native picker.                                                      |
| `disabled`    | `false`       | Disables file actions and scheduling; active attempts continue.                                              |
| `locale`      | `en-US`       | Number formatting and English/Chinese built-in text. Other languages use English text unless overridden.     |
| `messages`    | Built-in text | Partial `FileUploadMessages`, including action labels, constraints, rejections, and queue summary functions. |

Limits are checked when entries are added. Finite count and size limits are rounded down and bounded to zero. With `:multiple="false"`, the queue accepts at most one entry; choosing another file reports a rejection until the existing entry is removed. Rejected entries do not consume that capacity. Repeated selections of the same file create distinct entries. The picker filter and client checks are conveniences; the receiving service must validate file content and limits itself.

`FileUploadAdapter` receives `{ id, file, attempt, signal, reportProgress, reportProcessing }` and returns a promise of `{ status: 'success', value? }` or `{ status: 'error', message }`. The queue-local `id` stays stable across retries; `attempt` starts at one. Application adapters own network timeouts, durable request identity, idempotency, and storage cleanup. The local ID is not a global idempotency key. Rejection messages belong to the application and should explain recovery. Unexpected exceptions use generic visible feedback about checking the server; raw details remain in the `failure` event.

The `change(items)` event receives a fresh queue snapshot, including progress changes. Each item has `id`, `file`, `status`, `attempt`, `loaded`, optional `total`, optional `error`, and optional successful `result`. Treat snapshots as read-only. Status is `queued`, `waiting`, `uploading`, `processing`, `completed`, `failed`, `rejected`, `canceling`, or `canceled`. `queued` needs a start action; `waiting` is scheduled behind active attempts. A known total produces determinate progress; omitted or non-positive totals remain indeterminate. Progress reports after processing begins are ignored.

`failure({ item, error? })` reports an expected failed response or an unexpected exception for that attempt. `outdated({ item, result?, error? })` reports a discarded adapter outcome after cancellation or removal; `item` identifies the attempted file and attempt number. It does not announce successful queue completion. Handle it when the application must reconcile remote attachments.

The `#preview="{ item }"` slot replaces the decorative file icon. Keep the visible file name and give informative preview images appropriate alternative text. Revoke application-created object URLs when their previews are removed.

Component refs expose read-only `items`, `add(files)` (returns new queue IDs), `choose()`, `start(id?)`, `retry(id)`, `cancel(id)`, `remove(id)`, and `clear()`. `start()` schedules all ready entries. Rejected files must be removed and selected again after correcting the cause. Retry clears old progress and errors and starts a new attempt. Programmatic cancellation, removal, and clearing remain available for application cleanup while the UI is disabled.

## Behavior and accessibility

Selection uses a native file input behind a named Button. The drop surface is not a nested interactive control, and the same constraints apply to dropped and picked files. Each file keeps its name, size, status, and separately named actions. Successful files remain when another file fails. Rows and actions wrap at narrow widths and enlarged text sizes; file names use direction isolation.

The queue summary is a polite live region based on state counts, not percentages. Individual progress indicators are named for their file and appear only for independently active tasks. Removing the focused row returns focus to a remaining row action or the selection button; unrelated focus is preserved.

Cancel requests an abort and displays `canceling` until the adapter settles. The concurrency slot stays reserved during this period, including when the row is removed. Adapters should settle promptly when aborted. A late result cannot restore a removed row or complete a canceled entry. A retry begins only after the previous attempt has settled; old progress callbacks cannot affect it. Cancellation does not prove that a remote copy was deleted. Removing or clearing started entries retains a visible notice to check stored attachments before retrying; clearing the queue does not erase that uncertainty.

## Form integration

The queue owns its File objects. The picker is unnamed and cleared after each selection so the same file can be chosen again; its native FileList does not represent the queue. For selection-only forms, omit `upload`, retain the `change` snapshot, and append entries with `status === 'queued'` to the form's FormData inside your submit callback. Use a Form validation adapter to report missing or rejected attachments as appropriate for the application. Call the upload ref's `clear()` from `@reset`, or change its Vue `key` for a new record session. Queue removal never deletes a server attachment.

## Styling

The optional drop surface uses Surface Container Low, Outline Variant, and the Medium corner role. File names use Body Large, supporting content uses Body Small, and numeric values use tabular figures. There is 24 px drop padding, 16 px between regions, and 8 px between related instructions. Rows have a 56 px minimum and grow for content. Buttons retain their own targets, and each row inherits the containing surface.

## Material references

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines)
