<script setup lang="ts">
import FormFieldExample from './demos/FormFieldExample.vue'
</script>

# Form field

`FormField` is a project extension that adds a Material-style field container, label, and supporting or error text around a native input. The consuming form keeps ownership of the control value and validation.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldExample /></div>

::: details View demo source

<<< ./demos/FormFieldExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { FormField } from './components/yam3x/form-field'
</script>

<template>
  <FormField
    label="Email"
    hint="Used for account notices"
  >
    <input
      type="email"
      name="email"
      autocomplete="email"
      required
    />
  </FormField>
</template>
```

## API

This component can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

| Prop                 | Default           | Use                                                                    |
| -------------------- | ----------------- | ---------------------------------------------------------------------- |
| `label`              | Required          | Visible field label; the `#label` slot can replace its content.        |
| `id`                 | Generated         | ID assigned to the slotted control when it has none.                   |
| `variant`            | `outlined`        | `outlined` or `filled` field container.                                |
| `hint`, `error`      | —                 | Supporting or error text; `#hint` and `#error` slots are alternatives. |
| `hideRequiredMarker` | `false`           | Hides the visible required asterisk.                                   |
| `hideSubscript`      | `never`           | `never`, `auto`, or `always` for supporting text visibility.           |
| `floatLabel`         | `auto`            | `auto` or `always` label position.                                     |
| `width`              | `270px`           | Preferred width, limited by the parent.                                |
| `counterLabel`       | Localized default | Accessible name for the character counter.                             |

The default slot contains the control. `#prefix`, `#prefix-text`, `#suffix`, and `#suffix-text` add content around it. `#counter` receives `{ count, max }`.

## Behavior and accessibility

`FormField` finds the first `input`, `textarea`, `select`, or `data-form-field-control` in its default slot and associates its label and supporting text. Existing IDs and ARIA descriptions are preserved. The form still owns the value and validation. Required controls show an asterisk by default; explain its meaning in the form. The `error` prop or slot replaces the hint and marks the control invalid. `:error="true"` marks invalidity without explanation, so provide error text when possible. Error text uses an alert role.

A native `maxlength` shows and associates a character counter. Use `#counter` to customize it and `counterLabel` to localize its accessible name. With `hideSubscript="always"`, supporting text and the counter remain available to assistive technology. Without `maxlength`, a custom counter slot should include a localized name and value. Consumer icons and prefix or suffix controls need accurate accessible names.

### Associate text prefixes and suffixes

Give meaningful prefix and suffix text unique IDs, then include those IDs in the control's `aria-describedby`. `FormField` preserves those references and adds its own hint, error, and counter IDs as needed.

```vue
<FormField label="Amount" hint="Enter an amount in US dollars">
  <template #prefix-text><span id="amount-prefix">$</span></template>
  <input aria-describedby="amount-prefix amount-suffix" inputmode="decimal" />
  <template #suffix-text><span id="amount-suffix">USD</span></template>
</FormField>
```

An error icon is an optional additional visual cue. The example pairs it with the error text; the icon does not replace the text, and color alone does not communicate the error.

## Styling

Labels remain fully visible. Increase `width` for long labels. Set these supported project CSS overrides on the `FormField` root:

| Custom property                            | Applies to                                       |
| ------------------------------------------ | ------------------------------------------------ |
| `--yam3x-form-field-container-shape`       | Outlined and Filled container corners            |
| `--yam3x-form-field-container-color`       | Filled container background                      |
| `--yam3x-form-field-outline-color`         | Enabled Outlined stroke and Filled indicator     |
| `--yam3x-form-field-focused-color`         | Focused label                                    |
| `--yam3x-form-field-focused-outline-color` | Focused outline or active indicator              |
| `--yam3x-form-field-invalid-color`         | Error outline/indicator, label, and support text |

Error styling takes precedence over focus styling. Error hover derives its indicator and label color from the configured invalid color and the current on-surface theme role; supporting text keeps the invalid color.

## Material references

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility)
