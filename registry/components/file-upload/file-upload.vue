<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import Button from '../button/button.vue'
import Icon from '../icon/icon.vue'
import LinearProgressIndicator from '../progress-indicator/linear-progress-indicator.vue'
import { fileUploadLimit, useFileUpload } from './use-file-upload'
import type {
  FileUploadAdapter,
  FileUploadItem,
  FileUploadMessages,
  FileUploadResult,
} from './file-upload.types'

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    accept?: string
    multiple?: boolean
    maxFiles?: number
    maxFileSize?: number
    upload?: FileUploadAdapter
    autoUpload?: boolean
    concurrency?: number
    droppable?: boolean
    disabled?: boolean
    locale?: string
    messages?: Partial<FileUploadMessages>
  }>(),
  {
    description: '',
    accept: '',
    multiple: true,
    maxFiles: undefined,
    maxFileSize: undefined,
    upload: undefined,
    autoUpload: false,
    concurrency: 3,
    droppable: true,
    disabled: false,
    locale: 'en-US',
    messages: undefined,
  },
)
const emit = defineEmits<{
  change: [items: Array<Readonly<FileUploadItem>>]
  failure: [detail: { item: Readonly<FileUploadItem>; error?: unknown }]
  outdated: [detail: { item: Readonly<FileUploadItem>; result?: FileUploadResult; error?: unknown }]
}>()
defineSlots<{ preview?(scope: { item: Readonly<FileUploadItem> }): unknown }>()
const root = ref<HTMLFieldSetElement>()
const picker = ref<HTMLInputElement>()
const uid = `yam3x-upload-${useId().replace(/:/g, '')}`
const instructionsId = `${uid}-instructions`
const constraintsId = `${uid}-constraints`
const dragging = ref(false)
const removalNotice = ref('')
let dragDepth = 0
const messages = computed<FileUploadMessages>(() => {
  const zh = /^zh/i.test(props.locale)
  return {
    select: zh ? '选择文件' : 'Choose files',
    drop: zh ? '也可以将文件拖到这里。' : 'You can also drop files here.',
    drag: zh ? '松开以添加文件。' : 'Drop to add these files.',
    empty: zh ? '尚未选择文件。' : 'No files selected.',
    queued: zh ? '待上传' : 'Ready to upload',
    waiting: zh ? '等待上传空位…' : 'Waiting for an upload slot…',
    uploading: zh ? '正在上传…' : 'Uploading…',
    processing: zh ? '服务端正在处理…' : 'Processing on the server…',
    completed: zh ? '已完成' : 'Completed',
    canceling: zh ? '正在请求取消…' : 'Requesting cancellation…',
    canceled: zh ? '已取消' : 'Canceled',
    canceledRemote: zh
      ? '已取消；服务端可能仍有副本，重试前请先核对。'
      : 'Canceled; a server copy may remain. Check before retrying.',
    unknownFailure: zh
      ? '无法确认上传结果。重试前请先核对服务端状态。'
      : 'The upload could not be confirmed. Check the server before retrying.',
    removed: (name) =>
      zh
        ? `已从队列移除“${name}”。服务端可能仍有副本，重试前请核对已存储的附件。`
        : `Removed “${name}” from the queue. A server copy may remain; check stored attachments before retrying.`,
    cleared: zh
      ? '队列已清空。服务端可能仍有副本，重试前请核对已存储的附件。'
      : 'The queue was cleared. Server copies may remain; check stored attachments before retrying.',
    upload: zh ? '上传' : 'Upload',
    retry: zh ? '重试' : 'Retry',
    cancel: zh ? '取消' : 'Cancel',
    remove: zh ? '移除' : 'Remove',
    uploadAll: zh ? '上传待处理文件' : 'Upload ready files',
    action: (action, name) => `${action} ${name}`,
    summary: (counts) =>
      zh
        ? `${counts.total} 个文件：${counts.completed} 个已完成，${counts.active} 个处理中，${counts.queued} 个待处理，${counts.failed} 个失败或被拒绝，${counts.canceled} 个已取消。`
        : `${counts.total} ${counts.total === 1 ? 'file' : 'files'}: ${counts.completed} completed, ${counts.active} active, ${counts.queued} queued, ${counts.failed} failed or rejected, ${counts.canceled} canceled.`,
    types: (accept) => (zh ? `允许的类型：${accept}` : `Allowed types: ${accept}`),
    size: (size) => (zh ? `单个文件最大 ${size}` : `Maximum file size: ${size}`),
    count: (count) =>
      zh ? `最多 ${count} 个文件` : `Up to ${count} ${count === 1 ? 'file' : 'files'}`,
    rejection: (reason) =>
      zh
        ? {
            type: '不接受此文件类型。请选择允许的类型。',
            size: '文件超过大小上限。请选择更小的文件。',
            count: '队列已达到数量上限。请先移除文件。',
          }[reason]
        : {
            type: 'This file type is not accepted. Choose an allowed type.',
            size: 'This file exceeds the size limit. Choose a smaller file.',
            count: 'The queue has reached its file limit. Remove a file first.',
          }[reason],
    ...props.messages,
  }
})
const isDisabled = () => props.disabled || picker.value?.matches(':disabled') === true
const queue = useFileUpload({
  prefix: uid,
  adapter: () => props.upload,
  disabled: isDisabled,
  autoUpload: () => props.autoUpload,
  concurrency: () => props.concurrency,
  limits: () => props,
  rejection: (reason) => messages.value.rejection(reason),
  unknownFailure: () => messages.value.unknownFailure,
  change: (items) => emit('change', items),
  failure: (detail) => emit('failure', detail),
  outdated: (detail) => emit('outdated', detail),
})
const { items, counts } = queue
const exposedItems = computed(() => queue.snapshot())
const hasReady = computed(() => items.value.some((item) => item.status === 'queued'))
const formatter = computed(() => {
  try {
    return new Intl.NumberFormat(props.locale, { maximumFractionDigits: 1 })
  } catch {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
  }
})
function bytes(size: number) {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  const index =
    size > 0 ? Math.min(units.length - 1, Math.floor(Math.log(size) / Math.log(1024))) : 0
  return `${formatter.value.format(size / 1024 ** index)} ${units[index]}`
}
const constraints = computed(() =>
  [
    props.accept ? messages.value.types(props.accept) : '',
    props.maxFileSize !== undefined && Number.isFinite(props.maxFileSize)
      ? messages.value.size(bytes(fileUploadLimit(props.maxFileSize)))
      : '',
    !props.multiple || (props.maxFiles !== undefined && Number.isFinite(props.maxFiles))
      ? messages.value.count(
          Math.min(props.multiple ? Infinity : 1, fileUploadLimit(props.maxFiles)),
        )
      : '',
  ]
    .filter(Boolean)
    .join(' · '),
)
function status(item: Readonly<FileUploadItem>) {
  if (item.status === 'failed' || item.status === 'rejected') return item.error
  if (item.status === 'canceled')
    return item.attempt ? messages.value.canceledRemote : messages.value.canceled
  return messages.value[item.status]
}
function choose() {
  if (!isDisabled()) picker.value?.click()
}
function onChoose(event: Event) {
  const input = event.target as HTMLInputElement
  queue.add(Array.from(input.files ?? []))
  // The queue retains File objects; resetting the picker permits selecting the same file again.
  input.value = ''
}
function isFileDrag(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}
function onDragEnter(event: DragEvent) {
  if (!props.droppable || isDisabled() || !isFileDrag(event)) return
  event.preventDefault()
  dragDepth++
  dragging.value = true
}
function onDragOver(event: DragEvent) {
  if (!isFileDrag(event)) return
  event.preventDefault()
  if (event.dataTransfer)
    event.dataTransfer.dropEffect = props.droppable && !isDisabled() ? 'copy' : 'none'
}
function onDragLeave() {
  if (--dragDepth <= 0) {
    dragDepth = 0
    dragging.value = false
  }
}
function onDrop(event: DragEvent) {
  dragDepth = 0
  dragging.value = false
  if (!isFileDrag(event)) return
  event.preventDefault()
  if (!props.droppable || isDisabled()) return
  queue.add(Array.from(event.dataTransfer?.files ?? []))
}
function focusAfterRemoval(action: () => void, id?: string) {
  const rows = Array.from(root.value?.querySelectorAll<HTMLElement>('[data-upload-id]') ?? [])
  const row = rows.find((element) => element.dataset.uploadId === id)
  const focused = root.value?.ownerDocument.activeElement
  const recover = id
    ? row?.contains(focused ?? null)
    : rows.some((element) => element.contains(focused ?? null))
  const index = row ? rows.indexOf(row) : 0
  action()
  if (!recover) return
  void nextTick(() => {
    const element = root.value
    if (!element?.isConnected || isDisabled()) return
    const active = element.ownerDocument.activeElement
    if (active && active !== element.ownerDocument.body && active !== focused) return
    const remaining = Array.from(element.querySelectorAll<HTMLElement>('[data-upload-id]'))
    const target =
      remaining[Math.min(index, remaining.length - 1)]?.querySelector<HTMLButtonElement>(
        'button:not(:disabled)',
      ) ??
      element.querySelector<HTMLButtonElement>(
        '[data-upload-select] button, button[data-upload-select]',
      )
    target?.focus()
  })
}
function remove(id: string) {
  const item = items.value.find((item) => item.id === id)
  if (item?.attempt) removalNotice.value = messages.value.removed(item.file.name)
  focusAfterRemoval(() => queue.remove(id), id)
}
function clear() {
  if (items.value.some((item) => item.attempt)) removalNotice.value = messages.value.cleared
  focusAfterRemoval(queue.clear)
}
watch(
  () => [props.autoUpload, props.upload, props.disabled, props.concurrency],
  () => {
    if (props.autoUpload) queue.start()
    queue.pump()
  },
  { flush: 'post' },
)
let disabledObserver: MutationObserver | undefined
onMounted(() => {
  disabledObserver = new MutationObserver(() => {
    if (props.autoUpload) queue.start()
    queue.pump()
  })
  for (
    let ancestor: HTMLElement | null | undefined = root.value;
    ancestor;
    ancestor = ancestor.parentElement
  )
    if (ancestor.localName === 'fieldset')
      disabledObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] })
})
onBeforeUnmount(() => {
  disabledObserver?.disconnect()
  queue.dispose()
})
defineExpose({
  items: exposedItems,
  add: queue.add,
  start: queue.start,
  retry: queue.retry,
  cancel: queue.cancel,
  remove,
  clear,
  choose,
})
</script>

