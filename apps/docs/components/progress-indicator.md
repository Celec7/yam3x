<script setup lang="ts">
import ProgressIndicatorExample from './demos/ProgressIndicatorExample.vue'
</script>

# Progress indicators

Progress indicators show the status of ongoing work. Use determinate progress when a meaningful value is available and indeterminate progress when it is not.

Progress indicators are a Material 3 Expressive component family. The project exports `LinearProgressIndicator` and `CircularProgressIndicator` as one family. Both support flat and wavy Material 3 Expressive variants. The linear component adds `buffer` and `query` modes, which are project-defined extensions; the circular component adds a default slot for visual content.

## Examples

### Linear and circular indicators

<div class="vp-raw yam3x-doc-demo-theme"><ProgressIndicatorExample /></div>

The demo drives the linear value with the progress slider, switches between `determinate`, `indeterminate`, `buffer`, and `query`, and resizes the stop indicator. The wavy control applies the same variant to both shapes. The circular column compares determinate and indeterminate progress, and the controls report the current values and accepted modes.

::: details View demo source

<<< ./demos/ProgressIndicatorExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from './components/yam3x/progress-indicator'

const uploaded = ref(60)
</script>

<template>
  <section>
    <p id="upload-label">Uploading files · {{ uploaded }}%</p>
    <LinearProgressIndicator
      :value="uploaded"
      aria-labelledby="upload-label"
    />
    <CircularProgressIndicator
      :value="uploaded"
      aria-labelledby="upload-label"
    />
  </section>
</template>
```

`value` is optional and defaults to `0`; `max` defaults to `100`. Both indicators are presentational progressbars, so the surrounding application owns the visible label, value formatting, and any retry or cancel action.

::: details Modes, buffering, and the circular slot

```vue
<script setup lang="ts">
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from './components/yam3x/progress-indicator'
</script>

<template>
  <!-- Unknown progress -->
  <LinearProgressIndicator
    mode="indeterminate"
    aria-label="Checking for updates"
  />
  <CircularProgressIndicator
    indeterminate
    aria-label="Checking for updates"
  />

  <!-- Buffered playback -->
  <LinearProgressIndicator
    mode="buffer"
    :value="42"
    :buffer-value="76"
    aria-label="Buffered playback"
  />

  <!-- Project-defined query mode -->
  <LinearProgressIndicator
    mode="query"
    aria-label="Searching events"
  />

  <!-- Circular slot content is visual only -->
  <CircularProgressIndicator
    :value="64"
    aria-label="Storage used"
  >
    <span aria-hidden="true">64%</span>
  </CircularProgressIndicator>
