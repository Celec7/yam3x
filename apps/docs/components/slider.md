<script setup lang="ts">
import SliderExample from './demos/SliderExample.vue'
</script>

# Sliders

Sliders let people choose a value or range from a bounded scale. Set meaningful bounds and steps, and provide another way to enter a precise value when the task requires it.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><SliderExample /></div>

::: details View demo source

<<< ./demos/SliderExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RangeSlider, Slider } from './components/yam3x/slider'
const volume = ref(40)
const price = ref<[number, number]>([25, 75])
</script>

<template>
  <Slider
    v-model="volume"
    label="Volume"
    :min="0"
    :max="100"
  />
  <RangeSlider
    v-model="price"
    label="Price range"
    :min="0"
    :max="100"
  />
</template>
```

## API

Range endpoint names can inherit [LocaleProvider](/components/localization)'s `actions` messages. Optional `locale` overrides the language, defaulting to the provider then `en-US`. Existing label overrides take precedence.

`RangeSlider` props `lowerLabel` and `upperLabel` take precedence over generated names; `formatValue` remains application-owned number formatting.

| Prop                                    | Default                | Description                                                                                                                                                                                                                                      |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Slider v-model`                        | `0`                    | A single numeric value. Use `RangeSlider` for a `[lower, upper]` value pair.                                                                                                                                                                     |
| `Slider variant`                        | `standard`             | `standard` or `centered`; range is a separate `RangeSlider` component.                                                                                                                                                                           |
| `RangeSlider v-model`                   | `[min, max]`           | A tuple containing the lower and upper values. The handles remain ordered.                                                                                                                                                                       |
| `size`                                  | `extra-small`          | `extra-small`, `small`, `medium`, `large`, or `extra-large`.                                                                                                                                                                                     |
| `orientation`                           | `horizontal`           | `horizontal` or `vertical`. Material recommends horizontal range sliders and advises against vertical range sliders because two handles add cognitive load and users generally expect horizontal sliders. Both orientations remain configurable. |
| `min` / `max` / `step`                  | `0` / `100` / `1`      | Value bounds and step size. `RangeSlider` defaults to `[min, max]`.                                                                                                                                                                              |
| `Slider center`                         | Midpoint of the bounds | Project extension: track origin for centered mode.                                                                                                                                                                                               |
| `stops`                                 | `false`                | Shows interior stops when `step > 1`. Endpoint indicators appear only at boundaries where inactive track remains. Values always snap to `step`.                                                                                                  |
| `labelled`                              | `false`                | Shows the current value during interaction.                                                                                                                                                                                                      |
| `disabled`                              | `false`                | Disables interaction and form submission.                                                                                                                                                                                                        |
| `label`                                 | —                      | Accessible name; for `RangeSlider`, names the group.                                                                                                                                                                                             |
| `RangeSlider lowerLabel` / `upperLabel` | —                      | Accessible names for the lower and upper thumbs.                                                                                                                                                                                                 |
| `name` / `form`                         | —                      | Form field name and external form ID; range fields use `${name}-min` and `${name}-max`.                                                                                                                                                          |
| `formatValue`                           | —                      | Formatter for the displayed value and `aria-valuetext`.                                                                                                                                                                                          |

Standard `Slider`s in medium, large, and extra-large sizes support an optional inset icon in the default slot.

Replace the former `<Slider variant="range" v-model="range">` usage with `<RangeSlider v-model="range">`. `SliderModel` is `number`; `RangeSliderModel` is `[number, number]`.

## Behavior and accessibility

The selected value takes effect during interaction. Give a slider a visible name or set `label`. Arrow keys adjust by one step in the visual direction, Home/End move to the bounds, and PageUp/PageDown adjust by ten steps. Tab can focus each `RangeSlider` thumb. Dragging or pressing a key emits cancellable `beforeinput` and `input`; completing an interaction emits `change`.

## Material references

[Sliders overview](https://m3.material.io/components/sliders/overview) · [guidelines](https://m3.material.io/components/sliders/guidelines) · [specs](https://m3.material.io/components/sliders/specs) · [accessibility](https://m3.material.io/components/sliders/accessibility)
