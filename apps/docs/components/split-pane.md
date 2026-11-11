<script setup lang="ts">
import SplitPaneExample from './demos/SplitPaneExample.vue'
</script>

# Split pane

Split pane places primary content beside related supporting content and lets people resize the division. Use it when both regions must stay visible and their relative space benefits from adjustment.

Split pane is a project extension. Material describes [supporting pane](/guide/foundations/layout) layouts but does not define a standalone draggable component, and Compose Material 3 has no direct primitive; the closest composition is a `Row` or `Box` with a draggable divider. The compact single-pane switch, the compact and expanded breakpoints, and the divider interaction are project decisions. Divider semantics and keyboard behavior follow the [WAI-ARIA window splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/).

## Examples

### Resizable supporting panes

<div class="vp-raw yam3x-doc-demo-theme"><SplitPaneExample /></div>

The demo starts at a 66% start pane with detents at 25, 50, 66, and 75. Drag the divider, or focus it and use the arrow keys. The controls switch orientation, mirror the layout for RTL, disable resizing, remove either pane, switch the compact pane, and call `collapse()` and `expand()`. The output reports the accepted ratio and the number of completed changes.

::: details View demo source

<<< ./demos/SplitPaneExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

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
    <template #start>
      <main>Main content</main>
    </template>
    <template #end>
      <aside>Related content</aside>
    </template>
  </SplitPane>
</template>
```

Give the surrounding container a height; the component fills it and each pane manages its own scrolling. Keep the primary task in `#start` and use `#end` for content that supports it.

::: details Compact switching and controlled collapse

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SplitPane } from './components/yam3x/split-pane'

const width = ref(66)
const compactPane = ref<'primary' | 'supporting'>('primary')
const pane = ref<InstanceType<typeof SplitPane> | null>(null)
</script>

<template>
  <div>
    <button
      type="button"
      @click="compactPane = compactPane === 'primary' ? 'supporting' : 'primary'"
    >
      Switch compact pane
    </button>
    <button
      type="button"
      @click="pane?.collapse()"
    >
      Collapse
    </button>
    <button
      type="button"
      @click="pane?.expand()"
    >
      Expand
    </button>
    <SplitPane
      ref="pane"
      v-model="width"
      v-model:compact-pane="compactPane"
      orientation="auto"
      label="Main content"
    >
      <template #start><main>Main content</main></template>
      <template #end><aside>Supporting content</aside></template>
    </SplitPane>
  </div>
