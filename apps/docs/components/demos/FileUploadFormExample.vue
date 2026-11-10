<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { FileUpload, type FileUploadItem } from '@registry/components/file-upload'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const upload = ref<InstanceType<typeof FileUpload> | null>(null)
const items = shallowRef<Array<Readonly<FileUploadItem>>>([])
const submitted = ref('')
const opened = ref(false)
const messages = computed(() => ({ select: t('Choose a document', '选择文档') }))

function submit(event: Event): void {
  const form = event.currentTarget as HTMLFormElement
  const body = new FormData(form)
  for (const item of items.value) {
    if (item.status === 'queued') body.append('document', item.file, item.file.name)
  }
  // The demo reports the submitted payload without sending it anywhere.
  const file = body.get('document')
  submitted.value = file instanceof File ? file.name : t('No document', '未选择文档')
}

function reset(): void {
  submitted.value = ''
  upload.value?.clear()
}

function onToggle(event: Event): void {
  opened.value = (event.currentTarget as HTMLDetailsElement).open
}
</script>

<template>
  <details
    class="file-upload-form"
    data-testid="file-upload-form"
    @toggle="onToggle"
  >
    <summary>{{ t('Show form submission example', '显示表单提交示例') }}</summary>
    <div
      v-if="opened"
      class="file-upload-form__body"
    >
      <form
        @submit.prevent="submit"
        @reset="reset"
      >
        <FileUpload
          ref="upload"
          :label="t('Supporting document', '补充文档')"
          :description="
            t(
              'Choose one PDF to include with the request. The queue owns the selected file.',
              '选择一个 PDF 附加到请求中。队列拥有所选文件。',
            )
          "
          accept=".pdf"
          :multiple="false"
          :max-file-size="5 * 1024 * 1024"
          :messages="messages"
          :locale="localeTag"
          @change="items = $event"
        />
        <div class="file-upload-form__actions">
          <Button type="submit">{{ t('Submit request', '提交请求') }}</Button>
          <Button
            type="reset"
            variant="text"
            >{{ t('Reset', '重置') }}</Button
          >
        </div>
      </form>
      <p data-testid="file-upload-form-submitted">
        {{ t('Submitted document:', '已提交文档：') }} {{ submitted || t('None', '无') }}
      </p>
    </div>
  </details>
</template>

<style scoped>
.file-upload-form {
  display: grid;
  gap: 16px;
  min-inline-size: 0;
}
.file-upload-form > summary {
  cursor: pointer;
}
.file-upload-form__body {
  display: grid;
  gap: 16px;
  margin-block-start: 16px;
}
.file-upload-form form {
  display: grid;
  gap: 16px;
}
.file-upload-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.file-upload-form p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
