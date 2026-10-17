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
  <div class="yam3x-demo">
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
        <Badge for="badge-example-updates">3</Badge>
      </span>
      <span class="badge-example__anchor">
        <IconButton
          id="badge-example-alerts"
          :aria-label="t('Alerts', '提醒')"
        >
          <Icon name="warning" />
        </IconButton>
        <Badge for="badge-example-alerts">999+</Badge>
      </span>
      <Button @click="unread = !unread">{{
        unread
          ? t('Mark messages as read', '标记消息已读')
          : t('Restore unread badge', '恢复未读徽标')
      }}</Button>
    </div>
    <div class="yam3x-demo__row badge-example__positions">
      <Badge />
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-start"
          :aria-label="t('Before', '前')"
        /><Badge
          for="badge-pos-start"
          position="above-before"
          >1</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-end"
          :aria-label="t('After', '后')"
        /><Badge
          for="badge-pos-end"
          position="below-after"
          >2</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-top"
          :aria-label="t('Above', '上方')"
        /><Badge
          for="badge-pos-top"
          position="above"
          >3</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-bottom"
          :aria-label="t('Below', '下方')"
        /><Badge
          for="badge-pos-bottom"
          position="below"
          >4</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-below-before"
          :aria-label="t('Below before', '下方前侧')"
        /><Badge
          for="badge-pos-below-before"
          position="below-before"
          >5</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-before"
          :aria-label="t('Before', '前')"
        /><Badge
          for="badge-pos-before"
          position="before"
          >6</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-after"
          :aria-label="t('After', '后')"
        /><Badge
          for="badge-pos-after"
          position="after"
          >7</Badge
        ></span
      >
    </div>
  </div>
</template>

<style scoped>
.badge-example__anchor {
  position: relative;
  display: inline-flex;
}
.badge-example__positions {
  gap: 32px;
}
</style>
