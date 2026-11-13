<script setup lang="ts">
import BottomSheetDetentsExample from './demos/BottomSheetDetentsExample.vue'
import BottomSheetExample from './demos/BottomSheetExample.vue'
</script>

# Bottom sheets

Bottom sheets show secondary content anchored to the bottom of the screen. There are two types of bottom sheets: standard and modal. A standard sheet coexists with the page; a modal sheet manages focus, blocks the background, and adds a scrim. Use a modal sheet on compact layouts and a standard sheet when the page must stay interactive.

## Examples

### Standard and modal sheets

The demo opens a standard sheet that follows its content height and a modal sheet that starts below half the viewport. Both sheets report lifecycle events, and gesture or control changes update the current detent. At wider window sizes, the demo also shows a side sheet alternative for the same contextual content.

<div class="vp-raw yam3x-doc-demo-theme"><BottomSheetExample /></div>

::: details View demo source

<<< ./demos/BottomSheetExample.vue{vue}

:::

### Custom detents

Detents can be named, percentages, pixel strings, or numbers. Change the unit to see the same sheet open at a different set of project-defined heights.

<div class="vp-raw yam3x-doc-demo-theme"><BottomSheetDetentsExample /></div>

::: details View demo source

<<< ./demos/BottomSheetDetentsExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BottomSheet, BottomSheetAction } from './components/yam3x/bottom-sheet'

const open = ref(false)
</script>

<template>
  <button
    type="button"
    @click="open = true"
  >
    Open options
  </button>
  <BottomSheet
    v-model:open="open"
    variant="modal"
    label="More options"
  >
    <template #header>More options</template>
    <p>Choose an action.</p>
    <BottomSheetAction>Done</BottomSheetAction>
  </BottomSheet>
</template>
```

::: details Composition with detents, a trigger slot, and methods

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BottomSheet, BottomSheetAction } from './components/yam3x/bottom-sheet'

const sheet = ref<InstanceType<typeof BottomSheet> | null>(null)
const open = ref(false)
const detent = ref<'fit' | 'expanded'>('fit')
</script>

<template>
  <BottomSheet
    ref="sheet"
    v-model:open="open"
    v-model:detent="detent"
    :detents="['fit', 'expanded']"
    handle
    hideable
    label="Supporting panel"
  >
    <template #trigger="{ triggerProps }">
      <button
        v-bind="triggerProps"
        type="button"
      >
        Open supporting panel
      </button>
    </template>
    <template #header>Supporting panel</template>
    <p>Sheet content.</p>
    <button
      type="button"
      @click="sheet?.requestDetent('expanded')"
    >
      Expand
    </button>
    <BottomSheetAction>Done</BottomSheetAction>
  </BottomSheet>
</template>
```

:::

## Behavior and accessibility

### Keyboard

- Arrow Up and Arrow Down change the active detent when focus is inside the sheet.
- The drag handle and the default Resize button change detents with Enter or Space; a drag handle also responds to a single pointer.
- A modal sheet traps Tab and Shift+Tab inside the sheet until it closes.
- Escape closes a standard sheet and dismisses a modal sheet.

### Focus and dismissal

- A closed standard sheet is `inert` and `aria-hidden`, so its controls leave the tab order.
- A standard sheet always shows a labeled close button. At the expanded detent it also shows a separate collapse action that returns to the lowest detent. Set `showCloseButton=false` only when the content provides its own visible dismissal control; Escape, scrim click, and dragging do not replace a visible control for voice-control and switch users.
- A modal sheet shows a labeled close button at every detent. It also closes on Escape or scrim click; with `handle`, a downward swipe over the handle row also dismisses it. Focus returns to the element that opened it.
- `cancel` fires for component-originated dismissal before `closing`. Call `preventDefault()` on either event to keep the sheet open.
- Parent updates to `v-model:open` are authoritative. They are not canceled by component events, so an external state change always wins.
- A modal sheet opens at the highest detent at or below half the viewport. Closing preserves the current detent, so reopening restores it.

### Detents and state

- A controlled `detent` is authoritative, including on the first modal opening, and must be included in `detents`.
- Named detents are `collapsed`, `fit`, `partially-expanded`, and `expanded`. `collapsed`, percentages, pixel strings, and numbers are project extensions.
- Numeric detents are CSS pixels. `fit` follows the sheet content, and `expanded` stops below the top edge.
- `hideable` lets a standard sheet close by dragging its handle below the lowest detent or by cycling past the highest detent. With `handle`, a modal sheet can also be dismissed by swiping down.

### Responsive and RTL

- A modal sheet uses at most 640px of width by default. Set `maxWidth` or the width custom properties to change the cap.
- Sheets leave 56px below the top edge on wider viewports and 72px at widths up to 640px.
- Content and motion follow the document direction; the sheet stays anchored to the bottom edge.

## API

### Exports

