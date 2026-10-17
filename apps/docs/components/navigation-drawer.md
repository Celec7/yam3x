<script setup lang="ts">
import NavigationDrawerExample from './demos/NavigationDrawerExample.vue'
</script>

# Navigation drawer

Navigation drawer is a legacy pattern that Material no longer recommends for new designs. Use Navigation rail for new Expressive navigation. This component supports existing drawer-based screens.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><NavigationDrawerExample /></div>

::: details View demo source

<<< ./demos/NavigationDrawerExample.vue{vue}

:::

## Use in your app

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
    <template #close="{ close, closeLabel }">
      <button
        type="button"
        :aria-label="closeLabel"
        @click="close"
      >
        Close
      </button>
    </template>
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
      value="folders"
      label="Folders"
    >
      <NavigationDrawerItem
        value="archive"
        label="Archive"
        href="/archive"
      />
    </NavigationDrawerItem>

    <template #content>
      <main>Current page content</main>
    </template>
  </NavigationDrawer>
</template>
```

## API

`NavigationDrawer` owns the navigation landmark, destination selection, hierarchy, and drawer presentation. `mode` accepts `modal`, `standard`, or `auto`; auto mode uses the container width and switches at `standardBreakpoint` (840px by default). This project-selected threshold follows the compact/medium versus expanded layout boundary. `v-model:open` controls visibility; when it is unbound, modal mode starts closed and standard mode starts open. `v-model:selected` is required and should follow the application's current route.

The `close` slot is optional and can provide a visible in-panel close control. Without it, modal drawers can still close through the scrim, Escape, an edge swipe, or destination selection. The `toggle` slot receives `{ expanded, controls, toggle }`; place its control in the surrounding app bar or layout. `label` names the modal panel and defaults the navigation landmark name; use `navigationLabel` to give the navigation landmark a different name. The `content` slot contains the page area.

Compose `NavigationDrawerSection`, `NavigationDrawerDivider`, and `NavigationDrawerItem` in the default slot. Sections provide optional labels. Leaf items require `href` and render native links. Items with nested items are disclosure buttons and cannot have an `href`. Items accept `value`, `label`, `disabled`, and native link attributes; `icon`, `selected-icon`, and `badge` are slots. A branch's `open` model controls its expanded state.

## Behavior and accessibility

The `select` event reports `(value, href, event)`. Modal drawers close after a destination is selected; standard drawers remain open. The `change` event reports `(open, reason)` for user-driven open-state changes. Modal drawers receive dialog semantics, trap focus, focus the first destination when opened, and can close through the scrim, Escape, edge swipe, or destination selection. If provided, the `close` slot adds an in-panel close control. Keyboard users can use Tab, arrow keys, Home/End, typeahead, and Enter/Space. Application routing and focus in newly rendered page content remain application responsibilities.

## Material references

[Navigation drawer overview](https://m3.material.io/components/navigation-drawer/overview) · [guidelines](https://m3.material.io/components/navigation-drawer/guidelines) · [specs](https://m3.material.io/components/navigation-drawer/specs) · [accessibility](https://m3.material.io/components/navigation-drawer/accessibility)
