# Tree view: project extension guide

## Scope

This project extension presents hierarchical records such as files and folders, with branch expansion and node selection. It adopts a navigable tree, not a nested Menu or an automatic permission-inheritance editor. Material 3 Expressive does not define a standalone Tree view component. Apply the [shared foundations](../foundations.md).

## Design target

- Keep leading visuals, text, and secondary actions aligned to support scanning. Use the content hierarchy in [Lists guidelines: anatomy and alignment](https://m3.material.io/components/lists/guidelines) as a visual reference; tree semantics and indentation remain project-defined.
- Use typography and spacing together to distinguish content hierarchy. Emphasized counterparts may identify selected content where useful. See [Applying type](https://m3.material.io/styles/typography/applying-type) and [Type scale and tokens: emphasized styles](https://m3.material.io/styles/typography/type-scale-tokens).
- If selection uses checkboxes, retain the adopted [Checkbox](checkbox.md) appearance and distinguish mixed state from checked state. Expansion is not itself checkbox selection.

## Project decisions

### Anatomy and appearance

The following mappings are project-defined. A branch has a disclosure affordance, a label, and optional leading media; a leaf has no disclosure affordance. Use Body Large for the label and Body Small for optional metadata.

- Project-defined: Use a 56 px minimum row height, 16 px outer inline padding, and 24 px additional indentation per level. Rows grow with text and language height. Align leaf labels with branch labels at the same depth by reserving the disclosure space.
- Project-defined: Use On Surface labels and On Surface Variant metadata on the containing Surface. Selected nodes use Secondary Container, with both labels and metadata using On Secondary Container. Focus has a separate visible indicator; expanding a branch does not apply the selected treatment.
- Project-defined: Use the Medium corner role for node rows, keeping hover, selection, and the focus outline on the same rounded shape so state changes preserve row identity. Apply the shape to each row rather than its nested subtree.
- Project-defined: Keep the leading hierarchy and disclosure visible as width narrows. Allow horizontal overflow for deep trees rather than reducing label size or losing ancestry. A details view can expose long labels without a hover-only dependency.

### Navigation and selection

- `tree-view.focus.navigation` (project-defined): Follow the [WAI tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) for node roles, expanded state, focus, direction-aware branch navigation, and type-ahead. Keep one tree entry in the page's Tab sequence and move internal focus among visible nodes. Collapsing a branch containing the focused node returns focus to that branch; unrelated focus is preserved.
- `tree-view.selection.independent` (project-defined): Focus, selection, and checkbox state are independent. Arrow navigation changes focus without silently selecting another business value. Activating a disclosure changes expansion; activating a selectable label changes selection. Checking-only trees expose check state on tree items. When selection and checking serve distinct purposes, expose node selection and separately named check controls, and explain both meanings.
- `tree-view.load.recovery` (project-defined): Loading and load failure are local to the affected branch; a failed branch offers retry without clearing other selections or collapsing unrelated content. Collapsing or removing a loading branch requests cancellation, and obsolete reads cannot replace current children. Loading adapters return the complete immediate child collection; they do not define a partial-descendant selection contract.
- `tree-view.check.known` (project-defined): Branch checking, when offered, applies only to a complete known subtree and derives the parent's mixed state from that subtree. For incomplete or lazily loaded subtrees, use independent node checking unless the application supplies an explicit all-descendants selection contract. Do not imply that unloaded descendants were selected. Loader-backed trees retain independent checking after loading as well.
- Project-defined: Disabled nodes remain discoverable by focus, while expansion, selection, and checking are unavailable. Cascade changes leave disabled subtrees and their stored checks untouched. Non-checkable grouping nodes may contain checkable descendants.
- `tree-view.feedback.press` (project-defined): Each enabled node row has pointer and Enter/Space press feedback, clipped to its own rounded shape. Child nodes and nested controls do not activate an ancestor's feedback. Release and cancellation clear the held state. Use spatial motion for the ripple and branch geometry and effects motion for color and opacity, following [Motion physics system: spring tokens](https://m3.material.io/styles/motion/overview/how-it-works). Branch expansion explains the hierarchy without delaying keyboard navigation; collapsing content leaves the accessible and interactive tree immediately. Honor reduced motion without losing state feedback.
- Project-defined: Make the surrounding horizontal scroll region separately keyboard-focusable only when it overflows. This allows horizontal inspection without replacing the tree's branch-navigation arrow keys.
