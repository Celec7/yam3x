<script setup lang="ts">
import { IconButton } from '@registry/components/icon-button'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const sizes = [
  { value: 'extra-small', label: t('Extra small', '超小') },
  { value: 'small', label: t('Small', '小') },
  { value: 'medium', label: t('Medium', '中') },
  { value: 'large', label: t('Large', '大') },
  { value: 'extra-large', label: t('Extra large', '超大') },
] as const
const widths = ['narrow', 'default', 'wide'] as const
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="icon-button-sizes"
  >
    <div
      v-for="size in sizes"
      :key="size.value"
      class="yam3x-demo__row icon-button-sizes__row"
    >
      <span class="icon-button-sizes__label">{{ size.label }}</span>
      <IconButton
        v-for="width in widths"
        :id="`icon-button-${size.value}-${width}`"
        :key="width"
        :size="size.value"
        :width="width"
        :aria-label="t(`Add item, ${size.value} ${width}`, `添加项目，${size.value} ${width}`)"
      >
        <Icon
          name="add"
          filled
        />
      </IconButton>
    </div>
  </section>
</template>

<style scoped>
.icon-button-sizes__row {
  flex-wrap: nowrap;
  gap: 16px;
}
.icon-button-sizes__label {
  min-inline-size: 5.5rem;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
</style>
