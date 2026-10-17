<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { useSnackbar } from '@registry/components/snackbar'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const snackbar = useSnackbar()
const lastResult = ref('')
const actionCount = ref(0)

function showMessage(
  message: string,
  options: Parameters<typeof snackbar.show>[0] = { message },
): void {
  void snackbar.show({ ...options, message }).then((result) => {
    lastResult.value = `${t('Result:', '结果：')} ${result}`
  })
}

function showQueuedMessages(): void {
  showMessage(t('The first update was queued', '第一条更新已加入队列'))
  showMessage(
    t('The second update will appear after the first one closes', '第二条更新会在第一条关闭后出现'),
  )
}
</script>

<template>
  <div class="yam3x-snackbar-demo__controls">
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="showMessage(t('Changes saved', '更改已保存'))"
      >{{ t('Plain snackbar', '普通通知') }}</Button
    >
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="
        showMessage(
          t(
            'This longer status message wraps naturally in narrower windows.',
            '这一条较长的状态消息会根据较窄的窗口宽度自然换行。',
          ),
        )
      "
      >{{ t('Long message', '长文本通知') }}</Button
    >
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="
        showMessage(t('File moved to trash', '文件已移至回收站'), {
          message: t('File moved to trash', '文件已移至回收站'),
          actionLabel: t('Undo', '撤销'),
          onAction: () => {
            actionCount++
          },
        })
      "
      >{{ t('Snackbar with action', '带操作通知') }}</Button
    >
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="
        showMessage(t('Settings updated', '设置已更新'), {
          message: t('Settings updated', '设置已更新'),
          actionLabel: t('Review account activity', '查看账户活动记录'),
        })
      "
      >{{ t('Long action', '长操作文本') }}</Button
    >
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="
        showMessage(
          t('Sync complete; page state was also updated.', '同步完成；页面状态也已更新。'),
          {
            message: t(
              'Sync complete; page state was also updated.',
              '同步完成；页面状态也已更新。',
            ),
            timeoutMs: 5000,
            inlineFeedback: true,
            key: 'sync',
          },
        )
      "
      >{{ t('Timed snackbar', '可定时通知') }}</Button
    >
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="
        showMessage(t('Sync status updated to “Processing”.', '同步状态已更新为“正在处理”。'), {
          message: t('Sync status updated to “Processing”.', '同步状态已更新为“正在处理”。'),
          timeoutMs: 5000,
          inlineFeedback: true,
          key: 'sync',
        })
      "
      >{{ t('Update the same snackbar', '更新同一通知') }}</Button
    >
    <Button
      variant="filled-tonal"
      size="medium"
      type="button"
      @click="showQueuedMessages"
      >{{ t('Queued snackbars', '连续通知') }}</Button
    >
    <Button
      variant="outlined"
      size="medium"
      type="button"
      @click="snackbar.dismiss()"
      >{{ t('Dismiss current snackbar', '关闭当前通知') }}</Button
    >
    <p aria-live="polite">
      {{ lastResult || t('No result yet', '尚无结果') }}; {{ t('Undo actions:', '撤销操作次数：') }}
      {{ actionCount }}
    </p>
    <Button
      class="yam3x-snackbar-demo__page-control"
      type="button"
      >{{ t('Page footer control', '页面底部控件') }}</Button
    >
    <slot />
  </div>
</template>

<style scoped>
.yam3x-snackbar-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
}
.yam3x-snackbar-demo__controls > p {
  flex-basis: 100%;
}
.yam3x-snackbar-demo__page-control {
  position: fixed;
  right: 24px;
  bottom: 16px;
}
</style>
