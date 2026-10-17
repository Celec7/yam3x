<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import SegmentedButton from '@registry/components/segmented-button/segmented-button.vue'
import MultiChoiceSegmentedButtonRow from '@registry/components/segmented-button/multi-choice-segmented-button-row.vue'
import SingleChoiceSegmentedButtonRow from '@registry/components/segmented-button/single-choice-segmented-button-row.vue'
import { Icon } from '@registry/components/icon'
import type { SegmentedButtonChangeDetail } from '@registry/components/segmented-button/segmented-button.types'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const view = ref<string | null>('list')
const filters = ref(['recent'])
const disableFilters = ref(false)
const lastViewChange = ref('')
const viewLabels = {
  list: t('List', '列表'),
  grid: t('Grid', '网格'),
  map: t('Map', '地图'),
}
const filterLabels = {
  recent: t('Recent', '最近'),
  saved: t('Saved', '收藏'),
  shared: t('Shared', '共享'),
}

function onViewChange({ previousValue, value }: SegmentedButtonChangeDetail<string | null>): void {
  lastViewChange.value = `${viewLabels[previousValue as keyof typeof viewLabels] ?? '—'} → ${viewLabels[value as keyof typeof viewLabels] ?? '—'}`
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <form
      data-testid="segmented-form"
      @submit.prevent
    >
      <SingleChoiceSegmentedButtonRow
        v-model="view"
        aria-label="View mode"
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
    <form
      data-testid="filter-form"
      @submit.prevent
    >
      <MultiChoiceSegmentedButtonRow
        v-model="filters"
        aria-label="Content filters"
        name="filter"
        :density="2"
        :disabled="disableFilters"
      >
        <SegmentedButton value="recent">{{ t('Recent', '最近') }}</SegmentedButton>
        <SegmentedButton value="saved">{{ t('Saved', '收藏') }}</SegmentedButton>
        <SegmentedButton value="shared">{{ t('Shared', '共享') }}</SegmentedButton>
      </MultiChoiceSegmentedButtonRow>
    </form>
    <Checkbox
      v-model="disableFilters"
      class="inline-flex items-center gap-2"
      :label="t('Disable multi-select group', '禁用多选组')"
    />
    <p class="yam3x-demo__status">
      {{ t('Current view:', '当前显示：') }}
      {{ view ? viewLabels[view as keyof typeof viewLabels] : t('None', '无') }}
    </p>
    <p class="yam3x-demo__status">
      {{ t('Current filters:', '当前筛选：') }}
      {{ filters.map((filter) => filterLabels[filter as keyof typeof filterLabels]).join(', ') }}
    </p>
  </div>
</template>
