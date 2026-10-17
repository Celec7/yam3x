<script setup lang="ts">
import SplitPaneExample from './demos/SplitPaneExample.vue'
</script>

# Split pane

SplitPane is a project layout primitive for placing related content in resizable adjacent regions. It does not choose routes. Its compact single-pane switch, resizable expanded layout, and pixel breakpoints are project-defined adaptations of Material's Supporting pane layout.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><SplitPaneExample /></div>

::: details View demo source

<<< ./demos/SplitPaneExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SplitPane } from './components/yam3x/split-pane'

const width = ref(66)
</script>

<template>
  <SplitPane
    v-model="width"
    label="Main content"
    :min="24"
    :max="76"
    :detents="[24, 50, 66, 76]"
  >
    <template #start><main>Main content</main></template>
    <template #end><aside>Related content</aside></template>
  </SplitPane>
</template>
```

## API

| Prop                                | Type                                   | Default                 | Description                                                                                      |
| ----------------------------------- | -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `v-model`                           | `number`                               | `50`                    | Percentage of available space for the start pane, from 0–100%.                                   |
| `min`, `max`                        | `number`                               | `0`, `100`              | Detent bounds.                                                                                   |
| `step`                              | `number`                               | `1`                     | Keyboard adjustment step.                                                                        |
| `detents`                           | `number[]`                             | `[]`                    | Percentage detents used on release, Home/End, or Space.                                          |
| `wrap-detents`                      | `boolean`                              | `false`                 | Whether Space wraps from the last detent to the first.                                           |
| `orientation`                       | `'horizontal' \| 'vertical' \| 'auto'` | `'horizontal'`          | Horizontal, vertical, or adaptive across compact, medium, and expanded viewports.                |
| `compact-pane`                      | `'primary' \| 'supporting'`            | `'primary'`             | Pane shown in compact `auto` mode. The consuming scaffold provides the destination switch.       |
| `label`                             | `string`                               | Required                | Accessible name of the divider; should match the primary pane name.                              |
| `value-text`                        | `string`                               | Generated automatically | Screen-reader-friendly description of the current pane ratio.                                    |
| `disabled`                          | `boolean`                              | `false`                 | Disables keyboard and pointer adjustment.                                                        |
| `overshoot-limit`                   | `number`                               | `4`                     | Visual overshoot when dragged past a boundary, in percentage points.                             |
| `#start`, `#end`                    | slot                                   | —                       | Logical start and end panes.                                                                     |
| `@beforeinput`, `@input`, `@change` | event                                  | —                       | Cancellation, continuous updates, and completion events; each includes the event and percentage. |

## Behavior and accessibility

`v-model` is the percentage of available space occupied by the start pane. Use `min`, `max`, `step`, and `detents` to control drag bounds, keyboard increments, and release snap points. The divider’s `label` identifies the primary pane it controls; left and right keys follow physical direction in RTL. In `orientation="auto"`, compact widths show one pane at a time; `v-model:compact-pane` selects the primary or supporting pane. This compact switch is project-defined; Material's Supporting pane example places supporting content below the primary area at compact sizes, optionally using a bottom sheet. Medium widths place supporting content below primary content. Expanded widths show both panes side by side and leave the divider resizable; Material's example uses a fixed 360dp supporting area.

Mouse, touch, and stylus dragging follow the pointer. Keyboard controls include arrow keys, Home/End, PageUp/PageDown, and Enter; when `detents` is set, Space moves to the next detent. The component emits `input` while dragging and `change` when the interaction ends. `beforeinput` can cancel a user value change. The component exposes `collapse()`, `expand()`, and `snapToValue(value)`.

## Styling

Set these project-defined Component properties on the SplitPane root. Handle colors, state opacity, focus color, pressed shape, and transitions default to shared System tokens; handle dimensions and interaction appearance are project-defined because Material does not specify a standalone resizable divider for Supporting pane layouts.

| Area            | Supported properties                                                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handle geometry | `--yam3x-split-pane-drag-handle-container-width`, `--yam3x-split-pane-drag-handle-width`, `--yam3x-split-pane-drag-handle-height`, `--yam3x-split-pane-drag-handle-shape`, `--yam3x-split-pane-drag-handle-pressed-width`, `--yam3x-split-pane-drag-handle-pressed-height`, `--yam3x-split-pane-drag-handle-pressed-shape` |
| Handle colors   | `--yam3x-split-pane-drag-handle-color`, `--yam3x-split-pane-drag-handle-hover-color`, `--yam3x-split-pane-drag-handle-focus-color`, `--yam3x-split-pane-drag-handle-pressed-color`                                                                                                                                         |
| State opacity   | `--yam3x-split-pane-drag-handle-hover-opacity`, `--yam3x-split-pane-drag-handle-focus-opacity`                                                                                                                                                                                                                             |

## Material references

[Supporting pane layout](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane) · [List-detail layout](https://m3.material.io/foundations/layout/canonical-examples/list-detail)
