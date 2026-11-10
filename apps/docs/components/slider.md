<script setup lang="ts">
import SliderBasicExample from './demos/SliderBasicExample.vue'
import SliderExample from './demos/SliderExample.vue'
import SliderRangeExample from './demos/SliderRangeExample.vue'
</script>

# Sliders

Sliders let users make selections from a range of values. There are four configurations: continuous, discrete, centered, range selection.

`Slider` represents a single value and `RangeSlider` a lower and upper value pair. Both are Material components; range selection is split into its own component. Stop placement, the inset-icon threshold, and the availability of vertical range sliders are project decisions.

## Examples

### Basic

A single slider binds a number and takes its accessible name from `label`. Set real bounds and a step that matches the decision.

<div class="vp-raw yam3x-doc-demo-theme"><SliderBasicExample /></div>

::: details View demo source

<<< ./demos/SliderBasicExample.vue{vue}

:::

### Variants, sizes, and states

The controls switch among standard, centered, and range, change size and orientation, and toggle stops, value labels, and the disabled state. The output reports the accepted value, and the same element keeps `data-testid="slider"` across modes.

<div class="vp-raw yam3x-doc-demo-theme"><SliderExample /></div>

::: details View demo source

<<< ./demos/SliderExample.vue{vue}

:::

`stops` requires `step > 1`. Values snap to the step, the value label appears on focus or hover through `labelled`, and a disabled slider removes the label and blocks keyboard and pointer input.

### Range selection, formatting, and RTL

`RangeSlider` binds a `[lower, upper]` tuple. The demo formats currency with `formatValue`, submits `price-min` and `price-max` through a native form, and toggles direction to show that horizontal arrow keys follow the resolved writing direction.

<div class="vp-raw yam3x-doc-demo-theme"><SliderRangeExample /></div>

::: details View demo source

<<< ./demos/SliderRangeExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RangeSlider, Slider } from './components/yam3x/slider'

const volume = ref(40)
const price = ref<[number, number]>([20, 80])
</script>

<template>
  <Slider
    v-model="volume"
    label="Volume"
    :min="0"
    :max="100"
    labelled
  />
  <RangeSlider
    v-model="price"
    label="Price range"
    :min="0"
    :max="100"
    :step="5"
  />
</template>
```

Give every slider a visible name or set `label`; users need to know what the value controls before they interact.

::: details Centered sliders, stops, and formatted values

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from './components/yam3x/slider'

const balance = ref(0)
const level = ref(50)
const format = (value: number) => `${value}%`
</script>

<template>
  <Slider
    v-model="balance"
    label="Balance"
    variant="centered"
    :min="-50"
    :max="50"
    :step="10"
    :stops="true"
    labelled
  />
  <Slider
    v-model="level"
    label="Level"
    :format-value="format"
    :stops="true"
    :step="10"
  />
</template>
```

`center` overrides the centered track origin; it defaults to the midpoint of `min` and `max`. `formatValue` supplies the value indicator text and `aria-valuetext`.

:::

## Behavior and accessibility

### Selection and snapping

- A standard slider starts its active track at the minimum; a centered slider starts it at `center`; a range slider keeps both handles on one track.
- Accepted values snap to `step`. A value at `max` stays at `max` instead of snapping past it.
- Range handles stay ordered: the lower handle cannot pass the upper value and the upper cannot pass the lower.
- With `stops`, `step` must be greater than one. The active handle omits its own stop, interior endpoints are omitted, and an end stop marks each visible inactive end.
- The owning feature decides the bounds, step, units, and any synchronized numeric input.

### Value indicators

- `labelled` shows the current value on focus and hover. The indicator uses Label Large metrics with Body Large weight and tracking.
- `formatValue` formats the indicator and becomes `aria-valuetext`; without it the native range value is announced.
- The default slot adds an inset icon to standard sliders in medium, large, and extra-large sizes. The icon sits on the inactive side while the active fraction is below 30%.

### Keyboard and focus

- Tab reaches each handle; a range slider has two Tab stops.
- Arrow keys move one step in the visual direction. Home and End select the visible minimum and maximum; PageUp and PageDown move ten steps.
- Holding Space while pressing an arrow moves ten steps when stops are off.
- RTL mirrors horizontal movement: ArrowLeft increases and ArrowRight decreases.
- Pointer drag and keyboard changes emit a cancellable `beforeinput` before the value changes, then `input`; finishing the interaction emits `change`.
- Focus shrinks the handle to 2px while retaining a visible focus indicator. Disabled sliders do not emit updates.

### Forms and direction

- A single slider submits its value under `name`; a range slider submits `${name}-min` and `${name}-max`.
- `form` associates the inputs with a form outside the subtree. Native reset restores the model accepted when the slider mounted.
- `orientation="vertical"` arranges the track vertically; Up and Down still increase and decrease the value. Material recommends horizontal range sliders; vertical remains available as a project option.

## API

Range endpoint names inherit [LocaleProvider](/components/localization)'s `actions` messages. `lowerLabel` and `upperLabel` take precedence over the generated names; `locale` overrides the language and defaults to the provider, then `en-US`.

### Exports

