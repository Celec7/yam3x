<script setup lang="ts">
import BreadcrumbExample from './demos/BreadcrumbExample.vue'
</script>

# Breadcrumb

Breadcrumb shows the current page and its parent locations as a navigable path. This project extension uses ordinary links and leaves routing to the application.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><BreadcrumbExample /></div>

::: details View demo source

<<< ./demos/BreadcrumbExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Breadcrumb } from './components/yam3x/breadcrumb'

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Details' },
]
</script>

<template>
  <Breadcrumb :items="items" />
</template>
```

## API

| Prop             | Type                                                                 | Default      | Description                                                                                                  |
| ---------------- | -------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `items`          | `{ label, href?, target?, rel?, download?, disabled?, iconOnly? }[]` | `[]`         | Breadcrumb items in hierarchy order.                                                                         |
| `currentIndex`   | `number`                                                             | Last item    | Current-page index; `-1` means no item is marked as the current page.                                        |
| `ariaLabel`      | `string`                                                             | `Breadcrumb` | Name of the navigation landmark.                                                                             |
| `ariaLabelledby` | `string`                                                             | —            | ID of the visible heading; takes precedence over `ariaLabel` when set.                                       |
| `wrap`           | `boolean`                                                            | `false`      | Wraps path items. When disabled, only the path container scrolls horizontally; the page width does not grow. |

Use `#item({ item, index, current })` to replace the visible label, `#icon` for a leading icon, and `#separator({ index })` to replace the separator. Set `iconOnly` to `true` when an item contains only an icon; `label` remains its accessible name.

## Behavior and accessibility

Links retain the browser’s native Tab, Enter, context-menu, copy-link, and modifier-key behavior. By default, the final item is the current page. When it has an `href`, it remains a link with `aria-current="page"`; without an `href`, it is rendered as current-page text.

## Styling

Set these project-defined custom properties on the Breadcrumb root. Label typography maps to the System Label Large role; colors, spacing density, and state-layer opacity follow shared System tokens by default.

| Area                      | Supported properties                                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item layout               | `--yam3x-breadcrumb-item-container-height`, `--yam3x-breadcrumb-item-shape`, `--yam3x-breadcrumb-item-label-padding-inline`, `--yam3x-breadcrumb-item-icon-padding-inline`, `--yam3x-breadcrumb-item-icon-label-space` |
| Label typography          | `--yam3x-breadcrumb-item-label-font-size`, `--yam3x-breadcrumb-item-label-font-weight`, `--yam3x-breadcrumb-item-label-line-height`, `--yam3x-breadcrumb-item-label-tracking`                                          |
| Icon and separator size   | `--yam3x-breadcrumb-item-icon-size`, `--yam3x-breadcrumb-separator-icon-size`                                                                                                                                          |
| Colors and disabled state | `--yam3x-breadcrumb-item-label-color`, `--yam3x-breadcrumb-item-icon-color`, `--yam3x-breadcrumb-item-last-color`, `--yam3x-breadcrumb-item-disabled-color`, `--yam3x-breadcrumb-item-disabled-opacity`                |
| Label link state layers   | `--yam3x-breadcrumb-item-label-hover-state-layer-color`, `--yam3x-breadcrumb-item-label-focus-state-layer-color`, `--yam3x-breadcrumb-item-label-pressed-state-layer-color`                                            |
| Icon link state layers    | `--yam3x-breadcrumb-item-icon-hover-state-layer-color`, `--yam3x-breadcrumb-item-icon-focus-state-layer-color`, `--yam3x-breadcrumb-item-icon-pressed-state-layer-color`                                               |

## Accessibility reference

[WAI-ARIA Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
