<script setup lang="ts">
import TreeViewSelectionExample from './demos/TreeViewSelectionExample.vue'
import TreeViewCheckingExample from './demos/TreeViewCheckingExample.vue'
import TreeViewLazyExample from './demos/TreeViewLazyExample.vue'
import TreeViewVirtualExample from './demos/TreeViewVirtualExample.vue'
</script>

# Tree view

`TreeView` is a project extension for hierarchical records with independent focus, expansion, selection, and optional checking. It follows the [WAI tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) and adopts Material 3 Expressive list hierarchy, typography, and state roles. Material does not define a standalone tree view component.

Compose Material 3 has no tree primitive. The nearest composition is `LazyColumn` with `ListItem`-like rows and a leading disclosure control; the project defines the tree semantics, keyboard model, lazy loading, and virtualization.

Use a tree when readers explore nested records in place. For a flat set of choices, use [Select](/components/select) or [List](/components/list); for records that are read rather than navigated, use [Descriptions](/components/descriptions).

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewSelectionExample /></div>

::: details View demo source

<<< ./demos/TreeViewSelectionExample.vue{vue}

:::

The tree has one focus entry and separate selection state. The controls expose disabled actions, modifier-free multiple selection, and RTL navigation while the expanded nodes, focus, and selected keys remain visible. Selecting a node does not expand it, and expanding a branch does not select it.

### Checking

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewCheckingExample /></div>

::: details View demo source

<<< ./demos/TreeViewCheckingExample.vue{vue}

:::

`check-mode="cascade"` derives parent checks from enabled descendants and leaves disabled records unchanged. Enable the inspection control to add selection beside checking: Enter or the label selects the inspected record, while Space or the named check control toggles the batch state. The two outcomes are printed below the tree.

### Branch loading

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewLazyExample /></div>

::: details View demo source

<<< ./demos/TreeViewLazyExample.vue{vue}

:::

`loadChildren` resolves branches marked with `hasChildren`. The demo lets you accept, fail, or cancel a request so the loading, failure, retry, and stale-result behavior stays observable. Loader-backed trees always check independently, even after a branch loads.

### Virtualization

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewVirtualExample /></div>

::: details View demo source

<<< ./demos/TreeViewVirtualExample.vue{vue}

:::

`virtual` keeps ten thousand records in the data while mounting the viewport, overscan, focused node, and ancestors. Navigation, checks, disabled records, and measurement use the complete tree. Collapse all, mirror the tree, or hide the leading records to inspect focus recovery and window changes.

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TreeView, type TreeViewKey, type TreeViewNode } from './components/yam3x/tree-view'

const nodes: TreeViewNode[] = [
  {
    key: 'documents',
    label: 'Documents',
    children: [
      { key: 'brief', label: 'Project brief', description: 'Updated today' },
      { key: 'notes', label: 'Team notes' },
    ],
  },
]
const expanded = ref<TreeViewKey[]>(['documents'])
const selected = ref<TreeViewKey[]>([])
</script>

<template>
  <TreeView
    v-model:expanded-keys="expanded"
    v-model:selected-keys="selected"
    label="Project documents"
    :nodes="nodes"
  />
</template>
```

Models are optional: without bindings the tree owns their local state. Bind both the value and update handler, normally with `v-model`, to control them. A rejected controlled expansion does not start a load. Values are stable node keys rather than visible indices. The component proposes fresh arrays and does not prune application-owned selection or check keys when records are removed.

::: details Checkable and lazily loaded records

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  TreeView,
  type TreeViewKey,
  type TreeViewLoader,
  type TreeViewNode,
} from './components/yam3x/tree-view'

const nodes: TreeViewNode[] = [
  { key: 'inbox', label: 'Inbox', children: [{ key: 'today', label: 'Today' }] },
  { key: 'archive', label: 'Archive', hasChildren: true },
]
const expanded = ref<TreeViewKey[]>([])
const checked = ref<TreeViewKey[]>([])
const loadChildren: TreeViewLoader = async (node, { signal }) => {
  const response = await fetch(`/api/records/${node.key}`, { signal })
  if (!response.ok) throw new Error(String(response.status))
  return (await response.json()) as TreeViewNode[]
}
</script>

<template>
  <TreeView
    v-model:expanded-keys="expanded"
    v-model:checked-keys="checked"
    check-mode="independent"
    label="Message records"
    :nodes="nodes"
    :load-children="loadChildren"
  />
</template>
```

