<script setup lang="ts">
import TreeSelectBasicExample from './demos/TreeSelectBasicExample.vue'
import TreeSelectMultipleExample from './demos/TreeSelectMultipleExample.vue'
import TreeSelectExample from './demos/TreeSelectExample.vue'
</script>

# TreeSelect

TreeSelect is a project extension for choosing hierarchical records in a compact field. It combines a labelled dialog, Tree view navigation, optional search, and removable chips for multiple values.

Material 3 Expressive does not define TreeSelect. The closest Compose composition is `ExposedDropdownMenuBox` with a tree picker; no TreeSelect primitive exists. The field, tree, and chip treatments come from the project's [Form field](/components/form-field), [Tree view](/components/tree-view), and [Input chip](/components/chips) designs, while the dialog and selection behavior are project decisions.

Use it when records form a hierarchy and the field must stay compact. Use [Cascader](/components/cascader) when choosing one path through levels is the main task, and [Tree view](/components/tree-view) when the full tree should remain visible on the page.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectBasicExample /></div>

Open the dialog to search labels or browse the tree. Expanding a branch does not select it; Enter accepts a selectable record. The field keeps the accepted key and prints it below the demo.

::: details View demo source

<<< ./demos/TreeSelectBasicExample.vue{vue}

:::

### Multiple selection

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectMultipleExample /></div>

Multiple mode displays accepted records as Input chips. Removing a chip updates the model independently of expansion. The demo starts with an unknown key and a disabled accepted record: the unknown chip remains removable, while the disabled record stays stored and cannot be removed through the UI.

::: details View demo source

<<< ./demos/TreeSelectMultipleExample.vue{vue}

:::

### States, loading, and large catalogs

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectExample /></div>

The primary demo combines single and multiple fields, mirrored direction, fieldset disabling, rejected changes, a failing loader with retry, and a ten-thousand-record catalog with virtualization and a removable leading record. The accepted document is printed below the fields.

::: details View demo source

<<< ./demos/TreeSelectExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component and the field wrapper from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect, type TreeSelectNode } from './components/yam3x/tree-select'
import { FormField } from './components/yam3x/form-field'

const value = ref<string | string[] | null>(null)
const expanded = ref(['workspace'])
const nodes: TreeSelectNode[] = [
  {
    key: 'workspace',
    label: 'Workspace',
    selectable: false,
    children: [
      { key: 'brief', label: 'Brief' },
      { key: 'notes', label: 'Notes' },
    ],
  },
]
</script>

<template>
  <FormField label="Document">
    <TreeSelect
      v-model="value"
      v-model:expanded-keys="expanded"
      :nodes="nodes"
      label="Document"
      name="document"
      searchable
      required
    />
  </FormField>
</template>
```

Keys must be globally unique, nonempty strings. `selectable: false` keeps branch navigation but prevents acceptance in either mode. A disabled node also disables its descendants. An explicit empty `children` array is a leaf; `hasChildren: true` with omitted children requires a loader.

::: details Multiple values and chips

```vue
<template>
  <TreeSelect
    v-model="values"
    :nodes="nodes"
    label="Document collection"
    name="documents"
    multiple
    searchable
    clearable
  />
</template>
```

Binding an array enables independent multi-selection. Switching `multiple` normalizes the model to the corresponding shape. Chip removal and Clear use the same cancelable `beforeinput` path as tree acceptance.

:::

::: details Lazy branches and virtualization

```vue
<script setup lang="ts">
import {
  TreeSelect,
  type TreeSelectLoader,
  type TreeSelectNode,
} from './components/yam3x/tree-select'

const loadChildren: TreeSelectLoader = async (node, { signal }) => {
  const response = await fetch(`/api/records/${node.key}/children`, { signal })
  const rows = (await response.json()) as TreeSelectNode[]
  return rows
}
</script>

<template>
  <TreeSelect
    v-model="value"
    :nodes="nodes"
    :load-children="loadChildren"
    :virtual="{ estimateSize: 40, overscan: 6 }"
    label="Document"
  />
