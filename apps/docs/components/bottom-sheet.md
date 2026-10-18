<script setup>
import BottomSheetExample from './demos/BottomSheetExample.vue'
</script>

# Bottom sheets

Bottom sheets bring supporting content or actions up from a screen edge. A standard sheet remains alongside the main interface; a modal sheet blocks it temporarily.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><BottomSheetExample /></div>

::: details View demo source

<<< ./demos/BottomSheetExample.vue{vue}

:::

## Use in your app

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

## API

This component can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

| Prop            | Type                                | Default                                                                            | Description                                                                                                                                              |
| --------------- | ----------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`       | `'standard' \| 'modal'`             | `'standard'`                                                                       | A standard sheet coexists with the page; a modal sheet manages focus and adds a scrim. Material guidance uses modal sheets on mobile.                    |
| `open`          | `v-model:open: boolean`             | `false`                                                                            | Controls visibility.                                                                                                                                     |
| `detent`        | `v-model:detent: BottomSheetDetent` | `fit` for standard; `partially-expanded` for modal                                 | Current detent; it must be included in `detents`. Values can be `collapsed`, `fit`, `partially-expanded`, `expanded`, a percentage, pixels, or a number. |
| `detents`       | `BottomSheetDetent[]`               | `['fit', 'expanded']` for standard; `['partially-expanded', 'expanded']` for modal | Detents ordered from lowest to highest. The default modal opening position is the highest detent at or below half the viewport.                          |
| `hideable`      | `boolean`                           | `false`                                                                            | Whether a standard sheet can be hidden with a downward gesture or handle action. A modal sheet can still be dismissed by swiping down.                   |
| `handle`        | `boolean`                           | `false`                                                                            | Shows a resize handle that supports dragging and keyboard activation.                                                                                    |
| `label`         | `string`                            | —                                                                                  | Accessible name for the sheet; falls back to the `header` title.                                                                                         |
| `closeLabel`    | `string`                            | Localized default                                                                  | Accessible name for the close button. A standard sheet has an explicit close button at every detent.                                                     |
| `collapseLabel` | `string`                            | Localized default                                                                  | Name of the action that returns an expanded standard sheet to a lower detent.                                                                            |
| `maxWidth`      | `string`                            | `640px`                                                                            | Custom maximum width.                                                                                                                                    |

Use the default slot for body content. The `trigger` slot receives `triggerProps` and `activate`; use `header` for the title and `handle` to replace the handle graphic. With multiple detents and no drag handle, the default Resize button provides a single-pointer alternative; `resize-control` replaces that button. With a drag handle, the handle itself supports dragging and single-pointer detent changes. A standard sheet always provides a clearly labeled close button, plus a separate collapse action when expanded. `BottomSheetAction` is a native button that requests closure when activated.

## Behavior and accessibility

Closing preserves the current detent, so reopening restores it. A controlled `detent` value is authoritative, including on the first modal opening. Lifecycle events are `opening`, `opened`, `closing`, `closed`, and `cancel`. `preventDefault()` on `opening`, `closing`, or `cancel` cancels component-originated requests; direct parent updates to `v-model:open` are authoritative and cannot be canceled by these events. Numeric detents are CSS pixels. `collapsed`, `fit`, percentage, pixel, and numeric detents are project extensions.

## Styling

These project overrides are available on the sheet or scrim element. Runtime detent values and the `maxWidth` prop are managed internally.

| Property                                            | Default                                         | Description                                                          |
| --------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `--yam3x-bottom-sheet-container-color`              | System `surface-container-low`                  | Sheet container color.                                               |
| `--yam3x-bottom-sheet-color`                        | System `on-surface`                             | Sheet content color.                                                 |
| `--yam3x-bottom-sheet-container-shape`              | System extra-large corner                       | Shape of the sheet's top corners.                                    |
| `--yam3x-bottom-sheet-minimized-container-shape`    | `0`                                             | Top-corner radius while the sheet is closed.                         |
| `--yam3x-bottom-sheet-expanded-container-shape`     | Container shape                                 | Top-corner radius at the expanded detent.                            |
| `--yam3x-bottom-sheet-elevation`                    | System elevation level 1                        | Sheet shadow.                                                        |
| `--yam3x-bottom-sheet-expanded-elevation`           | Sheet elevation                                 | Shadow at the expanded detent.                                       |
| `--yam3x-bottom-sheet-modal-elevation`              | Sheet elevation                                 | Shadow for modal sheets below the expanded detent.                   |
| `--yam3x-bottom-sheet-z-index`                      | `61` modal; `30` standard                       | Sheet stacking order.                                                |
| `--yam3x-bottom-sheet-width`                        | Full available width                            | Optional width cap applied before `max-width`.                       |
| `--yam3x-bottom-sheet-max-width`                    | `640px`                                         | CSS maximum width; `maxWidth` can impose a second cap.               |
| `--yam3x-bottom-sheet-top-space`                    | `56px`                                          | Maximum sheet height space below the top edge on wider viewports.    |
| `--yam3x-bottom-sheet-compact-top-space`            | `72px`                                          | Maximum sheet height space below the top edge at widths up to 640px. |
| `--yam3x-bottom-sheet-peek-height`                  | `96px`                                          | Height used by the project `collapsed` detent.                       |
| `--yam3x-bottom-sheet-padding-inline`               | `24px` × System density scale                   | Inline spacing for the sheet title and body.                         |
| `--yam3x-bottom-sheet-padding-block`                | `8px` title; `24px` body × System density scale | Block spacing for the title and body.                                |
| `--yam3x-bottom-sheet-header-font-size`             | `24px`                                          | Project title font size.                                             |
| `--yam3x-bottom-sheet-header-font-weight`           | `400`                                           | Project title font weight.                                           |
| `--yam3x-bottom-sheet-header-line-height`           | `32px` × System line-height scale               | Project title line height.                                           |
| `--yam3x-bottom-sheet-header-tracking`              | `0`                                             | Project title letter spacing.                                        |
| `--yam3x-bottom-sheet-content-font-size`            | `16px`                                          | Body font size.                                                      |
| `--yam3x-bottom-sheet-content-font-weight`          | `400`                                           | Body font weight.                                                    |
| `--yam3x-bottom-sheet-content-line-height`          | `24px` × System line-height scale               | Body line height.                                                    |
| `--yam3x-bottom-sheet-content-tracking`             | `0.5px`                                         | Body letter spacing.                                                 |
| `--yam3x-bottom-sheet-drag-handle-container-height` | `48px`                                          | Height reserved for the optional drag handle.                        |
| `--yam3x-bottom-sheet-handle-width`                 | `32px`                                          | Drag handle width.                                                   |
| `--yam3x-bottom-sheet-handle-height`                | `4px`                                           | Drag handle height.                                                  |
| `--yam3x-bottom-sheet-handle-shape`                 | `999px`                                         | Drag handle corner radius.                                           |
| `--yam3x-bottom-sheet-handle-color`                 | System `on-surface-variant`                     | Drag handle color.                                                   |
| `--yam3x-bottom-sheet-handle-focus-ring-offset`     | `2px`                                           | Focus outline offset for the handle and sheet controls.              |
| `--yam3x-bottom-sheet-scrim-color`                  | System `scrim`                                  | Modal scrim color.                                                   |
| `--yam3x-bottom-sheet-scrim-opacity`                | Shared overlay default (`32%`)                  | Modal scrim opacity; the shared default is a project decision.       |

Material defines the component roles and dimensions; these CSS property names and override behavior are project API.

## Material references

[Bottom sheets overview](https://m3.material.io/components/bottom-sheets/overview) · [guidelines](https://m3.material.io/components/bottom-sheets/guidelines) · [specs](https://m3.material.io/components/bottom-sheets/specs) · [accessibility](https://m3.material.io/components/bottom-sheets/accessibility)
