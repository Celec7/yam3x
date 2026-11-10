<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail, type NavigationRailItem } from '@registry/components/navigation-rail'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()

function localHref(path: string): string {
  return locale.value === 'zh' ? `/zh${path}` : path
}

const current = ref('overview')
const iconNames: Record<string, string> = {
  overview: 'dashboard',
  projects: 'folder',
  activity: 'notifications',
  archive: 'archive',
}
const items: NavigationRailItem[] = [
  { value: 'overview', label: t('Overview', '概览'), href: localHref('/') },
  { value: 'projects', label: t('Projects', '项目'), href: localHref('/components/card') },
  {
    value: 'activity',
    label: t('Activity', '动态'),
    href: localHref('/components/chips'),
    badge: 8,
    badgeLabel: t('8 unread updates', '8 条未读更新'),
  },
  {
    value: 'archive',
    label: t('Archive', '归档'),
    href: localHref('/components/list'),
    disabled: true,
  },
]
</script>

<template>
  <section
    data-testid="navigation-rail-basic"
    class="rail-basic"
  >
    <div class="rail-basic__frame">
      <NavigationRail
        v-model="current"
        class="rail-basic__rail"
        :label="t('Workspace navigation', '工作区导航')"
        :items="items"
        :show-menu="false"
      >
        <template #icon="{ item }"><Icon :name="iconNames[item.value]" /></template>
        <template #selected-icon="{ item }"
          ><Icon
            :name="iconNames[item.value]"
            filled
        /></template>
        <template #fab>
          <button
            type="button"
            class="rail-basic__fab"
            :aria-label="t('Compose update', '撰写更新')"
          >
            <Icon name="add" />
          </button>
        </template>
      </NavigationRail>
      <div class="rail-basic__content">
        <h3>{{ t('Workspace overview', '工作区概览') }}</h3>
        <p>
          {{
            t(
              'The selected destination stays marked while the content scrolls independently.',
              '内容独立滚动时，选中的目的地始终保持标记。',
            )
          }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rail-basic {
  min-inline-size: 0;
}
.rail-basic__frame {
  display: flex;
  min-block-size: 260px;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
}
.rail-basic__rail {
  flex: none;
}
.rail-basic__content {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 24px;
}
.rail-basic__content h3,
.rail-basic__content p {
  margin: 0;
}
.rail-basic__fab {
  display: grid;
  inline-size: 48px;
  block-size: 48px;
  place-items: center;
  border: 0;
  border-radius: 16px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  cursor: pointer;
}
</style>
