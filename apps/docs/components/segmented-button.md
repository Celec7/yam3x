<script setup lang="ts">
import SegmentedButtonExample from './demos/SegmentedButtonExample.vue'
</script>

# Segmented buttons

Segmented buttons are a classic Material control that remains available for existing use. Material no longer recommends them for new designs; use [Connected Button Groups](./button-group) for new compact-choice interfaces.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <SegmentedButtonExample />
</div>

::: details View demo source

<<< ./demos/SegmentedButtonExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from './components/yam3x/segmented-button'

const view = ref<string | null>('list')
const filters = ref(['recent'])
</script>

<template>
  <SingleChoiceSegmentedButtonRow
    v-model="view"
    aria-label="View mode"
  >
    <SegmentedButton value="list">List</SegmentedButton>
    <SegmentedButton value="grid">Grid</SegmentedButton>
  </SingleChoiceSegmentedButtonRow>

  <MultiChoiceSegmentedButtonRow
    v-model="filters"
    aria-label="Content filters"
  >
    <SegmentedButton value="recent">Recent</SegmentedButton>
    <SegmentedButton value="saved">Saved</SegmentedButton>
  </MultiChoiceSegmentedButtonRow>
</template>
```

Use `SingleChoiceSegmentedButtonRow` for one selected value and `MultiChoiceSegmentedButtonRow` for a set of selected values. Place `SegmentedButton` children in the default slot; each `value` must be unique within its row. A child can be disabled independently. The `icon` slot receives `{ selected }`; without it, a selected segment displays the default check icon.

## API

### `SingleChoiceSegmentedButtonRow`

| Prop       | Type               | Default | Description                                         |
| ---------- | ------------------ | ------- | --------------------------------------------------- |
| `v-model`  | `string \| null`   | `null`  | Currently selected segment value.                   |
| `disabled` | `boolean`          | `false` | Disables every segment.                             |
| `name`     | `string`           | —       | Submits the selected enabled value as a form field. |
| `density`  | `0 \| 1 \| 2 \| 3` | `0`     | Removes 4px of visual height per step.              |

### `MultiChoiceSegmentedButtonRow`

| Prop       | Type               | Default | Description                                         |
| ---------- | ------------------ | ------- | --------------------------------------------------- |
| `v-model`  | `string[]`         | `[]`    | Selected segment values; all values can be cleared. |
| `disabled` | `boolean`          | `false` | Disables every segment.                             |
| `name`     | `string`           | —       | Submits selected enabled values as form fields.     |
| `density`  | `0 \| 1 \| 2 \| 3` | `0`     | Removes 4px of visual height per step.              |

Both rows accept `aria-label` or `aria-labelledby` as the accessible group name and emit `change` with `{ previousValue, value }` when selection changes.

### `SegmentedButton`

| Prop       | Type      | Default  | Description                  |
| ---------- | --------- | -------- | ---------------------------- |
| `value`    | `string`  | Required | Unique value within its row. |
| `disabled` | `boolean` | `false`  | Disables this segment.       |

The default slot provides the visible label. The `icon` slot receives `{ selected }`; provide an icon for each state as needed. The segment's accessible name comes from its visible label or an `aria-label` for icon-only content.

## Behavior and accessibility

Direction keys move focus among enabled segments without changing selection. Space, Enter, or pointer activation changes selection. Tab enters at the first enabled segment in LTR and the last enabled segment in RTL; after entry, focus remains on the most recently focused segment. The single-choice row uses radio semantics; the multiple-choice row uses checkbox semantics. These rows retain the 40px visual height and 48px target from the classic specification. `name`, row-level `disabled`, form submission, and `density` are project extensions around the classic control.

## Styling

The standard visual height is 40px, with a 1px outline, centered label, at least 12px horizontal padding, and 8px between icon and label. The interaction target is 48px. Selected items use secondary-container/on-secondary-container colors.

## Material references

[Segmented buttons overview](https://m3.material.io/components/segmented-buttons/overview) · [guidelines](https://m3.material.io/components/segmented-buttons/guidelines) · [specs](https://m3.material.io/components/segmented-buttons/specs) · [accessibility](https://m3.material.io/components/segmented-buttons/accessibility)
