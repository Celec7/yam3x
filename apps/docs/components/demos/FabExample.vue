<script setup lang="ts">
import { FloatingActionButton } from '@registry/components/fab'
import { Icon } from '@registry/components/icon'
import { Tooltip } from '@registry/components/tooltip'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const colorVariants = [
  { value: 'primary-container', en: 'Primary container', zh: '主色容器' },
  { value: 'secondary-container', en: 'Secondary container', zh: '次色容器' },
  { value: 'tertiary-container', en: 'Tertiary container', zh: '第三色容器' },
  { value: 'primary', en: 'Primary', zh: '主色' },
  { value: 'secondary', en: 'Secondary', zh: '次色' },
  { value: 'tertiary', en: 'Tertiary', zh: '第三色' },
] as const
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="fab-sizes"
  >
    <div class="yam3x-demo__row fab-example__row">
      <FloatingActionButton
        id="fab-example-default"
        size="default"
        :aria-label="t('Create project', '创建项目')"
      >
        <Icon
          name="add"
          filled
        />
      </FloatingActionButton>
      <Tooltip for="fab-example-default">{{ t('Create project', '创建项目') }}</Tooltip>

      <FloatingActionButton
        id="fab-example-create"
        size="medium"
        :aria-label="t('Create project', '创建项目')"
      >
        <Icon
          name="add"
          filled
        />
      </FloatingActionButton>
      <Tooltip for="fab-example-create">{{ t('Create project', '创建项目') }}</Tooltip>

      <FloatingActionButton
        id="fab-example-large"
        size="large"
        variant="tertiary-container"
        :aria-label="t('Create project', '创建项目')"
      >
        <Icon
          name="add"
          filled
        />
      </FloatingActionButton>
      <Tooltip for="fab-example-large">{{ t('Create project', '创建项目') }}</Tooltip>
    </div>

    <div class="yam3x-demo__row fab-example__row">
      <FloatingActionButton
        v-for="color in colorVariants"
        :id="`fab-example-variant-${color.value}`"
        :key="color.value"
        :variant="color.value"
        :aria-label="`${t('Create project', '创建项目')}, ${t(color.en, color.zh)}`"
      >
        <Icon
          name="add"
          filled
        />
      </FloatingActionButton>
    </div>
  </section>
</template>

<style scoped>
.fab-example__row {
  gap: 24px;
  padding-block: 8px;
}
</style>