</template>
```

`compactPane` only applies below 600px in `orientation="auto"`. The consuming scaffold owns the destination switch and any route changes; the component only allocates space.

:::

## Behavior and accessibility

### Pointer resizing

- Pointer down on the divider captures the pointer and focuses the divider. Mouse, touch, and stylus follow the same path.
- Pointer movement is coalesced to one animation frame, so only the latest position is applied; `input` fires while the value changes.
- Crossing `min` or `max` previews a bounded overshoot of up to `overshootLimit` percentage points, but the accepted value stays inside the range.
- Release snaps to the nearest detent, then emits one `change` for the completed interaction. Without detents, the release position is retained.
- `pointercancel` restores the drag-start value when the drag changed it. A cancelled `beforeinput` also prevents the value change.
- The divider can be grabbed again during detent settlement without jumping back to the settled position.

### Keyboard

- The divider is a single tab stop. Arrow Left and Arrow Right resize a horizontal layout; Arrow Up and Arrow Down resize a vertical layout.
- With detents, an arrow key moves to the adjacent detent. Home and End move to the first and last allowed detent.
- Page Up and Page Down move to the previous or next detent, or by at least 10 percentage points when no detents are set.
- Enter collapses to the first detent or `min`, then restores the previous expanded ratio. Space cycles to the next detent and optionally wraps with `wrapDetents`.
- In RTL, Arrow Left increases the start pane and Arrow Right decreases it, so keys follow the physical direction of movement.
- `disabled` sets `tabindex="-1"` and `aria-disabled="true"` and blocks both pointer and keyboard resizing.
- Focus uses the shared 3px secondary inset ring.

### Orientation and breakpoints

- `orientation="horizontal"` keeps panes side by side; `vertical` stacks them. The divider's `aria-orientation` is the opposite of the pane orientation.
- `orientation="auto"` shows one pane below 600px, both panes stacked from 600px to 839px, and both panes side by side at 840px or wider.
- At compact widths the separator is removed and `v-model:compact-pane` selects `primary` or `supporting`. The default is `primary`.
- The ratio is preserved when the orientation changes. The divider remains adjustable in medium and expanded layouts.
- A pane with no visible children is treated as absent. If either pane is empty, the separator disappears and the remaining pane fills the container.

### State ownership

`v-model` owns the accepted percentage of space given to the start pane. The component measures available space, clamps to `min` and `max`, snaps to `detents`, and proposes changes; it does not store routes, pane content, or a second ratio. The application owns which content each pane shows, the compact destination switch, and any layout that should change at a breakpoint.

### RTL and internationalization

- Insets, pane order, and pointer direction follow the writing direction. The start pane is on the right in RTL and on the left in LTR.
- The default `aria-valuetext` is English, `"Start pane N%, end pane N%"`. Pass a localized `valueText` when the interface is not in English.
- `label` is required and should name the primary pane the divider controls. It is also the separator's accessible name.

## API

### Exports

| Export                 | Kind      | Use                                             |
| ---------------------- | --------- | ----------------------------------------------- |
| `SplitPane`            | Component | Resizable two-pane layout with a named divider. |
| `SplitPaneOrientation` | Type      | `'horizontal'`, `'vertical'`, or `'auto'`.      |

### Props and models

| Prop and model           | Type                                   | Default                | Use                                                                                             |
| ------------------------ | -------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| `v-model` / `modelValue` | `number`                               | `50`                   | Accepted percentage of available space for the start pane.                                      |
| `v-model:compact-pane`   | `'primary' \| 'supporting'`            | `'primary'`            | Pane shown below 600px in `auto` mode.                                                          |
| `min`, `max`             | `number`                               | `0`, `100`             | Accepted bounds, clamped to 0–100.                                                              |
| `step`                   | `number`                               | `1`                    | Keyboard increment without detents. Non-positive values fall back to `1`.                       |
| `detents`                | `number[]`                             | `[]`                   | Snap points; clamped, deduplicated, and sorted. First and last also define collapse and expand. |
| `wrapDetents`            | `boolean`                              | `false`                | Space wraps from the last detent to the first.                                                  |
| `orientation`            | `'horizontal' \| 'vertical' \| 'auto'` | `'horizontal'`         | Layout direction or responsive behavior.                                                        |
| `label`                  | `string`                               | Required               | Accessible name of the divider; should name the primary pane.                                   |
| `valueText`              | `string`                               | Generated English text | Accessible description of the current pane ratio.                                               |
| `disabled`               | `boolean`                              | `false`                | Disables pointer and keyboard resizing.                                                         |
| `overshootLimit`         | `number`                               | `4`                    | Visual overshoot past a bound while dragging, in percentage points.                             |

### Events

| Event         | Payload                         | Use                                                            |
| ------------- | ------------------------------- | -------------------------------------------------------------- |
| `beforeinput` | `(event: Event, value: number)` | Cancellable before the value changes; call `preventDefault()`. |
| `input`       | `(event: Event, value: number)` | Continuous updates while dragging or resizing.                 |
| `change`      | `(event: Event, value: number)` | One completed interaction.                                     |

The same native events also bubble from the root, so listeners can be attached with `@beforeinput`, `@input`, and `@change` on the component or a surrounding element.

### Slots

| Slot    | Scope | Use                 |
| ------- | ----- | ------------------- |
| `start` | —     | Logical start pane. |
| `end`   | —     | Logical end pane.   |

### Methods

Access these through a template ref.

| Member               | Signature                 | Use                                                   |
| -------------------- | ------------------------- | ----------------------------------------------------- |
| `collapse()`         | `() => void`              | Snaps the start pane to the first detent or `min`.    |
| `expand()`           | `() => void`              | Snaps the start pane to the last detent or `max`.     |
| `snapToValue(value)` | `(value: number) => void` | Snaps to the nearest accepted detent bound value.     |
| `separator`          | `HTMLElement \| null`     | The rendered separator element, or null before mount. |

## Styling

The divider uses a project-defined 24px full-height track with a 4px visible handle. It is a continuous resize target, so it does not expand to the 48px discrete-control target. Handle colors, state opacity, focus color, pressed shape, and transitions default to shared System tokens; the dimensions and interaction appearance are project-defined because Material defines no standalone resizable divider for supporting layouts.

| Area            | Supported properties                                                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handle geometry | `--yam3x-split-pane-drag-handle-container-width`, `--yam3x-split-pane-drag-handle-width`, `--yam3x-split-pane-drag-handle-height`, `--yam3x-split-pane-drag-handle-shape`, `--yam3x-split-pane-drag-handle-pressed-width`, `--yam3x-split-pane-drag-handle-pressed-height`, `--yam3x-split-pane-drag-handle-pressed-shape` |
| Handle colors   | `--yam3x-split-pane-drag-handle-color`, `--yam3x-split-pane-drag-handle-hover-color`, `--yam3x-split-pane-drag-handle-focus-color`, `--yam3x-split-pane-drag-handle-pressed-color`                                                                                                                                         |
| State opacity   | `--yam3x-split-pane-drag-handle-hover-opacity`, `--yam3x-split-pane-drag-handle-focus-opacity`                                                                                                                                                                                                                             |

Set these properties on the SplitPane root. The default handle transition is 0.15s; reduced motion removes it.

## Material references

[Supporting pane layout](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane) · [List-detail layout](https://m3.material.io/foundations/layout/canonical-examples/list-detail) · [WAI-ARIA window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)
