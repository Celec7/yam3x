<script setup lang="ts">
import AppBarBasicExample from './demos/AppBarBasicExample.vue'
import AppBarExample from './demos/AppBarExample.vue'
</script>

# App bars

App bars identify the current page and hold its key actions. `AppBar` is a Material 3 Expressive app bar with four layouts: a Search bar, a Small bar, and Medium and Large flexible bars that collapse into the Small layout.

Use a Small bar for a single-line page title with a few actions. Use a Medium or Large flexible bar when the title is the main hierarchy cue and the page can afford extra header height. Use a Search bar when search is the page's primary task. The bar sets `role="banner"`; Small and flexible layouts render their title as a level-one heading.

## Examples

### Basic

A Small bar keeps one line of title text and places page actions at the logical end. This static example has a leading back action, a page title, and two trailing icon actions.

<div class="vp-raw yam3x-doc-demo-theme"><AppBarBasicExample /></div>

::: details View demo source

<<< ./demos/AppBarBasicExample.vue{vue}

:::

### Search, Small, and flexible app bars

The demo opens as a Search bar. Choose a type, title alignment, scroll behavior, and available width; toggle the subtitle and right-to-left direction to check how the bar responds. Scroll the bordered content region to exercise the pinned, hide-and-reveal, and collapse behaviors. The search and action buttons report their activity below the preview.

<div class="vp-raw yam3x-doc-demo-theme"><AppBarExample /></div>

::: details View demo source

<<< ./demos/AppBarExample.vue{vue}

:::

### Search composition

Search renders a button, not a text field. Activating it emits `search`; the page opens its Search View. The button keeps a fixed 56 px minimum height and fits itself to the space between the leading and trailing slots: it fills the remaining width on compact layouts, stays at 312 px on medium layouts, and grows to at most half of the available width on wide layouts.

Keep interactive controls in `search-trailing` or `trailing`. `search-leading` sits inside the button and is decorative, so a focusable control there would create nested interactive content.

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AppBar } from './components/yam3x/app-bar'
import IconButton from './components/yam3x/icon-button/icon-button.vue'

const searchOpen = ref(false)
</script>

<template>
  <AppBar
    variant="medium-flexible"
    alignment="leading"
    @search="searchOpen = true"
  >
    <template #leading>
      <IconButton
        variant="standard"
        aria-label="Back"
      >
        ←
      </IconButton>
    </template>
    <template #title>Inbox</template>
    <template #subtitle>Recent messages</template>
    <template #trailing>
      <IconButton
        variant="standard"
        aria-label="Account"
      >
        ●
      </IconButton>
    </template>
  </AppBar>

  <main>Page content</main>
</template>
```

The bar has no internal search state; keep the search view and trailing menus in the page. Omit `scroll-target` to follow the window, or pass an element or an element ID whose scrolling region contains the app bar.

::: details Search bar with trailing actions

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AppBar } from './components/yam3x/app-bar'
import { Menu, type MenuItem } from './components/yam3x/menu'

const searchOpen = ref(false)
const items: MenuItem[] = [
  { value: 'settings', label: 'Search settings' },
  { value: 'help', label: 'Search help' },
]
</script>

<template>
  <AppBar
    variant="search"
    search-label="Search messages"
    @search="searchOpen = true"
  >
    <template #trailing>
      <Menu
        :items="items"
        label="Search options"
      />
    </template>
  </AppBar>
</template>
```

:::

## Behavior and accessibility

### Scroll behavior

- Any variant changes its bar container to `surface-container` after the target leaves the top; Search also moves its inner search container to `surface-container-highest`.
- `pinned` keeps the bar in place; `enter-always` hides it while scrolling toward the end and reveals it while scrolling back.
- `exit-until-collapsed` collapses a Medium or Large flexible bar to the 64 px Small height after scrolling starts and restores it when the target returns to the top.
- Search and Small default to `pinned`; flexible bars default to `exit-until-collapsed`.
- The bar belongs at the top of a full-width page shell. It does not provide a bottom placement; use a docked [Toolbar](/components/toolbar) for bottom actions.
- A subtitle keeps its space only while the slot has content. Removing the subtitle shortens the flexible bar instead of leaving an empty line.

### Search

- The built-in Search glyph is the outlined Material Symbols `search` icon. Load the font as described in the [Icon guide](/components/icon), or replace it through `search-leading`.
- The trigger exposes `aria-haspopup="dialog"` and an accessible name from `search-label` or the localized `actions.search` message.
- The bar does not open a search view, keep a query, or restore search focus. The application owns that state.

### Keyboard and RTL

