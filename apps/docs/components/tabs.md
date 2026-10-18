<script setup lang="ts">
import TabsExample from './demos/TabsExample.vue'
</script>

# Tabs

Tabs switch among related views at the same level of the information hierarchy. Use concise labels that describe each view and preserve the relationship between each tab and its content.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><TabsExample /></div>

::: details View demo source

<<< ./demos/TabsExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs } from './components/yam3x/tabs'
const current = ref('overview')
const items = [
  { value: 'overview', label: 'Overview' },
  { value: 'details', label: 'Details', badge: '3' },
]
</script>

<template>
  <Tabs
    v-model="current"
    label="Product content"
    :items="items"
    variant="primary"
  >
    <template #tab-content="{ item, selected }">
      <strong>{{ item.label }}</strong>
      <span
        v-if="selected"
        aria-hidden="true"
        >●</span
      >
    </template>
    <template #panel="{ item }">{{ item.label }} content</template>
  </Tabs>
</template>
```

## API

This component can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

| Prop                                  | Default            | Purpose                                                                                                                    |
| ------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `items`                               | Required           | `value`, `label`, and optional `ariaLabel`, `disabled`, and `badge`.                                                       |
| `v-model`                             | First enabled item | `value` of the current tab.                                                                                                |
| `variant`                             | `secondary`        | `primary` or `secondary`.                                                                                                  |
| `layout`                              | `auto`             | `fixed`, `scrollable`, or `auto`; automatic layout scrolls when there are more than four items.                            |
| `headerPosition`                      | `before`           | Places the tab row above or below the content; `after` is a project extension because Material places Tabs before content. |
| `stretch`                             | `false`            | Makes tabs fill the available width.                                                                                       |
| `disablePagination`                   | `false`            | Hides pagination buttons; `auto` hides them on coarse-pointer devices.                                                     |
| `disableSwipe`                        | `false`            | Prevents horizontal swipe-to-switch in fixed layout; scrollable tabs use horizontal gestures to scroll the tab row.        |
| `previousPageLabel` / `nextPageLabel` | Localized default  | Accessible names of pagination buttons.                                                                                    |

## Behavior and accessibility

Slots: `#tab-content="{ item, selected }"` replaces the default icon, label, and badge content inside each tab while preserving the tab button’s role and interaction; `ariaLabel` names custom content, falling back to `label`. Other slots are `#panel="{ item, selected }"`, `#icon="{ item }"`, `#badge="{ item }"`, `#previous-icon`, and `#next-icon`. Panels remain mounted; unselected panels are hidden from layout and the accessibility tree. Provide a `label` for the tab row. Use an item’s `ariaLabel` to clarify an ambiguous visible label. Arrow keys move focus only; Space/Enter activate a tab and update the panel. Tab can reach each enabled tab.

When a user activates a different tab, `update:modelValue` fires before `select(item)`. Activating the selected tab again fires `select(item)` without another model update. Disabled tabs do not emit `select`. Pagination buttons only scroll the tab row. Primary tabs are 48px high by default and 64px with an icon; Secondary tabs are 48px high. Scrollable rows retain 52px of start inset and let labels expand without a fixed width or line clamp. Horizontal swipes in fixed layout select a tab; in scrollable layout, horizontal gestures scroll the tab row. When switching, the indicator stretches toward the target and content slides in the direction of travel; pressing a tab produces a ripple clipped to its shape. These decorative animations stop when the system requests reduced motion.

## Styling

| Property                                          | Default                                   | Effect                                                           |
| ------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| `--yam3x-tabs-active-indicator-color`             | System `primary`                          | Active indicator color for either variant.                       |
| `--yam3x-tabs-primary-active-indicator-thickness` | `3px`                                     | Primary active indicator thickness.                              |
| `--yam3x-tab-selected-color`                      | Primary `primary`; Secondary `on-surface` | Selected tab label and icon color.                               |
| `--yam3x-tab-font-size`                           | `14px`                                    | Tab label font size.                                             |
| `--yam3x-tab-spacing`                             | `8px`                                     | Gap between inline tab content, including custom `#tab-content`. |

## Material references

[Tabs overview](https://m3.material.io/components/tabs/overview) · [guidelines](https://m3.material.io/components/tabs/guidelines) · [specs](https://m3.material.io/components/tabs/specs) · [accessibility](https://m3.material.io/components/tabs/accessibility)
