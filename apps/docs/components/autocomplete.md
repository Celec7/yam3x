<script setup lang="ts">
import AutocompleteExample from './demos/AutocompleteExample.vue'
import AutocompleteBasicExample from './demos/AutocompleteBasicExample.vue'
import AutocompleteStatesExample from './demos/AutocompleteStatesExample.vue'
import AutocompleteVirtualExample from './demos/AutocompleteVirtualExample.vue'
</script>

# Autocomplete

Autocomplete is a project extension that filters suggestions as a person types and lets them commit a suggestion or keep free text. The query and the selected value are separate pieces of state.

Material documents this filtering pattern within [Menus](https://m3.material.io/components/menus/overview) rather than as a standalone component. The closest Compose Material 3 composition is `ExposedDropdownMenuBox` with an editable text field and `DropdownMenuItem` suggestions. The combobox semantics, committed-value model, popup limits, and validation behavior are project decisions.

Use it when input should narrow a known catalog but must not force a choice. Use [Select](/components/select) when every value comes from a closed list, and [Form field](/components/form-field) with a plain input when suggestions add no value.

## Examples

### Filtering and variants

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteExample /></div>

Type to filter the fruit suggestions, then use Arrow Down and Enter to commit one. The committed value, query text, and emitted events are shown separately. The color control switches the Standard and Vibrant menu mappings; both keep the same filtering behavior.

::: details View demo source

<<< ./demos/AutocompleteExample.vue{vue}

:::

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteBasicExample /></div>

The basic field filters a local list and reports the committed value. `v-model` owns the editable text and `v-model:selected` owns the suggestion value; clearing or editing the text after a commit clears the selected value.

::: details View demo source

<<< ./demos/AutocompleteBasicExample.vue{vue}

:::

### Validation and states

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteStatesExample /></div>

The examples cover native required validation, `selection-required`, form reset, custom filter modes, a custom predicate, a custom input slot, automatic activation, live option updates, disabled and read-only fields, hidden loading and no-data rows, a hidden selection indicator, and an invalid field. Expand the block to inspect each state.

::: details View demo source

<<< ./demos/AutocompleteStatesExample.vue{vue}

:::

### Large catalogs

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteVirtualExample /></div>

`virtual` renders a measured window over a large suggestion catalog. Filtering, keyboard navigation, selection, and result announcements still use the complete data. The controls also show loading, zero overscan, a custom option slot, and removal of leading records.

::: details View demo source

<<< ./demos/AutocompleteVirtualExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  Autocomplete,
  type AutocompleteFilter,
  type AutocompleteOption,
} from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const filter = ref<AutocompleteFilter>('contains')
const options: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'unavailable', label: 'Unavailable', disabled: true },
]
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    :filter="filter"
    label="Fruit"
    hint="Type to filter the list."
  />
</template>
```

The component does not fetch suggestions. The application supplies `options`; set `loading` while a request is pending and replace `options` when it resolves. Keep query text, labels, and selected values application-owned.

::: details Async options and a custom option slot

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Autocomplete, type AutocompleteOption } from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const options = shallowRef<AutocompleteOption[]>([])
const loading = ref(false)
let sequence = 0

async function onQuery({ query: value }: { query: string }): Promise<void> {
  const current = ++sequence
  loading.value = true
  try {
    const response = await fetch(`/api/fruit?q=${encodeURIComponent(value)}`)
    const rows = (await response.json()) as AutocompleteOption[]
    if (current === sequence) options.value = rows
  } finally {
    if (current === sequence) loading.value = false
  }
}
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    :loading="loading"
    label="Fruit"
    @query="onQuery"
  >
    <template #option="{ option, selected: committed }">
      <span>{{ option.label }}</span>
      <small v-if="committed">Committed</small>
    </template>
  </Autocomplete>
</template>
```

:::

