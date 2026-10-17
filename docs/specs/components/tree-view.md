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
- Project-defined: Keep the leading hierarchy and disclosure visible as width narrows. Allow horizontal overflow for deep trees rather than reducing label size or losing ancestry. A details view can expose long labels without a hover-only dependency.

### Navigation and selection

- Project-defined: Follow the [WAI tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) for node roles, expanded state, focus, direction-aware branch navigation, and type-ahead. Keep one tree entry in the page's Tab sequence and move internal focus among visible nodes.
- Project-defined: Focus, selection, and checkbox state are independent. Arrow navigation changes focus without silently selecting another business value. Activating a disclosure changes expansion; activating a selectable label changes selection.
- Project-defined: Collapsing a branch containing the focused node returns focus to that branch. Loading and load failure are local to the affected branch; a failed branch offers retry without clearing other selections or collapsing unrelated content.
- Project-defined: Branch checking, when offered, applies only to a complete known subtree and derives the parent's mixed state from that subtree. For incomplete or lazily loaded subtrees, use independent node checking unless the application supplies an explicit all-descendants selection contract. Do not imply that unloaded descendants were selected.
