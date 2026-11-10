<script setup lang="ts">
import SegmentedButtonExample from './demos/SegmentedButtonExample.vue'
import SegmentedButtonMultiExample from './demos/SegmentedButtonMultiExample.vue'
</script>

# Segmented buttons

Segmented buttons are a classic Material control for choosing one option or several from a short, visible set. This project keeps the classic control for continued use. Material now recommends [Button groups](/components/button-group) for new compact-choice designs; this page does not define a replacement or migration.

Use `SingleChoiceSegmentedButtonRow` for one selected value and `MultiChoiceSegmentedButtonRow` for a set of values. Each `SegmentedButton` inside a row supplies one segment; the row owns selection, focus, and form values.

## Examples

### Single selection

The row uses radio semantics. The selected segment shows its icon slot's selected content, a disabled segment is skipped, and the `change` event reports the previous and next values. The form submits the selected value under `name="view"`.

<div class="vp-raw yam3x-doc-demo-theme"><SegmentedButtonExample /></div>

::: details View demo source

<<< ./demos/SegmentedButtonExample.vue{vue}

:::

### Multiple selection

The row uses checkbox semantics and keeps each value independent. `density="2"` reduces the visual height, and disabling the row removes its values from form submission.

<div class="vp-raw yam3x-doc-demo-theme"><SegmentedButtonMultiExample /></div>

::: details View demo source

<<< ./demos/SegmentedButtonMultiExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

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

::: details Icons, disabled segments, and form submission

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from './components/yam3x/segmented-button'
import { Icon } from './components/yam3x/icon'

const view = ref<string | null>(null)
</script>

<template>
  <form @submit.prevent>
    <SingleChoiceSegmentedButtonRow
      v-model="view"
      name="view"
      aria-label="View mode"
    >
      <SegmentedButton value="list">
        <template #icon="{ selected }">
          <Icon :name="selected ? 'check' : 'view_list'" />
        </template>
        List
      </SegmentedButton>
      <SegmentedButton
        value="map"
        disabled
      >
        Map
      </SegmentedButton>
    </SingleChoiceSegmentedButtonRow>
  </form>
