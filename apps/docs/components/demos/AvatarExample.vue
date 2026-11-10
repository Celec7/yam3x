<script setup lang="ts">
import Avatar from '@registry/components/avatar/avatar.vue'
import Badge from '@registry/components/badge/badge.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo avatar-example">
    <div class="yam3x-demo__row avatar-example__row">
      <Avatar>{{ t('Annie', '安妮') }}</Avatar>
      <Avatar
        class="avatar-example__medium"
        role="img"
        :aria-label="t('User profile icon', '用户轮廓图标')"
      >
        <Icon name="person" />
      </Avatar>
      <Avatar
        ><img
          src="/avatar-example.svg"
          :alt="t('Annie’s avatar', '安妮的头像')"
      /></Avatar>
      <span class="avatar-example__presence">
        <Avatar
          id="avatar-example-presence"
          class="avatar-example__large"
          role="img"
          :aria-label="t('M3 workspace', 'M3 工作区')"
          >M3</Avatar
        >
        <Badge
          for="avatar-example-presence"
          :aria-label="t('Available now', '当前在线')"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.avatar-example__row {
  align-items: center;
  gap: 24px;
}
.avatar-example__medium {
  --yam3x-avatar-size: 48px;
}
.avatar-example__large {
  --yam3x-avatar-size: 56px;
  --yam3x-avatar-shape: 12px;
}
.avatar-example__presence {
  position: relative;
  display: inline-flex;
}
</style>
