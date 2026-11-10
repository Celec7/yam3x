<script setup lang="ts">
import { VerticalDivider } from '@registry/components/divider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo divider-vertical">
    <div class="divider-vertical__strip">
      <span>{{ t('Text', '文字') }}</span>
      <VerticalDivider
        :decorative="false"
        data-testid="divider-vertical"
      />
      <span>{{ t('Media', '媒体') }}</span>
      <VerticalDivider
        inset
        aria-hidden="true"
        data-testid="divider-vertical-inset"
      />
      <span>{{ t('Actions', '操作') }}</span>
    </div>
    <p class="divider-vertical__hint">
      {{
        t(
          'The strip is 96px tall, so each divider fills that height. Only the first line exposes separator semantics.',
          '演示条高 96px，因此分隔线会填满该高度。只有第一条线暴露分隔器语义。',
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.divider-vertical {
  display: grid;
  gap: 16px;
}
.divider-vertical__strip {
  display: flex;
  align-items: center;
  block-size: 96px;
}
.divider-vertical__strip > span {
  padding-inline: 8px;
}
.divider-vertical__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