<template>
  <fieldset
    ref="root"
    class="yam3x-file-upload"
    :disabled="disabled"
  >
    <legend class="yam3x-file-upload__title">{{ label }}</legend>
    <div
      class="yam3x-file-upload__selection"
      :class="{
        'yam3x-file-upload__selection--drop': droppable,
        'yam3x-file-upload__selection--dragging': dragging,
      }"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <p
        v-if="description"
        :id="instructionsId"
        class="yam3x-file-upload__support"
      >
        {{ description }}
      </p>
      <p
        v-if="constraints"
        :id="constraintsId"
        class="yam3x-file-upload__support"
      >
        {{ constraints }}
      </p>
      <div class="yam3x-file-upload__actions">
        <Button
          data-upload-select
          type="button"
          :disabled="disabled"
          :aria-describedby="
            [description && instructionsId, constraints && constraintsId]
              .filter(Boolean)
              .join(' ') || undefined
          "
          @click="choose"
          >{{ messages.select }}</Button
        >
        <Button
          v-if="upload && hasReady"
          type="button"
          variant="outlined"
          :disabled="disabled"
          @click="queue.start()"
          >{{ messages.uploadAll }}</Button
        >
      </div>
      <p
        v-if="droppable"
        class="yam3x-file-upload__support"
      >
        {{ dragging ? messages.drag : messages.drop }}
      </p>
      <input
        ref="picker"
        class="yam3x-file-upload__picker"
        type="file"
        tabindex="-1"
        aria-hidden="true"
        :accept="accept || undefined"
        :multiple="multiple"
        :disabled="disabled"
        @change="onChoose"
      />
    </div>
    <p
      v-if="!items.length"
      class="yam3x-file-upload__support"
    >
      {{ messages.empty }}
    </p>
    <ul
      v-else
      class="yam3x-file-upload__queue"
    >
      <li
        v-for="item in items"
        :key="item.id"
        :data-upload-id="item.id"
        :data-status="item.status"
        class="yam3x-file-upload__item"
      >
        <div class="yam3x-file-upload__preview">
          <slot
            name="preview"
            :item="item"
            ><Icon
              name="draft"
              aria-hidden="true"
          /></slot>
        </div>
        <div class="yam3x-file-upload__content">
          <p class="yam3x-file-upload__name">
            <bdi>{{ item.file.name }}</bdi>
          </p>
          <p class="yam3x-file-upload__support yam3x-file-upload__numbers">
            {{ bytes(item.file.size) }}
          </p>
          <p
            class="yam3x-file-upload__support"
            :class="{
              'yam3x-file-upload__error': item.status === 'failed' || item.status === 'rejected',
            }"
          >
            {{ status(item) }}
          </p>
          <LinearProgressIndicator
            v-if="item.status === 'uploading' || item.status === 'processing'"
            :mode="item.status === 'uploading' && item.total ? 'determinate' : 'indeterminate'"
            :value="item.loaded"
            :max="item.total || 1"
            :aria-label="messages.action(status(item) || messages.uploading, item.file.name)"
          />
          <p
            v-if="item.status === 'uploading' && item.total"
            class="yam3x-file-upload__support yam3x-file-upload__numbers"
          >
            {{ formatter.format(Math.min(100, (item.loaded / item.total) * 100)) }}%
          </p>
        </div>
        <div class="yam3x-file-upload__actions">
          <Button
            v-if="upload && item.status === 'queued'"
            type="button"
            variant="text"
            :disabled="disabled"
            :aria-label="messages.action(messages.upload, item.file.name)"
            @click="queue.start(item.id)"
            >{{ messages.upload }}</Button
          >
          <Button
            v-if="upload && (item.status === 'failed' || item.status === 'canceled')"
            type="button"
            variant="text"
            :disabled="disabled"
            :aria-label="messages.action(messages.retry, item.file.name)"
            @click="queue.retry(item.id)"
            >{{ messages.retry }}</Button
          >
          <Button
            v-if="['waiting', 'uploading', 'processing'].includes(item.status)"
            type="button"
            variant="text"
            :disabled="disabled"
            :aria-label="messages.action(messages.cancel, item.file.name)"
            @click="queue.cancel(item.id)"
            >{{ messages.cancel }}</Button
          >
          <Button
            type="button"
            variant="text"
            :disabled="disabled"
            :aria-label="messages.action(messages.remove, item.file.name)"
            @click="remove(item.id)"
            >{{ messages.remove }}</Button
          >
        </div>
      </li>
    </ul>
    <p
      class="yam3x-file-upload__support"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ items.length ? messages.summary(counts) : '' }}
    </p>
    <p
      v-if="removalNotice"
      class="yam3x-file-upload__support"
      role="status"
    >
      {{ removalNotice }}
    </p>
  </fieldset>
