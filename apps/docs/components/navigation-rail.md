<script setup lang="ts">
import NavigationRailExample from './demos/NavigationRailExample.vue'
</script>

# Navigation rail

Navigation rails place top-level destinations along a window edge. Their collapsed or expanded form should fit the layout and make the current destination easy to identify.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><NavigationRailExample /></div>

::: details View demo source

<<< ./demos/NavigationRailExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail } from './components/yam3x/navigation-rail'
import Icon from './components/yam3x/icon/icon.vue'
const current = ref('home')
const items = [
  { value: 'home', label: 'Home', href: '/', icon: 'home' },
  { value: 'search', label: 'Search', href: '/search', icon: 'search' },
  { value: 'saved', label: 'Saved', href: '/saved', icon: 'bookmark' },
]
</script>

<template>
  <NavigationRail
    v-model="current"
    label="Main navigation"
    :items="items"
  >
    <template #icon="{ item }"><Icon :name="item.icon" /></template>
    <template #selected-icon="{ item }"
      ><Icon
        :name="item.icon"
        filled
    /></template>
  </NavigationRail>
</template>
```

## API

This component can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

Each `items` entry needs `value`, `label`, and `href`; optional properties include `ariaLabel`, `disabled`, `disabledInteractive`, `secondary`, `badge`, `badgeLabel`, and native link attributes. Material recommends three to seven destinations and allows one optional FAB; this is guidance, not a runtime limit. `v-model` identifies the current destination. `mode` can be `collapsed`, `expanded`, or `auto`; control the menu’s expanded state with `v-model:expanded`. `mode` supplies the initial expansion behavior: `collapsed` starts collapsed, `expanded` starts expanded, and `auto` starts collapsed below 960px or expanded at and above 960px. A value supplied by `v-model:expanded` takes precedence. Without a bound value, using the built-in menu stores a manual choice, so `auto` no longer changes the expanded state when the viewport crosses the breakpoint. The rail remains hidden below 960px in `auto` mode; compose Navigation Bar at compact widths. With a bound model, set it to `undefined` to return control to `mode`. `presentation` can be `standard` or `modal`, and `alignment` positions destinations at the top or center. `divider` displays a divider on the content side. `hideWhenCollapsed` supports an immersive layout controlled by an external menu; the app must provide an accessible external trigger. Expanded width is capped at 360px.

`mode` defaults to `collapsed`. `showMenu` defaults to `true`; `menuLabel` and `closeLabel` override the built-in expand and collapse button names.

## Behavior and accessibility

Use `#icon`, `#selected-icon`, and `#badge` for destination icons and badges. When the icon family supports both, use outlined icons for inactive destinations and a filled icon for the selected destination. `#menu-icon` and `#close-icon` replace the built-in menu icons. `#fab` receives the expanded state and can show an extended FAB when expanded. Give the group a `label`, and use `ariaLabel` to clarify ambiguous destination names. Arrow keys and Tab move focus; Space/Enter activate. Selection events are cancellable `beforeinput`, model update, `input`, `change`, and `navigate`, in that order.

## Material references

[Navigation rail overview](https://m3.material.io/components/navigation-rail/overview) · [guidelines](https://m3.material.io/components/navigation-rail/guidelines) · [specs](https://m3.material.io/components/navigation-rail/specs) · [accessibility](https://m3.material.io/components/navigation-rail/accessibility)
