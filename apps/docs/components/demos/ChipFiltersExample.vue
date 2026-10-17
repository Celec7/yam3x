<script setup lang="ts">
import { ref } from 'vue'
import FilterChip from '@registry/components/filter-chip/filter-chip.vue'
import FilterChipSet from '@registry/components/filter-chip-set/filter-chip-set.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const selectedTopics = ref(['design'])
const selectedTopic = ref<string | null>('design')
const verticalTopics = ref<string[]>(['design'])
const standaloneFilterSelected = ref(false)
const trailingActionCount = ref(0)
const options = [
  { label: t('Design', '设计'), value: 'design' },
  { label: t('Engineering', '工程'), value: 'engineering' },
  { label: t('Research', '研究'), value: 'research' },
]
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <div class="yam3x-demo__row">
      <FilterChip :selected="true">{{ t('Selected', '已选择') }}</FilterChip>
      <FilterChip v-model:selected="standaloneFilterSelected">{{
        t('Interactive filter', '交互筛选')
      }}</FilterChip>
      <FilterChip
        :selected="true"
        :trailing-action-label="t('More filter actions', '更多筛选操作')"
        @action="trailingActionCount++"
      >
        <template #icon><span aria-hidden="true">✓</span></template>
        {{ t('Saved view', '已保存视图') }}
        <template #trailing-action><span aria-hidden="true">⋯</span></template>
      </FilterChip>
      <FilterChip disabled>{{ t('Unavailable', '不可用') }}</FilterChip>
    </div>
    <p class="yam3x-demo__status">
      {{ t('Trailing actions opened:', '已触发尾部操作：') }} {{ trailingActionCount }}
    </p>
    <FilterChipSet
      v-model="selectedTopic"
      :label="t('Primary topic', '主要主题')"
      :options="options"
    />
    <p class="yam3x-demo__status">{{ t('Single selection:', '单选值：') }} {{ selectedTopic }}</p>
    <FilterChipSet
      v-model="selectedTopics"
      :label="t('More topics', '更多主题')"
      multi
      :options="options"
    />
    <p class="yam3x-demo__status">
      {{ t('Multiple selections:', '多选值：') }} {{ selectedTopics.join(', ') || t('None', '无') }}
    </p>
    <FilterChipSet
      v-model="verticalTopics"
      :label="t('Vertical topics', '纵向主题')"
      vertical
      multi
      :options="options"
    />
  </div>
</template>
