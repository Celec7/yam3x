<script setup lang="ts">
import { ref } from 'vue'
import { NumberField } from '@registry/components/number-field'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const seats = ref<number | null>(2)
</script>

<template>
  <section
    data-testid="number-field-basic"
    class="yam3x-demo yam3x-demo__stack"
  >
    <NumberField
      v-model="seats"
      name="seats"
      :label="t('Seat count', '座位数')"
      :min="1"
      :max="8"
      :hint="t('Choose between 1 and 8 seats.', '请选择 1 至 8 个座位。')"
      width="16rem"
    />
    <p
      class="yam3x-demo__status"
      aria-live="polite"
    >
      {{ t('Selected:', '已选择：') }} {{ seats ?? t('Empty', '空') }}
    </p>
  </section>
</template>