A loader returns the complete immediate child collection. Supply `children` for known immediate children, or `hasChildren: true` with omitted children for an unresolved branch. A successful empty load turns that branch into a leaf.

:::

## Behavior and accessibility

### Navigation and focus

- The tree has one roving Tab entry. Up and Down move among visible nodes without changing values; Home and End move to the first or last visible node.
- The expand-direction arrow opens a closed branch or enters its first child; the opposite arrow collapses the branch or moves to its parent. Directions mirror in RTL.
- Enter activates a node and the label; Space selects in a single-selection tree or toggles modifier-free multiple selection.
- Type a prefix to focus matching visible labels. Repeating a character cycles matches. Prefixes reset after 700 ms or a navigation command. Composition events and modifier shortcuts are left to their owners.
- Collapsed descendants leave the focus sequence. If a focused descendant disappears, focus returns to the nearest visible ancestor or another available entry. External changes do not steal unrelated focus.
- Disabled nodes stay focusable for discovery and expose `aria-disabled`, but cannot change values. When no nodes are present, the named tree remains focusable and an Empty state explains the absence.

### Selection and checking

- Selection is independent of expansion. Single selection retains at most one key; multiple selection uses no modifier keys. `selectionMode` defaults to `single`, or to `none` when checking is enabled.
- Independent checking changes only the target key. Cascade checking toggles enabled checkable records in a complete static subtree, derives parent checked or mixed state from eligible descendants, and leaves unrelated and disabled keys unchanged.
- A parent key alone never implicitly selects newly added children. Incomplete static branches check independently. Supplying a loader keeps checks independent for the whole tree, even after a branch loads.
- Tree items expose their checked or mixed state. With separate inspection and batch membership, items expose `aria-selected`, separately named native check controls expose the batch state, Enter or the label selects, and Space checks. The check controls add no Tab stops.
- Native check controls are unnamed, submit no values, and native form reset preserves the accepted check model. Applications can reset all models explicitly or change the Vue `key` for a new record session. Keys from deleted records remain application-owned until pruned.

### Branch loading and recovery

- Only accepted, visible, expanded branches begin reads. The adapter owns transport, timeouts, parsing, and cancellation. Malformed node arrays or duplicate keys are rejected without replacing the tree.
- Each loader returns the complete immediate child collection, with further unresolved descendants represented as branches of their own.
- Failures remain beside the affected branch with an accessible retry action; other branches, selection, and checks remain usable.
- Collapse, removal, reload, and unmount request cancellation. Read adapters should honor the signal; obsolete results are ignored even if they settle later. A new read can supersede a canceled read because the adapter is a read operation.
- Loaded children are cached by stable node key across collapse and metadata replacement. Explicit `children` props take precedence. Removing a branch prunes its cache. Use `reload(key)` for a changed remote resource or a new Vue `key` for a different tree session.

### Virtualization

