<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Button } from '@registry/components/button'
import Icon from '@registry/components/icon/icon.vue'
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerItem,
  NavigationDrawerSection,
  type NavigationDrawerMode,
} from '@registry/components/navigation-drawer'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const mode = ref<NavigationDrawerMode>('auto')
const width = ref('360px')
const current = ref('inbox')
const activeRegion = ref<HTMLElement | null>(null)
const destinations = computed(() => [
  { value: 'inbox', label: t('Inbox', '收件箱'), href: '#inbox', icon: 'inbox' },
  { value: 'starred', label: t('Starred', '已加星标'), href: '#starred', icon: 'star' },
  { value: 'drafts', label: t('Drafts', '草稿'), href: '#drafts', icon: 'draft' },
  { value: 'sent', label: t('Sent', '已发送'), href: '#sent', icon: 'send' },
  { value: 'archive', label: t('Archive', '归档'), href: '#archive', icon: 'archive' },
])
const activeDestination = computed(() =>
  destinations.value.find((destination) => destination.value === current.value),
)

function setMode(value: string | string[] | null) {
  if (value === 'auto' || value === 'standard' || value === 'modal') mode.value = value
}
function setWidth(value: string | string[] | null) {
  if (value === '280px' || value === '360px' || value === '420px') width.value = value
}
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
  <div class="yam3x-demo navigation-drawer-example">
    <div class="yam3x-demo__row navigation-drawer-example__controls">
      <div class="navigation-drawer-example__control">
        <span>{{ t('Mode', '模式') }}</span>
        <Select
          :model-value="mode"
          :aria-label="t('Drawer mode', '抽屉模式')"
          data-testid="navigation-drawer-mode"
          @update:model-value="setMode"
        >
          <Option
            value="auto"
            :label="t('Auto', '自动')"
          />
          <Option
            value="standard"
            label="Standard"
          />
          <Option
            value="modal"
            label="Modal"
          />
        </Select>
      </div>
      <div class="navigation-drawer-example__control">
        <span>{{ t('Width', '宽度') }}</span>
        <Select
          :model-value="width"
          :aria-label="t('Drawer width', '抽屉宽度')"
          data-testid="navigation-drawer-width"
          @update:model-value="setWidth"
        >
          <Option
            value="280px"
            label="280px"
          />
          <Option
            value="360px"
            label="360px"
          />
          <Option
            value="420px"
            label="420px"
          />
        </Select>
      </div>
      <output
        class="yam3x-demo__status"
        data-testid="navigation-drawer-mode-status"
      >
        {{ t('Mode:', '模式：') }} {{ mode }} · {{ t('Width:', '宽度：') }} {{ width }} ·
        {{ t('Current:', '当前：') }} {{ activeDestination?.label }}
      </output>
    </div>

    <div class="navigation-drawer-demo">
      <NavigationDrawer
        v-model:selected="current"
        :mode="mode"
        :width="width"
        max-width="480px"
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
            :disabled="destination.value === 'drafts'"
          >
            <template #icon><Icon :name="destination.icon" /></template>
            <template #selected-icon
              ><Icon
                :name="destination.icon"
                filled
            /></template>
            <template
              v-if="destination.value === 'inbox'"
              #badge
            >
              <span
                class="navigation-drawer-example__badge"
                role="img"
                :aria-label="t('3 unread', '3 条未读')"
                >3</span
              >
            </template>
          </NavigationDrawerItem>
        </NavigationDrawerSection>
        <NavigationDrawerDivider />
        <NavigationDrawerSection :label="t('More', '更多')">
          <NavigationDrawerItem
            :value="destinations[3].value"
            :label="destinations[3].label"
            :href="destinations[3].href"
          >
            <template #icon><Icon :name="destinations[3].icon" /></template>
            <template #selected-icon
              ><Icon
                :name="destinations[3].icon"
                filled
            /></template>
          </NavigationDrawerItem>
          <NavigationDrawerItem
            value="collections"
            :label="t('Collections', '收藏夹')"
          >
            <template #icon><Icon name="folder" /></template>
            <NavigationDrawerItem
              :value="destinations[4].value"
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
  </div>
</template>

<style scoped>
.navigation-drawer-example {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}
.navigation-drawer-example__controls {
  align-items: end;
}
.navigation-drawer-example__control {
  display: grid;
  gap: 8px;
  min-inline-size: 0;
}
.navigation-drawer-example__badge {
  min-inline-size: 16px;
  padding-inline: 4px;
  border-radius: 9999px;
  color: var(--md-sys-color-on-error);
  background: var(--md-sys-color-error);
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}
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
