<script setup lang="ts">
import { computed } from 'vue'
import { DataTable, type DataTableColumn } from '@registry/components/data-table'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()

interface Release {
  id: string
  version: string
  channel: 'stable' | 'preview'
  released: Date
  downloads: number
}

const rows: Release[] = [
  {
    id: 'v14',
    version: '1.4.0',
    channel: 'stable',
    released: new Date(2026, 8, 2),
    downloads: 1840,
  },
  {
    id: 'v13',
    version: '1.3.2',
    channel: 'stable',
    released: new Date(2026, 6, 18),
    downloads: 960,
  },
  {
    id: 'v15',
    version: '1.5.0-rc.1',
    channel: 'preview',
    released: new Date(2026, 9, 21),
    downloads: 120,
  },
]

const dateFormat = computed(() => new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }))
const numberFormat = computed(() => new Intl.NumberFormat(localeTag.value))

const columns = computed<Array<DataTableColumn<Release>>>(() => [
  {
    id: 'version',
    label: t('Version', '版本'),
    value: (row) => row.version,
    supporting: (row) =>
      row.channel === 'stable' ? t('Stable channel', '稳定通道') : t('Preview channel', '预览通道'),
    rowHeader: true,
  },
  {
    id: 'released',
    label: t('Released', '发布日期'),
    value: (row) => row.released,
    format: (value) => dateFormat.value.format(value as Date),
    width: '12rem',
  },
  {
    id: 'downloads',
    label: t('Downloads', '下载量'),
    value: (row) => row.downloads,
    format: (value) => numberFormat.value.format(Number(value)),
    numeric: true,
    width: '10rem',
  },
])
</script>

<template>
  <section
    data-testid="table-basic"
    class="data-table-basic"
  >
    <DataTable
      :caption="t('Release downloads', '版本下载量')"
      :columns="columns"
      :rows="rows"
      :row-key="(row) => row.id"
      :locale="localeTag"
    />
  </section>
</template>

<style scoped>
.data-table-basic {
  min-inline-size: 0;
}
</style>
