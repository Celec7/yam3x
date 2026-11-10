<script setup lang="ts">
import DescriptionsBasicExample from './demos/DescriptionsBasicExample.vue'
import DescriptionsExample from './demos/DescriptionsExample.vue'
</script>

# Descriptions

Descriptions presents the labelled attributes of one record, such as a project summary or account details. Use it when readers scan attributes of a single item; use [Lists](/components/list) for repeated rows or [Data table](/components/data-table) to compare many records.

Descriptions is a project extension. It is a read-only information composition, not an editable [Form](/components/form) or a comparison table. Compose Material 3 has no Descriptions primitive; `Column` and `Row`, `Text`, and dividers provide the same composition. The project supplies a native description list, responsive column behavior, and localization for empty and missing values.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><DescriptionsBasicExample /></div>

A basic record needs only `items`. Each item has a stable `key`, a `label`, and a primitive `value`. The optional `title` names the description list, and `outlined` groups the attributes on a rounded surface.

::: details View demo source

<<< ./demos/DescriptionsBasicExample.vue{vue}

:::

### Layout, states, and value slots

<div class="vp-raw yam3x-doc-demo-theme"><DescriptionsExample /></div>

The controls compare stacked and inline labels, an outlined and borderless group, a narrow container, and an empty record. The value slot renders the contact link, formats booleans, and supplies its own missing-value text, while `0` remains a real value. A full-width note spans the available row at every container size.

::: details View demo source

<<< ./demos/DescriptionsExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'

const items: DescriptionItem[] = [
  { key: 'project', label: 'Project', value: 'Atlas' },
  { key: 'owner', label: 'Owner', value: 'Ada' },
  { key: 'budget', label: 'Remaining budget', value: 0 },
  { key: 'review', label: 'Review date', value: null },
  {
    key: 'notes',
    label: 'Notes',
    value: 'A complete record stays readable when the container narrows.',
    fullWidth: true,
  },
]
</script>

<template>
  <Descriptions
    :items="items"
    title="Project details"
    :columns="3"
    outlined
  />
</template>
```

Labels and values stay application-owned. Pass already-localized text and preformatted values, or use the slots for links, dates, and amounts.

::: details Custom values and empty content

```vue
<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'

const items: DescriptionItem[] = [
  { key: 'contact', label: 'Contact', value: 'ada@example.com' },
  { key: 'notifications', label: 'Notifications', value: false },
]
</script>

<template>
  <Descriptions :items="items">
    <template #value="{ item, value }">
      <a
        v-if="item.key === 'contact'"
        :href="`mailto:${value}`"
        >{{ value }}</a
      >
      <template v-else-if="typeof value === 'boolean'">{{ value ? 'On' : 'Off' }}</template>
      <template v-else-if="value != null">{{ value }}</template>
      <template v-else>Not provided</template>
    </template>
  </Descriptions>
  <Descriptions
    :items="[]"
    empty-text="No attributes recorded"
  />
</template>
```

`#label` and `#value` replace the corresponding content, and `#empty` replaces the empty-list presentation. A value slot owns missing-value display as well as formatting. Links and buttons inside a value keep their native keyboard behavior; the rest of the attribute remains static.

:::

## Behavior and accessibility

### Structure and association

- The component renders a native `dl`. Each `dt` is immediately followed by its `dd`, in the order of `items`.
- A `title` renders a Heading and sets `aria-labelledby` on the `dl`. Set `headingLevel` to match the surrounding outline; the default is `3`.
- Without a title, give the group nearby context or a descriptive surrounding heading. The component does not invent an accessible name.
- Static attributes have no hover, pressed, selection, or Tab state. Links and buttons supplied in slots retain their native keyboard behavior.

### Values and empty states

- `DescriptionItem.value` accepts `string`, `number`, `boolean`, `null`, or omission.
- `0`, `false`, and `''` are real values and render as such. Only `null` and omission use the missing-value message.
- An empty `items` array renders the empty presentation. `emptyText` and `missingValueText` override the localized defaults.
- Built-in text resolves through [LocaleProvider](/components/localization)'s `descriptions` namespace (`empty`, `missingValue`). An explicit `locale` and message props take precedence.
- `fullWidth: true` spans the available row at every container size.

