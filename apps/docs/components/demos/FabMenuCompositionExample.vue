<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { Button } from '@registry/components/button'
import { Icon } from '@registry/components/icon'
import {
  FloatingActionButtonMenu,
  FloatingActionButtonMenuItem,
} from '@registry/components/fab-menu'
import { ToggleFloatingActionButton } from '@registry/components/fab'
import Switch from '@registry/components/switch/switch.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const expanded = ref(false)
const result = ref('')
const menuDisabled = ref(false)
const menu = useTemplateRef<{ open: () => void; close: () => void }>('menu')
const state = computed(() =>
  menuDisabled.value
    ? t('Menu disabled', '菜单已禁用')
    : expanded.value
      ? t('Menu open', '菜单已打开')
      : t('Menu closed', '菜单已关闭'),
)

function onSelect(detail: { label: string }) {
  result.value = t(`Selected: ${detail.label}`, `已选择：${detail.label}`)
}
</script>

<template>
  <div class="yam3x-demo fab-menu-composition-demo">
    <div class="yam3x-demo__row fab-menu-composition-demo__controls">
      <Button
        variant="filled-tonal"
        type="button"
        data-testid="fab-menu-composition-open"
        @click="menu?.open()"
      >
        {{ t('Open menu', '打开菜单') }}
      </Button>
      <Button
        variant="text"
        type="button"
        data-testid="fab-menu-composition-close"
        @click="menu?.close()"
      >
        {{ t('Close menu', '关闭菜单') }}
      </Button>
      <Switch
        v-model="menuDisabled"
        :label="t('Disable menu', '禁用菜单')"
        data-testid="fab-menu-composition-disabled"
      />
      <output
        class="yam3x-demo__status"
        data-testid="fab-menu-composition-state"
      >
        {{ state }}
      </output>
    </div>
    <p
      class="fab-menu-composition-demo__result"
      data-testid="fab-menu-composition-result"
    >
      {{ result || t('Choose an action', '请选择一项操作') }}
    </p>
    <FloatingActionButtonMenu
      ref="menu"
      v-model:expanded="expanded"
      presentation="web-menu"
      variant="secondary"
      :disabled="menuDisabled"
      class="fab-menu-composition-demo__menu"
      :label="t('Create actions', '创建操作')"
      @select="onSelect"
    >
      <template #trigger="{ triggerProps }">
        <ToggleFloatingActionButton
          v-bind="triggerProps"
          v-model:checked="expanded"
          variant="secondary"
          size="medium"
          :aria-label="t('Create with composed menu', '打开组合式菜单')"
        />
      </template>
      <FloatingActionButtonMenuItem
        value="photo"
        :label="t('Take photo', '拍摄照片')"
        selected
      >
        <template #icon
          ><Icon
            name="photo_camera"
            aria-hidden="true"
        /></template>
      </FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem
        value="upload"
        :label="t('Upload file', '上传文件')"
      >
        <template #icon
          ><Icon
            name="upload_file"
            aria-hidden="true"
        /></template>
      </FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem
        value="folder"
        :label="t('Create folder', '新建文件夹')"
      >
        <template #icon
          ><Icon
            name="create_new_folder"
            aria-hidden="true"
        /></template>
      </FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem
        value="unavailable"
        :label="t('Unavailable', '暂不可用')"
        disabled
      >
        <template #icon
          ><Icon
            name="block"
            aria-hidden="true"
        /></template>
      </FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem
        value="share"
        :label="t('Create share link', '创建共享链接')"
        href="#fab-menu-link"
      >
        <template #icon
          ><Icon
            name="link"
            aria-hidden="true"
        /></template>
      </FloatingActionButtonMenuItem>
    </FloatingActionButtonMenu>
  </div>
</template>

<style scoped>
.fab-menu-composition-demo {
  position: relative;
  min-block-size: 280px;
  overflow: visible;
}
.fab-menu-composition-demo__result {
  margin: 12px 0 0;
}
.fab-menu-composition-demo__controls {
  align-items: center;
  padding-block-end: 12px;
}
.fab-menu-composition-demo__menu {
  position: absolute;
  inset-inline-end: 24px;
  inset-block-end: 24px;
}
</style>
