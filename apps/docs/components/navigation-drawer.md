<script setup lang="ts">
import NavigationDrawerExample from './demos/NavigationDrawerExample.vue'
</script>

# Navigation drawer

The navigation drawer is no longer recommended in the Material 3 Expressive update. For those who have updated, use an expanded navigation rail, which has mostly the same functionality of the navigation drawer and adapts better across breakpoints.

`NavigationDrawer` supports existing drawer-based screens. Navigation drawers provide access to destinations in your app. There are two variants of navigation drawers: standard and modal.

## Examples

### Basic

The demo opens a named modal drawer in a narrow container, moves focus to the first destination, and closes after a destination is selected. Its controls switch between `auto`, standard, and modal modes and change the panel width; the header, a badge, and a disabled destination are visible in the same composition.

The surrounding application updates the page heading and moves focus into the new content.

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationDrawerExample />
</div>

::: details View demo source

<<< ./demos/NavigationDrawerExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerItem,
  NavigationDrawerSection,
} from './components/yam3x/navigation-drawer'

const open = ref(false)
const current = ref('inbox')
</script>

<template>
  <NavigationDrawer
    v-model:open="open"
    v-model:selected="current"
    mode="auto"
    label="Main navigation"
  >
    <template #toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        Menu
      </button>
    </template>

    <NavigationDrawerSection label="Mail">
      <NavigationDrawerItem
        value="inbox"
        label="Inbox"
        href="/inbox"
      />
      <NavigationDrawerItem
        value="saved"
        label="Saved"
        href="/saved"
      />
    </NavigationDrawerSection>
    <NavigationDrawerDivider />
    <NavigationDrawerItem
      value="archive"
      label="Archive"
      href="/archive"
    />

    <template #content>
      <main>Current page content</main>
    </template>
  </NavigationDrawer>
