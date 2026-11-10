<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { RangeSlider, Slider } from '@registry/components/slider'
import { useDemoDirection } from './use-demo-direction'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const { direction, dir, toggle } = useDemoDirection()

const initial: [number, number] = [200, 800]
const price = ref<[number, number]>([...initial])
const submitted = ref('')
const balance = ref(25)

const currency = computed(
  () =>
    new Intl.NumberFormat(localeTag.value, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }),
)
const formatPrice = (value: number) => currency.value.format(value)

function submit(form: HTMLFormElement | null): void {
  if (!form) return
  const data = new FormData(form)
  submitted.value = `${t('Minimum', '最低')} ${formatPrice(Number(data.get('price-min')))} · ${t(
    'Maximum',
    '最高',
  )} ${formatPrice(Number(data.get('price-max')))}`
}

function reset(): void {
  price.value = [...initial]
  submitted.value = ''
}
</script>

<template>
  <section
    data-testid="slider-range"
    class="yam3x-demo yam3x-demo__stack slider-range-demo"
  >
    <form
      id="slider-range-form"
      class="slider-range-demo__form"
      @submit.prevent="submit($event.currentTarget as HTMLFormElement)"
      @reset.prevent="reset"
    >
      <RangeSlider
        v-model="price"
        name="price"
        :label="t('Price range', '价格区间')"
        :min="0"
        :max="1000"
        :step="50"
        :format-value="formatPrice"
        labelled
      />
      <output
        data-testid="slider-range-value"
        aria-live="polite"
        >{{ formatPrice(price[0]) }} – {{ formatPrice(price[1]) }}</output
      >
      <div class="slider-range-demo__actions">
        <Button type="submit">{{ t('Submit range', '提交区间') }}</Button>
        <Button
          type="reset"
          variant="text"
          >{{ t('Reset range', '重置区间') }}</Button
        >
      </div>
      <output
        v-if="submitted"
        data-testid="slider-range-submitted"
        aria-live="polite"
        >{{ t('Submitted:', '已提交：') }} {{ submitted }}</output
      >
    </form>
    <div
      :dir="dir"
      class="slider-range-demo__direction"
    >
      <Slider
        v-model="balance"
        :label="t('Balance', '余额')"
        :min="0"
        :max="100"
        labelled
      />
      <div class="slider-range-demo__actions">
        <Button
          variant="outlined"
          type="button"
          @click="toggle"
          >{{ t('Toggle direction', '切换方向') }}</Button
        >
        <span class="yam3x-demo__status"
          >{{ t('Direction:', '方向：') }} {{ direction.toUpperCase() }}</span
        >
      </div>
      <p class="yam3x-demo__status">
        {{
          t(
            'In RTL, ArrowLeft increases the value and ArrowRight decreases it.',
            '在 RTL 下，左方向键增加值，右方向键减少值。',
          )
        }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.slider-range-demo__form,
.slider-range-demo__direction {
  display: grid;
  gap: 16px;
  max-inline-size: 32rem;
}
.slider-range-demo__direction {
  padding-block-start: 24px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}
.slider-range-demo__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.slider-range-demo output {
  font: var(--md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
