<script setup lang="ts">
import LoadingIndicatorExample from './demos/LoadingIndicatorExample.vue'
</script>

# Loading indicator

Loading indicators communicate that an operation is still underway when its completion progress is not known. Use them for waiting states and keep surrounding content available when possible.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><LoadingIndicatorExample /></div>

::: details View demo source

<<< ./demos/LoadingIndicatorExample.vue{vue}

:::

## Use in your app

After installation, import from the component directory copied into your app:

```vue
<script setup lang="ts">
import { LoadingIndicator } from './components/yam3x/loading-indicator'
</script>

<template>
  <LoadingIndicator aria-label="Loading articles" />
</template>
```

## API

| Prop      | Default       | Description                                                                          |
| --------- | ------------- | ------------------------------------------------------------------------------------ |
| `variant` | `uncontained` | `uncontained` renders directly on the surface; `contained` adds a colored container. |

## Behavior and accessibility

Give each instance an `aria-label` or `aria-labelledby` that describes what is loading. The component exposes indeterminate `progressbar` semantics with no current value, and has no click or keyboard interaction. It shows a static shape when reduced motion is requested. For pull-to-refresh, callers should also provide a refresh action that does not require a gesture.

Use it for a short wait with unknown progress, including pull-to-refresh. Material recommends it over an indeterminate circular [progress indicator](/components/progress-indicator); use progress indicators when the process may become determinate.

## Styling

The consumer owns responsive sizing through `--yam3x-loading-indicator-container-size`. Material recommends an overall size of 24–240 dp, with 48 dp as the default; use larger sizes only when the surrounding space warrants them. The active shape remains 79.17% of the container unless `--yam3x-loading-indicator-active-indicator-size` is explicitly set. The CSS hooks do not clamp values to Material's range.

These CSS properties are project extension hooks, not Material token names. Their defaults map to Material component requirements and System tokens.

| Scope       | CSS property                                                 | Default                               | Meaning                                                      |
| ----------- | ------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------ |
| Both        | `--yam3x-loading-indicator-container-size`                   | `48px`                                | Overall square footprint.                                    |
| Both        | `--yam3x-loading-indicator-container-shape`                  | `--md-sys-shape-corner-full`          | Shape of the optional container.                             |
| Both        | `--yam3x-loading-indicator-active-indicator-size`            | `calc(container size × 0.79166667)`   | Active shape size; defaults to `38px` at a `48px` footprint. |
| Uncontained | `--yam3x-loading-indicator-active-indicator-color`           | `--md-sys-color-primary`              | Active shape color on a surface.                             |
| Contained   | `--yam3x-loading-indicator-contained-container-color`        | `--md-sys-color-primary-container`    | Optional background color.                                   |
| Contained   | `--yam3x-loading-indicator-contained-active-indicator-color` | `--md-sys-color-on-primary-container` | Active shape color over the contained background.            |

Use the contained color hooks together so the active shape keeps sufficient contrast.

## Material references

[Loading indicator overview](https://m3.material.io/components/loading-indicator/overview) · [guidelines](https://m3.material.io/components/loading-indicator/guidelines) · [specs](https://m3.material.io/components/loading-indicator/specs) · [accessibility](https://m3.material.io/components/loading-indicator/accessibility)
