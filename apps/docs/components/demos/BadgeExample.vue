<script setup lang="ts">
import { ref } from 'vue'
import Badge from '@registry/components/badge/badge.vue'
import Button from '@registry/components/button/button.vue'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const unread = ref(true)
</script>

<template>
  <div
    class="yam3x-demo badge-example"
    data-testid="badge-anchored"
  >
    <div class="yam3x-demo__row badge-example__row">
      <span class="badge-example__anchor">
        <IconButton
          id="badge-example-messages"
          :aria-label="t('Messages', '消息')"
          @click="unread = false"
        >
          <Icon name="chat_bubble" />
        </IconButton>
        <Badge
          for="badge-example-messages"
          :aria-label="t('New messages', '新消息')"
          :hidden="!unread"
        />
      </span>
      <span class="badge-example__anchor">
        <IconButton
          id="badge-example-updates"
          :aria-label="t('Updates', '更新')"
        >
          <Icon name="calendar_month" />
        </IconButton>
        <Badge
          for="badge-example-updates"
          :aria-label="t('3 unread updates', '3 条未读更新')"
          >3</Badge
        >
      </span>
      <span class="badge-example__anchor">
        <IconButton
          id="badge-example-alerts"
          :aria-label="t('Alerts', '提醒')"
        >
          <Icon name="warning" />
        </IconButton>
        <Badge
          for="badge-example-alerts"
          :aria-label="t('More than 999 alerts', '超过 999 条提醒')"
          >999+</Badge
        >
      </span>
      <Button @click="unread = !unread">{{
        unread
          ? t('Mark messages as read', '标记消息已读')
          : t('Restore unread badge', '恢复未读徽标')
      }}</Button>
    </div>
    <p class="badge-example__note">
      {{
        t(
          'The dot, counts, and the abbreviated 999+ value share one anchor behavior.',
          '圆点、计数与缩写后的 999+ 共用同一套锚点行为。',
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.badge-example__anchor {
  position: relative;
  display: inline-flex;
}
.badge-example__row {
  align-items: center;
  gap: 24px;
}
.badge-example__note {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
</style>
