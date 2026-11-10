<script setup lang="ts">
import CheckboxBasicExample from './demos/CheckboxBasicExample.vue'
import CheckboxExample from './demos/CheckboxExample.vue'
import CheckboxGroupExample from './demos/CheckboxGroupExample.vue'
</script>

# Checkbox

Checkboxes let users select one or more items from a list, or turn an item on or off. Use them when choices can coexist; use a [radio button](/components/radio-group) for one choice from a visible set and a [switch](/components/switch) for a setting that takes effect immediately.

Both exported controls are Material components. `TriStateCheckbox` adds the indeterminate presentation; parent and child coordination stays with the application.

## Examples

### Basic

Each checkbox owns an independent boolean. Bind `v-model` for the accepted value and set `name` to include the control in native form data.

<div class="vp-raw yam3x-doc-demo-theme"><CheckboxBasicExample /></div>

::: details View demo source

<<< ./demos/CheckboxBasicExample.vue{vue}

:::

### States and form participation

The first group is a real form: `required` blocks an empty submitted value, `value` supplies the submitted string, and the reset button restores the state the checkbox had when it mounted. The tri-state example shows the indeterminate mark; activating it selects the checkbox. The last example combines `disabled` with `invalid`.

<div class="vp-raw yam3x-doc-demo-theme"><CheckboxExample /></div>

::: details View demo source

<<< ./demos/CheckboxExample.vue{vue}

:::

`invalid` only applies the error presentation and `aria-invalid`; native `required` supplies validation. A disabled checkbox keeps its error treatment visible.

### Parent and child selection

The parent's state is derived from the available children: none selected is unchecked, some is indeterminate, and all is checked. Activating the parent selects or clears every available child. The unavailable child is disabled and is never submitted.

<div class="vp-raw yam3x-doc-demo-theme"><CheckboxGroupExample /></div>

::: details View demo source

<<< ./demos/CheckboxGroupExample.vue{vue}

:::

This coordination is application code. A checkbox represents one value and does not manage siblings.

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, TriStateCheckbox, type CheckboxState } from './components/yam3x/checkbox'

const updates = ref(false)
const topics = ref<CheckboxState>('indeterminate')
</script>

<template>
  <Checkbox
    v-model="updates"
    label="Email updates"
    name="updates"
    value="yes"
  />
  <TriStateCheckbox
    v-model="topics"
    label="All topics"
  />
</template>
```

`label` is required and also names the control. `description` adds supporting text and is associated with the native input.

::: details Form attributes and cancelled activation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from './components/yam3x/checkbox'

const accepted = ref(false)

function askForConsent(event: MouseEvent): void {
  if (!window.confirm('This choice requires confirmation.')) event.preventDefault()
}
</script>

<template>
  <form @submit.prevent>
    <Checkbox
      v-model="accepted"
      label="Accept the terms of use"
      name="terms"
      value="accepted"
      required
    />
    <Checkbox
      label="Locked by policy"
      :model-value="true"
      disabled
      invalid
      @click="askForConsent"
    />
    <button type="reset">Reset form</button>
  </form>
</template>
```

Preventing the forwarded `click` stops the state change and the native click. Native reset restores the state supplied when each checkbox mounted.

:::

## Behavior and accessibility

### States and activation

- The native input carries the checked state, so the platform controls Space activation, focus, and form submission.
- `TriStateCheckbox` also exposes `indeterminate`. Activating any state other than checked changes it to checked.
- While indeterminate, the input's `name` is omitted, so no value is submitted for that state.
- `invalid` adds the error color treatment and `aria-invalid="true"`. It does not make the control fail validation.
- Clicking or tapping the label and the control both activate the checkbox. Pressing the label forwards feedback to the 48px target.
- Neither export has a read-only mode. A disabled checkbox prevents changes but also removes its value from form data.

### Keyboard and focus

- Tab moves focus to the native input; Space toggles it.
- Focus draws a 3px `secondary` ring centered in the target. Hover and pressed states use the 40px state layer.
- `@click.prevent` cancels the activation while still forwarding the `click` event first.

### Forms

