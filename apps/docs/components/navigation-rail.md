<script setup lang="ts">
import NavigationRailBasicExample from './demos/NavigationRailBasicExample.vue'
import NavigationRailExample from './demos/NavigationRailExample.vue'
</script>

# Navigation rail

Navigation rails place top-level destinations along a window edge. `NavigationRail` is a Material 3 Expressive navigation rail. It keeps the current destination visible and supports a collapsed 96 px layout, an expanded layout, and a modal expansion for compact layouts.

Use a rail at medium and expanded widths when the app can reserve a vertical edge for navigation. Material recommends three to seven destinations and at most one optional floating action button; these are design guidelines, not runtime limits. At compact widths, use a [navigation bar](/components/navigation-bar) instead. In `auto` mode, the rail appears from the expanded breakpoint and leaves medium widths to the navigation bar.

## Examples

### Basic

The basic rail starts collapsed, marks the current destination, shows a badge on Activity, disables Archive, and places a small action button in the `fab` slot. `show-menu` is off, so the rail stays in its collapsed layout. The selected destination is the model value; selecting another destination updates it.

<div class="vp-raw yam3x-doc-demo-theme"><NavigationRailBasicExample /></div>

::: details View demo source

<<< ./demos/NavigationRailBasicExample.vue{vue}

:::

### Expansion, modal presentation, and adaptive layout

The interactive demo exposes mode, presentation, destination alignment, and a hidden-when-collapsed layout with an external menu trigger. Expand the rail to reveal the secondary destination and the extended FAB, or switch to `modal` to check focus containment and scrim dismissal. The event log reports selection events in order.

<div class="vp-raw yam3x-doc-demo-theme"><NavigationRailExample /></div>

::: details View demo source

<<< ./demos/NavigationRailExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail, type NavigationRailItem } from './components/yam3x/navigation-rail'
import { Icon } from './components/yam3x/icon'

const current = ref('home')
const items: NavigationRailItem[] = [
  { value: 'home', label: 'Home', href: '/' },
  { value: 'search', label: 'Search', href: '/search', badge: 3, badgeLabel: '3 new results' },
  { value: 'saved', label: 'Saved', href: '/saved' },
  { value: 'settings', label: 'Settings', href: '/settings', secondary: true },
]
</script>

<template>
  <NavigationRail
    v-model="current"
    label="Main navigation"
    :items="items"
    divider
  >
    <template #icon="{ item }"><Icon :name="item.value" /></template>
    <template #selected-icon="{ item }"
      ><Icon
        :name="item.value"
        filled
    /></template>
  </NavigationRail>
</template>
```

`:items` owns labels, links, badges, and disabled state; `v-model` owns the current destination. The rail renders anchors, so normal link navigation, modifier-key clicks, `target`, `rel`, and `download` keep their native behavior.

::: details Expansion, a FAB, and an external trigger

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail, type NavigationRailItem } from './components/yam3x/navigation-rail'
import { Button } from './components/yam3x/button'

const current = ref('home')
const expanded = ref<boolean | undefined>(undefined)
const items: NavigationRailItem[] = [
  { value: 'home', label: 'Home', href: '/' },
  { value: 'settings', label: 'Settings', href: '/settings', secondary: true },
]
</script>

<template>
  <Button
    type="button"
    :aria-expanded="!!expanded"
    aria-controls="main-rail"
    @click="expanded = !expanded"
  >
    {{ expanded ? 'Close navigation' : 'Open navigation' }}
  </Button>
  <NavigationRail
    id="main-rail"
    v-model="current"
    v-model:expanded="expanded"
    label="Main navigation"
    :items="items"
    presentation="modal"
    hide-when-collapsed
  >
    <template #fab="{ expanded: isExpanded }">
      <Button
        :aria-label="isExpanded ? 'Create new content' : 'Create'"
        @click="create()"
      >
        Create
      </Button>
    </template>
  </NavigationRail>
</template>
```

:::

With `hide-when-collapsed`, the rail is hidden until the external trigger sets `expanded`. The trigger must be an accessible control with `aria-expanded` and `aria-controls`; closing the modal returns focus to it.

## Behavior and accessibility

### Selection and events

