<script setup lang="ts">
import BreadcrumbExample from './demos/BreadcrumbExample.vue'
import BreadcrumbOverflowExample from './demos/BreadcrumbOverflowExample.vue'
</script>

# Breadcrumb

Breadcrumb shows the current page and its parent locations as a navigable path. Links keep their native browser behavior, and routing remains with the application.

Breadcrumb is a project extension. Material 3 does not define a dedicated Breadcrumb component or visual contract; the closest Compose Material 3 composition is a `Row` of text and icon buttons. Web semantics follow the [WAI-ARIA breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/). Color, type, shape, focus, and spacing are project mappings of shared Material roles.

## Examples

### Path and item states

<div class="vp-raw yam3x-doc-demo-theme"><BreadcrumbExample /></div>

::: details View demo source

<<< ./demos/BreadcrumbExample.vue{vue}

:::

The first trail keeps every ancestor as a link and marks the last item as the current page. The second trail shows an icon-only home link, a disabled destination, a non-link current page, and a text separator. The checkbox switches between horizontal scrolling and wrapping.

### Overflow and RTL

<div class="vp-raw yam3x-doc-demo-theme"><BreadcrumbOverflowExample /></div>

::: details View demo source

<<< ./demos/BreadcrumbOverflowExample.vue{vue}

:::

A long trail stays inside its frame: without wrapping, the path scrolls horizontally; with wrapping, it grows to multiple lines. Breadcrumb has no collapse menu, so keep the hierarchy meaningful or shorten labels at the application level. The direction control mirrors the separator and scroll direction.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Breadcrumb, type BreadcrumbItemData } from './components/yam3x/breadcrumb'

const items: BreadcrumbItemData[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Details' },
]
</script>

<template>
  <Breadcrumb
    :items="items"
    aria-label="Page path"
  />
</template>
```

The final item is the current page by default. Set `currentIndex` when the current page is not last, or to `-1` when no item should be marked current. Keep `label` as the accessible name even when a slot replaces the visible content.

::: details Icons, separators, and icon-only items

```vue
<template>
  <Breadcrumb
    :items="[
      { label: 'Home', href: '/', iconOnly: true },
      { label: 'Library', href: '/library' },
      { label: 'Report' },
    ]"
    aria-label="Library path"
  >
    <template #icon="{ index }">
      <Icon
        v-if="index === 0"
        name="home"
      />
    </template>
    <template #separator>/</template>
  </Breadcrumb>
