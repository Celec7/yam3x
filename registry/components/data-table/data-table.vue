<script setup lang="ts" generic="T">
import { useComponentLocale } from '../localization/context'
import { computed, nextTick, ref, useId } from 'vue'
import CheckboxBase from '../checkbox/checkbox-base.vue'
import Pagination from '../pagination/pagination.vue'
import EmptyState from '../empty-state/empty-state.vue'
import InlineMessage from '../inline-message/inline-message.vue'
import Button from '../button/button.vue'
import LinearProgressIndicator from '../progress-indicator/linear-progress-indicator.vue'
import { vRipple } from '../_shared/ripple'
import { nextTableSort, selectTablePage, sortTableRows } from './data-table.utils'
import type {
  DataTableCell,
  DataTableColumn,
  DataTableKey,
  DataTableMessages,
  DataTableQuery,
  DataTableSelection,
  DataTableSort,
} from './data-table.types'

const props = withDefaults(
  defineProps<{
    caption: string
    columns: ReadonlyArray<DataTableColumn<T>>
    rows: readonly T[]
    rowKey: (row: T) => DataTableKey
    rowLabel?: (row: T) => string
    mode?: 'client' | 'server'
    sort?: DataTableSort | null
    selectedKeys?: readonly DataTableKey[]
    selectable?: boolean
    isRowSelectable?: (row: T) => boolean
    paginated?: boolean
    page?: number
    pageSize?: number
    pageSizes?: readonly number[]
    total?: number
    loading?: boolean
    error?: string
    emptyKind?: 'empty' | 'filtered'
    disabled?: boolean
    locale?: string
    messages?: Partial<DataTableMessages>
  }>(),
  {
    rowLabel: undefined,
    mode: 'client',
    sort: null,
    selectedKeys: () => [],
    selectable: false,
    isRowSelectable: undefined,
    paginated: false,
    page: 1,
    pageSize: 10,
    pageSizes: () => [],
    total: undefined,
    loading: false,
    error: '',
    emptyKind: 'empty',
    disabled: false,
    locale: undefined,
    messages: undefined,
  },
)
const emit = defineEmits<{
  'update:sort': [sort: DataTableSort | null]
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'update:selectedKeys': [keys: DataTableKey[]]
  change: [query: DataTableQuery]
  selectionChange: [detail: DataTableSelection]
  retry: []
}>()
defineSlots<{
  [name: `cell-${string}`]: ((scope: DataTableCell<T>) => unknown) | undefined
  actions?(scope: { selectedKeys: readonly DataTableKey[] }): unknown
  empty?(scope: { kind: 'empty' | 'filtered' }): unknown
  'empty-actions'?(scope: { kind: 'empty' | 'filtered' }): unknown
  'error-actions'?(): unknown
  footer?(scope: { total: number | undefined; selectedKeys: readonly DataTableKey[] }): unknown
}>()
const uid = `yam3x-table-${useId().replace(/:/g, '')}`
const captionId = `${uid}-caption`
const scrollId = `${uid}-scroll`
const sortId = `${uid}-sort`
const scroll = ref<HTMLElement>()
const { locale, messages } = useComponentLocale(
  'dataTable',
  () => props.locale,
  () => props.messages,
)
const sortedRows = computed(() =>
  props.mode === 'client'
    ? sortTableRows(props.rows, props.columns, props.sort, locale.value)
    : props.rows,
)
const totalRows = computed(() => (props.mode === 'client' ? props.rows.length : props.total))
const validTotal = computed(
  () =>
    totalRows.value !== undefined && Number.isSafeInteger(totalRows.value) && totalRows.value >= 0,
)
const validPage = computed(
  () =>
    !props.paginated ||
    (validTotal.value &&
      Number.isSafeInteger(props.pageSize) &&
      props.pageSize > 0 &&
      Number.isSafeInteger(props.page) &&
      props.page >= 1 &&
      props.page <= Math.max(1, Math.ceil(totalRows.value! / props.pageSize))),
)
const start = computed(() =>
  props.paginated && validPage.value ? (props.page - 1) * props.pageSize : 0,
)
const visibleRows = computed(() =>
  !validPage.value
    ? []
    : props.mode === 'client' && props.paginated
      ? sortedRows.value.slice(start.value, start.value + props.pageSize)
      : sortedRows.value,
)
const records = computed(() =>
  visibleRows.value.map((row, index) => ({
    row,
    key: props.rowKey(row),
    index: start.value + index,
  })),
)
const selected = computed(() => new Set(props.selectedKeys))
const canSelectRow = (row: T) => props.isRowSelectable?.(row) !== false
const pageKeys = computed(() =>
  records.value.filter(({ row }) => canSelectRow(row)).map(({ key }) => key),
)
const pageSelected = computed(() => pageKeys.value.filter((key) => selected.value.has(key)).length)
// Selection is controlled by keys; native form resets preserve the accepted set.
const pageState = computed(() =>
  pageSelected.value === 0
    ? 'unchecked'
    : pageSelected.value === pageKeys.value.length
      ? 'checked'
      : 'indeterminate',
)
const sortable = computed(() => props.columns.some((column) => column.sortable))
const numbered = computed(() => props.paginated && validPage.value && records.value.length > 0)
function value(row: T, column: DataTableColumn<T>) {
  return column.value?.(row)
}
function text(row: T, column: DataTableColumn<T>) {
  const raw = value(row, column)
  return column.format
    ? column.format(raw, row)
    : raw === undefined || raw === null
      ? ''
      : String(raw)
}
function label(row: T) {
  const column = props.columns.find((column) => column.rowHeader) ?? props.columns[0]
  return props.rowLabel?.(row) || (column ? text(row, column) : '') || String(props.rowKey(row))
}
function request(query: DataTableQuery) {
  if (props.disabled || props.loading) return
  if (query.sort?.column !== props.sort?.column || query.sort?.direction !== props.sort?.direction)
    emit('update:sort', query.sort)
  if (query.page !== props.page) emit('update:page', query.page)
  if (query.pageSize !== props.pageSize) emit('update:pageSize', query.pageSize)
  emit('change', query)
}
function onSort(column: DataTableColumn<T>) {
  request({ sort: nextTableSort(props.sort, column.id), page: 1, pageSize: props.pageSize })
}
function onPage(query: { page: number; pageSize: number }) {
  request({ ...query, sort: props.sort })
}
function selectionRequest(keys: readonly DataTableKey[], checked: boolean, source: 'row' | 'page') {
  if (props.disabled) return
  const next = selectTablePage(props.selectedKeys, keys, checked)
  const changedKeys = keys.filter((key) => selected.value.has(key) !== checked)
  emit('update:selectedKeys', next)
  emit('selectionChange', { selectedKeys: next, changedKeys, source })
}
function onSelection(
  event: MouseEvent,
  keys: readonly DataTableKey[],
  checked: boolean,
  source: 'row' | 'page',
) {
  const input = event.currentTarget as HTMLInputElement
  selectionRequest(keys, checked, source)
  void nextTick(() => {
    if (!input.isConnected) return
    // Native activation is tentative until the key update is accepted.
    const state =
      source === 'page' ? pageState.value : selected.value.has(keys[0]!) ? 'checked' : 'unchecked'
    input.checked = state === 'checked'
    input.indeterminate = state === 'indeterminate'
  })
}
function onRecover(event: MouseEvent, action: () => void) {
  const document = scroll.value?.ownerDocument
  const target = event.currentTarget as HTMLElement | null
  const owned = target?.contains(document?.activeElement ?? null)
  action()
  void nextTick(() => {
    if (owned && scroll.value?.isConnected && document && document.activeElement === document.body)
      scroll.value.focus()
  })
}
</script>

