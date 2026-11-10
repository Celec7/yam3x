<script setup lang="ts">
import DrawerContainerExample from './demos/DrawerContainerExample.vue'
</script>

# Drawer container

`DrawerContainer` is a project layout extension, not a standalone Material component. Material 3 defines navigation drawers and side sheets but no generic two-sided drawer container. This component composes Material surfaces and panels; `ModalNavigationDrawer` and `PermanentNavigationDrawer` from Compose Material 3 inform the layout only.

Use it to build an app shell with an optional start panel and an optional end panel around primary content. Choose `overlay`, `push`, or `side` for each panel, or `auto` to derive the mode from the container width. For top-level destinations, compose a [navigation drawer](/components/navigation-drawer) or an expanded [navigation rail](/components/navigation-rail) inside the start panel. For contextual tools, use a [side sheet](/components/side-sheet) composition inside a panel.

## Examples

### Modes, edges, and adaptive width

The demo starts with both panels in `overlay` mode inside a bounded frame. Open the start panel to inspect the dialog boundary, focus containment, scrim, and menu button; open the supporting pane from the start panel to see the single active modal edge. Change either mode to `push` or `side`, adjust the frame width and breakpoints, and switch direction to check RTL mirroring and drag dismissal.

<div class="vp-raw yam3x-doc-demo-theme"><DrawerContainerExample /></div>

::: details View demo source

<<< ./demos/DrawerContainerExample.vue{vue}

:::

### Navigation and supporting panes

The start panel holds navigation destinations and the end panel holds contextual tools about the current page. The container only places these regions; it does not own destination selection, page routing, or the internal anatomy of the content. Keep one named navigation landmark in the start panel and one visible close control in a modal panel.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DrawerContainer } from './components/yam3x/drawer-container'

const open = ref(false)
</script>

<template>
  <DrawerContainer
    v-model:open="open"
    start-mode="overlay"
    start-label="Main navigation"
    start-divider
  >
    <template #start>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/saved">Saved</a>
        <button
          type="button"
          data-yam3x-drawer-initial-focus
          @click="open = false"
        >
          Close navigation
        </button>
      </nav>
    </template>
    <template #start-toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        aria-label="Open navigation"
        @click="toggle"
      >
        Menu
      </button>
    </template>
    <main>Page content</main>
  </DrawerContainer>
</template>
```

`v-model:open` and `v-model:end-open` own panel visibility. The component writes the model and emits `change` with the edge, the new state, and whether the user toggled or dismissed the panel.

::: details Push and persistent supporting pane

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DrawerContainer } from './components/yam3x/drawer-container'

const endOpen = ref(true)
</script>

<template>
  <DrawerContainer
    start-mode="side"
    end-mode="push"
    v-model:end-open="endOpen"
    width="320px"
    end-label="Properties"
    end-divider
  >
    <template #start>Persistent navigation</template>
    <template #end>Property controls</template>
    <template #end-toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        Properties
      </button>
    </template>
    <main>Page content</main>
  </DrawerContainer>
</template>
```

:::

`side` panels stay in the layout and hide their toggle slot. `push` panels shift the main region but keep it interactive, so do not add a scrim or treat them as modal.

## Behavior and accessibility

### Modes and adaptive layout

- `overlay` panels float above the content and use a scrim. `push` panels take their own track and shift the content. `side` panels remain in the grid at all times.
- `auto` resolves against the measured container, not the viewport: below `autoCompactBreakpoint` it uses `overlay`, below `autoBreakpoint` it uses `push`, and otherwise `side`. Defaults are 600 px and 840 px.
- A panel's track is capped so both in-flow panels and the main region keep at least 320 px. The configured `width` and `maxWidth` are further reduced by that cap.
- Only one non-side panel is open at a time. Opening the other edge closes the current one.
- The component fills its parent. Give the parent a definite block size when you need a bounded app-shell frame.

### Focus and dismissal

- Overlay panels expose `role="dialog"`, `aria-modal`, and the panel label. The main region becomes inert and `aria-hidden` while a modal panel is open. The scrim is a button with the close label and blocks wheel and touch scrolling behind it.
- Focus moves to the element marked `data-yam3x-drawer-initial-focus`, then to the first focusable element, then to the panel itself. Tab wraps inside the panel.
- Escape closes the active modal panel. Activating the scrim also dismisses it. A horizontal drag toward the anchored edge closes a modal panel once it passes `min(96px, 35% of the panel width)`; smaller drags and pointer cancellation return it to the open position.
- After dismissal, focus returns to the toggle that opened the panel, or to the component's own toggle when the original trigger is gone or hidden.
- `push` and `side` panels do not trap focus and do not restore it; they stay part of the normal tab order.

### Motion and reduced motion

Normal motion uses the shared default spatial duration and easing with a 500 ms fallback. The grid tracks, panel transform, background, shadow, and scrim opacity animate together. Under reduced motion, grid, panel, and scrim transitions are removed and the scrim appears or disappears immediately without its visibility delay.

### Responsive and RTL

- Dragging follows the pointer in two-pixel steps and uses logical direction, so RTL mirrors the start and end edges and the drag direction.
- A modal panel clips horizontal overflow and scrolls vertically. Content should stay within the panel width rather than introducing a second horizontal scroller.
- Below the compact breakpoint, overlay panels use the full available width up to their configured cap.

### State ownership

The application owns the open state, panel mode, navigation selection, routing, and panel content. `auto` is derived from the measured container and is not stored as a separate state. Keep a visible close control inside modal content; the scrim label is not a substitute for it.

## API

