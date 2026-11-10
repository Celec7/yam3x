# Text fields

Text fields let users enter text into a UI. They typically appear in forms and dialogs.

This project does not export a separate `TextField` component. Compose [Form field](/components/form-field) with a native `input`, `textarea`, or `select`, and pick the `outlined` or `filled` variant.

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'

const email = ref('')
const displayName = ref('')
</script>

<template>
  <FormField
    label="Email"
    hint="Used for account notifications"
  >
    <input
      v-model="email"
      type="email"
      name="email"
      autocomplete="email"
      required
    />
  </FormField>

  <FormField
    label="Display name"
    variant="filled"
  >
    <input
      v-model="displayName"
      name="display-name"
      autocomplete="name"
    />
  </FormField>
</template>
```

The first field uses the default `outlined` variant; the second sets `variant="filled"`. The wrapper owns the label, supporting text, and error presentation. The native control and the consuming form own the value and validation. See [Form field](/components/form-field) for its props, slots, behavior, and styling hooks.

## Material references

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [guidelines](https://m3.material.io/components/text-fields/guidelines) · [specs](https://m3.material.io/components/text-fields/specs) · [accessibility](https://m3.material.io/components/text-fields/accessibility)
