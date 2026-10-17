<script setup lang="ts">
import { VerticalDivider } from '@registry/components/divider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div
    class="yam3x-demo yam3x-demo__row"
    style="height: 146px"
  >
    <span>{{ t('Text', '文字') }}</span>
    <VerticalDivider
      :decorative="false"
      data-testid="divider-vertical"
    />
    <span>{{ t('Media', '媒体') }}</span>
  </div>
</template>
