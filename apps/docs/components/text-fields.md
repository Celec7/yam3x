<script setup lang="ts">
import FormFieldExample from './demos/FormFieldExample.vue'
</script>

# Text fields

Use `FormField` with a native input to create a filled or outlined text field. The input and its form own the value and submission.

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
    hint="Used for account notifications"
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

This project does not export a separate `TextField` component. See [Form field](/components/form-field) for the wrapper's API and behavior. The native control and consuming form own validation.

## Material references

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility)
