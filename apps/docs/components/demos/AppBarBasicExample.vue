<script setup lang="ts">
import { AppBar } from '@registry/components/app-bar'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <section
    data-testid="app-bar-basic"
    class="app-bar-basic"
  >
    <AppBar variant="small">
      <template #leading>
        <IconButton
          variant="standard"
          :aria-label="t('Back to library', '返回媒体库')"
        >
          <Icon name="arrow_back" />
        </IconButton>
      </template>
      <template #title>{{ t('Library', '媒体库') }}</template>
      <template #trailing>
        <IconButton
          variant="standard"
          :aria-label="t('Notifications', '通知')"
        >
          <Icon name="notifications" />
        </IconButton>
        <IconButton
          variant="standard"
          :aria-label="t('Profile', '个人资料')"
        >
          <Icon name="account_circle" />
        </IconButton>
      </template>
    </AppBar>
    <div class="app-bar-basic__body">
      <p>
        {{
          t(
            'A Small app bar keeps one line of title text and places page actions at the end.',
            'Small 应用栏保持单行标题，并将页面操作放在末尾。',
          )
        }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.app-bar-basic {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  background: var(--md-sys-color-surface);
}
.app-bar-basic__body {
  padding: 16px 24px;
}
.app-bar-basic__body p {
  margin: 0;
}
</style>
