<script setup lang="ts">
import DividerHorizontalExample from './demos/DividerHorizontalExample.vue'
import DividerVerticalExample from './demos/DividerVerticalExample.vue'
</script>

# Divider

Divider is a non-interactive line that separates related groups of content. Use it when spacing alone does not make the grouping clear.

## Interactive example

### Horizontal divider

<div class="vp-raw yam3x-doc-demo-theme"><DividerHorizontalExample /></div>

::: details View demo source

<<< ./demos/DividerHorizontalExample.vue{vue}

:::

### Vertical divider

<div class="vp-raw yam3x-doc-demo-theme"><DividerVerticalExample /></div>

::: details View demo source

<<< ./demos/DividerVerticalExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { HorizontalDivider, VerticalDivider } from './components/yam3x/divider'
</script>

<template>
  <div>
    <p>First section</p>
    <HorizontalDivider />
    <p>Second section</p>
  </div>
  <div style="display: flex; align-items: stretch; height: 48px">
    <span>Left</span>
    <VerticalDivider />
    <span>Right</span>
  </div>
</template>
```

## API

| Prop                     | Type               | Default           | Description                                                                                                                     |
| ------------------------ | ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `thickness`              | `number \| string` | `1px`             | Line thickness. Numbers are interpreted as pixels; strings accept CSS lengths.                                                  |
| `color`                  | `string`           | `outline-variant` | CSS color for the line.                                                                                                         |
| `inset`                  | `boolean`          | `false`           | Applies the default 16px inset to both logical start and end sides.                                                             |
| `insetStart`, `insetEnd` | `boolean`          | `false`           | Applies the default 16px inset to only the logical start or end side.                                                           |
| `decorative`             | `boolean`          | `true`            | Decorative by default and hidden from assistive technology. Setting it to `false` exposes a separator role (project extension). |

## Behavior and accessibility

`HorizontalDivider` spans its container width. `VerticalDivider` spans its parent's height and needs a parent with a defined height.

Decorative dividers should not be announced redundantly by screen readers. Use meaningful DOM structure to express content grouping.

## Styling

When `thickness` or `color` is unset, the corresponding `--yam3x-divider-thickness` or `--yam3x-divider-color` CSS custom property can provide a theme override; an explicit prop takes precedence. Insets can be customized with `--yam3x-divider-inset-size`, `--yam3x-divider-inset-start-size`, and `--yam3x-divider-inset-end-size`.

## Material references

[Divider overview](https://m3.material.io/components/divider/overview) · [guidelines](https://m3.material.io/components/divider/guidelines) · [specs](https://m3.material.io/components/divider/specs) · [accessibility](https://m3.material.io/components/divider/accessibility)
