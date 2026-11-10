<script setup lang="ts">
import CascaderBasicExample from './demos/CascaderBasicExample.vue'
import CascaderSearchExample from './demos/CascaderSearchExample.vue'
import CascaderExample from './demos/CascaderExample.vue'
</script>

# Cascader

Cascader is a project extension for choosing one path through a hierarchy. It shows each immediate child collection in a named list, keeps browsing separate from the accepted value, and switches to a single-level view in compact containers.

Material does not define a standalone Cascader component. The closest Compose Material 3 composition is a dialog containing listboxes, or nested menus; the path-selection and dialog semantics are project decisions. Use [TreeSelect](/components/tree-select) when the expanded hierarchy itself is the primary navigation model.

The component expects the complete currently known hierarchy. It does not define a loader, paging, or multiple-selection contract; supply new `options` when the application learns more records.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><CascaderBasicExample /></div>

Open the picker to browse immediate children level by level. Choosing a leaf accepts the path and closes the dialog; the accepted values are printed below the field. Search and clearing are enabled here.

::: details View demo source

<<< ./demos/CascaderBasicExample.vue{vue}

:::

### Search and branch paths

<div class="vp-raw yam3x-doc-demo-theme"><CascaderSearchExample /></div>

Search matches complete displayed paths, including repeated values in different branches. With `select-branches`, an intermediate path can be accepted explicitly through Select this path; browsing alone still does not commit it. Disabled branches and leaves cannot be accepted.

::: details View demo source

<<< ./demos/CascaderSearchExample.vue{vue}

:::

### Selection, layout, and states

<div class="vp-raw yam3x-doc-demo-theme"><CascaderExample /></div>

The controls mirror the picker, disable the field through a fieldset, allow branch confirmation, reject changes through the cancelable `beforeinput` event, and empty the catalog. The demo also shows an accepted path, a disabled leaf, and a disabled branch. Reset restores the initial accepted path.

::: details View demo source

<<< ./demos/CascaderExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component and the field wrapper from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Cascader, type CascaderOption } from './components/yam3x/cascader'
import { FormField } from './components/yam3x/form-field'

const value = ref<string[]>([])
const options: CascaderOption[] = [
  {
    value: 'product',
    label: 'Product',
    children: [
      { value: 'design', label: 'Design', children: [{ value: 'brief', label: 'Brief' }] },
    ],
  },
]
</script>

<template>
  <FormField label="Destination">
    <Cascader
      v-model="value"
      :options="options"
      label="Destination"
      name="destination"
      searchable
      required
    />
  </FormField>
</template>
```

`v-model` is an ordered array of values. An empty array means no selection. The trigger, dialog title, and visible level-2 popup heading use `label`; use FormField for a persistent field label and supporting text.

::: details Search, branch confirmation, and clear

```vue
<template>
  <Cascader
    v-model="value"
    v-model:query="query"
    v-model:open="open"
    :options="options"
    label="Destination"
    searchable
    select-branches
    clearable
  />
