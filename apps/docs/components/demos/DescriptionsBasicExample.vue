<script setup lang="ts">
import { computed } from 'vue'
import { Descriptions, type DescriptionItem } from '@registry/components/descriptions'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const items = computed<DescriptionItem[]>(() => [
  { key: 'name', label: t('Project', '项目'), value: 'Atlas' },
  { key: 'owner', label: t('Owner', '负责人'), value: 'Ada' },
  { key: 'budget', label: t('Remaining budget', '剩余预算'), value: 0 },
  {
    key: 'summary',
    label: t('Summary', '摘要'),
    value: t(
      'A single record keeps its labels, values, and reading order when the container narrows.',
      '容器变窄时，单条记录仍保留标签、值和阅读顺序。',
    ),
    fullWidth: true,
  },
])
</script>

<template>
  <section
    class="yam3x-demo"
    data-testid="descriptions-basic"
  >
    <Descriptions
      :items="items"
      :title="t('Project details', '项目详情')"
      outlined
    />
  </section>
</template>
