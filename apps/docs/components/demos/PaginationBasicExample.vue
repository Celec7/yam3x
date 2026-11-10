<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pagination } from '@registry/components/pagination'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()

const total = 96
const page = ref(2)
const pageSize = ref(10)
const start = computed(() => (page.value - 1) * pageSize.value + 1)
const end = computed(() => Math.min(page.value * pageSize.value, total))
const summary = computed(() =>
  t(
    `Showing records ${start.value}–${end.value} of ${total}.`,
    `正在显示第 ${start.value}–${end.value} 条，共 ${total} 条。`,
  ),
)
</script>

<template>
  <section
    data-testid="pagination-basic"
    class="pagination-basic"
    role="region"
    :aria-label="t('Project results', '项目结果')"
  >
    <p>{{ summary }}</p>
    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 25, 50]"
      :locale="localeTag"
      :messages="{ label: t('Project results pages', '项目结果分页') }"
    />
  </section>
</template>

<style scoped>
.pagination-basic {
  display: grid;
  gap: 12px;
  min-inline-size: 0;
}
.pagination-basic p {
  margin: 0;
}
</style>
