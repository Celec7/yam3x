<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@registry/components/icon'
import {
  FloatingActionButtonMenu,
  FloatingActionButtonMenuItem,
} from '@registry/components/fab-menu'
import { ToggleFloatingActionButton } from '@registry/components/fab'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const expanded = ref(false)
const result = ref('')

function onSelect(detail: { label: string }) {
  result.value = t(`Selected: ${detail.label}`, `已选择：${detail.label}`)
}
</script>

<template>
  <div class="yam3x-demo fab-menu-composition-demo">
    <p
      class="fab-menu-composition-demo__result"
      data-testid="fab-menu-composition-result"
    >
      {{ result || t('Choose an action', '请选择一项操作') }}
    </p>
    <FloatingActionButtonMenu
      v-model:expanded="expanded"
      presentation="web-menu"
      variant="secondary"
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
  margin: 0;
}
.fab-menu-composition-demo__menu {
  position: absolute;
  inset-inline-end: 24px;
  inset-block-end: 24px;
}
</style>