</template>
```

Loaders return complete immediate child collections, not server pages. Virtualization uses Tree view's measured window and does not imply record loading or paging.

:::

## Behavior and accessibility

### Dialog and selection

- The single-value trigger is a select-only combobox with a dialog popup; the multiple-value trigger is a button described by the accepted labels.
- Opening moves focus to search, or to the tree when search is absent. Arrow Down from search enters the tree.
- Tree view owns direction-aware navigation, type-ahead, and focus independently of selection. Enter accepts a selectable node; multiple mode also supports Space to toggle a key.
- Selecting a branch never selects its descendants. Single acceptance closes the popup; multiple acceptance keeps it open.
- Escape or Close dismisses the dialog and restores trigger focus. Escape preserves choices already accepted in multiple mode.
- Tab can leave the non-modal dialog and closes it without redirecting the destination. Outside pointer dismissal also preserves destination focus. Background content remains interactive.
- Composition Escape and Arrow Down events, and modified text-editing shortcuts, retain their text-input meaning.

### Search and loading

- Search matches labels using the resolved locale and shows matching records with their ancestors. It does not search unloaded descendants.
- Search expansion is temporary and independent of `expandedKeys`; changing language retains the query and existing search branch choices. Search never clears accepted values outside its result set.
- Loading follows [Tree view](/components/tree-view)'s retry, validation, and cancellation behavior. Closing the popup cancels its pending reads; obsolete results cannot populate the field.
- Accepted child collections are cached between openings. Replacing a source node object or supplying explicit children invalidates its loader cache.
- Loaders return complete immediate child collections, not server pages. `load` and `loadError` report accepted results and diagnostics.

### Forms

- A hidden native select owns accepted keys, name/form association, required validation, and submission. Multiple values submit as repeated field names.
- Validation focuses the visible trigger. Native form reset restores the initial accepted model and closes the popup.
- Disabling the component or an enclosing fieldset closes the popup and blocks selection.
- Unknown accepted keys retain their raw labels and removable chips. Disabled accepted keys remain stored and cannot be removed through the UI. Known disabled options follow native select submission rules and are omitted from `FormData`.
- Removing a chip moves focus to a surviving chip or the trigger. Expansion and business values remain application-owned.

### Large catalogs

`virtual` uses Tree view's measured window, including the focused row and required ancestors and groups. Filtering and labels use the complete known hierarchy, and only accepted values need native form proxy options. Import `VirtualListOptions` from the TreeSelect entry to configure the initial estimate and overscan.

Catalog updates follow [Tree view's viewport anchor policy](/components/tree-view#virtualization), preserving the reading position independently of accepted values.

### State ownership

`v-model` owns accepted keys, `v-model:expanded-keys` owns application expansion, `v-model:open` owns dialog visibility, and `v-model:query` owns search text. Search expansion is internal and temporary. The application owns record labels, loader data, and how accepted keys map to business values.

## API

Built-in search and empty text uses [LocaleProvider](/components/localization)'s `treeSelect` namespace (`search`, `empty`, `noResults`). Tree navigation, chips, and footer actions use the existing `treeView` and `actions` namespaces. Explicit locale and text props retain priority; record labels remain application-owned.

### Exports

| Export               | Kind      | Use                                                               |
| -------------------- | --------- | ----------------------------------------------------------------- |
| `TreeSelect`         | Component | Field trigger, dialog, tree picker, chips, and native form proxy. |
| `TreeSelectNode`     | Type      | Hierarchy record with a string key and Tree view fields.          |
| `TreeSelectLoader`   | Type      | Async loader for one node's immediate children.                   |
| `VirtualListOptions` | Type      | Windowing options for `virtual`.                                  |

### Props and models

| Prop / model                             | Type                            | Default            | Description                                                                                           |
| ---------------------------------------- | ------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `nodes`                                  | `readonly TreeSelectNode[]`     | Required           | Complete known hierarchy with globally unique, nonempty string keys.                                  |
| `label`                                  | `string`                        | Required           | Trigger name and visible tree title; also names the dialog.                                           |
| `modelValue` / `v-model`                 | `string \| string[] \| null`    | `null`             | One key, an array in multiple mode, or null for no value.                                             |
| `multiple`                               | `boolean`                       | `false`            | Independent multi-selection displayed as removable Input chips.                                       |
| `open` / `v-model:open`                  | `boolean`                       | `false`            | Dialog visibility. Disabled fields cannot open.                                                       |
| `expandedKeys` / `v-model:expanded-keys` | `string[]`                      | `[]`               | Application expansion outside search. Supply ancestor keys to reveal a selected descendant initially. |
| `searchable`                             | `boolean`                       | `false`            | Adds a native search input inside the popup.                                                          |
| `query` / `v-model:query`                | `string`                        | `''`               | Search text, separate from accepted keys; cleared when the popup closes.                              |
| `clearable`                              | `boolean`                       | `false`            | Adds a Clear action for removable selections; disabled values remain stored.                          |
| `loadChildren`                           | `TreeSelectLoader`              | —                  | Loads immediate children for a node.                                                                  |
| `virtual`                                | `boolean \| VirtualListOptions` | `false`            | Delegates measured windowing to Tree view.                                                            |
| `id`                                     | `string`                        | Generated          | Trigger ID.                                                                                           |
| `name`                                   | `string`                        | —                  | Native form field name.                                                                               |
| `form`                                   | `string`                        | —                  | Associates the native proxy with a form by id.                                                        |
| `required`                               | `boolean`                       | `false`            | Requires an accepted key during native validation.                                                    |
| `disabled`                               | `boolean`                       | `false`            | Disables the field and closes the popup.                                                              |
| `locale`                                 | `string`                        | Provider → `en-US` | Language of built-in messages.                                                                        |
| `searchLabel`                            | `string`                        | Localized          | Overrides the search field label.                                                                     |
| `noDataText`                             | `string`                        | Localized          | Overrides the no-matching-results text.                                                               |
| `panelClass`                             | `string`                        | `''`               | Class added to the popup surface.                                                                     |

### Events

| Event         | Payload                | Description                                                           |
| ------------- | ---------------------- | --------------------------------------------------------------------- |
| `beforeinput` | `Event`                | Cancelable; fires before tree acceptance, chip removal, and clearing. |
| `input`       | `{ values: string[] }` | Reports a selection proposal alongside the model update.              |
| `change`      | `{ values: string[] }` | Reports an accepted selection change.                                 |
| `invalid`     | `Event`                | Forwards native validation failure.                                   |
| `load`        | `{ node, children }`   | Reports an accepted loader result.                                    |
| `loadError`   | `{ node, error }`      | Carries diagnostics while the tree shows generic recovery text.       |

Native `input` and `change` events also bubble from the form proxy after updates.

### Slots

| Slot      | Props                | Description                                                                            |
| --------- | -------------------- | -------------------------------------------------------------------------------------- |
| `leading` | `{ node, expanded }` | Adds decorative content before a tree row. Keep interactive controls out of this slot. |

### Methods

Access these through a template ref.

| Member                 | Signature                          | Description                                                            |
| ---------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `show()`               | `() => void`                       | Opens the dialog and focuses search or the tree.                       |
| `close(restoreFocus?)` | `(restoreFocus?: boolean) => void` | Closes the dialog; pass `false` to keep the current focus destination. |
| `focus()`              | `() => void`                       | Focuses the trigger.                                                   |
| `trigger`              | `HTMLButtonElement \| undefined`   | Native trigger element.                                                |

::: details `TreeSelectNode` schema

| Field         | Type                        | Description                                              |
| ------------- | --------------------------- | -------------------------------------------------------- |
| `key`         | `string`                    | Required globally unique, nonempty record identity.      |
| `label`       | `string`                    | Visible and accessible record label.                     |
| `description` | `string`                    | Optional secondary text.                                 |
| `icon`        | `string`                    | Optional icon name forwarded to Tree view.               |
| `value`       | `unknown`                   | Application metadata; it does not affect selection.      |
| `disabled`    | `boolean`                   | Disables the node and its descendants.                   |
| `selectable`  | `boolean`                   | `false` keeps branch navigation but prevents acceptance. |
| `children`    | `readonly TreeSelectNode[]` | Immediate children; an explicit empty array is a leaf.   |
| `hasChildren` | `boolean`                   | `true` with omitted children requires a loader.          |

:::

## Styling

Use FormField for the outlined or filled field appearance and supporting text. The popup reuses OptionPanel's surface and Tree view's rounded rows, state layers, focus indicator, and press feedback. It supplies density-scaled 12px padding and section gaps, resets the OptionPanel menu padding so the search field, tree, and footer share one content edge, and keeps the multiple-selection disclosure at a 48x48px target.

Popup width follows the field with a 400px minimum when space permits, capped at 640px and the viewport. Its height is capped at 480px with a 280px tree scroll area; small viewports can lower these caps. Use `panelClass` for popup-specific styles. [Tree view](/components/tree-view) and [Input chip](/components/chips) own their component styling contracts.

| Property                              | Default                   | Description                                                     |
| ------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| `--yam3x-tree-select-container-shape` | System extra-small corner | Field container corner radius.                                  |
| `--yam3x-tree-select-tree-max-height` | `280px`                   | Maximum height of the tree scroll area, before viewport limits. |

## Material references

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Chips guidelines](https://m3.material.io/components/chips/guidelines)
