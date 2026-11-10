<script setup lang="ts">
import { LoadingIndicator } from '@registry/components/loading-indicator'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const sizes = [
  {
    id: 'small',
    label: t('Small · 24px', '小 · 24px'),
    name: t('Loading small preview', '正在加载小预览'),
    size: '24px',
  },
  {
    id: 'default',
    label: t('Default · 48px', '默认 · 48px'),
    name: t('Loading preview', '正在加载预览'),
    size: undefined,
  },
  {
    id: 'large',
    label: t('Large · 96px', '大 · 96px'),
    name: t('Loading large preview', '正在加载大预览'),
    size: '96px',
  },
] as const
</script>

<template>
  <div
    class="yam3x-demo loading-sizes"
    data-testid="loading-sizes"
  >
    <section class="loading-sizes__gallery">
      <figure
        v-for="item in sizes"
        :key="item.id"
        class="loading-sizes__item"
      >
        <LoadingIndicator
          :aria-label="item.name"
          :style="item.size ? { '--yam3x-loading-indicator-container-size': item.size } : undefined"
        />
        <figcaption>{{ item.label }}</figcaption>
      </figure>
      <figure class="loading-sizes__item">
        <LoadingIndicator
          :aria-label="t('Loading themed preview', '正在加载主题预览')"
          style="
            --yam3x-loading-indicator-active-indicator-color: var(--md-sys-color-tertiary);
            --yam3x-loading-indicator-container-size: 64px;
          "
        />
        <figcaption>{{ t('Custom active color · 64px', '自定义活动颜色 · 64px') }}</figcaption>
      </figure>
      <figure class="loading-sizes__item">
        <LoadingIndicator
          variant="contained"
          :aria-label="t('Loading contained preview', '正在加载容器预览')"
          style="
            --yam3x-loading-indicator-contained-container-color: var(
              --md-sys-color-tertiary-container
            );
            --yam3x-loading-indicator-contained-active-indicator-color: var(
              --md-sys-color-on-tertiary-container
            );
          "
        />
        <figcaption>{{ t('Contained with custom roles', '自定义角色的容器样式') }}</figcaption>
      </figure>
    </section>

    <section
      class="loading-sizes__status"
      role="status"
      aria-live="polite"
    >
      <LoadingIndicator
        :aria-label="t('Loading comments', '正在加载评论')"
        style="--yam3x-loading-indicator-container-size: 24px"
      />
      <span>{{ t('Loading comments…', '正在加载评论…') }}</span>
    </section>
    <p class="loading-sizes__note">
      {{
        t(
          'The status row provides visible waiting text; the progressbar keeps its own accessible name and indeterminate value. Reduced motion leaves the active shape static.',
          '状态行提供可见的等待文字；progressbar 保留自己的无障碍名称和不确定状态。启用减少动态效果时，活动形状保持静态。',
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.loading-sizes {
  display: grid;
  gap: 24px;
}
.loading-sizes__gallery {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 24px;
}
.loading-sizes__item {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin: 0;
}
.loading-sizes__item figcaption {
  max-inline-size: 12ch;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-font-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  text-align: center;
}
.loading-sizes__status {
  display: flex;
  align-items: center;
  gap: 12px;
}
.loading-sizes__note {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
