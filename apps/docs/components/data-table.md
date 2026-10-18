<script setup lang="ts">
import DataTableExample from './demos/DataTableExample.vue'
</script>

# Data table

`DataTable` is a project extension for comparing records with column filtering, sorting, selection, and optional pagination. It uses a native HTML table with independent controls. Material 3 Expressive supplies the adopted type, color, and control treatments; the table's own geometry and behavior are project decisions.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><DataTableExample /></div>

::: details View demo source

<<< ./demos/DataTableExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  DataTable,
  type DataTableColumn,
  type DataTableKey,
  type DataTableFilters,
  type DataTableSort,
} from './components/yam3x/data-table'
interface Project {
  id: string
  name: string
  budget: number
}
const rows: Project[] = [
  { id: 'atlas', name: 'Atlas', budget: 1250 },
  { id: 'beacon', name: 'Beacon', budget: 340 },
]
const columns: DataTableColumn<Project>[] = [
  { id: 'name', label: 'Project', value: (row) => row.name, rowHeader: true, sortable: true },
  {
    id: 'budget',
    label: 'Budget',
    value: (row) => row.budget,
    numeric: true,
    sortable: true,
    filter: {
      options: [
        { value: 1250, label: '1,250' },
        { value: 340, label: '340' },
      ],
    },
  },
]
const sort = ref<DataTableSort | null>(null)
const filters = ref<DataTableFilters>({})
const page = ref(1)
const pageSize = ref(10)
const selected = ref<DataTableKey[]>([])
</script>

<template>
  <DataTable
    v-model:sort="sort"
    v-model:filters="filters"
    v-model:page="page"
    v-model:page-size="pageSize"
    v-model:selected-keys="selected"
    caption="Project budgets"
    :columns="columns"
    :rows="rows"
    :row-key="(row) => row.id"
    selectable
    paginated
  />
</template>
```

Query and selection props describe accepted state. Bind the models as above to accept local requests immediately. Without accepting an emitted update, the table keeps its previous order, page, and selection. It does not keep a second internal selection or query cache.

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.

| Prop               | Default                                | Use                                                                                                   |
| ------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `caption`          | Required                               | Visible Title Medium title associated with the table and scroll region.                               |
| `columns`          | Required                               | Non-empty array of `DataTableColumn<T>` with unique IDs.                                              |
| `rows`             | Required                               | Complete client collection, or an accepted server page.                                               |
| `rowKey`           | Required                               | `(row) => string \| number`; unique, stable across sorting and pages.                                 |
| `rowLabel`         | Row-header/first-column text, then key | Accessible row-selection name.                                                                        |
| `mode`             | `client`                               | `client` filters, sorts, and pages locally; `server` renders the supplied rows unchanged.             |
| `sort`             | `null`                                 | `{ column, direction: 'ascending' \| 'descending' }` or null.                                         |
| `filters`          | Undefined                              | Accepted `DataTableFilters`: column IDs mapped to readonly arrays of string/number option keys.       |
| `selectable`       | `false`                                | Shows row checkboxes and the current-page select-all control.                                         |
| `selectedKeys`     | `[]`                                   | Accepted keys, including keys from other pages.                                                       |
| `isRowSelectable`  | All rows                               | `(row) => boolean`; false disables selection without removing a retained key.                         |
| `paginated`        | `false`                                | Composes the project's Pagination control when the accepted page has records.                         |
| `page`, `pageSize` | `1`, `10`                              | Accepted page and size. Sort and filter requests return to page one.                                  |
| `pageSizes`        | `[]`                                   | Optional page-size choices.                                                                           |
| `total`            | Filtered client row count              | Required known result count for paginated server mode; ignored in client mode.                        |
| `loading`          | `false`                                | Group progress, status, and busy table; pauses sort/filter/page requests while keeping existing rows. |
| `error`            | Empty                                  | Application-owned failure text with a retry action.                                                   |
| `emptyKind`        | `empty`                                | `empty` for an empty collection, `filtered` for no matches.                                           |
| `disabled`         | `false`                                | Disables built-in query, selection, and recovery controls.                                            |
| `locale`           | Provider → `en-US`                     | Built-in English/Chinese text and local text comparison.                                              |
| `messages`         | Built-in text                          | Partial `DataTableMessages` for state text, selection names, and instructions.                        |

Columns have `id`, `label`, and optional `value(row)`, `format(value, row)`, `supporting(row)`, `sortable`, `compare(leftRow, rightRow)`, `numeric`, `rowHeader`, and CSS `width`. A value is text, a number, a boolean, a Date, null, or undefined. Formatters own domain-specific currency and date display; default text is `String(value)` with blank nullish values. `supporting` adds Body Small text. `numeric` end-aligns cells and uses tabular figures. `rowHeader` renders native row-header cells. Width is a layout hint rather than a truncation policy.

Sortable columns cycle ascending, descending, then supplied order. Local comparison handles numbers, Dates, booleans, and locale-aware natural text, keeping empty/invalid values last in either direction and ties in supplied order. Use a consistent value type per column or provide `compare` for domain-specific rules. A custom comparator owns missing-value policy. All client rows are sorted before paging; the input array is not mutated. Client column filters run before sorting and paging; application-owned search can also reduce the supplied collection. Reset `page` when external search changes. An out-of-range page offers a first-page request.

Events: `update:sort`, `update:page`, and `update:pageSize` propose query changes; `change({ sort, page, pageSize })` reports one complete requested query. `update:selectedKeys(keys)` proposes a complete key set. `selectionChange({ selectedKeys, changedKeys, source })` identifies the affected keys and `source: 'row' \| 'page'`. `retry()` asks the application to repeat its failed query. Handle retry or provide `#error-actions` with another recovery path.

