<script setup lang="ts">
import TooltipExample from './demos/TooltipExample.vue'
import TooltipInteractionExample from './demos/TooltipInteractionExample.vue'
</script>

# Tooltips

Tooltips display brief labels or messages. Use tooltips to add additional context to a button or other UI element.

Two variants: plain and rich. `Tooltip` is the plain variant; `RichTooltip` adds a subhead, links, and up to two text buttons.

## Examples

### Plain and rich

Plain tooltips briefly describe a UI element. They're best used for labelling UI elements with no text, like icon-only buttons and fields. Rich tooltips provide additional context about a UI element. They can optionally contain a subhead, buttons, and hyperlinks.

<div class="vp-raw yam3x-doc-demo-theme"><TooltipExample /></div>

::: details View demo source

<<< ./demos/TooltipExample.vue{vue}

:::

### Delays, disabled state, and RTL

`showDelay` controls how long a hover or keyboard focus waits before the tooltip opens. `disabled` keeps the tooltip closed. `before` and `after` placements follow the reading direction of the target.

<div class="vp-raw yam3x-doc-demo-theme"><TooltipInteractionExample /></div>

::: details View demo source

<<< ./demos/TooltipInteractionExample.vue{vue}

:::

## Use in your app

Both components require `for`, the ID of an existing control. Import them from `./components/yam3x/tooltip`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RichTooltip, Tooltip } from './components/yam3x/tooltip'

const open = ref(false)
</script>

<template>
  <button
    id="save"
    type="button"
    aria-label="Save"
  >
    Save
  </button>
  <Tooltip for="save">Save this document</Tooltip>

  <button
    id="sharing"
    type="button"
  >
    Sharing
  </button>
  <RichTooltip
    v-model:open="open"
    for="sharing"
    aria-label="Sharing settings"
  >
    <template #subhead>New sharing settings</template>
    Adjust image quality and manage storage for shared albums.
  </RichTooltip>
</template>
```

## Behavior and accessibility

### Placement

- By default, plain tooltips are positioned directly above the parent element. If the element is in an app bar, the plain tooltip appears below the element at the same distance.
- If there's a visual boundary, like a button, the distance is 4dp. If there's no visual boundary, like with text baselines, the distance is 8dp. Set `offset` to fix one distance in CSS pixels.
- The position of the tooltip adjusts in increments of 8dp to avoid going off-screen. `position` requests a side; the component still flips and shifts away from viewport edges. Tooltips shouldn't cover the parent element.
- `before` and `after` resolve against the target's writing direction, so they mirror in RTL.
- By default, rich tooltips are positioned to the bottom right of the parent element on touch-first devices and centered below it on desktop devices with a fine pointer. Corner values such as `below-after` align the tooltip to a target edge.

### Interaction and delays

- To show a tooltip, hover on the parent element on desktop, or tap and hold the element on mobile. Persistent rich tooltips only appear when clicked or tapped.
- Temporary plain and rich tooltips disappear 1.5 seconds after navigating away from the target region. Set `hideDelay` to change that delay and `showDelay` to delay opening.
- Triggering a new tooltip immediately closes any other open tooltip. Only one tooltip is open at a time.
- Press Escape to close an open tooltip.
- A rich tooltip with actions appears on hover, keyboard-visible focus, or touch long-press. Clicking the trigger while it is open pins it so its links and buttons stay reachable.
- `persistent` rich tooltips open only from a click or `v-model:open`, ignore hover, and close once a person interacts with another element. Avoid persistent rich tooltips on icon buttons.
- `v-model:open`, `show()`, and `hide()` let the app control visibility directly.

### Disabled

- `disabled` stops the tooltip from opening and removes its entry from the target's `aria-describedby`.
- The tooltip also stays closed when the target matches `:disabled` or `aria-disabled="true"`.

### Accessibility wiring

- The component adds its own ID to the target's `aria-describedby` while it is enabled and non-interactive, and removes it when the tooltip is disabled or the rich tooltip becomes interactive.
- A plain tooltip surface has `role="tooltip"`. Tooltips are not focusable and do not trap focus.
- Rich tooltip containers should not block important information or prevent a person from completing an action. Avoid trapping screen reader and keyboard focus on rich tooltips.
- When a rich tooltip contains a link or button, the surface switches to `role="dialog"`, and the target gets `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`. The surface is labelled by `#subhead`, or by `ariaLabel` when there is no subhead, and the body describes it.
- Focus moves into the tooltip in page order after the target. Wrap action buttons in `RichTooltipAction`; activating one closes the tooltip and returns focus to the target unless `disableRestoreFocus` is set.

### Content guidance

- Plain tooltips briefly describe a UI element. Avoid wrapping text to multiple lines or including many pieces of information. Content that exceeds the viewport-safe height scrolls instead of being clipped.
- Keep rich tooltip subheads brief, ideally to one line. Use up to two text buttons, keep them side by side, and do not hide critical information in a tooltip.

## API

### Exports

`Tooltip`, `RichTooltip`, `RichTooltipAction`, plus the `TooltipPosition`, `RichTooltipPosition`, and `TooltipTouchGestures` types.

### `Tooltip`

