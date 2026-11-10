<script setup lang="ts">
import { Button } from '@registry/components/button'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const sizes = [
  { value: 'extra-small', label: 'XS' },
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'extra-large', label: 'XL' },
] as const
</script>

<template>
  <div
    class="yam3x-demo yam3x-demo__row"
    data-testid="button-sizes"
  >
    <Button
      v-for="size in sizes"
      :key="size.value"
      :size="size.value"
    >
      <template #icon><Icon name="add" /></template>
      {{ size.label }} · {{ t('Save', '保存') }}
    </Button>
    <Button
      variant="outlined"
      shape="square"
    >
      {{ t('Square', '方形') }} · {{ t('Save', '保存') }}
    </Button>
  </div>
</template>
