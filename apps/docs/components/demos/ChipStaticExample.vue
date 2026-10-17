<script setup lang="ts">
import Chip from '@registry/components/chips/chip.vue'
import ChipSet from '@registry/components/chips/chip-set.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo yam3x-demo__row">
    <Chip>{{ t('Static', '仅展示') }}</Chip>
    <Chip><template #icon>✦</template>{{ t('With icon', '带图标') }}</Chip>
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
</template>

<style scoped>
.chip-static-example__wrapping-set {
  max-inline-size: 280px;
}
</style>
