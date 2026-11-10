<script setup lang="ts">
import SwitchExample from './demos/SwitchExample.vue'
import SwitchFormExample from './demos/SwitchFormExample.vue'
import SwitchIconsExample from './demos/SwitchIconsExample.vue'
</script>

# Switch

Switches toggle the selection of an item on or off. Switches are the best way to let users adjust settings.

`Switch` is a Material component. The icon mappings, the pressed-handle interpolation, and the custom thumb slot are project decisions documented below.

## Examples

### Basic

The demo pairs each setting with a stable label and optional supporting text. The first switches take effect immediately, the custom thumb receives the accepted state, and the last example stays disabled while keeping its unselected icon visible.

<div class="vp-raw yam3x-doc-demo-theme"><SwitchExample /></div>

::: details View demo source

<<< ./demos/SwitchExample.vue{vue}

:::

### Icons and direction

`icons="selected"` shows the check only when the setting is on, and `icons="both"` adds a close icon when it is off. `dir` resolves the handle position and the label's writing direction.

<div class="vp-raw yam3x-doc-demo-theme"><SwitchIconsExample /></div>

::: details View demo source

<<< ./demos/SwitchIconsExample.vue{vue}

:::

### Form participation and disabled fieldset

A switch submits through the native checkbox it renders. This form requires the announcements switch before it can be submitted; a fieldset disables the group below it.

<div class="vp-raw yam3x-doc-demo-theme"><SwitchFormExample /></div>

::: details View demo source

<<< ./demos/SwitchFormExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from './components/yam3x/switch'

const notifications = ref(false)
</script>

<template>
  <Switch
    v-model="notifications"
    label="Notifications"
    name="notifications"
    description="Receive important updates"
  />
</template>
```

`label` is required and supplies the accessible name. Put the setting name in the label, not only in an icon.

::: details Custom thumb content and required switches

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from './components/yam3x/icon'
import { Switch } from './components/yam3x/switch'

const sync = ref(true)
const announcements = ref(false)
</script>

<template>
  <Switch
    v-model="sync"
    label="Sync across devices"
  >
    <template #thumb-content="{ checked }">
      <Icon :name="checked ? 'check' : 'close'" />
    </template>
  </Switch>
  <form>
    <Switch
      v-model="announcements"
      label="Product announcements"
      name="announcements"
      required
    />
  </form>
</template>
```

`#thumb-content` replaces the built-in icons and keeps its wrapper decorative. Keep the content sized to the icon area so the handle geometry stays intact.

:::

## Behavior and accessibility

### Activation and states

- The setting updates as soon as the switch is activated; there is no separate commit action.
- The hidden native checkbox reflects the state, so `required` and form association follow native constraint validation.
- `disabled` and a disabled ancestor `fieldset` both prevent activation. With `icons="both"`, the unselected icon remains visible in the disabled state.
- `icons="selected"` shows a check only when on; `icons="both"` shows a check when on and a close icon when off. Icons are decorative.
- A custom `#thumb-content` receives `{ checked }` and replaces the icon treatment; its wrapper is hidden from assistive technology.
- A switch has no read-only mode; `disabled` prevents changes and omits the control from form data.

### Keyboard and focus

- Tab focuses the switch's hidden input, which exposes `role="switch"` and `aria-checked`.
- Space toggles natively. Enter is also handled and toggles the switch.
- Focus draws a 3px `secondary` indicator with a 2px offset around the track. The 40px state layer stays inside the 48px target.
- The handle expands to 28px while pressed and returns with the spatial spring.

### Direction and layout

- `dir` sets the switch's own direction and resolves the handle's logical start side; when omitted, it inherits the document direction.
- The inline label and supporting text follow the resolved writing direction.
- A switch is not a group control: use radio buttons for mutually exclusive choices and checkboxes for multiple selections.

### Forms

- A checked switch submits its `value` (default `'on'`) under `name`; an unchecked switch submits nothing.
- `form` associates the control with a form outside its subtree.
- `disabled` omits the value from form data. Child controls inherit `fieldset[disabled]`.
- Native reset is owned by the surrounding form; the application should restore its own model when it needs a specific initial state.

## API

### Exports

| Export   | Kind      | Use                                                    |
| -------- | --------- | ------------------------------------------------------ |
| `Switch` | Component | A single binary setting that takes effect immediately. |

### `Switch` props and models

| Prop / model  | Type                             | Default   | Description                                                        |
| ------------- | -------------------------------- | --------- | ------------------------------------------------------------------ |
| `v-model`     | `boolean`                        | `false`   | Accepted on/off state.                                             |
| `label`       | `string`                         | Required  | Visible label and accessible name.                                 |
| `description` | `string`                         | —         | Supporting text associated with the hidden input.                  |
| `icons`       | `'none' \| 'selected' \| 'both'` | `'none'`  | Track icon mode.                                                   |
| `disabled`    | `boolean`                        | `false`   | Prevents activation; a disabled fieldset also disables the switch. |
| `dir`         | `'ltr' \| 'rtl'`                 | Inherited | Resolves the handle side and writing direction.                    |
| `id`          | `string`                         | —         | ID applied to the hidden input.                                    |
| `name`        | `string`                         | —         | Native form field name.                                            |
| `value`       | `string`                         | `'on'`    | Value submitted while on.                                          |
| `form`        | `string`                         | —         | Associates the input with a form by ID.                            |
| `required`    | `boolean`                        | `false`   | Requires an on value during native validation.                     |

### `Switch` slots

| Slot            | Scope         | Description                                                |
| --------------- | ------------- | ---------------------------------------------------------- |
| `thumb-content` | `{ checked }` | Replaces the built-in icons; the wrapper is `aria-hidden`. |

### Events

The only emitted update is `update:modelValue`, bound with `v-model`. The component declares no other events.

### Methods

The component exposes no instance methods.

## Styling

No public component-specific CSS custom properties exist. The switch maps shared System roles through its own internal tokens.

The track is 52 × 32px with a 2px outline when off and a fully rounded shape. The handle is 16px when off and 24px when on; showing an icon in either state uses 24px, and the pressed handle expands to 28px. The unselected and selected centers sit 16px and 36px from the leading track edge. Selected tracks use `primary` with an `on-primary` handle; the unselected handle uses `outline` and hover uses `on-surface-variant`. Focus uses a 3px `secondary` indicator with a 2px offset. Selected icons use `primary` and the selected hover handle uses `primary-container`; these mappings are project decisions.

## Material references

[Switch overview](https://m3.material.io/components/switch/overview) · [guidelines](https://m3.material.io/components/switch/guidelines) · [specs](https://m3.material.io/components/switch/specs) · [accessibility](https://m3.material.io/components/switch/accessibility)
