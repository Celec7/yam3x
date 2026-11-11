<script setup lang="ts">
import ButtonGroupActionsExample from './demos/ButtonGroupActionsExample.vue'
import ButtonGroupExample from './demos/ButtonGroupExample.vue'
</script>

# Button groups

Button groups keep related actions or choices together. Material defines two variants: standard and connected. Use `ButtonGroup` with `ButtonGroupItem` for actions, or `ButtonGroupSelection` for a shared selection model.

## Examples

### Choices and selection

Connected button groups help people select options, switch views, or sort elements in a page. They should replace the baseline segmented button, which is no longer recommended.

<div class="vp-raw yam3x-doc-demo-theme">
  <ButtonGroupExample />
</div>

::: details View demo source

<<< ./demos/ButtonGroupExample.vue{vue}

:::

### Related actions

Standard button groups add interaction between adjacent buttons so they respond to each other.

<div class="vp-raw yam3x-doc-demo-theme">
  <ButtonGroupActionsExample />
</div>

::: details View demo source

<<< ./demos/ButtonGroupActionsExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from './components/yam3x/button'
import { ButtonGroup, ButtonGroupItem, ButtonGroupSelection } from './components/yam3x/button-group'

const view = ref('list')
</script>

<template>
  <ButtonGroup
    label="File actions"
    @activate="({ value }) => console.log(value)"
  >
    <ButtonGroupItem
      value="save"
      label="Save"
    >
      <Button>Save</Button>
    </ButtonGroupItem>
    <ButtonGroupItem
      value="share"
      label="Share"
    >
      <Button>Share</Button>
    </ButtonGroupItem>
  </ButtonGroup>

  <ButtonGroupSelection
    v-model="view"
    label="View mode"
    variant="connected"
    :options="[
      { label: 'List', value: 'list' },
      { label: 'Grid', value: 'grid' },
    ]"
  />
</template>
```

Use the default slot to compose custom controls. `ButtonGroup` provides `#overflow-indicator` when `overflow="menu"`. The slot receives `{ items, activate }`; render the caller's menu and call `activate(item.value)` for the selected item. Without an overflow slot, the group can scroll horizontally.

## Behavior and accessibility

- Button groups move through layouts together in a single line. They do not wrap to a second line.
- In a standard group, pressing a button affects the width of adjacent buttons. In a connected group, only the pressed button changes shape.
- A selected button changes shape from round to square, or square to round.
- Single selection uses a string `v-model`; multiple selection uses a string array.
- `ButtonGroupSelection` emits `select` with the updated value and option. The `#option` slot receives `{ option, selected, disabled }`.
- Options with `kind: 'icon'` use `IconButton` presentation.
- Connected groups use one group-level button variant. Standard groups allow per-option variants.
- Arrow keys move focus and update the selected option in single-selection mode, skipping disabled options.

## API

### Exports

| Export                                                     | Kind      | Use                                                                    |
| ---------------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `ButtonGroup`                                              | Component | Standard or connected container for grouped actions.                   |
| `ButtonGroupItem`                                          | Component | One action in a standard group.                                        |
| `ButtonGroupSelection`                                     | Component | Connected single- or multiple-choice group.                            |
| `ButtonGroupVariant`                                       | Type      | `'standard' \| 'connected'`.                                           |
| `ButtonGroupSelectionMode`                                 | Type      | `'single' \| 'multiple'`.                                              |
| `ButtonGroupValue`                                         | Type      | `string \| string[]`.                                                  |
| `ButtonGroupOption`                                        | Type      | One selection option, including its kind and per-option button styles. |
| `ButtonGroupOverflowItem`                                  | Type      | Item exposed to the overflow-indicator slot.                           |
| `ButtonGroupItemActivateEvent`                             | Type      | `{ value, source, event? }` emitted by the group.                      |
| `ButtonGroupButtonVariant`, `ButtonGroupIconButtonVariant` | Type      | Default button styles for selection options.                           |

### `ButtonGroup`

