<script setup lang="ts">
import PaginationBasicExample from './demos/PaginationBasicExample.vue'
import PaginationExample from './demos/PaginationExample.vue'
</script>

# Pagination

`Pagination` is a project extension for collections with a known result count. Material 3 Expressive does not define a standalone pagination component, and Compose Material 3 has no pagination primitive; the closest composition is a row of Material `Button` and `IconButton` controls. This component adds page-window logic, a page-size selector, a range summary, and an adaptive compact presentation.

Use it with a table, list, or result grid when the application knows the total number of records. It does not fetch data, keep a result cache, or invent a page count for cursor-only services. For unknown or append-only collections, use a load-more action instead.

## Examples

### Basic

The basic example binds both models to local state. It shows the range summary, page buttons with ellipses, the previous and next controls, and a page-size selector.

<div class="vp-raw yam3x-doc-demo-theme"><PaginationBasicExample /></div>

::: details View demo source

<<< ./demos/PaginationBasicExample.vue{vue}

:::

### Accepted, pending, and failed requests

The interactive demo separates local navigation from a server-style result region. Request a page, then accept or fail it: the accepted marker follows the displayed result, pending state keeps the previous page identifiable, and a failure leaves the previous results available with recovery text. A zero-result paginator is shown last.

<div class="vp-raw yam3x-doc-demo-theme"><PaginationExample /></div>

::: details View demo source

<<< ./demos/PaginationExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Pagination, type PaginationChange } from './components/yam3x/pagination'

const page = ref(1)
const pageSize = ref(10)

function onChange(next: PaginationChange) {
  page.value = next.page
  pageSize.value = next.pageSize
}
</script>

<template>
  <Pagination
    :page="page"
    :page-size="pageSize"
    :total="200"
    :page-sizes="[10, 25, 50]"
    @change="onChange"
  />
</template>
```

`change({ page, pageSize }, event?)` reports a request without changing the accepted props. `v-model:page` and `v-model:page-size` accept local requests immediately. For asynchronous results, pass the accepted values, set `pending` while loading, and replace both values and records only after success. Keep the displayed records and current-page marker on failure, and put recovery feedback in the result region.

::: details Native links and a custom summary

```vue
<script setup lang="ts">
import { Pagination, type PaginationChange } from './components/yam3x/pagination'

const href = (page: number, pageSize: number) => `/results?page=${page}&size=${pageSize}`

function onChange(next: PaginationChange, event?: MouseEvent) {
  event?.preventDefault()
  // router.push(href(next.page, next.pageSize))
}
</script>

<template>
  <Pagination
    :page="1"
    :page-size="20"
    :total="480"
    :href="href"
    @change="onChange"
  >
    <template #summary="{ start, end, total }">
      {{ start }}–{{ end }} of {{ total }} results
    </template>
  </Pagination>