::: details Large catalogs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete, type AutocompleteOption } from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const options: AutocompleteOption[] = Array.from({ length: 10000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index + 1}`,
}))
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    :virtual="{ estimateSize: 48, overscan: 4 }"
    label="Item"
  />
</template>
```

:::

## Behavior and accessibility

The editable input is a combobox that owns DOM focus. The popup is a listbox named from `label`; the active suggestion is exposed through `aria-activedescendant`, and result-count or state text is announced through a polite live region.

### Query, selection, and `aria-selected`

- Typing updates the query and filters labels using `filter`: case-insensitive `contains` by default, or `starts-with`, `ends-with`, `none`, or a custom `(option, query) => boolean`.
- `filter="none"` shows the full supplied catalog. Use it when the application derives options from the query itself.
- Enter or pointer activation commits the active enabled suggestion. Committing writes the option label to the query and its `value` to `v-model:selected`.
- Editing the text after a commit clears `selected` and emits `change` with `option: null`, `value: null`, and the new query. Free text is allowed; set `selection-required` to reject it during native validation.
- Assigning `selected` externally updates the query to the matching option label. Assigning a value that is not in `options` leaves the current text unchanged.
- `aria-selected` identifies the active suggestion, not the committed value. The committed value is shown by the input text and the trailing check indicator, which `hide-selection-indicator` removes.
- Disabled suggestions remain readable and are skipped by keyboard movement and activation.

### Keyboard and focus

- Arrow Down and Arrow Up open the popup when it is available, then move through enabled suggestions with wrapping.
- Enter commits the active suggestion while the popup is open. Space enters the query as text.
- Escape closes the popup and preserves the query text. Tab closes it and leaves in page order.
- Backspace or Delete with an empty query closes the popup.
- Blur closes the popup. With `selection-required`, the query reverts to the committed label so the field never keeps invalid free text.
- IME composition is ignored by navigation and activation until composition ends.
- `openOnFocus` (default `true`) opens available suggestions on focus. `autoActivate` selects the committed option or the first enabled suggestion as the active row; it never commits that row.

### Popup states and form participation

- `loading` exposes `aria-busy`, unmounts option rows, and shows the loading row unless `hide-loading` is set. Loading text can come from `loadingText` or the `#loading` slot.
- No matches show the no-data row unless `hide-no-data` is set; `noDataText` and `#no-data` override the localized default. If both status rows are hidden, the popup does not open for an empty result.
- `hint` is connected with `aria-describedby`. `error` replaces the hint, marks the field invalid, and is announced as an alert.
- The native input carries `name`, `form`, `disabled`, `readonly`, and `required`. `selection-required` adds native custom validity until the committed option label matches the text. Native form reset restores the initial query and selected value.
- `resultsLabel`, `loadingText`, and `noDataText` override built-in announcements. The `#input` slot must bind `inputProps` to a native editable input.
- Virtualization requires unique, stable option values. Only nearby and active suggestions mount; `aria-posinset` and `aria-setsize` describe positions in the filtered result. Catalog changes preserve the first visible record and its offset, and explicit navigation takes priority.

### Responsive and RTL

The popup is positioned against the field, flips above when the viewport is short, and shifts to stay inside the viewport. Its width matches the field between `--yam3x-autocomplete-popup-min-width` and `--yam3x-autocomplete-popup-max-width`. The popup follows the writing direction and mirrors to the field's inline end in RTL layouts. The field itself fills its container.

## API

Built-in status, result announcements, suggestion names, and required-selection text can inherit [LocaleProvider](/components/localization)'s `autocomplete` namespace. Optional `locale` takes precedence, defaulting to the provider then `en-US`; `loadingText`, `noDataText`, `resultsLabel`, and their slots keep priority. The application owns query text, option labels, and selected values.

### Exports

| Export                        | Kind      | Use                                                                     |
| ----------------------------- | --------- | ----------------------------------------------------------------------- |
| `Autocomplete`                | Component | Editable combobox with a filtered suggestion list.                      |
| `AutocompleteOption`          | Type      | Suggestion row with a unique `value`, `label`, and optional `disabled`. |
| `AutocompleteFilter`          | Type      | Filter mode or `(option, query) => boolean` predicate.                  |
| `AutocompleteFilterMode`      | Type      | `'contains'`, `'starts-with'`, `'ends-with'`, or `'none'`.              |
| `AutocompleteSelectionSource` | Type      | `'keyboard'` or `'pointer'`.                                            |
| `AutocompleteVariant`         | Type      | `'standard'` or `'vibrant'`.                                            |
| `VirtualListOptions`          | Type      | Windowing options for `virtual`.                                        |

### Props and models

| Prop / model                    | Type                                    | Default            | Description                                                                   |
| ------------------------------- | --------------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| `options`                       | `AutocompleteOption[]`                  | Required           | Suggestions; each `value` must be unique in the list.                         |
| `label`                         | `string`                                | Required           | Visible field label and accessible name.                                      |
| `hint`                          | `string`                                | `''`               | Supporting text; connected to the input.                                      |
| `error`                         | `string`                                | `''`               | Invalid message; replaces the hint and marks the field invalid.               |
| `modelValue` / `v-model`        | `string`                                | `''`               | Current editable text.                                                        |
| `selected` / `v-model:selected` | `string \| null`                        | `null`             | Value of the committed suggestion.                                            |
| `filter`                        | `AutocompleteFilter`                    | `'contains'`       | Case-insensitive mode or a custom predicate.                                  |
| `caseSensitive`                 | `boolean`                               | `false`            | Matches labels with case sensitivity.                                         |
| `autoActivate`                  | `boolean`                               | `false`            | Makes the committed or first enabled suggestion active without committing it. |
| `openOnFocus`                   | `boolean`                               | `true`             | Opens available suggestions when the input receives focus.                    |
| `loading`                       | `boolean`                               | `false`            | Shows the loading state and removes option rows.                              |
| `loadingText`                   | `string`                                | Localized          | Overrides the loading status text.                                            |
| `noDataText`                    | `string`                                | Localized          | Overrides the no-results text.                                                |
| `resultsLabel`                  | `string \| ((count: number) => string)` | Localized          | Overrides the result-count announcement.                                      |
| `variant`                       | `'standard' \| 'vibrant'`               | `'standard'`       | Menu color mapping exposed as a project variant.                              |
| `hideSelectionIndicator`        | `boolean`                               | `false`            | Hides the committed-value check icon.                                         |
| `hideLoading`                   | `boolean`                               | `false`            | Hides the loading row and the popup when loading.                             |
| `hideNoData`                    | `boolean`                               | `false`            | Hides the no-results row and the popup when empty.                            |
| `panelClass`                    | `string`                                | `''`               | Class applied to the popup listbox.                                           |
| `virtual`                       | `boolean \| VirtualListOptions`         | `false`            | Renders a measured window; `true` uses a 48px estimate and 4 overscan rows.   |
| `id`                            | `string`                                | Generated          | Input ID.                                                                     |
| `placeholder`                   | `string`                                | `''`               | Native input placeholder.                                                     |
| `name`                          | `string`                                | —                  | Native form field name.                                                       |
| `form`                          | `string`                                | —                  | Associates the input with a form by id.                                       |
| `autocomplete`                  | `string`                                | `'off'`            | Native autocomplete hint.                                                     |
| `required`                      | `boolean`                               | `false`            | Native required validation for a nonempty value.                              |
| `selectionRequired`             | `boolean`                               | `false`            | Requires the text to match the committed option label.                        |
| `disabled`                      | `boolean`                               | `false`            | Disables the input and popup.                                                 |
| `readonly`                      | `boolean`                               | `false`            | Makes the input read-only and closes the popup.                               |
| `locale`                        | `string`                                | Provider → `en-US` | Language of built-in status and validation text.                              |

### Events

| Event          | Payload                             | Description                                                                        |
| -------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `query`        | `{ query: string }`                 | Input text changed.                                                                |
| `beforeselect` | `(option, event)`                   | Cancelable; `event.detail` carries `{ option, source }`.                           |
| `select`       | `{ option, source }`                | A suggestion was committed.                                                        |
| `change`       | `{ option, value, query, source? }` | Committed value or query changed; `option` is `null` when editing clears a commit. |
| `toggle`       | `{ open: boolean }`                 | Popup visibility changed.                                                          |
| `open`         | —                                   | Popup opened.                                                                      |
| `close`        | —                                   | Popup closed.                                                                      |

### Slots

| Slot       | Props                                 | Description                                                        |
| ---------- | ------------------------------------- | ------------------------------------------------------------------ |
| `input`    | `{ inputProps, query, selected }`     | Replaces the native input; bind `inputProps` to an editable input. |
| `option`   | `{ option, active, selected, query }` | Replaces suggestion content; keep it noninteractive.               |
| `loading`  | —                                     | Replaces the loading row.                                          |
| `no-data`  | —                                     | Replaces the no-results row.                                       |
| `trailing` | —                                     | Replaces the expand button icon.                                   |

### Methods

Access these through a template ref.

| Member    | Type                            | Description                 |
| --------- | ------------------------------- | --------------------------- |
| `close()` | `() => void`                    | Closes the popup.           |
| `focus()` | `() => void`                    | Focuses the editable input. |
| `open`    | `Ref<boolean>`                  | Current popup visibility.   |
| `input`   | `Ref<HTMLInputElement \| null>` | Native input element.       |

## Styling

The component exposes project-defined geometry, shape, elevation, and label-size overrides on the root. Theme colors stay mapped to System roles and change through `variant`; color properties are not public hooks. The popup has a zero-gap option surface and a 280px default height cap.

::: details CSS overrides

| Property                                           | Default                   | Description                                      |
| -------------------------------------------------- | ------------------------- | ------------------------------------------------ |
| `--yam3x-autocomplete-popup-min-width`             | `112px`                   | Minimum popup width.                             |
| `--yam3x-autocomplete-popup-max-width`             | `280px`                   | Maximum popup width.                             |
| `--yam3x-autocomplete-popup-max-height`            | `280px`                   | Maximum popup height before scrolling.           |
| `--yam3x-autocomplete-popup-padding-block`         | Density-scaled `2px`      | Block padding around the option list.            |
| `--yam3x-autocomplete-popup-padding-inline`        | Density-scaled `4px`      | Inline padding around the option list.           |
| `--yam3x-autocomplete-popup-shape`                 | System large corner       | Popup corner radius.                             |
| `--yam3x-autocomplete-popup-elevation`             | Level 2                   | Popup elevation.                                 |
| `--yam3x-autocomplete-option-container-height`     | `44px`                    | Visible row surface height inside a 48px target. |
| `--yam3x-autocomplete-option-shape`                | System extra-small corner | Row corner radius.                               |
| `--yam3x-autocomplete-option-first-child-shape`    | System medium corner      | First row corner radius.                         |
| `--yam3x-autocomplete-option-last-child-shape`     | System medium corner      | Last row corner radius.                          |
| `--yam3x-autocomplete-option-selected-shape`       | System medium corner      | Committed row corner radius.                     |
| `--yam3x-autocomplete-option-label-text-font-size` | Label large               | Suggestion label font size.                      |

:::

## Material references

[Menus guidelines](https://m3.material.io/components/menus/guidelines) · [Menus specs](https://m3.material.io/components/menus/specs) · [Text fields specs](https://m3.material.io/components/text-fields/specs) · [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