- `virtual` is opt-in. `true` uses an initial row estimate of 56 px and four extra rows on each side of the viewport; an object can override `estimateSize` and `overscan`. Import `VirtualListOptions` from the Tree view entry.
- Rows are measured rather than forced to a fixed height. `--yam3x-tree-view-virtual-max-height` caps the scrolling viewport at 400 px by default.
- The window contains expanded records in tree order and keeps the focused node and required ancestors mounted. Ancestors retain their labelled tree items and groups; each node reports its level and its position within the complete immediate sibling collection.
- Navigation, selection, cascading checks, disabled descendants, and loader caches use the complete data, including records outside the window. Virtualization does not load records or define a server paging contract.
- Data insertions and removals retain the first visible record and its row-relative offset. If that record disappears, the window starts at the next surviving record in the previous order, then the preceding survivor; a wholly replaced collection returns to the beginning. Explicit keyboard and search navigation takes priority.
- `focus(key)` accepts a visible logical node and returns `true` before mounting and focusing it on Vue's next render. A hidden or unknown key returns `false`. Collapsing or removing the focused node restores focus to a surviving ancestor, while unrelated external focus is preserved.
- Use the default mode when animated branch geometry is the priority. Window recycling and branch insertion or removal are immediate in virtual mode; row press feedback remains available.

### Forms and state ownership

The tree proposes array changes rather than mutating the supplied models. Without bindings it owns local expansion, selection, and check state; with bindings it renders the accepted arrays and pushes proposals through `update:*` events. When an update is rejected, the previous array remains accepted. Preserve the same stable keys across data updates, including loaded children.

### Responsive and RTL

- Labels wrap and grow; deep indentation and enlarged text use contained horizontal overflow instead of smaller labels. When the region overflows, the surrounding named region gains a separate Tab entry for horizontal keyboard scrolling while the tree keeps one roving entry.
- Row height starts at 56 px, follows the container density scale with a 48 px floor, and uses the spacing density scale for padding, indentation, and gaps. Disclosure, check, and focus targets stay at least 48 px.
- Branch and chevron motion mirror in RTL and honor reduced motion. Focus and selection remain visible in forced colors.

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                                                                                                 | Description                                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `TreeView`                                                                                             | The tree, its models, loading, and virtualization. |
| `TreeViewNode`, `TreeViewKey`, `TreeViewSelectionMode`, `TreeViewCheckMode`, `TreeViewCheckState`     | Node and model types.                              |
| `TreeViewLoader`, `TreeViewMessages`, `VirtualListOptions`                                            | Loader, message, and virtualization types.         |

### Props and models

| Prop or model   | Default                            | Use                                                                                                                                       |
| --------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `nodes`         | Required                           | Acyclic forest of `TreeViewNode` records with globally unique keys within this tree.                                                      |
| `virtual`       | `false`                            | `boolean \| VirtualListOptions`; measured windowing with optional `estimateSize` (56 px) and `overscan` (4 rows).                         |
| `label`         | Required                           | Visible Title Medium title and accessible tree name.                                                                                      |
| `description`   | Empty                              | Persistent explanation associated with the tree.                                                                                          |
| `expandedKeys`  | `[]`                               | Model for expanded branches.                                                                                                              |
| `selectedKeys`  | `[]`                               | Model for node selection; single selection uses at most one key.                                                                          |
| `checkedKeys`   | `[]`                               | Model for explicit checked records and derived complete-branch keys.                                                                      |
| `selectionMode` | `single`, or `none` when checking  | `none`, `single`, or modifier-free `multiple`.                                                                                            |
| `checkMode`     | `none`                             | `none`, `independent`, or `cascade`. Loader-backed trees always check independently.                                                      |
| `loadChildren`  | Undefined                          | `(node, { signal }) => Promise<readonly TreeViewNode[]>`; required for unresolved branches.                                               |
| `disabled`      | `false`                            | Prevents expansion, activation, selection, checking, retry, and new reads. Existing reads can finish; focus navigation remains available. |
| `locale`        | Provider → `en-US`                 | Locale-aware type-ahead and built-in English or Chinese text.                                                                             |
| `instructions`  | Built-in visible keyboard guidance | Custom text, or `false` to hide it when equivalent guidance is provided elsewhere.                                                        |
| `messages`      | Built-in text                      | Partial `TreeViewMessages` for labels, instructions, loading, failure, and empty states.                                                  |

### Events

