<script setup lang="ts">
import ShapeExample from './demos/ShapeExample.vue'
</script>

# Shape

Shape displays a decorative form from the Material Shape Library. Use it to soften or emphasize media, illustrations, and contained surfaces; do not use it to carry status or replace an icon's meaning.

Shape is a project extension. It follows 35 names from the Material Shape Library, but Material does not publish a standalone Shape component. In Compose Material 3, the closest reference is `MaterialShapes` with shape morph applied through clipping; this project instead supplies normalized 120-point polygons and a CSS `clip-path` transition. The geometry normalization and the morph transition are project decisions.

## Examples

### Basic gallery and morphing

<div class="vp-raw yam3x-doc-demo-theme"><ShapeExample /></div>

The first row shows a basic shape, a larger media mask, and a change of fill color. The two `Shape` instances below the selects preview any morph: choose a different shape for either side and the clip path interpolates. The full gallery lists every available name, and each item is a `48px` square by default.

::: details View demo source

<<< ./demos/ShapeExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Shape } from './components/yam3x/shape'
</script>

<template>
  <Shape
    name="sunny"
    aria-hidden="true"
  />
  <Shape
    name="pill"
    aria-hidden="true"
    style="--yam3x-shape-size: 96px; --yam3x-shape-container-color: var(--md-sys-color-tertiary-container)"
  >
    <img
      src="/avatar-example.svg"
      alt=""
    />
  </Shape>
</template>
```

Place the shape on a decorative surface or around media. The slot is clipped by the selected polygon; images and videos fill the square with `object-fit: cover`. With `name` unset, Shape draws no clip and no container background, so it can act as a plain wrapper.

::: details Names and media content

```vue
<script setup lang="ts">
import { Shape, shapeNames } from './components/yam3x/shape'
</script>

<template>
  <Shape
    v-for="name in shapeNames"
    :key="name"
    :name="name"
    aria-hidden="true"
  />
  <Shape
    name="arch"
    :style="{ '--yam3x-shape-size': '160px' }"
  >
    <video
      src="/clip.mp4"
      muted
      loop
      playsinline
      aria-hidden="true"
    />
  </Shape>
</template>
```

`shapeNames` is the runtime list of the 35 valid names. Passing an unknown string falls back to the unclipped form rather than throwing.

:::

## Behavior and accessibility

### Rendering and geometry

- The root is an inline-block square. `--yam3x-shape-size` controls both width and height; the default is `48px`.
- A valid `name` sets `data-name`, applies the polygon through `clip-path`, and paints the container color behind slot content.
- An omitted or unknown `name` draws no clip and no background. Slot content remains unclipped.
- Slotted `img` and `video` elements are absolutely positioned, fill the shape, and use `object-fit: cover`.
- Shape changes transition the `clip-path`. The default transition uses System `spring-slow-spatial`.
- The wrapper is `overflow: hidden` and isolated, so clipped content cannot paint outside the form.
- The element respects the native `hidden` attribute.

### Accessibility

- Shape sets no role, label, or hidden state. Mark decorative instances with `aria-hidden="true"`.
- When the clipped content conveys information, provide a text alternative through the image's `alt` or nearby text. Do not rely on the polygon's name as its meaning.
- The component is not focusable and adds no interaction.
- Under `prefers-reduced-motion: reduce`, the morph transition is removed.
- In forced-colors mode, a named shape paints its container with `CanvasText` so the form stays visible.

## API

### Exports

| Export       | Kind      | Use                                        |
| ------------ | --------- | ------------------------------------------ |
| `Shape`      | Component | Clipped decorative surface or media mask.  |
| `shapeNames` | Value     | Runtime array of the 35 valid shape names. |
| `ShapeName`  | Type      | Union of the names accepted by `name`.     |

### Props

| Prop   | Type                | Default | Use                                                                  |
| ------ | ------------------- | ------- | -------------------------------------------------------------------- |
| `name` | `ShapeName \| null` | `null`  | Named polygon; `null` or an unknown runtime value disables clipping. |

Native HTML and ARIA attributes are forwarded to the root element.

### Events

Shape emits no events.

### Slots

| Slot    | Scope | Use                                    |
| ------- | ----- | -------------------------------------- |
| default | —     | Content clipped to the selected shape. |

### Methods

Shape exposes no instance methods.

::: details Shape names

`4-leaf-clover`, `4-sided-cookie`, `6-sided-cookie`, `7-sided-cookie`, `8-leaf-clover`, `9-sided-cookie`, `12-sided-cookie`, `arch`, `arrow`, `boom`, `bun`, `burst`, `circle`, `diamond`, `fan`, `flower`, `gem`, `ghost-ish`, `heart`, `hexagon`, `oval`, `pentagon`, `pill`, `pixel-circle`, `pixel-triangle`, `puffy`, `puffy-diamond`, `semicircle`, `slanted`, `soft-boom`, `soft-burst`, `square`, `sunny`, `triangle`, `very-sunny`.

The names match the Material Shape Library. The 120-point normalized geometry is not a Material token; it is project-adapted for CSS clipping and interpolation.

:::

## Styling

These project hooks are set on the Shape root. The System theme still owns the fill role and motion token defaults.

| Property                        | Default                                              | Use                                     |
| ------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| `--yam3x-shape-size`            | `48px`                                               | Square width and height.                |
| `--yam3x-shape-container-color` | System `primary`                                     | Fill behind clipped content.            |
| `--yam3x-shape-transition`      | `clip-path var(--md-sys-motion-spring-slow-spatial)` | Transition used when the shape changes. |

Material corner-radius tokens describe rounded component corners and do not map to this decorative shape library. Use these hooks only on decorative instances where the visual result is intentional.

## Material references

[Shape principles](https://m3.material.io/styles/shape/overview-principles) · [Shape morph](https://m3.material.io/styles/shape/shape-morph) · [Corner radius scale](https://m3.material.io/styles/shape/corner-radius-scale)
