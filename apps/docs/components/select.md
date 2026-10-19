<script setup>
import SelectExample from './demos/SelectExample.vue'
import SelectVirtualExample from './demos/SelectVirtualExample.vue'
</script>

# Select

Select is a project form control for choosing one or more values from a popup list. It composes project field and option primitives while preserving native form submission and validation.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><SelectExample /></div>

::: details View demo source

<<< ./demos/SelectExample.vue{vue}

:::

### Large option catalogs

<div class="vp-raw yam3x-doc-demo-theme"><SelectVirtualExample /></div>

::: details View large catalog demo source

<<< ./demos/SelectVirtualExample.vue{vue}

:::

## Use in your app

First run `pnpm dlx @celec7/yam3x@latest add select option form-field`, then compose the components:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'
import { Option } from './components/yam3x/option'
import { Select } from './components/yam3x/select'

const frequency = ref('daily')
</script>

<template>
  <FormField label="Notification frequency">
    <Select
      v-model="frequency"
      name="frequency"
      required
    >
      <Option
        value="immediate"
        label="Immediately"
      />
      <Option
        value="daily"
        label="Daily digest"
      />
      <Option
        value="weekly"
        label="Weekly digest"
      />
    </Select>
  </FormField>
</template>
```

Use an array model for multiple selection; the popup stays open as options are toggled. Group related options with labeled `OptionGroup`s. The option panel scrolls when its content overflows.

## API

Built-in empty text can inherit [LocaleProvider](/components/localization)'s `select` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; the `#no-data` slot takes precedence. Language updates preserve popup state and single or multiple selection values.

| Prop                      | Type                            | Default      | Description                                                                                                 |
| ------------------------- | ------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| `options`                 | `readonly SelectOption[]`       | Undefined    | Data-driven catalog; when supplied, renders options instead of the default slot.                            |
| `virtual`                 | `boolean \| VirtualListOptions` | `false`      | Enable measured windowing for data-driven `options`; requires a data catalog rather than slotted options.   |
| `searchable`              | `boolean`                       | `false`      | Use an editable search input; text filters choices without replacing accepted values.                       |
| `query` / `v-model:query` | `string`                        | `''`         | Independent filter text, cleared after acceptance or dismissal.                                             |
| `filter`                  | `SelectFilter`                  | `'contains'` | Case-insensitive `contains`, `starts-with`, `ends-with`, or `none` / custom `(option, query) => boolean`.   |
| `id`                      | `string`                        | Generated    | Trigger ID.                                                                                                 |
| `modelValue` / `v-model`  | `string \| string[] \| null`    | `null`       | Selected value, or selected values with `multiple`.                                                         |
| `open` / `v-model:open`   | `boolean`                       | `false`      | Controlled popup visibility.                                                                                |
| `name`                    | `string`                        | —            | Native form field name.                                                                                     |
| `form`                    | `string`                        | —            | Associate with a form by id when outside the form subtree.                                                  |
| `required`                | `boolean`                       | `false`      | Require a selection during native form validation.                                                          |
| `disabled`                | `boolean`                       | `false`      | Disable the trigger and selection.                                                                          |
| `multiple`                | `boolean`                       | `false`      | Allow several selected values.                                                                              |
| `selectionDisplay`        | `'text' \| 'chips'`             | `'text'`     | Display accepted multiple values as text or removable input chips. Single selection keeps its text display. |
| `hideSelectionIndicator`  | `boolean`                       | `false`      | Hide option selection indicators.                                                                           |
| `panelClass`              | `string`                        | `''`         | Class applied to the floating option panel.                                                                 |
| `fitAnchorWidth`          | `boolean`                       | `true`       | Match the option panel to the trigger width.                                                                |
| `anchorOffset`            | `number`                        | `4`          | Gap between trigger and panel in CSS pixels.                                                                |
| `closeOnTab`              | `boolean`                       | `true`       | Close the panel when Tab leaves the trigger.                                                                |

Use the default slot for `Option` or `OptionGroup`. `#value` receives `{ value, options }`; `#arrow` replaces the dropdown icon, and `#no-data` supplies the empty-list message. Slotted options need unique string values and labels.

A cancellable DOM `beforeinput` event fires before the value changes; cancelling it preserves the current value. `input` and `change` receive `{ value, source }`; `beforetoggle` is cancellable, and `toggle` receives `{ open, source }`. The component also emits `open`, `close`, and `invalid`.

### Data-driven options

Pass `:options="[{ value: 'daily', label: 'Daily digest' }, { value: 'weekly', label: 'Weekly digest', disabled: true }]"` to use a flat data catalog. `SelectOption` has a unique nonempty string `value`, a `label`, optional `disabled`, and optional initial `selected`. Import its type from the Select module; this mode does not require importing Option in the application. Use the existing default slot for grouped/custom Option compositions instead.

