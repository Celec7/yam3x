<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@registry/components/slider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const volume = ref(40)
</script>

<template>
  <section
    data-testid="slider-basic"
    class="yam3x-demo yam3x-demo__stack"
  >
    <Slider
      v-model="volume"
      :label="t('Volume', '音量')"
      :min="0"
      :max="100"
      labelled
    />
    <p
      class="yam3x-demo__status"
      aria-live="polite"
    >
      {{ t('Volume:', '音量：') }} {{ volume }}
    </p>
  </section>
</template>
