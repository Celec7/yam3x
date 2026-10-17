<script setup lang="ts">
import IconButtonExample from './demos/IconButtonExample.vue'
</script>

# Icon buttons

Icon buttons use an icon to represent a compact action. Each needs a stable accessible name that explains the action, even when a tooltip is also shown.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <IconButtonExample />
</div>

::: details View demo source

<<< ./demos/IconButtonExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
import IconToggleButton from './components/yam3x/icon-button/icon-toggle-button.vue'
import Icon from './components/yam3x/icon/icon.vue'

const favorite = ref(false)
</script>

<template>
  <IconButton aria-label="Search"
    ><Icon
      name="search"
      filled
  /></IconButton>
  <IconToggleButton
    v-model:checked="favorite"
    aria-label="Favorite"
  >
    <Icon name="favorite" />
    <template #selected-icon
      ><Icon
        name="favorite"
        filled
    /></template>
  </IconToggleButton>
</template>
```

## API

| Prop                                  | Type                                                     | Default         | Description                                                                                                           |
| ------------------------------------- | -------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `variant`                             | `standard \| filled \| tonal \| outlined`                | `filled`        | Visual style.                                                                                                         |
| `size`                                | `extra-small \| small \| medium \| large \| extra-large` | `small`         | Icon button size.                                                                                                     |
| `width`                               | `narrow \| default \| wide`                              | `default`       | Horizontal size.                                                                                                      |
| `shape`                               | `round \| square`                                        | `round`         | Resting shape.                                                                                                        |
| `href`, `disabled`                    | `string`, `boolean`                                      | —, `false`      | Native link mode and disabled state for `IconButton`.                                                                 |
| `disabledInteractive`                 | `boolean`                                                | `false`         | Keeps a disabled control focusable and explains why it is unavailable while preventing activation and state feedback. |
| `type`, `id`, `name`, `value`, `form` | Native props                                             | `type="button"` | Form attributes for button mode.                                                                                      |
| `IconToggleButton` `v-model:checked`  | `boolean`                                                | `false`         | Binary selection state. Use `role="radio"` for a single-select option in a group.                                     |

`IconButton` emits `click(MouseEvent)`. `IconToggleButton` emits `click(MouseEvent)` and `update:checked`; it accepts `#selected-icon` for selected content.

## Behavior and accessibility

`IconButton` performs an action; `IconToggleButton` holds binary selection. A radio toggle stays selected when activated again. Use a filled icon for a default button. For toggles, provide an outlined icon by default and its filled version through `#selected-icon`; if no filled icon exists, increase its weight to semibold or bold. Provide `aria-label` or another stable accessible name; a tooltip must not be the only name. On Web, compose [Tooltip](/components/tooltip) for icon-only actions on hover and focus. Use `href` for navigation and preserve native link behavior.

## Styling

Colors follow Material system roles, so changing the app theme updates the component. Component-specific geometry remains internal rather than exposing token overrides.

## Material references

[Icon buttons overview](https://m3.material.io/components/icon-buttons/overview) · [guidelines](https://m3.material.io/components/icon-buttons/guidelines) · [specs](https://m3.material.io/components/icon-buttons/specs) · [accessibility](https://m3.material.io/components/icon-buttons/accessibility)
