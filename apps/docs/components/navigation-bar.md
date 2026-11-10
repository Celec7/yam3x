<script setup lang="ts">
import NavigationBarExample from './demos/NavigationBarExample.vue'
import NavigationBarNavigateExample from './demos/NavigationBarNavigateExample.vue'
import NavigationBarStatesExample from './demos/NavigationBarStatesExample.vue'
</script>

# Navigation bar

Navigation bars let people switch between UI views on smaller devices. They’re a common navigation component on handheld screens.

`NavigationBar` renders a navigation landmark with native links. It is the navigation bar for compact and medium windows; use a [navigation rail](/components/navigation-rail) for wider layouts.

## Examples

### Basic

Navigation bars can have three to five destinations. This demo keeps the bar visible at every viewport width and adds a navigation rail at 960px and wider only as a separate alternative.

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarExample />
</div>

::: details View demo source

<<< ./demos/NavigationBarExample.vue{vue}

:::

### States

`disabled` removes an item from sequential keyboard focus. `disabledInteractive` keeps the item focusable for discovery while preserving disabled semantics; neither state navigates or changes the selection.

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarStatesExample />
</div>

::: details View demo source

<<< ./demos/NavigationBarStatesExample.vue{vue}

:::

### Cancelling navigation

`navigate` fires before `v-model` changes. Calling `preventDefault()` on its event cancels both the selection update and the native link navigation.

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarNavigateExample />
</div>

::: details View demo source

<<< ./demos/NavigationBarNavigateExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationBar, NavigationBarItem } from './components/yam3x/navigation-bar'
import { Icon } from './components/yam3x/icon'

const current = ref('home')

function guardNavigation(destination: { value: string }, event: MouseEvent) {
  if (destination.value === 'saved') event.preventDefault()
}
</script>

<template>
  <NavigationBar
    v-model="current"
    label="Main navigation"
    @navigate="guardNavigation"
  >
    <NavigationBarItem
      value="home"
      label="Home"
      href="/"
    >
      <template #icon="{ selected }">
        <Icon
          name="home"
          :filled="selected"
        />
      </template>
    </NavigationBarItem>
    <NavigationBarItem
      value="saved"
      label="Saved"
      href="/saved"
    >
      <template #icon="{ selected }">
        <Icon
          name="bookmark"
          :filled="selected"
        />
      </template>
    </NavigationBarItem>
  </NavigationBar>
</template>
```

## Behavior and accessibility

### Keyboard

- Enter and Space both activate a link; Space does not scroll the page.
- Tab reaches each enabled item in order. `disabled` items are skipped; `disabledInteractive` items remain in tab order.
- Modifier-clicks and middle-clicks keep native link behavior and do not change the current selection.

### Focus and activation

- The selected item uses `aria-current="page"`, a bold label, and the filled icon or `#selected-icon` you provide.
- Disabled items render `aria-disabled="true"`, omit `href`, `target`, `rel`, and `download`, and cannot be activated.
- `navigate` is not emitted for modifier-clicks, non-primary buttons, or already-prevented events. In those cases `v-model` does not change.

### Responsive and RTL

- `layout="auto"` switches from vertical to horizontal items at a 600px viewport width. This breakpoint is a project decision, not an official Material breakpoint.
- The bar scrolls horizontally instead of wrapping. Labels remain fully visible and can wrap at 2× zoom.
- Icons, labels, and badges mirror with the document direction; the component does not switch its layout from `dir`.

### State ownership

- `v-model` owns the current destination and stays in sync with your route.
- Each item's `href` performs native navigation. Update the model from your router or route watcher when the route changes.
- The page decides when to replace the bar with a navigation rail; the components do not switch automatically.

## API

### Exports

`NavigationBar`, `NavigationBarItem`, `NavigationBarDestination`, and `NavigationBarLayout`.

### `NavigationBar`

| Prop         | Type                                   | Default  | Description                                                          |
| ------------ | -------------------------------------- | -------- | -------------------------------------------------------------------- |
| `label`      | `string`                               | Required | Accessible name of the navigation landmark.                          |
| `layout`     | `'vertical' \| 'horizontal' \| 'auto'` | `'auto'` | Item arrangement. `auto` switches to horizontal at a 600px viewport. |
| `modelValue` | `string` (`v-model`)                   | `''`     | `value` of the current destination.                                  |

### `NavigationBarItem`

| Prop                  | Type                | Default  | Description                                                                                |
| --------------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `value`               | `string`            | Required | Stable unique destination value.                                                           |
| `label`               | `string`            | Required | Visible destination label.                                                                 |
| `href`                | `string`            | Required | Native destination URL.                                                                    |
| `ariaLabel`           | `string`            | —        | Accessible name override when the visible label needs clarification.                       |
| `disabled`            | `boolean`           | `false`  | Prevents navigation and removes the item from sequential keyboard focus.                   |
| `disabledInteractive` | `boolean`           | `false`  | Shows disabled semantics while retaining Tab focus; does not navigate or change selection. |
| `target`              | `string`            | —        | Native link target, omitted when the item is disabled or disabledInteractive.              |
| `rel`                 | `string`            | —        | Native link relationship, omitted when the item is disabled or disabledInteractive.        |
| `download`            | `boolean \| string` | —        | Native download attribute, omitted when the item is disabled or disabledInteractive.       |

### Events

| Event      | Payload                                                      | Description                                                                                   |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `navigate` | `(destination: NavigationBarDestination, event: MouseEvent)` | Emitted before the model updates. `preventDefault()` cancels selection and native navigation. |

`NavigationBarItem` does not emit component events; native listeners such as `click` fall through to its anchor.

### Slots

| Component           | Slot            | Props                   | Description                                                    |
| ------------------- | --------------- | ----------------------- | -------------------------------------------------------------- |
| `NavigationBar`     | `default`       | —                       | `NavigationBarItem` children.                                  |
| `NavigationBarItem` | `icon`          | `{ selected: boolean }` | Destination icon; use `selected` to render the filled variant. |
| `NavigationBarItem` | `selected-icon` | —                       | Replaces `icon` while the destination is selected.             |
| `NavigationBarItem` | `badge`         | `{ selected: boolean }` | Dot or count badge positioned beside the icon.                 |

### Methods

`NavigationBar` and `NavigationBarItem` expose no public methods.

## Styling

No public component-specific CSS custom properties are defined. Colors, shape, typography, and state layers follow System tokens; use the theme to change them globally. For a one-off layout change, pass a class to the bar or item.

## Material references

[Navigation bar overview](https://m3.material.io/components/navigation-bar/overview) · [guidelines](https://m3.material.io/components/navigation-bar/guidelines) · [specs](https://m3.material.io/components/navigation-bar/specs) · [accessibility](https://m3.material.io/components/navigation-bar/accessibility)
