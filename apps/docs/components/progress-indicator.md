<script setup lang="ts">
import ProgressIndicatorExample from './demos/ProgressIndicatorExample.vue'
</script>

# Progress indicators

Progress indicators show the status of ongoing work. Use determinate progress when a meaningful value is available and indeterminate progress when it is not.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><ProgressIndicatorExample /></div>

::: details View demo source

<<< ./demos/ProgressIndicatorExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import LinearProgressIndicator from './components/yam3x/progress-indicator/linear-progress-indicator.vue'
import CircularProgressIndicator from './components/yam3x/progress-indicator/circular-progress-indicator.vue'
</script>

<template>
  <LinearProgressIndicator
    :value="60"
    aria-label="Uploading files"
  />
  <CircularProgressIndicator
    :value="60"
    aria-label="Preparing preview"
  />
</template>
```

## API

| Component                   | Prop            | Default       | Description                                                                             |
| --------------------------- | --------------- | ------------- | --------------------------------------------------------------------------------------- |
| `LinearProgressIndicator`   | `value`, `max`  | `0`, `100`    | Completed and maximum progress; visual value is clamped to the valid range.             |
| `LinearProgressIndicator`   | `bufferValue`   | `0`           | End value of the buffered range.                                                        |
| `LinearProgressIndicator`   | `mode`          | `determinate` | `determinate`, `indeterminate`, `buffer`, or `query`.                                   |
| `LinearProgressIndicator`   | `stopSize`      | `4px`         | Diameter in CSS pixels. Set to `0` only when track-to-surface contrast is at least 3:1. |
| Both                        | `variant`       | `flat`        | `flat` or `wavy`.                                                                       |
| `CircularProgressIndicator` | `value`, `max`  | `0`, `100`    | Completed and maximum progress when determinate.                                        |
| `CircularProgressIndicator` | `indeterminate` | `false`       | Shows a circular animation for unknown progress.                                        |
| `CircularProgressIndicator` | Default slot    | —             | Displays visual content in the circular indicator; not announced by screen readers.     |

## Behavior and accessibility

Both components expose `role="progressbar"`, minimum and maximum values, and the current value when determinate. Use `aria-label` or `aria-labelledby` to describe the task. Indeterminate states do not expose `aria-valuenow`. The indicator itself does not accept input or focus.

Keep the same configuration for all indicators of one process. For a short wait with unknown progress, prefer the [loading indicator](/components/loading-indicator) over an indeterminate circular indicator.

Material's responsive guidance allows circular indicators from 24 to 240 dp and discourages linear indicators in elements narrower than 40 dp. Callers control placement and custom dimensions. `buffer` and `query` are project-defined linear modes; the flat and wavy shapes are official Material 3 Expressive configurations.

The linear determinate stop indicator is 4px by default and can be resized independently of track thickness. Keep it visible when track contrast against its container or surrounding surface is below 3:1. Set `stopSize` to `0` only when that contrast is at least 3:1. Indeterminate and circular indicators do not render a stop indicator.

A wavy linear indicator’s height is the track thickness plus the wave amplitude above and below it. Determinate progress draws the wave only over the completed range. For indeterminate progress, a segment moves along the track while the wave continues to advance. In `buffer` mode, a solid track shows the range between completed and buffered values, followed by a dotted remainder. Continuous animation stops at a visible state when reduced motion is requested.

## Styling

These documented project CSS properties override the default component mappings. The color defaults follow Material System roles; the geometry defaults follow the official progress indicator token values.

| Scope                      | CSS property                                                      | Default                              | Meaning                               |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------------ | ------------------------------------- |
| Both                       | `--yam3x-progress-indicator-color`                                | `--md-sys-color-primary`             | Active indicator color.               |
| Both                       | `--yam3x-progress-indicator-track-color`                          | `--md-sys-color-secondary-container` | Track color.                          |
| Linear                     | `--yam3x-linear-progress-indicator-thickness`                     | `4px`                                | Track and active indicator thickness. |
| Linear                     | `--yam3x-linear-progress-indicator-end-inset`                     | `4px`                                | Minimum inset from each end.          |
| Linear                     | `--yam3x-linear-progress-indicator-shape`                         | `4px`                                | Track corner radius.                  |
| Linear, wavy               | `--yam3x-linear-wavy-progress-indicator-amplitude`                | `3px`                                | Wave amplitude.                       |
| Linear, wavy               | `--yam3x-linear-wavy-progress-indicator-wavelength`               | `40px`                               | Determinate wave wavelength.          |
| Linear, wavy indeterminate | `--yam3x-linear-wavy-indeterminate-progress-indicator-wavelength` | `20px`                               | Indeterminate wave wavelength.        |
| Circular, flat             | `--yam3x-circular-flat-progress-indicator-diameter`               | `40px`                               | Indicator diameter.                   |
| Circular, wavy             | `--yam3x-circular-wavy-progress-indicator-diameter`               | `48px`                               | Indicator diameter.                   |
| Circular                   | `--yam3x-circular-progress-indicator-thickness`                   | `4px`                                | Track and active indicator thickness. |
| Circular, wavy             | `--yam3x-circular-wavy-progress-indicator-amplitude`              | `1.6px`                              | Wave amplitude.                       |
| Circular, wavy             | `--yam3x-circular-wavy-progress-indicator-wavelength`             | `15px`                               | Wave wavelength.                      |

These CSS properties are project extension hooks, not Material token names. Use `stopSize` to customize the linear stop indicator.

## Material references

[Progress indicators overview](https://m3.material.io/components/progress-indicators/overview) · [guidelines](https://m3.material.io/components/progress-indicators/guidelines) · [specs](https://m3.material.io/components/progress-indicators/specs) · [accessibility](https://m3.material.io/components/progress-indicators/accessibility)
