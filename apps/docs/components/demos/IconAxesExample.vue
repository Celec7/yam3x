<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Icon, type IconGrade, type IconVariant, type IconWeight } from '@registry/components/icon'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const variant = ref('outlined')
const grade = ref('auto')
const weight = ref('400')
const opticalSize = ref('24')
const filled = ref(false)

const iconVariant = computed<IconVariant>(() => variant.value as IconVariant)
const iconGrade = computed<IconGrade>(() => grade.value as IconGrade)
const iconWeight = computed<IconWeight>(() => Number(weight.value) as IconWeight)
const iconOpticalSize = computed(() => Number(opticalSize.value))

const variantOptions = computed(() => [
  { value: 'outlined', label: t('Outlined', '轮廓') },
  { value: 'rounded', label: t('Rounded', '圆角') },
  { value: 'sharp', label: t('Sharp', '尖角') },
])
const gradeOptions = computed(() => [
  { value: 'auto', label: t('Auto', '自动') },
  { value: 'low', label: t('Low (-25)', '低（-25）') },
  { value: 'medium', label: t('Medium (0)', '中（0）') },
  { value: 'high', label: t('High (200)', '高（200）') },
])
const weights = ['100', '200', '300', '400', '500', '600', '700']
const opticalSizes = ['20', '24', '28', '32', '36', '40', '44', '48']
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack icon-axes">
    <div class="icon-axes__controls">
      <label>
        {{ t('Style', '样式') }}
        <Select
          v-model="variant"
          :aria-label="t('Icon style', '图标样式')"
        >
          <Option
            v-for="option in variantOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </Select>
      </label>
      <label>
        {{ t('Grade', '等级') }}
        <Select
          v-model="grade"
          :aria-label="t('Grade axis', '等级轴')"
        >
          <Option
            v-for="option in gradeOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </Select>
      </label>
      <label>
        {{ t('Weight', '字重') }}
        <Select
          v-model="weight"
          :aria-label="t('Weight axis', '字重轴')"
        >
          <Option
            v-for="value in weights"
            :key="value"
            :value="value"
            :label="value"
          />
        </Select>
      </label>
      <label>
        {{ t('Optical size', '光学尺寸') }}
        <Select
          v-model="opticalSize"
          :aria-label="t('Optical size axis', '光学尺寸轴')"
        >
          <Option
            v-for="value in opticalSizes"
            :key="value"
            :value="value"
            :label="value"
          />
        </Select>
      </label>
      <Checkbox
        v-model="filled"
        :label="t('Filled', '填充')"
      />
    </div>
    <div class="yam3x-demo__row icon-axes__preview">
      <Icon
        data-testid="icon-axes"
        name="star"
        :variant="iconVariant"
        :grade="iconGrade"
        :weight="iconWeight"
        :optical-size="iconOpticalSize"
        :filled="filled"
        :aria-label="t('Star rating', '星级评分')"
        style="--yam3x-icon-size: 64px"
      />
      <Icon
        name="star"
        aria-hidden="true"
        :variant="iconVariant"
        :grade="iconGrade"
        :weight="iconWeight"
        :optical-size="iconOpticalSize"
        :filled="filled"
      />
    </div>
  </div>
</template>

<style scoped>
.icon-axes__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 24px;
}
.icon-axes__controls label {
  display: grid;
  gap: 8px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
.icon-axes__preview {
  align-items: center;
  min-height: 88px;
  gap: 28px;
}
</style>
