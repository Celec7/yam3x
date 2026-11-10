<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from '@registry/components/menu'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const selected = ref<MenuItem | null>(null)
const items: MenuItem[] = [
  {
    value: 'publish',
    label: t('Publish', '发布'),
    type: 'item',
    leadingIcon: true,
    supportingText: t('Visible to everyone with the link', '持有链接的所有人都可见'),
    trailingText: '⇧⌘P',
  },
  {
    value: 'comments',
    label: t('Comments', '评论'),
    leadingIcon: true,
    badge: 3,
  },
  {
    value: 'duplicate',
    label: t('Duplicate', '复制副本'),
    type: 'item',
    leadingIcon: true,
    disabled: true,
    supportingText: t('Unavailable for shared documents', '共享文档不可用'),
  },
  { value: 'fields-divider', type: 'divider' },
  {
    value: 'history',
    label: t('Version history', '版本历史'),
    href: '#menu-fields-history',
    leadingIcon: true,
    trailingIcon: true,
  },
  {
    value: 'move',
    label: t('Move to', '移动到'),
    leadingIcon: false,
    items: [
      { value: 'archive', label: t('Archive', '归档') },
      { value: 'trash', label: t('Trash', '回收站') },
    ],
  },
]

function onSelect(item: MenuItem): void {
  selected.value = item
}

function selectedLabel(): string {
  const item = selected.value
  return item && 'label' in item && item.label ? item.label : t('None', '无')
}

function hasLeadingIcon(item: MenuItem): boolean {
  return 'leadingIcon' in item && item.leadingIcon === true
}

function hasTrailingIcon(item: MenuItem): boolean {
  return 'trailingIcon' in item && item.trailingIcon === true
}
</script>

<template>
  <div class="yam3x-demo menu-fields-demo">
    <Menu
      :items="items"
      :label="t('Document actions', '文档操作')"
      :trigger-label="t('Open document actions', '打开文档操作')"
      @select="onSelect"
    >
      <template #icon="{ item }">
        <span
          v-if="hasLeadingIcon(item)"
          class="menu-fields-demo__icon"
          >◆</span
        >
      </template>
      <template #trailing-icon="{ item }">
        <span
          v-if="hasTrailingIcon(item)"
          class="menu-fields-demo__icon"
          >↗</span
        >
      </template>
    </Menu>
    <p data-testid="menu-fields-state">
      {{ t('Last selection:', '最近选择：') }}
      {{ selectedLabel() }}
    </p>
  </div>
</template>

<style scoped>
.menu-fields-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}

.menu-fields-demo__icon {
  display: grid;
  place-items: center;
  inline-size: 20px;
  font-size: 16px;
}
</style>
