<script setup lang="ts">
import { ref } from 'vue'
import ToggleButton from '@registry/components/button/toggle-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const favorite = ref(false)
const compact = ref(true)
const notifications = ref(false)
const square = ref(false)
const sizeStates = ref<Record<string, boolean>>({ medium: true })
const sizes = [
  { value: 'extra-small', label: 'XS' },
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'extra-large', label: 'XL' },
] as const

function onSizeChecked(size: string, checked: boolean) {
  sizeStates.value[size] = checked
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <div class="yam3x-demo__row">
      <ToggleButton v-model:checked="favorite">
        <template #icon><Icon name="favorite_border" /></template>
        <template #selected-icon
          ><Icon
            name="favorite"
            filled
        /></template>
        <template #selected>{{ t('Favorited', '已收藏') }}</template>
        {{ t('Favorite', '收藏') }}
      </ToggleButton>
      <ToggleButton
        v-model:checked="compact"
        variant="filled-tonal"
      >
        {{ t('Compact layout', '紧凑布局') }}
      </ToggleButton>
      <ToggleButton
        v-model:checked="notifications"
        variant="outlined"
      >
        {{ t('Notifications', '通知') }}
      </ToggleButton>
      <ToggleButton
        v-model:checked="square"
        shape="square"
      >
        {{ t('Square choice', '方形选项') }}
      </ToggleButton>
    </div>

    <div class="yam3x-demo__row">
      <ToggleButton
        v-for="size in sizes"
        :key="size.value"
        :size="size.value"
        :checked="Boolean(sizeStates[size.value])"
        :aria-label="`${t('Size', '尺寸')} ${size.label}`"
        @update:checked="onSizeChecked(size.value, $event)"
      >
        {{ size.label }}
      </ToggleButton>
    </div>
  </div>
</template>
