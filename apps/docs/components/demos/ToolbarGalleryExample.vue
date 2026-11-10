<script setup lang="ts">
import { Toolbar } from '@registry/components/toolbar'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const standardColor = 'var(--md-sys-color-primary)'
const vibrantColor = 'var(--md-sys-color-on-primary-container)'
</script>

<template>
  <section
    data-testid="toolbar-gallery"
    class="toolbar-gallery"
  >
    <div class="toolbar-gallery__item">
      <p class="toolbar-gallery__label">{{ t('Floating, standard', '浮动，标准') }}</p>
      <Toolbar :aria-label="t('Clipboard actions', '剪贴板操作')">
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Cut', '剪切')"
          ><Icon name="content_cut"
        /></IconButton>
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Copy', '复制')"
          ><Icon name="content_copy"
        /></IconButton>
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Paste', '粘贴')"
          ><Icon name="content_paste"
        /></IconButton>
      </Toolbar>
    </div>

    <div class="toolbar-gallery__item">
      <p class="toolbar-gallery__label">{{ t('Floating, vibrant', '浮动，鲜明') }}</p>
      <Toolbar
        variant="vibrant"
        :aria-label="t('Text formatting', '文本格式')"
      >
        <IconButton
          variant="standard"
          :style="{ color: vibrantColor }"
          :aria-label="t('Bold', '加粗')"
          ><Icon name="format_bold"
        /></IconButton>
        <IconButton
          variant="standard"
          :style="{ color: vibrantColor }"
          :aria-label="t('Italic', '斜体')"
          ><Icon name="format_italic"
        /></IconButton>
      </Toolbar>
    </div>

    <div class="toolbar-gallery__item">
      <p class="toolbar-gallery__label">{{ t('Vertical, square', '纵向，方角') }}</p>
      <Toolbar
        vertical
        shape="square"
        :aria-label="t('Zoom controls', '缩放操作')"
      >
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Zoom in', '放大')"
          ><Icon name="zoom_in"
        /></IconButton>
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Zoom out', '缩小')"
          ><Icon name="zoom_out"
        /></IconButton>
      </Toolbar>
    </div>

    <div class="toolbar-gallery__item toolbar-gallery__item--docked">
      <p class="toolbar-gallery__label">{{ t('Docked, rounded', '停靠，圆角') }}</p>
      <Toolbar
        layout="docked"
        shape="rounded"
        :aria-label="t('Alignment actions', '对齐操作')"
      >
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Align start', '起始对齐')"
          ><Icon name="format_align_left"
        /></IconButton>
        <IconButton
          variant="standard"
          :style="{ color: standardColor }"
          :aria-label="t('Align center', '居中对齐')"
          ><Icon name="format_align_center"
        /></IconButton>
      </Toolbar>
    </div>
  </section>
</template>

<style scoped>
.toolbar-gallery {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.toolbar-gallery__item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.toolbar-gallery__item--docked {
  display: grid;
  justify-items: stretch;
}
.toolbar-gallery__label {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
  min-inline-size: 9rem;
}
</style>
