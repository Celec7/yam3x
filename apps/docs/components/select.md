<script setup>
import SelectExample from './demos/SelectExample.vue'
import SelectDataExample from './demos/SelectDataExample.vue'
import SelectSearchExample from './demos/SelectSearchExample.vue'
import SelectVirtualExample from './demos/SelectVirtualExample.vue'
</script>

# Select

Select chooses one or more values from a popup list. It is a project form control that composes this project's [Form field](/components/form-field) and [Option](/components/option) primitives while preserving native form submission and validation.

Use it when the choices are long, ordered, or data-driven. For a short set of always-visible choices, prefer [Radio group](/components/radio-group) or [Chips](/components/chips).

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><SelectExample /></div>

::: details View demo source

<<< ./demos/SelectExample.vue{vue}

:::

The demo labels each scenario: single selection, multiple selection, a required field with its submit action, an externally associated form, custom trigger content, and the disabled and empty states. Submitting without a release status leaves the field invalid and shows the validation message inside the field.

## Use in your app

Run `pnpm dlx @celec7/yam3x@latest add select option form-field`, then compose the components:

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

Use an array model for multiple selection; the popup stays open as options are toggled. Group related options with labeled `OptionGroup`s. The options still submit through the native `<select>` the component renders, so the surrounding form owns validation and reset.

::: details Multiple values as input chips

```vue
<FormField label="Release channels">
  <Select
    v-model="channels"
    name="channels"
    multiple
    selection-display="chips"
  >
    <Option value="stable" label="Stable" />
    <Option value="beta" label="Beta" />
  </Select>
</FormField>
```

:::

## Advanced

### Data-driven options

<div class="vp-raw yam3x-doc-demo-theme"><SelectDataExample /></div>

::: details View demo source

<<< ./demos/SelectDataExample.vue{vue}

:::

Pass `:options="[{ value: 'daily', label: 'Daily digest' }, { value: 'weekly', label: 'Weekly digest', disabled: true }]"` to use a flat data catalog. `SelectOption` has a unique nonempty string `value`, a `label`, optional `disabled`, and optional initial `selected`. Import the type from the Select module; this mode does not require importing `Option`. Use the default slot for grouped or custom `Option` compositions instead.

If metadata temporarily omits an accepted value, the trigger uses its raw value and native submission retains it. When the metadata arrives, the label updates without emitting a selection change. Clear the model explicitly when your application removes a choice permanently.

### Searchable selection

<div class="vp-raw yam3x-doc-demo-theme"><SelectSearchExample /></div>

::: details View demo source

<<< ./demos/SelectSearchExample.vue{vue}

:::

Set `searchable` to search data-driven or grouped slotted options. `v-model` retains accepted values while `v-model:query` holds filter text independently. The `filter` prop selects case-insensitive `contains`, `starts-with`, `ends-with`, `none`, or a custom `(option, query) => boolean`. Use `filter="none"` when the application supplies options based on the query; accepted values retain their form values while their metadata is absent.

Typing, empty results, Escape, and leaving the field preserve accepted choices; acceptance or dismissal clears the query. Only text typed into the input filters the list, and the query input has no form name: native submission and `required` validation use accepted choices.

Searchable mode is a project-defined composition: single and multiple selection keep input focus and expose the active option with `aria-activedescendant`. The multiple list exposes `aria-multiselectable`, and the input description names accepted values. Empty groups are hidden from filtered results.

### Large catalogs

<div class="vp-raw yam3x-doc-demo-theme"><SelectVirtualExample /></div>

::: details View demo source

<<< ./demos/SelectVirtualExample.vue{vue}

:::

Use `:options="options" virtual` for a large catalog. Import `VirtualListOptions` from the Select module to configure `estimateSize` (default `48` CSS pixels) and `overscan` (default `4` rows on each side), for example `:virtual="{ estimateSize: 64, overscan: 6 }"`. `overscan: 0` disables extra rows while retaining full viewport coverage, including popup padding. The estimate applies only before measurement and never fixes content height; visible rows are measured again when wrapping, fonts, or density change.

Only nearby and active options mount; navigation and filtering still use the complete catalog. Distant keyboard targets mount and scroll into view, with option positions and totals representing the full filtered result. Selection, cancellable events, reset, and required validation keep their semantics. Virtualization requires data-driven `options` because unmounted slots cannot supply a complete catalog; a slotted-only configuration reports an error.

Data insertions and removals retain the first visible record and its row-relative offset. If that record disappears, the window starts at the next surviving record in the previous order, then the preceding survivor; a wholly replaced collection returns to the beginning. Scroll boundaries still apply. Explicit keyboard and search navigation takes priority, and data updates do not scroll back to an unchanged offscreen focus target.

## Behavior and accessibility

The trigger's name comes from its surrounding `FormField` label or from `aria-label` / `aria-labelledby`. The popup is a listbox; empty results stay reachable and announce their status.

### Keyboard

