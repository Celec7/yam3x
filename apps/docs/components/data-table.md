<script setup lang="ts">
import DataTableBasicExample from './demos/DataTableBasicExample.vue'
import DataTableExample from './demos/DataTableExample.vue'
import DataTableLayoutExample from './demos/DataTableLayoutExample.vue'
import DataTableServerExample from './demos/DataTableServerExample.vue'
</script>

# Data table

`DataTable` is a project extension for comparing records with column filtering, sorting, selection, and optional pagination. It keeps native HTML table semantics and composes the project's Button, Checkbox, Menu, Empty state, Inline message, and Pagination components.

Material 3 Expressive supplies the adopted type, color, and control treatments; the table's own geometry and behavior are project decisions.

Use it when readers compare values across many records; prefer [List](/components/list) or [Descriptions](/components/descriptions) when each record is read on its own. Define the records to compare and let `columns` own labels, values, formatting, and filters.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><DataTableBasicExample /></div>

`caption`, `columns`, `rows`, and `row-key` are required. `format` owns currency and date display, `supporting` adds Body Small text, and `numeric` end-aligns cells with tabular figures. A basic table needs no models: it renders the supplied order.

::: details View demo source

<<< ./demos/DataTableBasicExample.vue{vue}

:::

### Query and selection

<div class="vp-raw yam3x-doc-demo-theme"><DataTableExample /></div>

The query demo filters, sorts, selects, and pages a local collection. The tools make the empty collection, a rejected selection request, and the disabled state observable, and the accepted keys are printed below the table.

::: details View demo source

<<< ./demos/DataTableExample.vue{vue}

:::

### Server results

<div class="vp-raw yam3x-doc-demo-theme"><DataTableServerExample /></div>

In server mode the table renders the supplied page unchanged. The demo requests a result, then accepts or fails it, so the retained rows, sort, and page remain observable.

::: details View demo source

<<< ./demos/DataTableServerExample.vue{vue}

:::

### Fixed header and columns

<div class="vp-raw yam3x-doc-demo-theme"><DataTableLayoutExample /></div>

The layout demo bounds the scroll region with `max-height="16rem"`, keeps its header at the block start, and fixes columns at the logical start and end. The RTL control mirrors both edges, and the footer slot reports the total and the accepted selection.

::: details View demo source

<<< ./demos/DataTableLayoutExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { DataTable, type DataTableColumn } from './components/yam3x/data-table'

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
  { id: 'name', label: 'Project', value: (row) => row.name, rowHeader: true },
  {
    id: 'budget',
    label: 'Budget',
    value: (row) => row.budget,
    numeric: true,
    format: (value) => `$${value}`,
  },
]
</script>

<template>
  <DataTable
    caption="Project budgets"
    :columns="columns"
    :rows="rows"
    :row-key="(row) => row.id"
  />
</template>
```

::: details Bind query models

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

:::

Query and selection props describe accepted state. Binding the models as above accepts local requests immediately. Without accepting an emitted update, the table keeps its previous order, page, and selection; it keeps no second internal selection or query cache.

::: details Server mode

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { DataTable, type DataTableColumn, type DataTableQuery } from './components/yam3x/data-table'

interface Project {
  id: string
  name: string
  budget: number
}

const columns: DataTableColumn<Project>[] = [
  { id: 'name', label: 'Project', value: (row) => row.name, rowHeader: true, sortable: true },
  { id: 'budget', label: 'Budget', value: (row) => row.budget, numeric: true, sortable: true },
]
const rows = shallowRef<Project[]>([])
const total = ref(0)
const error = ref('')
const loading = ref(false)
const accepted = ref<DataTableQuery>({ sort: null, page: 1, pageSize: 10 })

async function onChange(query: DataTableQuery) {
  loading.value = true
  error.value = ''
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    ...(query.sort ? { sort: query.sort.column, direction: query.sort.direction } : {}),
  })
  try {
    const response = await fetch(`/api/projects?${params}`)
    if (!response.ok) throw new Error(String(response.status))
    const page = (await response.json()) as { rows: Project[]; total: number }
    accepted.value = query
    rows.value = page.rows
    total.value = page.total
  } catch {
    error.value = 'Records could not be loaded. Retry to request them again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DataTable
    mode="server"
    caption="Accepted server results"
    :columns="columns"
    :rows="rows"
    :row-key="(row) => row.id"
    :sort="accepted.sort"
    :page="accepted.page"
    :page-size="accepted.pageSize"
    :total="total"
    :loading="loading"
    :error="error"
    paginated
    @change="onChange"
    @retry="onChange(accepted)"
  />
</template>
```

