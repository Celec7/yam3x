<script setup lang="ts">
import TreeSelectExample from './demos/TreeSelectExample.vue'
</script>

# TreeSelect

TreeSelect is a project extension for choosing hierarchical records in a compact field. It combines a labelled dialog, Tree view navigation, optional search, and removable chips for multiple values. Material does not define a standalone TreeSelect component.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectExample /></div>

::: details View demo source

<<< ./demos/TreeSelectExample.vue{vue}

:::

## Use in your app

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

## API

| Prop or model                                | Default                 | Description                                                                                                                       |
| -------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `nodes`                                      | Required                | Readonly `TreeSelectNode[]` with globally unique, non-empty string keys.                                                          |
| `label`                                      | Required                | Trigger name and visible tree title; also names the dialog. Use FormField for the persistent field label.                         |
| `modelValue`, `v-model`                      | `null`                  | One string key, an array in multiple mode, or null for no value.                                                                  |
| `multiple`                                   | `false`                 | Independent multi-selection, displayed as removable Input chips. Switching modes normalizes the model to the corresponding shape. |
| `open`, `v-model:open`                       | `false`                 | Popup state. Disabled fields cannot open.                                                                                         |
| `expandedKeys`, `v-model:expanded-keys`      | `[]`                    | Application expansion state outside search. Supply ancestor keys to reveal a selected descendant initially.                       |
| `searchable`                                 | `false`                 | Adds a native search input inside the popup.                                                                                      |
| `query`, `v-model:query`                     | `''`                    | Search text, separate from accepted keys; cleared when the popup closes.                                                          |
| `clearable`                                  | `false`                 | Adds a Clear action for removable selections; disabled values remain stored.                                                      |
| `loadChildren`                               | —                       | `TreeSelectLoader`: `(node, { signal }) => Promise<readonly TreeSelectNode[]>`.                                                   |
| `virtual`                                    | `false`                 | `boolean \| VirtualListOptions`; delegates measured windowing to Tree view.                                                       |
| `id`, `name`, `form`, `required`, `disabled` | Native defaults         | Explicit trigger ID, native form association, accepted-value validity, and disabling.                                             |
| `locale`                                     | Inherited, then `en-US` | Built-in message language through LocaleProvider.                                                                                 |
| `searchLabel`, `noDataText`                  | Localized               | Override the search label and no-matching-results text.                                                                           |
| `panelClass`                                 | `''`                    | Class added to the popup surface.                                                                                                 |

`TreeSelectNode` has `key`, `label`, optional `description`, `icon`, `value` (application metadata), `disabled`, `selectable`, `children`, and `hasChildren`. `selectable: false` preserves branch navigation while preventing acceptance in either mode. Disabled state applies to descendants. An explicit empty child array is a leaf; `hasChildren: true` with omitted children requires a loader. Keys must be strings, unlike the broader Tree view key type, so native form values have an unambiguous identity.

The optional `#leading="{ node, expanded }"` slot supplies decorative content; keep interactive controls out of this slot. Component refs expose `show()`, `close(restoreFocus = true)`, `focus()`, and the native `trigger` element.

`beforeinput(event)` is cancelable for tree acceptance, chip removal, and clearing. Call `preventDefault()` to retain accepted values. `input({ values })` and `change({ values })` report selection proposals alongside model updates. Native input/change events bubble from the form proxy after updates. `invalid(event)` forwards native validation failure. `load({ node, children })` reports accepted loader results; `loadError({ node, error })` carries diagnostics while the tree shows generic recovery text.

Built-in search and empty text uses [LocaleProvider](/components/localization)'s `treeSelect` namespace (`search`, `empty`, `noResults`). Tree navigation, chips, and footer actions use the existing `treeView` and `actions` namespaces. Explicit locale and text props retain priority; record labels remain application-owned.

## Behavior and accessibility

### Dialog and selection

The single-value trigger is a select-only combobox with a dialog popup; the multiple-value trigger is a button described by the accepted labels. Opening moves focus to search, or to the tree when search is absent. Arrow Down from search enters the tree. Tree view owns direction-aware navigation, type-ahead, and focus independently of selection. Enter accepts a selectable node; multiple mode also supports Space to toggle a key. Selecting a branch never selects its descendants.

Single acceptance closes the popup; multiple acceptance keeps it open. Escape or Close dismisses it and restores trigger focus. Escape preserves choices already accepted in multiple mode. Tab can leave the non-modal dialog and closes it without redirecting the destination. Outside pointer dismissal also preserves destination focus. Background content remains interactive. Composition Escape/Arrow Down events and modified text-editing shortcuts retain their text-input meaning.

Unknown accepted keys retain their raw labels and removable chips. Disabled accepted keys remain stored and cannot be removed through the UI. Known disabled options follow native select submission rules and are omitted from FormData. Removing a chip moves focus to a surviving chip or the trigger.

### Search and loading

Search matches labels using the resolved locale and shows matching records with their ancestors. It does not search unloaded descendants. Search expansion is temporary, independent of `expandedKeys`; changing language retains the query and existing search branch choices. Search never clears accepted values outside its result set.

Loading follows [Tree view](/components/tree-view)'s retry, validation, and cancellation behavior. Closing the popup cancels its pending reads; obsolete results cannot populate the field. Accepted child collections are cached between openings. Replacing a source node object or supplying explicit children invalidates its loader cache. Loaders return complete immediate child collections, not server pages.

### Forms and large catalogs

A hidden native select owns accepted keys, name/form association, required validation, and submission. Multiple values submit as repeated field names. Validation focuses the visible trigger; native form reset restores the initial accepted model and closes the popup. Disabling the component or an enclosing fieldset closes the popup and blocks selection. Expansion and business values remain application-owned.

`virtual` uses Tree view's measured window, including the focused row and required ancestors/groups. Filtering and labels use the complete known hierarchy, and only accepted values need native form proxy options. Import `VirtualListOptions` from the TreeSelect entry to configure the initial estimate and overscan. No record loading or paging is implied by virtualization.

Catalog updates follow [Tree view's viewport anchor policy](/components/tree-view#virtualization), preserving the reading position independently of accepted values.

## Styling

Use FormField for outlined/filled field appearance and supporting text. The popup reuses OptionPanel's surface and Tree view's rounded rows, state layers, focus indicator, and press feedback. Popup width follows the field with a 400px minimum when space permits, capped at 640px and the viewport; its height is capped at 480px with a 280px tree scroll area. In small viewports, available space can lower these caps. Use `panelClass` for popup-specific styles; [Tree view](/components/tree-view) and [Input chips](/components/chips) own their component styling contracts.

## Material references

- [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines)
- [Lists guidelines](https://m3.material.io/components/lists/guidelines)
- [Chips guidelines](https://m3.material.io/components/chips/guidelines)
