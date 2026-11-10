<script setup lang="ts">
import TabsBasicExample from './demos/TabsBasicExample.vue'
import TabsExample from './demos/TabsExample.vue'
</script>

# Tabs

Tabs switch among related views at the same level of the information hierarchy. `Tabs` is a Material 3 Expressive tab row with primary and secondary variants, fixed and scrollable layouts, icons, badges, and a direction-aware selection indicator.

Use tabs for related content that can be read in any order, not for sequential steps or general site navigation. Primary tabs belong beneath an app bar for main content destinations; secondary tabs organize a second level inside a content area. Keep labels short and use icons only when they add meaning.

## Examples

### Basic

The basic example uses primary tabs with icons, a badge, a disabled tab, and one panel per tab. Selecting a tab moves the indicator and shows its associated panel; the disabled Archive tab stays visible but cannot be selected.

<div class="vp-raw yam3x-doc-demo-theme"><TabsBasicExample /></div>

::: details View demo source

<<< ./demos/TabsBasicExample.vue{vue}

:::

### Variants, layout, and interaction states

The interactive demo switches between primary and secondary tabs, fixed and scrollable layouts, and header positions, and it can add up to seven tabs. It also exposes pagination visibility and content swiping. The controls and event log make disabled tabs, badges, selection changes, and the indicator direction observable.

<div class="vp-raw yam3x-doc-demo-theme"><TabsExample /></div>

::: details View demo source

<<< ./demos/TabsExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, type TabItem } from './components/yam3x/tabs'

const current = ref('overview')
const items: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', badge: 4 },
  { value: 'files', label: 'Files' },
]
</script>

<template>
  <Tabs
    v-model="current"
    label="Project sections"
    :items="items"
    variant="primary"
  >
    <template #panel="{ item }">
      <p>{{ item.label }} content</p>
    </template>
  </Tabs>
</template>
```

`v-model` holds the current tab value. If the bound value is missing or disabled, the first enabled tab becomes current and the model is updated. Panels stay mounted, so form state and scroll position survive a tab change; the page still owns the content and any state that should outlive that change.

::: details Icons and custom tab content

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, type TabItem } from './components/yam3x/tabs'
import { Icon } from './components/yam3x/icon'

const current = ref('photos')
const items: TabItem[] = [
  { value: 'photos', label: 'Photos' },
  { value: 'videos', label: 'Videos' },
]
</script>

<template>
  <Tabs
    v-model="current"
    label="Media"
    :items="items"
    variant="primary"
  >
    <template #icon="{ item }"><Icon :name="item.value" /></template>
  </Tabs>
</template>
```

:::

Primary tabs render icons only when the `icon` slot is supplied. Use `ariaLabel` when an icon or badge makes the visible label ambiguous; the accessible name otherwise falls back to `label`.

## Behavior and accessibility

### Activation and selection

- Arrow keys move focus only; Space, Enter, or a click activates the focused tab and updates the panel.
- `update:modelValue` fires before `select(item)`. Activating the already selected tab emits `select` without another model update. Disabled tabs emit nothing.
- The tab row keeps its selection synchronized with one visible panel. Activating a tab also scrolls it into view in a scrollable layout.
- Disabled tabs keep their visual place and are skipped by keyboard and swipe navigation.

### Keyboard and focus

- Left and Right arrows move between enabled tabs and wrap; Home and End move to the first and last enabled tab. RTL reverses the horizontal direction.
- Each enabled tab is a Tab stop, so Tab leaves the row rather than cycling inside it. Disabled tabs are not focusable.
- The selected panel is a `tabpanel` labelled by its tab and is focusable with `tabindex="0"`. Unselected panels are inert and hidden from the accessibility tree.
- Visible focus, hover, and pressed states use separate state layers; the focus outline is not removed.

### Layout and overflow

- `layout="auto"` uses fixed tabs for up to four items and scrollable tabs for more than four. Set `fixed` or `scrollable` explicitly when the content dictates it.
- Scrollable rows keep 52 px of start inset and let labels expand without a fixed width or line clamp. Previous and next pagination buttons scroll the row and are disabled at the ends.
- `disablePagination="auto"` hides those buttons on coarse-pointer devices; `true` always hides them. Pagination scrolls only; it never changes the selection.
- `stretch` makes tabs fill the available width. `header-position="after"` places the tab row below the panels; this is a project extension, because Material places tabs before content.

### Panels and motion

- Panels remain mounted and are shown with `v-show`. Inactive panels are `inert`, `aria-hidden`, and excluded from layout.
- On a change, the indicator stretches toward the target and the entering and leaving panels slide in the direction of travel. Pressing a tab produces a ripple clipped to the tab shape.
- Reduced motion removes the indicator transition, panel animation, and smooth scrolling. The selection still changes immediately.

### Responsive, RTL, and state ownership

