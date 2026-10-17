<script setup lang="ts">
import DrawerContainerExample from './demos/DrawerContainerExample.vue'
</script>

# Drawer container

`DrawerContainer` is a project layout extension for start and end panels, not a standalone Material component. Choose `overlay`, `push`, or `side` for each panel; `auto` switches modes with the container width.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><DrawerContainerExample /></div>

::: details View demo source

<<< ./demos/DrawerContainerExample.vue{vue}

:::

## Use in your app

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
  >
    <template #start>
      <nav aria-label="Main navigation"><a href="/">Home</a></nav>
    </template>
    <template #start-toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        Menu
      </button>
    </template>
    <main>Page content</main>
  </DrawerContainer>
</template>
```

## API

| Prop or model                             | Values                            | Default                    | Description                                      |
| ----------------------------------------- | --------------------------------- | -------------------------- | ------------------------------------------------ |
| `startMode`, `endMode`                    | `overlay \| push \| side \| auto` | `side`                     | Presentation of each logical side panel.         |
| `autoCompactBreakpoint`, `autoBreakpoint` | `number`                          | `600`, `840`               | Container-width thresholds for `auto`.           |
| `width`, `maxWidth`                       | CSS length                        | `360px`                    | Panel width and maximum width.                   |
| `v-model:open`, `v-model:endOpen`         | `boolean`                         | `false`                    | Open state for dismissible start and end panels. |
| `startLabel`, `endLabel`                  | `string`                          | `Start panel`, `End panel` | Accessible panel names.                          |
| `startRole`, `endRole`                    | `dialog \| complementary`         | —                          | Optional non-modal panel role.                   |
| `closeLabel`                              | `string`                          | `Close panel`              | Scrim action name.                               |
| `startDivider`, `endDivider`              | `boolean`                         | `false`                    | Separate in-flow panels from content.            |

`#start` and `#end` hold side panels; the default slot holds main content. `#start-toggle` and `#end-toggle` receive `{ expanded, controls, toggle }` in `overlay` and `push` modes. Bind `expanded` and `controls` to the toggle's ARIA attributes. The `change` event reports `(edge, open, reason)` for user-driven toggles and dismissals.

## Behavior and accessibility

`auto` uses `overlay` below 600px, `push` from 600px to below 840px, and `side` at 840px or wider by default. `side` panels remain in layout and do not render toggle slots. `push` panels shift main content while keeping it interactive.

`overlay` panels use a scrim and `dialog` semantics, contain focus, and close with Escape, scrim activation, or a drag toward their anchored edge. Include a visible close control in modal panel content. Panels clip horizontal overflow and scroll vertically. The content slots own navigation selection and its keyboard behavior.

## Styling

Set these project custom properties on the root. Overlay color and elevation overrides take precedence over shared panel overrides.

| Area                    | Supported properties                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel size              | `--yam3x-drawer-container-width`, `--yam3x-drawer-container-max-width`                                                                                                                   |
| Shared panel appearance | `--yam3x-drawer-container-color`, `--yam3x-drawer-container-elevation`                                                                                                                   |
| Overlay appearance      | `--yam3x-modal-drawer-container-color`, `--yam3x-modal-drawer-elevation`, `--yam3x-modal-drawer-start-shape`, `--yam3x-modal-drawer-end-shape`, `--yam3x-drawer-container-scrim-opacity` |
| Persistent divider      | `--yam3x-drawer-divider-color`, `--yam3x-drawer-divider-thickness`                                                                                                                       |

## Material references

[Side sheets overview](https://m3.material.io/components/side-sheets/overview)
