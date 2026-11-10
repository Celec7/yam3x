<script setup lang="ts">
import ChipActionsExample from './demos/ChipActionsExample.vue'
import ChipFiltersExample from './demos/ChipFiltersExample.vue'
import ChipInputsExample from './demos/ChipInputsExample.vue'
import ChipStaticExample from './demos/ChipStaticExample.vue'
</script>

# Chips

Chips are compact, contextual elements for actions, suggestions, filters, and entered values. Material 3 defines four chip variants: Assist, Suggestion, Filter, and Input. Use them as supplemental choices in a related group, not to complete or advance a major task; use [Buttons](/components/button) for primary actions.

This project exposes the four Material variants and adds project helpers for composition. `Chip` is a passive label (closest Compose composition: `Surface` with a label), `ChipSet` is layout only (closest composition: `FlowRow`), and `FilterChipSet` and `InputChipSet` coordinate selection or entry (closest composition: `FlowRow` with the matching chip, and a text field with `InputChip` children). The helpers are project extensions, not additional Material variants.

Choose Assist for a contextual or automated action, Suggestion for a product-generated next step, Filter for collection criteria, and Input for a value the person entered. Keep one selection pattern per experience.

## Examples

### Actions and suggestions

Assist and Suggestion chips are buttons or links. The demo reports activations, shows outlined and elevated styles, and includes a compatibility disabled chip. An icon reinforces the action but never replaces the label.

<div class="vp-raw yam3x-doc-demo-theme"><ChipActionsExample /></div>

::: details View demo source

<<< ./demos/ChipActionsExample.vue{vue}

:::

### Filters

Filter chips select criteria. `FilterChipSet` renders a labeled toolbar with single or multiple selection, arrow-key movement, and an optional visible heading. The standalone chips show selected, interactive, trailing-action, and disabled states.

<div class="vp-raw yam3x-doc-demo-theme"><ChipFiltersExample /></div>

::: details View demo source

<<< ./demos/ChipFiltersExample.vue{vue}

:::

### Input

`InputChip` represents one entered value and separates its primary action from the remove action. `InputChipSet` composes a text field with values, supports editing, deduplication, overflow, reordering, and optional form submission.

<div class="vp-raw yam3x-doc-demo-theme"><ChipInputsExample /></div>

::: details View demo source

<<< ./demos/ChipInputsExample.vue{vue}

:::

### Display and grouping

`Chip` is passive: it has no activation behavior, no focus target, and no selection. `ChipSet` only arranges chips, keeps at least an 8 px gap, and can label the group or stack it vertically.

<div class="vp-raw yam3x-doc-demo-theme"><ChipStaticExample /></div>

::: details View demo source

<<< ./demos/ChipStaticExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FilterChipSet } from './components/yam3x/filter-chip-set'

const topic = ref<string | null>(null)
const topics = [
  { label: 'Design', value: 'design' },
  { label: 'Code', value: 'code' },
]
</script>

<template>
  <FilterChipSet
    v-model="topic"
    label="Topics"
    :options="topics"
  />
