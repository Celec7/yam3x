<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import {
  NavigationRail,
  type NavigationRailItem,
  type NavigationRailMode,
} from '@registry/components/navigation-rail'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const mode = ref<NavigationRailMode>('collapsed')
const expanded = ref<boolean | undefined>(undefined)
const presentation = ref<'standard' | 'modal'>('standard')
const alignment = ref<'top' | 'center'>('top')
const hideWhenCollapsed = ref(false)
const selected = ref('home')
const events = ref<string[]>([])
const items: NavigationRailItem[] = [
  { value: 'home', label: t('Home', '首页'), href: '/' },
  {
    value: 'search',
    label: t('Search', '搜索'),
    href: '/components/search',
    badge: 3,
    badgeLabel: t('3 new results', '3 条新结果'),
  },
  { value: 'saved', label: t('Saved', '收藏'), href: '/components/list' },
  {
    value: 'downloads',
    label: t('Downloads', '下载'),
    href: '/guide/installation',
    disabled: true,
  },
  {
    value: 'settings',
    label: t('Settings', '设置'),
    href: '/guide/theme',
    secondary: true,
  },
]
const iconNames: Record<string, string> = {
  home: 'home',
  search: 'search',
  saved: 'bookmark',
  downloads: 'download',
  settings: 'settings',
}
watch(mode, () => {
  expanded.value = undefined
})
function log(type: string) {
  events.value = [...events.value.slice(-3), type]
}
</script>

<template>
  <div class="yam3x-demo rail-demo">
    <div class="rail-demo__controls">
      <label
        >{{ t('Mode', '形态') }}
        <Select
          v-model="mode"
          :aria-label="t('Navigation rail mode', '导航栏轨形态')"
          ><Option
            value="collapsed"
            :label="t('Collapsed', '收起')" /><Option
            value="expanded"
            :label="t('Expanded', '展开')" /><Option
            value="auto"
            :label="t('Auto', '自动')" /></Select
      ></label>
      <label
        >{{ t('Expansion', '展开方式') }}
        <Select
          v-model="presentation"
          :aria-label="t('Navigation rail expansion', '导航栏轨展开方式')"
          ><Option
            value="standard"
            :label="t('Standard', '标准')" /><Option
            value="modal"
            :label="t('Modal', '模态')" /></Select
      ></label>
      <label
        >{{ t('Destination alignment', '目的地位置') }}
        <Select
          v-model="alignment"
          :aria-label="t('Navigation rail destination alignment', '导航栏轨目的地位置')"
          ><Option
            value="top"
            :label="t('Top', '顶部')" /><Option
            value="center"
            :label="t('Center', '居中')" /></Select
      ></label>
      <Checkbox
        v-model="hideWhenCollapsed"
        :label="t('Hide when collapsed', '收起时隐藏')"
      />
    </div>
    <Button
      v-if="hideWhenCollapsed"
      type="button"
      class="rail-demo__external-menu"
      :aria-expanded="!!expanded"
      aria-controls="external-navigation-rail"
      @click="expanded = !expanded"
      >{{ expanded ? t('Close navigation', '关闭导航') : t('Open navigation', '打开导航') }}</Button
    >
    <div class="rail-demo__frame">
      <NavigationRail
        id="external-navigation-rail"
        v-model="selected"
        v-model:expanded="expanded"
        data-testid="navigation-rail"
        :label="t('Main navigation', '主导航')"
        :items="items"
        :mode="mode"
        :presentation="presentation"
        :alignment="alignment"
        :hide-when-collapsed="hideWhenCollapsed"
        :show-menu="!hideWhenCollapsed"
        divider
        @navigate="(_item, event) => event.preventDefault()"
        @beforeinput="log('beforeinput')"
        @input="log('input')"
        @change="log('change')"
      >
        <template #icon="{ item }"><Icon :name="iconNames[item.value]" /></template>
        <template #selected-icon="{ item }"
          ><Icon
            :name="iconNames[item.value]"
            filled
        /></template>
        <template #fab="{ expanded: isExpanded }"
          ><Button
            type="button"
            class="rail-demo__fab"
            :aria-label="isExpanded ? t('Create new content', '创建新内容') : t('Create', '创建')"
            ><Icon name="add" /><span v-if="isExpanded">{{ t('Create', '创建') }}</span></Button
          ></template
        >
      </NavigationRail>
      <div class="rail-demo__content">
        <strong
          >{{ t('Current page:', '当前页面：') }}
          {{ items.find((item) => item.value === selected)?.label }}</strong
        >
        <p>
          {{
            t(
              'This simulates app content. The navigation rail sits at the start edge, and the content scrolls independently.',
              '这里模拟应用内容。导航栏轨位于起始边，内容可独立滚动。',
            )
          }}
        </p>
        <output data-testid="navigation-rail-events">{{ events.join(' → ') }}</output>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rail-demo {
  display: grid;
  gap: 16px;
}
.rail-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.rail-demo__controls label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rail-demo__frame {
  display: flex;
  min-inline-size: 0;
  block-size: 540px;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.rail-demo__content {
  flex: 1;
  min-inline-size: 0;
  overflow: auto;
  padding: 24px;
}
.rail-demo__fab {
  display: flex;
  align-items: center;
  gap: 8px;
  min-block-size: 48px;
  padding-inline: 16px;
  border: 0;
  border-radius: 16px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font: inherit;
  cursor: pointer;
}
.rail-demo__external-menu {
  justify-self: start;
  min-block-size: 48px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 16px;
  padding-inline: 16px;
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
}
</style>
