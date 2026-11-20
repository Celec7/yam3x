<script setup lang="ts">
import ScrollFieldExample from './demos/ScrollFieldExample.vue'
</script>

# Scroll field

`ScrollField` selects numeric values and measurements from a vertically scrolling list. It is a Material 3 Expressive component: it supports three sizes, finite or looping lists, and scroll and text-input modes. For time selection use a [time picker](/components/time-picker); for precise or long-form entry use a text field. Compose Material 3 implements the wheel with an infinite pager and leaves input mode, labels, and errors to its caller.

## Examples

### Values, sizes, and states

The wheel formats values for the field's locale, snaps the centered value, and commits it on settle. The three sizes follow the Material minimum widths for one to two, three, and four digits; disabled fields keep their content at 38% opacity.

<div class="vp-raw yam3x-doc-demo-theme"><ScrollFieldExample /></div>

::: details View demo source

<<< ./demos/ScrollFieldExample.vue{vue}

:::

### Scrolling and keyboard

Drag with a mouse, pen, or finger, use the wheel or trackpad, or press the arrow keys while the field has focus. Scrolling stops on the nearest value with the Material fast spatial spring. Up and Down select the adjacent value, Page Up and Page Down move five steps, and Home and End jump to the first or last value. With `loop`, the selection wraps around the range, including keyboard and click selection.

Each row remains a 48 px pointer target, even when it is partly outside the container. Items are not separately focusable: the field itself is the single `spinbutton` with a value, range, and value text for assistive technology.

### Text input mode

Material requires every scroll field to support text entry. Bind `v-model:mode` and give the user a toggle: the demo switches the field to a native numeric input with the active outline and caret. Enter or blur commits a valid value; invalid input keeps the draft, marks the field invalid, and emits `invalid`. Bind `error` to show a message below the field.

### Labels and multiple fields

Material keeps labels outside the field anatomy. Pass `label` as the accessible name and place a visible label next to the field. When several fields track different values, label each one and keep the fields side by side.

## Use in your app

After [installation](/guide/start/installation), add `scroll-field` with the CLI. It copies the component and its utility module, so import it from your app using consumer paths such as `./components/yam3x/`. The `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScrollField } from './components/yam3x/scroll-field'

const minutes = ref(30)
const mode = ref<'scroll' | 'input'>('scroll')
</script>

<template>
  <ScrollField
    v-model="minutes"
    v-model:mode="mode"
    label="Minutes"
    unit="minutes"
    :min="0"
    :max="59"
    name="minutes"
  />
</template>
```

Place a labeled mode toggle beside the field so text entry is always reachable, and keep the committed value in the application model. `name` contributes a hidden input for native form submission; the component does not own the mode toggle or the visible label.

## Behavior and accessibility

- The field is one focus stop and one `spinbutton`. Arrow keys move the selection; Page Up and Page Down move five values; Home and End jump to the ends.
- The value, range, and formatted value text are exposed together, so a screen reader announces the current selection after a committed change.
- Text input uses the numeric keyboard, the active primary outline and caret, and the same value and range attributes. Enter or blur commits; invalid drafts stay visible with `aria-invalid`.
- The focus indicator is a 3 px secondary outline with a 2 px offset. Pointer targets stay at least 48 px tall, and disabled fields are removed from the tab order.
- Reduced motion removes the selection and state-layer transitions without changing the committed value.
- Forced-colors mode draws a `CanvasText` boundary and keeps the selected value in `CanvasText`.
- Values follow the locale's digits and separators. The wheel is vertical, so no reading direction is forced.

## API

| Prop                    | Type                             | Default    | Notes                                                      |
| ----------------------- | -------------------------------- | ---------- | ---------------------------------------------------------- |
| `modelValue`            | `number`                         | —          | `v-model`; the selected value.                             |
| `min` / `max`           | `number`                         | `0` / `59` | Inclusive range.                                           |
| `step`                  | `number`                         | `1`        | Increment; fractional steps use the step's decimal places. |
| `size`                  | `'small' \| 'medium' \| 'large'` | `'medium'` | Minimum width of 100, 120, or 186 px.                      |
| `loop`                  | `boolean`                        | `false`    | Wrap the selection around the range.                       |
| `label`                 | `string`                         | required   | Accessible name; a visible label stays outside the field.  |
| `unit`                  | `string`                         | `''`       | Appended to `aria-valuetext`.                              |
| `mode`                  | `'scroll' \| 'input'`            | `'scroll'` | `v-model:mode`; the active editing mode.                   |
| `locale`                | `string`                         | browser    | Number formatting and parsing locale.                      |
| `disabled` / `readonly` | `boolean`                        | `false`    | Disable interaction or commit only.                        |
| `required`              | `boolean`                        | `false`    | Exposes `aria-required`.                                   |
| `error`                 | `string`                         | `''`       | Message below the field; sets `aria-invalid`.              |
| `name` / `form`         | `string`                         | —          | Adds a hidden input for native form submission.            |

Events: `change(value)` after a committed selection, `invalid(detail)` when text input cannot be committed, and `valid` when a text draft commits successfully.

## Styling

`--yam3x-scroll-field-height` sets the container height (default 200 px, minimum 120 px). `--yam3x-scroll-field-width` overrides the size width, for example to fill a grid cell. The field maps its colors, type roles, shape, and motion to system tokens; use theme changes rather than per-instance color overrides.

## Material references

[Scroll fields overview](https://m3.material.io/components/scroll-fields/overview) · [specs](https://m3.material.io/components/scroll-fields/specs) · [guidelines](https://m3.material.io/components/scroll-fields/guidelines) · [accessibility](https://m3.material.io/components/scroll-fields/accessibility)