`#option="{ option, selected, active }"` customizes the content of a data-driven row; its accessible name remains `option.label`. Keep content noninteractive. `#value` continues to customize the trigger. If metadata temporarily omits an accepted value, the trigger uses its raw value and native submission retains it. When its metadata arrives, the label updates without emitting a selection change. Clear the model explicitly when your application removes a choice permanently.

### Virtualization

Use `:options="options" virtual` for a large catalog. Import `VirtualListOptions` from the Select module to configure `estimateSize` (default `48` CSS pixels) and `overscan` (default `4` rows on each side), for example `:virtual="{ estimateSize: 64, overscan: 6 }"`. `overscan: 0` disables extra rows while retaining full viewport coverage, including popup padding. The estimate applies only before measurement and never fixes content height; visible rows are measured again when wrapping, fonts, or density change.

Only nearby and active options mount; navigation and filtering still use the complete catalog. Distant keyboard targets mount and scroll into view, with option positions and totals representing the full filtered result. Native proxies contain accepted values only, submitted in catalog order followed by accepted values with missing metadata. Selection, cancellable events, reset, and required validation retain their semantics. Virtualization requires data-driven `options` because unmounted slots cannot supply a complete catalog; a slotted-only configuration reports an error.

Data insertions and removals retain the first visible record and its row-relative offset. If that record disappears, the window starts at the next surviving record in the previous order, then the preceding survivor; a wholly replaced collection returns to the beginning. Scroll boundaries still apply. Explicit keyboard and search navigation takes priority, and data updates do not scroll back to an unchanged offscreen focus target.

### Searchable selection

Set `searchable` to search data-driven or grouped slotted options. `v-model` retains accepted values while `v-model:query` holds filter text independently. Typing, empty results, Escape, and leaving the field preserve accepted choices; acceptance or dismissal clears the query. Use `filter="none"` when the application supplies options based on the query; accepted values retain their form values while their metadata is absent.

The input supports native text editing. Arrow keys move the active option, and Enter accepts it; single selection then closes the list, while multiple selection keeps it open. Home, End, Space, and modified keys retain their text-editing behavior. IME text filters only after composition ends; Enter during composition cannot accept an option. The query input has no form name: native submission and `required` validation use accepted choices. `#value` applies to non-searchable triggers; searchable fields render text in their native input.

### Multiple-selection display

Set `multiple selection-display="chips"` to display accepted values as [Input chips](/components/chips). Chip labels use the catalog or fall back to the raw value. Activating a chip body opens the menu at that choice (or the first available choice if its metadata is missing); its trailing remove action, Backspace, or Delete removes it through the same cancellable `beforeinput` path as a menu choice. Disabled choices and a disabled Select cannot be removed. A value absent from the catalog can still be removed.

The chips sit beside the named menu trigger, with separate focus targets. After removal, focus moves to the next enabled chip, the previous enabled chip, or the trigger when none remain; each chip body and remove action remains keyboard reachable. The trigger retains its selected-values accessible description and `#value` customization. Native form values and reset use the accepted model in either display mode.

## Behavior and accessibility

When a catalog update removes or disables the active option in a non-searchable multiple picker, focus moves to an enabled replacement only if the picker still owns focus. An empty list receives focus and retains Escape dismissal. External focus and accepted values are preserved.

Searchable mode is a project-defined composition: single and multiple selection keep input focus and expose the active option with `aria-activedescendant`. The multiple list exposes `aria-multiselectable`, and the input description names accepted values. Empty groups are hidden from filtered results.

The single-select trigger is named by its surrounding `FormField` label or `aria-label`/`aria-labelledby`. It uses combobox semantics; the active option is exposed with `aria-activedescendant` while DOM focus stays on the trigger. In multiple mode, the trigger is a button whose accessible description gives the selected values. Opening it moves focus to the active option in a multiselect listbox; arrow keys move option focus, Space or Enter toggles selection, and the list stays open. Escape closes the list and returns focus to the trigger. Tab closes the list and continues out of the field.

## Styling

Set these project-defined custom properties on the Select root. The trigger shape maps to the System small corner by default; the focus and open colors map to System roles.

| Property                                | Description                                          |
| --------------------------------------- | ---------------------------------------------------- |
| `--yam3x-select-container-shape`        | Trigger corner radius.                               |
| `--yam3x-select-icon-size`              | Dropdown icon size.                                  |
| `--yam3x-select-disabled-color`         | Disabled trigger color before opacity is applied.    |
| `--yam3x-select-disabled-color-opacity` | Disabled trigger color opacity.                      |
| `--yam3x-select-panel-max-width`        | Maximum popup width; defaults to the viewport width. |

The popup uses the [Option styling](/components/option#styling) for its surface, rows, and status content.

## Material references

- [Chips guidelines](https://m3.material.io/components/chips/guidelines)

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [Menus overview](https://m3.material.io/components/menus/overview)