### Responsive layout

- The layout responds to the component's container width, not the page viewport.
- Below `32rem` of content width, the list uses one column. At `32rem`, `48rem`, and `64rem`, it can grow to two, three, and four columns, up to `columns`.
- `stacked` places labels above values with a density-scaled gap. `inline` places them side by side with a `2:3` label/value ratio and a density-scaled column gap.
- Labels and values wrap. Long identifiers and complete values stay readable instead of being clipped.
- `outlined` adds a 1px outline, the Medium corner role, and internal padding. The outline belongs to the group, not to each attribute.

### State ownership

Descriptions has no models and submits no data. The application owns labels, values, formatting, localization, and any actions placed in slots. Use Form fields when a value can be edited.

## API

### Exports

| Export            | Kind      | Use                                |
| ----------------- | --------- | ---------------------------------- |
| `Descriptions`    | Component | Labelled attributes of one record. |
| `DescriptionItem` | Type      | Row schema accepted by `items`.    |

### Props

| Prop               | Default            | Use                                                                                   |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------- |
| `items`            | `[]`               | Readonly `DescriptionItem[]`; each item needs a unique `key`.                         |
| `title`            | `''`               | Visible Title Medium heading that names the description list.                         |
| `headingLevel`     | `3`                | Native heading level, `1` through `6`, independent of the visual type role.           |
| `columns`          | `3`                | Maximum columns: `1`, `2`, `3`, or `4`; the container width decides the actual count. |
| `layout`           | `'stacked'`        | `stacked` places labels above values; `inline` aligns them side by side.              |
| `outlined`         | `false`            | Adds a rounded group outline and inner spacing.                                       |
| `locale`           | Provider → `en-US` | Selects built-in empty and missing-value text.                                        |
| `emptyText`        | Localized          | Overrides the empty-list message.                                                     |
| `missingValueText` | Localized          | Overrides the null or omitted-value message.                                          |

### Description item

| Field       | Type                                  | Use                                                        |
| ----------- | ------------------------------------- | ---------------------------------------------------------- |
| `key`       | `string`                              | Stable, unique identity within the list.                   |
| `label`     | `string`                              | Term shown in the `dt`.                                    |
| `value`     | `string \| number \| boolean \| null` | Optional description value; omission and null are missing. |
| `fullWidth` | `boolean`                             | Spans the available row at every container size.           |

### Events

Descriptions emits no events.

### Slots

| Slot    | Scope             | Use                                                                     |
| ------- | ----------------- | ----------------------------------------------------------------------- |
| `label` | `{ item }`        | Replaces a term's content.                                              |
| `value` | `{ item, value }` | Replaces a description, including formatting and missing-value display. |
| `empty` | —                 | Replaces the empty-list presentation.                                   |

### Methods

Descriptions exposes no instance methods.

## Styling

The public hook is `--yam3x-descriptions-gap`, which sets the group padding and the gap between attributes. Its default is `24px` scaled by `--md-sys-density-spacing-scale`. The same density scale adjusts the 4px stacked label/value gap, the 16px inline column gap, and the outline padding.

| Property                         | Default                  | Use                                             |
| -------------------------------- | ------------------------ | ----------------------------------------------- |
| `--yam3x-descriptions-gap`       | `24px` scaled by density | Padding around the group and gap between items. |
| `--md-sys-density-spacing-scale` | `1`                      | Scales component spacing with density.          |

Labels use Label Large / On Surface Variant; values use Body Large / On Surface. The optional outline uses a 1px Outline Variant border and the Medium corner role. Complete content stays readable at enlarged text sizes. There are no project-specific color or shape hooks beyond these interfaces.

## Material references

- [Lists guidelines: alignment, non-interactive lists, and adaptive design](https://m3.material.io/components/lists/guidelines)
- [Applying type](https://m3.material.io/styles/typography/applying-type)
