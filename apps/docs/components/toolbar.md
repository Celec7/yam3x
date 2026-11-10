<script setup lang="ts">
import ToolbarBasicExample from './demos/ToolbarBasicExample.vue'
import ToolbarGalleryExample from './demos/ToolbarGalleryExample.vue'
import ToolbarExample from './demos/ToolbarExample.vue'
</script>

# Toolbars

`Toolbar` groups actions that apply to the current page or selected content. It is a Material 3 Expressive toolbar with floating and docked layouts, standard and vibrant color schemes, rounded and square shapes, and an optional vertical orientation.

Use a floating toolbar for actions related to the current page or selection. Use a docked toolbar for actions that stay consistent across pages; the docked layout replaces the baseline bottom app bar. Keep the most important actions visible and move secondary actions into a menu when space is tight.

## Examples

### Basic

A floating toolbar keeps a compact action group within the content. This static example uses two standard icon buttons; the toolbar is a `toolbar` landmark with a horizontal orientation.

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarBasicExample /></div>

::: details View demo source

<<< ./demos/ToolbarBasicExample.vue{vue}

:::

### Variants and shapes

The gallery shows a floating standard toolbar, a floating vibrant toolbar, a vertical square toolbar, and a docked rounded toolbar. Rounded docked corners appear from 840 px viewport width; below that width the docked toolbar stays square.

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarGalleryExample /></div>

::: details View demo source

<<< ./demos/ToolbarGalleryExample.vue{vue}

:::

### Layout and color controls

The interactive demo switches layout, color, shape, elevation, and vertical orientation. Clicking an action reports it below the stage, and the controls expose how floating and docked defaults differ.

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarExample /></div>

::: details View demo source

<<< ./demos/ToolbarExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Toolbar } from './components/yam3x/toolbar'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <Toolbar aria-label="Document actions">
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="Undo"
    >
      <Icon name="undo" />
    </IconButton>
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="Redo"
    >
      <Icon name="redo" />
    </IconButton>
  </Toolbar>
