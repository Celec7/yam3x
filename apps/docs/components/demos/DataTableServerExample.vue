<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import {
  DataTable,
  type DataTableColumn,
  type DataTableQuery,
} from '@registry/components/data-table'
import { Button } from '@registry/components/button'
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
        (column === 'budget' ? a.budget - b.budget : a.name.localeCompare(b.name, localeTag.value)),
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
  <section
    data-testid="table-server"
    class="data-table-server"
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
      :locale="localeTag"
      @change="request"
      @retry="request(latest)"
    />
    <div
      v-if="pending"
      class="data-table-server__actions"
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
</template>

<style scoped>
.data-table-server {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.data-table-server p {
  margin: 0;
  overflow-wrap: anywhere;
}
.data-table-server__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
