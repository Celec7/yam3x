<script setup lang="ts">
import MenuExample from './demos/MenuExample.vue'
</script>

# Menus

Menus temporarily present related choices or actions from a control. Keep the menu tied to its trigger and use a different pattern for actions that should remain visible.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><MenuExample /></div>

::: details View demo source

<<< ./demos/MenuExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Menu, type MenuItem } from './components/yam3x/menu'
const items: MenuItem[] = [
  { value: 'open', label: 'Open' },
  { value: 'favorite', label: 'Favorite', type: 'checkbox' },
  { value: 'more', label: 'More', items: [{ value: 'share', label: 'Share' }] },
]
</script>

<template>
  <Menu
    :items="items"
    label="File actions"
  />
</template>
```

## API

This component can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

`items` is a required `MenuItem[]`; give each item a unique `value`. `label` names the menu (`'Options'` by default), and `triggerLabel` names the built-in trigger (`'Open menu'`). `variant` defaults to `'standard'` and also accepts `'vibrant'`; `dense` defaults to `false`. `positionX` defaults to `'after'` and accepts `'before'`; `positionY` defaults to `'below'` and accepts `'above'`.

Customize the trigger with `#trigger`, which receives `{ open, toggle, triggerProps }`. `#icon` and `#trailing-icon` receive item data. `variant="vibrant"` uses tertiary colors. Set preferred expansion directions with `position-x="before|after"` and `position-y="above|below"`; the popup automatically flips or shifts near viewport edges, and its enter and exit transitions expand or collapse at the trigger-facing edge. Use `show(anchor)`, `hide()`, and `toggle(anchor)` for context menus or split buttons.

## Behavior and accessibility

The menu emits cancellable `beforetoggle` and `beforeselect` events, then `toggle` and `select`. Call `preventDefault()` on a before-event to stop opening, closing, or selection.

Control visibility with `v-model:open`. `v-model:checked` stores independent checkbox values; `v-model:selected` stores each radio group’s selected value, keyed by group name. When the menu opens, the first item receives focus. Arrow keys move focus, Home/End move to the first/last item, and character keys search by label. Disabled items can still receive focus. Escape and outside clicks close the menu; checkbox selection keeps it open, while radio and action selection close it.

Separate groups with `{ value: 'divider-1', type: 'divider' }` or `{ value: 'gap-1', type: 'gap' }`; every menu item needs a unique `value`. The project-defined gap creates separate group surfaces and becomes a divider in scrollable menus. Prefer a divider for Web dropdowns.

A menu item’s `leadingIcon` or `trailingIcon` reserves 20px of space when the corresponding icon slot renders conditionally by item. When no icon slot is provided, regular items do not leave an empty icon slot.

## Styling

The supported CSS overrides are `--yam3x-menu-container-min-width`, `--yam3x-menu-container-max-height`, `--yam3x-menu-container-padding-block`, `--yam3x-menu-container-shape`, `--yam3x-menu-active-container-shape`, `--yam3x-menu-inactive-container-shape`, `--yam3x-menu-item-container-height`, `--yam3x-menu-item-icon-label-space`, `--yam3x-menu-item-shape`, `--yam3x-menu-item-focus-ring-shape`, and `--yam3x-menu-item-label-text-font-size`. Set them on the `Menu` root. `variant="vibrant"` supplies its own color mapping.

## Material references

[Menus overview](https://m3.material.io/components/menus/overview) · [guidelines](https://m3.material.io/components/menus/guidelines) · [specs](https://m3.material.io/components/menus/specs) · [accessibility](https://m3.material.io/components/menus/accessibility)