:::

## Behavior and accessibility

Sorting semantics follow the [WAI sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).

### Sorting and paging

- Sortable columns cycle ascending, descending, then the supplied order.
- Local comparison handles numbers, Dates, booleans, and locale-aware natural text, keeping empty or invalid values last in either direction and ties in the supplied order.
- Use one value type per column, or provide `compare` for domain-specific rules. A custom comparator owns its missing-value policy.
- All client rows are sorted before paging, and the input array is not mutated.
- Client column filters run before sorting and paging. Application-owned search can also reduce the supplied collection; reset `page` when that search changes.
- An out-of-range page offers a first-page request.
- Paginated data rows expose their positions and the known total, including the header row.
- The sorted header exposes `aria-sort`; sorting uses compact text Buttons with rounded hover feedback, a separate focus ring, and distinct direction shapes. The state layer follows the action rather than the full header cell.

### Selection

- Page select-all changes only selectable visible rows. It preserves other-page and non-selectable keys and never implies selection of all server results.
- The application owns cross-page policy, pruning deleted records, and bulk operations. Clear keys explicitly when a new filter should establish a different selection scope.
- Row selection stays available for the accepted records during a refresh.
- Cells and rows are not grid focus targets and are not whole-row click actions.
- Selection controls are unnamed and do not submit form values; native form reset preserves the accepted key set. Reset `selectedKeys` in the application when needed.

### Loading, empty, and error states

- Column headers stay present during loading, failure, and empty states.
- Initial loading is not an empty result. A refresh keeps existing rows and uses one indeterminate group indicator.
- Failed requests use Inline message with recovery. Empty collections and no filter matches have distinct text.
- A disappearing built-in recovery action returns focus to the labeled scroll region when that region still owns focus.
- Sort controls retain focus while a request is pending, and background changes do not pull focus from unrelated content.

### Keyboard and focus

- The titled scroll region is keyboard-focusable and contains the horizontal overflow, so essential columns and complete cell values stay reachable without a hover-only detail path.
- Sort buttons and filter triggers are tab stops inside the header; column headers themselves are not focusable.
- Escape or outside dismissal discards filter edits and returns focus to the trigger.

### Responsive and RTL

- `sticky-header` keeps the header inside the table's own scroll region; it does not attach the header to the page viewport.
- Below `--yam3x-data-table-min-width` the scroll region takes the horizontal overflow; the title and surrounding actions wrap instead of scrolling with the columns.
- Fixed start columns are arranged first and fixed end columns last in source order. RTL mirrors both edges, and selection stays at the start whenever a start column is fixed.
- Column `width` is a layout hint, not a truncation policy. Long cell values wrap and stay available.
- If the combined fixed width would fill the scroll region, inline fixation releases and every column remains reachable by scrolling; header fixation remains enabled.

### State ownership

The table is fully controlled: it renders accepted state and proposes changes rather than storing its own query or selection. In server mode, pass accepted `sort`, `filters`, `page`, `pageSize`, `rows`, and `total` as plain props and handle `change`; keep the proposed query separately while loading, replace the accepted query and rows together on success, and retain them with `error` on failure. The application owns transport, timeouts, stale-response rejection, and cancellation. Binding query models directly accepts a proposal before its response, so use that only when immediate acceptance is intended.

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                  | Kind      | Use                                                                     |
| ----------------------- | --------- | ----------------------------------------------------------------------- |
| `DataTable`             | Component | Renders the table, query controls, selection, and pagination.           |
| `DataTableColumn`       | Type      | Declares a column, its value accessor, formatting, and filter.          |
| `DataTableCell`         | Type      | Cell slot scope: row, column, value, and row index.                     |
| `DataTableColumnFilter` | Type      | Column filter options and optional custom matching.                     |
| `DataTableFilterOption` | Type      | One stable filter key with its visible label.                           |
| `DataTableFilters`      | Type      | Accepted column IDs mapped to selected filter keys.                     |
| `DataTableKey`          | Type      | Stable string or number row identity.                                   |
| `DataTableMessages`     | Type      | Partial built-in text overrides.                                        |
| `DataTableQuery`        | Type      | Complete sort, filter, page, and page-size request.                     |
| `DataTableSelection`    | Type      | Selected, changed, and source keys for a selection event.               |
| `DataTableSort`         | Type      | Sort column and ascending/descending direction.                         |
| `DataTableValue`        | Type      | Comparable cell value: text, number, boolean, Date, null, or undefined. |