| Export             | Kind      | Use                                                                 |
| ------------------ | --------- | ------------------------------------------------------------------- |
| `Slider`           | Component | One value on a standard or centered track.                          |
| `RangeSlider`      | Component | A lower and upper value pair on one track.                          |
| `SliderModel`      | Type      | `number`.                                                           |
| `RangeSliderModel` | Type      | `[number, number]`.                                                 |
| `SliderProps`      | Type      | Props accepted by `Slider`.                                         |
| `RangeSliderProps` | Type      | Props accepted by `RangeSlider`.                                    |
| `SliderSize`       | Type      | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'`. |
| `SliderVariant`    | Type      | `'standard' \| 'centered'`.                                         |

### `Slider` props and models

| Prop / model  | Type                         | Default            | Description                                         |
| ------------- | ---------------------------- | ------------------ | --------------------------------------------------- |
| `v-model`     | `number`                     | `0`                | Accepted value.                                     |
| `label`       | `string`                     | —                  | Accessible name; `aria-label` also works.           |
| `variant`     | `'standard' \| 'centered'`   | `'standard'`       | Track origin at the minimum or at `center`.         |
| `center`      | `number`                     | Bounds midpoint    | Project extension: origin for the centered variant. |
| `min` / `max` | `number`                     | `0` / `100`        | Inclusive bounds.                                   |
| `step`        | `number`                     | `1`                | Positive step; values snap to it.                   |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'`     | Track axis.                                         |
| `size`        | `SliderSize`                 | `'extra-small'`    | Track and handle size.                              |
| `stops`       | `boolean`                    | `false`            | Shows stop indicators when `step > 1`.              |
| `labelled`    | `boolean`                    | `false`            | Shows the value indicator during interaction.       |
| `disabled`    | `boolean`                    | `false`            | Blocks input and removes the indicator.             |
| `name`        | `string`                     | —                  | Native form field name.                             |
| `form`        | `string`                     | —                  | Associates the input with a form by ID.             |
| `formatValue` | `(value: number) => string`  | —                  | Indicator text and `aria-valuetext`.                |
| `locale`      | `string`                     | Provider → `en-US` | Language of generated range names.                  |

### `RangeSlider` props and models

| Prop / model  | Type                         | Default            | Description                                            |
| ------------- | ---------------------------- | ------------------ | ------------------------------------------------------ |
| `v-model`     | `[number, number]`           | `[min, max]`       | Accepted lower and upper values; handles stay ordered. |
| `lowerLabel`  | `string`                     | Localized name     | Accessible name of the lower thumb.                    |
| `upperLabel`  | `string`                     | Localized name     | Accessible name of the upper thumb.                    |
| `label`       | `string`                     | —                  | Accessible name of the group.                          |
| `min` / `max` | `number`                     | `0` / `100`        | Inclusive bounds.                                      |
| `step`        | `number`                     | `1`                | Positive step; values snap to it.                      |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'`     | Track axis.                                            |
| `size`        | `SliderSize`                 | `'extra-small'`    | Track and handle size.                                 |
| `stops`       | `boolean`                    | `false`            | Shows stop indicators when `step > 1`.                 |
| `labelled`    | `boolean`                    | `false`            | Shows value indicators during interaction.             |
| `disabled`    | `boolean`                    | `false`            | Blocks input and removes the indicators.               |
| `name`        | `string`                     | —                  | Prefix for `${name}-min` and `${name}-max`.            |
| `form`        | `string`                     | —                  | Associates the inputs with a form by ID.               |
| `formatValue` | `(value: number) => string`  | —                  | Indicator text and `aria-valuetext`.                   |
| `locale`      | `string`                     | Provider → `en-US` | Language of generated thumb names.                     |

### Events

| Event         | Payload | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| `beforeinput` | `Event` | Cancelable; preventing it keeps the current value.               |
| `input`       | `Event` | Emitted after the model accepts each pointer or keyboard change. |
| `change`      | `Event` | Emitted once when an interaction completes.                      |

### Slots

`Slider` has a default slot for an inset icon in standard medium, large, and extra-large sizes; `RangeSlider` has no slot.

### Methods

Neither component exposes instance methods.

## Styling

No public component-specific CSS custom properties exist. The sliders map shared System roles; adjust `--md-sys-color-*`, typescale, motion, or density tokens at a theme root.

::: details Size geometry

| Size          | Track height | Handle height | Track corner |
| ------------- | ------------ | ------------- | ------------ |
| `extra-small` | 16px         | 44px          | 8px          |
| `small`       | 24px         | 44px          | 8px          |
| `medium`      | 40px         | 52px          | 12px         |
| `large`       | 56px         | 68px          | 16px         |
| `extra-large` | 96px         | 108px         | 28px         |

Stop positions use the usable span between rounded track end-cap centers. Interior stops are opt-in, the active handle's stop is omitted, and start and end indicators stay on the same interval grid.

:::

## Material references

[Sliders overview](https://m3.material.io/components/sliders/overview) · [guidelines](https://m3.material.io/components/sliders/guidelines) · [specs](https://m3.material.io/components/sliders/specs) · [accessibility](https://m3.material.io/components/sliders/accessibility)
