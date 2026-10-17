<script setup lang="ts">
import PaginationExample from './demos/PaginationExample.vue'
</script>

# Pagination

`Pagination` is a project extension for collections with a known result count. It combines Material buttons, icon buttons, and an optional page-size selector. It does not fetch data or fabricate page counts for cursor-only services.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><PaginationExample /></div>

::: details View demo source

<<< ./demos/PaginationExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Pagination, type PaginationChange } from './components/yam3x/pagination'
const page = ref(1)
const pageSize = ref(10)
function showPage(next: PaginationChange) {
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
    @change="showPage"
  />
</template>
```

For synchronous local results, `v-model:page` and `v-model:page-size` are also supported. For asynchronous results, pass the accepted `page` and `pageSize`, set `pending` while loading, and apply both values only after success. Keep previous records and their marker on failure, with recovery feedback in the result region. Your application owns cancellation and stale-result protection.

## API

| Prop        | Default            | Use                                                                                                                              |
| ----------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `total`     | Required           | Known total record count, a nonnegative safe integer.                                                                            |
| `page`      | `1`                | Accepted, one-based page. Keep it within the available range; use 1 for an empty result.                                         |
| `pageSize`  | `10`               | Positive safe integer.                                                                                                           |
| `pageSizes` | `[]`               | Offered sizes; a nonempty array enables the selector. The current size is included, with duplicates and invalid entries removed. |
| `locale`    | `en-US`            | Number formatting locale; English or Chinese default messages.                                                                   |
| `pending`   | `false`            | Show loading status and block duplicate requests.                                                                                |
| `disabled`  | `false`            | Disable navigation and page-size changes.                                                                                        |
| `href`      | None               | `(page, pageSize) => string`; supplies native links for addressable pages.                                                       |
| `messages`  | English or Chinese | Override labels and formatting callbacks; see below.                                                                             |

`change({ page, pageSize }, event?)` reports a request without changing the accepted props. `update:page` and `update:pageSize` support Vue model bindings. Changing page size requests the page containing the previous first visible record. A request for the already displayed page does nothing.

With `href`, normal clicks retain native link navigation. The optional second `change` argument is the native mouse event: call `event.preventDefault()` for client-side routing. Modified clicks remain native and do not emit a request for the current view. Without `href`, navigation uses buttons. Previous and next have independent accessible names and tooltips.

`messages` accepts string fields `label`, `previous`, `next`, `pageSize`, and `pending`, plus callbacks `page(formattedPage)`, `current(formattedPage, formattedCount)`, and `range(formattedStart, formattedEnd, formattedTotal)`. Callback arguments are localized strings. Other locales use English copy unless overridden. The component exports `PaginationChange` and `PaginationMessages`.

The `#summary="{ start, end, total }"` slot replaces the result range; its values are numbers. Attributes apply to the root, allowing several instances to have separate classes and styles. Use `messages.label` to distinguish their navigation regions.

## Behavior and accessibility

The page window includes the first, last, current, and adjacent pages. Ellipses are not controls. When the measured content cannot fit its container, the same previous and next controls surround a current/total summary. Numbered choices are hidden from focus and assistive technology in that presentation. The current page uses `aria-current="page"`, without toggle semantics. Resizing preserves the accepted page and returns focus to the equivalent current-page presentation when needed.

Zero results show a zero range with no numbered actions. A single page omits redundant navigation. If the total shrinks past the accepted page, the application must resolve a valid page: the component emits no automatic request, shows no invented current-page marker, and disables navigation until corrected. A page-size selector and range summary wrap separately from the primary navigation.

The component preserves numeric alignment with tabular figures, reserves separate 48 px targets, and mirrors directional icons in RTL. Page buttons remain ordinary Tab stops; no grid-style arrow-key behavior is added. Pending state keeps the accepted page identifiable and provides a status message. The application owns focus after replacing result content.

## Styling

The selected page uses the adopted tonal Button treatment; other page choices use text buttons. Container widths are measured rather than tied to the viewport. Apply a root width through `class` or `style`; text, secondary controls, and the compact summary grow or wrap without shrinking their targets.

## Material references

[Buttons guidelines](https://m3.material.io/components/buttons/guidelines) · [Icon buttons accessibility](https://m3.material.io/components/icon-buttons/accessibility) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