### Props and models

| Prop and model     | Default                                | Use                                                                                                |
| ------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `caption`          | Required                               | Visible Title Medium title associated with the table and scroll region.                            |
| `columns`          | Required                               | Non-empty array of `DataTableColumn<T>` with unique IDs.                                           |
| `rows`             | Required                               | Complete client collection, or an accepted server page.                                            |
| `rowKey`           | Required                               | `(row) => string \| number`; unique, stable across sorting and pages.                              |
| `rowLabel`         | Row-header/first-column text, then key | Accessible row-selection name.                                                                     |
| `mode`             | `client`                               | `client` filters, sorts, and pages locally; `server` renders the supplied rows unchanged.          |
| `sort`             | `null`                                 | `{ column, direction: 'ascending' \| 'descending' }` or null.                                      |
| `filters`          | Undefined                              | Accepted `DataTableFilters`: column IDs mapped to readonly arrays of string/number option keys.    |
| `stickyHeader`     | `false`                                | Keeps column headers at the block start of the table's own scroll region.                          |
| `maxHeight`        | Undefined                              | CSS maximum block size for that region, such as `24rem`; enables vertical scrolling when needed.   |
| `selectable`       | `false`                                | Shows row checkboxes and the current-page select-all control.                                      |
| `selectedKeys`     | `[]`                                   | Accepted keys, including keys from other pages.                                                    |
| `isRowSelectable`  | All rows                               | `(row) => boolean`; false disables selection without removing a retained key.                      |
| `paginated`        | `false`                                | Composes the project's Pagination control when the accepted page has records.                      |
| `page`, `pageSize` | `1`, `10`                              | Accepted page and size. Sort and filter requests return to page one.                               |
| `pageSizes`        | `[]`                                   | Optional page-size choices.                                                                        |
| `total`            | Filtered client row count              | Required known result count for paginated server mode; ignored in client mode.                     |
| `loading`          | `false`                                | Group progress, status, and busy table; pauses sort, filter, and page requests while keeping rows. |
| `error`            | Empty                                  | Application-owned failure text with a retry action.                                                |
| `emptyKind`        | `empty`                                | `empty` for an empty collection, `filtered` for no matches.                                        |
| `disabled`         | `false`                                | Disables built-in query, selection, and recovery controls.                                         |
| `locale`           | Provider → `en-US`                     | Built-in English/Chinese text and local text comparison.                                           |
| `messages`         | Built-in text                          | Partial `DataTableMessages` for state text, selection names, and instructions.                     |

### Columns

| Field        | Type                            | Use                                                          |
| ------------ | ------------------------------- | ------------------------------------------------------------ |
| `id`         | `string`                        | Unique column ID, also used by filters and `#cell-ID`.       |
| `label`      | `string`                        | Static header text.                                          |
| `value`      | `(row) => DataTableValue`       | Cell value: text, number, boolean, Date, null, or undefined. |
| `format`     | `(value, row) => string`        | Display text; own domain-specific currency and date formats. |
| `supporting` | `(row) => string`               | Body Small supporting text under the cell value.             |
| `sortable`   | `boolean`                       | Cycles ascending, descending, then supplied order.           |
| `compare`    | `(leftRow, rightRow) => number` | Domain-specific ordering, replacing the local comparison.    |
| `numeric`    | `boolean`                       | End-aligns cells and uses tabular figures.                   |
| `rowHeader`  | `boolean`                       | Renders native row-header cells.                             |
| `filter`     | `DataTableColumnFilter<T>`      | Separate filter menu for the column.                         |
| `fixed`      | `'start' \| 'end'`              | Fixes the column to the logical edge of the scroll region.   |
| `width`      | `string`                        | CSS width hint for layout, not a truncation policy.          |

