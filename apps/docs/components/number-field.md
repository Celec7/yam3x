<script setup lang="ts">
import NumberFieldBasicExample from './demos/NumberFieldBasicExample.vue'
import NumberFieldExample from './demos/NumberFieldExample.vue'
import NumberFieldStatesExample from './demos/NumberFieldStatesExample.vue'
</script>

# Number field

Text fields let users enter text into a UI. They typically appear in forms and dialogs.

`NumberField` is a project extension for quantities and ordinary decimal values. It applies the Material text-field presentation and adds localized parsing, stepping, and commitment. Compose Material 3 has no number-field primitive; the closest composition is `OutlinedTextField` or `TextField` with trailing `IconButton`s. Use a plain [Form field](/components/form-field) or text field for identifiers, phone numbers, and exact decimal arithmetic that your application owns.

## Examples

### Basic

The field keeps a committed number in `v-model`, enforces inclusive limits, and steps by the configured increment through the trailing actions or the keyboard.

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldBasicExample /></div>

::: details View demo source

<<< ./demos/NumberFieldBasicExample.vue{vue}

:::

### Editing, validation, and form submission

Typing changes the editing text without changing the model. Enter, blur, a step action, or native form submission commits a valid value. The demo blocks an invalid submission, keeps out-of-range input visible, and submits the unlocalized numeric string under `name`.

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldExample /></div>

::: details View demo source

<<< ./demos/NumberFieldExample.vue{vue}

:::

The controls switch the field between outlined and filled and hide the pointer step actions without removing keyboard stepping.

### Locale formatting and states

The gallery shows a German amount with prefix and suffix text, a decimal weight, a Chinese quantity, read-only and disabled fields, the filled variant, and a required field whose validation error appears in the field.

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldStatesExample /></div>

::: details View demo source

<<< ./demos/NumberFieldStatesExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), copy the Form field and Icon button dependencies with the component, then import it from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

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
    hint="Between 0 and 10 kilograms"
  >
    <template #suffix-text>kg</template>
  </NumberField>
</template>
```

`v-model` holds a finite number or `null`. `input` reports editing text while `change` reports a committed value, so keep validation in the application and bind the model for accepted values.

::: details Messages, prefixes, and programmatic validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NumberField, type NumberFieldInvalidDetail } from './components/yam3x/number-field'

const field = ref<InstanceType<typeof NumberField> | null>(null)
const quantity = ref<number | null>(null)
const error = ref('')

function onInvalid(detail: NumberFieldInvalidDetail): void {
  error.value = detail.message
}
</script>

<template>
  <form @submit.prevent>
    <NumberField
      ref="field"
      v-model="quantity"
      label="Quantity"
      name="quantity"
      required
      :min="1"
      :max="99"
      :messages="{ valueMissing: 'Choose a quantity.' }"
      :error="error"
      @invalid="onInvalid"
    >
      <template #prefix-text>#</template>
    </NumberField>
    <button
      type="button"
      @click="field?.reportValidity()"
    >
      Check quantity
    </button>
  </form>
</template>
```

`error` accepts a message string or `true` for the localized generic message. The `#prefix-text` and `#suffix-text` content joins the editor's accessible description.

:::

## Behavior and accessibility

### Editing and commitment

- Editing text is separate from the committed model. Temporary input such as a minus sign or a trailing decimal separator stays editable.
- Enter, blur, a step action, or a normal form submission commits a valid value. Formatting happens at commitment, not on every keystroke.
- Invalid text and out-of-range values remain visible; the field never silently clamps typed input.
- Empty optional input commits `null`; empty required input is invalid.
- An external model update replaces the editing text and clears displayed validation feedback.
- `focus()`, `checkValidity()`, and `reportValidity()` are available on the component ref.

### Constraints and step actions

- `min` and `max` are inclusive finite limits; `step` is a positive increment but does not restrict directly typed values to a grid.
- A step action adds or subtracts `step` from the current valid edit, or from the last committed value when the edit is invalid.
- Stepping an empty editor starts from zero and brings the first result into the allowed range.
- A step that would cross a bound is unavailable and its pointer action is disabled. Disabled and read-only fields cannot step.
- Wheel scrolling never changes the value.

### Locale and formatting

- Parsing accepts localized digits, grouping, and decimal separators, and validates grouping. Scientific notation and arbitrary-precision decimals are outside this field's scope.
- Built-in messages, number formatting, and parsing inherit [LocaleProvider](/components/localization). Explicit `locale` and `messages` take precedence; without a provider the locale is `en-US`.
- A locale change reformats a parseable pending edit without committing it.
- `input` reports editing text; `change` reports a committed value only when it differs from the previous one.
- `invalid` reports `{ reason, message }`, where the reason is `valueMissing`, `badInput`, `rangeUnderflow`, `rangeOverflow`, or `customError`.

### Keyboard and focus

