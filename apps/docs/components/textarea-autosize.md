<script setup>
import TextareaAutosizeBasicExample from './demos/TextareaAutosizeBasicExample.vue'
import TextareaAutosizeExample from './demos/TextareaAutosizeExample.vue'
</script>

# Textarea autosize

`vTextareaAutosize` is an optional project directive that grows a native `<textarea>` with its content. It is not a Material component; it adapts a native control and leaves its form, focus, selection, and validation behavior unchanged. The closest Compose Material 3 composition is `OutlinedTextField` or `BasicTextField` with measured text height.

Material's Web guidance recommends a fixed-height text area with internal scrolling. Use the directive when the layout can move content below the field as the reader types.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><TextareaAutosizeBasicExample /></div>

::: details View demo source

<<< ./demos/TextareaAutosizeBasicExample.vue{vue}

:::

`minRows` keeps a short message from collapsing, and `maxRows` stops growth. After the limit, the textarea scrolls inside its own border instead of pushing more content down.

### States and restoration

<div class="vp-raw yam3x-doc-demo-theme"><TextareaAutosizeExample /></div>

::: details View demo source

<<< ./demos/TextareaAutosizeExample.vue{vue}

:::

Turn auto-sizing off to restore the textarea's original inline height and overflow behavior. The field stays editable and submittable. Update the value programmatically, submit native form data, reset the form, or remove the field to inspect measurement, reset, and cleanup.

## Use in your app

After [installation](/guide/start/installation), import the directive from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { vTextareaAutosize } from './components/yam3x/textarea-autosize'
</script>

<template>
  <label for="message">Message</label>
  <textarea
    id="message"
    v-textarea-autosize="{ minRows: 2, maxRows: 6 }"
    rows="2"
  />
</template>
```

::: details Toggle auto-sizing

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { vTextareaAutosize } from './components/yam3x/textarea-autosize'

const message = ref('')
const enabled = ref(true)
const options = computed(() => ({ minRows: 2, maxRows: 6, enabled: enabled.value }))
</script>

<template>
  <textarea
    v-model="message"
    v-textarea-autosize="options"
    rows="2"
  />
</template>
```

Changing `enabled` restores or reapplies the directive-owned styles without remounting the field.

:::

## Behavior and accessibility

### Sizing and options

- `minRows` defaults to the textarea's `rows`; `maxRows` defaults to `0`, which means unlimited growth.
- `minRows` must be a positive integer, `maxRows` a non-negative integer, and a positive `maxRows` must be at least `minRows`. Invalid values throw a `RangeError`.
- The directive measures the computed line height, padding, border, and `box-sizing`, then sets only the inline height needed for the current content.
- When content exceeds `maxRows`, it sets `overflow-y: auto`; otherwise it restores the original overflow value. The element keeps its own scroll position, focus, and selection.
- Input events, form reset, element resize, font loading, and changes to `class`, `placeholder`, or `rows` trigger a new measurement. Programmatic value changes are measured on the next update.

### Enabled and restoration

- `enabled` defaults to `true`. Setting it to `false` restores the original inline `height` and `overflow-y`, including their priorities.
- The directive owns only those two inline properties. It does not change the value, name, validation, selection, focus, or submit behavior.
- Removing the textarea or unmounting the component restores the saved styles before the element is released.

### Native forms and focus

The textarea remains a native form control. Its value is submitted under `name`, native validation and `required` behavior still apply, and form reset returns the value and remeasures the field. The directive never moves focus or intercepts keyboard input.

### SSR and no JavaScript

The directive runs on the client after mount. Server rendering and a no-JavaScript page keep the textarea's native `rows` and any inline height; no measurement runs and no content is hidden. Provide a sensible `rows` value or an inline height so the initial field has the intended size.

### Responsive and RTL

- A width change remeasures the wrapped content, so the field grows when the available inline size narrows.
- The directive uses logical measurements from layout and does not read or set writing direction; the native textarea continues to follow the document or region `dir`.
- Reduced motion does not affect the height update because the directive changes the height without animating it.

## API

### Exports

| Export                   | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `vTextareaAutosize`      | The Vue directive for a native textarea element.                      |
| `TextareaAutosizeOptions`| The directive value type.                                             |

### Options

| Value     | Type      | Default                | Use                                                                                                                            |
| --------- | --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `minRows` | `number`  | Textarea's `rows`      | Minimum visible rows when content is short.                                                                                    |
| `maxRows` | `number`  | `0` (unlimited)        | Scrolls vertically inside the textarea after reaching the limit.                                                               |
| `enabled` | `boolean` | `true`                 | Enables auto-sizing. When `false`, the directive restores the original inline `height` and `overflow-y`; the field stays usable. |

The directive has no events, slots, or exposed methods.

## Styling

The directive exposes no CSS custom properties and adds no wrapper or class. It changes only the inline height and, when capped, `overflow-y`. All visual styling comes from the textarea's own CSS.

Keep a visible border or background on the field: the directive changes geometry, not validation or focus styling. A fixed `box-sizing: border-box` and a known line height make measurements predictable.

## Material references

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility)
