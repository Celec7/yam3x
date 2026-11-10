<script setup lang="ts">
import CarouselExample from './demos/CarouselExample.vue'
import CarouselGalleryExample from './demos/CarouselGalleryExample.vue'
</script>

# Carousel

Carousel presents related items in a scrollable sequence. Choose a layout that keeps the content legible and makes it clear that more items are available.

Carousel is a Material 3 baseline component with six layouts: Multi-browse, Uncontained, Uncontained multi-aspect ratio, Hero, Center-aligned hero, and Full-screen. Full-screen eligibility, `itemHeight`, and the demo's layout guidance are project decisions; size, spacing, and snap defaults follow the Material layouts.

## Examples

### Layouts and browsing

<div class="vp-raw yam3x-doc-demo-theme"><CarouselExample /></div>

::: details View demo source

<<< ./demos/CarouselExample.vue{vue}

:::

The demo switches among all six layouts against the same five items. It exposes the current item, restricts Full-screen to portrait compact and medium windows, and provides a Browse all region outside the carousel. Dragging scrolls horizontally without activating an item; clicking the actionable City item reports the activation.

### Snap and item states

<div class="vp-raw yam3x-doc-demo-theme"><CarouselGalleryExample /></div>

::: details View demo source

<<< ./demos/CarouselGalleryExample.vue{vue}

:::

The gallery compares Multi-browse, Hero, and Uncontained with fixed content. Multi-browse resizes neighboring items, Hero keeps a large preview group, and Uncontained keeps one item width with ordinary scrolling. The disabled Print item stays visible but is skipped by arrow-key navigation.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Carousel, type CarouselItem, type CarouselLayout } from './components/yam3x/carousel'

const items: CarouselItem[] = [
  { key: 'coast', label: 'Coastline' },
  { key: 'garden', label: 'Garden' },
  { key: 'forest', label: 'Forest' },
]
const layout = ref<CarouselLayout>('uncontained')
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
```

Every item needs a stable `key` and a readable `label`; `href`, `actionable`, `disabled`, `image`, and `aspectRatio` are optional. The default slot receives `{ item, index, sizeRole }` and owns the visual content. `image` is available to that slot; the component does not render it.

::: details Full-screen and custom item widths

```vue
<script setup lang="ts">
import { Carousel } from './components/yam3x/carousel'

const portraits = [
  { key: 'one', label: 'First story' },
  { key: 'two', label: 'Second story' },
]
</script>

<template>
  <Carousel
    :items="portraits"
    layout="full-screen"
    label="Story feed"
  >
    <template #default="{ item }">
      <article>{{ item.label }}</article>
    </template>
  </Carousel>