- Single selection uses combobox semantics. DOM focus stays on the trigger and the active option is exposed with `aria-activedescendant`; arrow keys move the active option, Enter accepts it, and Escape closes the list and returns focus to the trigger.
- Multiple selection uses a button trigger whose accessible description lists the selected values. Opening it moves focus to the active option in a multiselect listbox; arrow keys move option focus, Space or Enter toggles selection, and the list stays open.
- Tab closes the list and continues out of the field. Set `closeOnTab` to `false` to keep the popup open while focus leaves.
- In searchable mode, arrow keys move the active option and Enter accepts it; single selection then closes the list, while multiple selection keeps it open. Home, End, Space, and modified keys retain their text-editing behavior. IME text filters only after composition ends, and Enter during composition cannot accept an option.

### Focus and dismissal

- Pointer presses outside the panel, Escape, and Tab with `closeOnTab` close the popup. `beforetoggle` is cancellable; `toggle` receives `{ open, source }`, where the source is `programmatic`, `outside`, or `anchor-scroll`.
- The panel is portaled to the document body, positioned against the trigger, and flipped or shifted to stay inside the viewport. It scrolls when its content overflows.
- When a catalog update removes or disables the active option in a non-searchable multiple picker, focus moves to an enabled replacement only if the picker still owns focus. An empty list receives focus and retains Escape dismissal. External focus and accepted values are preserved.
- The chips of a chip display sit beside the named menu trigger with separate focus targets. After removal, focus moves to the next enabled chip, the previous enabled chip, or the trigger when none remain.

### Forms

- `name` and `form` write to the native `<select>` the component renders; the native proxy contains accepted values only and stays `aria-hidden`. Multiple values submit in catalog order, followed by accepted values with missing metadata.
- `required` takes part in native constraint validation, and `disabled` blocks the trigger and selection. Native reset restores the accepted model in either display mode.
- Accepted values keep their form values while the searchable query changes: typing, empty results, and dismissal never rewrite the model.
- The query input has no form name, so `FormData` never contains filter text.

### Selection display

- `multiple selection-display="chips"` displays accepted values as [Input chips](/components/chips). Chip labels use the catalog and fall back to the raw value.
- Activating a chip body opens the menu at that choice, or at the first available choice when its metadata is missing. Its trailing remove action, Backspace, or Delete removes it through the same cancellable `beforeinput` path as a menu choice.
- Disabled choices and a disabled Select cannot be removed. A value absent from the catalog can still be removed.
- The trigger keeps its selected-values accessible description and `#value` customization in either display mode.

### State ownership

`v-model` owns the accepted value or values, `v-model:open` owns controlled visibility, and `v-model:query` owns filter text. Clearing a choice from the catalog does not rewrite the model; the application clears it explicitly. The option panel scrolls inside its own container and does not grow the page.

### Responsive and RTL

The panel keeps the trigger width when `fitAnchorWidth` is set, is limited by `--yam3x-select-panel-max-width` and the viewport, and repositions while the page scrolls or resizes. The portaled panel inherits the trigger's `direction`, so RTL layouts keep the popup aligned to the inline start.

## API

Built-in empty text can inherit [LocaleProvider](/components/localization)'s `select` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; the `#no-data` slot takes precedence. Language updates preserve popup state and single or multiple selection values.

### Exports

| Export               | Kind      | Use                                                                          |
| -------------------- | --------- | ---------------------------------------------------------------------------- |
| `Select`             | Component | Popup selection control.                                                     |
| `SelectOption`       | Type      | Row schema for the data-driven `options` catalog.                            |
| `SelectFilter`       | Type      | `'contains'`, `'starts-with'`, `'ends-with'`, `'none'`, or a match function. |
| `VirtualListOptions` | Type      | Windowing options for `virtual`.                                             |

`Option` and `OptionGroup` come from `./components/yam3x/option` and fill the default slot.

### Props and models

Value and selection:

| Prop                      | Type                         | Default  | Description                                                                                                 |
| ------------------------- | ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `modelValue` / `v-model`  | `string \| string[] \| null` | `null`   | Selected value, or selected values with `multiple`.                                                         |
| `multiple`                | `boolean`                    | `false`  | Allow several selected values.                                                                              |
| `selectionDisplay`        | `'text' \| 'chips'`          | `'text'` | Display accepted multiple values as text or removable input chips. Single selection keeps its text display. |
| `hideSelectionIndicator`  | `boolean`                    | `false`  | Hide option selection indicators.                                                                           |
| `open` / `v-model:open`   | `boolean`                    | `false`  | Controlled popup visibility.                                                                                |
| `query` / `v-model:query` | `string`                     | `''`     | Independent filter text, cleared after acceptance or dismissal.                                             |

Catalog and filtering:

