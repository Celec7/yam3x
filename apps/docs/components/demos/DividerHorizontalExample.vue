<script setup lang="ts">
import { HorizontalDivider } from '@registry/components/divider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <span>{{ t('Full width', '完整宽度') }}</span>
    <HorizontalDivider data-testid="divider-full-width" />
    <span>{{ t('Inset on both sides', '两侧内缩') }}</span>
    <HorizontalDivider
      inset
      data-testid="divider-inset"
    />
    <span>{{ t('Inset on the start side', '只调整起始侧') }}</span>
    <HorizontalDivider
      inset-start
      data-testid="divider-inset-start"
    />
    <span>{{ t('Custom thickness and color', '自定义粗细和颜色') }}</span>
    <HorizontalDivider
      :thickness="3"
      color="#123456"
      data-testid="divider-custom"
    />
  </div>
</template>
