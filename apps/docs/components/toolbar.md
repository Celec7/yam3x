<script setup lang="ts">
import ToolbarExample from './demos/ToolbarExample.vue'
</script>

# Toolbars

Toolbars group actions that apply to the current page or selected content. Keep the most relevant actions visible and choose docked or floating placement to suit the layout.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarExample /></div>

::: details View demo source

<<< ./demos/ToolbarExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Toolbar } from './components/yam3x/toolbar'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
</script>

<template>
  <Toolbar aria-label="Edit actions">
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="Undo"
      >↶</IconButton
    >
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="Redo"
      >↷</IconButton
    >
  </Toolbar>
</template>
```

## API

| Prop       | Default           | Description                                                                                      |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| `layout`   | `floating`        | `floating` or `docked`.                                                                          |
| `variant`  | `standard`        | `standard` or `vibrant` color scheme.                                                            |
| `shape`    | Depends on layout | Floating is rounded by default; Docked is square. Rounded Docked corners apply from 840px width. |
| `vertical` | `false`           | Arranges a floating toolbar vertically and sets its `aria-orientation` to `vertical`.            |
| `elevated` | Depends on layout | Floating has elevation by default; Docked has none.                                              |

## Behavior and accessibility

The component sets `aria-orientation` from the effective layout: `vertical` for a vertical floating toolbar and `horizontal` otherwise. This keeps its semantics aligned with its layout and keyboard behavior.

Give the toolbar and each icon button clear accessible names. Actions retain native Tab order. In a horizontal toolbar, left/right arrows move between actions; in a vertical toolbar, use up/down arrows. Home/End move to the first/last action. Text input keeps its own arrow-key behavior. Child components handle Enter and Space activation.

Slotted controls keep their own color variant. For the Standard scheme, use `primary` for standard icon buttons and the normal Filled/Tonal button roles. For Vibrant, use `on-primary-container` for standard icon buttons, `surface-container` / `on-surface` for selected tonal controls, and the normal Filled button roles. The toolbar does not change child styles.

The component does not position itself, collapse, or generate an overflow menu. The page should keep floating toolbars within the viewport and move secondary actions into a menu when there are too many. Do not show a toolbar and navigation bar together at the bottom. Docked toolbars fill their container; to follow Material's full-screen-width guidance, place one in a full-width container at the bottom of the window. A floating toolbar can pair with one high-priority FAB.

## Styling

Set these properties on the `Toolbar` root to customize its Component mappings:

| Property                                   | Default mapping                                                        | Description                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `--yam3x-toolbar-size`                     | `64px`                                                                 | Minimum height; for vertical toolbars, minimum width.               |
| `--yam3x-toolbar-spacing`                  | `4px`; docked uses `32px` from 600px width                             | Gap between controls.                                               |
| `--yam3x-toolbar-rounded-shape`            | System `corner-full`                                                   | Floating radius.                                                    |
| `--yam3x-toolbar-docked-rounded-shape`     | System `corner-large` (`16px`)                                         | Wide-screen rounded Docked radius.                                  |
| `--yam3x-toolbar-padding-block`            | `8px`; vertical square uses `16px`                                     | Block-axis padding. Docked keeps its minimum `16px` inline padding. |
| `--yam3x-toolbar-padding-inline`           | Rounded Floating `8px`; square Floating `16px`; Docked at least `16px` | Inline-axis padding. Docked keeps the Material minimum.             |
| `--yam3x-toolbar-standard-container-color` | System `surface-container`                                             | Standard container color.                                           |
| `--yam3x-toolbar-standard-color`           | System `on-surface`                                                    | Standard inherited text color.                                      |
| `--yam3x-toolbar-vibrant-container-color`  | System `primary-container`                                             | Vibrant container color.                                            |
| `--yam3x-toolbar-vibrant-color`            | System `on-primary-container`                                          | Vibrant inherited text color.                                       |

Material allows rounded Docked corners on Web and large screens but does not prescribe a radius or breakpoint. This project uses System `corner-large` (`16px`) from 840px width. The default 4px Floating gap is also a project mapping. Rounded Docked corners are not rendered below that breakpoint. The padding properties can increase the Docked inline padding but cannot reduce its 16px minimum.

## Material references

[Toolbars overview](https://m3.material.io/components/toolbars/overview) · [guidelines](https://m3.material.io/components/toolbars/guidelines) · [specs](https://m3.material.io/components/toolbars/specs) · [accessibility](https://m3.material.io/components/toolbars/accessibility)
