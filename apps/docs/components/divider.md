<script setup lang="ts">
import DividerHorizontalExample from './demos/DividerHorizontalExample.vue'
import DividerVerticalExample from './demos/DividerVerticalExample.vue'
</script>

# Divider

Divider is a non-interactive line that separates related groups of content. Use it when spacing alone does not make the grouping clear.

Divider is an M3 baseline component. The project exports `HorizontalDivider` and `VerticalDivider`. Both draw the line in the outline variant color by default, and both are decorative. Setting `decorative` to `false` exposes a separator role and its orientation; that opt-in semantics is a project extension.

## Examples

### Horizontal divider

<div class="vp-raw yam3x-doc-demo-theme"><DividerHorizontalExample /></div>

The demo compares a full-width line with `inset`, `inset-start`, and `inset-end` lines, then sets `thickness` and `color` directly. Insets belong to the line, so the divider root keeps its full width and the line shrinks from the logical edge. A numeric `thickness` is read as CSS pixels; a string accepts any CSS length.

::: details View demo source

<<< ./demos/DividerHorizontalExample.vue{vue}

:::

### Vertical divider

<div class="vp-raw yam3x-doc-demo-theme"><DividerVerticalExample /></div>

`VerticalDivider` stretches to the block size of its flex parent, so give that parent a defined height. The demo sets `decorative="false"` to expose `role="separator"` with `aria-orientation="vertical"` between labelled groups.

::: details View demo source

<<< ./demos/DividerVerticalExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { HorizontalDivider, VerticalDivider } from './components/yam3x/divider'
</script>

<template>
  <section>
    <p>First section</p>
    <HorizontalDivider />
    <p>Second section</p>
  </section>
  <div style="display: flex; block-size: 48px">
    <span>Related</span>
    <VerticalDivider :decorative="false" />
    <span>Actions</span>
  </div>
</template>
```

The divider owns no content. Place it between the groups it separates, or inside a flex row for a vertical line. Do not wrap it in an extra element that would take over the parent's height.

Set `--yam3x-divider-thickness`, `--yam3x-divider-color`, and the inset properties on the surrounding theme scope when you need repeated overrides. An explicit `thickness` or `color` prop takes precedence over the matching custom property. The `inset` props do not change the root geometry; they change the line inside it.

## Behavior and accessibility

### Orientation and sizing

- `HorizontalDivider` spans the available inline size and is `1px` thick by default.
- `VerticalDivider` spans the available block size and is `1px` wide by default. It uses `align-self: stretch`, so the parent must provide a height.
- The root keeps the measured thickness as its height or width. The line fills the remaining inline or block space.
- The component never grows from content and has `pointer-events: none`, so it cannot receive focus or pointer input.

### Semantics

- A decorative divider is hidden from assistive technology with `aria-hidden="true"` and has no role.
- `decorative="false"` removes the hidden state and exposes `role="separator"`. A vertical divider also receives `aria-orientation="vertical"`.
- Prefer meaningful headings and groups for structure. A separator role is appropriate only when the visual line also marks a real division for assistive technology.

### Insets and RTL

- `inset` applies the same inset to both logical sides. `insetStart` and `insetEnd` apply one side and combine with each other.
- Insets are logical. In a right-to-left layout, the start inset moves to the right edge; the end inset moves to the left edge.
- The default inset is `16px` and can be changed per side with the styling hooks below.

### Forced colors

In forced-colors mode the line is painted with the system `GrayText` color so it stays visible against the system canvas.

## API

### Exports

| Export              | Kind      | Use                                               |
| ------------------- | --------- | ------------------------------------------------- |
| `HorizontalDivider` | Component | Horizontal separating line.                       |
| `VerticalDivider`   | Component | Vertical separating line for a sized flex parent. |
| `DividerThickness`  | Type      | `number \| string` accepted by `thickness`.       |

### `HorizontalDivider` props

| Prop         | Type               | Default           | Use                                                                            |
| ------------ | ------------------ | ----------------- | ------------------------------------------------------------------------------ |
| `thickness`  | `number \| string` | `1px`             | Line thickness. Numbers are CSS pixels; strings accept CSS lengths.            |
| `color`      | `string`           | `outline-variant` | CSS color of the line.                                                         |
| `inset`      | `boolean`          | `false`           | Applies the default inset to both logical sides.                               |
| `insetStart` | `boolean`          | `false`           | Applies the default inset to the logical start only.                           |
| `insetEnd`   | `boolean`          | `false`           | Applies the default inset to the logical end only.                             |
| `decorative` | `boolean`          | `true`            | Hides the line from assistive technology; `false` exposes separator semantics. |

### `VerticalDivider` props

| Prop         | Type               | Default           | Use                                                                            |
| ------------ | ------------------ | ----------------- | ------------------------------------------------------------------------------ |
| `thickness`  | `number \| string` | `1px`             | Line thickness. Numbers are CSS pixels; strings accept CSS lengths.            |
| `color`      | `string`           | `outline-variant` | CSS color of the line.                                                         |
| `inset`      | `boolean`          | `false`           | Applies the default inset to both logical sides.                               |
| `insetStart` | `boolean`          | `false`           | Applies the default inset to the logical start only.                           |
| `insetEnd`   | `boolean`          | `false`           | Applies the default inset to the logical end only.                             |
| `decorative` | `boolean`          | `true`            | Hides the line from assistive technology; `false` exposes separator semantics. |

### Events

Neither component emits events.

### Slots

Neither component renders slot content.

### Methods

Neither component exposes instance methods.

## Styling

The public hooks are project-defined custom properties set on the root. An explicit `thickness` or `color` prop overrides the matching property.

| Property                           | Default                    | Use                                         |
| ---------------------------------- | -------------------------- | ------------------------------------------- |
| `--yam3x-divider-thickness`        | `1px`                      | Line thickness when `thickness` is omitted. |
| `--yam3x-divider-color`            | System `outline-variant`   | Line color when `color` is omitted.         |
| `--yam3x-divider-inset-size`       | `16px`                     | Default inset used by both sides.           |
| `--yam3x-divider-inset-start-size` | Inherits the default inset | Logical start inset.                        |
| `--yam3x-divider-inset-end-size`   | Inherits the default inset | Logical end inset.                          |

## Material references

[Divider overview](https://m3.material.io/components/divider/overview) · [guidelines](https://m3.material.io/components/divider/guidelines) · [specs](https://m3.material.io/components/divider/specs) · [accessibility](https://m3.material.io/components/divider/accessibility)
