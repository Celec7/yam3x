<script setup lang="ts">
import FormFieldBasicExample from './demos/FormFieldBasicExample.vue'
import FormFieldExample from './demos/FormFieldExample.vue'
import FormFieldSlotsExample from './demos/FormFieldSlotsExample.vue'
</script>

# Form field

Text fields let users enter text into a UI. They typically appear in forms and dialogs.

`FormField` is a project wrapper that applies the Material text-field container, label, and supporting or error text to a native `input`, `textarea`, or `select`. Compose Material 3 has no equivalent slot-based wrapper; the closest composition is `OutlinedTextField` or `TextField`. The wrapper owns presentation and accessible association, while the composed control owns its value, validation, and submission.

## Examples

### Basic

The wrapper finds the first control in its default slot, associates the visible label, and adds the hint as its description.

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldBasicExample /></div>

::: details View demo source

<<< ./demos/FormFieldBasicExample.vue{vue}

:::

### Validation, label, and supporting text

The form validates a required email input. Native invalid and the demo's own check replace the hint with the error text, the error slot adds an icon, and the reset button restores the empty field. The controls switch appearance, subscript visibility, and label position.

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldExample /></div>

::: details View demo source

<<< ./demos/FormFieldExample.vue{vue}

:::

### Slots and container states

The gallery adds text prefixes and suffixes with description IDs, a leading icon, a custom label, a custom counter, read-only and disabled controls, and an error slot with a real pattern constraint.

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldSlotsExample /></div>

::: details View demo source

<<< ./demos/FormFieldSlotsExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'

const email = ref('')
</script>

<template>
  <FormField
    label="Email"
    hint="Used for account notices"
  >
    <input
      v-model="email"
      type="email"
      name="email"
      autocomplete="email"
      required
    />
  </FormField>
</template>
```

`label` is required unless the `#label` slot supplies the visible label. Prefer a dedicated control such as [Number field](/components/number-field) or [Select](/components/select) when the value has a specialized editor.

::: details Prefixes, suffixes, counters, and description IDs

```vue
<script setup lang="ts">
import { FormField } from './components/yam3x/form-field'
</script>

<template>
  <FormField
    label="Amount"
    hint="Enter an amount in US dollars"
  >
    <template #prefix-text><span id="amount-prefix">$</span></template>
    <input
      aria-describedby="amount-prefix amount-suffix"
      inputmode="decimal"
    />
    <template #suffix-text><span id="amount-suffix">USD</span></template>
  </FormField>
  <FormField
    label="Display name"
    counter-label="Character count"
  >
    <input maxlength="24" />
    <template #counter="{ count, max }">
      <strong>{{ count }}/{{ max }}</strong>
    </template>
  </FormField>
</template>
```

Give meaningful prefix and suffix text unique IDs and include them in the control's `aria-describedby`; the wrapper preserves those references and adds its own hint, error, and counter IDs as needed.

:::

## Behavior and accessibility

### Control association

- The wrapper uses the first `[data-form-field-control]`, `input`, `textarea`, or `select` in the default slot as the labelled control.
- It assigns an ID when the control has none and renders the label as a native `for` association. Existing `aria-label` values are respected; existing `aria-labelledby` values gain the generated label ID.
- Consumer `aria-describedby` values are preserved. Hint, error, and counter IDs are added and removed as those elements appear.
- Clicking the label focuses the control, and clicking empty container space does the same. Disabled controls stay unfocusable.

### States and validation

- The required asterisk follows the control's native `required` or `aria-required`; `hideRequiredMarker` hides it. Explain required markers in the form.
- `error` accepts a message string or `true` and marks the control invalid with `aria-invalid`. A message or the `#error` slot replaces the hint and renders with `role="alert"`; `:error="true"` alone marks invalidity without explanation, so provide error text when possible.
- A native `invalid` event shows the control's validation message and error state. The state clears after the value becomes valid or the form resets.
- `disabled`, `readonly`, and a disabled ancestor `fieldset` are reflected from the control and update when those attributes change.
- `floatLabel="auto"` floats the label on focus or a populated control; `always` keeps it floated.

### Slots and counters