- A checked checkbox submits its `value` under `name`. Unchecked, indeterminate, and disabled checkboxes submit nothing.
- Native `required` reports a missing value during constraint validation; `form` associates a checkbox with a form outside its subtree.
- Native reset restores the state each checkbox had when it mounted, including an indeterminate state.

### State ownership

`v-model` owns the accepted selection. The component never writes sibling values, so a selection owner derives a parent state and applies parent changes to children. Reject a proposed change by leaving the model unchanged.

## API

### Exports

| Export             | Kind      | Use                                               |
| ------------------ | --------- | ------------------------------------------------- |
| `Checkbox`         | Component | Ordinary checked and unchecked selection.         |
| `TriStateCheckbox` | Component | Selection that can report an indeterminate state. |
| `CheckboxState`    | Type      | `'unchecked' \| 'checked' \| 'indeterminate'`.    |

### `Checkbox` props and models

| Prop / model  | Type      | Default  | Description                                             |
| ------------- | --------- | -------- | ------------------------------------------------------- |
| `v-model`     | `boolean` | `false`  | Accepted checked state.                                 |
| `label`       | `string`  | Required | Visible label and accessible name.                      |
| `description` | `string`  | —        | Supporting text associated with the native input.       |
| `id`          | `string`  | —        | Native input ID. The wrapping label also names it.      |
| `name`        | `string`  | —        | Native form field name.                                 |
| `value`       | `string`  | `'on'`   | Value submitted while checked.                          |
| `form`        | `string`  | —        | Associates the input with a form by ID.                 |
| `required`    | `boolean` | `false`  | Requires a checked value during native validation.      |
| `disabled`    | `boolean` | `false`  | Prevents activation and omits the value from form data. |
| `invalid`     | `boolean` | `false`  | Error color treatment and `aria-invalid`.               |

### `TriStateCheckbox` props and models

| Prop / model  | Type            | Default       | Description                                             |
| ------------- | --------------- | ------------- | ------------------------------------------------------- |
| `v-model`     | `CheckboxState` | `'unchecked'` | Accepted state, including indeterminate.                |
| `label`       | `string`        | Required      | Visible label and accessible name.                      |
| `description` | `string`        | —             | Supporting text associated with the native input.       |
| `id`          | `string`        | —             | Native input ID.                                        |
| `name`        | `string`        | —             | Native form field name; omitted while indeterminate.    |
| `value`       | `string`        | `'on'`        | Value submitted while checked.                          |
| `form`        | `string`        | —             | Associates the input with a form by ID.                 |
| `required`    | `boolean`       | `false`       | Requires a checked value during native validation.      |
| `disabled`    | `boolean`       | `false`       | Prevents activation and omits the value from form data. |
| `invalid`     | `boolean`       | `false`       | Error color treatment and `aria-invalid`.               |

### Events

| Event     | Payload      | Description                                              |
| --------- | ------------ | -------------------------------------------------------- |
| `click`   | `MouseEvent` | Forwarded from the native input before the state update. |
| `input`   | `Event`      | Forwarded native input event after activation.           |
| `change`  | `Event`      | Forwarded native change event.                           |
| `invalid` | `Event`      | Forwarded native invalid event from the input.           |

### Slots

Neither component declares slots; `label` and `description` render the visible text.

### Methods

Neither component exposes instance methods. Parent and child coordination is application code.

## Styling

No public component-specific CSS custom properties exist. The components consume shared System tokens, so theme them by setting `--md-sys-color-*`, typescale, motion, and density tokens at a theme root.

The box is 18px with a 2px corner, 2px enabled outline, a 40px state layer, and a 48px target. Selected containers and icons use `primary` and `on-primary`; the outline uses `on-surface-variant`; error states use `error` roles. Labels use Body Large and descriptions Body Medium. Reduce or enlarge surrounding density without shrinking the 48px target below the documented minimum.

## Material references

[Checkbox overview](https://m3.material.io/components/checkbox/overview) · [guidelines](https://m3.material.io/components/checkbox/guidelines) · [specs](https://m3.material.io/components/checkbox/specs) · [accessibility](https://m3.material.io/components/checkbox/accessibility)
