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

Breadcrumb navigation can inherit [LocaleProvider](/components/localization)'s `actions` messages. Optional `locale` overrides the language, defaulting to the provider then `en-US`. Existing label overrides take precedence.

| Prop             | Type                                                                 | Default      | Description                                                                                                  |
| ---------------- | -------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `items`          | `{ label, href?, target?, rel?, download?, disabled?, iconOnly? }[]` | `[]`         | Breadcrumb items in hierarchy order.                                                                         |
| `currentIndex`   | `number`                                                             | Last item    | Current-page index; `-1` means no item is marked as the current page.                                        |
| `ariaLabel`      | `string`                                                             | `Breadcrumb` | Name of the navigation landmark.                                                                             |
| `ariaLabelledby` | `string`                                                             | —            | ID of the visible heading; takes precedence over `ariaLabel` when set.                                       |
| `wrap`           | `boolean`                                                            | `false`      | Wraps path items. When disabled, only the path container scrolls horizontally; the page width does not grow. |

Use `#item({ item, index, current })` to replace the visible label, `#icon` for a leading icon, and `#separator({ index })` to replace the separator. Set `iconOnly` to `true` when an item contains only an icon; `label` remains its accessible name.

## Behavior and accessibility

Links retain the browser’s native Tab, Enter, context-menu, copy-link, and modifier-key behavior. By default, the final item is the current page. When it has an `href`, it remains a link with `aria-current="page"` and uses the on-surface color; without an `href`, it is rendered as current-page text. Non-link ancestors use on-surface-variant and do not imply a pointer cursor.

Each item has a 40px visual pill inside a minimum 48px interaction target. Hover, focus, and pressed feedback comes from one shared state layer; focus is a 3px secondary ring with a 2px outer offset. Labels and separators use a 1px optical adjustment so their ink shares the visual center.

## Styling

Set these project-defined custom properties on the Breadcrumb root. Label typography maps to the System Label Large role; colors, spacing density, and state-layer opacity follow shared System tokens by default. `--yam3x-breadcrumb-item-container-height` controls the visual pill height; the interaction target remains at least 48px through `--md-sys-touch-target-size`.

| Area                      | Supported properties                                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item layout               | `--yam3x-breadcrumb-item-container-height`, `--yam3x-breadcrumb-item-shape`, `--yam3x-breadcrumb-item-label-padding-inline`, `--yam3x-breadcrumb-item-icon-padding-inline`, `--yam3x-breadcrumb-item-icon-label-space` |
| Label typography          | `--yam3x-breadcrumb-item-label-font-size`, `--yam3x-breadcrumb-item-label-font-weight`, `--yam3x-breadcrumb-item-label-line-height`, `--yam3x-breadcrumb-item-label-tracking`                                          |
| Icon and separator size   | `--yam3x-breadcrumb-item-icon-size`, `--yam3x-breadcrumb-separator-icon-size`                                                                                                                                          |
| Colors and disabled state | `--yam3x-breadcrumb-item-label-color`, `--yam3x-breadcrumb-item-icon-color`, `--yam3x-breadcrumb-item-last-color`, `--yam3x-breadcrumb-item-disabled-color`, `--yam3x-breadcrumb-item-disabled-opacity`                |
| State layer colors        | `--yam3x-breadcrumb-item-label-state-layer-color`, `--yam3x-breadcrumb-item-icon-state-layer-color`                                                                                                                    |

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Color system](https://m3.material.io/styles/color/the-color-system) · [WAI-ARIA Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
