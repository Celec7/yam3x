<script setup lang="ts">
import Avatar from '@registry/components/avatar/avatar.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo">
    <div class="yam3x-demo__row">
      <Avatar>{{ t('Annie', '安妮') }}</Avatar>
      <Avatar
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
      <Avatar
        class="avatar-example__rounded"
        :aria-label="t('Square initials avatar', '方形首字母头像')"
        >M3</Avatar
      >
    </div>
  </div>
</template>

<style scoped>
.avatar-example__rounded {
  --yam3x-avatar-shape: 12px;
}
</style>