</template>
```

:::

Each `value` must be unique within its row. The row's accessible name comes from `aria-label` or `aria-labelledby`; a visible heading is usually clearer. The application owns the initial model and the submitted form.

## Behavior and accessibility

### Selection semantics

- The single-choice row exposes `role="radiogroup"` with radio segments. Activating another segment selects it; activating the selected segment does nothing. Pass `null` to start with no selection.
- The multi-choice row exposes `role="group"` with checkbox segments. Each activation adds or removes that value independently, and all values can be cleared.
- `change` reports `{ previousValue, value }` after the model updates. A single row reports `string | null`; a multi row reports `string[]`.
- Row-level `disabled` disables every segment. A segment's own `disabled` skips it in selection and keyboard movement.
- `name` renders hidden inputs for the selected, enabled values; a disabled row submits none.

### Keyboard and focus

- Tab enters the row at one enabled segment; after entry, it stays on the most recently focused segment. The initial stop is the first enabled segment in LTR and the last enabled segment in RTL.
- Arrow Right and Arrow Left move focus among enabled segments and wrap. Arrow keys do not change the selection.
- Home and End move focus to the first and last enabled segment; these keys are a project extension.
- Space or Enter activates the focused segment through its native button behavior.
- The focus ring surrounds the 40 px visual segment rather than the 48 px target, and the first and last segments keep the group's outer corners.

### Forms

- A single row submits one hidden value under `name`; a multi row submits one hidden input per selected value.
- Disabled segments and disabled rows do not submit values. Native form reset does not change the accepted model.
- The hidden inputs are presentational and not focusable; the segments themselves are the form controls.

### Responsive and RTL

- The row does not wrap. Keep labels short and let the surrounding layout provide the available inline space; a horizontal scroll region is preferable to compressing segments.
- RTL mirrors the arrow directions and the initial tab stop. Focus movement and corner radii follow the writing direction.
- Classic geometry keeps a 48 px interactive target; `density` reduces the visual height without changing that target or the outer corners.

## API

### Exports

| Export                                                | Description                                               |
| ----------------------------------------------------- | --------------------------------------------------------- |
| `SegmentedButton`                                     | One segment inside a row.                                 |
| `SingleChoiceSegmentedButtonRow`                      | Row with one selected value and radio semantics.          |
| `MultiChoiceSegmentedButtonRow`                       | Row with a set of selected values and checkbox semantics. |
| `SegmentedButtonChangeDetail`, `SegmentedButtonValue` | Change payload and model value types.                     |

### `SingleChoiceSegmentedButtonRow` props and models

| Prop / model | Type                      | Default   | Description                                         |
| ------------ | ------------------------- | --------- | --------------------------------------------------- |
| `modelValue` | `v-model: string \| null` | `null`    | Selected segment value; `null` starts unselected.   |
| `disabled`   | `boolean`                 | `false`   | Disables every segment.                             |
| `name`       | `string`                  | Undefined | Submits the selected enabled value as a form field. |
| `density`    | `0 \| 1 \| 2 \| 3`        | `0`       | Reduces the visual height by 4 px per step.         |

`aria-label` and `aria-labelledby` are forwarded from attrs as the group name.

### `SingleChoiceSegmentedButtonRow` events

| Event    | Payload                                                    | Description        |
| -------- | ---------------------------------------------------------- | ------------------ |
| `change` | `{ previousValue: string \| null, value: string \| null }` | Selection changed. |

### `SingleChoiceSegmentedButtonRow` slots

| Slot      | Description                                         |
| --------- | --------------------------------------------------- |
| `default` | `SegmentedButton` children; each `value` is unique. |

### `MultiChoiceSegmentedButtonRow` props and models

| Prop / model | Type                | Default   | Description                                          |
| ------------ | ------------------- | --------- | ---------------------------------------------------- |
| `modelValue` | `v-model: string[]` | `[]`      | Selected segment values; all values can be cleared.  |
| `disabled`   | `boolean`           | `false`   | Disables every segment.                              |
| `name`       | `string`            | Undefined | Submits each selected enabled value as a form field. |
| `density`    | `0 \| 1 \| 2 \| 3`  | `0`       | Reduces the visual height by 4 px per step.          |

`aria-label` and `aria-labelledby` are forwarded from attrs as the group name.

### `MultiChoiceSegmentedButtonRow` events

| Event    | Payload                                        | Description        |
| -------- | ---------------------------------------------- | ------------------ |
| `change` | `{ previousValue: string[], value: string[] }` | Selection changed. |

### `MultiChoiceSegmentedButtonRow` slots

| Slot      | Description                                         |
| --------- | --------------------------------------------------- |
| `default` | `SegmentedButton` children; each `value` is unique. |

### `SegmentedButton` props and models

| Prop       | Type      | Default  | Description                  |
| ---------- | --------- | -------- | ---------------------------- |
| `value`    | `string`  | Required | Unique value within its row. |
| `disabled` | `boolean` | `false`  | Disables this segment only.  |

`SegmentedButton` has no models of its own; the surrounding row owns selection. Attributes and listeners are forwarded to its native button.

### `SegmentedButton` events

`SegmentedButton` emits no events. Selection and `change` are reported by the row.

### `SegmentedButton` slots

| Slot      | Scope          | Description                                                                |
| --------- | -------------- | -------------------------------------------------------------------------- |
| `default` | —              | Visible label.                                                             |
| `icon`    | `{ selected }` | Leading icon content; without it, a selected segment shows the check icon. |

### Methods

The rows and segments expose no public instance methods.

## Styling

The classic control uses a 40 px visual height, a 1 px outline, fully rounded outer corners, and a 48 px interactive target. Selected segments use `secondary-container` and `on-secondary-container`; the label is centered with at least 12 px inline padding and an 8 px icon-label gap. These dimensions are fixed by the classic specification.

::: details Density and geometry

`density` removes 4 px of visual height per step while the interactive target and outer corners stay constant. The focus ring is drawn around the 40 px surface with a 3 px `secondary` ring, a 2 px gap, and 8 px inner corners. No public custom properties are exposed for this component.

:::

## Material references

[Segmented buttons overview](https://m3.material.io/components/segmented-buttons/overview) · [Guidelines](https://m3.material.io/components/segmented-buttons/guidelines) · [Specs](https://m3.material.io/components/segmented-buttons/specs) · [Accessibility](https://m3.material.io/components/segmented-buttons/accessibility)