</template>
```

:::

With `href`, ordinary clicks keep native link navigation; the second `change` argument lets client-side routing call `preventDefault()`. Modified clicks remain native and do not request the current view. Without `href`, navigation uses buttons.

## Behavior and accessibility

### Page window and boundaries

- The page window always includes the first page, the last page, the current page, and its adjacent pages. A gap of one page is filled; larger gaps become a non-interactive ellipsis.
- Ellipses are not controls. The current page uses `aria-current="page"` and does not expose pressed-toggle semantics.
- Previous is disabled on the first page and next on the last. A request for the displayed page does nothing.
- Changing page size requests the page that contains the previous first visible record. Requests clamp to the last valid page.
- Zero results show a zero range with no numbered actions. A single page omits redundant navigation and keeps the summary.
- If the total shrinks below the accepted page, the component emits no automatic request, shows no invented current marker, and disables navigation until the application supplies a valid page.

### Adaptive presentation

- The component measures its own width. When the numbered window, previous, and next controls no longer fit, the numbered choices are hidden from layout, focus, and assistive technology.
- Compact mode keeps previous and next around a visible current/total summary. The accepted page survives the presentation change.
- The page-size selector and range summary wrap in a secondary group; they never squeeze the primary navigation below its touch targets.
- Page targets reserve the shared touch-target size, and gaps use the shared 8 px spacing token without compressing below it.

### Focus and pending state

- When compact mode replaces the focused current page, focus moves to the equivalent summary; returning to the full presentation restores focus to the current-page button.
- Changing the page window keeps focus on a surviving equivalent control when possible.
- `pending` sets `aria-busy` on the navigation, disables requests, keeps the accepted page marked, and shows a localized status message.
- The application owns focus after replacing result content, because the component cannot know which result or heading should receive it.

### Localization and RTL

- Built-in text comes from [LocaleProvider](/components/localization)'s `pagination` namespace. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.
- Numbers use `Intl.NumberFormat` for the active locale. Page labels and callbacks receive already formatted strings.
- The range text uses `dir="auto"`, while previous and next icons mirror in RTL. Page buttons remain ordinary Tab stops; no grid-style arrow-key behavior is added.

### State ownership

The application owns the requested page, the accepted page, page size, and result data. The component owns overflow measurement and the compact/full presentation; it does not store a second page. In server mode, keep the proposed values separate from the accepted ones, replace both only on success, and resolve an invalid accepted page rather than waiting for the component to do it.

## API

### Exports

| Export                                   | Kind      | Use                                                      |
| ---------------------------------------- | --------- | -------------------------------------------------------- |
| `Pagination`                             | Component | Page navigation, page-size selection, and range summary. |
| `PaginationChange`, `PaginationMessages` | Type      | `change` payload and message overrides.                  |

### Props and models

| Prop and model                   | Type                          | Default                | Use                                                                                        |
| -------------------------------- | ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `total`                          | `number`                      | Required               | Known result count; a nonnegative safe integer.                                            |
| `page` / `v-model:page`          | `number`                      | `1`                    | Accepted one-based page.                                                                   |
| `pageSize` / `v-model:page-size` | `number`                      | `10`                   | Positive safe integer.                                                                     |
| `pageSizes`                      | `readonly number[]`           | `[]`                   | Offered sizes; a nonempty array enables the selector. The current size is always included. |
| `locale`                         | `string`                      | Provider, then `en-US` | Locale for numbers and built-in text.                                                      |
| `pending`                        | `boolean`                     | `false`                | Shows loading status, sets `aria-busy`, and blocks requests.                               |
| `disabled`                       | `boolean`                     | `false`                | Disables navigation and page-size changes.                                                 |
| `href`                           | `(page, pageSize) => string`  | —                      | Supplies native links for addressable pages.                                               |
| `messages`                       | `Partial<PaginationMessages>` | Built-in text          | Overrides labels and formatting callbacks.                                                 |

### Events

| Event             | Payload                         | Use                                                                       |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `update:page`     | `number`                        | Proposes the page.                                                        |
| `update:pageSize` | `number`                        | Proposes the page size, with a page containing the previous first record. |
| `change`          | `PaginationChange, MouseEvent?` | Reports the requested page and size without changing accepted props.      |

`messages` accepts string fields `label`, `previous`, `next`, `pageSize`, and `pending`, plus the callbacks `page(formattedPage)`, `current(formattedPage, formattedCount)`, and `range(formattedStart, formattedEnd, formattedTotal)`.

### Slots

| Slot      | Scope                   | Use                                                                |
| --------- | ----------------------- | ------------------------------------------------------------------ |
| `summary` | `{ start, end, total }` | Replaces the result range. Values are numbers, not formatted text. |

### Methods

`Pagination` exposes no methods. Bind `page` and `pageSize`, or handle `change` when the request needs acceptance.

## Styling

The component has no project-specific CSS custom properties. It maps the selected page to the tonal Button treatment, ordinary pages to text buttons, and supporting text to Label Large and Body Small roles. It reads the shared touch-target and density tokens, so changing those tokens affects every pagination instance.

Measure and constrain the root with `class` or `style`; the component switches presentation from its own width rather than a viewport breakpoint. With several paginators on a page, set a distinct `messages.label` for each navigation region, and do not rely on inherited `class` or `style` for regional identity.

## Material references

[Buttons guidelines](https://m3.material.io/components/buttons/guidelines) · [Icon buttons accessibility](https://m3.material.io/components/icon-buttons/accessibility) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