### Column filters

Set a column's `filter: { options, matches? }` to show a separate filter menu. Each `DataTableFilterOption` has a unique `value: string | number`, `label`, and optional `disabled`; keys remain stable when labels change language. The default comparison is `Object.is(column.value(row), optionValue)`. Provide `matches(row, optionValue)` for ranges, booleans, dates, or other domain rules. Selected values within a column combine with OR; active columns combine with AND. Empty arrays and columns without a filter add no constraint. Applications reconcile stale keys when options or columns change; unknown retained option keys still reach `matches`.

The menu edits a draft. Apply proposes the draft, Clear proposes removing that column's condition, and Escape or outside dismissal discards edits. Other accepted filters, sorting, and selection keys are retained; filter requests return to page one. The trigger reports only the accepted selection count. Local zero-match results use the filtered empty state automatically when the supplied collection is nonempty; use `emptyKind` for external/server filtering.

`update:filters(filters)` proposes the complete filter map. `DataTableQuery` and `change` include optional `filters` after a filter request or when the `filters` prop is supplied; otherwise their previous shape is preserved. Sort and page requests carry accepted filters. Filter application and page reset form one `change` request, even though model updates are separate events.

### Slots

`#cell-ID="{ row, column, value, rowIndex }"` replaces one column's cells, such as `#cell-actions` for independently named row buttons. Other columns keep their default formatting. `rowIndex` is zero-based within the accepted result order, including the page offset. Custom cell content should preserve readable names and the selected row's inherited foreground.

`#actions="{ selectedKeys }"` precedes the title. `#empty="{ kind }"` replaces the empty presentation; `#empty-actions="{ kind }"` adds actions to the default Empty state. `#error-actions` replaces the default retry button. `#footer="{ total, selectedKeys }"` follows pagination; total can be unknown without server pagination. Custom actions own their labels, behavior, and focus outcomes.

## Behavior and accessibility

Sorting semantics follow the [WAI sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).

### Server results and selection

In server mode, pass accepted `sort`, `filters`, `page`, `pageSize`, `rows`, and `total` as plain props and handle `change`. Keep the proposed query separately while loading. On success, replace the accepted query and rows together; on failure, retain them and set `error`. The demo shows this flow. The application owns transport, timeouts, stale-response rejection, and cancellation. Binding query models directly would accept the proposal before its response, so use that only when immediate acceptance is intended.

Page select-all changes only selectable visible rows. It preserves other-page and non-selectable keys and never implies selection of all server results. The application owns cross-page policy, pruning deleted records, and bulk operations. Clear keys explicitly when a new filter should establish a different selection scope. Row selection remains available for the accepted records during refresh. Cells and rows do not become grid focus targets or whole-row click actions. Selection controls are unnamed and do not submit form values; native form reset preserves the accepted key set. Reset `selectedKeys` in the application when needed.

Column headers stay present during loading, failure, and empty states. Initial loading is not an empty result; refresh retains existing rows and uses one indeterminate group indicator. Failed requests use Inline message with recovery. Empty collections and no filter matches have distinct text. The sorted header exposes `aria-sort`; sortable controls are native buttons with full labels and distinct direction shapes. Paginated data rows expose their positions and known total, including the header row.

The titled scroll region is keyboard-focusable and contains horizontal overflow. Essential columns and complete cell values remain available; there is no hover-only detail path. A disappearing built-in recovery action returns focus to that region when it still owns focus. Sort controls retain focus while a request is pending. Background changes do not pull focus from unrelated content.

## Styling

Project styling uses a Surface body, Surface Container Low header, Outline Variant separators, and Secondary Container/On Secondary Container selected rows. Titles use Title Medium, column headings Title Small, cells Body Medium, and supporting text Body Small. Cells have 16 px inline and 12 px block padding, with a 56 px row minimum that grows for controls and wrapped content. Selection, hover, and focus remain separate treatments.

The documented `--yam3x-data-table-min-width` override defaults to `40rem`; adjust it for your columns, for example `100%` for a compact two-column table. The title and surrounding actions wrap to the available region rather than scrolling with the columns.

## Material references

[Menus guidelines](https://m3.material.io/components/menus/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
