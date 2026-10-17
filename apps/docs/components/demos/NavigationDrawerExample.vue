<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Button } from '@registry/components/button'
import Icon from '@registry/components/icon/icon.vue'
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerItem,
  NavigationDrawerSection,
} from '@registry/components/navigation-drawer'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const current = ref('inbox')
const activeRegion = ref<HTMLElement | null>(null)
const destinations = computed(() => [
  { value: 'inbox', label: t('Inbox', '收件箱'), href: '#inbox' },
  { value: 'starred', label: t('Starred', '已加星标'), href: '#starred' },
  { value: 'snoozed', label: t('Snoozed', '稍后处理'), href: '#snoozed' },
  { value: 'sent', label: t('Sent', '已发送'), href: '#sent' },
  { value: 'archive', label: t('Archive', '归档'), href: '#archive' },
])
const activeDestination = computed(() =>
  destinations.value.find((destination) => destination.value === current.value),
)

async function selectDestination(
  value: string,
  _href: string | undefined,
  event: MouseEvent,
): Promise<void> {
  event.preventDefault()
  current.value = value
  await nextTick()
  await nextTick()
  activeRegion.value?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="navigation-drawer-demo">
    <NavigationDrawer
      v-model:selected="current"
      mode="auto"
      :standard-breakpoint="840"
      :label="t('Main navigation', '主导航')"
      :navigation-label="t('Main navigation', '主导航')"
      @select="selectDestination"
    >
      <template #header>
        <strong>{{ t('Mail', '邮件') }}</strong>
      </template>
      <template #close="{ close, closeLabel }">
        <Button
          variant="text"
          type="button"
          :aria-label="closeLabel"
          @click="close"
        >
          {{ t('Close', '关闭') }}
        </Button>
      </template>
      <template #toggle="{ expanded, controls, toggle }">
        <Button
          variant="filled-tonal"
          type="button"
          :aria-label="
            expanded ? t('Close navigation', '关闭导航') : t('Open navigation', '打开导航')
          "
          :aria-expanded="expanded"
          :aria-controls="controls"
          @click="toggle"
        >
          {{ expanded ? t('Close navigation', '关闭导航') : t('Open navigation', '打开导航') }}
        </Button>
      </template>

      <NavigationDrawerSection :label="t('Mail', '邮件')">
        <NavigationDrawerItem
          v-for="destination in destinations.slice(0, 3)"
          :key="destination.value"
          :value="destination.value"
          :label="destination.label"
          :href="destination.href"
        >
          <template #icon><Icon name="inbox" /></template>
          <template #selected-icon
            ><Icon
              name="inbox"
              class="filled"
          /></template>
        </NavigationDrawerItem>
      </NavigationDrawerSection>
      <NavigationDrawerDivider />
      <NavigationDrawerSection :label="t('More', '更多')">
        <NavigationDrawerItem
          :value="destinations[3].value"
          :label="destinations[3].label"
          :href="destinations[3].href"
        >
          <template #icon><Icon name="inbox" /></template>
        </NavigationDrawerItem>
        <NavigationDrawerItem
          value="collections"
          :label="t('Collections', '收藏夹')"
        >
          <NavigationDrawerItem
            value="archive"
            :label="destinations[4].label"
            :href="destinations[4].href"
          />
          <NavigationDrawerItem
            value="saved"
            :label="t('Saved', '已保存')"
            href="#saved"
          />
        </NavigationDrawerItem>
      </NavigationDrawerSection>

      <template #content>
        <main
          :id="current"
          ref="activeRegion"
          class="navigation-drawer-demo__main"
          tabindex="-1"
        >
          <h3>{{ activeDestination?.label ?? t('Collections', '收藏夹') }}</h3>
          <p>
            {{
              t(
                'This compatibility component presents navigation destinations in a standard or modal drawer.',
                '此兼容组件以 standard 或 modal 抽屉呈现导航目的地。',
              )
            }}
          </p>
        </main>
      </template>
    </NavigationDrawer>
  </div>
</template>

<style scoped>
.navigation-drawer-demo {
  block-size: 420px;
  min-inline-size: 0;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
}
.navigation-drawer-demo :deep(.yam3x-drawer) {
  block-size: 100%;
}
.navigation-drawer-demo :deep(.yam3x-navigation-drawer) {
  min-block-size: 100%;
  padding-block: 8px;
}
.navigation-drawer-demo__main {
  box-sizing: border-box;
  min-block-size: 100%;
  padding: 24px;
  background: var(--md-sys-color-surface);
}
.navigation-drawer-demo__main p {
  max-inline-size: 36rem;
  line-height: 1.6;
}
</style>