- The row measures its own overflow rather than relying on the viewport. A scrollable row keeps the selected tab visible after a resize or item change.
- RTL reverses arrow direction, indicator travel, and swipe direction. Labels and badges follow the writing direction.
- In fixed layouts, a horizontal touch swipe over the panel area selects the next enabled tab. In scrollable layouts the same gesture scrolls the tab row. Swipes that start on buttons, links, inputs, or other interactive content are ignored; `disable-swipe` turns the behavior off.
- The page owns panel content, routing, and any state that must survive tab changes. The component owns the current value, overflow measurement, scroll position, and transient motion state.

## API

Built-in text can inherit [LocaleProvider](/components/localization)'s `actions` namespace. An explicit `locale`, `previousPageLabel`, or `nextPageLabel` takes precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                                 | Kind      | Use                                       |
| -------------------------------------- | --------- | ----------------------------------------- |
| `Tabs`                                 | Component | Tab row and associated panels.            |
| `TabItem`, `TabsLayout`, `TabsVariant` | Type      | Item schema and layout or variant values. |

### Props and models

| Prop and model           | Type                                | Default                   | Use                                                                           |
| ------------------------ | ----------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| `items`                  | `TabItem[]`                         | Required                  | Tabs in display order.                                                        |
| `label`                  | `string`                            | —                         | Accessible name of the tab row. Falls back to an `aria-label` attribute.      |
| `modelValue` / `v-model` | `string`                            | First enabled item        | Current tab value.                                                            |
| `variant`                | `'primary' \| 'secondary'`          | `'secondary'`             | Primary content tabs or secondary in-content tabs.                            |
| `layout`                 | `'auto' \| 'fixed' \| 'scrollable'` | `'auto'`                  | Fixed, scrollable, or automatic based on item count.                          |
| `headerPosition`         | `'before' \| 'after'`               | `'before'`                | Places the tab row above or below the panels. `after` is a project extension. |
| `stretch`                | `boolean`                           | `false`                   | Makes tabs fill the available width.                                          |
| `disablePagination`      | `boolean \| 'auto'`                 | `false`                   | Hides overflow buttons; `auto` hides them on coarse-pointer devices.          |
| `disableSwipe`           | `boolean`                           | `false`                   | Disables touch swipe selection in fixed layouts.                              |
| `previousPageLabel`      | `string`                            | Localized `Previous page` | Accessible name of the previous-page button.                                  |
| `nextPageLabel`          | `string`                            | Localized `Next page`     | Accessible name of the next-page button.                                      |
| `locale`                 | `string`                            | Provider, then `en-US`    | Language of built-in interface text.                                          |

### Tab item schema

| Field       | Type               | Use                                                                       |
| ----------- | ------------------ | ------------------------------------------------------------------------- |
| `value`     | `string`           | Required unique tab value used by the model.                              |
| `label`     | `string`           | Required visible tab label.                                               |
| `ariaLabel` | `string`           | Accessible name when the visible label is ambiguous or icon-only.         |
| `disabled`  | `boolean`          | Keeps the tab visible but prevents activation and skips it in navigation. |
| `badge`     | `string \| number` | Badge text; values longer than four characters are abbreviated.           |

### Events

| Event    | Payload   | Use                                                      |
| -------- | --------- | -------------------------------------------------------- |
| `select` | `TabItem` | A tab was activated, including the already selected tab. |

### Slots

| Slot            | Scope                | Use                                                          |
| --------------- | -------------------- | ------------------------------------------------------------ |
| `panel`         | `{ item, selected }` | Content for each panel.                                      |
| `tab-content`   | `{ item, selected }` | Replaces the default icon, label, and badge inside each tab. |
| `icon`          | `{ item }`           | Leading icon slot, rendered in primary tabs when supplied.   |
| `badge`         | `{ item }`           | Replaces badge content.                                      |
| `previous-icon` | —                    | Replaces the previous-page glyph.                            |
| `next-icon`     | —                    | Replaces the next-page glyph.                                |

### Methods

`Tabs` exposes no methods. Use `v-model` for selection and `layout` or `stretch` for sizing.

## Styling

Set these project custom properties on the Tabs root. The tab row maps selected primary content to Primary, selected secondary labels to On Surface, inactive labels to On Surface Variant, and the indicator to Primary.

| Property                                          | Default                                   | Use                                                              |
| ------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| `--yam3x-tabs-active-indicator-color`             | System `primary`                          | Active indicator color for either variant.                       |
| `--yam3x-tabs-primary-active-indicator-thickness` | `3px`                                     | Primary active indicator thickness.                              |
| `--yam3x-tab-selected-color`                      | Primary `primary`; Secondary `on-surface` | Selected tab label and icon color.                               |
| `--yam3x-tab-font-size`                           | `14px`                                    | Tab label font size.                                             |
| `--yam3x-tab-spacing`                             | `8px`                                     | Gap between inline tab content, including custom `#tab-content`. |

Avoid density that takes tab targets below 48 × 48 CSS pixels. Scrollable labels expand instead of truncating; the 52 px start inset is part of the scrollable layout, not a consumer override.

## Material references

[Tabs overview](https://m3.material.io/components/tabs/overview) · [guidelines](https://m3.material.io/components/tabs/guidelines) · [specs](https://m3.material.io/components/tabs/specs) · [accessibility](https://m3.material.io/components/tabs/accessibility)