- The default slot holds the control. `#prefix` and `#suffix` accept controls or icons; `#prefix-text` and `#suffix-text` accept currency or unit text.
- `hideSubscript="auto"` shows supporting text only while focused or invalid and removes the hint from the description when hidden. `always` keeps it visually hidden but available to assistive technology.
- A native `maxlength` shows and associates a character counter. `#counter` receives `{ count, max }`, and `counterLabel` names the counter for assistive technology.
- Consumer icons and prefix or suffix controls need accurate accessible names. Decorative icons should be `aria-hidden`.
- Do not rely on color alone: pair the error treatment with text, as the error slot does.

## API

Built-in interface text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `counterLabel` take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export      | Kind      | Use                                                    |
| ----------- | --------- | ------------------------------------------------------ |
| `FormField` | Component | Material field presentation around one native control. |

### Props

| Prop                 | Type                            | Default            | Description                                                                  |
| -------------------- | ------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `label`              | `string`                        | Required           | Visible field label; the `#label` slot can replace its content.              |
| `locale`             | `string`                        | Provider → `en-US` | Language of built-in counter text.                                           |
| `id`                 | `string`                        | Generated          | ID assigned to the slotted control when it has none.                         |
| `variant`            | `'outlined' \| 'filled'`        | `'outlined'`       | Field container style.                                                       |
| `hint`               | `string`                        | —                  | Supporting text; the `#hint` slot is an alternative.                         |
| `error`              | `string \| boolean`             | —                  | Error text or invalidity flag; the `#error` slot is an alternative.          |
| `hideRequiredMarker` | `boolean`                       | `false`            | Hides the visible required asterisk.                                         |
| `hideSubscript`      | `'never' \| 'auto' \| 'always'` | `'never'`          | Supporting-text visibility: always, on focus or invalid, or visually hidden. |
| `floatLabel`         | `'auto' \| 'always'`            | `'auto'`           | Floats the label on focus or a populated control, or always.                 |
| `width`              | `string`                        | `270px`            | Preferred width, limited by the parent.                                      |
| `counterLabel`       | `string`                        | Localized default  | Accessible name for the character counter.                                   |

### Slots

| Slot          | Scope            | Description                                                                |
| ------------- | ---------------- | -------------------------------------------------------------------------- |
| default       | —                | The labelled native control.                                               |
| `label`       | —                | Replaces the visible label content.                                        |
| `prefix`      | —                | Leading control or icon inside the container.                              |
| `prefix-text` | —                | Leading currency or unit text.                                             |
| `suffix`      | —                | Trailing control or icon inside the container.                             |
| `suffix-text` | —                | Trailing unit text.                                                        |
| `hint`        | —                | Replaces the hint content.                                                 |
| `error`       | —                | Replaces the error content; still renders with the alert role.             |
| `counter`     | `{ count, max }` | Replaces the visible counter content. `max` is `null` without `maxlength`. |

### Events

`FormField` emits no events. Attribute and class forwarding apply to the wrapper root; the slotted control keeps its own attributes.

### Methods

`FormField` exposes no instance methods.

## Styling

Labels remain fully visible; increase `width` for long labels. The default container is 56px tall with a 270px preferred width. Outlined fields use a 1px enabled outline and a 3px focused outline; error styling takes precedence over focus styling.

::: details CSS overrides

Set these supported project CSS properties on the `FormField` root:

| Property                                   | Applies to                                          |
| ------------------------------------------ | --------------------------------------------------- |
| `--yam3x-form-field-container-shape`       | Outlined and filled container corners               |
| `--yam3x-form-field-container-color`       | Filled container background                         |
| `--yam3x-form-field-outline-color`         | Enabled outlined stroke and filled indicator        |
| `--yam3x-form-field-focused-color`         | Focused label                                       |
| `--yam3x-form-field-focused-outline-color` | Focused outline or active indicator                 |
| `--yam3x-form-field-invalid-color`         | Error outline or indicator, label, and support text |

Error hover derives its indicator and label color from the configured invalid color and the current on-surface role; supporting text keeps the invalid color. Density may reduce the container height, but the target stays at least 48px.

:::

## Material references

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility)
