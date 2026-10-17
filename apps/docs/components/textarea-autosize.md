<script setup>
import TextareaAutosizeExample from './demos/TextareaAutosizeExample.vue'
</script>

# Textarea autosize

`vTextareaAutosize` is an optional project directive that grows a native `<textarea>` with its content.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><TextareaAutosizeExample /></div>

::: details View demo source

<<< ./demos/TextareaAutosizeExample.vue{vue}

:::

## Use in your app

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

## API

| Value     | Type      | Default                | Description                                                                                                                                             |
| --------- | --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minRows` | `number`  | `rows` of the textarea | Minimum visible rows when content is short                                                                                                              |
| `maxRows` | `number`  | `0` (unlimited)        | Scrolls vertically inside the textarea after reaching the limit                                                                                         |
| `enabled` | `boolean` | `true`                 | Enables auto-sizing. When `false`, the directive restores the original inline `height` and `overflow-y`; the textarea remains editable and submittable. |

## Behavior and accessibility

The directive changes only the textarea height. Form, focus, selection, and text-entry behavior remain native. Material's Web guidance recommends a fixed-height text area with internal scrolling. Auto-sizing moves content below the field as it grows, so use it when that layout change fits the product.

## Material references

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [guidelines](https://m3.material.io/components/text-fields/guidelines) · [accessibility](https://m3.material.io/components/text-fields/accessibility)
