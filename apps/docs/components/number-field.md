<script setup lang="ts">
import NumberFieldExample from './demos/NumberFieldExample.vue'
</script>

# Number field

`NumberField` is a project extension for quantities and ordinary decimal values. It combines Material text-field presentation with localized editing and optional step controls. Use a text field for identifiers, phone numbers, or exact decimal arithmetic handled by your application.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldExample /></div>

::: details View demo source

<<< ./demos/NumberFieldExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NumberField } from './components/yam3x/number-field'

const weight = ref<number | null>(0.1)
</script>

<template>
  <NumberField
    v-model="weight"
    label="Weight"
    name="weight"
    :min="0"
    :max="10"
    :step="0.1"
  >
    <template #suffix-text>kg</template>
  </NumberField>
</template>
```

## API

| Prop                               | Default            | Use                                                                                                                                                                        |
| ---------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                            | Required           | Visible field label.                                                                                                                                                       |
| `id`, `name`, `form`               | —                  | Editor ID, submitted field name, and optional external form ID.                                                                                                            |
| `locale`                           | `en-US`            | Locale for digits, grouping, decimal separators, and formatting.                                                                                                           |
| `min`, `max`                       | Unbounded          | Inclusive finite limits.                                                                                                                                                   |
| `step`                             | `1`                | Positive finite increment; does not restrict directly typed values to a step grid.                                                                                         |
| `required`, `disabled`, `readonly` | `false`            | Native field states; disabled and read-only fields cannot step.                                                                                                            |
| `controls`                         | `true`             | Show the pointer step controls. Keyboard stepping remains available.                                                                                                       |
| `variant`                          | `outlined`         | `outlined` or `filled`.                                                                                                                                                    |
| `hint`, `error`                    | Empty / `false`    | Supporting text or an external error. A nonempty error string supplies the message; `true` uses the localized generic message.                                             |
| `width`                            | `270px`            | Preferred width, limited by the parent.                                                                                                                                    |
| `hideRequiredMarker`               | `false`            | Hide the visible asterisk; explain required markers in the form.                                                                                                           |
| `messages`                         | English or Chinese | Override `valueMissing`, `badInput`, `rangeUnderflow`, `rangeOverflow`, `customError`, `increment`, and `decrement`. Other locales use English messages unless overridden. |

`v-model` contains a finite `number` or `null`. `input(text)` reports editing text; `change(value)` reports a changed value proposed at commitment. `invalid({ reason, message })` reports a failed commitment or native validation. The reason is one of the first five message keys above. The component exports the related `NumberFieldMessages`, `NumberFieldInvalidReason`, and `NumberFieldInvalidDetail` types.

The `#prefix-text` and `#suffix-text` slots add units or currency text and are automatically included in the editor's accessible description. `focus()`, `checkValidity()`, and `reportValidity()` are exposed on the component ref.

`class` and `style` apply to the field root. Other attributes, such as `placeholder`, `autocomplete`, and `aria-describedby`, reach the editor. Its type, value, numeric roles, and state attributes remain component-owned. Existing descriptions are preserved alongside the field's own descriptions.

## Behavior and accessibility

Typing changes the editing text without changing `v-model`. Enter, blur, stepping, or a normal form submission commits a valid value. A temporary sign or trailing decimal separator remains editable; invalid text and values outside the limits remain visible instead of being silently clamped. Empty optional input commits `null`; empty required input is invalid.

Up and Down step the value. Home and End select a supplied minimum or maximum; modified editing shortcuts remain native. The editor is the stepper's Tab stop. Pointer step controls return focus to it. Wheel scrolling does not change the value. A step that would cross a bound is unavailable; stepping an empty editor starts from zero and brings the first result into the allowed range.

Parsing accepts localized digits and separators and validates grouping. Formatting occurs at commitment, not on every keystroke. Scientific notation and arbitrary-precision decimals are outside this editor's scope. A locale change reformats a parseable pending edit without committing it; an external model update replaces the pending edit.

The native form receives an unlocalized numeric string under `name`, or an empty string for `null`. Invalid edits block normal validated submission even while the model still contains an earlier value. Use the form's normal submit action or `requestSubmit()` to commit pending edits before reading the submission. Reset restores the initial model value and clears displayed validation feedback. Disabled fields are omitted from form data.

## Styling

Use the supported [Form field styling hooks](/components/form-field#styling) on the Number field root. The input uses tabular digits. Labels, supporting text, and control spacing can grow with language height and enlarged text. Step targets reserve separate space even when the visible icons are small.

## Material references

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility) · [Icon buttons](https://m3.material.io/components/icon-buttons/overview) · [Applying type](https://m3.material.io/styles/typography/applying-type)
