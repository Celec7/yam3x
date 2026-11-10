<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import {
  BottomSheet,
  BottomSheetAction,
  type BottomSheetDetent,
} from '@registry/components/bottom-sheet'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

type DetentUnit = 'percent' | 'pixels'

const open = ref(false)
const unit = ref<DetentUnit>('percent')
const detent = ref<BottomSheetDetent>('40%')
const presets: Record<DetentUnit, BottomSheetDetent[]> = {
  percent: ['40%', '75%'],
  pixels: [320, 560],
}

const detents = computed(() => presets[unit.value])

watch(unit, (value) => {
  detent.value = presets[value][0]!
})
</script>

<template>
  <div class="yam3x-demo bottom-sheet-detents-demo">
    <label>
      {{ t('Detent unit', '停靠点单位') }}
      <Select
        v-model="unit"
        :aria-label="t('Detent unit', '停靠点单位')"
      >
        <Option
          value="percent"
          :label="t('Percentage', '百分比')"
        />
        <Option
          value="pixels"
          :label="t('Number (CSS pixels)', '数字（CSS 像素）')"
        />
      </Select>
    </label>
    <BottomSheet
      v-model:open="open"
      v-model:detent="detent"
      variant="modal"
      :detents="detents"
      :handle="true"
      :label="t('Custom detents', '自定义停靠点')"
    >
      <template #trigger="{ triggerProps }">
        <Button
          v-bind="triggerProps"
          type="button"
        >
          {{ t('Open custom-detent sheet', '打开自定义停靠点表单') }}
        </Button>
      </template>
      <template #header>{{ t('Custom detents', '自定义停靠点') }}</template>
      <p>
        {{
          t(
            'Percentage and numeric detents are project extensions. The sheet opens at the highest detent below half the viewport.',
            '百分比和数字停靠点属于项目扩展。表单会在不高于视口一半的最高停靠点打开。',
          )
        }}
      </p>
      <p data-testid="bottom-sheet-detent-state">
        {{ t('Current detent:', '当前停靠点：') }} {{ detent }}
      </p>
      <div style="min-height: 180px">
        {{ t('Sheet body content.', '表单正文内容。') }}
      </div>
      <BottomSheetAction>{{ t('Close', '关闭') }}</BottomSheetAction>
    </BottomSheet>
  </div>
</template>

<style scoped>
.bottom-sheet-detents-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}

.bottom-sheet-detents-demo > label {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
