<script setup lang="ts">
import EmptyStateExample from './demos/EmptyStateExample.vue'
</script>

# Empty state

`EmptyState` is a project extension that explains why a collection or result region has no content and offers a useful next step. Use it for a new collection or no matching results. Loading, request failure, and completed work need their own feedback.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><EmptyStateExample /></div>

::: details View demo source

<<< ./demos/EmptyStateExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { EmptyState } from './components/yam3x/empty-state'
import { Button } from './components/yam3x/button'
</script>

<template>
  <EmptyState
    title="No matching documents"
    align="start"
    :heading-level="2"
  >
    Try another term, or clear the search to see all documents.
    <template #actions><Button variant="outlined">Clear search</Button></template>
  </EmptyState>
</template>
```

## API

| Prop           | Default    | Use                                                                                                                  |
| -------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `title`        | Required   | Short explanation of the empty region.                                                                               |
| `description`  | Empty      | Supporting explanation, replaced by the default slot when supplied.                                                  |
| `context`      | `embedded` | `embedded` uses Title Medium / Body Medium; `page` uses Headline Small / Body Large.                                 |
| `align`        | `center`   | `center` or direction-aware `start`.                                                                                 |
| `icon`         | None       | Optional decorative Material Symbol, displayed at 48 px.                                                             |
| `headingLevel` | None       | Semantic heading level, 1–6; omitted renders the title as a span. Choose it from the surrounding document structure. |

The default slot supplies supporting content. `#illustration` replaces the icon area with your image or illustration. Give informative images an appropriate alternative; use an empty alternative or `aria-hidden="true"` for decoration. `#actions` holds the next steps, using the Button hierarchy appropriate to the surrounding page. Attributes apply to the root.

## Behavior and accessibility

The component inherits its surface and does not add a card background, fetch records, create content, or announce itself automatically. Keep section titles, useful search controls, filters, and navigation outside the empty content region. Place a table's empty message inside a cell spanning its columns if its headers should remain visible.

Distinguish “no items yet” from “no matching results.” Offer creation for a new collection, and a useful query or filter change for no matches. A request error must preserve the failure and its recovery action rather than claiming the collection is empty.

Actions wrap, text can grow, and start alignment follows writing direction. Appearance does not move focus. The containing result region may announce a user-initiated query result once, using its own status area. The application owns the result of an action and focus after replacing the empty content.

## Styling

Typography, spacing, and foregrounds use the shared Material roles. The region has 24 px padding, 16 px between its main parts, and 8 px between title and description. The text block is limited to about 40 characters where space allows. Apply `class` or `style` to size the containing region; allow its height to follow the content.

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Shape principles](https://m3.material.io/styles/shape/overview-principles) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