| Event       | Payload                                                      | Use                                                                    |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `expand`    | `{ node, expanded, keys }`                                   | Reports an expansion proposal with the resulting keys.                 |
| `select`    | `{ node, keys }`                                             | Reports a selection proposal with the resulting keys.                  |
| `check`     | `{ node, keys }`                                             | Reports a checking proposal with the resulting keys.                   |
| `activate`  | `node`                                                       | Follows label activation or Enter.                                     |
| `load`      | `{ node, children }`                                         | Reports an accepted child result.                                      |
| `loadError` | `{ node, error }`                                            | Carries diagnostic failure details. Visible text uses generic recovery. |

### Slots

| Slot      | Scope                     | Use                                                                        |
| --------- | ------------------------- | -------------------------------------------------------------------------- |
| `leading` | `{ node, expanded }`      | Decorative leading media for a node; keep the full identity in `node.label`. |
| `empty`   | —                         | Replaces the default Empty state.                                          |

Avoid adding uncoordinated focusable controls inside decorative media.

### Methods

Access these through a template ref.

| Method       | Returns   | Use                                                                                     |
| ------------ | --------- | --------------------------------------------------------------------------------------- |
| `focus(key)` | `boolean` | Focuses a visible logical node; `true` when it is available or mounted on the next render. |
| `reload(key)`| `boolean` | Invalidates a loader-owned cache; `true` when the request applies.                       |

An expanded node reloads immediately; a collapsed node loads on its next expansion. Neither method invents missing nodes or changes selection.

### Node schema

| Field         | Type                          | Use                                                                   |
| ------------- | ----------------------------- | --------------------------------------------------------------------- |
| `key`         | `string \| number`            | Required stable identity; unique across the full tree.                |
| `label`       | `string`                      | Required visible name and accessible label.                           |
| `description` | `string`                      | Accessible description and supporting text.                           |
| `icon`        | `string`                      | Decorative icon name for the project's Icon component.                |
| `value`       | `unknown`                     | Opaque application data.                                              |
| `children`    | `readonly TreeViewNode[]`     | Known immediate children; an explicit empty array is a leaf.          |
| `hasChildren` | `boolean`                     | Marks an unresolved branch when `children` is omitted.                |
| `disabled`    | `boolean`                     | Applies to this node and its known descendants.                       |
| `selectable`  | `boolean`                     | Controls selection for this node only.                                |
| `checkable`   | `boolean`                     | Controls checking for this node only.                                 |

## Styling

`TreeView` exposes these public properties on the tree root. Row geometry, spacing, indentation, and type follow the Material system density, spacing, type, color, shape, elevation, and motion roles.

| Property                                  | Default                                  | Use                                      |
| ----------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `--yam3x-tree-view-virtual-max-height`    | `400px`                                  | Maximum height of the virtual viewport.  |
| `--yam3x-tree-view-label-min-width`       | `10rem`                                  | Minimum label width before overflow.     |
| `--yam3x-tree-view-row-shape`             | `--md-sys-shape-corner-medium` (12 px)   | Row, hover, selection, and focus shape.  |

Labels use Body Large, metadata and guidance Body Small, and the title Title Medium. Selected nodes use Secondary Container and On Secondary Container; focus has an independent visible outline. Expansion alone does not select a row. The shared row shape is a project design decision.

::: details Density and motion

- Row height starts at 56 px and follows `--md-sys-density-container-scale` with a 48 px floor.
- Rows use 16 px outer inline padding and 24 px additional indentation per level.
- Padding, indentation, and gaps follow `--md-sys-density-spacing-scale`.
- Branch expansion and collapse transition height and opacity; descendants leave the accessible and interactive tree as collapse begins.
- Enabled rows show a ripple on pointer, Enter, or Space press, fading after release or cancellation. Hover uses the shared 8% state layer; pressed feedback is the ripple only, without a second static fill. Feedback stays within the current row; disclosure and check controls retain their own feedback.
- Reduced motion removes spatial transitions while retaining visible state changes. Forced colors preserve focus and selection.

:::

## Material references

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [WAI-ARIA tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