Default text is `String(value)` with blank nullish values.

### Column filters

Set a column's `filter: { options, matches? }` to show a separate filter menu. Each `DataTableFilterOption` has a unique `value: string | number`, a `label`, and optional `disabled`; keys stay stable when labels change language.

::: details Comparison, drafts, and request behavior

The default comparison is `Object.is(column.value(row), optionValue)`. Provide `matches(row, optionValue)` for ranges, booleans, dates, or other domain rules. Selected values within a column combine with OR; active columns combine with AND. Empty arrays and columns without a filter add no constraint. Applications reconcile stale keys when options or columns change; unknown retained option keys still reach `matches`.

The menu edits a draft. Apply proposes the draft, Clear proposes removing that column's condition, and Escape or outside dismissal discards edits. Other accepted filters, sorting, and selection keys are retained; filter requests return to page one. The trigger reports only the accepted selection count. Local zero-match results use the filtered empty state automatically when the supplied collection is nonempty; use `emptyKind` for external or server filtering.

Sort and page requests carry accepted filters. Filter application and page reset form one `change` request, even though model updates are separate events.

:::

### Events

| Event and model       | Payload                 | Use                                                                     |
| --------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `update:sort`         | `DataTableSort \| null` | Proposes a sort change.                                                 |
| `update:page`         | `number`                | Proposes a page change.                                                 |
| `update:pageSize`     | `number`                | Proposes a page-size change.                                            |
| `update:filters`      | `DataTableFilters`      | Proposes the complete filter map.                                       |
| `change`              | `DataTableQuery`        | One complete requested query with `sort`, `page`, and `pageSize`.       |
| `update:selectedKeys` | `DataTableKey[]`        | Proposes a complete key set.                                            |
| `selectionChange`     | `DataTableSelection`    | `{ selectedKeys, changedKeys, source }` with `source: 'row' \| 'page'`. |
| `retry`               | —                       | Asks the application to repeat its failed query.                        |

The `change` query includes `filters` for a filter request or when the `filters` prop is supplied; otherwise it omits that property.

### Slots

| Slot            | Scope                              | Use                                                                   |
| --------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `actions`       | `{ selectedKeys }`                 | Precedes the title.                                                   |
| `cell-ID`       | `{ row, column, value, rowIndex }` | Replaces one column's cells, such as `#cell-actions` for row buttons. |
| `empty`         | `{ kind }`                         | Replaces the empty presentation.                                      |
| `empty-actions` | `{ kind }`                         | Adds actions to the default Empty state.                              |
| `error-actions` | —                                  | Replaces the default retry button.                                    |
| `footer`        | `{ total, selectedKeys }`          | Follows pagination; total can be unknown without server pagination.   |

Other columns keep their default formatting in `cell-ID`. `rowIndex` is zero-based within the accepted result order, including the page offset. Custom cell content should preserve readable names and the selected row's inherited foreground. Custom actions own their labels, behavior, and focus outcomes.

### Methods

`DataTable` exposes no instance methods. Recovery is the `retry` event: handle it, or provide `#error-actions` with another recovery path.

## Styling

Project styling uses a Surface body, Surface Container Low header, Outline Variant separators, and Secondary Container/On Secondary Container selected rows. Titles use Title Medium, static column headings Title Small, sorting actions the adopted text Button roles, cells Body Medium, and supporting text Body Small. Cells have 16 px inline and 12 px block padding, with a 56 px row minimum that grows for controls and wrapped content. Selection, hover, and focus remain separate treatments.

::: details Overrides and measured geometry

The documented `--yam3x-data-table-min-width` override defaults to `40rem`; adjust it for your columns, for example `100%` for a compact two-column table. The title and surrounding actions wrap to the available region rather than scrolling with the columns.

A selectable leading column is sized from the shared touch-target token plus both inline paddings, so it keeps a 48 px control target and narrows with density. Filterable headers use an 8 px trailing inset from the shared spacing token, and sort direction icons are 20 px. Fixed cells inherit the header or selected/hovered row surface, and there is only one set of interactive controls. Fixed-column offsets are measured from rendered header cells, not separate fixed values, and they update after resizing or content changes.

:::

## Material references

[Buttons specs](https://m3.material.io/components/buttons/specs) · [Menus guidelines](https://m3.material.io/components/menus/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