</template>
```

## Behavior and accessibility

### Actions and suggestions

- Assist and Suggestion chips render a native button by default, or a native link when `href` is set. Both emit `click`; a disabled chip cancels activation.
- A link chip honors `target`, `rel`, and `download`. A disabled link keeps link semantics, exposes `aria-disabled`, removes `href`, and leaves the tab order.
- Icons are decorative and hidden from assistive technology. Keep the visible label meaningful on its own.
- Use Assist for an action that acts on the current context and Suggestion for a proposed next step. Neither should advance a major workflow.

### Filters

- A standalone `FilterChip` uses button semantics with `aria-pressed`. The selection indicator is the leading checkmark and can be hidden with `selectionIndicator="false"`.
- `FilterChipSet` renders a labeled toolbar, not a grid. Tab enters at one chip; arrow keys move focus between enabled chips without selecting them; Space or Enter selects or deselects the focused chip.
- Horizontal toolbars use Left and Right arrows; `vertical` uses Up and Down. Arrow direction mirrors in RTL, and Home and End move to the first and last enabled chip.
- Single selection starts empty and activating the selected chip clears it to `null`. `multi` toggles each value independently, and selected values can be cleared.
- The trailing action is a separate button with its own accessible name (`trailingActionLabel`, then the localized `actions.moreActions` message). Activating it emits `action` and does not change selection.
- `ariaLabelledby` replaces `label` as the accessible name when a visible heading names the group. `name` and `form` submit the selected values.
- In forced colors, selected chips use Highlight/HighlightText and unselected interactive chips keep a CanvasText border.

### Input

- A standalone `InputChip` toggles `selected` on its primary action; `@click.prevent` keeps the state unchanged. Its primary and remove buttons are separate 48 px targets.
- The remove action is named by `removeLabel`, then the localized `actions.removeItem(label)` message. `removable="false"` hides it.
- `InputChipSet` maps a chip's primary action to editing: clicking a chip loads its value into the input and selects the text. Enter adds or renames a value, Escape cancels editing, and duplicate values are ignored.
- Two Backspace presses on an empty input remove the last chip; the first press shows the pending selection. Backspace or Delete removes a focused chip.
- `maxChips` collapses extra values into a `+N` indicator when focus leaves the group and expands them while the group has focus.
- `reorderable` enables drag reordering and Alt+Arrow reordering; `change` reports `add`, `remove`, `edit`, or `reorder`, with indices for reordering. `name` submits every value with the form.
- Arrow keys move between chips and the text field. Movement mirrors in RTL and switches to Up/Down when `vertical` is set.

### Display and grouping

- `Chip` has no button or link role and is not focusable. Do not attach handlers to it or use it for actions, filters, or entered values.
- `ChipSet` applies layout only; selection and input behavior stay with the individual chip or the purpose-built set helper.
- Interactive chips keep a 48 px target and at least 8 px between chips, including between wrapped rows. Group labels can be visible or programmatic.

## API

Built-in interface text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and label props take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                         | Description                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `AssistChip`, `SuggestionChip` | Contextual action and suggested next step.                                      |
| `FilterChip`, `FilterChipSet`  | Filter criterion and labeled selection group.                                   |
| `InputChip`, `InputChipSet`    | Entered value and field-plus-values composition.                                |
| `Chip`, `ChipSet`              | Passive label and layout-only group.                                            |
| `FilterChipOption`             | Type for `FilterChipSet` options: `label`, unique `value`, optional `disabled`. |

### `AssistChip` props and models

| Prop / model | Type                       | Default      | Description                                        |
| ------------ | -------------------------- | ------------ | -------------------------------------------------- |
| `variant`    | `'outlined' \| 'elevated'` | `'outlined'` | Visual style; elevated is for complex backgrounds. |
| `disabled`   | `boolean`                  | `false`      | Prevents activation.                               |

::: details Native button and link attributes

`href`, `target`, `rel`, and `download` render a link. `type` (`'button' | 'submit' | 'reset'`, default `'button'`), `name`, `value`, and `form` apply in button mode. Other attributes and listeners are forwarded.

:::

### `AssistChip` events

| Event   | Payload      | Description                       |
| ------- | ------------ | --------------------------------- |
| `click` | `MouseEvent` | Fired when the chip is activated. |

### `AssistChip` slots

| Slot      | Description                                      |
| --------- | ------------------------------------------------ |
| `default` | Visible label; required for the accessible name. |
| `icon`    | Decorative leading icon.                         |

### `SuggestionChip` props and models

| Prop / model | Type                       | Default      | Description                                        |
| ------------ | -------------------------- | ------------ | -------------------------------------------------- |
| `variant`    | `'outlined' \| 'elevated'` | `'outlined'` | Visual style; elevated is for complex backgrounds. |
| `disabled`   | `boolean`                  | `false`      | Prevents activation.                               |

::: details Native button and link attributes

`href`, `target`, `rel`, and `download` render a link. `type`, `name`, `value`, and `form` apply in button mode. Other attributes and listeners are forwarded.

:::

### `SuggestionChip` events

| Event   | Payload      | Description                       |
| ------- | ------------ | --------------------------------- |
| `click` | `MouseEvent` | Fired when the chip is activated. |

### `SuggestionChip` slots

| Slot      | Description                                      |
| --------- | ------------------------------------------------ |
| `default` | Visible label; required for the accessible name. |
| `icon`    | Decorative leading icon.                         |

### `FilterChip` props and models

| Prop / model          | Type                        | Default            | Description                                      |
| --------------------- | --------------------------- | ------------------ | ------------------------------------------------ |
| `selected`            | `v-model:selected: boolean` | `false`            | Selected state exposed as `aria-pressed`.        |
| `variant`             | `'outlined' \| 'elevated'`  | `'outlined'`       | Visual style.                                    |
| `disabled`            | `boolean`                   | `false`            | Prevents selection and the trailing action.      |
| `selectionIndicator`  | `boolean`                   | `true`             | Shows the leading checkmark when selected.       |
| `trailingActionLabel` | `string`                    | Localized          | Accessible name of the separate trailing action. |
| `locale`              | `string`                    | Provider → `en-US` | Overrides built-in interface language.           |

### `FilterChip` events

| Event    | Payload      | Description                                     |
| -------- | ------------ | ----------------------------------------------- |
| `action` | `MouseEvent` | Fired by the trailing action, not by selection. |

### `FilterChip` slots

| Slot              | Description                                     |
| ----------------- | ----------------------------------------------- |
| `default`         | Visible label.                                  |
| `icon`            | Optional decorative leading icon.               |
| `trailing-action` | Content of the separate trailing action button. |

### `FilterChipSet` props and models

| Prop / model             | Type                                  | Default      | Description                                                       |
| ------------------------ | ------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `options`                | `FilterChipOption[]`                  | Required     | Options with `label`, unique `value`, and optional `disabled`.    |
| `label`                  | `string`                              | Required     | Accessible name; also the toolbar label when no `ariaLabelledby`. |
| `modelValue`             | `v-model: string \| string[] \| null` | `null`       | Selected value, values, or no selection.                          |
| `multi`                  | `boolean`                             | `false`      | Enables independent multiple selection.                           |
| `ariaLabelledby`         | `string`                              | Undefined    | References a visible heading; takes precedence over `label`.      |
| `disabled`               | `boolean`                             | `false`      | Disables the whole toolbar.                                       |
| `vertical`               | `boolean`                             | `false`      | Uses a vertical toolbar and Up/Down movement.                     |
| `variant`                | `'outlined' \| 'elevated'`            | `'outlined'` | Visual style for every chip.                                      |
| `hideSelectionIndicator` | `boolean`                             | `false`      | Hides the leading checkmark on selected chips.                    |
| `name`, `form`           | `string`                              | Undefined    | Submit selected values; optionally associate another form.        |

### `FilterChipSet` events

| Event    | Payload                      | Description                  |
| -------- | ---------------------------- | ---------------------------- |
| `change` | `string \| string[] \| null` | Reports the new model value. |

### `FilterChipSet` slots

| Slot   | Scope        | Description                   |
| ------ | ------------ | ----------------------------- |
| `icon` | `{ option }` | Leading icon for each option. |

### `InputChip` props and models

| Prop / model  | Type                        | Default            | Description                                                |
| ------------- | --------------------------- | ------------------ | ---------------------------------------------------------- |
| `label`       | `string`                    | Required           | Visible label and default accessible name.                 |
| `value`       | `string`                    | Undefined          | Removal value and `data-value`; both fall back to `label`. |
| `selected`    | `v-model:selected: boolean` | `false`            | Selection state of the primary action.                     |
| `variant`     | `'outlined' \| 'elevated'`  | `'outlined'`       | Visual style.                                              |
| `disabled`    | `boolean`                   | `false`            | Disables both actions.                                     |
| `removable`   | `boolean`                   | `true`             | Shows the separate remove action.                          |
| `removeLabel` | `string`                    | Localized          | Accessible name of the remove action.                      |
| `locale`      | `string`                    | Provider → `en-US` | Overrides built-in interface language.                     |

### `InputChip` events

| Event    | Payload                                               | Description                                                |
| -------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| `click`  | `MouseEvent`                                          | Fired by the primary action; prevent it to keep selection. |
| `remove` | `(value: string, event: MouseEvent \| KeyboardEvent)` | Fired by the remove action or Backspace/Delete.            |

### `InputChip` slots

| Slot          | Description                                    |
| ------------- | ---------------------------------------------- |
| `default`     | Replaces the visible label.                    |
| `avatar`      | Optional avatar; takes precedence over `icon`. |
| `icon`        | Optional decorative leading icon.              |
| `remove-icon` | Replaces the default close icon.               |

### `InputChipSet` props and models

| Prop / model   | Type                | Default   | Description                                                   |
| -------------- | ------------------- | --------- | ------------------------------------------------------------- |
| `label`        | `string`            | Required  | Group label and accessible name of the text field.            |
| `modelValue`   | `v-model: string[]` | `[]`      | Accepted values.                                              |
| `placeholder`  | `string`            | `''`      | Text field placeholder.                                       |
| `disabled`     | `boolean`           | `false`   | Disables entry and every chip.                                |
| `maxChips`     | `number \| null`    | `null`    | Collapses extra values into `+N` when focus leaves the group. |
| `vertical`     | `boolean`           | `false`   | Stacks values vertically and changes arrow movement.          |
| `reorderable`  | `boolean`           | `false`   | Enables drag and Alt+Arrow reordering.                        |
| `name`, `form` | `string`            | Undefined | Submit every value; optionally associate another form.        |

### `InputChipSet` events

| Event    | Payload                                                                                              | Description                  |
| -------- | ---------------------------------------------------------------------------------------------------- | ---------------------------- |
| `change` | `{ type: 'add' \| 'remove' \| 'edit' \| 'reorder', value: string, oldValue?, fromIndex?, toIndex? }` | Reports the accepted change. |

### `InputChipSet` slots

| Slot     | Scope       | Description                   |
| -------- | ----------- | ----------------------------- |
| `avatar` | `{ value }` | Avatar content for each chip. |
| `icon`   | `{ value }` | Leading icon for each chip.   |

### `Chip` props and models

| Prop      | Type                       | Default      | Description                          |
| --------- | -------------------------- | ------------ | ------------------------------------ |
| `variant` | `'outlined' \| 'elevated'` | `'outlined'` | Visual style.                        |
| `value`   | `string`                   | Undefined    | Optional `data-value` for the label. |

`Chip` is passive: it has no models, events, or activation behavior.

### `Chip` slots

| Slot       | Description                  |
| ---------- | ---------------------------- |
| `default`  | Visible label.               |
| `icon`     | Decorative leading icon.     |
| `trailing` | Decorative trailing content. |

### `ChipSet` props and models

| Prop       | Type      | Default   | Description                                               |
| ---------- | --------- | --------- | --------------------------------------------------------- |
| `vertical` | `boolean` | `false`   | Stacks chips vertically.                                  |
| `label`    | `string`  | Undefined | When set, renders a group role with this accessible name. |

### `ChipSet` events and slots

`ChipSet` emits no events. Its default slot accepts the chips to arrange.

### Methods

None of the chip components exposes public instance methods.

## Styling

Chip surfaces, outlines, labels, selection, and elevation follow Material system roles, and forced colors keep selected chips visible. The component exposes no public custom-property hooks: the 32 px container, 8 px corner, 48 px target, state layers, and focus treatment remain internal.

::: details Geometry and grouping

Interactive and passive chips share a 32 px height and 8 px corner. A focus indicator is a 3 px `secondary` ring with a 2 px offset. `ChipSet`, `FilterChipSet`, and `InputChipSet` enforce at least an 8 px gap between chips across density settings, including between wrapped rows. The input chip set draws its field outline around the group and highlights it with `primary` while focus is inside.

:::

## Material references

[Chips overview](https://m3.material.io/components/chips/overview) · [Guidelines](https://m3.material.io/components/chips/guidelines) · [Specs](https://m3.material.io/components/chips/specs) · [Accessibility](https://m3.material.io/components/chips/accessibility)
