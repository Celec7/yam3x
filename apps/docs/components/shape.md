<script setup lang="ts">
import ShapeExample from './demos/ShapeExample.vue'
</script>

# Shape

Shape is a project component for decorative forms from the Material Shape Library. Its 35 names follow that library; CSS clipping and morphing are project extensions. Use shapes sparingly and without implying an undocumented meaning.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <ShapeExample />
</div>

::: details View demo source

<<< ./demos/ShapeExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { Shape } from './components/yam3x/shape'
</script>

<template>
  <Shape
    name="sunny"
    aria-hidden="true"
  />
</template>
```

## API

| Prop                  | Type                | Default | Description                                                                                                                                                                                    |
| --------------------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                | `ShapeName \| null` | `null`  | One of 35 named shapes; set to `null` to disable clipping and container background.                                                                                                            |
| Default slot          | `VNode`             | Empty   | Content clipped to the selected shape. Images and videos fill a square and use `object-fit: cover` by default.                                                                                 |
| Native and ARIA props | HTML attributes     | —       | Forwarded to the root element. The component is display-only and does not set role or hidden semantics automatically; callers should set `aria-hidden="true"` for purely decorative instances. |

`ShapeName` and `shapeNames` are exported from the component entry point.

## Behavior and accessibility

Shape is display-only and does not set a role or hidden state. Set `aria-hidden="true"` for decorative content; provide an appropriate text alternative when clipped content conveys information.

## Styling

These project extension overrides are available on the Shape root. `--yam3x-shape-size` defaults to `48px`; named shapes use System `primary` as their fill, and morphing uses System `spring-slow-spatial`. Material's corner-radius tokens describe rounded component corners and do not map to the decorative shape library.

| Property                        | Default                                              | Description                             |
| ------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| `--yam3x-shape-size`            | `48px`                                               | Square size of the shape.               |
| `--yam3x-shape-container-color` | System `primary`                                     | Fill behind clipped content.            |
| `--yam3x-shape-transition`      | `clip-path var(--md-sys-motion-spring-slow-spatial)` | Transition used when the shape changes. |

## Material references

[Shape principles](https://m3.material.io/styles/shape/overview-principles) · [Shape morph](https://m3.material.io/styles/shape/shape-morph)
