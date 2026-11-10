<script setup lang="ts">
import { ref } from 'vue'
import { FilterChip, FilterChipSet } from '@registry/components/chips'
import { Icon } from '@registry/components/icon'
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
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="chip-filters"
  >
    <div class="yam3x-demo__row">
      <FilterChip :selected="true">{{ t('Selected', '已选择') }}</FilterChip>
      <FilterChip v-model:selected="standaloneFilterSelected">
        {{ t('Interactive filter', '交互筛选') }}
      </FilterChip>
      <FilterChip
        :selected="true"
        :trailing-action-label="t('More filter actions', '更多筛选操作')"
        @action="trailingActionCount++"
      >
        <template #icon><Icon name="bookmark" /></template>
        {{ t('Saved view', '已保存视图') }}
        <template #trailing-action><Icon name="more_horiz" /></template>
      </FilterChip>
      <FilterChip disabled>{{ t('Unavailable', '不可用') }}</FilterChip>
    </div>
    <p class="yam3x-demo__status">
      {{ t('Trailing actions opened:', '已触发尾部操作：') }} {{ trailingActionCount }}
    </p>

    <h3
      id="filter-primary-label"
      class="chip-filters__group-label"
    >
      {{ t('Primary topic', '主要主题') }}
    </h3>
    <FilterChipSet
      v-model="selectedTopic"
      :label="t('Primary topic', '主要主题')"
      :aria-labelledby="'filter-primary-label'"
      :options="options"
    />
    <p class="yam3x-demo__status">{{ t('Single selection:', '单选值：') }} {{ selectedTopic }}</p>

    <h3
      id="filter-more-label"
      class="chip-filters__group-label"
    >
      {{ t('More topics', '更多主题') }}
    </h3>
    <FilterChipSet
      v-model="selectedTopics"
      :label="t('More topics', '更多主题')"
      :aria-labelledby="'filter-more-label'"
      multi
      :options="options"
    />
    <p class="yam3x-demo__status">
      {{ t('Multiple selections:', '多选值：') }}
      {{ selectedTopics.join(', ') || t('None', '无') }}
    </p>

    <h3
      id="filter-vertical-label"
      class="chip-filters__group-label"
    >
      {{ t('Vertical topics', '纵向主题') }}
    </h3>
    <FilterChipSet
      v-model="verticalTopics"
      :label="t('Vertical topics', '纵向主题')"
      :aria-labelledby="'filter-vertical-label'"
      vertical
      multi
      :options="options"
    />
  </section>
</template>

<style scoped>
.chip-filters__group-label {
  margin: 0;
  font-size: 16px;
}
</style>
