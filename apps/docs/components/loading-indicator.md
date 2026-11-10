<script setup lang="ts">
import LoadingIndicatorExample from './demos/LoadingIndicatorExample.vue'
import LoadingIndicatorSizesExample from './demos/LoadingIndicatorSizesExample.vue'
</script>

# Loading indicator

Loading indicators communicate that an operation is still underway when its completion progress is not known. Use them for waiting states and keep surrounding content available when possible.

Loading indicator is a Material 3 Expressive component. The project renders one indeterminate `progressbar` with the Expressive shape-morph animation; the CLI copy adds the same public style hooks used by the other components. Use it for waits expected to stay short, and switch to a [progress indicator](/components/progress-indicator) when the work can report a value.

## Examples

### Basic and contained

<div class="vp-raw yam3x-doc-demo-theme"><LoadingIndicatorExample /></div>

The indicator is uncontained by default. The control switches to `contained`, which adds the primary-container surface and the matching on-primary-container active shape. The accessible name describes the task, not the animation.

::: details View demo source

<<< ./demos/LoadingIndicatorExample.vue{vue}

:::

### Sizes, color hooks, and status text

<div class="vp-raw yam3x-doc-demo-theme"><LoadingIndicatorSizesExample /></div>

The gallery keeps the default `48px` footprint and compares smaller and larger sizes through `--yam3x-loading-indicator-container-size`. The color example overrides the active shape while the contained pair changes both container and foreground. The status example pairs the progressbar with visible waiting text for a list region.

::: details View demo source

<<< ./demos/LoadingIndicatorSizesExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LoadingIndicator } from './components/yam3x/loading-indicator'

const loading = ref(true)
</script>

<template>
  <section aria-busy="true">
    <LoadingIndicator
      v-if="loading"
      aria-label="Loading articles"
    />
    <p>Articles stay readable while the next batch loads.</p>
  </section>
</template>
```

Always supply `aria-label` or `aria-labelledby`. The component forwards other attributes to its root. It has no visible text of its own, so the accessible name is the only task description announced with the progressbar.

::: details Contained colors and reduced motion

```vue
<template>
  <LoadingIndicator
    variant="contained"
    aria-label="Loading preview"
    style="
      --yam3x-loading-indicator-container-size: 64px;
      --yam3x-loading-indicator-contained-container-color: var(--md-sys-color-tertiary-container);
      --yam3x-loading-indicator-contained-active-indicator-color: var(--md-sys-color-on-tertiary-container);
    "
  />
</template>
```

Change the contained container and foreground colors together so the active shape keeps at least 3:1 contrast. With `prefers-reduced-motion: reduce`, both animations stop and the active shape rests in its first soft-burst form.

:::

## Behavior and accessibility

### Semantics

- The root has `role="progressbar"`, `aria-valuemin="0"`, and `aria-valuemax="100"`.
- It never sets `aria-valuenow`; the state is indeterminate.
- The animation container and active shape are hidden from assistive technology.
- The indicator is passive: no focus target, no click handler, and `pointer-events: none`.
- A loading indicator is not a live region. Announce a changed waiting state with nearby text or a separate status element when the task starts or finishes.

### Animation and reduced motion

The active shape morphs through seven Material Shape Library forms while the outer container rotates. The cycle lasts 4666ms. With reduced motion enabled, both CSS animations are removed and the shape stays static. Forced-colors mode paints the active shape with `CanvasText`; a contained indicator adds a `Canvas` surface with a `GrayText` outline.

### Placement and sizing

The default footprint is `48px` square and the active shape is about `38px`. Material recommends an overall size between 24 and 240 dp, with 48 dp as the default. Larger sizes need surrounding space that justifies them. The CSS hooks do not clamp values to that range.

Keep the indicator in the region it describes, and keep affected content available when the operation is not blocking. For pull-to-refresh, also provide a refresh action that does not require a gesture.

### Choosing the component

Use a loading indicator for a short wait with unknown progress. Material recommends it over an indeterminate circular progress indicator. Use a progress indicator when the process can become determinate or needs a visible value.

## API

### Exports

| Export             | Kind      | Use                                                      |
| ------------------ | --------- | -------------------------------------------------------- |
| `LoadingIndicator` | Component | Indeterminate loading progress with the shape animation. |

### Props

| Prop      | Type                           | Default         | Use                                                                       |
| --------- | ------------------------------ | --------------- | ------------------------------------------------------------------------- |
| `variant` | `'uncontained' \| 'contained'` | `'uncontained'` | `uncontained` draws on the surface; `contained` adds a colored container. |

Native and ARIA attributes, including `aria-label` and `aria-labelledby`, are forwarded to the root element.

### Events

LoadingIndicator emits no events.

### Slots

LoadingIndicator renders no slot content.

### Methods

LoadingIndicator exposes no instance methods.

## Styling

These project-defined hooks are set on the root. Their defaults map to Material component requirements and System tokens. The component clamps neither the footprint nor the active shape to the recommended range.

| Scope       | Property                                                     | Default                               | Use                                                 |
| ----------- | ------------------------------------------------------------ | ------------------------------------- | --------------------------------------------------- |
| Both        | `--yam3x-loading-indicator-container-size`                   | `48px`                                | Overall square footprint.                           |
| Both        | `--yam3x-loading-indicator-container-shape`                  | `--md-sys-shape-corner-full`          | Shape of the optional container.                    |
| Both        | `--yam3x-loading-indicator-active-indicator-size`            | `calc(container size × 0.79166667)`   | Active shape size; `38px` at the default footprint. |
| Uncontained | `--yam3x-loading-indicator-active-indicator-color`           | `--md-sys-color-primary`              | Active shape color on a surface.                    |
| Contained   | `--yam3x-loading-indicator-contained-container-color`        | `--md-sys-color-primary-container`    | Optional background color.                          |
| Contained   | `--yam3x-loading-indicator-contained-active-indicator-color` | `--md-sys-color-on-primary-container` | Active shape color over the contained background.   |

The CSS property names are project API, not Material token names. Change the contained pair together so the active shape keeps sufficient contrast.

## Material references

[Loading indicator overview](https://m3.material.io/components/loading-indicator/overview) · [guidelines](https://m3.material.io/components/loading-indicator/guidelines) · [specs](https://m3.material.io/components/loading-indicator/specs) · [accessibility](https://m3.material.io/components/loading-indicator/accessibility)