<template>
  <div class="yam3x-data-table">
    <div
      v-if="$slots.actions"
      class="yam3x-data-table__actions"
    >
      <slot
        name="actions"
        :selected-keys="selectedKeys"
      />
    </div>
    <InlineMessage
      v-if="error && !loading"
      tone="error"
      announcement="assertive"
    >
      {{ error }}
      <template #actions
        ><slot name="error-actions"
          ><Button
            type="button"
            variant="text"
            :disabled="disabled"
            @click="onRecover($event, () => emit('retry'))"
            >{{ messages.retry }}</Button
          ></slot
        ></template
      >
    </InlineMessage>
    <p
      :id="captionId"
      class="yam3x-data-table__caption"
    >
      {{ caption }}
    </p>
    <p
      v-if="sortable"
      :id="sortId"
      class="yam3x-data-table__sr-only"
    >
      {{ messages.sortInstructions }}
    </p>
    <p
      :id="scrollId"
      class="yam3x-data-table__sr-only"
    >
      {{ messages.scroll }}
    </p>
    <div
      ref="scroll"
      class="yam3x-data-table__scroll"
      role="region"
      :aria-labelledby="captionId"
      :aria-describedby="scrollId"
      tabindex="0"
    >
      <table
        class="yam3x-data-table__table"
        :aria-labelledby="captionId"
        :aria-describedby="sortable ? sortId : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :aria-rowcount="numbered ? totalRows! + 1 : undefined"
      >
        <thead>
          <tr :aria-rowindex="numbered ? 1 : undefined">
            <th
              v-if="selectable"
              scope="col"
              class="yam3x-data-table__selection-cell"
            >
              <CheckboxBase
                class="yam3x-data-table__check"
                :label="messages.selectPage"
                :state="pageState"
                :initial-state="pageState"
                :disabled="disabled || !pageKeys.length"
                @click="onSelection($event, pageKeys, pageState !== 'checked', 'page')"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.id"
              scope="col"
              class="yam3x-data-table__header"
              :class="{
                'yam3x-data-table__numeric': column.numeric,
                'yam3x-data-table__header--sortable': column.sortable,
              }"
              :style="{ inlineSize: column.width }"
              :aria-sort="
                sort?.column === column.id && column.sortable ? sort.direction : undefined
              "
            >
              <button
                v-if="column.sortable"
                v-ripple
                type="button"
                class="yam3x-data-table__sort yam3x-state-layer"
                :disabled="disabled"
                :aria-disabled="loading ? 'true' : undefined"
                @click="onSort(column)"
              >
                <span>{{ column.label }}</span
                ><svg
                  viewBox="0 0 24 24"
                  class="yam3x-data-table__sort-icon"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    v-if="sort?.column === column.id && sort.direction === 'ascending'"
                    d="m7 11 5-5 5 5M12 6v12"
                  />
                  <path
                    v-else-if="sort?.column === column.id && sort.direction === 'descending'"
                    d="m7 13 5 5 5-5M12 18V6"
                  />
                  <path
                    v-else
                    d="m8 9 4-4 4 4m-8 6 4 4 4-4"
                  />
                </svg></button
              ><span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in records"
            :key="record.key"
            class="yam3x-data-table__row"
            :class="{ 'yam3x-data-table__row--selected': selected.has(record.key) }"
            :data-row-key="record.key"
            :aria-rowindex="numbered ? record.index + 2 : undefined"
          >
            <td
              v-if="selectable"
              class="yam3x-data-table__selection-cell"
            >
              <CheckboxBase
                class="yam3x-data-table__check"
                :label="messages.selectRow(label(record.row))"
                :state="selected.has(record.key) ? 'checked' : 'unchecked'"
                :initial-state="selected.has(record.key) ? 'checked' : 'unchecked'"
                :disabled="disabled || !canSelectRow(record.row)"
                @click="onSelection($event, [record.key], !selected.has(record.key), 'row')"
              />
            </td>
            <component
              :is="column.rowHeader ? 'th' : 'td'"
              v-for="column in columns"
              :key="column.id"
              :scope="column.rowHeader ? 'row' : undefined"
              class="yam3x-data-table__cell"
              :class="{ 'yam3x-data-table__numeric': column.numeric }"
            >
              <slot
                :name="`cell-${column.id}`"
                :row="record.row"
                :column="column"
                :value="value(record.row, column)"
                :row-index="record.index"
              >
                <div>{{ text(record.row, column) }}</div>
                <div
                  v-if="column.supporting"
                  class="yam3x-data-table__support"
                >
                  {{ column.supporting(record.row) }}
                </div>
              </slot>
            </component>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="!records.length"
      class="yam3x-data-table__state"
    >
      <p v-if="loading">{{ messages.loading }}</p>
      <p v-else-if="error">{{ messages.unavailable }}</p>
      <div v-else-if="!validPage">
        <p>{{ messages.invalidPage }}</p>
        <Button
          type="button"
          variant="text"
          :disabled="disabled"
          @click="onRecover($event, () => onPage({ page: 1, pageSize }))"
          >{{ messages.firstPage }}</Button
        >
      </div>
      <slot
        v-else
        name="empty"
        :kind="emptyKind"
        ><EmptyState
          :title="emptyKind === 'filtered' ? messages.filteredTitle : messages.emptyTitle"
          :description="
            emptyKind === 'filtered' ? messages.filteredDescription : messages.emptyDescription
          "
        >
          <template
            v-if="$slots['empty-actions']"
            #actions
            ><slot
              name="empty-actions"
              :kind="emptyKind"
          /></template> </EmptyState
      ></slot>
    </div>
    <LinearProgressIndicator
      v-if="loading"
      mode="indeterminate"
      :aria-label="records.length ? messages.refreshing : messages.loading"
    />
    <p
      class="yam3x-data-table__support"
      role="status"
      aria-atomic="true"
    >
      {{
        loading
          ? records.length
            ? messages.refreshing
            : messages.loading
          : selectable
            ? messages.selection(selected.size)
            : ''
      }}
    </p>
    <Pagination
      v-if="paginated && validTotal && records.length"
      :total="totalRows!"
      :page="page"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :locale="locale"
      :pending="loading"
      :disabled="disabled || !validPage"
      @change="onPage"
    />
    <div
      v-if="$slots.footer"
      class="yam3x-data-table__footer"
    >
      <slot
        name="footer"
        :total="totalRows"
        :selected-keys="selectedKeys"
      />
    </div>
  </div>
