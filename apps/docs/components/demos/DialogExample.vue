<script setup lang="ts">
import { ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import Dialog from '@registry/components/dialog/dialog.vue'
import { HorizontalDivider } from '@registry/components/divider'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const open = ref(false)
const returnValue = ref('')
const dialog = ref<{ close: (value?: string) => void } | null>(null)
const alertOpen = ref(false)
const outsideLockedOpen = ref(false)
const iconDialogOpen = ref(false)
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
  <div class="yam3x-demo">
    <Button @click="open = true">{{ t('Open dialog', '打开对话框') }}</Button>
    <Button
      variant="outlined"
      @click="preventNextClose = true"
      >{{ t('Prevent next close', '阻止下次关闭') }}</Button
    >
    <Button
      variant="text"
      @click="alertOpen = true"
      >{{ t('Open urgent alert', '打开紧急提醒') }}</Button
    >
    <Button
      variant="text"
      @click="outsideLockedOpen = true"
      >{{ t('Open outside-locked dialog', '打开禁止点击外部关闭的对话框') }}</Button
    >
    <Button
      variant="outlined"
      @click="iconDialogOpen = true"
      >{{
        t('Open dialog with icon and project close button', '打开带图标和项目关闭按钮的对话框')
      }}</Button
    >
    <Dialog
      ref="dialog"
      v-model:open="open"
      v-model:return-value="returnValue"
      :title="t('Save changes?', '保存更改？')"
      :description="
        t('You can continue editing this plan after saving.', '保存后，你可以继续编辑此计划。')
      "
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
    <Dialog
      v-model:open="iconDialogOpen"
      :title="t('Delete workspace?', '删除工作区？')"
      :description="t('This action can be undone later.', '之后仍可撤销此操作。')"
      show-close-button
      :close-label="t('Close delete dialog', '关闭删除对话框')"
    >
      <template #icon><Icon name="warning" /></template>
      <template #default>{{
        t(
          'Archived workspaces can be restored from the administration panel.',
          '归档后仍可在管理面板中恢复工作区。',
        )
      }}</template>
      <template #actions>
        <Button
          variant="text"
          @click="iconDialogOpen = false"
          >{{ t('Cancel', '取消') }}</Button
        >
        <Button
          variant="text"
          @click="iconDialogOpen = false"
          >{{ t('Continue', '继续') }}</Button
        >
      </template>
    </Dialog>
    <Dialog
      v-model:open="alertOpen"
      :title="t('Network connection lost', '网络连接已中断')"
      :description="t('Reconnect to sync your changes.', '恢复连接后才能同步更改。')"
      :dismiss-on-escape="false"
      :dismiss-on-click-outside="true"
    >
      <template #actions
        ><Button
          variant="text"
          @click="alertOpen = false"
          >{{ t('Got it', '知道了') }}</Button
        ></template
      >
    </Dialog>
    <Dialog
      v-model:open="outsideLockedOpen"
      :title="t('Review your changes', '检查更改')"
      :dismiss-on-escape="true"
      :dismiss-on-click-outside="false"
    >
      <template #actions
        ><Button
          variant="text"
          @click="outsideLockedOpen = false"
          >{{ t('Done', '完成') }}</Button
        ></template
      >
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
