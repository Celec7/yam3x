<script setup lang="ts">
import { Button } from '@registry/components/button'
import { SplitButton } from '@registry/components/split-button'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <section class="split-popup-demo">
    <SplitButton
      :label="t('Insert', '插入')"
      variant="filled"
      size="medium"
      popup-id="insert-popup"
      :menu-button-label="t('More insert options', '更多插入选项')"
    >
      <template #popup="{ anchor, close, popupId }">
        <div
          :id="popupId"
          role="group"
          :aria-label="t('Insert options', '插入选项')"
          class="split-demo__popup"
        >
          <p>
            {{ t('Anchor:', '锚点：') }}
            {{ anchor ? t('Connected', '已连接') : t('Waiting to open', '待打开') }}
          </p>
          <Button
            variant="text"
            size="small"
            shape="square"
            type="button"
            @click="close"
            >{{ t('Insert table', '插入表格') }}</Button
          >
          <Button
            variant="text"
            size="small"
            shape="square"
            type="button"
            @click="close"
            >{{ t('Insert image', '插入图片') }}</Button
          >
        </div>
      </template>
    </SplitButton>
  </section>
</template>

<style scoped>
.split-popup-demo {
  min-block-size: 140px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.split-popup-demo :deep(svg) {
  inline-size: 1em;
  block-size: 1em;
  fill: currentColor;
}
.split-demo__popup {
  position: absolute;
  z-index: 2;
  inset-block-start: calc(100% + 4px);
  inset-inline-start: 0;
  display: grid;
  gap: 4px;
  min-inline-size: 160px;
  padding: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-low);
  box-shadow: var(--md-sys-elevation-level2);
}
.split-demo__popup p {
  margin: 0;
}
.split-demo__popup .yam3x-button {
  min-block-size: 40px;
  justify-content: flex-start;
}
</style>
