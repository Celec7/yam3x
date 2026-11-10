<script setup lang="ts">
import { ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import Dialog from '@registry/components/dialog/dialog.vue'
import { HorizontalDivider } from '@registry/components/divider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const open = ref(false)
const returnValue = ref('')
const dialog = ref<{ close: (value?: string) => void } | null>(null)
const preventNextClose = ref(false)
const eventLog = ref<string[]>([])

function record(name: string): void {
  eventLog.value.push(name)
}

function onClosing(event: Event): void {
  record('closing')
  if (preventNextClose.value) {
    event.preventDefault()
    preventNextClose.value = false
  }
}
</script>

<template>
  <div
    class="yam3x-demo"
    data-testid="dialog-basic"
  >
    <div class="dialog-example__controls">
      <Button @click="open = true">{{ t('Open dialog', '打开对话框') }}</Button>
      <Button
        variant="outlined"
        @click="preventNextClose = true"
        >{{ t('Prevent next close', '阻止下次关闭') }}</Button
      >
    </div>
    <Dialog
      ref="dialog"
      v-model:open="open"
      v-model:return-value="returnValue"
      :title="t('Save changes?', '保存更改？')"
      :description="
        t('You can continue editing this plan after saving.', '保存后，你可以继续编辑此计划。')
      "
      :close-label="t('Close save dialog', '关闭保存对话框')"
      @opening="record('opening')"
      @opened="record('opened')"
      @cancel="record('cancel')"
      @closing="onClosing"
      @closed="record('closed')"
    >
      <template #divider><HorizontalDivider /></template>
      <template #actions>
        <Button
          variant="text"
          @click="dialog?.close('cancelled')"
          >{{ t('Cancel', '取消') }}</Button
        >
        <Button
          variant="text"
          @click="dialog?.close('saved')"
          >{{ t('Save', '保存') }}</Button
        >
      </template>
    </Dialog>
    <p
      class="yam3x-demo__status"
      role="status"
    >
      {{ t('Last result:', '上次结果：') }} {{ returnValue || t('None', '无') }}
    </p>
    <p
      class="yam3x-demo__status"
      role="log"
    >
      {{ t('Dialog events:', '对话框事件：') }} {{ eventLog.join(' → ') }}
    </p>
  </div>
</template>

<style scoped>
.dialog-example__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