Built-in text can inherit [LocaleProvider](/components/localization)'s `actions` namespace. An explicit `locale`, `startLabel`, `endLabel`, or `closeLabel` takes precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                                                   | Kind      | Use                                                       |
| -------------------------------------------------------- | --------- | --------------------------------------------------------- |
| `DrawerContainer`                                        | Component | Two-sided layout with optional panels.                    |
| `DrawerMode`, `DrawerPanelRole`, `DrawerToggleSlotProps` | Type      | Mode values, non-modal panel role, and toggle slot scope. |

### Props and models

| Prop and model                 | Type                                      | Default                 | Use                                                                 |
| ------------------------------ | ----------------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| `startMode`                    | `'overlay' \| 'push' \| 'side' \| 'auto'` | `'side'`                | Presentation of the start panel.                                    |
| `endMode`                      | `'overlay' \| 'push' \| 'side' \| 'auto'` | `'side'`                | Presentation of the end panel.                                      |
| `open` / `v-model:open`        | `boolean`                                 | `false`                 | Start panel visibility when the mode is dismissible.                |
| `endOpen` / `v-model:end-open` | `boolean`                                 | `false`                 | End panel visibility when the mode is dismissible.                  |
| `autoCompactBreakpoint`        | `number`                                  | `600`                   | Container width below which `auto` resolves to `overlay`.           |
| `autoBreakpoint`               | `number`                                  | `840`                   | Container width below which `auto` resolves to `push`.              |
| `width`                        | CSS length                                | `'360px'`               | Preferred panel width, subject to the track cap.                    |
| `maxWidth`                     | CSS length                                | `'360px'`               | Maximum panel width, subject to the track cap.                      |
| `startLabel`                   | `string`                                  | Localized `Start panel` | Accessible name of the start panel.                                 |
| `endLabel`                     | `string`                                  | Localized `End panel`   | Accessible name of the end panel.                                   |
| `startRole`                    | `'dialog' \| 'complementary'`             | —                       | Non-modal role of the start panel; modal mode always uses `dialog`. |
| `endRole`                      | `'dialog' \| 'complementary'`             | —                       | Non-modal role of the end panel; modal mode always uses `dialog`.   |
| `closeLabel`                   | `string`                                  | Localized `Close panel` | Accessible name of the scrim button.                                |
| `startDivider`                 | `boolean`                                 | `false`                 | Divides the in-flow start panel from the content.                   |
| `endDivider`                   | `boolean`                                 | `false`                 | Divides the in-flow end panel from the content.                     |
| `locale`                       | `string`                                  | Provider, then `en-US`  | Language of built-in interface text.                                |

### Events

| Event    | Payload                                                                  | Use                                        |
| -------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| `change` | `(edge: 'start' \| 'end', open: boolean, reason: 'toggle' \| 'dismiss')` | Reports a user-driven toggle or dismissal. |

### Slots

| Slot           | Scope                            | Use                                                            |
| -------------- | -------------------------------- | -------------------------------------------------------------- |
| default        | —                                | Primary content region.                                        |
| `start`        | —                                | Start panel content.                                           |
| `end`          | —                                | End panel content.                                             |
| `start-toggle` | `{ expanded, controls, toggle }` | Trigger for a dismissible start panel; omitted in `side` mode. |
| `end-toggle`   | `{ expanded, controls, toggle }` | Trigger for a dismissible end panel; omitted in `side` mode.   |

Bind `expanded` and `controls` to the trigger's ARIA attributes. `controls` is the panel ID.

### Methods

`DrawerContainer` exposes no methods. Change visibility through `v-model:open` and `v-model:end-open`, and control modes with props.

## Styling

The container maps in-flow panels to System `surface`, overlay panels to `surface-container-low`, dividers to `outline-variant`, and the scrim to the shared overlay scrim opacity. It exposes the project custom properties below. Overlay color and elevation overrides take precedence over the shared panel overrides.

::: details CSS overrides

| Property                                 | Default                        | Use                                                 |
| ---------------------------------------- | ------------------------------ | --------------------------------------------------- |
| `--yam3x-drawer-container-width`         | `360px`                        | Panel width.                                        |
| `--yam3x-drawer-container-max-width`     | `360px`                        | Maximum panel width.                                |
| `--yam3x-drawer-container-color`         | System `surface`               | In-flow panel background.                           |
| `--yam3x-drawer-container-elevation`     | System level 0                 | In-flow panel shadow.                               |
| `--yam3x-modal-drawer-container-color`   | System `surface-container-low` | Overlay panel background.                           |
| `--yam3x-modal-drawer-elevation`         | System level 1                 | Overlay panel shadow.                               |
| `--yam3x-modal-drawer-start-shape`       | System `corner-large`          | Rounded edge of an open end panel facing the start. |
| `--yam3x-modal-drawer-end-shape`         | System `corner-large`          | Rounded edge of an open start panel facing the end. |
| `--yam3x-drawer-container-scrim-opacity` | Shared overlay scrim opacity   | Scrim opacity.                                      |
| `--yam3x-drawer-divider-color`           | System `outline-variant`       | Persistent divider color.                           |
| `--yam3x-drawer-divider-thickness`       | `1px`                          | Persistent divider thickness.                       |

:::

Set the properties on the component root or an ancestor. The panel content owns its own spacing and typography.

## Material references

[Side sheets overview](https://m3.material.io/components/side-sheets/overview) · [Side sheets guidelines](https://m3.material.io/components/side-sheets/guidelines) · [Navigation drawer guidelines](https://m3.material.io/components/navigation-drawer/guidelines)