</template>
```

## Behavior and accessibility

### Keyboard

- Arrow Down and Arrow Up move through visible, enabled destinations; Home and End move to the first and last.
- Typeahead matches the start of a destination label within 700ms.
- Enter follows a destination link. Space activates a link without scrolling the page.
- Arrow Right expands a branch; Arrow Left collapses it or moves focus to its parent. Both arrows mirror in RTL.

### Focus and dismissal

- Modal drawers receive dialog semantics, trap focus, and focus the first destination when opened.
- A modal drawer closes through the scrim, Escape, an edge swipe, or destination selection. Dismissal restores focus to the element that opened it.
- A standard drawer remains open after a destination is selected. It has no dialog semantics.
- An optional `close` slot adds a visible in-panel close control for modal drawers.
- Application routing and focus in newly rendered page content remain application responsibilities.

### Responsive

- `mode="auto"` measures the container and uses modal below `standardBreakpoint` and standard at or above it. The default is 840px; this threshold follows the compact/medium versus expanded layout boundary and is a project decision.
- Before the first measurement, `auto` resolves to modal.
- `width` and `maxWidth` bound the panel; the panel does not cover the whole viewport.

### State ownership

- `v-model:selected` is required and should follow the current route.
- `v-model:open` owns visibility. When unbound, modal mode starts closed and standard mode starts open.
- `change` reports user-driven open-state changes with a reason: `toggle`, `dismiss`, or `select`.

## API

`NavigationDrawer` inherits built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. `locale` overrides the provider language and falls back to `en-US`; existing label props override the corresponding shared defaults.

### Exports

`NavigationDrawer`, `NavigationDrawerSection`, `NavigationDrawerDivider`, `NavigationDrawerItem`, `NavigationDrawerMode`, `NavigationDrawerChangeReason`, `NavigationDrawerCloseSlotProps`, and `NavigationDrawerToggleSlotProps`.

### `NavigationDrawer`

| Prop                 | Type                              | Default     | Description                                                               |
| -------------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `label`              | `string`                          | Required    | Names the modal panel and defaults the navigation landmark name.          |
| `navigationLabel`    | `string`                          | —           | Gives the navigation landmark a different name from the modal panel.      |
| `mode`               | `'modal' \| 'standard' \| 'auto'` | `'auto'`    | Drawer presentation. `auto` follows the container width.                  |
| `standardBreakpoint` | `number`                          | `840`       | Container width in pixels where `auto` switches from modal to standard.   |
| `width`              | `string`                          | `'360px'`   | Panel width.                                                              |
| `maxWidth`           | `string`                          | `'360px'`   | Panel maximum width.                                                      |
| `closeLabel`         | `string`                          | —           | Accessible name for the close control; falls back to LocaleProvider text. |
| `locale`             | `string`                          | Provider    | Overrides LocaleProvider language, then falls back to `en-US`.            |
| `selected`           | `string` (`v-model:selected`)     | Required    | `value` of the current destination.                                       |
| `open`               | `boolean` (`v-model:open`)        | `undefined` | Visibility. When unbound, modal starts closed and standard starts open.   |

### `NavigationDrawerSection`

| Prop    | Type     | Default | Description                                            |
| ------- | -------- | ------- | ------------------------------------------------------ |
| `label` | `string` | —       | Visible group label and accessible name for the group. |

### `NavigationDrawerItem`

| Prop       | Type                       | Default  | Description                                                                     |
| ---------- | -------------------------- | -------- | ------------------------------------------------------------------------------- |
| `value`    | `string`                   | Required | Stable unique destination or branch value.                                      |
| `label`    | `string`                   | Required | Visible label.                                                                  |
| `href`     | `string`                   | —        | Native destination URL. Required for leaf destinations; forbidden for branches. |
| `disabled` | `boolean`                  | `false`  | Disables the item and any nested items.                                         |
| `target`   | `string`                   | —        | Native link target for leaf destinations.                                       |
| `rel`      | `string`                   | —        | Native link relationship for leaf destinations.                                 |
| `download` | `boolean \| string`        | —        | Native download attribute for leaf destinations.                                |
| `open`     | `boolean` (`v-model:open`) | `false`  | Expanded state of a branch.                                                     |

### `NavigationDrawerDivider`

No props, models, events, or slots. It renders a presentation divider between destinations.

### Events

#### `NavigationDrawer`

| Event    | Payload                                                         | Description                                      |
| -------- | --------------------------------------------------------------- | ------------------------------------------------ |
| `select` | `(value: string, href: string \| undefined, event: MouseEvent)` | A destination was activated.                     |
| `change` | `(open: boolean, reason: 'toggle' \| 'dismiss' \| 'select')`    | The open state changed for a user-driven reason. |

#### `NavigationDrawerItem`

| Event     | Payload                          | Description                         |
| --------- | -------------------------------- | ----------------------------------- |
| `toggle`  | `(open: boolean, value: string)` | A branch was expanded or collapsed. |
| `opening` | `(value: string)`                | A branch started expanding.         |
| `opened`  | `(value: string)`                | A branch finished expanding.        |
| `closing` | `(value: string)`                | A branch started collapsing.        |
| `closed`  | `(value: string)`                | A branch finished collapsing.       |

### Slots

#### `NavigationDrawer`

| Slot      | Props                                                                      | Description                                                      |
| --------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `default` | —                                                                          | `NavigationDrawerSection`, `NavigationDrawerDivider`, and items. |
| `content` | —                                                                          | Page area beside or behind the drawer.                           |
| `header`  | —                                                                          | Optional panel header above the navigation list.                 |
| `close`   | `{ closeLabel: string, close: () => void }`                                | Optional visible close control inside a modal drawer.            |
| `toggle`  | `{ expanded: boolean, controls: string, toggle: (event?: Event) => void }` | External open control; place it in the app bar or layout.        |

#### `NavigationDrawerSection`

| Slot      | Props | Description                         |
| --------- | ----- | ----------------------------------- |
| `default` | —     | Section items.                      |
| `label`   | —     | Replaces the visible section label. |

#### `NavigationDrawerItem`

| Slot            | Props               | Description                                                      |
| --------------- | ------------------- | ---------------------------------------------------------------- |
| `default`       | —                   | Nested items for a branch.                                       |
| `label`         | —                   | Replaces the visible item label.                                 |
| `icon`          | —                   | Leading icon.                                                    |
| `selected-icon` | —                   | Icon shown while the destination is selected; use a filled icon. |
| `toggle-icon`   | `{ open: boolean }` | Branch disclosure icon; defaults to `expand_more`.               |
| `badge`         | —                   | Badge beside the label.                                          |

### Methods

| Method       | Description                            |
| ------------ | -------------------------------------- |
| `expand()`   | Expands every registered branch.       |
| `collapse()` | Collapses every registered branch.     |
| `id`         | Exposed ID of the navigation landmark. |

## Styling

`width` and `maxWidth` size the panel. The frame also reads `--yam3x-drawer-container-width` and `--yam3x-drawer-container-max-width`; set them on an ancestor only when a layout needs to override both drawers consistently. No other public style hooks are defined; colors, shape, and typography follow System tokens.

## Material references

[Navigation drawer overview](https://m3.material.io/components/navigation-drawer/overview) · [guidelines](https://m3.material.io/components/navigation-drawer/guidelines) · [specs](https://m3.material.io/components/navigation-drawer/specs) · [accessibility](https://m3.material.io/components/navigation-drawer/accessibility)
