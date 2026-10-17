<script setup lang="ts">
import AppBarExample from './demos/AppBarExample.vue'
</script>

# App bars

App bars identify the current page and hold its key actions. Choose a layout that fits the page hierarchy and the actions people need there.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><AppBarExample /></div>

::: details View demo source

<<< ./demos/AppBarExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { AppBar } from './components/yam3x/app-bar'
</script>

<template>
  <AppBar
    variant="medium-flexible"
    scroll-behavior="exit-until-collapsed"
  >
    <template #leading
      ><button
        type="button"
        aria-label="Back"
      >
        ←
      </button></template
    >
    <template #title>Page title</template>
    <template #subtitle>Supporting text</template>
    <template #trailing
      ><button
        type="button"
        aria-label="Save"
      >
        Save
      </button></template
    >
  </AppBar>
</template>
```

## API

| Prop              | Default (automatic)                                      | Description                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`         | `small`                                                  | `search`, `small`, `medium-flexible`, or `large-flexible`.                                                                                                                                              |
| `alignment`       | `leading`                                                | Aligns Flexible and Small titles to the start edge or center.                                                                                                                                           |
| `scroll-behavior` | Flexible: `exit-until-collapsed`; Search/Small: `pinned` | `pinned` keeps the bar visible; `enter-always` hides it while scrolling down and reveals it while scrolling up; `exit-until-collapsed` collapses Flexible to Small until the target returns to its top. |
| `scroll-target`   | `window`                                                 | Accepts an element ID (with or without `#`) or an element. For an element target, the app bar must be inside that scrolling element. Scrolling changes the container color.                             |
| `search-label`    | `Search`                                                 | Accessible name for Search text and button; must include “Search”.                                                                                                                                      |

Slots: use `leading` for navigation buttons or a brand mark, `title` and `subtitle` for page text, `logo` for a brand image, and `trailing` for page actions. Search also provides `search-leading` and `search-trailing`. Activating Search emits a `search` event; the page is responsible for opening the Search View. `search-leading` is decorative content inside the button; place interactive buttons in `search-trailing` or `trailing`.

The built-in Search glyph uses the outlined Material Symbols `search` icon. Load the font as described in the [Icon guide](./icon.md), or provide a `search-leading` override.

The Search slot adapts to the space left by the other app bar content. The Search button emits an event; the page is responsible for presenting its Search View.

Callers provide trailing actions and their overflow behavior. Compose `Menu` or `Toolbar` in the `trailing` slot when the page needs an action menu.

## Behavior and accessibility

Give every action an accessible name that describes its purpose. The app bar preserves DOM-order Tab navigation.

## Styling

The app bar maps theme roles and component measurements internally. These documented CSS properties are project extension points; their defaults follow the Material mapping. Flexible headline sizes should stay at their specified type scales.

| CSS property                                   | Default                     | Purpose                                                          |
| ---------------------------------------------- | --------------------------- | ---------------------------------------------------------------- |
| `--yam3x-app-bar-title-text-color`             | `--md-sys-color-on-surface` | Overrides the title and app bar foreground color.                |
| `--yam3x-app-bar-small-container-height`       | `64px`                      | Overrides Small height, including the collapsed Flexible height. |
| `--yam3x-app-bar-small-heading-padding-left`   | `calc(4px * density scale)` | Overrides the Small title’s start padding.                       |
| `--yam3x-app-bar-small-title-text-font-size`   | `22px`                      | Overrides the Small title size.                                  |
| `--yam3x-app-bar-small-subtitle-text-tracking` | `0.5px`                     | Overrides the Small subtitle letter spacing.                     |

## Material references

[App bars overview](https://m3.material.io/components/app-bars/overview) · [guidelines](https://m3.material.io/components/app-bars/guidelines) · [specs](https://m3.material.io/components/app-bars/specs) · [accessibility](https://m3.material.io/components/app-bars/accessibility)