</template>
```

`iconOnly` hides the visible label while keeping `label` as the accessible name. A separator inserted through the slot is still decorative and is not announced.

:::

## Behavior and accessibility

### Navigation semantics

- The component renders a labeled `nav` containing an ordered list. Each item is a list item, and separators are decorative.
- Items with `href` and no `disabled` are native links. Set `ariaLabelledby` to reuse a visible heading instead of the default label; it takes precedence over `ariaLabel`.
- The current item receives `aria-current="page"`. A current link keeps its `href` and pointer cursor; a current item without `href` renders as text.
- A disabled item renders without a link and exposes `aria-disabled="true"`. It is not focusable.
- `target`, `rel`, and `download` forward only with `href`. Navigation stays native unless the application handles it.

### Keyboard and focus

- Links keep the browser's Tab, Enter, context-menu, copy-link, and modifier-key behavior.
- Hover, focus, and press share one state layer. Focus uses a 3 px Secondary ring with a 2 px outer offset.
- Icon-only items keep a full-size focus target and their accessible name.

### Narrow layouts

- Without `wrap`, the path list scrolls horizontally inside the component. The page itself must not grow.
- With `wrap`, items move to new lines and the list stops scrolling. Labels can ellipsize, so keep the accessibility label complete.
- There is no automatic collapse or “more” menu. Preserve the important ancestors and shorten visible labels in the application if the trail must fit a fixed width.

### RTL and current page

- Separator icons rotate for right-to-left layouts, and before/after scroll direction follows the writing direction.
- The current item uses On Surface whether or not it is a link; linked ancestors use Primary and non-link ancestors use On Surface Variant.
- Disabled items use an On Surface mix with the documented opacity and lose the pointer cursor.

## API

### Exports

| Export               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `Breadcrumb`         | Labeled navigation trail with native links.      |
| `BreadcrumbItemData` | Item schema for labels, destinations, and state. |

### Props and models

Built-in navigation text inherits [LocaleProvider](/components/localization)'s `actions.breadcrumb` label. `ariaLabel` overrides it, and `ariaLabelledby` takes precedence over both.

| Prop             | Default                | Use                                                                      |
| ---------------- | ---------------------- | ------------------------------------------------------------------------ |
| `items`          | `[]`                   | Items in hierarchy order.                                                |
| `currentIndex`   | Last item              | Zero-based current item. An out-of-range value marks no item as current. |
| `ariaLabel`      | Localized `Breadcrumb` | Accessible name of the navigation landmark.                              |
| `ariaLabelledby` | Undefined              | ID of a visible label or heading; takes precedence over `ariaLabel`.     |
| `wrap`           | `false`                | Wraps items instead of scrolling the path horizontally.                  |
| `locale`         | Provider, then `en-US` | Language of the default navigation label.                                |

`BreadcrumbItemData`:

| Field      | Type                | Use                                                                         |
| ---------- | ------------------- | --------------------------------------------------------------------------- |
| `label`    | `string`            | Visible text and accessible name; required.                                 |
| `href`     | `string`            | Destination. The item renders as a link only when present and not disabled. |
| `target`   | `string`            | Native link target, forwarded with `href`.                                  |
| `rel`      | `string`            | Native link relationship, forwarded with `href`.                            |
| `download` | `string \| boolean` | Native download attribute, forwarded with `href`.                           |
| `disabled` | `boolean`           | Renders static disabled text and removes link behavior.                     |
| `iconOnly` | `boolean`           | Visually hides the label while keeping `label` as the accessible name.      |

### Events

Breadcrumb emits no events. Use native link navigation or handle router navigation around the component.

### Slots

| Slot        | Scope                      | Use                                     |
| ----------- | -------------------------- | --------------------------------------- |
| `item`      | `{ item, index, current }` | Replaces the visible label content.     |
| `icon`      | `{ item, index, current }` | Adds a decorative leading icon.         |
| `separator` | `{ index }`                | Replaces the default chevron separator. |

### Methods

Breadcrumb exposes no instance methods.

## Styling

Breadcrumb exposes project-defined custom properties on the root. Label typography maps to the System Label Large role, and colors, density, and state-layer opacity use shared System tokens by default.

::: details Custom properties

| Area                      | Supported properties                                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item layout               | `--yam3x-breadcrumb-item-container-height`, `--yam3x-breadcrumb-item-shape`, `--yam3x-breadcrumb-item-label-padding-inline`, `--yam3x-breadcrumb-item-icon-padding-inline`, `--yam3x-breadcrumb-item-icon-label-space` |
| Label typography          | `--yam3x-breadcrumb-item-label-font-size`, `--yam3x-breadcrumb-item-label-font-weight`, `--yam3x-breadcrumb-item-label-line-height`, `--yam3x-breadcrumb-item-label-tracking`                                          |
| Icon and separator size   | `--yam3x-breadcrumb-item-icon-size`, `--yam3x-breadcrumb-separator-icon-size`                                                                                                                                          |
| Colors and disabled state | `--yam3x-breadcrumb-item-label-color`, `--yam3x-breadcrumb-item-icon-color`, `--yam3x-breadcrumb-item-last-color`, `--yam3x-breadcrumb-item-disabled-color`, `--yam3x-breadcrumb-item-disabled-opacity`                |
| State layer colors        | `--yam3x-breadcrumb-item-label-state-layer-color`, `--yam3x-breadcrumb-item-icon-state-layer-color`                                                                                                                    |

:::

The visual pill is 40 px high by default inside an interaction target of at least 48 px. `--yam3x-breadcrumb-item-container-height` changes the pill height; the target keeps its minimum from `--md-sys-touch-target-size`.

## Material references

[WAI-ARIA Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Color system](https://m3.material.io/styles/color/the-color-system)
