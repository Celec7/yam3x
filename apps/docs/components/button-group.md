<script setup lang="ts">
import ButtonGroupExample from './demos/ButtonGroupExample.vue'
</script>

# Button groups

Button groups keep related actions or choices together. Use `ButtonGroup` and `ButtonGroupItem` to compose actions; use `ButtonGroupSelection` for choices backed by a shared selection model.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <ButtonGroupExample />
</div>

::: details View demo source

<<< ./demos/ButtonGroupExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Button from './components/yam3x/button/button.vue'
import { ButtonGroup, ButtonGroupItem, ButtonGroupSelection } from './components/yam3x/button-group'

const currentView = ref('list')

function onActivate({ value }: { value: string }) {
  console.log('Action:', value)
}
</script>

<template>
  <ButtonGroup
    label="File actions"
    @activate="onActivate"
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
    v-model="currentView"
    label="View mode"
    :options="[
      { label: 'List', value: 'list' },
      { label: 'Grid', value: 'grid' },
    ]"
    variant="connected"
  />
</template>
```

Use the default slot to compose custom controls. `ButtonGroup` provides `#overflow-indicator` when `overflow="menu"`. The slot receives `{ items, activate }`; use it to render the caller's menu, then call `activate(item.value)` for the selected item. Without an overflow slot, the group can scroll horizontally. `ButtonGroupSelection` is the project's options-based convenience component.

Set a manually composed group's `size` and `shape` to match its child buttons. Standard spacing follows `size`; Connected spacing defaults to 2px. The `gap` prop takes precedence; when it is unset, `--yam3x-button-group-gap` overrides either default. If both are unset, `--yam3x-connected-button-group-spacing` overrides Connected spacing.

## API

### `ButtonGroup`

| Prop       | Type                                                    | Default    | Description                                                 |
| ---------- | ------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `variant`  | `standard \| connected`                                 | `standard` | Uses separate buttons or a connected-choice layout.         |
| `size`     | Button size                                             | `small`    | Selects size-specific group spacing and corners.            |
| `shape`    | `round \| square`                                       | `round`    | Selects the Connected group's outer shape.                  |
| `label`    | `string`                                                | —          | Accessible name for the group.                              |
| `role`     | `string`                                                | `group`    | Group role; `ButtonGroupSelection` sets this automatically. |
| `overflow` | `none \| menu`                                          | `none`     | Enables overflow measurement when a slot is provided.       |
| `gap`      | `string \| number`                                      | —          | Overrides the spacing between items.                        |
| `justify`  | `start \| center \| end \| between \| around \| evenly` | `start`    | Aligns the group items.                                     |

`ButtonGroupItem` emits `activate` with the originating `MouseEvent`. The group emits `activate` with `{ value, source, event }`, where `source` is `button` or `overflow`.

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

## Behavior and accessibility

Single selection uses a string `v-model`; multiple selection uses a string array. The component emits `select` with the updated value and option when selection changes. The `#option` slot receives `{ option, selected, disabled }`. Options support `kind: 'icon'` for IconButton presentation. Connected groups use their group-level button variants uniformly; standard groups allow per-option variants. Arrow keys move focus and update the selected option in single-selection mode; disabled items are skipped.

## Material references

[Button groups overview](https://m3.material.io/components/button-groups/overview) · [guidelines](https://m3.material.io/components/button-groups/guidelines) · [specs](https://m3.material.io/components/button-groups/specs) · [accessibility](https://m3.material.io/components/button-groups/accessibility)
