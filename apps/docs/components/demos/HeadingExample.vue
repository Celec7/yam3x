<script setup lang="ts">
import Heading from '@registry/components/heading/heading.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const scales = ['display', 'headline', 'title', 'label'] as const
const sizes = ['large', 'medium', 'small'] as const
const examples = scales.flatMap((variant) =>
  sizes.flatMap((size) => [
    { variant, size, emphasized: false },
    { variant, size, emphasized: true },
  ]),
)
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <div class="heading-scale">
      <Heading
        v-for="item in examples"
        :key="`${item.variant}-${item.size}-${item.emphasized}`"
        :data-testid="`heading-${item.emphasized ? 'emphasized-' : ''}${item.variant}-${item.size}`"
        :variant="item.variant"
        :size="item.size"
        :emphasized="item.emphasized"
      >
        {{ item.emphasized ? t('Emphasized ', '强调') : '' }}{{ item.variant }} {{ item.size }}
      </Heading>
    </div>
    <div class="yam3x-demo__row">
      <Heading
        :level="1"
        variant="display"
        size="small"
        >{{ t('Semantic level 1', '语义级别 1') }}</Heading
      >
      <Heading
        :level="2"
        variant="headline"
        size="small"
        >{{ t('Semantic level 2', '语义级别 2') }}</Heading
      >
      <Heading
        variant="title"
        size="small"
        >{{ t('Plain text without heading semantics', '普通文本，无标题语义') }}</Heading
      >
    </div>
  </div>
</template>

<style scoped>
.heading-scale {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
  align-items: baseline;
}
@media (max-width: 640px) {
  .heading-scale {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
