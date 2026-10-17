<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FabMenu,
  type FabMenuHorizontalAlignment,
  type FabMenuItem,
  type FabMenuPresentation,
  type FabMenuTriggerSize,
  type FabMenuVariant,
} from '@registry/components/fab-menu'
import { Icon } from '@registry/components/icon'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const variant = ref<FabMenuVariant>('primary')
const triggerSize = ref<FabMenuTriggerSize>('medium')
const horizontalAlignment = ref<FabMenuHorizontalAlignment>('end')
const presentation = ref<FabMenuPresentation>('pill-stack')
const expanded = ref(false)
const result = ref('')
function setVariant(value: string | string[] | null) {
  if (value === 'primary' || value === 'secondary' || value === 'tertiary') variant.value = value
}
function setTriggerSize(value: string | string[] | null) {
  if (value === 'small' || value === 'default' || value === 'medium' || value === 'large')
    triggerSize.value = value
}
function setHorizontalAlignment(value: string | string[] | null) {
  if (value === 'start' || value === 'center' || value === 'end') horizontalAlignment.value = value
}
function setPresentation(value: string | string[] | null) {
  if (value === 'pill-stack' || value === 'web-menu') presentation.value = value
}
const actions = computed<FabMenuItem[]>(() => [
  { value: 'photo', label: t('Take photo', '拍摄照片'), selected: true },
  { value: 'upload', label: t('Upload file', '上传文件') },
  { value: 'folder', label: t('Create folder', '新建文件夹') },
  { value: 'disabled', label: t('Unavailable', '暂不可用'), disabled: true },
  { value: 'link', label: t('Create share link', '创建共享链接'), href: '#fab-menu-link' },
])
const iconNames: Record<string, string> = {
  photo: 'photo_camera',
  upload: 'upload_file',
  folder: 'create_new_folder',
  disabled: 'block',
  link: 'link',
}
</script>

<template>
  <div class="yam3x-demo fab-menu-demo">
    <div class="fab-menu-demo__controls">
      <div class="fab-menu-demo__control">
        <span>{{ t('Color', '颜色') }}</span>
        <Select
          :model-value="variant"
          :aria-label="t('FAB menu color', 'FAB 菜单颜色')"
          class="fab-menu-demo__select"
          @update:model-value="setVariant"
        >
          <Option
            value="primary"
            :label="t('Primary', '主色')"
          />
          <Option
            value="secondary"
            :label="t('Secondary', '次要色')"
          />
          <Option
            value="tertiary"
            :label="t('Tertiary', '第三色')"
          />
        </Select>
      </div>
      <div class="fab-menu-demo__control">
        <span>{{ t('Trigger FAB', '触发 FAB') }}</span>
        <Select
          :model-value="triggerSize"
          :aria-label="t('Trigger FAB size', '触发 FAB 尺寸')"
          class="fab-menu-demo__select"
          @update:model-value="setTriggerSize"
        >
          <Option
            value="small"
            :label="t('Small (not recommended)', '小型（不推荐）')"
          />
          <Option
            value="default"
            :label="t('Default', '默认')"
          />
          <Option
            value="medium"
            :label="t('Medium', '中型')"
          />
          <Option
            value="large"
            :label="t('Large', '大型')"
          />
        </Select>
      </div>
      <div class="fab-menu-demo__control">
        <span>{{ t('Presentation', '呈现方式') }}</span>
        <Select
          :model-value="presentation"
          :aria-label="t('FAB menu presentation', 'FAB 菜单呈现方式')"
          class="fab-menu-demo__select"
          @update:model-value="setPresentation"
        >
          <Option
            value="pill-stack"
            :label="t('Pill stack', '胶囊堆叠')"
          />
          <Option
            value="web-menu"
            :label="t('Web menu', 'Web 菜单')"
          />
        </Select>
      </div>
      <div class="fab-menu-demo__control">
        <span>{{ t('Menu alignment', '菜单对齐') }}</span>
        <Select
          :model-value="horizontalAlignment"
          :aria-label="t('Menu alignment', '菜单对齐')"
          class="fab-menu-demo__select"
          @update:model-value="setHorizontalAlignment"
        >
          <Option
            value="start"
            :label="t('Start', '起始')"
          />
          <Option
            value="center"
            :label="t('Center', '居中')"
          />
          <Option
            value="end"
            :label="t('End', '末端')"
          />
        </Select>
      </div>
      <output data-testid="fab-menu-result">{{
        result || t('No action selected', '尚未选择操作')
      }}</output>
    </div>
    <FabMenu
      v-model:expanded="expanded"
      class="fab-menu-demo__menu"
      :items="actions"
      :variant="variant"
      :trigger-size="triggerSize"
      :horizontal-alignment="horizontalAlignment"
      :presentation="presentation"
      :label="t('Create actions', '创建操作')"
      :trigger-label="t('Create', '创建')"
      @select="result = `${t('Selected:', '已选择：')} ${$event.item.label}`"
    >
      <template #icon="{ item }"
        ><Icon
          class="fab-menu-demo__item-icon"
          aria-hidden="true"
          :name="iconNames[item.value]"
      /></template>
    </FabMenu>
  </div>
</template>

<style scoped>
.fab-menu-demo {
  position: relative;
  min-block-size: 400px;
  overflow: visible;
}
.fab-menu-demo__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 148px), 1fr));
  align-items: start;
  gap: 16px;
}
.fab-menu-demo__control {
  display: grid;
  min-inline-size: 0;
  gap: 8px;
}
.fab-menu-demo__select {
  inline-size: 100%;
}
.fab-menu-demo__controls output {
  grid-column: 1 / -1;
}
.fab-menu-demo__menu {
  position: absolute;
  inset-inline-end: 24px;
  inset-block-end: 24px;
}
.fab-menu-demo__item-icon {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: 24px;
  block-size: 24px;
  font-size: 24px;
  line-height: 1;
}
</style>
