<script setup lang="ts">
import BadgeExample from './demos/BadgeExample.vue'
</script>

# Badges

Badges show a short count or status beside the item it describes. Keep the relationship clear, and do not use a badge in place of the control’s action or label.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <BadgeExample />
</div>

::: details View demo source

<<< ./demos/BadgeExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import Badge from './components/yam3x/badge/badge.vue'
</script>

<template>
  <button
    id="inbox"
    type="button"
  >
    Inbox
  </button>
  <Badge
    for="inbox"
    aria-label="3 unread messages"
    >3</Badge
  >
</template>
```

## API

| Prop         | Type                                                                                              | Default                           | Description                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `position`   | `above-after \| above-before \| below-before \| below-after \| before \| after \| above \| below` | `above-after`                     | Logical position relative to the anchor; RTL mirrors before/after.                                      |
| `for`        | `string`                                                                                          | —                                 | ID of the target element in the same document or shadow root; the badge follows its position and scale. |
| `dir`        | `ltr \| rtl`                                                                                      | Inherited                         | Explicitly sets the badge direction.                                                                    |
| `aria-label` | `string`                                                                                          | “New notification” for dot badges | Provides a clearer accessible name.                                                                     |
| Default slot | `VNode`                                                                                           | Empty                             | No rendered content shows the small dot; rendered content shows the large text badge.                   |
| `hidden`     | Native boolean prop                                                                               | `false`                           | Hides the badge. The parent controls this state after the user views the corresponding destination.     |

## Behavior and accessibility

Text badges support up to four characters. Callers should abbreviate longer counts, for example as `999+`. The default colors use the `error` and `on-error` roles. Custom colors must maintain at least 3:1 contrast between the badge and surrounding content, and between its text and background. The badge selects its small dot or large text form from rendered slot content; the parent controls when it is hidden.

## Styling

| Property                             | Default                   | Description                                                                                      |
| ------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------ |
| `--yam3x-badge-container-color`      | System `error`            | Badge container color. Keep at least 3:1 contrast against surrounding content.                   |
| `--yam3x-badge-color`                | System `on-error`         | Badge label color. Keep at least 3:1 contrast against the badge container.                       |
| `--yam3x-badge-large-size`           | `16px`                    | Height and minimum width of the large badge.                                                     |
| `--yam3x-badge-large-font-size`      | System Label Small        | Large badge label font size.                                                                     |
| `--yam3x-badge-large-font-weight`    | System Label Small        | Large badge label font weight.                                                                   |
| `--yam3x-badge-large-line-height`    | System Label Small        | Large badge label line height.                                                                   |
| `--yam3x-badge-large-tracking`       | System Label Small        | Large badge label letter spacing.                                                                |
| `--yam3x-badge-long-label-font-size` | `10px`                    | Font size for labels longer than two characters.                                                 |
| `--yam3x-badge-long-label-tracking`  | `0.1px`                   | Letter spacing for labels longer than two characters.                                            |
| `--yam3x-badge-small-offset`         | `6px` small, `14px` large | Anchor offset in pixels. A supplied scalar is applied to both horizontal and vertical placement. |

These are project override hooks mapped to the Badge specification and System tokens. The small dot size and shape are fixed by the component mapping.

## Material references

[Badges overview](https://m3.material.io/components/badges/overview) · [guidelines](https://m3.material.io/components/badges/guidelines) · [specs](https://m3.material.io/components/badges/specs) · [accessibility](https://m3.material.io/components/badges/accessibility)