</template>

<style scoped>
.yam3x-data-table {
  --_yam3x-data-table-min-width: var(--yam3x-data-table-min-width, 40rem);
  --_yam3x-data-table-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-data-table-inline-padding: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-data-table-block-padding: calc(12px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-data-table-height: calc(56px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-data-table-color: var(--md-sys-color-on-surface);
  --_yam3x-data-table-surface: var(--md-sys-color-surface);
  --_yam3x-data-table-header: var(--md-sys-color-surface-container-low);
  --_yam3x-data-table-outline: var(--md-sys-color-outline-variant);
  --_yam3x-data-table-support: var(--md-sys-color-on-surface-variant);
  --_yam3x-data-table-selected: var(--md-sys-color-secondary-container);
  --_yam3x-data-table-on-selected: var(--md-sys-color-on-secondary-container);
  --_yam3x-data-table-hover: var(--md-sys-state-hover-opacity);
  --_yam3x-data-table-caption-font: var(--md-sys-typescale-title-medium-font-family);
  --_yam3x-data-table-caption-size: var(--md-sys-typescale-title-medium-font-size);
  --_yam3x-data-table-caption-weight: var(--md-sys-typescale-title-medium-font-weight);
  --_yam3x-data-table-caption-height: var(--md-sys-typescale-title-medium-line-height);
  --_yam3x-data-table-caption-tracking: var(--md-sys-typescale-title-medium-tracking);
  --_yam3x-data-table-header-font: var(--md-sys-typescale-title-small-font-family);
  --_yam3x-data-table-header-size: var(--md-sys-typescale-title-small-font-size);
  --_yam3x-data-table-header-weight: var(--md-sys-typescale-title-small-font-weight);
  --_yam3x-data-table-header-height: var(--md-sys-typescale-title-small-line-height);
  --_yam3x-data-table-header-tracking: var(--md-sys-typescale-title-small-tracking);
  --_yam3x-data-table-body-font: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-data-table-body-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-data-table-body-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-data-table-body-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-data-table-body-tracking: var(--md-sys-typescale-body-medium-tracking);
  --_yam3x-data-table-support-font: var(--md-sys-typescale-body-small-font-family);
  --_yam3x-data-table-support-size: var(--md-sys-typescale-body-small-font-size);
  --_yam3x-data-table-support-weight: var(--md-sys-typescale-body-small-font-weight);
  --_yam3x-data-table-support-height: var(--md-sys-typescale-body-small-line-height);
  --_yam3x-data-table-support-tracking: var(--md-sys-typescale-body-small-tracking);
  display: grid;
  gap: var(--_yam3x-data-table-gap);
  min-inline-size: 0;
  color: var(--_yam3x-data-table-color);
}
.yam3x-data-table__scroll {
  max-inline-size: 100%;
  overflow-x: auto;
}
.yam3x-data-table__table {
  display: table;
  inline-size: 100%;
  min-inline-size: var(--_yam3x-data-table-min-width);
  margin: 0;
  border: 0;
  border-spacing: 0;
  border-collapse: collapse;
  font: inherit;
  background: var(--_yam3x-data-table-surface);
  text-align: start;
}
.yam3x-data-table__caption {
  margin: 0;
  overflow-wrap: anywhere;
  text-align: start;
  color: var(--_yam3x-data-table-color);
}
.yam3x-data-table__table th,
.yam3x-data-table__table td {
  border: 0;
  border-block-end: 1px solid var(--_yam3x-data-table-outline);
  text-align: start;
}
.yam3x-data-table__header,
.yam3x-data-table__selection-cell {
  background: var(--_yam3x-data-table-header);
}
.yam3x-data-table__header,
.yam3x-data-table__cell,
.yam3x-data-table__selection-cell {
  padding: var(--_yam3x-data-table-block-padding) var(--_yam3x-data-table-inline-padding);
  block-size: var(--_yam3x-data-table-height);
  vertical-align: middle;
  overflow-wrap: anywhere;
}
.yam3x-data-table__table tbody .yam3x-data-table__selection-cell {
  background: transparent;
}
.yam3x-data-table__header--sortable {
  padding: 0;
}
.yam3x-data-table__sort {
  display: flex;
  align-items: center;
  gap: 8px;
  inline-size: 100%;
  min-block-size: max(48px, var(--_yam3x-data-table-height));
  border: 0;
  background: transparent;
  color: inherit;
  padding: var(--_yam3x-data-table-block-padding) var(--_yam3x-data-table-inline-padding);
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  cursor: pointer;
}
.yam3x-data-table__sort:focus-visible {
  outline-offset: -3px;
}
.yam3x-data-table__sort:disabled,
.yam3x-data-table__sort[aria-disabled='true'] {
  cursor: default;
}
.yam3x-data-table__sort-icon {
  flex: 0 0 20px;
  inline-size: 20px;
  block-size: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.yam3x-data-table__selection-cell {
  inline-size: 80px;
}
.yam3x-data-table__check :deep(.yam3x-checkbox__label-text),
.yam3x-data-table__sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.yam3x-data-table__cell {
  font-weight: var(--_yam3x-data-table-body-weight);
  color: inherit;
  background: transparent;
}
.yam3x-data-table__table tr {
  border: 0;
}
.yam3x-data-table__table .yam3x-data-table__row {
  --_yam3x-data-table-row-support: var(--_yam3x-data-table-support);
  color: var(--_yam3x-data-table-color);
  background: var(--_yam3x-data-table-surface);
}
.yam3x-data-table__table .yam3x-data-table__row--selected {
  --_yam3x-data-table-row-support: var(--_yam3x-data-table-on-selected);
  color: var(--_yam3x-data-table-on-selected);
  background: var(--_yam3x-data-table-selected);
}
.yam3x-data-table__row .yam3x-data-table__support {
  color: var(--_yam3x-data-table-row-support);
}
.yam3x-data-table__table .yam3x-data-table__numeric {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
.yam3x-data-table__numeric .yam3x-data-table__sort {
  justify-content: end;
}
.yam3x-data-table__state {
  padding: var(--_yam3x-data-table-gap);
}
.yam3x-data-table__state p,
.yam3x-data-table__support {
  margin: 0;
}
.yam3x-data-table__support {
  color: var(--_yam3x-data-table-support);
}
.yam3x-data-table__actions,
.yam3x-data-table__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--_yam3x-data-table-gap);
  min-inline-size: 0;
}
.yam3x-data-table[hidden] {
  display: none;
}
@media (hover: hover) and (pointer: fine) {
  .yam3x-data-table__row:hover {
    background-image: linear-gradient(
      color-mix(in srgb, currentColor calc(var(--_yam3x-data-table-hover) * 100%), transparent),
      color-mix(in srgb, currentColor calc(var(--_yam3x-data-table-hover) * 100%), transparent)
    );
  }
}
@media (forced-colors: active) {
  .yam3x-data-table__table th,
  .yam3x-data-table__table td {
    border-color: CanvasText;
  }
  .yam3x-data-table__row--selected {
    outline: 1px solid Highlight;
    outline-offset: -1px;
  }
}
.yam3x-data-table__caption {
  font-family: var(--_yam3x-data-table-caption-font);
  font-size: var(--_yam3x-data-table-caption-size);
  font-weight: var(--_yam3x-data-table-caption-weight);
  line-height: var(--_yam3x-data-table-caption-height);
  letter-spacing: var(--_yam3x-data-table-caption-tracking);
}
.yam3x-data-table__header {
  font-family: var(--_yam3x-data-table-header-font);
  font-size: var(--_yam3x-data-table-header-size);
  font-weight: var(--_yam3x-data-table-header-weight);
  line-height: var(--_yam3x-data-table-header-height);
  letter-spacing: var(--_yam3x-data-table-header-tracking);
}
.yam3x-data-table,
.yam3x-data-table__cell {
  font-family: var(--_yam3x-data-table-body-font);
  font-size: var(--_yam3x-data-table-body-size);
  font-weight: var(--_yam3x-data-table-body-weight);
  line-height: var(--_yam3x-data-table-body-height);
  letter-spacing: var(--_yam3x-data-table-body-tracking);
}
.yam3x-data-table__support {
  font-family: var(--_yam3x-data-table-support-font);
  font-size: var(--_yam3x-data-table-support-size);
  font-weight: var(--_yam3x-data-table-support-weight);
  line-height: var(--_yam3x-data-table-support-height);
  letter-spacing: var(--_yam3x-data-table-support-tracking);
}
</style>
