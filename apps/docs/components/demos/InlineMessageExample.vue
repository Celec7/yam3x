<script setup lang="ts">
import { ref } from 'vue'
import { InlineMessage } from '@registry/components/inline-message'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'
const { t } = useDemoLocale()
const open = ref(true)
const retry = ref<HTMLDivElement>()
const saved = ref(false)
function onRetry() {
  saved.value = true
  open.value = false
}
function onShowError() {
  open.value = true
  saved.value = false
}
</script>

<template>
  <div class="inline-message-demo">
    <InlineMessage :title="t('Shared with your team', '已与团队共享')">
      {{
        t(
          'Everyone in this workspace can read this document.',
          '此工作区中的所有成员都能阅读这份文档。',
        )
      }}
    </InlineMessage>
    <InlineMessage
      tone="warning"
      :title="t('Review access before sharing', '共享前请检查权限')"
    >
      {{
        t(
          'The public link can be opened by anyone who receives it.',
          '任何收到公开链接的人都能打开它。',
        )
      }}
    </InlineMessage>
    <InlineMessage
      v-model:open="open"
      tone="error"
      announcement="polite"
      :title="t('Changes are not saved', '更改尚未保存')"
      dismissible
      :dismiss-label="t('Dismiss save error', '关闭保存错误提示')"
      :dismiss-focus="() => retry?.querySelector('button') ?? null"
    >
      {{
        t(
          'Your edits are still here. Check your connection, then try saving again.',
          '你的编辑仍然保留。请检查网络连接，然后重试保存。',
        )
      }}
      <template #actions
        ><Button
          variant="text"
          @click="onRetry"
          >{{ t('Retry saving', '重试保存') }}</Button
        ></template
      >
    </InlineMessage>
    <InlineMessage
      v-if="saved"
      tone="success"
      announcement="polite"
      :title="t('Changes saved', '更改已保存')"
    >
      {{ t('Your team can now see the latest version.', '团队现在可以看到最新版本。') }}
    </InlineMessage>
    <div
      ref="retry"
      class="inline-message-demo__actions"
    >
      <Button
        variant="outlined"
        @click="onShowError"
        >{{ t('Show save error', '显示保存错误') }}</Button
      >
    </div>
  </div>
</template>

<style scoped>
.inline-message-demo {
  display: grid;
  gap: 16px;
}
.inline-message-demo__actions {
  display: flex;
  flex-wrap: wrap;
}
</style>
