<script setup lang="ts">
import TreeViewExample from './demos/TreeViewExample.vue'
</script>

# Tree view

`TreeView` is a project extension for hierarchical records, with independent focus, expansion, selection, and optional checking. It follows the Web tree pattern and adopts Material 3 Expressive list hierarchy and type roles; Material does not define a standalone Tree view component.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewExample /></div>

::: details View demo source

<<< ./demos/TreeViewExample.vue{vue}

:::

## Use in your app

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

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.

| Prop or model   | Default                            | Use                                                                                                                                       |
| --------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `nodes`         | Required                           | Acyclic forest of `TreeViewNode` records with globally unique keys within this tree.                                                      |
| `label`         | Required                           | Visible Title Medium title and accessible tree name.                                                                                      |
| `description`   | Empty                              | Persistent explanation associated with the tree.                                                                                          |
| `expandedKeys`  | `[]`                               | Model for expanded branches.                                                                                                              |
| `selectedKeys`  | `[]`                               | Model for node selection; single selection uses at most one key.                                                                          |
| `checkedKeys`   | `[]`                               | Model for explicit checked records and derived complete-branch keys.                                                                      |
| `selectionMode` | `single`, or `none` when checking  | `none`, `single`, or modifier-free `multiple`.                                                                                            |
| `checkMode`     | `none`                             | `none`, `independent`, or `cascade`. Loader-backed trees always check independently.                                                      |
| `loadChildren`  | None                               | `(node, { signal }) => Promise<readonly TreeViewNode[]>`; required for unresolved branches.                                               |
| `disabled`      | `false`                            | Prevents expansion, activation, selection, checking, retry, and new reads. Existing reads can finish; focus navigation remains available. |
| `locale`        | Provider → `en-US`                 | Locale-aware type-ahead and built-in English/Chinese text.                                                                                |
| `instructions`  | Built-in visible keyboard guidance | Custom text, or false to hide it when equivalent guidance is provided elsewhere.                                                          |
| `messages`      | Built-in text                      | Partial `TreeViewMessages` for labels, instructions, loading, failure, and empty states.                                                  |

A node has required `key: string \| number` and `label`, plus optional `description`, `icon`, opaque `value`, `children`, `hasChildren`, `disabled`, `selectable`, and `checkable`. Keys identify the same record across updates and must be unique across the full tree, including loaded children. Description is exposed as the tree item's accessible description. An icon is decorative and uses the project's Icon component.

Supply `children` for known immediate children. An explicit empty array is a leaf. Use `hasChildren: true` with omitted children for an unresolved branch. Successful empty loads turn that branch into a leaf. Disabled state applies to a node's known descendants, while `selectable: false` and `checkable: false` affect that node's respective action.

Events: `expand({ node, expanded, keys })`, `select({ node, keys })`, and `check({ node, keys })` report proposals alongside their model updates. `activate(node)` follows label activation or Enter. `load({ node, children })` reports an accepted child result. `loadError({ node, error })` carries diagnostic failure details; the visible error uses generic recovery text rather than the raw exception.

Component refs expose `focus(key)`, which returns whether a visible node could be focused, and `reload(key)`, which invalidates a loader-owned cache and returns whether the request was applicable. An expanded node reloads immediately; a collapsed node loads on its next expansion. Neither method invents missing nodes or changes selection.

`#leading="{ node, expanded }"` supplies decorative leading media; preserve the full identity in `node.label`. `#empty` replaces the default Empty state. Avoid adding uncoordinated focusable controls inside decorative media.

## Behavior and accessibility

### Navigation and selection

Tree navigation follows the [WAI tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

The tree has one roving Tab entry. Up/Down move among visible nodes without changing values; Home/End move to the first/last visible node. The expand-direction arrow opens a closed branch or enters its first child; the opposite arrow collapses it or moves to its parent. Directions mirror in RTL. A failed open branch retries with the expand-direction arrow. Enter activates a node; Space selects in a single-selection tree or toggles modifier-free multiple selection. Type a prefix to focus matching visible labels; repeating a character cycles matches. Prefixes reset after 700 ms or a navigation command. Composition events and modifier shortcuts are left to their owners.

Collapsed descendants leave the focus sequence. If a focused descendant disappears, focus returns to the nearest visible ancestor or another available entry. External changes do not steal unrelated focus. Disabled nodes stay focusable for discovery and expose `aria-disabled`, but cannot change values. When no nodes are present, the named tree remains focusable and an Empty state explains the absence.

### Checking

Independent checking changes only the target key. Cascade checking toggles enabled checkable records in a complete static subtree, derives parent checks/mixed state from eligible descendants, and leaves unrelated and disabled keys unchanged. A parent key alone never implicitly selects newly added children. Incomplete static branches check independently. Supplying a loader keeps checks independent for the whole tree, even after a branch has loaded, so expanding a checked branch cannot select unseen records.

Checking defaults to `selectionMode="none"`. Tree items expose their checked or mixed state, and Enter/Space or the label can toggle checks. To offer separate inspection and batch membership, explicitly enable selection and provide a description explaining the meanings. In that combination, tree items expose `aria-selected`, separately named native check controls expose the batch state, Enter/label selects, and Space checks. The check controls do not add Tab stops. The demo's combined mode shows this distinction.

Native check controls are unnamed; they do not submit values, and form reset preserves the accepted check model. Applications can reset all models explicitly or change the Vue `key` for a new record session. Keys from deleted records remain application-owned until pruned.

Enabled rows show a ripple on pointer, Enter, or Space press, fading after release or cancellation. Feedback stays within the current row; disclosure and check controls retain their own feedback. Branch expansion and collapse transition height and opacity; descendants leave the accessible and interactive tree as collapse begins. Reduced motion removes spatial transitions while retaining visible state changes.

### Branch loading and recovery

Only accepted, visible expanded branches begin reads. Each loader returns the complete immediate child collection, with further unresolved descendants represented as branches of their own. The adapter owns transport, timeouts, and parsing; malformed node arrays or duplicate keys are rejected without replacing the tree. Failures remain beside the affected branch, with an accessible retry action. Other branches, selection, and checks remain usable.

Collapse, removal, reload, and unmount request cancellation. Read adapters should honor the signal; obsolete results are ignored even if they settle later. A new read can supersede a canceled read because the adapter is a read operation. Do not use it for mutations that require serialized execution or server rollback guarantees.

Loaded children are cached by stable node key across collapse and metadata replacement. Explicit `children` props take precedence. Removing a branch prunes its cache; use `reload` for a changed remote resource, or a new Vue `key` when loading a different tree session. A loader function change does not itself clear cached data.

## Styling

Labels use Body Large, metadata and guidance Body Small, and the title Title Medium. Rows start at 56 px, with 16 px outer inline padding and 24 px indentation per level; text can wrap and grow. Selected nodes use Secondary Container/On Secondary Container, and focus has an independent visible outline. Expansion alone does not select a row.

Rows use the Medium corner role (12 px by default), shared by hover, selection, and the focus outline. This mapping is a project design decision. Override it with `--yam3x-tree-view-row-shape`; its default is `--md-sys-shape-corner-medium`.

The `--yam3x-tree-view-label-min-width` override defaults to `10rem`. Deep indentation and enlarged text use contained horizontal overflow instead of smaller labels. When overflowing, the surrounding named region gains a separate Tab entry for horizontal keyboard scrolling; the tree itself still has one roving entry. Chevron motion honors reduced motion, and focus and selection remain visible in forced colors.

## Material references

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type)
