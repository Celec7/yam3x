<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DataTable,
  type DataTableColumn,
  type DataTableKey,
  type DataTableFilters,
  type DataTableSort,
} from '@registry/components/data-table'
import { Button } from '@registry/components/button'
import { FormField } from '@registry/components/form-field'
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
  {
    id: 'name',
    label: t('Project', '项目'),
    value: (row) => row.name,
    supporting: (row) => row.owner,
    rowHeader: true,
    sortable: true,
  },
  {
    id: 'budget',
    label: t('Budget', '预算'),
    value: (row) => row.budget,
    numeric: true,
    sortable: true,
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

const page = ref(1)
const pageSize = ref(3)
const sort = ref<DataTableSort | null>(null)
const filters = ref<DataTableFilters>({})
const selected = ref<DataTableKey[]>([])
const keepSelection = ref(false)
const emptyCollection = ref(false)
const disabled = ref(false)
const filter = ref('')
const filterInput = ref<HTMLInputElement>()

function onClearFilters() {
  filter.value = ''
  filters.value = {}
  filterInput.value?.focus()
}

const inspected = ref('')
const rows = computed(() =>
  emptyCollection.value
    ? []
    : projects.value.filter((row) =>
        row.name.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()),
      ),
)
watch([filter, emptyCollection], () => {
  page.value = 1
})

function onSelection(keys: DataTableKey[]) {
  if (!keepSelection.value) selected.value = keys
}
</script>

<template>
  <section
    data-testid="table-local"
    class="data-table-query"
  >
    <div class="data-table-query__tools">
      <FormField :label="t('Filter projects', '筛选项目')"
        ><input
          ref="filterInput"
          v-model="filter"
          type="search"
      /></FormField>
      <Checkbox
        v-model="emptyCollection"
        :label="t('Use an empty collection', '使用空集合')"
      />
      <Checkbox
        v-model="keepSelection"
        :label="t('Keep selection unchanged', '保持选择不变')"
      />
      <Checkbox
        v-model="disabled"
        :label="t('Disable query controls', '禁用查询控件')"
      />
    </div>
    <DataTable
      v-model:sort="sort"
      v-model:filters="filters"
      v-model:page="page"
      v-model:page-size="pageSize"
      :selected-keys="selected"
      :caption="t('Project budgets', '项目预算')"
      :columns="columns"
      :rows="rows"
      :row-key="(row) => row.id"
      :is-row-selectable="(row) => !row.locked"
      :disabled="disabled"
      selectable
      paginated
      :page-sizes="[3, 5]"
      :locale="localeTag"
      :empty-kind="filter && !emptyCollection ? 'filtered' : 'empty'"
      @update:selected-keys="onSelection"
    >
      <template #actions="{ selectedKeys }"
        ><Button
          variant="outlined"
          :disabled="!selectedKeys.length"
          @click="selected = []"
          >{{ t('Clear selection', '清除选择') }}</Button
        ></template
      >
      <template #cell-actions="{ row }"
        ><Button
          variant="text"
          :aria-label="`${t('Inspect', '查看')} ${row.name}`"
          @click="inspected = row.name"
          >{{ t('Inspect', '查看') }}</Button
        ></template
      >
      <template #empty-actions="{ kind }"
        ><Button
          v-if="kind === 'filtered'"
          variant="text"
          @click="onClearFilters"
          >{{ t('Clear filters', '清除筛选') }}</Button
        ></template
      >
    </DataTable>
    <p data-testid="table-selected">
      {{ t('Selected keys:', '已选键：') }} {{ selected.join(', ') || '—' }}
    </p>
    <p
      v-if="inspected"
      data-testid="table-inspected"
    >
      {{ t('Inspecting:', '正在查看：') }} {{ inspected }}
    </p>
  </section>
</template>

<style scoped>
.data-table-query {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.data-table-query__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.data-table-query p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
