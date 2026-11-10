<script setup lang="ts">
import { Chip, ChipSet } from '@registry/components/chips'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="chip-display"
  >
    <div class="yam3x-demo__row">
      <Chip>{{ t('Static', '仅展示') }}</Chip>
      <Chip>
        <template #icon><Icon name="star" /></template>
        {{ t('With icon', '带图标') }}
      </Chip>
      <Chip variant="elevated">
        <template #icon><Icon name="bookmark" /></template>
        {{ t('Elevated', '浮起') }}
      </Chip>
      <Chip variant="outlined">
        <template #trailing><span aria-hidden="true">⌘K</span></template>
        {{ t('With trailing content', '带尾部内容') }}
      </Chip>
    </div>

    <ChipSet
      class="chip-static-example__wrapping-set"
      :label="t('Chip spacing example', '芯片间距示例')"
    >
      <Chip>{{ t('Static', '仅展示') }}</Chip>
      <Chip>{{ t('With icon', '带图标') }}</Chip>
      <Chip>{{ t('Recently added', '最近添加') }}</Chip>
      <Chip>{{ t('Nearby places', '附近地点') }}</Chip>
      <Chip>{{ t('Favorites', '收藏') }}</Chip>
    </ChipSet>
  </section>
</template>

<style scoped>
.chip-static-example__wrapping-set {
  max-inline-size: 280px;
}
</style>
