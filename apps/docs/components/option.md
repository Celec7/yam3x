<script setup lang="ts">
import OptionExample from './demos/OptionExample.vue'
</script>

# Option

Option, OptionGroup, and OptionPanel are project primitives for selection lists and popups. A parent such as [Select](/components/select) owns selection and focus.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><OptionExample /></div>

::: details View demo source

<<< ./demos/OptionExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'
import { Option, OptionGroup } from './components/yam3x/option'
import { Select } from './components/yam3x/select'

const order = ref('recent')
</script>

<template>
  <FormField label="Sort order">
    <Select
      v-model="order"
      name="order"
    >
      <OptionGroup label="Sort">
        <Option
          value="recent"
          label="Recently added"
        />
        <Option
          value="name"
          label="Name"
        />
      </OptionGroup>
    </Select>
  </FormField>
</template>
```

## API

`OptionPanel` can inherit built-in loading and empty text from [LocaleProvider](/components/localization)'s `optionPanel` namespace. Its optional `locale` overrides the language; `loadingText`, `noDataText`, and their slots take precedence. Without a provider, the locale is `en-US`.

`Option` requires `value` and accessible `label`; `selected` and `disabled` are controlled props. Its `select` event reports `{ value, source }` for enabled options. `term`, `highlightMode`, and `disableHighlight` control match highlighting. Use `#leading`, `#selected-indicator`, and `#trailing` for custom content; `hideSelectionIndicator` removes the built-in mark.

`OptionGroup` wraps related options with `label`, `labelledby`, or a `#label` slot; `hidden` removes the group. `OptionPanel` anchors to an `HTMLElement` with `anchor`. It supports `v-model:open`, `loading`, `empty`, `#loading`, and `#no-data`. Use `fitAnchorWidth`, `anchorOffset`, `scrollStrategy`, `teleport`, or `panelClass` to configure the surface; `label` or `labelledby` names it. It emits `beforetoggle`, `toggle`, `open`, and `close`.

## Behavior and accessibility

The parent control commits or rejects selection and manages focus and arrow-key navigation. Options default to `tabindex="-1"`. OptionPanel positions around the anchor, flips within the viewport, and closes on outside pointer input. Keep each option's touch target at least 48 × 48px; avoid nested controls or another independent action within a row.

## Styling

These common project override hooks apply on the corresponding root; defaults map to the owning Material surface and System tokens.

| Area        | Example hooks                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| Option row  | `--yam3x-option-container-height`, `--yam3x-option-shape`, `--yam3x-option-selected-container-color`                        |
| Option text | `--yam3x-option-color`, `--yam3x-option-label-text-font-size`                                                               |
| Group       | `--yam3x-option-group-label-color`, `--yam3x-option-group-divider-color`                                                    |
| Panel       | `--yam3x-option-panel-container-color`, `--yam3x-option-panel-container-shape`, `--yam3x-option-panel-container-max-height` |
| Status      | `--yam3x-option-panel-loading-color`, `--yam3x-option-panel-text-highlight-color`                                           |

The temporary panel defaults to the System `surface-container-low` role and inherits row and group values. Select trigger hooks are documented on the [Select page](/components/select#styling).

## Material references

[Menus overview](https://m3.material.io/components/menus/overview) · [guidelines](https://m3.material.io/components/menus/guidelines)
