<script setup lang="ts">
import SwitchExample from './demos/SwitchExample.vue'
</script>

# Switch

Switch controls a setting that takes effect immediately. Pair it with a clear label; use radio buttons when the user must choose one option from a set.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <SwitchExample />
</div>

::: details View demo source

<<< ./demos/SwitchExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Switch from './components/yam3x/switch/switch.vue'

const notifications = ref(false)
</script>

<template>
  <Switch
    v-model="notifications"
    label="Notifications"
    name="notifications"
  />
</template>
```

## API

| Prop                          | Type                       | Default      | Description                                                    |
| ----------------------------- | -------------------------- | ------------ | -------------------------------------------------------------- |
| `label`                       | `string`                   | Required     | Visible label and accessible name of the switch.               |
| `modelValue`                  | `boolean`                  | `false`      | On/off state, bound with `v-model`.                            |
| `description`                 | `string`                   | —            | Supporting text associated with the switch input.              |
| `icons`                       | `none \| selected \| both` | `none`       | Track icon display mode.                                       |
| `disabled`, `required`        | `boolean`                  | `false`      | Disabled and native required states.                           |
| `dir`                         | `ltr \| rtl`               | Inherited    | Control direction; inherits the document direction when unset. |
| `id`, `name`, `value`, `form` | Native form attributes     | `value="on"` | Controls the ID, submitted value, and form association.        |

The `#thumb-content` slot receives `{ checked }` and renders custom visual content inside the handle. When provided, it replaces the built-in `icons` content; without it, `icons` works as usual. Keep slot content decorative and sized to the 16px icon area.

## Behavior and accessibility

With `icons="both"`, the unselected icon remains visible while the switch is disabled.

A Switch represents a binary setting that takes effect immediately, not one of several choices applied only on form submission. Use a clear visible label; do not rely only on on/off icons to convey the state. Tab focuses the switch handle; Space and Enter toggle it. The component also supports form submission and reset, and responds to `fieldset disabled`.

## Material references

[Switch overview](https://m3.material.io/components/switch/overview) · [guidelines](https://m3.material.io/components/switch/guidelines) · [specs](https://m3.material.io/components/switch/specs) · [accessibility](https://m3.material.io/components/switch/accessibility)