</template>

<style scoped>
.yam3x-file-upload {
  --_yam3x-file-upload-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-file-upload-small-gap: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-file-upload-padding: calc(24px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-file-upload-row-height: calc(56px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-file-upload-color: var(--md-sys-color-on-surface);
  --_yam3x-file-upload-support: var(--md-sys-color-on-surface-variant);
  --_yam3x-file-upload-error: var(--md-sys-color-error);
  --_yam3x-file-upload-container: var(--md-sys-color-surface-container-low);
  --_yam3x-file-upload-outline: var(--md-sys-color-outline-variant);
  --_yam3x-file-upload-drag-outline: var(--md-sys-color-primary);
  --_yam3x-file-upload-corner: var(--md-sys-shape-corner-medium);
  --_yam3x-file-upload-title-font: var(--md-sys-typescale-title-medium-font-family);
  --_yam3x-file-upload-title-size: var(--md-sys-typescale-title-medium-font-size);
  --_yam3x-file-upload-title-weight: var(--md-sys-typescale-title-medium-font-weight);
  --_yam3x-file-upload-title-height: var(--md-sys-typescale-title-medium-line-height);
  --_yam3x-file-upload-title-tracking: var(--md-sys-typescale-title-medium-tracking);
  --_yam3x-file-upload-support-font: var(--md-sys-typescale-body-small-font-family);
  --_yam3x-file-upload-support-size: var(--md-sys-typescale-body-small-font-size);
  --_yam3x-file-upload-support-weight: var(--md-sys-typescale-body-small-font-weight);
  --_yam3x-file-upload-support-height: var(--md-sys-typescale-body-small-line-height);
  --_yam3x-file-upload-support-tracking: var(--md-sys-typescale-body-small-tracking);
  --_yam3x-file-upload-name-font: var(--md-sys-typescale-body-large-font-family);
  --_yam3x-file-upload-name-size: var(--md-sys-typescale-body-large-font-size);
  --_yam3x-file-upload-name-weight: var(--md-sys-typescale-body-large-font-weight);
  --_yam3x-file-upload-name-height: var(--md-sys-typescale-body-large-line-height);
  --_yam3x-file-upload-name-tracking: var(--md-sys-typescale-body-large-tracking);
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--_yam3x-file-upload-color);
}
.yam3x-file-upload__title {
  padding: 0;
  margin-block-end: var(--_yam3x-file-upload-gap);
  font-family: var(--_yam3x-file-upload-title-font);
  font-size: var(--_yam3x-file-upload-title-size);
  font-weight: var(--_yam3x-file-upload-title-weight);
  line-height: var(--_yam3x-file-upload-title-height);
  letter-spacing: var(--_yam3x-file-upload-title-tracking);
}
.yam3x-file-upload__selection {
  display: grid;
  gap: var(--_yam3x-file-upload-small-gap);
  min-inline-size: 0;
}
.yam3x-file-upload__selection--drop {
  padding: var(--_yam3x-file-upload-padding);
  background: var(--_yam3x-file-upload-container);
  border: 1px dashed var(--_yam3x-file-upload-outline);
  border-radius: var(--_yam3x-file-upload-corner);
}
.yam3x-file-upload__selection--dragging {
  outline: 2px solid var(--_yam3x-file-upload-drag-outline);
  outline-offset: -2px;
}
.yam3x-file-upload__support {
  margin: 0;
  color: var(--_yam3x-file-upload-support);
  font-family: var(--_yam3x-file-upload-support-font);
  font-size: var(--_yam3x-file-upload-support-size);
  font-weight: var(--_yam3x-file-upload-support-weight);
  line-height: var(--_yam3x-file-upload-support-height);
  letter-spacing: var(--_yam3x-file-upload-support-tracking);
  overflow-wrap: anywhere;
}
.yam3x-file-upload > .yam3x-file-upload__support,
.yam3x-file-upload__queue {
  margin-block-start: var(--_yam3x-file-upload-gap);
}
.yam3x-file-upload__queue {
  display: grid;
  gap: var(--_yam3x-file-upload-small-gap);
  padding: 0;
  margin-block-end: 0;
  list-style: none;
}
.yam3x-file-upload__item {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: var(--_yam3x-file-upload-gap);
  min-block-size: var(--_yam3x-file-upload-row-height);
  padding-block: var(--_yam3x-file-upload-small-gap);
}
.yam3x-file-upload__preview {
  display: flex;
  flex: 0 0 auto;
  max-inline-size: 100%;
}
.yam3x-file-upload__content {
  display: grid;
  flex: 1 1 12rem;
  min-inline-size: 0;
  gap: var(--_yam3x-file-upload-small-gap);
}
.yam3x-file-upload__name {
  margin: 0;
  font-family: var(--_yam3x-file-upload-name-font);
  font-size: var(--_yam3x-file-upload-name-size);
  font-weight: var(--_yam3x-file-upload-name-weight);
  line-height: var(--_yam3x-file-upload-name-height);
  letter-spacing: var(--_yam3x-file-upload-name-tracking);
  overflow-wrap: anywhere;
}
.yam3x-file-upload__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--_yam3x-file-upload-small-gap);
}
.yam3x-file-upload__numbers {
  font-variant-numeric: tabular-nums;
}
.yam3x-file-upload__error {
  color: var(--_yam3x-file-upload-error);
}
.yam3x-file-upload__picker {
  display: none;
}
.yam3x-file-upload[hidden] {
  display: none;
}
@media (forced-colors: active) {
  .yam3x-file-upload__selection--drop {
    border-color: CanvasText;
  }
  .yam3x-file-upload__selection--dragging {
    outline-color: Highlight;
  }
}
</style>
