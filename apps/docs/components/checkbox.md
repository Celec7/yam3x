<script setup lang="ts">
import CheckboxExample from './demos/CheckboxExample.vue'
</script>

# Checkbox

Checkbox lets people independently select one or more options. Use it when selections can coexist; use a radio button when only one option can be selected.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <CheckboxExample />
</div>

::: details View demo source

<<< ./demos/CheckboxExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, TriStateCheckbox } from './components/yam3x/checkbox'
import type { CheckboxState } from './components/yam3x/checkbox'

const updates = ref(false)
const topics = ref<CheckboxState>('indeterminate')
</script>

<template>
  <Checkbox
    v-model="updates"
    label="Email updates"
    name="updates"
  />
  <TriStateCheckbox
    v-model="topics"
    label="All topics"
  />
</template>
```

## API

| Component / prop                  | Type                                                            | Default       | Description                                                                       |
| --------------------------------- | --------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------- |
| `Checkbox`                        |                                                                 |               | Use for an ordinary unchecked or checked selection.                               |
| `TriStateCheckbox`                |                                                                 |               | Use when the control can represent a partial selection.                           |
| `v-model` on `Checkbox`           | `boolean`                                                       | `false`       | Selected state.                                                                   |
| `v-model` on `TriStateCheckbox`   | `CheckboxState` (`'unchecked' \| 'checked' \| 'indeterminate'`) | `'unchecked'` | State; activating an indeterminate checkbox changes it to checked.                |
| `label`                           | `string`                                                        | Required      | Visible label and accessible name of the checkbox.                                |
| `description`                     | `string`                                                        | —             | Supporting text associated with the native input.                                 |
| `name`, `value`, `form`           | Native form attributes                                          | `value="on"`  | Controls form association and submitted value. An indeterminate value is omitted. |
| `required`, `disabled`, `invalid` | `boolean`                                                       | `false`       | Required validation, disabled state, and error presentation.                      |
| `id`                              | `string`                                                        | —             | ID of the native input; `label` can provide an implicit label.                    |

Both components emit `click`, `input`, `change`, and `invalid`. The native `input`, `change`, and `invalid` events are forwarded from the checkbox input.

## Behavior and accessibility

Both components use native checkbox inputs for form and keyboard behavior. Activating an indeterminate `TriStateCheckbox` changes it to checked. Prevent `click` with `@click.prevent` to cancel activation. Parent and child selection coordination remains the caller's responsibility.

## Material references

[Checkbox overview](https://m3.material.io/components/checkbox/overview) · [guidelines](https://m3.material.io/components/checkbox/guidelines) · [specs](https://m3.material.io/components/checkbox/specs) · [accessibility](https://m3.material.io/components/checkbox/accessibility)
