<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Menu, type MenuItem } from '@registry/components/menu'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const open = ref(false)
const checked = ref(['grid'])
const selected = ref<Record<string, string>>({ density: 'comfortable' })
const variant = ref<'standard' | 'vibrant'>('standard')
const events = ref<string[]>([])
const menuApi = ref<{ show(anchor?: HTMLElement): void } | null>(null)
const items: MenuItem[] = [
  { value: 'edit', label: t('Edit', '编辑'), type: 'item', shortcut: '⌘ E' },
  { value: 'copy', label: t('Copy', '复制'), type: 'item', disabled: true },
  { value: 'actions-divider', type: 'divider' },
  { value: 'group', label: t('Display options', '显示选项'), type: 'label' },
  { value: 'grid', label: t('Show grid', '显示网格'), type: 'checkbox' },
  { value: 'guides', label: t('Show guides', '显示参考线'), type: 'checkbox' },
  { value: 'options-divider', type: 'divider' },
  { value: 'density-label', label: t('Density', '密度'), type: 'label' },
  { value: 'comfortable', label: t('Comfortable', '舒适'), type: 'radio', group: 'density' },
  { value: 'compact', label: t('Compact', '紧凑'), type: 'radio', group: 'density' },
  { value: 'density-divider', type: 'divider' },
  { value: 'help', label: t('Help', '帮助'), type: 'item', href: '#menu-help' },
  {
    value: 'more',
    label: t('More actions', '更多操作'),
    items: [
      { value: 'archive', label: t('Archive', '归档') },
      { value: 'share', label: t('Share', '共享') },
    ],
  },
]
const groupedItems: MenuItem[] = [
  {
    value: 'group-rename',
    label: t('Rename', '重命名'),
    type: 'item',
    leadingIcon: true,
    trailingIcon: false,
  },
  {
    value: 'group-duplicate',
    label: t('Duplicate layer', '复制图层'),
    type: 'item',
    leadingIcon: false,
    trailingIcon: false,
  },
  { value: 'group-gap', type: 'gap' },
  {
    value: 'group-export',
    label: t('Export', '导出'),
    type: 'item',
    leadingIcon: false,
    trailingIcon: true,
  },
  { value: 'group-divider-2', type: 'divider' },
  {
    value: 'group-delete',
    label: t('Delete', '删除'),
    type: 'item',
    leadingIcon: false,
    trailingIcon: false,
  },
]
function log(name: string) {
  events.value = [...events.value.slice(-3), name]
}
function hasLeadingIcon(item: MenuItem) {
  return 'leadingIcon' in item && item.leadingIcon === true
}
function hasTrailingIcon(item: MenuItem) {
  return 'trailingIcon' in item && item.trailingIcon === true
}
</script>

<template>
  <div class="yam3x-demo menu-demo">
    <label
      >{{ t('Color', '颜色') }}
      <Select
        v-model="variant"
        :aria-label="t('Menu color', '菜单颜色')"
        ><Option
          value="standard"
          :label="t('Standard', '标准')" /><Option
          value="vibrant"
          :label="t('Vibrant', '鲜明')" /></Select
    ></label>
    <Menu
      ref="menuApi"
      v-model:open="open"
      v-model:checked="checked"
      v-model:selected="selected"
      :items="items"
      :variant="variant"
      :label="t('Layer actions', '图层操作')"
      :trigger-label="t('Open layer actions', '打开图层操作')"
      @toggle="log($event.detail.open ? t('Open', '打开') : t('Close', '关闭'))"
      @select="log($event.label || $event.value)"
    >
      <template #icon="{ item }"
        ><span class="menu-demo__icon">{{ item.type === 'checkbox' ? '□' : '◦' }}</span></template
      >
    </Menu>
    <Menu
      :items="groupedItems"
      :variant="variant"
      :label="t('Grouped actions', '分组操作')"
      :trigger-label="t('Open grouped menu', '打开分组菜单')"
    >
      <template #trigger="{ triggerProps }"
        ><Button
          v-bind="triggerProps"
          variant="filled-tonal"
          class="yam3x-menu__trigger"
          >{{ t('Open grouped menu', '打开分组菜单') }}</Button
        ></template
      >
      <template #icon="{ item }"
        ><span
          v-if="hasLeadingIcon(item)"
          class="menu-demo__icon"
          >✎</span
        ></template
      >
      <template #trailing-icon="{ item }"
        ><span
          v-if="hasTrailingIcon(item)"
          class="menu-demo__icon"
          >↗</span
        ></template
      >
    </Menu>
    <Button
      variant="filled-tonal"
      class="yam3x-menu__trigger"
      type="button"
      @click="menuApi?.show($event.currentTarget as HTMLButtonElement)"
      >{{ t('Open context menu', '打开上下文菜单') }}</Button
    >
    <output data-testid="menu-state"
      >{{ open ? t('open', '打开') : t('closed', '关闭') }} · {{ t('Grid', '网格') }}
      {{ checked.includes('grid') ? t('On', '开') : t('Off', '关') }} ·
      {{ selected.density === 'compact' ? t('Compact', '紧凑') : t('Comfortable', '舒适') }}</output
    >
    <output data-testid="menu-events">{{ events.join(' → ') }}</output>
  </div>
</template>

<style scoped>
.menu-demo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  min-block-size: 320px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.menu-demo label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.menu-demo__icon {
  display: grid;
  place-items: center;
  inline-size: 20px;
  font-size: 18px;
}
</style>
