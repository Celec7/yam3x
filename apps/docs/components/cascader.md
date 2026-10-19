<script setup lang="ts">
import CascaderExample from './demos/CascaderExample.vue'
</script>

# Cascader

Cascader is a project extension for choosing one path through a hierarchy. It shows immediate child choices in named lists, keeps browsing separate from accepted values, and adapts to a single-level view in compact containers. Material does not define a standalone Cascader component.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><CascaderExample /></div>

::: details View demo source

<<< ./demos/CascaderExample.vue{vue}

:::

## Use in your app

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

## API

| Prop or model                                | Default                 | Description                                                                                                                                    |
| -------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                                    | Required                | Readonly `CascaderOption[]`. Values must be non-empty strings, unique within each immediate sibling collection; the hierarchy must be acyclic. |
| `label`                                      | Required                | Trigger, dialog, and visible popup title. Use FormField for a persistent field label.                                                          |
| `modelValue`, `v-model`                      | `[]`                    | Accepted ordered string path. An empty array means no selection.                                                                               |
| `open`, `v-model:open`                       | `false`                 | Popup state; disabled fields cannot open.                                                                                                      |
| `searchable`                                 | `false`                 | Adds a native search input and full-path results.                                                                                              |
| `query`, `v-model:query`                     | `''`                    | Search text, independent of the accepted path; cleared on closing.                                                                             |
| `selectBranches`                             | `false`                 | Adds an explicit Select this path action and includes intermediate paths in search results. Exploring a branch still does not commit it.       |
| `clearable`                                  | `false`                 | Adds a Clear action; known disabled accepted paths cannot be cleared through the UI.                                                           |
| `separator`                                  | `' / '`                 | Display separator only; form serialization always uses JSON.                                                                                   |
| `id`, `name`, `form`, `required`, `disabled` | Native defaults         | Explicit trigger ID, native form association, accepted-value validity, and disabling.                                                          |
| `locale`                                     | Inherited, then `en-US` | Built-in message language through LocaleProvider.                                                                                              |
| `searchLabel`, `noDataText`                  | Localized               | Override the search label and no-matching-results text.                                                                                        |
| `panelClass`                                 | `''`                    | Class added to the popup surface.                                                                                                              |

`CascaderOption` contains `value`, `label`, optional `disabled`, and optional readonly `children`. Missing or empty children make a leaf. A value can occur in different branches: `['east', 'shared']` and `['west', 'shared']` are different paths. Supply the complete currently known hierarchy; Cascader does not define a loader or paging contract.

`beforeinput(event)` is cancelable for leaf acceptance, explicit branch acceptance, search-result acceptance, and clearing. It does not fire for browsing. `input({ values })` and `change({ values })` report selection proposals alongside model updates. Native input/change events bubble from the form proxy after updates. `invalid(event)` forwards native validation failure. Component refs expose `show()`, `close(restoreFocus = true)`, `focus()`, and the native `trigger` element.

Built-in labels use [LocaleProvider](/components/localization)'s `cascader` namespace (`search`, `root`, `empty`, `noResults`, `choosePath`, `level(position, parent)`, `results(label)`). Footer navigation uses `actions`. Explicit locale and text props retain priority. Labels, values, and business formatting remain application-owned.

## Behavior and accessibility

### Browsing and acceptance

Opening seeds the draft from the valid prefix of the accepted path. Entering a branch opens its child choices without changing the field value. Replacing an ancestor drops its obsolete draft suffix; returning to the same ancestor preserves that draft. Leaves commit and close by default. With `selectBranches`, confirm an intermediate draft explicitly using Select this path. Escape and Close discard browsing changes and preserve the accepted value.

Each visible level is a named single-selection listbox. `aria-selected` identifies the current draft choice within that level, while DOM focus can move independently. Up/Down skip disabled options, Home/End reach list edges, and typing a prefix finds an enabled label without accepting it. The expand-direction arrow enters a branch, and the opposite arrow moves to its parent level; these directions mirror in RTL. Enter or Space activates an option. Type-ahead resets after 700ms or a navigation command. Disabled ancestors block descendant acceptance.

### Search, layout, and focus

Search matches complete displayed paths using the resolved locale. Results are complete leaf paths by default; `selectBranches` also offers intermediate paths. Changing query text or language does not change accepted values. Unknown accepted suffixes retain their raw values in the display and form value until the application removes them.

The trigger is a select-only combobox opening a non-modal dialog. Initial focus goes to search, or to the current level when search is absent. Arrow Down from search enters the current list. Composition keys and modified text-editing shortcuts retain their native meaning. Escape or Close returns focus to the trigger; Tab and outside dismissal preserve their destinations. Background content remains interactive.

On wide popup containers, adjacent level lists share available space and scroll horizontally when necessary. At 36rem or less of popup content width, only the active level is shown. The ancestor path and Back action remain visible, and keyboard navigation can still move between levels. Complete labels wrap within the current panel.

### Native forms

A hidden native select submits the accepted path as a JSON array string, for example `["product","design","brief"]`. Parse the field value with `JSON.parse`; `separator` does not affect it. Empty selection uses the native missing-value state. Known disabled accepted paths follow native select rules and are omitted from FormData. Validation focuses the visible trigger. Native reset restores the initial accepted path and closes the popup. An enclosing disabled fieldset also disables the teleported picker.

Option changes can reconcile the draft and its focus, but do not prune application-owned accepted paths. An accepted path that later becomes intermediate remains stored even when `selectBranches` is false. Use Form for application-level validation when business rules require a currently resolvable terminal path.

## Styling

Use FormField for outlined/filled field appearance and supporting text. The popup adopts OptionPanel and Option menu rows, with their rounded shapes, state layers, and press feedback. Its preferred minimum width is 640px, capped at 800px and the available viewport width. Lists have a 192px flexible basis and a 280px height cap; the overall popup height is capped at 520px. Smaller available spaces can lower these caps. Use `panelClass` for popup-specific styling; [Option](/components/option) owns the row styling contract.

## Material references

- [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines)
- [Lists guidelines](https://m3.material.io/components/lists/guidelines)
- [Menus guidelines](https://m3.material.io/components/menus/guidelines)