</template>
```

`select-branches` adds an explicit Select this path action and includes intermediate paths in search results. Browsing a branch never commits it. `clearable` adds a Clear action; a known disabled accepted path cannot be cleared through the UI.

:::

::: details Read the submitted path

```vue
<script setup lang="ts">
function onSubmit(event: SubmitEvent): void {
  const body = new FormData(event.currentTarget as HTMLFormElement)
  const raw = body.get('destination')
  const path = typeof raw === 'string' && raw ? JSON.parse(raw) : []
  console.log(path) // ["product","design","brief"]
}
</script>
```

The hidden native select submits the accepted path as a JSON array string. `separator` affects display only.

:::

## Behavior and accessibility

### Browsing and acceptance

- Opening seeds the draft from the valid prefix of the accepted path. Entering a branch opens its child choices without changing the field value.
- Replacing an ancestor drops its obsolete draft suffix; returning to the same ancestor preserves that draft. Leaves commit and close by default.
- With `select-branches`, confirm an intermediate draft explicitly using Select this path. Exploring a branch still does not commit it.
- Escape and Close discard browsing changes and preserve the accepted value.
- Each visible level is a named single-selection listbox. `aria-selected` identifies the current draft choice within that level, while DOM focus can move independently.
- Up and Down skip disabled options; Home and End reach list edges; typing a prefix finds an enabled label without accepting it. Type-ahead resets after 700ms or a navigation command.
- The expand-direction arrow enters a branch, and the opposite arrow moves to its parent level; these directions mirror in RTL. Enter or Space activates an option.
- Disabled ancestors block descendant acceptance. A value can occur in different branches, so `['east', 'shared']` and `['west', 'shared']` are different paths.

### Search and layout

- Search matches complete displayed paths using the resolved locale. Results are complete leaf paths by default; `select-branches` also offers intermediate paths.
- Changing query text or language does not change accepted values. Unknown accepted suffixes retain their raw values in the display and form value until the application removes them.
- On wide popup containers, adjacent level lists share available space and scroll horizontally when necessary. At 36rem or less of popup content width, only the active level is shown.
- The ancestor path and Back action remain visible in the compact layout, and keyboard navigation can still move between levels. Complete labels wrap within the current panel.

### Focus and dismissal

- The trigger is a select-only combobox opening a non-modal dialog. Initial focus goes to search, or to the current level when search is absent.
- Arrow Down from search enters the current list. Composition keys and modified text-editing shortcuts retain their native meaning.
- Escape or Close returns focus to the trigger; Tab and outside dismissal preserve their destinations. Background content remains interactive.

### Native forms

- A hidden native select submits the accepted path as a JSON array string, for example `["product","design","brief"]`. Parse the field value with `JSON.parse`; `separator` does not affect it.
- Empty selection uses the native missing-value state. Known disabled accepted paths follow native select rules and are omitted from `FormData`.
- Validation focuses the visible trigger. Native reset restores the initial accepted path and closes the popup.
- An enclosing disabled fieldset also disables the teleported picker and closes an open dialog.
- Option changes can reconcile the draft and its focus, but do not prune application-owned accepted paths. An accepted path that later becomes intermediate remains stored even when `select-branches` is false.
- Use Form for application-level validation when business rules require a currently resolvable terminal path.

### State ownership

`v-model` owns the accepted path, `v-model:open` owns dialog visibility, and `v-model:query` owns search text. The dialog's draft path and keyboard focus are internal and are discarded on dismissal. The application owns labels, record loading, and any business rule about whether a path is still valid.

## API

Built-in labels use [LocaleProvider](/components/localization)'s `cascader` namespace (`search`, `root`, `empty`, `noResults`, `choosePath`, `level(position, parent)`, `results(label)`). Footer navigation uses `actions`. Explicit locale and text props retain priority. Labels, values, and business formatting remain application-owned.

### Exports

| Export           | Kind      | Use                                                                                 |
| ---------------- | --------- | ----------------------------------------------------------------------------------- |
| `Cascader`       | Component | Path trigger, dialog, column navigation, and native form proxy.                     |
| `CascaderOption` | Type      | Hierarchy node with `value`, `label`, optional `disabled`, and optional `children`. |

### Props and models

| Prop / model              | Type                        | Default            | Description                                                                                                                           |
| ------------------------- | --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `readonly CascaderOption[]` | Required           | Complete known hierarchy. Values must be nonempty and unique within each immediate sibling collection; the hierarchy must be acyclic. |
| `label`                   | `string`                    | Required           | Trigger, dialog, and visible level-2 popup heading.                                                                                   |
| `modelValue` / `v-model`  | `string[]`                  | `[]`               | Accepted ordered path; an empty array means no selection.                                                                             |
| `open` / `v-model:open`   | `boolean`                   | `false`            | Dialog visibility. Disabled fields cannot open.                                                                                       |
| `query` / `v-model:query` | `string`                    | `''`               | Search text, independent of the accepted path; cleared on closing.                                                                    |
| `searchable`              | `boolean`                   | `false`            | Adds a native search input and full-path results.                                                                                     |
| `selectBranches`          | `boolean`                   | `false`            | Adds Select this path and includes intermediate paths in search results.                                                              |
| `clearable`               | `boolean`                   | `false`            | Adds a Clear action for removable accepted paths.                                                                                     |
| `separator`               | `string`                    | `' / '`            | Display separator only; form serialization always uses JSON.                                                                          |
| `id`                      | `string`                    | Generated          | Trigger ID.                                                                                                                           |
| `name`                    | `string`                    | —                  | Native form field name.                                                                                                               |
| `form`                    | `string`                    | —                  | Associates the native proxy with a form by id.                                                                                        |
| `required`                | `boolean`                   | `false`            | Requires an accepted path during native validation.                                                                                   |
| `disabled`                | `boolean`                   | `false`            | Disables the trigger, dialog, and selection.                                                                                          |
| `locale`                  | `string`                    | Provider → `en-US` | Language of built-in messages.                                                                                                        |
| `searchLabel`             | `string`                    | Localized          | Overrides the search field label.                                                                                                     |
| `noDataText`              | `string`                    | Localized          | Overrides the no-matching-results text.                                                                                               |
| `panelClass`              | `string`                    | `''`               | Class added to the popup surface.                                                                                                     |

### Events

| Event         | Payload                | Description                                                                                                                                  |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `beforeinput` | `Event`                | Cancelable; fires before leaf acceptance, explicit branch acceptance, search-result acceptance, and clearing. It does not fire for browsing. |
| `input`       | `{ values: string[] }` | Reports a selection proposal alongside the model update.                                                                                     |
| `change`      | `{ values: string[] }` | Reports an accepted selection change.                                                                                                        |
| `invalid`     | `Event`                | Forwards native validation failure.                                                                                                          |

Native `input` and `change` events also bubble from the form proxy after updates.

### Methods

Access these through a template ref.

| Member                 | Signature                          | Description                                                            |
| ---------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `show()`               | `() => void`                       | Opens the dialog when the field can change.                            |
| `close(restoreFocus?)` | `(restoreFocus?: boolean) => void` | Closes the dialog; pass `false` to keep the current focus destination. |
| `focus()`              | `() => void`                       | Focuses the trigger.                                                   |
| `trigger`              | `HTMLButtonElement \| undefined`   | Native trigger element.                                                |

::: details `CascaderOption` schema

| Field      | Type                        | Description                                                        |
| ---------- | --------------------------- | ------------------------------------------------------------------ |
| `value`    | `string`                    | Stable, nonempty identity within its immediate sibling collection. |
| `label`    | `string`                    | Visible and accessible option label.                               |
| `disabled` | `boolean`                   | Prevents acceptance and blocks descendants.                        |
| `children` | `readonly CascaderOption[]` | Immediate children; missing or empty children make a leaf.         |

:::

## Styling

Cascader exposes no public CSS custom properties. Use FormField for the outlined or filled field appearance and supporting text. The popup adopts OptionPanel and Option menu rows, including their rounded shapes, state layers, and press feedback.

The dialog supplies density-scaled 12px padding and resets the OptionPanel menu padding so row surfaces align with the title, search field, and footer. Its preferred minimum width is 640px, capped at 800px and the available viewport width. Level lists have a 192px flexible basis and a 280px height cap; the overall popup height is capped at 520px. Smaller available spaces lower these caps. Use `panelClass` for popup-specific styling; [Option](/components/option) owns the row styling contract.

## Material references

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Menus guidelines](https://m3.material.io/components/menus/guidelines)
