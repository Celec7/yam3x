<script setup lang="ts">
import TooltipExample from './demos/TooltipExample.vue'
</script>

# Tooltips

Tooltips provide a short label or supplementary explanation for a control. Do not repeat visible text or place essential instructions only in a tooltip.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><TooltipExample /></div>

::: details View demo source

<<< ./demos/TooltipExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Tooltip } from './components/yam3x/tooltip'
</script>

<template>
  <button
    id="help"
    aria-label="Help"
  >
    ?
  </button>
  <Tooltip for="help">Help with this page</Tooltip>
</template>
```

## API

Both `Tooltip` and `RichTooltip` require `for`, the ID of an existing control. They support `id`, `position`, `showDelay` (default `0`), `hideDelay` (default `1500`), `offset`, `disabled`, `touchGestures`, `v-model:open`, and exposed `show()` / `hide()` methods. They emit `beforetoggle` and `toggle` events. `Tooltip` accepts `above`, `below`, `before`, or `after`; `RichTooltip` also accepts corner placements such as `below-after`.

`RichTooltip` adds `persistent` (default `false`) and `ariaLabel`, plus default body, `#subhead`, and `#actions` slots. `RichTooltipAction` wraps an action and accepts `disableRestoreFocus` (default `false`). These controls and persistent behavior are project API.

## Behavior and accessibility

`Tooltip` and `RichTooltip` use `for` to reference the `id` of an existing control. By default, they appear on hover or keyboard-visible focus. The app can control visibility with `v-model:open`, `show()`, and `hide()`. Both tooltip types remain visible for 1.5 seconds after the target is left. Press Esc to close a tooltip; only one is shown at a time.

`Tooltip` appears above its control by default. Set `position` to `above`, `below`, `before`, or `after`. The default gap is 4px from a visible control and 8px from a text baseline. When space is limited, it flips or moves away from viewport edges, correcting position in 8px increments. Targets in a page header default to a tooltip below them.

`RichTooltip` supports default body content and optional `#subhead` and `#actions` slots. Keep the subhead short. Provide no more than two text buttons, aligned with the body’s start edge and preferably side by side. By default, rich tooltips appear centered below their target on desktop devices with a fine pointer, and below the target aligned to its trailing edge on touch-first devices. Set `position` to override this. Temporary rich tooltips with actions also appear on hover, keyboard-visible focus, or touch long-press. Clicking the trigger while a rich tooltip is open pins it for continued interaction. Focus can move through links and buttons in page order; it is not trapped in the popup. Wrap action buttons in `RichTooltipAction`; after an action, it closes and restores focus to the trigger. Set `disable-restore-focus` to turn off focus restoration. If there is no subhead but the tooltip contains interactive content, name it with `aria-label`.

Use `persistent` for ongoing messages such as new-feature announcements. Open it with a click or `v-model:open`; it closes when the user clicks or focuses another page control. Do not use persistent rich tooltips on icon buttons. Regular tooltips are temporary by default.

## Styling

Tooltip styles map Material roles and type styles through component-owned tokens. The following properties are supported consumer overrides; set them on the tooltip component or an ancestor in its theme scope.

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

These are project extension points, not Material token names. Plain typography and geometry, Rich typography and spacing, and motion use component mappings of System tokens. Plain content that exceeds the viewport-safe height can be scrolled instead of being clipped.

## Material references

[Tooltips overview](https://m3.material.io/components/tooltips/overview) · [guidelines](https://m3.material.io/components/tooltips/guidelines) · [specs](https://m3.material.io/components/tooltips/specs) · [accessibility](https://m3.material.io/components/tooltips/accessibility)