- The bar preserves document order for Tab navigation: leading controls, the Search trigger and its trailing controls, then page actions.
- Every icon-only action needs its own accessible name. The bar does not add labels to slotted controls.
- Leading and trailing slots follow the writing direction. In RTL, the leading slot is on the right and the trailing slot is on the left; the Search trigger keeps its start-to-end layout.
- Flexible headlines wrap to at most two lines; the Small title stays on one line.

### State ownership

The page owns the search view, trailing action menus, and navigation. The bar owns only its scroll observation and derives `scrolled` and `collapsed` from the resolved scroll target. When the target is missing, the bar keeps its initial state until the target element appears and the component is updated.

## API

Built-in text can inherit [LocaleProvider](/components/localization)'s `actions` namespace. An explicit `locale` and `search-label` take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                                                                           | Kind      | Use                                                 |
| -------------------------------------------------------------------------------- | --------- | --------------------------------------------------- |
| `AppBar`                                                                         | Component | Page header and scroll behavior.                    |
| `AppBarVariant`, `AppBarAlignment`, `AppBarScrollBehavior`, `AppBarScrollTarget` | Type      | Prop values for the four layouts and scroll target. |

### Props

| Prop             | Type                                                           | Default                                                      | Use                                                                                                              |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `variant`        | `'search' \| 'small' \| 'medium-flexible' \| 'large-flexible'` | `'small'`                                                    | Layout and headline hierarchy.                                                                                   |
| `alignment`      | `'leading' \| 'centered'`                                      | `'leading'`                                                  | Aligns Small and flexible titles to the start edge or center.                                                    |
| `scrollBehavior` | `'pinned' \| 'enter-always' \| 'exit-until-collapsed'`         | Flexible: `'exit-until-collapsed'`; Search/Small: `'pinned'` | Keeps the bar visible, hides and reveals it with scroll direction, or collapses flexible bars.                   |
| `scrollTarget`   | `string \| HTMLElement \| null`                                | `null`                                                       | Element ID (with or without `#`), element, or the window when omitted. An element target should contain the bar. |
| `searchLabel`    | `string`                                                       | Localized `Search`                                           | Accessible name of the Search trigger.                                                                           |
| `locale`         | `string`                                                       | Provider, then `en-US`                                       | Language of built-in interface text.                                                                             |

### Events

| Event    | Payload | Use                                                               |
| -------- | ------- | ----------------------------------------------------------------- |
| `search` | —       | The Search trigger was activated. The page opens its search view. |

### Slots

| Slot              | Scope | Use                                                                                               |
| ----------------- | ----- | ------------------------------------------------------------------------------------------------- |
| `leading`         | —     | Navigation control or brand mark at the logical start.                                            |
| `title`           | —     | Page title; rendered as a level-one heading.                                                      |
| `subtitle`        | —     | Supporting line under the title. Its presence changes flexible height.                            |
| `logo`            | —     | Brand image. In the Small layout it replaces the title position; otherwise it precedes the title. |
| `trailing`        | —     | Page actions at the logical end.                                                                  |
| `search-leading`  | —     | Decorative content inside the Search trigger, replacing the search glyph.                         |
| `search-trailing` | —     | Interactive content beside the Search trigger, inside the search row.                             |

### Methods

`AppBar` exposes no methods. Through a template ref, `scrolled` and `collapsed` are read-only booleans that report the current scroll-derived state.

## Styling

The app bar maps Material color, type, and shape roles internally. The project exposes a small set of CSS custom properties for title color, Small height, and Small type adjustments. Set them on the component root or an ancestor.

::: details CSS overrides

| Property                                       | Default                     | Use                                                    |
| ---------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| `--yam3x-app-bar-title-text-color`             | `--md-sys-color-on-surface` | Title and bar foreground color.                        |
| `--yam3x-app-bar-small-container-height`       | `64px`                      | Small height, including the collapsed flexible height. |
| `--yam3x-app-bar-small-heading-padding-left`   | `calc(4px * density scale)` | Start padding of the Small title block.                |
| `--yam3x-app-bar-small-title-text-font-size`   | `22px`                      | Small title size.                                      |
| `--yam3x-app-bar-small-subtitle-text-tracking` | `0.5px`                     | Small subtitle letter spacing.                         |

:::

Keep flexible headline sizes at their specified type scales. Wide bars use the bar's own width, not the viewport, to decide how much of the Search slot to fill.

## Material references

[App bars overview](https://m3.material.io/components/app-bars/overview) · [guidelines](https://m3.material.io/components/app-bars/guidelines) · [specs](https://m3.material.io/components/app-bars/specs) · [accessibility](https://m3.material.io/components/app-bars/accessibility)