</template>
```

`buffer` shows the completed value, a solid range to `bufferValue`, then a dotted remainder. `query` is an indeterminate linear mode with a distinct reversing motion. Slot content in the circular indicator is centered inside the ring and hidden from assistive technology; it is not rendered in indeterminate mode, so keep it decorative or expose the same information elsewhere.

:::

## Behavior and accessibility

### Semantics

- Both components expose `role="progressbar"`, `aria-valuemin="0"`, and `aria-valuemax` from the resolved maximum.
- Determinate and buffer modes expose `aria-valuenow` with the supplied value clamped to the range.
- Indeterminate and query modes omit `aria-valuenow`.
- Attributes such as `aria-label`, `aria-labelledby`, and `aria-valuetext` are forwarded to the root. Supply one name and a readable value when the numeric percentage is not the best announcement.
- The indicators do not accept input and are not focus targets. Provide separate controls for pausing, cancelling, or retrying.

### Value and mode behavior

- `value` defaults to `0`; `max` defaults to `100`. A non-positive or non-finite `max` falls back to `100`.
- The visual fraction is clamped to `0–1`. `aria-valuenow` reports the value clamped to `0–max`, not a rounded fraction.
- In determinate linear mode, a stop indicator marks the end of the active range. Its size comes from `stopSize`; `0` removes it.
- Keep the stop visible when the active track has less than 3:1 contrast with its container or surrounding surface. Set `stopSize` to `0` only when that contrast is at least 3:1.
- Indeterminate and circular indicators do not render a stop indicator.
- The circular default slot is surrounded by an `aria-hidden` and `inert` container.

### Variants and motion

- `variant="flat"` is the default; `variant="wavy"` uses the Expressive waveform.
- A wavy linear indicator's height is the track thickness plus the wave amplitude above and below it. Determinate progress draws the wave only over the completed range; indeterminate progress moves a segment along the track while the wave advances.
- The circular indicator interpolates a value change over 500ms unless reduced motion is enabled. Its visual arc can lag the accessible `aria-valuenow`, which updates immediately.
- Reduced motion removes continuous animation and leaves a visible static state. Indeterminate shapes keep a visible arc or segment.

### Direction and responsive layout

- Linear progress follows the writing direction. Its indeterminate and query animations reverse in RTL, and the determinate fill starts at the logical edge.
- Material's responsive guidance allows circular indicators from 24 to 240 dp and discourages linear indicators in elements narrower than 40 dp.
- The caller controls placement and custom dimensions. Keep one configuration for all indicators of the same process.

### Choosing a family member

Use a linear indicator when progress belongs to a wide region, such as a page section or upload bar. Use a circular indicator in compact spaces or beside a single action. For a short wait with unknown progress, prefer the [loading indicator](/components/loading-indicator) over an indeterminate circular indicator.

## API

### Exports

| Export                      | Kind      | Use                                                          |
| --------------------------- | --------- | ------------------------------------------------------------ |
| `LinearProgressIndicator`   | Component | Horizontal determinate, indeterminate, buffer, or query bar. |
| `CircularProgressIndicator` | Component | Circular determinate or indeterminate progress.              |

The entry point exports the components only; `ProgressVariant` and `LinearProgressMode` are defined in `progress-utils.ts` and are not re-exported from the component entry point.

### `LinearProgressIndicator` props

| Prop          | Type                                                      | Default         | Use                                                                     |
| ------------- | --------------------------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| `value`       | `number`                                                  | `0`             | Completed progress, clamped visually to the range.                      |
| `max`         | `number`                                                  | `100`           | Maximum progress. Non-positive or non-finite values fall back to `100`. |
| `bufferValue` | `number`                                                  | `0`             | End of the buffered range in `buffer` mode.                             |
| `mode`        | `'determinate' \| 'indeterminate' \| 'buffer' \| 'query'` | `'determinate'` | Visual and ARIA mode. `buffer` and `query` are project-defined.         |
| `variant`     | `'flat' \| 'wavy'`                                        | `'flat'`        | Flat track or Expressive waveform.                                      |
| `stopSize`    | `number`                                                  | `4`             | Diameter of the determinate stop in CSS pixels; `0` removes it.         |

### `CircularProgressIndicator` props

| Prop            | Type               | Default  | Use                                                       |
| --------------- | ------------------ | -------- | --------------------------------------------------------- |
| `value`         | `number`           | `0`      | Completed progress when determinate.                      |
| `max`           | `number`           | `100`    | Maximum progress; non-positive values fall back to `100`. |
| `indeterminate` | `boolean`          | `false`  | Shows the indeterminate circular animation.               |
| `variant`       | `'flat' \| 'wavy'` | `'flat'` | Flat ring or Expressive waveform.                         |

### Events

Neither indicator emits events. Pass a value and update it from the process that owns the work.

### Slots

| Component                   | Slot    | Scope | Use                                                               |
| --------------------------- | ------- | ----- | ----------------------------------------------------------------- |
| `CircularProgressIndicator` | default | —     | Visual content inside the ring; hidden from assistive technology. |
| `LinearProgressIndicator`   | —       | —     | The linear indicator renders no slot content.                     |

### Methods

Neither indicator exposes instance methods.

## Styling

These project CSS properties override the default mappings. Color defaults follow Material System roles; geometry defaults follow the official progress indicator token values. The properties are project API, not Material token names.

| Scope                      | Property                                                          | Default                              | Use                                   |
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

For the linear stop indicator, use the `stopSize` prop. Its default is `4px` and it is measured independently of the track thickness.

## Material references

[Progress indicators overview](https://m3.material.io/components/progress-indicators/overview) · [guidelines](https://m3.material.io/components/progress-indicators/guidelines) · [specs](https://m3.material.io/components/progress-indicators/specs) · [accessibility](https://m3.material.io/components/progress-indicators/accessibility)
