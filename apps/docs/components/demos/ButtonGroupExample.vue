<script setup lang="ts">
import { ref } from 'vue'
import ButtonGroupSelection from '@registry/components/button-group/button-group-selection.vue'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { Icon } from '@registry/components/icon'
import type { ButtonShape, ButtonSize } from '@registry/components/button/button.variants'
import type { ButtonGroupVariant } from '@registry/components/button-group/button-group.types'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const currentView = ref('list')
const size = ref<ButtonSize>('small')
const shape = ref<ButtonShape>('round')
const iconGroupVariant = ref<ButtonGroupVariant>('standard')
const filters = ref(['recent'])
const views = [
  { label: t('List', '列表'), value: 'list' },
  { label: t('Grid', '网格'), value: 'grid' },
  { label: t('Map', '地图'), value: 'map', disabled: true },
]
const filterOptions = [
  { label: t('Recent', '最近'), value: 'recent' },
  { label: t('Saved', '收藏'), value: 'saved' },
  { label: t('Shared', '共享'), value: 'shared' },
]
const formatOptions = [
  { label: t('Bold', '粗体'), value: 'bold', kind: 'icon' as const },
  { label: t('Italic', '斜体'), value: 'italic', kind: 'icon' as const },
  { label: t('Underline', '下划线'), value: 'underline', kind: 'icon' as const },
]
const formats = ref(['bold'])

function setSize(value: string | string[] | null) {
  if (
    value === 'extra-small' ||
    value === 'small' ||
    value === 'medium' ||
    value === 'large' ||
    value === 'extra-large'
  ) {
    size.value = value
  }
}

function setShape(value: string | string[] | null) {
  if (value === 'round' || value === 'square') shape.value = value
}

function setIconGroupVariant(value: string | string[] | null) {
  if (value === 'standard' || value === 'connected') iconGroupVariant.value = value
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <label class="yam3x-demo__control">
      {{ t('Button group size', '按钮组尺寸') }}
      <Select
        :model-value="size"
        :aria-label="t('Button group size', '按钮组尺寸')"
        @update:model-value="setSize"
      >
        <Option
          value="extra-small"
          label="XS"
        />
        <Option
          value="small"
          label="S"
        />
        <Option
          value="medium"
          label="M"
        />
        <Option
          value="large"
          label="L"
        />
        <Option
          value="extra-large"
          label="XL"
        />
      </Select>
    </label>
    <label class="yam3x-demo__control">
      {{ t('Button group shape', '按钮组形状') }}
      <Select
        :model-value="shape"
        :aria-label="t('Button group shape', '按钮组形状')"
        @update:model-value="setShape"
      >
        <Option
          value="round"
          :label="t('Round', '圆形')"
        />
        <Option
          value="square"
          :label="t('Square', '方形')"
        />
      </Select>
    </label>
    <label class="yam3x-demo__control">
      {{ t('Icon group variant', '图标组变体') }}
      <Select
        :model-value="iconGroupVariant"
        :aria-label="t('Icon group variant', '图标组变体')"
        @update:model-value="setIconGroupVariant"
      >
        <Option
          value="standard"
          :label="t('Standard', '标准')"
        />
        <Option
          value="connected"
          :label="t('Connected', '连接')"
        />
      </Select>
    </label>
    <ButtonGroupSelection
      v-model="currentView"
      :label="t('View mode', '显示方式')"
      :options="views"
      variant="connected"
      selection-mode="single"
      :size="size"
      :shape="shape"
    />
    <p class="yam3x-demo__status">{{ t('Current view:', '当前显示：') }} {{ currentView }}</p>
    <ButtonGroupSelection
      v-model="filters"
      :label="t('Content filters', '筛选内容')"
      :options="filterOptions"
      selection-mode="multiple"
      :size="size"
      :shape="shape"
    />
    <p class="yam3x-demo__status">
      {{ t('Current filters:', '当前筛选：') }} {{ filters.join(', ') }}
    </p>
    <ButtonGroupSelection
      v-model="formats"
      :label="t('Text formatting', '文本格式')"
      :options="formatOptions"
      selection-mode="multiple"
      :size="size"
      :shape="shape"
      :variant="iconGroupVariant"
    >
      <template #option="{ option }">
        <Icon
          :name="
            option.value === 'bold'
              ? 'format_bold'
              : option.value === 'italic'
                ? 'format_italic'
                : 'format_underlined'
          "
        />
      </template>
    </ButtonGroupSelection>
    <p class="yam3x-demo__status">
      {{ t('Current formatting:', '当前格式：') }} {{ formats.join(', ') }}
    </p>
  </div>
</template>
