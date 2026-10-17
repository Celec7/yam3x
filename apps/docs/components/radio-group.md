<script setup>
import RadioGroupExample from './demos/RadioGroupExample.vue'
</script>

# Radio button

Radio buttons let people choose one option from a mutually exclusive set. Keep the options and their labels easy to scan; this page uses native radio inputs for form and keyboard behavior.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><RadioGroupExample /></div>

::: details View demo source

<<< ./demos/RadioGroupExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioButton } from './components/yam3x/radio-group'

const delivery = ref<string | null>(null)
</script>

<template>
  <RadioGroup
    v-model="delivery"
    label="Delivery method"
    name="delivery"
  >
    <RadioButton value="pickup">Pickup</RadioButton>
    <RadioButton value="shipping">Shipping</RadioButton>
  </RadioGroup>
</template>
```

## API

`RadioGroup` accepts a string or `null` through `v-model`, and provides `id`, `label`, `description`, `name`, `form`, `required`, `disabled`, and `invalid`. `RadioButton` accepts `id`, a unique string `value`, optional `description`, and `disabled`; its default slot is the visible option label. Place each `RadioButton` inside a `RadioGroup`.

The group emits `update:modelValue` when an option is selected, and forwards the native `input`, `change`, and `invalid` events.

## Behavior and accessibility

Native radio inputs provide form submission, required validation, and keyboard behavior. With a controlled model, the parent can reject a requested value by leaving the model unchanged.

The component can start empty when the product has no meaningful default value. Activating the selected option does not clear it; a parent can still set the model to `null` programmatically. To let users choose nothing, provide an explicit “None” option. These are project behaviors, not additional Material requirements.

## Material references

[Radio button overview](https://m3.material.io/components/radio-button/overview) · [guidelines](https://m3.material.io/components/radio-button/guidelines) · [specs](https://m3.material.io/components/radio-button/specs) · [accessibility](https://m3.material.io/components/radio-button/accessibility)
