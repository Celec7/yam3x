<script setup lang="ts">
import { ref } from 'vue'
import {
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
} from '@registry/components/segmented-button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const filters = ref(['recent'])
const disableFilters = ref(false)
const filterLabels = {
  recent: t('Recent', '最近'),
  saved: t('Saved', '收藏'),
  shared: t('Shared', '共享'),
}
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="segmented-multiple"
  >
    <form
      data-testid="filter-form"
      @submit.prevent
    >
      <MultiChoiceSegmentedButtonRow
        v-model="filters"
        :aria-label="t('Content filters', '内容筛选')"
        name="filter"
        :density="2"
        :disabled="disableFilters"
      >
        <SegmentedButton value="recent">{{ filterLabels.recent }}</SegmentedButton>
        <SegmentedButton value="saved">{{ filterLabels.saved }}</SegmentedButton>
        <SegmentedButton value="shared">{{ filterLabels.shared }}</SegmentedButton>
      </MultiChoiceSegmentedButtonRow>
    </form>
    <Checkbox
      v-model="disableFilters"
      class="segmented-multi__checkbox"
      :label="t('Disable multi-select group', '禁用多选组')"
    />
    <p class="yam3x-demo__status">
      {{ t('Current filters:', '当前筛选：') }}
      {{
        filters.map((filter) => filterLabels[filter as keyof typeof filterLabels]).join(', ') ||
        t('None', '无')
      }}
    </p>
  </section>
</template>

<style scoped>
.segmented-multi__checkbox {
  inline-size: fit-content;
}
</style>