| Export               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `BottomSheet`        | The sheet container and behavior.                |
| `BottomSheetAction`  | A native action button that requests dismissal.  |
| `BottomSheetDetent`  | Type for the `detent` model and `detents` items. |
| `BottomSheetVariant` | Type for the `variant` prop.                     |

### `BottomSheet` props and models

| Prop / model      | Type                                | Default                                                                            | Description                                                                                                                                                                                      |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant`         | `'standard' \| 'modal'`             | `'standard'`                                                                       | A standard sheet coexists with the page; a modal sheet manages focus and adds a scrim.                                                                                                           |
| `open`            | `v-model:open: boolean`             | `false`                                                                            | Controls visibility.                                                                                                                                                                             |
| `detent`          | `v-model:detent: BottomSheetDetent` | `fit` for standard; `partially-expanded` for modal                                 | Current detent; it must be included in `detents`. Values can be `collapsed`, `fit`, `partially-expanded`, `expanded`, a percentage, pixels, or a number.                                         |
| `detents`         | `BottomSheetDetent[]`               | `['fit', 'expanded']` for standard; `['partially-expanded', 'expanded']` for modal | Detents ordered from lowest to highest. The default modal opening position is the highest detent at or below half the viewport.                                                                  |
| `hideable`        | `boolean`                           | `false`                                                                            | Whether a standard sheet can be hidden by dragging its handle below the lowest detent or by cycling past the highest detent. With `handle`, a modal sheet can also be dismissed by swiping down. |
| `handle`          | `boolean`                           | `false`                                                                            | Shows a resize handle that supports dragging and keyboard activation.                                                                                                                            |
| `label`           | `string`                            | —                                                                                  | Accessible name for the sheet; falls back to the `header` title, then a localized default.                                                                                                       |
| `handleLabel`     | `string`                            | Localized default                                                                  | Accessible name for the drag handle and the default resize control.                                                                                                                              |
| `closeLabel`      | `string`                            | Localized default                                                                  | Accessible name for the close button.                                                                                                                                                            |
| `showCloseButton` | `boolean`                           | `true`                                                                             | Whether the sheet renders its visible close button. Both variants show it at every detent by default. Set it to `false` only when the content provides its own visible dismissal control.        |
| `collapseLabel`   | `string`                            | Localized default                                                                  | Name of the action that returns an expanded standard sheet to a lower detent.                                                                                                                    |
| `maxWidth`        | `string`                            | `640px`                                                                            | Custom maximum width.                                                                                                                                                                            |
| `locale`          | `string`                            | Provider, then `en-US`                                                             | Overrides the language of built-in action labels.                                                                                                                                                |

Built-in labels inherit from [LocaleProvider](/components/localization)'s `actions` namespace. Existing label props override the corresponding shared defaults.

### `BottomSheet` events

| Event     | Payload | Description                                                                                                     |
| --------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `opening` | `Event` | Cancelable. Fired before a component-originated request to open the sheet.                                      |
| `opened`  | `Event` | Fired after the sheet opens.                                                                                    |
| `closing` | `Event` | Cancelable. Fired before a component-originated close request.                                                  |
| `closed`  | `Event` | Fired after the sheet closes.                                                                                   |
| `cancel`  | `Event` | Cancelable. Fired for component-originated dismissal before `closing`; `preventDefault()` keeps the sheet open. |

### `BottomSheet` slots

| Slot              | Props                        | Description                                                                                 |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| `default`         | —                            | Body content.                                                                               |
| `trigger`         | `{ triggerProps, activate }` | Custom trigger. Bind `triggerProps` for ARIA wiring and click handling, or call `activate`. |
| `header`          | —                            | Sheet title. It also names the sheet when `label` is absent.                                |
| `handle`          | —                            | Replaces the handle graphic.                                                                |
| `resize-control`  | `{ resize }`                 | Replaces the default Resize button when `handle` is off and more than one detent exists.    |
| `collapse-action` | `{ collapse }`               | Replaces the standard sheet's collapse action at the expanded detent.                       |

### `BottomSheet` methods

Access these through a template ref.

| Method                  | Returns   | Description                                                                                         |
| ----------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `close()`               | `boolean` | Requests dismissal through `cancel` and `closing`; returns whether the request was accepted.        |
| `requestOpen(open)`     | `boolean` | Requests the given open state; returns whether the request was accepted.                            |
| `requestDetent(detent)` | `void`    | Changes the detent, updates the height, and closes a hideable sheet when the target is `collapsed`. |

### `BottomSheetAction`

`BottomSheetAction` renders a native `<button>` and forwards attributes and listeners. It emits `click`; unless the event is default-prevented, activating it requests dismissal through the surrounding sheet.

| Event   | Payload      | Description                     |
| ------- | ------------ | ------------------------------- |
| `click` | `MouseEvent` | Fired before the close request. |

## Styling

These project overrides are available on the sheet or scrim element. Runtime detent values and the `maxWidth` prop are managed internally. Material defines the component roles and dimensions; these CSS property names and override behavior are project API.

::: details Styling overrides

**Color**

| Property                               | Default                        | Description            |
| -------------------------------------- | ------------------------------ | ---------------------- |
| `--yam3x-bottom-sheet-container-color` | System `surface-container-low` | Sheet container color. |
| `--yam3x-bottom-sheet-color`           | System `on-surface`            | Sheet content color.   |

**Shape and elevation**

| Property                                         | Default                   | Description                                        |
| ------------------------------------------------ | ------------------------- | -------------------------------------------------- |
| `--yam3x-bottom-sheet-container-shape`           | System extra-large corner | Shape of the sheet's top corners.                  |
| `--yam3x-bottom-sheet-minimized-container-shape` | `0`                       | Top-corner radius while the sheet is closed.       |
| `--yam3x-bottom-sheet-expanded-container-shape`  | Container shape           | Top-corner radius at the expanded detent.          |
| `--yam3x-bottom-sheet-elevation`                 | System elevation level 1  | Sheet shadow.                                      |
| `--yam3x-bottom-sheet-expanded-elevation`        | Sheet elevation           | Shadow at the expanded detent.                     |
| `--yam3x-bottom-sheet-modal-elevation`           | Sheet elevation           | Shadow for modal sheets below the expanded detent. |

**Layout and spacing**

| Property                                 | Default                                         | Description                                                          |
| ---------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `--yam3x-bottom-sheet-width`             | Full available width                            | Optional width cap applied before `max-width`.                       |
| `--yam3x-bottom-sheet-max-width`         | `640px`                                         | CSS maximum width; `maxWidth` can impose a second cap.               |
| `--yam3x-bottom-sheet-top-space`         | `56px`                                          | Maximum sheet height space below the top edge on wider viewports.    |
| `--yam3x-bottom-sheet-compact-top-space` | `72px`                                          | Maximum sheet height space below the top edge at widths up to 640px. |
| `--yam3x-bottom-sheet-peek-height`       | `96px`                                          | Height used by the project `collapsed` detent.                       |
| `--yam3x-bottom-sheet-padding-inline`    | `24px` × System density scale                   | Inline spacing for the sheet title and body.                         |
| `--yam3x-bottom-sheet-padding-block`     | `8px` title; `24px` body × System density scale | Block spacing for the title and body.                                |

**Typography**

| Property                                   | Default                           | Description                   |
| ------------------------------------------ | --------------------------------- | ----------------------------- |
| `--yam3x-bottom-sheet-header-font-size`    | `24px`                            | Project title font size.      |
| `--yam3x-bottom-sheet-header-font-weight`  | `400`                             | Project title font weight.    |
| `--yam3x-bottom-sheet-header-line-height`  | `32px` × System line-height scale | Project title line height.    |
| `--yam3x-bottom-sheet-header-tracking`     | `0`                               | Project title letter spacing. |
| `--yam3x-bottom-sheet-content-font-size`   | `16px`                            | Body font size.               |
| `--yam3x-bottom-sheet-content-font-weight` | `400`                             | Body font weight.             |
| `--yam3x-bottom-sheet-content-line-height` | `24px` × System line-height scale | Body line height.             |
| `--yam3x-bottom-sheet-content-tracking`    | `0.5px`                           | Body letter spacing.          |

**Handle**

| Property                                            | Default                     | Description                                             |
| --------------------------------------------------- | --------------------------- | ------------------------------------------------------- |
| `--yam3x-bottom-sheet-drag-handle-container-height` | `48px`                      | Height reserved for the optional drag handle.           |
| `--yam3x-bottom-sheet-handle-width`                 | `32px`                      | Drag handle width.                                      |
| `--yam3x-bottom-sheet-handle-height`                | `4px`                       | Drag handle height.                                     |
| `--yam3x-bottom-sheet-handle-shape`                 | `999px`                     | Drag handle corner radius.                              |
| `--yam3x-bottom-sheet-handle-color`                 | System `on-surface-variant` | Drag handle color.                                      |
| `--yam3x-bottom-sheet-handle-focus-ring-offset`     | `2px`                       | Focus outline offset for the handle and sheet controls. |

**Layering and scrim**

| Property                             | Default                        | Description                                                    |
| ------------------------------------ | ------------------------------ | -------------------------------------------------------------- |
| `--yam3x-bottom-sheet-z-index`       | `61` modal; `30` standard      | Sheet stacking order.                                          |
| `--yam3x-bottom-sheet-scrim-color`   | System `scrim`                 | Modal scrim color.                                             |
| `--yam3x-bottom-sheet-scrim-opacity` | Shared overlay default (`32%`) | Modal scrim opacity; the shared default is a project decision. |

:::

## Material references

[Bottom sheets overview](https://m3.material.io/components/bottom-sheets/overview) · [guidelines](https://m3.material.io/components/bottom-sheets/guidelines) · [specs](https://m3.material.io/components/bottom-sheets/specs) · [accessibility](https://m3.material.io/components/bottom-sheets/accessibility)
