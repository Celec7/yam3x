<script setup lang="ts">
import AutocompleteExample from './demos/AutocompleteExample.vue'
</script>

# Autocomplete

Autocomplete is a project-defined component that filters suggestions as a person types and lets them commit a suggestion or keep free text. The query and selected value are separate pieces of state.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteExample /></div>

::: details View demo source

<<< ./demos/AutocompleteExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete, type AutocompleteOption } from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const options: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
]
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    label="Fruit"
  />
</template>
```

## API

Built-in status, result announcements, suggestion names, and required-selection validation text can inherit [LocaleProvider](/components/localization)'s `autocomplete` namespace. Optional `locale` takes precedence, defaulting to the provider then `en-US`; `loadingText`, `noDataText`, `resultsLabel`, and their slots retain priority. The application owns query text, option labels, and selected values.

| Prop                                                                | Type                                                                         | Default                  | Description                                                                                                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `options`                                                           | `{ value, label, disabled? }[]`                                              | Required                 | Suggestions; `value` must be unique in the list.                                                                   |
| `modelValue`, `v-model`                                             | `string`                                                                     | `''`                     | Current editable text.                                                                                             |
| `selected`, `v-model:selected`                                      | `string \| null`                                                             | `null`                   | Value of the committed suggestion.                                                                                 |
| `label`                                                             | `string`                                                                     | Required                 | Visible field label and accessible name.                                                                           |
| `filter`                                                            | `contains \| starts-with \| ends-with \| none \| (option, query) => boolean` | `contains`               | Case-insensitive by default.                                                                                       |
| `caseSensitive`, `autoActivate`, `openOnFocus`                      | `boolean`                                                                    | `false`, `false`, `true` | Controls case sensitivity, initial active option, and opening on focus. Auto-activation does not commit an option. |
| `required`, `selectionRequired`                                     | `boolean`                                                                    | `false`                  | Controls native required validation and whether a suggestion must be selected.                                     |
| `disabled`, `readonly`, `name`, `form`, `autocomplete`              | Native input props                                                           | —                        | Native text input and form behavior.                                                                               |
| `loading`, `loadingText`, `noDataText`, `resultsLabel`              | State props                                                                  | —                        | Loading, no-results, and result-count announcements.                                                               |
| `hideLoading`, `hideNoData`, `hideSelectionIndicator`, `panelClass` | State props                                                                  | —                        | Hides the corresponding state/indicator or adds a class to the popup panel.                                        |
| `variant`                                                           | `standard \| vibrant`                                                        | `standard`               | Uses the official Expressive Menu color mapping; exposing it on Autocomplete is a project API choice.              |

The `#input` slot receives `{ inputProps, query, selected }`; bind `inputProps` to a native editable input. The `#option` slot receives `{ option, active, selected, query }`. Do not put interactive controls such as buttons inside an option. Customize status rows with `#loading` and `#no-data`, and replace the expand-button icon with `#trailing`. Events are `query`, cancellable `beforeselect`, `select`, `change`, `toggle`, `open`, and `close`. The `beforeselect` handler receives an option and a cancelable event; call `preventDefault()` to reject the selection.

## Behavior and accessibility

Focus stays in the input while the user browses suggestions with the keyboard. Arrow keys move the active option, Enter commits it, Escape closes the list while preserving the input text, and Tab leaves in page order.

The Standard variant uses a `surface-container-low` popup and `tertiary-container` / `on-tertiary-container` selected rows. Vibrant uses the tertiary color mapping from the [Expressive Menu specifications](https://m3.material.io/components/menus/specs). Material defines these Menu styles, while the `variant` prop is a project extension for this filtering pattern.

## Styling

Supported CSS overrides are `--yam3x-autocomplete-popup-min-width`, `--yam3x-autocomplete-popup-max-width`, `--yam3x-autocomplete-popup-max-height`, `--yam3x-autocomplete-popup-padding-block`, `--yam3x-autocomplete-popup-padding-inline`, `--yam3x-autocomplete-popup-shape`, `--yam3x-autocomplete-popup-elevation`, `--yam3x-autocomplete-option-container-height`, `--yam3x-autocomplete-option-shape`, `--yam3x-autocomplete-option-first-child-shape`, `--yam3x-autocomplete-option-last-child-shape`, `--yam3x-autocomplete-option-selected-shape`, and `--yam3x-autocomplete-option-label-text-font-size`. Set them on the Autocomplete root. Theme colors are controlled by the active System tokens and `variant`.

## Material references

[Menus guidelines](https://m3.material.io/components/menus/guidelines) · [Menus specs](https://m3.material.io/components/menus/specs) · [Text fields specs](https://m3.material.io/components/text-fields/specs)
