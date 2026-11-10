<script setup lang="ts">
import { ref } from 'vue'
import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from '@registry/components/segmented-button'
import { Icon } from '@registry/components/icon'
import type { SegmentedButtonChangeDetail } from '@registry/components/segmented-button'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const view = ref<string | null>('list')
const lastViewChange = ref('')
const viewLabels = {
  list: t('List', '列表'),
  grid: t('Grid', '网格'),
  map: t('Map', '地图'),
}

function onViewChange({ previousValue, value }: SegmentedButtonChangeDetail<string | null>): void {
  const previous = viewLabels[previousValue as keyof typeof viewLabels] ?? '—'
  const next = viewLabels[value as keyof typeof viewLabels] ?? '—'
  lastViewChange.value = `${previous} → ${next}`
}
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="segmented-single"
  >
    <form
      data-testid="segmented-form"
      @submit.prevent
    >
      <SingleChoiceSegmentedButtonRow
        v-model="view"
        :aria-label="t('View mode', '视图模式')"
        name="view"
        @change="onViewChange"
      >
        <SegmentedButton value="list">
          <template #icon="{ selected }">
            <Icon :name="selected ? 'check' : 'view_list'" />
          </template>
          {{ viewLabels.list }}
        </SegmentedButton>
        <SegmentedButton value="grid">
          <template #icon="{ selected }">
            <Icon :name="selected ? 'check' : 'grid_view'" />
          </template>
          {{ viewLabels.grid }}
        </SegmentedButton>
        <SegmentedButton
          value="map"
          disabled
        >
          <template #icon="{ selected }">
            <Icon :name="selected ? 'check' : 'map'" />
          </template>
          {{ viewLabels.map }}
        </SegmentedButton>
      </SingleChoiceSegmentedButtonRow>
    </form>
    <p
      class="yam3x-demo__status"
      data-testid="single-change"
    >
      {{ lastViewChange || t('No selection change yet', '尚未更改选择') }}
    </p>
    <p class="yam3x-demo__status">
      {{ t('Current view:', '当前显示：') }}
      {{ view ? viewLabels[view as keyof typeof viewLabels] : t('None', '无') }}
    </p>
  </section>
</template>