</template>
```

Give the toolbar an accessible name and give every child control its own name. The toolbar passes attributes to its root, so `class`, `style`, `aria-label`, and data attributes apply to the toolbar element. Compose a [Button group](/components/button-group) inside the default slot when several actions form one segmented control; the toolbar itself only arranges slotted controls.

::: details Docked placement

```vue
<template>
  <div class="bottom-bar">
    <Toolbar
      layout="docked"
      aria-label="Page actions"
    >
      <IconButton
        variant="standard"
        style="color: var(--md-sys-color-primary)"
        aria-label="Back"
      >
        <Icon name="arrow_back" />
      </IconButton>
    </Toolbar>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  width: 100%;
}
</style>
```

:::

The toolbar does not position itself. Keep a floating toolbar inside the viewport and place a docked toolbar in a full-width container at the bottom of the layout. Do not show a docked toolbar and a bottom navigation bar at the same time.

## Behavior and accessibility

### Keyboard

- The toolbar does not use a roving tab index: each action remains a Tab stop in document order.
- In a horizontal toolbar, Left and Right arrows move between actions. In a vertical toolbar, Up and Down move. Home and End move to the first and last action, and arrow movement wraps.
- RTL reverses horizontal arrow movement while keeping the visual order meaningful.
- Text inputs, selects, text areas, editable regions, and composite widgets such as tab lists, menus, and listboxes keep their own arrow-key behavior. The toolbar does not intercept their keys.
- Disabled and hidden controls are skipped. Child components handle Enter and Space activation.

### Orientation and RTL

- `aria-orientation` follows the effective layout: `vertical` for a vertical floating toolbar and `horizontal` otherwise. A docked toolbar is always horizontal; `vertical` is ignored unless the layout is floating.
- Leading and trailing placement follows the writing direction. The toolbar uses logical padding and gap values, so RTL mirrors the container and reverses horizontal arrow movement while DOM order stays unchanged.

### Child controls and color

- Child controls keep their own styling, size, and state. Use the shared Icon button or Button components to retain their focus and touch-target behavior.
- With the Standard scheme, standard icon buttons use Primary; filled and tonal buttons use their regular roles. With Vibrant, standard icon buttons use On Primary Container, selected tonal controls use Surface Container and On Surface, and filled buttons keep their regular roles.
- The toolbar does not recolor children or add labels to them.

### Placement, overflow, and density

- The toolbar is a composable action container. It does not collapse items, generate an overflow menu, or attach itself to the viewport.
- Use a Menu for overflow, and keep one high-priority floating action at most beside a floating toolbar.
- Docked toolbars fill their container and keep at least 16 px inline padding. Below 600 px they distribute actions across the width; at 600 px and above they center the group with a larger gap.
- Density affects spacing tokens but must not reduce child touch targets below the shared minimum.

## API

### Exports

| Export    | Kind      | Use                                              |
| --------- | --------- | ------------------------------------------------ |
| `Toolbar` | Component | Action container with layout and color variants. |

### Props

| Prop       | Type                      | Default                             | Use                                                                          |
| ---------- | ------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| `layout`   | `'floating' \| 'docked'`  | `'floating'`                        | Content-sized floating toolbar or full-width docked toolbar.                 |
| `variant`  | `'standard' \| 'vibrant'` | `'standard'`                        | Surface Container or Primary Container color scheme.                         |
| `shape`    | `'rounded' \| 'square'`   | Floating `rounded`; docked `square` | Corner treatment. Rounded docked corners render from 840 px width.           |
| `vertical` | `boolean`                 | `false`                             | Stacks a floating toolbar vertically and sets `aria-orientation="vertical"`. |
| `elevated` | `boolean`                 | Floating `true`; docked `false`     | Adds the elevation shadow.                                                   |

### Events

`Toolbar` emits no events. Child controls own their activation events.

### Slots

| Slot    | Scope | Use                                                                     |
| ------- | ----- | ----------------------------------------------------------------------- |
| default | —     | Actions such as icon buttons, buttons, a text field, or a menu trigger. |

### Methods

`Toolbar` exposes no methods. Change layout and color through props.

## Styling

Set these project custom properties on the Toolbar root. Standard maps to Surface Container and On Surface; Vibrant maps to Primary Container and On Primary Container.

::: details CSS overrides

| Property                                   | Default                                                                | Use                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| `--yam3x-toolbar-size`                     | `64px`                                                                 | Minimum height; minimum width for a vertical toolbar. |
| `--yam3x-toolbar-spacing`                  | `4px`; docked at 600 px and above uses `32px`                          | Gap between controls.                                 |
| `--yam3x-toolbar-rounded-shape`            | System `corner-full`                                                   | Floating radius.                                      |
| `--yam3x-toolbar-docked-rounded-shape`     | System `corner-large` (`16px`)                                         | Wide-screen rounded docked radius.                    |
| `--yam3x-toolbar-padding-block`            | `8px`; vertical square uses `16px`                                     | Block-axis padding.                                   |
| `--yam3x-toolbar-padding-inline`           | Rounded floating `8px`; square floating `16px`; docked at least `16px` | Inline-axis padding. Docked keeps its 16 px minimum.  |
| `--yam3x-toolbar-standard-container-color` | System `surface-container`                                             | Standard container color.                             |
| `--yam3x-toolbar-standard-color`           | System `on-surface`                                                    | Standard inherited text color.                        |
| `--yam3x-toolbar-vibrant-container-color`  | System `primary-container`                                             | Vibrant container color.                              |
| `--yam3x-toolbar-vibrant-color`            | System `on-primary-container`                                          | Vibrant inherited text color.                         |

:::

Material permits rounded docked corners on Web and large screens but does not prescribe a radius or breakpoint. This project uses System `corner-large` from 840 px and a 4 px floating gap as project mappings. Padding properties can increase the docked inline padding but cannot reduce its 16 px minimum. Forced colors replace the toolbar background and text with system colors and add an outline.

## Material references

[Toolbars overview](https://m3.material.io/components/toolbars/overview) · [guidelines](https://m3.material.io/components/toolbars/guidelines) · [specs](https://m3.material.io/components/toolbars/specs) · [accessibility](https://m3.material.io/components/toolbars/accessibility)