- Up and Down step the value. Home and End select a supplied minimum or maximum; modified editing shortcuts remain native.
- Enter commits the current edit. The editor is the only Tab stop; pointer step actions use `tabindex="-1"` and return focus to the editor.
- The editor exposes `role="spinbutton"`, `inputmode="decimal"`, and numeric `aria-valuenow`, `aria-valuetext`, `aria-valuemin`, and `aria-valuemax` values.

### Forms

- The native form receives an unlocalized numeric string under `name`, or an empty string for `null`. Disabled fields are omitted.
- Invalid edits block normal validated submission even while the model still holds an earlier value. Use the form's submit action to commit a pending edit before reading the submission.
- Reset restores the initial model value and clears displayed validation feedback; a prevented reset is honored.
- `form` associates the editor and its hidden value input with a form outside the subtree.

## API

### Exports

| Export                     | Kind      | Use                                                                                     |
| -------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `NumberField`              | Component | Localized numeric editor with optional step actions.                                    |
| `NumberFieldMessages`      | Type      | Overrides for validation and step-action messages.                                      |
| `NumberFieldInvalidReason` | Type      | `'valueMissing' \| 'badInput' \| 'rangeUnderflow' \| 'rangeOverflow' \| 'customError'`. |
| `NumberFieldInvalidDetail` | Type      | `{ reason, message }` for the `invalid` event.                                          |

### Props and models

| Prop / model         | Type                           | Default            | Description                                                                                        |
| -------------------- | ------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------- |
| `v-model`            | `number \| null`               | `null`             | Committed finite number, or null for an empty optional field.                                      |
| `label`              | `string`                       | Required           | Visible label and accessible name base.                                                            |
| `id`                 | `string`                       | Generated          | Editor ID; also used by the field label.                                                           |
| `name`               | `string`                       | —                  | Submitted field name.                                                                              |
| `form`               | `string`                       | —                  | Associates the editor with a form by ID.                                                           |
| `locale`             | `string`                       | Provider → `en-US` | Digits, grouping, decimal separators, and built-in messages.                                       |
| `min` / `max`        | `number`                       | Unbounded          | Inclusive finite limits.                                                                           |
| `step`               | `number`                       | `1`                | Positive increment for step actions and keyboard stepping.                                         |
| `required`           | `boolean`                      | `false`            | Native required validation.                                                                        |
| `disabled`           | `boolean`                      | `false`            | Disables editing, stepping, and form submission.                                                   |
| `readonly`           | `boolean`                      | `false`            | Prevents editing and stepping while still submitting the value.                                    |
| `controls`           | `boolean`                      | `true`             | Shows the pointer step actions; keyboard stepping remains.                                         |
| `variant`            | `'outlined' \| 'filled'`       | `'outlined'`       | Text-field container style.                                                                        |
| `hint`               | `string`                       | `''`               | Supporting text.                                                                                   |
| `error`              | `string \| boolean`            | `false`            | Error text, or `true` for the localized generic message.                                           |
| `width`              | `string`                       | Form field `270px` | Preferred width, limited by the parent.                                                            |
| `hideRequiredMarker` | `boolean`                      | `false`            | Hides the visible required asterisk.                                                               |
| `messages`           | `Partial<NumberFieldMessages>` | Locale messages    | Overrides `valueMissing`, `badInput`, range messages, `customError`, `increment`, and `decrement`. |

### Events

| Event     | Payload                    | Description                                                        |
| --------- | -------------------------- | ------------------------------------------------------------------ |
| `input`   | `string`                   | Editing text after each edit; it does not change the model yet.    |
| `change`  | `number \| null`           | A committed value that differs from the previous one.              |
| `invalid` | `NumberFieldInvalidDetail` | A failed commitment or native validation, with reason and message. |

### Slots

| Slot          | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| `prefix-text` | Currency or unit text before the editor; included in its description. |
| `suffix-text` | Unit text after the editor; included in its description.              |

### Methods

Access these through a template ref.

| Method             | Returns   | Description                                                          |
| ------------------ | --------- | -------------------------------------------------------------------- |
| `focus()`          | `void`    | Moves focus to the editor.                                           |
| `checkValidity()`  | `boolean` | Synchronizes native validity with the current edit, then reports it. |
| `reportValidity()` | `boolean` | Shows the native validation message when the edit is invalid.        |

`class` and `style` apply to the field root. Other attributes, such as `placeholder`, `autocomplete`, and `aria-describedby`, reach the editor; its type, value, numeric roles, and state attributes remain component-owned. Existing descriptions are preserved alongside the field's own descriptions.

## Styling

Use the supported [Form field styling hooks](/components/form-field#styling) on the Number field root. The field adds its own block padding and step-action geometry; the editor uses tabular digits.

The outlined field adds 4px block padding to the Form field container and editor control. Filled adds 4px container block padding and a 16px top inset with no bottom inset on the control. Each step action reserves a 48 × 40px minimum box with 4px between actions; the default 56px field resolves it to 48 × 48px. Labels, supporting text, and control spacing grow with language height and enlarged text.

## Material references

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility) · [Icon buttons](https://m3.material.io/components/icon-buttons/overview) · [Applying type](https://m3.material.io/styles/typography/applying-type)
