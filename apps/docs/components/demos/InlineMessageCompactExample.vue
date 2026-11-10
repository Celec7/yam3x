<script setup lang="ts">
import { ref } from 'vue'
import InlineMessage from '@registry/components/inline-message/inline-message.vue'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const reviewed = ref(false)
</script>

<template>
  <div
    class="inline-message-compact-demo"
    data-testid="inline-message-compact"
  >
    <InlineMessage>
      {{
        t(
          'Your draft is stored locally and will sync when the connection returns.',
          '草稿已保存在本地，连接恢复后会自动同步。',
        )
      }}
    </InlineMessage>
    <InlineMessage :icon="false">
      {{
        t(
          'Offline mode is active. Changes are safe on this device.',
          '离线模式已启用。更改已安全保存在此设备上。',
        )
      }}
      <template #actions>
        <Button
          variant="text"
          @click="reviewed = true"
          >{{
            reviewed ? t('Changes reviewed', '已检查更改') : t('Review changes', '检查更改')
          }}</Button
        >
      </template>
    </InlineMessage>
    <InlineMessage
      class="inline-message-compact-demo__custom"
      :title="t('Appearance override', '外观覆盖')"
    >
      {{
        t(
          'The container color, foreground, and corner shape can be overridden together.',
          '容器颜色、前景色和圆角形状可以一起覆盖。',
        )
      }}
    </InlineMessage>
  </div>
</template>

<style scoped>
.inline-message-compact-demo {
  display: grid;
  gap: 12px;
}
.inline-message-compact-demo__custom {
  --yam3x-inline-message-shape: 8px;
  --yam3x-inline-message-container-color: var(--md-sys-color-surface-container-high);
  --yam3x-inline-message-content-color: var(--md-sys-color-on-surface);
}
</style>
