<script setup lang="ts">
import BadgeExample from './demos/BadgeExample.vue'
import BadgePositionsExample from './demos/BadgePositionsExample.vue'
</script>

# Badges

Badges show a notification, count, or short status associated with an icon or navigation destination. They are secondary indicators, not independent controls.

Badges are a Material 3 baseline component. This project adds logical placements for layouts other than icon navigation; the surface, type, color, and fixed dot geometry follow the Material badge spec.

## Examples

### Anchored badges

<div class="vp-raw yam3x-doc-demo-theme"><BadgeExample /></div>

::: details View demo source

<<< ./demos/BadgeExample.vue{vue}

:::

A badge with no rendered content is the 6 px dot. Rendered content produces the large form: `3` uses the standard label metrics, while `999+` switches to the compact four-character metrics. `for` keeps each badge positioned against its destination, and the application hides the dot after the messages are read.

### Placement and direction

<div class="vp-raw yam3x-doc-demo-theme"><BadgePositionsExample /></div>

::: details View demo source

<<< ./demos/BadgePositionsExample.vue{vue}

:::

The gallery covers the eight logical positions. Before and after follow the writing direction; `above-after` is the default and matches the Material upper-trailing placement. The direction control mirrors the whole gallery without changing any position values.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from './components/yam3x/badge'

const unread = ref(true)
const open = ref(false)
</script>

<template>
  <span class="badge-anchor">
    <button
      id="inbox"
      type="button"
      @click="open = true"
    >
      Inbox
    </button>
    <Badge
      for="inbox"
      aria-label="3 unread messages"
      :hidden="!unread"
      >3</Badge
    >
  </span>
</template>

<style scoped>
.badge-anchor {
  position: relative;
  display: inline-flex;
}
</style>
```

Place the badge inside a positioned wrapper when it must follow a destination, and give it an accessible name that describes the meaning rather than repeating only the number. The destination control owns activation; the badge has `pointer-events: none` and never enters the Tab order. When the destination control already includes the count in its accessible name, hide the badge from assistive technology or omit its label so the count is not announced twice.

::: details Dot and abbreviated count

```vue
<template>
  <span class="badge-anchor">
    <button
      id="alerts"
      type="button"
    >
      Alerts
    </button>
    <Badge
      for="alerts"
      aria-label="New alerts"
    />
  </span>
  <span class="badge-anchor">
    <button
      id="activity"
      type="button"
    >
      Activity
    </button>
    <Badge
      for="activity"
      aria-label="More than 999 unread items"
      >999+</Badge
    >
  </span>
</template>
```

Badge does not count, clamp, or abbreviate values. Keep large-badge content to four characters including `+`, and compute the abbreviation in the application.

:::

## Behavior and accessibility

### Content and size

- The component chooses its form from the rendered slot: no content, or whitespace only, renders the small dot; any rendered element or non-whitespace text renders the large badge.
- Large badges use the 11 px label metrics for one to three characters. Four characters, including `+`, use the 10 px compact metrics and a 4 px inline padding to stay within the 16 × 34 dp maximum.
- Badge does not truncate or reformat content. Longer text keeps the compact metrics and can grow beyond the intended count shape, so abbreviate in the application.
- `0` is ordinary content. The component does not hide zero counts; set `hidden` when the count reaches zero.
- The badge has `role="img"` and no focus target. Its content is hidden from assistive technology for the dot form.

### Placement and RTL

- `position` names a logical edge: `above`, `below`, `before`, `after`, and their corner combinations. `above-after` is the default.
- `before` and `after` mirror in right-to-left layouts; `above` and `below` stay vertical. Set `dir` only when the surrounding direction cannot supply the correct writing direction.
- The badge follows the target element when it moves, resizes, or is inserted later. Until a target exists and the position is measured, an attached badge stays invisible.
- A missing or renamed target leaves the badge unattached rather than guessing a new anchor.

### Read state

- The parent owns the read state. Hide a navigation badge after the destination is selected, and restore it only when the unread condition returns.
- `hidden` removes the badge from layout and the accessibility tree. Do not communicate unread state through color alone.

### Contrast and forced colors

- The default Error and On Error roles keep the badge distinct from surrounding content and readable in both themes. Custom color pairs need at least 3:1 contrast in both directions.
- In forced-colors mode the badge keeps a visible boundary and system colors instead of the theme fill.

## API

### Exports

| Export  | Description                                 |
| ------- | ------------------------------------------- |
| `Badge` | Dot or count indicator anchored to an item. |

### Props and models

Small badges inherit the localized `actions.newNotification` label from [LocaleProvider](/components/localization), defaulting to `New notification`; `locale` overrides the language and `aria-label` overrides the label.

| Prop and native attribute | Default                           | Use                                                                                                                      |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `position`                | `above-after`                     | Logical placement: `above-after`, `above-before`, `below-after`, `below-before`, `above`, `below`, `before`, or `after`. |
| `for`                     | Undefined                         | ID of the target in the same document or shadow root. The badge follows the target.                                      |
| `dir`                     | Inherited from the target         | Explicit `ltr` or `rtl` direction for logical placement.                                                                 |
| `aria-label`              | `New notification` for dot badges | Accessible name. Large badges have no default, so name counts explicitly.                                                |
| `locale`                  | Provider, then `en-US`            | Language of the default dot badge label.                                                                                 |
| `hidden`                  | `false`                           | Native hidden state; the application sets it after the destination is viewed.                                            |

### Events

Badge emits no events.

### Slots

| Slot      | Use                                                              |
| --------- | ---------------------------------------------------------------- |
| `default` | Badge content. Empty or whitespace content renders the dot form. |

### Methods

Badge exposes no instance methods.

## Styling

Badge exposes project-defined override hooks mapped to the Material badge spec and shared System tokens. The small dot's 6 px size and full corner shape are fixed; the large badge defaults to a 16 px height and minimum width.

::: details Custom properties

| Property                             | Default                            | Description                                                                                   |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `--yam3x-badge-container-color`      | System `error`                     | Badge container color. Keep at least 3:1 contrast against surrounding content.                |
| `--yam3x-badge-color`                | System `on-error`                  | Badge label color. Keep at least 3:1 contrast against the badge container.                    |
| `--yam3x-badge-large-size`           | `16px`                             | Height and minimum width of the large badge.                                                  |
| `--yam3x-badge-large-font-size`      | System Label Small                 | Large badge label font size.                                                                  |
| `--yam3x-badge-large-font-weight`    | System Label Small                 | Large badge label font weight.                                                                |
| `--yam3x-badge-large-line-height`    | System Label Small                 | Large badge label line height.                                                                |
| `--yam3x-badge-large-tracking`       | System Label Small                 | Large badge label letter spacing.                                                             |
| `--yam3x-badge-long-label-font-size` | `10px`                             | Font size for labels longer than three characters.                                            |
| `--yam3x-badge-long-label-tracking`  | `0.1px`                            | Letter spacing for labels longer than three characters.                                       |
| `--yam3x-badge-small-offset`         | `6px` small; `14px` × `12px` large | Anchor offset in pixels. A supplied scalar applies to both horizontal and vertical placement. |

:::

## Material references

[Badges overview](https://m3.material.io/components/badges/overview) · [guidelines](https://m3.material.io/components/badges/guidelines) · [specs](https://m3.material.io/components/badges/specs) · [accessibility](https://m3.material.io/components/badges/accessibility)