| Prop       | Type                                                    | Default    | Description                                                 |
| ---------- | ------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `variant`  | `standard \| connected`                                 | `standard` | Uses separate buttons or a connected-choice layout.         |
| `size`     | Button size                                             | `small`    | Selects size-specific group spacing and corners.            |
| `shape`    | `round \| square`                                       | `round`    | Selects the connected group's outer shape.                  |
| `label`    | `string`                                                | —          | Accessible name for the group.                              |
| `role`     | `string`                                                | `group`    | Group role; `ButtonGroupSelection` sets this automatically. |
| `overflow` | `none \| menu`                                          | `none`     | Enables overflow measurement when a slot is provided.       |
| `gap`      | `string \| number`                                      | —          | Overrides the spacing between items.                        |
| `justify`  | `start \| center \| end \| between \| around \| evenly` | `start`    | Aligns the group items.                                     |

`ButtonGroup` emits `activate` with `{ value, source, event }`, where `source` is `button` or `overflow`.

### `ButtonGroupItem`

| Prop            | Type      | Default  | Description                                      |
| --------------- | --------- | -------- | ------------------------------------------------ |
| `value`         | `string`  | Required | Unique value within the group.                   |
| `label`         | `string`  | —        | Label supplied to the overflow slot.             |
| `disabled`      | `boolean` | `false`  | Disables the slotted control and its activation. |
| `weight`        | `number`  | `0`      | Relative extra width in a standard group.        |
| `animate-width` | `boolean` | `true`   | Enables standard-group press width animation.    |

### `ButtonGroupSelection`

| Prop                  | Type                                                                       | Default        | Description                                      |
| --------------------- | -------------------------------------------------------------------------- | -------------- | ------------------------------------------------ |
| `options`             | `{ label, value, kind?, disabled?, buttonVariant?, iconButtonVariant? }[]` | Required       | Choice definitions; values must be unique.       |
| `label`               | `string`                                                                   | Required       | Accessible group name.                           |
| `variant`             | `standard \| connected`                                                    | `standard`     | Group layout.                                    |
| `selection-mode`      | `single \| multiple`                                                       | `single`       | Model shape and selection behavior.              |
| `selection-required`  | `boolean`                                                                  | `false`        | Keeps an enabled choice selected when available. |
| `button-variant`      | ToggleButton variant                                                       | `filled-tonal` | Default option button style.                     |
| `icon-button-variant` | IconButton variant                                                         | `tonal`        | Default icon option style.                       |
| `size`                | Button size                                                                | `small`        | Size passed to the group and each option.        |
| `shape`               | Button shape                                                               | `round`        | Shape passed to the group and each option.       |
| `overflow`            | `none \| menu`                                                             | `none`         | Enables the custom overflow slot.                |
| `gap`                 | `string \| number`                                                         | —              | Overrides spacing between items.                 |

### Events

| Component              | Event      | Payload                                                                 | Description                                            |
| ---------------------- | ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `ButtonGroup`          | `activate` | `{ value: string, source: 'button' \| 'overflow', event?: MouseEvent }` | An enabled item was activated.                         |
| `ButtonGroupItem`      | `activate` | `MouseEvent`                                                            | The slotted control was activated.                     |
| `ButtonGroupSelection` | `select`   | `(value: string \| string[], option: ButtonGroupOption)`                | The accepted selection and the option that changed it. |

### Slots

| Component              | Slot                 | Scope                            | Description                                    |
| ---------------------- | -------------------- | -------------------------------- | ---------------------------------------------- |
| `ButtonGroup`          | `default`            | —                                | `ButtonGroupItem` children or custom controls. |
| `ButtonGroup`          | `overflow-indicator` | `{ items, activate }`            | Overflow menu content when `overflow="menu"`.  |
| `ButtonGroupItem`      | `default`            | —                                | The control rendered for this item.            |
| `ButtonGroupSelection` | `option`             | `{ option, selected, disabled }` | Replaces one option's content.                 |
| `ButtonGroupSelection` | `overflow-indicator` | `{ items, activate }`            | Overflow menu content for selection options.   |

## Styling

A manually composed group should use the same `size` and `shape` as its child buttons. Standard spacing follows `size`; connected spacing defaults to 2px. The `gap` prop takes precedence. When `gap` is unset, `--yam3x-button-group-gap` overrides either default; for connected groups, `--yam3x-connected-button-group-spacing` is the next fallback.

## Material references

[Button groups overview](https://m3.material.io/components/button-groups/overview) · [guidelines](https://m3.material.io/components/button-groups/guidelines) · [specs](https://m3.material.io/components/button-groups/specs) · [accessibility](https://m3.material.io/components/button-groups/accessibility)
