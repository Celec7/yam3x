<script setup lang="ts">
import { ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import Dialog from '@registry/components/dialog/dialog.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const iconDialogOpen = ref(false)
const alertOpen = ref(false)
const outsideLockedOpen = ref(false)
</script>

<template>
  <div
    class="yam3x-demo"
    data-testid="dialog-variants"
  >
    <div class="dialog-variants__controls">
      <Button
        variant="outlined"
        @click="iconDialogOpen = true"
        >{{
          t('Open dialog with icon and project close button', '打开带图标和项目关闭按钮的对话框')
        }}</Button
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
    </div>
    <Dialog
      v-model:open="iconDialogOpen"
      :title="t('Delete workspace?', '删除工作区？')"
      :description="t('This action can be undone later.', '之后仍可撤销此操作。')"
      show-close-button
      :close-label="t('Close delete dialog', '关闭删除对话框')"
    >
      <template #icon><Icon name="warning" /></template>
      <template #default>
        {{
          t(
            'Archived workspaces can be restored from the administration panel.',
            '归档后仍可在管理面板中恢复工作区。',
          )
        }}
      </template>
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
      <template #actions>
        <Button
          variant="text"
          @click="alertOpen = false"
          >{{ t('Got it', '知道了') }}</Button
        >
      </template>
    </Dialog>
    <Dialog
      v-model:open="outsideLockedOpen"
      :title="t('Review your changes', '检查更改')"
      :dismiss-on-escape="true"
      :dismiss-on-click-outside="false"
    >
      <template #actions>
        <Button
          variant="text"
          @click="outsideLockedOpen = false"
          >{{ t('Done', '完成') }}</Button
        >
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.dialog-variants__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