| Prop         | Type                            | Default      | Description                                                                                               |
| ------------ | ------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `options`    | `readonly SelectOption[]`       | Undefined    | Data-driven catalog; when supplied, renders options instead of the default slot.                          |
| `virtual`    | `boolean \| VirtualListOptions` | `false`      | Enable measured windowing for data-driven `options`; requires a data catalog rather than slotted options. |
| `searchable` | `boolean`                       | `false`      | Use an editable search input; text filters choices without replacing accepted values.                     |
| `filter`     | `SelectFilter`                  | `'contains'` | Case-insensitive `contains`, `starts-with`, `ends-with`, or `none` / custom `(option, query) => boolean`. |

Form participation:

| Prop       | Type      | Default   | Description                                                |
| ---------- | --------- | --------- | ---------------------------------------------------------- |
| `id`       | `string`  | Generated | Trigger ID.                                                |
| `name`     | `string`  | —         | Native form field name.                                    |
| `form`     | `string`  | —         | Associate with a form by id when outside the form subtree. |
| `required` | `boolean` | `false`   | Require a selection during native form validation.         |
| `disabled` | `boolean` | `false`   | Disable the trigger and selection.                         |

Panel and layout:

| Prop             | Type      | Default | Description                                  |
| ---------------- | --------- | ------- | -------------------------------------------- |
| `panelClass`     | `string`  | `''`    | Class applied to the floating option panel.  |
| `fitAnchorWidth` | `boolean` | `true`  | Match the option panel to the trigger width. |
| `anchorOffset`   | `number`  | `4`     | Gap between trigger and panel in CSS pixels. |
| `closeOnTab`     | `boolean` | `true`  | Close the panel when Tab leaves the trigger. |

Localization:

| Prop     | Type     | Default            | Description                                                |
| -------- | -------- | ------------------ | ---------------------------------------------------------- |
| `locale` | `string` | Provider → `en-US` | Language of built-in messages such as the empty-list text. |

### Events

| Event          | Payload             | Notes                                                                                            |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| `beforeinput`  | `Event`             | Cancellable DOM event fired before the value changes; cancelling it preserves the current value. |
| `input`        | `{ value, source }` | `source` is `pointer`, `keyboard`, or `programmatic`.                                            |
| `change`       | `{ value, source }` | Emitted after the accepted model changes.                                                        |
| `invalid`      | `Event`             | Native constraint failure forwarded from the hidden `<select>`.                                  |
| `beforetoggle` | `CustomEvent`       | Cancellable; its detail carries `{ open, source }`.                                              |
| `toggle`       | `{ open, source }`  | Emitted after visibility changes.                                                                |
| `open`         | —                   | Popup opened.                                                                                    |
| `close`        | —                   | Popup closed.                                                                                    |

### Slots

| Slot      | Scope                          | Use                                                                              |
| --------- | ------------------------------ | -------------------------------------------------------------------------------- |
| default   | `{ values, selected, select }` | Place `Option` or `OptionGroup` items. `select(value, source?)` commits a value. |
| `value`   | `{ value, options }`           | Replace the trigger's value content.                                             |
| `option`  | `{ option, selected, active }` | Replace the content of a data-driven row.                                        |
| `arrow`   | —                              | Replace the dropdown icon.                                                       |
| `no-data` | —                              | Empty-list message; takes precedence over the locale message.                    |

Slotted options need unique string values and labels. A data-driven row keeps `option.label` as its accessible name, so keep `#option` content noninteractive. `#value` customizes non-searchable triggers; a searchable field renders text in its native input.

### Methods

| Member    | Signature    | Use                                                  |
| --------- | ------------ | ---------------------------------------------------- |
| `show()`  | `() => void` | Open the popup through the cancellable toggle path.  |
| `close()` | `() => void` | Close the popup through the cancellable toggle path. |
| `trigger` | Element      | The trigger button or search input.                  |
| `open`    | Model ref    | Exposed open state; prefer `v-model:open`.           |

## Styling

Set these project-defined custom properties on the Select root. The trigger shape maps to the System small corner by default; the focus and open colors map to System roles.

| Property                                | Description                                          |
| --------------------------------------- | ---------------------------------------------------- |
| `--yam3x-select-container-shape`        | Trigger corner radius.                               |
| `--yam3x-select-icon-size`              | Dropdown icon size.                                  |
| `--yam3x-select-disabled-color`         | Disabled trigger color before opacity is applied.    |
| `--yam3x-select-disabled-color-opacity` | Disabled trigger color opacity.                      |
| `--yam3x-select-panel-max-width`        | Maximum popup width; defaults to the viewport width. |

The accepted value keeps the on-surface text role while the popup is open; only the trailing arrow uses primary. The popup uses [Option styling](/components/option#styling) for its surface, rows, and status content.

## Material references

- [Chips guidelines](https://m3.material.io/components/chips/guidelines)
- [Menus guidelines](https://m3.material.io/components/menus/guidelines)

[Text fields overview](https://m3.material.io/components/text-fields/overview) · [Menus overview](https://m3.material.io/components/menus/overview)
