<script setup lang="ts">
import { HorizontalDivider } from '@registry/components/divider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo divider-gallery">
    <section class="divider-gallery__row">
      <p class="divider-gallery__label">{{ t('Full width', '完整宽度') }}</p>
      <HorizontalDivider data-testid="divider-full-width" />
    </section>
    <section class="divider-gallery__row">
      <p class="divider-gallery__label">{{ t('Inset on both sides', '两侧内缩') }}</p>
      <HorizontalDivider
        inset
        data-testid="divider-inset"
      />
    </section>
    <section class="divider-gallery__row">
      <p class="divider-gallery__label">{{ t('Inset on the start side', '仅起始侧内缩') }}</p>
      <HorizontalDivider
        inset-start
        data-testid="divider-inset-start"
      />
    </section>
    <section class="divider-gallery__row">
      <p class="divider-gallery__label">{{ t('Inset on the end side', '仅末尾侧内缩') }}</p>
      <HorizontalDivider
        inset-end
        data-testid="divider-inset-end"
      />
    </section>
    <section class="divider-gallery__row">
      <p class="divider-gallery__label">
        {{ t('Custom thickness and color', '自定义粗细和颜色') }}
      </p>
      <HorizontalDivider
        :thickness="3"
        color="#123456"
        data-testid="divider-custom"
      />
    </section>
  </div>
</template>

<style scoped>
.divider-gallery {
  display: grid;
  gap: 24px;
}
.divider-gallery__row {
  display: grid;
  gap: 8px;
}
.divider-gallery__label {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-font-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}
</style>