- `mode` starts the rail in `collapsed`, `expanded`, or `auto` form. `auto` uses the 840 px breakpoint: collapsed below it and expanded at or above it.
- `v-model:expanded` takes precedence over `mode`. Without a bound value, using the built-in menu stores a manual choice, so a later breakpoint change no longer expands or collapses the rail. Set the bound model to `undefined` to return control to `mode`.
- A missing or disabled current value falls back to the first enabled destination, and the model is updated to match.
- `secondary` destinations appear only while expanded, unless one of them is current.
- `children` is a one-level project extension for child pages under a destination. Children render only while the rail is expanded, in a named nested list. A child may be the current destination; while collapsed, the parent shows the current state and focus returns to the parent when the rail closes.
- Child values must be unique across the whole item tree. Do not combine `children` with `secondary` on the same navigation layer; `secondary` is a hidden top-level destination, while `children` express a parent-child page hierarchy.
- Selection emits cancellable `beforeinput`, updates the model, then emits `input`, `change`, and `navigate` in that order. Call `preventDefault()` on `beforeinput` to block the change.
- Clicking a destination inside a modal rail closes the modal.

### Keyboard and focus

- Each destination is a link and a Tab stop unless it is disabled or currently hidden. Arrow Down and Arrow Up move through enabled destinations and wrap; Home and End move to the first and last.
- Space activates a focused destination. Enter follows native link behavior. A disabled destination is skipped by arrow navigation.
- `disabled` removes the link target and sets `aria-disabled`. `disabledInteractive` keeps the link focusable so assistive technology can read it while still blocking activation.
- In `modal` presentation, the surface is a labeled dialog, the scrim is present, body scrolling is locked, Tab wraps inside the surface, and Escape or scrim activation closes it. Focus moves to the menu button, the FAB, the first destination, or the surface when no focusable content exists.

### Expansion and modal presentation

- `presentation="standard"` expands within the layout. `presentation="modal"` adds a scrim and dialog semantics while expanded.
- `density="compact"` is a project extension that reduces vertical spacing: a 16 px top inset, an 8 px header gap, a roughly 56 px collapsed row, and a 48 px expanded row. It does not narrow the 96/220 px rail; use it to fit more destinations vertically, not to reclaim horizontal workspace.
- Expanded width is capped at 360 px. When the destinations overflow a short rail, the navigation list scrolls while the menu button and FAB stay available.
- The menu button exposes `aria-expanded` and controls the destination region. `menuLabel` and `closeLabel` override the built-in names.

### Responsive and RTL

- In `auto` mode the rail is hidden below 840 px instead of shrinking; provide a navigation bar for that range and do not render both as the same navigation landmark at once.
- The collapsed rail keeps 96 px and the expanded rail 220 px in the default sizing. Destinations and the FAB use logical insets, so RTL mirrors the rail to the other edge without changing vertical arrow behavior.
- Enlarged text increases destination height and wraps labels instead of clipping them.

### State ownership

The page owns the current destination, any external expanded state, navigation targets, and the compact-width alternative. The rail owns the transient modal layer, focus containment, and the expanded width. `mode` is a starting policy, not a second persistent state; when you bind `expanded`, the page decides when to reset it.

## API

Built-in text can inherit [LocaleProvider](/components/localization)'s `actions` namespace. An explicit `locale`, `menuLabel`, or `closeLabel` takes precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                                                                                     | Kind      | Use                                                         |
| ------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------- |
| `NavigationRail`                                                                           | Component | Vertical top-level navigation.                              |
| `NavigationRailItem`, `NavigationRailChild`, `NavigationRailMode`, `NavigationRailDensity` | Type      | Destination schema, child schema, mode, and density values. |

### Props and models

