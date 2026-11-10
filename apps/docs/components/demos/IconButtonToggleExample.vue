<script setup lang="ts">
import { IconToggleButton } from '@registry/components/icon-button'
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
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="icon-button-toggles"
  >
    <div
      v-for="size in sizes"
      :key="size.value"
      class="yam3x-demo__row"
    >
      <span class="icon-button-toggles__label">{{ size.label }}</span>
      <IconToggleButton
        :id="`icon-button-${size.value}-round-toggle`"
        :size="size.value"
        shape="round"
        :aria-label="t(`Toggle ${size.value} round`, `切换 ${size.value} 圆形`)"
      >
        <Icon name="favorite" />
        <template #selected-icon>
          <Icon
            name="favorite"
            filled
          />
        </template>
      </IconToggleButton>
      <IconToggleButton
        :id="`icon-button-${size.value}-square-toggle`"
        :size="size.value"
        shape="square"
        :aria-label="t(`Toggle ${size.value} square`, `切换 ${size.value} 方形`)"
      >
        <Icon name="favorite" />
        <template #selected-icon>
          <Icon
            name="favorite"
            filled
          />
        </template>
      </IconToggleButton>
    </div>
  </section>
</template>

<style scoped>
.icon-button-toggles__label {
  min-inline-size: 6.5rem;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
</style>
