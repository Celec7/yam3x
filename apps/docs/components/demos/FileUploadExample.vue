<script setup lang="ts">
import { computed, shallowRef, ref } from 'vue'
import {
  FileUpload,
  type FileUploadContext,
  type FileUploadResult,
  type FileUploadItem,
} from '@registry/components/file-upload'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'
const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const disabled = ref(false)
const droppable = ref(true)
const items = shallowRef<Array<Readonly<FileUploadItem>>>([])
interface Request {
  context: FileUploadContext
  resolve: (result: FileUploadResult) => void
}
const requests = shallowRef<Request[]>([])
function upload(context: FileUploadContext): Promise<FileUploadResult> {
  return new Promise((resolve) => {
    requests.value = [...requests.value, { context, resolve }]
    context.signal.addEventListener(
      'abort',
      () => finish(context.id, { status: 'error', message: 'Canceled' }),
      { once: true },
    )
  })
}
function finish(id: string, result: FileUploadResult) {
  const request = requests.value.find((entry) => entry.context.id === id)
  requests.value = requests.value.filter((entry) => entry.context.id !== id)
  request?.resolve(result)
}
function reject(id: string) {
  finish(id, {
    status: 'error',
    message: t('The server rejected this file. Try again.', '服务端拒绝了此文件，请重试。'),
  })
}
</script>

<template>
  <div class="file-upload-demo">
    <p>
      {{
        t(
          'Simulation only: files stay in this browser. Use the response controls to report progress, processing, success, or failure.',
          '仅为模拟：文件保留在本浏览器中。使用响应控件报告进度、服务端处理、成功或失败。',
        )
      }}
    </p>
    <div class="file-upload-demo__actions">
      <Checkbox
        v-model="disabled"
        :label="t('Disable file actions', '禁用文件操作')"
      />
      <Checkbox
        v-model="droppable"
        :label="t('Offer drag and drop', '提供拖放区域')"
      />
    </div>
    <FileUpload
      :label="t('Attachments', '附件')"
      :description="t('Choose supporting documents for this request.', '为此请求选择补充文件。')"
      accept=".txt,image/png"
      :max-file-size="2 * 1024 * 1024"
      :max-files="3"
      :concurrency="2"
      :upload="upload"
      :disabled="disabled"
      :droppable="droppable"
      :locale="fieldLocale"
      @change="items = $event"
    />
    <div
      v-if="requests.length"
      class="file-upload-demo__responses"
    >
      <section
        v-for="request in requests"
        :key="request.context.id"
        :data-response-id="request.context.id"
      >
        <p>
          {{ t('Simulated response for', '模拟响应：') }} <bdi>{{ request.context.file.name }}</bdi>
        </p>
        <div class="file-upload-demo__actions">
          <Button
            variant="outlined"
            @click="
              request.context.reportProgress(
                request.context.file.size / 2,
                request.context.file.size,
              )
            "
            >{{ t('Report 50%', '报告 50%') }}</Button
          >
          <Button
            variant="outlined"
            @click="request.context.reportProcessing()"
            >{{ t('Server processing', '服务端处理') }}</Button
          >
          <Button
            @click="
              finish(request.context.id, {
                status: 'success',
                value: { name: request.context.file.name },
              })
            "
            >{{ t('Complete', '完成') }}</Button
          >
          <Button
            variant="text"
            @click="reject(request.context.id)"
            >{{ t('Reject', '拒绝') }}</Button
          >
        </div>
      </section>
    </div>
    <p data-testid="upload-completed">
      {{ t('Completed:', '已完成：') }}
      {{ items.filter((item) => item.status === 'completed').length }}
    </p>
  </div>
</template>

<style scoped>
.file-upload-demo {
  display: grid;
  gap: 24px;
}
.file-upload-demo p {
  margin: 0;
  overflow-wrap: anywhere;
}
.file-upload-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.file-upload-demo__responses {
  display: grid;
  gap: 24px;
}
.file-upload-demo__responses section {
  display: grid;
  gap: 8px;
}
</style>