| Prop and model                  | Type                                  | Default                         | Use                                                                                                             |
| ------------------------------- | ------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `items`                         | `NavigationRailItem[]`                | Required                        | Destinations in display order.                                                                                  |
| `label`                         | `string`                              | Required                        | Accessible name of the navigation landmark and modal dialog.                                                    |
| `modelValue` / `v-model`        | `string`                              | `''`                            | Current destination value.                                                                                      |
| `expanded` / `v-model:expanded` | `boolean \| undefined`                | `undefined`                     | Controlled expansion; takes precedence over `mode`.                                                             |
| `mode`                          | `'collapsed' \| 'expanded' \| 'auto'` | `'collapsed'`                   | Initial expansion policy.                                                                                       |
| `presentation`                  | `'standard' \| 'modal'`               | `'standard'`                    | In-layout or modal expansion.                                                                                   |
| `hideWhenCollapsed`             | `boolean`                             | `false`                         | Hides the rail while collapsed; requires an external trigger.                                                   |
| `alignment`                     | `'top' \| 'center'`                   | `'top'`                         | Places destinations at the block start or center.                                                               |
| `density`                       | `'standard' \| 'compact'`             | `'standard'`                    | Vertical density tier. Compact reduces top and header spacing and shortens rows; it does not change rail width. |
| `divider`                       | `boolean`                             | `false`                         | Draws a divider on the content side.                                                                            |
| `showMenu`                      | `boolean`                             | `true`                          | Shows the built-in expand and collapse button.                                                                  |
| `menuLabel`                     | `string`                              | Localized `Expand navigation`   | Accessible name of the collapsed menu button.                                                                   |
| `closeLabel`                    | `string`                              | Localized `Collapse navigation` | Accessible name of the expanded menu button.                                                                    |
| `locale`                        | `string`                              | Provider, then `en-US`          | Language of built-in interface text.                                                                            |

### Item schema

| Field                       | Type                    | Use                                                                                                   |
| --------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `value`                     | `string`                | Required unique destination value used by the model and events.                                       |
| `label`                     | `string`                | Required visible and accessible destination text.                                                     |
| `href`                      | `string`                | Required link target.                                                                                 |
| `ariaLabel`                 | `string`                | Overrides the accessible name when the visible label is ambiguous.                                    |
| `disabled`                  | `boolean`               | Blocks activation and removes the link from Tab order.                                                |
| `disabledInteractive`       | `boolean`               | Keeps a disabled destination focusable for discovery.                                                 |
| `secondary`                 | `boolean`               | Shows the destination only while expanded, unless it is current.                                      |
| `children`                  | `NavigationRailChild[]` | One level of child destinations rendered while expanded. Child values must be unique across the tree. |
| `badge`                     | `string \| number`      | Trailing badge text; values longer than four characters are abbreviated.                              |
| `badgeLabel`                | `string`                | Screen-reader description referenced by `aria-describedby`.                                           |
| `target`, `rel`, `download` | Native anchor values    | Forwarded to the link when it is enabled.                                                             |

### Events

| Event         | Payload              | Use                                                              |
| ------------- | -------------------- | ---------------------------------------------------------------- |
| `beforeinput` | `(item, event)`      | Cancellable before the current destination changes.              |
| `input`       | `(item, event)`      | The model has changed.                                           |
| `change`      | `(item, event)`      | The current destination change completed.                        |
| `navigate`    | `(item, MouseEvent)` | A destination was activated; cancel the native click if routing. |

### Slots

| Slot            | Scope                | Use                                                              |
| --------------- | -------------------- | ---------------------------------------------------------------- |
| `icon`          | `{ item, selected }` | Destination icon. Use the outlined form when available.          |
| `selected-icon` | `{ item }`           | Replaces the icon of the current destination, typically filled.  |
| `badge`         | `{ item, selected }` | Replaces badge content.                                          |
| `fab`           | `{ expanded }`       | Optional action above the destinations, such as an extended FAB. |
| `menu-icon`     | —                    | Replaces the collapsed menu glyph.                               |
| `close-icon`    | —                    | Replaces the expanded close glyph.                               |

### Methods

`NavigationRail` exposes no methods. Control expansion through `v-model:expanded` and selection through `v-model`.

## Styling

The rail has no public project CSS custom properties. It maps Material color and type roles internally: Surface Container for the rail, Secondary Container and On Secondary Container for the current indicator, On Surface Variant for inactive content, and Error and On Error for badges. Style the slotted icon and FAB content directly; the rail does not recolor them.

The collapsed indicator is 56 × 32 px and becomes a 56 px row while expanded. State layers stay inside the indicator, and the badge is clamped to the rail edge. Text scaling increases vertical room rather than truncating labels.

## Material references

[Navigation rail overview](https://m3.material.io/components/navigation-rail/overview) · [guidelines](https://m3.material.io/components/navigation-rail/guidelines) · [specs](https://m3.material.io/components/navigation-rail/specs) · [accessibility](https://m3.material.io/components/navigation-rail/accessibility)
