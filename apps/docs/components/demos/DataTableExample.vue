<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import {
  DataTable,
  type DataTableColumn,
  type DataTableKey,
  type DataTableFilters,
  type DataTableQuery,
  type DataTableSort,
} from '@registry/components/data-table'
import { Button } from '@registry/components/button'
import { FormField } from '@registry/components/form-field'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'
const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
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
      new Intl.NumberFormat(fieldLocale.value, {
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
  { ...columns.value[0]!, fixed: 'start', width: '10rem', supporting: undefined },
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
const pinnedRtl = ref(false)
const pinned = ref<DataTableKey[]>([])
const page = ref(1)
const pageSize = ref(3)
const sort = ref<DataTableSort | null>(null)
const filters = ref<DataTableFilters>({})
const selected = ref<DataTableKey[]>([])
const keepSelection = ref(false)
const emptyCollection = ref(false)
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
const accepted = ref<DataTableQuery>({ sort: null, page: 1, pageSize: 2 })
const pending = ref<DataTableQuery | null>({ ...accepted.value })
let latest: DataTableQuery = { ...accepted.value }
const serverRows = shallowRef<Project[]>([])
const serverTotal = ref(0)
const error = ref('')
function request(query: DataTableQuery) {
  latest = query
  pending.value = query
  error.value = ''
}
function accept() {
  if (!pending.value) return
  const query = pending.value
  const status = query.filters?.status
  const data = projects.value.filter(
    (row) => !status?.length || status.includes(row.locked ? 'archived' : 'active'),
  )
  serverTotal.value = data.length
  if (query.sort) {
    const direction = query.sort.direction === 'ascending' ? 1 : -1
    const column = query.sort.column
    data.sort(
      (a, b) =>
        direction *
        (column === 'budget'
          ? a.budget - b.budget
          : a.name.localeCompare(b.name, fieldLocale.value)),
    )
  }
  serverRows.value = data.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
  accepted.value = query
  pending.value = null
}
function fail() {
  pending.value = null
  error.value = serverRows.value.length
    ? t(
        'The requested results could not be loaded. Your previous records are still available.',
        '无法加载请求的结果，之前的记录仍然可用。',
      )
    : t(
        'Records could not be loaded. Retry to request them again.',
        '无法加载记录，请重试以重新请求。',
      )
}
</script>

<template>
  <div class="data-table-demo">
    <section
      data-testid="table-local"
      class="data-table-demo__section"
    >
      <div class="data-table-demo__tools">
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
        selectable
        paginated
        :page-sizes="[3, 5]"
        :locale="fieldLocale"
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
    <section
      data-testid="table-server"
      class="data-table-demo__section"
    >
      <p>
        {{
          t(
            'Request a server result, then accept or fail the response. The table keeps the last accepted rows, sort, and page.',
            '请求服务端结果，然后接受或拒绝响应。表格保留上次接受的记录、排序和页码。',
          )
        }}
      </p>
      <DataTable
        :caption="t('Accepted server results', '已接受的服务端结果')"
        :columns="columns"
        :rows="serverRows"
        :row-key="(row) => row.id"
        mode="server"
        :sort="accepted.sort"
        :filters="accepted.filters"
        :page="accepted.page"
        :page-size="accepted.pageSize"
        :total="serverTotal"
        paginated
        :loading="Boolean(pending)"
        :error="error"
        :locale="fieldLocale"
        @change="request"
        @retry="request(latest)"
      />
      <div
        v-if="pending"
        class="data-table-demo__tools"
      >
        <Button @click="accept">{{ t('Accept response', '接受响应') }}</Button>
        <Button
          variant="outlined"
          @click="fail"
          >{{ t('Fail response', '拒绝响应') }}</Button
        >
      </div>
      <Button
        v-else
        variant="outlined"
        @click="request(accepted)"
        >{{ t('Refresh records', '刷新记录') }}</Button
      >
    </section>
    <section
      data-testid="table-pinned"
      class="data-table-demo__section"
    >
      <Checkbox
        v-model="pinnedRtl"
        :label="t('Use RTL for fixed columns', '固定列使用 RTL')"
      />
      <DataTable
        v-model:selected-keys="pinned"
        :caption="t('Scrollable projects', '可滚动项目')"
        :columns="pinnedColumns"
        :rows="projects"
        :row-key="(row) => row.id"
        :locale="fieldLocale"
        :dir="pinnedRtl ? 'rtl' : 'ltr'"
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
      </DataTable>
    </section>
  </div>
</template>

<style scoped>
.data-table-demo,
.data-table-demo__section {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.data-table-demo__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.data-table-demo p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
