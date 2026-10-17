<script setup lang="ts">
import CarouselExample from './demos/CarouselExample.vue'
</script>

# Carousel

Carousel presents related items in a scrollable sequence. Choose a layout that keeps the content legible and makes it clear that more items are available.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><CarouselExample /></div>

::: details View demo source

<<< ./demos/CarouselExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Carousel } from './components/yam3x/carousel'
import type { CarouselItem, CarouselLayout } from './components/yam3x/carousel'

const items: CarouselItem[] = [
  { key: 'coast', label: 'Coastline' },
  { key: 'garden', label: 'Garden' },
  { key: 'forest', label: 'Forest' },
]
const layout: CarouselLayout = 'uncontained'
</script>

<template>
  <Carousel
    :items="items"
    :layout="layout"
    label="Featured places"
  >
    <template #default="{ item }">
      <div class="destination">{{ item.label }}</div>
    </template>
  </Carousel>
</template>

<style scoped>
.destination {
  display: grid;
  height: 100%;
  place-items: center;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
</style>
```

## API

Each `items` entry needs a stable `key` and readable `label`; `href`, `actionable`, `disabled`, `image`, and `aspectRatio` are optional. The default slot receives `{ item, index, sizeRole }` so callers can render the content.

| Prop / event         | Type                   | Default                    | Description                                                                                                                                                                                |
| -------------------- | ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `items`              | `CarouselItem[]`       | Required                   | Items to browse. Each item has a stable `key` and accessible `label`.                                                                                                                      |
| `label`              | `string`               | Required                   | Accessible name of the Carousel.                                                                                                                                                           |
| `layout`             | `CarouselLayout`       | `multi-browse`             | One of six supported values based on M3 layouts and configurations.                                                                                                                        |
| `activeIndex`        | `number`               | `0`                        | Index of the current item; supports `v-model:active-index`.                                                                                                                                |
| `snap`               | `boolean`              | Depends on layout          | Uses CSS scroll snap. Enabled by default for Multi-browse, Hero, and Full-screen; Uncontained and Uncontained multi-aspect ratio scroll freely by default. Always enabled for Full-screen. |
| `preferredItemWidth` | `CarouselLength`       | Responsive                 | Preferred large-item width for Multi-browse and Hero layouts. Numeric values are CSS pixels; strings are CSS lengths.                                                                      |
| `itemWidth`          | `CarouselLength`       | Responsive                 | Fixed item width for Uncontained. Numeric values are CSS pixels; strings are CSS lengths. Mixed-aspect widths remain derived from `aspectRatio`.                                           |
| `itemSpacing`        | `CarouselLength`       | `8px` (`16px` full-screen) | Space between items. Numeric values are CSS pixels; strings are CSS lengths.                                                                                                               |
| `contentPadding`     | `CarouselLength`       | Layout-specific            | CSS padding shorthand for the track. Defaults follow M3 layout padding. Numeric values are CSS pixels; strings may use any valid CSS padding value.                                        |
| `itemHeight`         | `string`               | `320px`                    | Project track-content height for general layouts; Full-screen and mixed-aspect layouts calculate their own heights.                                                                        |
| `change`             | `(index, item)`        | —                          | Emitted when browsing changes the current item.                                                                                                                                            |
| `activate`           | `(item, index, event)` | —                          | Emitted when an enabled link or `actionable` item is activated.                                                                                                                            |

`CarouselLength` accepts a CSS length string or a number interpreted as pixels.

## Behavior and accessibility

An `href` renders a native link; `actionable: true` renders a native button. The Carousel emits `activate(item, index, event)` for either, while disabled items do not activate. Link navigation remains native unless the event handler calls `preventDefault()`. `activeIndex` stays in sync as users scroll or browse with arrow keys; animated scrolling respects reduced-motion preference. The caller owns full-screen eligibility and should use that layout only in portrait compact or medium windows. On vertically scrolling pages, provide a “Browse all” action or equivalent outside the Carousel. For long horizontal sequences, prefer Uncontained so labels remain legible.

## Styling

Mixed-ratio widths are calculated from the container and each item’s `aspectRatio`. General layouts use 8px item spacing and Full-screen uses 16px. Horizontal layouts default to 16px inline and 8px block padding; Uncontained layouts keep 16px only at the starting edge, and Full-screen has no padding.

## Material references

[Carousel overview](https://m3.material.io/components/carousel/overview) · [guidelines](https://m3.material.io/components/carousel/guidelines) · [specs](https://m3.material.io/components/carousel/specs) · [accessibility](https://m3.material.io/components/carousel/accessibility)