</template>
```

Full-screen is a vertical, edge-to-edge layout with forced snap and no track padding. The component does not inspect viewport orientation or size, so use it only in portrait compact or medium windows and provide an alternate layout elsewhere. For horizontal layouts, `preferredItemWidth` tunes the large item in Multi-browse, Hero, and Center-aligned hero; `itemWidth` fixes Uncontained item width.

:::

## Behavior and accessibility

### Layouts

- Multi-browse shows large, medium, and small items that resize as the active item changes.
- Uncontained keeps a single item width and scrolls freely by default. Uncontained multi-aspect ratio derives width from each item's `aspectRatio` and its own height.
- Hero shows a large item with a preview of what follows. Center-aligned hero centers one large item with previews on both sides and starts at the second item when more than two are supplied.
- Full-screen stacks one item per viewport block and always uses vertical snap. It does not add horizontal drag handling.

### Scrolling and snapping

- Multi-browse, Hero, Center-aligned hero, and Full-screen snap by default. Uncontained layouts do not snap unless `snap` is explicitly enabled; Full-screen cannot disable it.
- Native touch and trackpad scrolling remain available. A primary-button mouse drag scrolls a horizontal carousel and suppresses the click that would otherwise activate the item under the pointer.
- The active item follows scrolling and focus. Setting `activeIndex` scrolls the new item into view.
- The track keeps its own horizontal overflow and does not grow the page.

### Keyboard and focus

- Every enabled item is a Tab stop. Arrow Left and Arrow Right move focus in left-to-right layouts; the arrows mirror in RTL. Arrow Up and Arrow Down leave a horizontal carousel for adjacent page content.
- In Full-screen, Arrow Up and Arrow Down move between items.
- The component does not intercept Home or End; use arrow keys for item navigation.
- Disabled items are removed from the Tab order and skipped by arrow navigation.
- Space activates a link item; Enter uses the native activation of links and buttons.

### Activation

- `href` renders a native link; `actionable: true` renders a native button. Both emit `activate(item, index, event)`.
- A non-actionable item is a focusable group with the accessible name of a slide; it does not activate.
- Link navigation remains native unless the application calls `preventDefault()`. Disabled items do not activate or navigate.

### Reduced motion

- Smooth scrolling becomes immediate, parallax is removed, item resize transitions stop, and non-large items use the large item width so the sequence remains readable.
- The carousel does not autoplay. Nothing moves or advances without user input.

### Empty and loading states

- An empty `items` array renders an empty labeled group. Carousel has no empty slot or loading prop; render your own message or placeholder outside or instead of the carousel.
- The component does not fetch data, report a loading state, or provide previous/next controls.

### State ownership

- `v-model:active-index` owns the active item. Without a binding, the component keeps its own index and emits `change` when browsing moves it.
- The application owns the item collection, each item's destination or `actionable` behavior, and the action that exposes every item outside a horizontally scrolling page.

## API

Built-in interface text inherits [LocaleProvider](/components/localization)'s `actions` namespace. `locale` overrides the language, defaulting to the provider then `en-US`. The application supplies `label` and item labels.

`actions.carouselItem(position, total, label)` formats each item's accessible name with a one-based position.

### Exports

| Export                  | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `Carousel`              | Scrollable item sequence with six layouts.                   |
| `CarouselItem`          | Item schema, including destination, action, and layout data. |
| `CarouselItemSlotProps` | Default-slot scope: `item`, `index`, and `sizeRole`.         |
| `CarouselLayout`        | Union of the six layout names.                               |
| `CarouselLength`        | CSS length string or number interpreted as pixels.           |

### Props and models

| Prop                 | Default                         | Use                                                                                                                |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `items`              | Required                        | Items to browse. Each item needs a unique `key` and readable `label`.                                              |
| `label`              | Required                        | Accessible name of the carousel group.                                                                             |
| `layout`             | `multi-browse`                  | `multi-browse`, `uncontained`, `uncontained-multi-aspect-ratio`, `hero`, `center-aligned-hero`, or `full-screen`.  |
| `snap`               | Layout-dependent                | Enables CSS scroll snap. Defaults on except for Uncontained layouts; Full-screen always snaps.                     |
| `preferredItemWidth` | Responsive                      | Preferred large-item width for Multi-browse, Hero, and Center-aligned hero layouts. Numbers are pixels.            |
| `itemWidth`          | Responsive                      | Fixed item width for the Uncontained layout. Numbers are pixels; mixed-aspect widths use `aspectRatio`.            |
| `itemSpacing`        | `8px`, or `16px` in Full-screen | Space between items. Numbers are pixels.                                                                           |
| `contentPadding`     | Layout-specific                 | CSS padding shorthand for the track. Numbers are pixels.                                                           |
| `itemHeight`         | `320px`                         | Project track-content height for general layouts; Full-screen and mixed-aspect layouts calculate their own height. |
| `locale`             | Provider, then `en-US`          | Language of built-in slide names.                                                                                  |
| `activeIndex`        | `0`                             | Current item index; supports `v-model:active-index`.                                                               |

`CarouselItem`:

| Field         | Type               | Use                                                                        |
| ------------- | ------------------ | -------------------------------------------------------------------------- |
| `key`         | `string \| number` | Stable unique key.                                                         |
| `label`       | `string`           | Readable item name used in the accessible slide name.                      |
| `href`        | `string`           | Renders a native link.                                                     |
| `actionable`  | `boolean`          | Renders a native button for a non-link item.                               |
| `disabled`    | `boolean`          | Keeps the item visible but removes activation and the Tab stop.            |
| `image`       | `string`           | Image URL available to the default slot; the component does not render it. |
| `aspectRatio` | `string`           | Ratio such as `16:9`, used by the uncontained multi-aspect layout.         |

### Events

| Event      | Payload                | Use                                               |
| ---------- | ---------------------- | ------------------------------------------------- |
| `change`   | `(index, item)`        | Browsing or focus moved the active item.          |
| `activate` | `(item, index, event)` | An enabled link or actionable item was activated. |

### Slots

| Slot      | Scope                       | Use                                                        |
| --------- | --------------------------- | ---------------------------------------------------------- |
| `default` | `{ item, index, sizeRole }` | Item content. `sizeRole` is `large`, `medium`, or `small`. |

### Methods

Carousel exposes no instance methods. Use `v-model:active-index` to move the sequence programmatically.

## Styling

Carousel exposes no public custom-property contract. Item size, spacing, padding, and height are controlled through props; colors, focus, shape, and motion use internal Material mappings. The focus ring is 3 px Secondary with a 2 px offset, and the item corner radius springs between 28 px, 21 px, and the pressed value in the horizontal layouts.

## Material references

[Carousel overview](https://m3.material.io/components/carousel/overview) · [guidelines](https://m3.material.io/components/carousel/guidelines) · [specs](https://m3.material.io/components/carousel/specs) · [accessibility](https://m3.material.io/components/carousel/accessibility)
