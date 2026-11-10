<script setup lang="ts">
import RadioGroupBasicExample from './demos/RadioGroupBasicExample.vue'
import RadioGroupExample from './demos/RadioGroupExample.vue'
</script>

# Radio button

Radio buttons let people select one option from a set of options. Use radio buttons (not switches) when only one item can be selected from a list.

`RadioGroup` and `RadioButton` compose the Material radio control with a project-defined group wrapper: the group label and description, per-option supporting text, the invalid state, and the secondary focus ring are extensions around the Material control. Material recommends radio buttons for five or fewer visible choices.

## Examples

### Basic

The group owns the selected value and names the set. Each option needs a unique string `value`, and the option label fills the default slot.

<div class="vp-raw yam3x-doc-demo-theme"><RadioGroupBasicExample /></div>

::: details View demo source

<<< ./demos/RadioGroupBasicExample.vue{vue}

:::

### Selection, validation, and forms

The demo covers the project behaviors: a preselectable group with a disabled option and per-option description, a required group that starts empty, an invalid group, a required form with submit and reset, a group-level disabled state, an externally associated form, and a group without a submitted field.

<div class="vp-raw yam3x-doc-demo-theme"><RadioGroupExample /></div>

::: details View demo source

<<< ./demos/RadioGroupExample.vue{vue}

:::

Native validation marks the required group invalid when nothing is selected, and selecting an option clears that state. Reset restores the value the group had when it mounted.

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioButton, RadioGroup } from './components/yam3x/radio-group'

const delivery = ref<string | null>('pickup')
</script>

<template>
  <RadioGroup
    v-model="delivery"
    label="Delivery method"
    name="delivery"
    required
  >
    <RadioButton value="pickup">Pickup</RadioButton>
    <RadioButton
      value="shipping"
      description="Arrives in two business days"
    >
      Shipping
    </RadioButton>
  </RadioGroup>
</template>
```

Every `RadioButton` must be rendered inside a `RadioGroup`; the component reports an error otherwise. The group's `name` is the submitted field name, and `form` associates it with a form outside its subtree.

::: details Empty selections, external forms, and disabled options

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioButton, RadioGroup } from './components/yam3x/radio-group'

const layout = ref<string | null>(null)
</script>

<template>
  <form id="layout-form" />
  <RadioGroup
    v-model="layout"
    label="Density"
    name="layout"
    form="layout-form"
  >
    <RadioButton value="none">None</RadioButton>
    <RadioButton value="compact">Compact</RadioButton>
    <RadioButton
      value="comfortable"
      disabled
    >
      Comfortable
    </RadioButton>
  </RadioGroup>
</template>
```

Leaving the model as `null` starts the group with no selection, which native keyboard behavior allows. A disabled option stays in the reading order but cannot be selected. To let people clear a choice, provide an explicit option such as “None”.

:::

## Behavior and accessibility

### Group semantics

- The group renders `role="radiogroup"` and takes its accessible name from the visible label. The group description describes the set; each option's description is associated with its own input.
- `required` sets `aria-required` and the native inputs' `required`; a failed constraint validation marks the group `aria-invalid`.
- `invalid` applies the error presentation to the group and its options. Native validation also sets it until a selection is accepted.
- Options stack vertically. The wrapper does not expose a horizontal orientation.

### Selection and state ownership

- Only one value is accepted. `v-model` holds `string | null`; `null` represents no selection.
- Selecting a value is a proposal: leaving the model unchanged rejects it, and the native inputs are resynchronized with the accepted value.
- Activating the selected option again keeps it selected. Set the model to `null` programmatically to clear the group.
- An option's `disabled` combines with the group's `disabled`; a disabled group disables every native radio.

### Keyboard and focus

- Tab enters the selected option. With no selection, Tab enters the first enabled option and Shift+Tab enters the last.
- Arrow keys move focus and selection, wrap around the group, and skip disabled options. Space selects the focused option.
- In RTL layouts, horizontal arrow direction follows the writing direction; ArrowLeft moves to the next option.
- Focus draws a 3px `secondary` ring centered in the 48px target.

### Forms

- A selected option submits its `value` under the group's `name`; an unselected group submits nothing unless `required` blocks submission.
- A group without a `name` still works with native keyboard navigation but is removed from submitted form data, so it never invents a field name.
- Native reset restores the value accepted when the group mounted. Disabled groups submit nothing.

## API

### Exports

| Export        | Kind      | Use                                                       |
| ------------- | --------- | --------------------------------------------------------- |
| `RadioGroup`  | Component | Names, validates, and owns the selected value.            |
| `RadioButton` | Component | One native radio option inside a group; required context. |

### `RadioGroup` props and models

| Prop / model  | Type             | Default   | Description                                                                      |
| ------------- | ---------------- | --------- | -------------------------------------------------------------------------------- |
| `v-model`     | `string \| null` | `null`    | Accepted selected value; null means no selection.                                |
| `label`       | `string`         | Required  | Visible group label and accessible name.                                         |
| `description` | `string`         | —         | Supporting text associated with the group.                                       |
| `id`          | `string`         | —         | Group element ID; label and description IDs derive from it or a generated value. |
| `name`        | `string`         | Generated | Submitted field name; an unnamed group submits nothing.                          |
| `form`        | `string`         | —         | Associates the inputs with a form by ID.                                         |
| `required`    | `boolean`        | `false`   | Requires a selection during native validation.                                   |
| `disabled`    | `boolean`        | `false`   | Disables every option in the group.                                              |
| `invalid`     | `boolean`        | `false`   | Applies the error presentation and `aria-invalid`.                               |

### `RadioButton` props

| Prop          | Type      | Default   | Description                                          |
| ------------- | --------- | --------- | ---------------------------------------------------- |
| `value`       | `string`  | Required  | Unique value submitted when this option is selected. |
| `description` | `string`  | —         | Supporting text associated with this option's input. |
| `disabled`    | `boolean` | `false`   | Prevents selecting this option.                      |
| `id`          | `string`  | Generated | Native input ID.                                     |

The default slot renders the visible option label.

### Events

| Event               | Payload          | Description                                                        |
| ------------------- | ---------------- | ------------------------------------------------------------------ |
| `update:modelValue` | `string \| null` | Proposes a selected value; bind with `v-model`.                    |
| `input`             | `Event`          | Forwarded native input event from the selected radio.              |
| `change`            | `Event`          | Forwarded native change event.                                     |
| `invalid`           | `Event`          | Forwarded native invalid event; capture it on the group as needed. |

### Slots

`RadioButton` has one default slot for its label. `RadioGroup` places option content in its default slot.

### Methods

Neither component exposes instance methods.

## Styling

No public component-specific CSS custom properties exist. The components map shared System roles, so theme them at a `--md-sys-color-*`, typescale, motion, or density root.

The option uses a 20px icon, a 40px state layer, and a 48px target; focus draws a 44px `secondary` ring with a 3px stroke. Selected and unselected icons map to `primary` and `on-surface-variant`, error options to `error`, and labels to Body Large with Body Medium descriptions. The group label uses Title Small and its description Body Medium.

## Material references

[Radio button overview](https://m3.material.io/components/radio-button/overview) · [guidelines](https://m3.material.io/components/radio-button/guidelines) · [specs](https://m3.material.io/components/radio-button/specs) · [accessibility](https://m3.material.io/components/radio-button/accessibility)
