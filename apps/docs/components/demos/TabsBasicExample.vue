<script setup lang="ts">
import { computed, ref } from 'vue'
import { Tabs, type TabItem } from '@registry/components/tabs'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const current = ref('overview')
const iconNames: Record<string, string> = {
  overview: 'dashboard',
  activity: 'bolt',
  files: 'folder',
  archive: 'archive',
}
const items: TabItem[] = [
  { value: 'overview', label: t('Overview', '概览') },
  { value: 'activity', label: t('Activity', '动态'), badge: 4 },
  { value: 'files', label: t('Files', '文件') },
  { value: 'archive', label: t('Archive', '归档'), disabled: true },
]
const panels = computed<Record<string, string>>(() => ({
  overview: t(
    'The overview summarizes the project and its recent changes.',
    '概览汇总项目及其最近更改。',
  ),
  activity: t(
    'Activity lists comments, reviews, and deployments in order.',
    '动态按顺序列出评论、评审和部署。',
  ),
  files: t(
    'Files groups documents, images, and exported reports.',
    '文件汇总文档、图片和导出的报告。',
  ),
  archive: t('Archived items stay read-only.', '归档内容保持只读。'),
}))
</script>

<template>
  <section
    data-testid="tabs-basic"
    class="tabs-basic"
  >
    <Tabs
      v-model="current"
      :label="t('Project sections', '项目分区')"
      :items="items"
      variant="primary"
    >
      <template #icon="{ item }"><Icon :name="iconNames[item.value]" /></template>
      <template #panel="{ item }">
        <p class="tabs-basic__panel">{{ panels[item.value] }}</p>
      </template>
    </Tabs>
  </section>
</template>

<style scoped>
.tabs-basic {
  min-inline-size: 0;
}
.tabs-basic__panel {
  margin: 0;
  padding: 16px 0;
}
</style>
