<script setup lang="ts">
import { computed, ref } from 'vue'
import { DataTable, type DataTableColumn, type DataTableKey } from '@registry/components/data-table'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()

const definitions = [
  { id: 'atlas', en: 'Atlas', zh: '地图集', owner: 'ana@example.com', budget: 1250, locked: false },
  { id: 'beacon', en: 'Beacon', zh: '灯塔', owner: 'bo@example.com', budget: 340, locked: false },
  { id: 'cedar', en: 'Cedar', zh: '雪松', owner: 'chen@example.com', budget: 340, locked: true },
  {
    id: 'delta',
    en: 'Delta',
    zh: '三角洲',
    owner: 'dara@example.com',
    budget: 9800,
    locked: false,
  },
  { id: 'ember', en: 'Ember', zh: '余烬', owner: 'eli@example.com', budget: 20, locked: false },
  { id: 'fern', en: 'Fern', zh: '蕨叶', owner: 'fern@example.com', budget: 700, locked: false },
  {
    id: 'grove',
    en: 'Grove with a long name that stays available without truncation',
    zh: '名称很长但仍然完整显示而不截断的林地项目',
    owner: 'gale@example.com',
    budget: 2000,
    locked: false,
  },
]
const projects = computed(() => definitions.map((row) => ({ ...row, name: t(row.en, row.zh) })))
type Project = (typeof projects.value)[number]

const columns = computed<Array<DataTableColumn<Project>>>(() => [
  { id: 'name', label: t('Project', '项目'), value: (row) => row.name, rowHeader: true },
  {
    id: 'budget',
    label: t('Budget', '预算'),
    value: (row) => row.budget,
    numeric: true,
    format: (value) =>
      new Intl.NumberFormat(localeTag.value, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(value)),
  },
  {
    id: 'status',
    label: t('Status', '状态'),
    value: (row) => (row.locked ? t('Archived', '已归档') : t('Active', '进行中')),
    filter: {
      options: [
        { value: 'active', label: t('Active', '进行中') },
        { value: 'archived', label: t('Archived', '已归档') },
      ],
      matches: (row, value) => value === (row.locked ? 'archived' : 'active'),
    },
  },
  { id: 'actions', label: t('Actions', '操作') },
])

const pinnedColumns = computed<Array<DataTableColumn<Project>>>(() => [
  { ...columns.value[0]!, fixed: 'start', width: '10rem' },
  {
    id: 'owner',
    label: t('Owner', '负责人'),
    value: (row) => row.owner,
    fixed: 'start',
    width: '12rem',
  },
  { ...columns.value[1]!, width: '12rem' },
  { ...columns.value[2]!, width: '10rem' },
  { ...columns.value[3]!, fixed: 'end', width: '8rem' },
])

const rtl = ref(false)
const pinned = ref<DataTableKey[]>([])
const inspected = ref('')
</script>

<template>
  <section
    data-testid="table-pinned"
    class="data-table-layout"
  >
    <div class="data-table-layout__tools">
      <Checkbox
        v-model="rtl"
        :label="t('Use RTL for fixed columns', '固定列使用 RTL')"
      />
    </div>
    <DataTable
      v-model:selected-keys="pinned"
      :caption="t('Scrollable projects', '可滚动项目')"
      :columns="pinnedColumns"
      :rows="projects"
      :row-key="(row) => row.id"
      :locale="localeTag"
      :dir="rtl ? 'rtl' : 'ltr'"
      sticky-header
      max-height="16rem"
      selectable
      style="--yam3x-data-table-min-width: 64rem"
    >
      <template #cell-actions="{ row }"
        ><Button
          variant="text"
          :aria-label="`${t('Inspect', '查看')} ${row.name}`"
          @click="inspected = row.name"
          >{{ t('Inspect', '查看') }}</Button
        ></template
      >
      <template #footer="{ total, selectedKeys }"
        ><span data-testid="table-layout-footer">{{
          t(
            `${total} rows in the collection, ${selectedKeys.length} selected`,
            `集合共 ${total} 行，已选择 ${selectedKeys.length} 行`,
          )
        }}</span></template
      >
    </DataTable>
    <p
      v-if="inspected"
      data-testid="table-layout-inspected"
    >
      {{ t('Inspecting:', '正在查看：') }} {{ inspected }}
    </p>
  </section>
</template>

<style scoped>
.data-table-layout {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.data-table-layout__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.data-table-layout p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