| Prop            | Type                                        | Default                                                         | Description                                                            |
| --------------- | ------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `for`           | `string`                                    | Required                                                        | ID of the control the tooltip describes.                               |
| `id`            | `string`                                    | Generated `yam3x-tooltip-*`                                     | Tooltip surface ID; also written to the target's `aria-describedby`.   |
| `position`      | `'above' \| 'below' \| 'before' \| 'after'` | `above`, or `below` for a target inside an app bar or header    | Requested placement.                                                   |
| `showDelay`     | `number`                                    | `0`                                                             | Milliseconds to wait before opening on hover or keyboard focus.        |
| `hideDelay`     | `number`                                    | `1500`                                                          | Milliseconds to wait before closing after the pointer or focus leaves. |
| `offset`        | `number`                                    | Unset: 4px from a control with a visual boundary, 8px otherwise | Distance between target and tooltip in pixels.                         |
| `disabled`      | `boolean`                                   | `false`                                                         | Prevents opening and removes the `aria-describedby` entry.             |
| `touchGestures` | `'auto' \| 'on' \| 'off'`                   | `'auto'`                                                        | Touch long-press behavior; see the note below.                         |
| `open`          | `v-model:open: boolean`                     | `false`                                                         | Visibility state.                                                      |

`touchGestures` values:

| Value    | Behavior                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `'auto'` | Long-press on touch opens a transient tooltip after 500ms. The target keeps its default text selection and tap styling.   |
| `'on'`   | Same long-press, and the target opts out of text selection, drag, and tap highlight while it is connected.                |
| `'off'`  | Long-press never opens the tooltip. Pointer hover and keyboard focus still open it, and click still activates the target. |

### `RichTooltip`

| Prop            | Type                                                                                                              | Default                                                         | Description                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `for`           | `string`                                                                                                          | Required                                                        | ID of the control the tooltip describes.                               |
| `id`            | `string`                                                                                                          | Generated `yam3x-rich-tooltip-*`                                | Tooltip surface ID.                                                    |
| `position`      | `'above' \| 'below' \| 'before' \| 'after' \| 'above-before' \| 'above-after' \| 'below-before' \| 'below-after'` | `below` on a fine pointer; `below-after` on touch-first devices | Requested placement, including corner alignments.                      |
| `showDelay`     | `number`                                                                                                          | `0`                                                             | Milliseconds to wait before opening on hover or keyboard focus.        |
| `hideDelay`     | `number`                                                                                                          | `1500`                                                          | Milliseconds to wait before closing after the pointer or focus leaves. |
| `offset`        | `number`                                                                                                          | `8`                                                             | Distance between target and tooltip in pixels.                         |
| `disabled`      | `boolean`                                                                                                         | `false`                                                         | Prevents opening and removes the `aria-describedby` entry.             |
| `persistent`    | `boolean`                                                                                                         | `false`                                                         | Keeps the tooltip open until another element is used.                  |
| `ariaLabel`     | `string`                                                                                                          | —                                                               | Accessible name for an interactive tooltip without a `#subhead`.       |
| `touchGestures` | `'auto' \| 'on' \| 'off'`                                                                                         | `'auto'`                                                        | Touch long-press behavior.                                             |
| `open`          | `v-model:open: boolean`                                                                                           | `false`                                                         | Visibility state.                                                      |

### `RichTooltipAction`

| Prop                  | Type      | Default | Description                                                             |
| --------------------- | --------- | ------- | ----------------------------------------------------------------------- |
| `disableRestoreFocus` | `boolean` | `false` | Keeps focus where it is instead of returning it to the target on close. |

### Events

| Event          | Payload          | Description                                                           |
| -------------- | ---------------- | --------------------------------------------------------------------- |
| `beforetoggle` | `(event: Event)` | Fires before the tooltip opens or closes; `preventDefault()` cancels. |
| `toggle`       | `(event: Event)` | Fires after the tooltip opens or closes.                              |

Both components emit the same events.

### Slots

| Component           | Slot      | Description                                               |
| ------------------- | --------- | --------------------------------------------------------- |
| `Tooltip`           | default   | Supporting text.                                          |
| `RichTooltip`       | default   | Body content; links and buttons make it interactive.      |
| `RichTooltip`       | `subhead` | Optional one-line subhead.                                |
| `RichTooltip`       | `actions` | Action row for up to two `RichTooltipAction` items.       |
| `RichTooltipAction` | default   | Button or link content; activating it closes the tooltip. |

### Methods

| Method   | Description         |
| -------- | ------------------- |
| `show()` | Opens the tooltip.  |
| `hide()` | Closes the tooltip. |

Both components expose both methods.

## Styling

Tooltip styles map Material roles and type styles through component-owned tokens. These properties are supported consumer overrides; set them on the tooltip component or an ancestor in its theme scope. They are project extension points, not Material token names.

::: details Style properties

| Property                                     | Applies to            | Default                        |
| -------------------------------------------- | --------------------- | ------------------------------ |
| `--yam3x-tooltip-container-color`            | Plain container       | System `inverse-surface`       |
| `--yam3x-tooltip-supporting-text-color`      | Plain supporting text | System `inverse-on-surface`    |
| `--yam3x-tooltip-shape`                      | Plain container       | System `corner-extra-small`    |
| `--yam3x-tooltip-max-width`                  | Plain container       | 200px, limited by the viewport |
| `--yam3x-rich-tooltip-container-color`       | Rich container        | System `surface-container`     |
| `--yam3x-rich-tooltip-supporting-text-color` | Rich supporting text  | System `on-surface-variant`    |
| `--yam3x-rich-tooltip-subhead-color`         | Rich subhead          | System `on-surface-variant`    |
| `--yam3x-rich-tooltip-shape`                 | Rich container        | System `corner-medium`         |
| `--yam3x-rich-tooltip-elevation`             | Rich container shadow | System elevation level 3       |
| `--yam3x-rich-tooltip-max-width`             | Rich container        | 320px, limited by the viewport |

:::

Plain typography and geometry, rich typography and spacing, and motion use component mappings of System tokens.

## Material references

[Tooltips overview](https://m3.material.io/components/tooltips/overview) · [guidelines](https://m3.material.io/components/tooltips/guidelines) · [specs](https://m3.material.io/components/tooltips/specs) · [accessibility](https://m3.material.io/components/tooltips/accessibility)
