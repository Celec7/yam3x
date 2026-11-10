<script setup lang="ts">
import { computed, ref } from 'vue'
import { RadioGroup, RadioButton } from '@registry/components/radio-group'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const speed = ref<string | null>('standard')

const selectedLabel = computed(() => {
  switch (speed.value) {
    case 'standard':
      return t('Standard', '标准')
    case 'express':
      return t('Express', '加急')
    case 'sameday':
      return t('Same day', '当日达')
    default:
      return t('None', '无')
  }
})
</script>

<template>
  <section
    data-testid="radio-group-basic"
    class="yam3x-demo yam3x-demo__stack"
  >
    <RadioGroup
      v-model="speed"
      :label="t('Delivery speed', '配送速度')"
      name="delivery-speed"
      :description="t('Applies to in-stock items', '适用于有库存的商品')"
    >
      <RadioButton value="standard">{{ t('Standard', '标准') }}</RadioButton>
      <RadioButton
        value="express"
        :description="t('Arrives in two business days', '两个工作日内送达')"
        >{{ t('Express', '加急') }}</RadioButton
      >
      <RadioButton value="sameday">{{ t('Same day', '当日达') }}</RadioButton>
    </RadioGroup>
    <p
      class="yam3x-demo__status"
      aria-live="polite"
    >
      {{ t('Selected speed:', '已选速度：') }}
      {{ selectedLabel }}
    </p>
  </section>
</template>
