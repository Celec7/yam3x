<script setup lang="ts">
import NavigationBarExample from './demos/NavigationBarExample.vue'
</script>

# Navigation bar

Navigation bars help people switch among top-level destinations in a compact layout. Use a small set of peer destinations and keep each item’s icon, label, and selected state understandable.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarExample />
</div>

::: details View demo source

<<< ./demos/NavigationBarExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationBar, NavigationBarItem } from './components/yam3x/navigation-bar'
import { Icon } from './components/yam3x/icon'

const current = ref('home')
</script>

<template>
  <NavigationBar
    v-model="current"
    label="Main navigation"
  >
    <NavigationBarItem
      value="home"
      label="Home"
      href="/"
    >
      <template #icon><Icon name="home" /></template>
    </NavigationBarItem>
    <NavigationBarItem
      value="saved"
      label="Saved"
      href="/saved"
    >
      <template #icon><Icon name="bookmark" /></template>
    </NavigationBarItem>
  </NavigationBar>
</template>
```

## API

| Prop                          | Type                                   | Default  | Description                                                                                |
| ----------------------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `label`                       | `string`                               | Required | Accessible name of the navigation landmark.                                                |
| `modelValue`                  | `v-model: string`                      | `''`     | `value` of the current destination.                                                        |
| `layout`                      | `'vertical' \| 'horizontal' \| 'auto'` | `'auto'` | Vertical or horizontal item arrangement. `auto` switches at the project 600px threshold.   |
| `NavigationBarItem.value`     | `string`                               | Required | Stable unique destination value.                                                           |
| `NavigationBarItem.label`     | `string`                               | Required | Visible destination label.                                                                 |
| `NavigationBarItem.href`      | `string`                               | Required | Native destination URL.                                                                    |
| `NavigationBarItem.ariaLabel` | `string`                               | —        | Accessible name override when the visible label needs clarification.                       |
| `disabled`                    | `boolean` on each item                 | `false`  | Prevents navigation and removes the item from sequential keyboard focus.                   |
| `disabledInteractive`         | `boolean` on each item                 | `false`  | Shows disabled semantics while retaining Tab focus; does not navigate or change selection. |
| `target` / `rel` / `download` | Native link props on each item         | —        | Forwarded for enabled links; omitted from disabled items.                                  |

Compose destinations with `NavigationBarItem` children in the default slot. Its `#icon` slot receives `{ selected }`; optional `#selected-icon` replaces it while selected; `#badge` receives `{ selected }` and places a dot or count badge beside the icon. The root emits `navigate(destination, MouseEvent)` before updating `v-model`; calling `preventDefault()` on that event cancels both selection and native navigation. Modifier and middle-click retain native link behavior without changing the current selection.

## Behavior and accessibility

Enter and Space both activate a link from the keyboard; Space does not scroll the page. The selected item uses a bold label and a filled icon or `#selected-icon`. Text can wrap at 2× zoom and remains fully visible.

`auto` changes the bar from vertical to horizontal at 600px. This breakpoint is a project decision, not an official Material breakpoint. The page composes Navigation Rail in place of the bar at 960px and above; the components do not switch one another automatically.

## Material references

[Navigation bar overview](https://m3.material.io/components/navigation-bar/overview) · [guidelines](https://m3.material.io/components/navigation-bar/guidelines) · [specs](https://m3.material.io/components/navigation-bar/specs) · [accessibility](https://m3.material.io/components/navigation-bar/accessibility)
