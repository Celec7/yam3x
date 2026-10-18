<script setup lang="ts">
import DescriptionsExample from './demos/DescriptionsExample.vue'
</script>

# Descriptions

Descriptions is a project extension for the labelled attributes of one record. It uses a native description list, with responsive columns, stacked or inline labels, and application-owned value formatting.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><DescriptionsExample /></div>

::: details View demo source

<<< ./demos/DescriptionsExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'
const items: DescriptionItem[] = [
  { key: 'name', label: 'Project', value: 'Atlas' },
  { key: 'budget', label: 'Budget', value: 0 },
  { key: 'review', label: 'Review date', value: null },
]
</script>

<template>
  <Descriptions
    :items="items"
    title="Project details"
    outlined
  />
</template>
```

## API

| Prop                            | Default                 | Description                                                                                                                |
| ------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `items`                         | `[]`                    | Readonly `DescriptionItem[]`. Each item has a unique `key`, `label`, optional primitive `value`, and optional `fullWidth`. |
| `title`                         | `''`                    | Visible Title Medium heading that names the description list.                                                              |
| `headingLevel`                  | `3`                     | Native heading level, `1` through `6`; independent of its visual type role.                                                |
| `columns`                       | `3`                     | Maximum column count: `1`, `2`, `3`, or `4`. Actual columns depend on the container width.                                 |
| `layout`                        | `stacked`               | `stacked` places labels above values; `inline` aligns them side by side.                                                   |
| `outlined`                      | `false`                 | Adds a rounded group outline and inner spacing.                                                                            |
| `locale`                        | Inherited, then `en-US` | Selects built-in text through LocaleProvider.                                                                              |
| `emptyText`, `missingValueText` | Localized               | Override the empty-list and null/omitted-value messages.                                                                   |

`DescriptionItem.value` accepts `string`, `number`, `boolean`, `null`, or omission. `0`, `false`, and `''` remain real values; only null and omission use the missing-value message. `fullWidth: true` spans the available row at every container size.

The `#label="{ item }"` and `#value="{ item, value }"` slots replace the corresponding content. The value slot owns missing-value display as well as formatting. `#empty` replaces the empty-list content. Use these slots for localized dates, formatted amounts, links, or coordinated actions; there are no selection or form models.

Built-in text uses [LocaleProvider](/components/localization)'s `descriptions` namespace (`empty`, `missingValue`). Explicit `locale` and message props take precedence. Labels and values remain application-owned.

## Behavior and accessibility

Each native `dt` is immediately followed by its `dd`, in the same order as `items`. Responsive layout preserves DOM reading order. The optional title labels the list; set `headingLevel` to match the surrounding document outline. Without a title, provide nearby context or a descriptive surrounding heading.

One column is used below 32rem of available component content width. At 32rem, 48rem, and 64rem, the layout can grow to two, three, and four columns, up to `columns`. Inline labels retain a 2:3 label/value ratio within each attribute; text wraps in either layout. Static attributes have no hover, pressed, selection, or Tab state. Links and buttons supplied in slots retain their native keyboard behavior.

Use a Data table to compare multiple records, or Form fields for editing values. Descriptions does not format business values or submit data.

## Styling

The group uses theme colors and typography tokens. Labels use Label Large / On Surface Variant; values use Body Large / On Surface. The optional outline uses Outline Variant and the Medium corner role. Override `--yam3x-descriptions-gap` to change group padding and spacing between attributes; its default is 24px scaled by density. Keep complete content readable at enlarged text sizes.

## Material references

- [Lists guidelines: alignment, non-interactive lists, and adaptive design](https://m3.material.io/components/lists/guidelines)
- [Applying type](https://m3.material.io/styles/typography/applying-type)
