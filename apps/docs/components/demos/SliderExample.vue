<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import {
  RangeSlider,
  Slider,
  type SliderVariant,
  type SliderSize,
} from '@registry/components/slider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const variant = ref<SliderVariant | 'range'>('standard')
const size = ref<SliderSize>('extra-small')
const orientation = ref<'horizontal' | 'vertical'>('horizontal')
const stops = ref(false)
const labelled = ref(true)
const disabled = ref(false)
const value = ref(46)
const range = ref<[number, number]>([25, 75])
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack slider-demo">
    <div class="slider-demo__controls">
      <label
        >{{ t('Mode', '模式') }}
        <Select
          v-model="variant"
          :aria-label="t('Slider mode', '滑块模式')"
          ><Option
            value="standard"
            :label="t('Standard', '标准')" /><Option
            value="centered"
            :label="t('Centered', '居中')" /><Option
            value="range"
            :label="t('Range', '范围')" /></Select
      ></label>
      <label
        >{{ t('Size', '尺寸') }}
        <Select
          v-model="size"
          :aria-label="t('Slider size', '滑块尺寸')"
          ><Option
            value="extra-small"
            label="XS" /><Option
            value="small"
            label="S" /><Option
            value="medium"
            label="M" /><Option
            value="large"
            label="L" /><Option
            value="extra-large"
            label="XL" /></Select
      ></label>
      <label
        >{{ t('Orientation', '方向') }}
        <Select
          v-model="orientation"
          :aria-label="t('Slider orientation', '滑块方向')"
          ><Option
            value="horizontal"
            :label="t('Horizontal', '横向')" /><Option
            value="vertical"
            :label="t('Vertical', '纵向')" /></Select
      ></label>
      <Checkbox
        v-model="stops"
        :label="t('Show stops', '停靠点')"
      />
      <Checkbox
        v-model="labelled"
        :label="t('Show value labels', '数值标签')"
      />
      <Checkbox
        v-model="disabled"
        :label="t('Disabled', '禁用')"
      />
    </div>
    <div class="slider-demo__stage">
      <RangeSlider
        v-if="variant === 'range'"
        v-model="range"
        data-testid="slider"
        :label="t('Select range', '选择区间')"
        :size="size"
        :orientation="orientation"
        :stops="stops"
        :labelled="labelled"
        :disabled="disabled"
        :step="stops ? 10 : 1"
      />
      <Slider
        v-else
        v-model="value"
        data-testid="slider"
        :label="t('Value', '数值')"
        :variant="variant"
        :size="size"
        :orientation="orientation"
        :stops="stops"
        :labelled="labelled"
        :disabled="disabled"
        :step="stops ? 10 : 1"
      />
    </div>
    <output aria-live="polite">{{
      variant === 'range' ? `${range[0]}–${range[1]}` : value
    }}</output>
  </div>
</template>

<style scoped>
.slider-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}
.slider-demo__controls label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.slider-demo__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 40px 16px;
}
.slider-demo__stage > * {
  max-width: 560px;
}
</style>
