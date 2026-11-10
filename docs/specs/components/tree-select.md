# TreeSelect: project extension guide

## Scope

TreeSelect selects values from hierarchical records in a compact form field. Material 3 Expressive does not define TreeSelect. Compose the adopted [Text field](form-field.md), [Tree view](tree-view.md), and [Input chip](input-chip.md) designs, preserving the difference between expanding a branch and accepting a value. The closest Compose composition is `ExposedDropdownMenuBox` with a tree picker; no TreeSelect primitive exists.

## Design target

- Keep a persistent field label and distinguish selected content from supporting information, following [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines).
- Keep leading content and labels aligned for scanning, using [Lists guidelines: anatomy and alignment](https://m3.material.io/components/lists/guidelines). Tree indentation and disclosure remain project decisions.
- Represent removable multiple selections with the adopted Input chip treatment, following [Chips guidelines](https://m3.material.io/components/chips/guidelines). Keep removal separate from opening or navigating the hierarchy.

## Project decisions

The following are project decisions.

- `tree-select.selection.independent`: The field accepts stable record keys, independently of branch expansion and search text. Single selection accepts one key; multiple selection toggles independent keys. Selecting a parent does not silently select its descendants. Preserve accepted unknown keys until the application removes them.
- `tree-select.dialog.focus`: Open a labelled dialog containing the hierarchical picker, with a search field when searching is enabled. Move focus into the dialog on opening, support Escape without altering accepted values, and restore trigger focus on dismissal. Outside dismissal does not steal focus from its destination. Follow the [combobox dialog popup pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and the adopted Tree view navigation within the popup.
- `tree-select.search.ancestry`: Search reveals matching records and their ancestry. Keep search independent of accepted values and the application's expansion state. Never infer selections from filtered-out or unloaded records.
- `tree-select.form.native`: Native form submission, required validation, disabled fields, and reset apply to accepted keys. Optional measured windowing follows Tree view's focus and ancestor preservation rules. Built-in control and status text uses shared localization; record labels remain application-owned.
- `tree-select.load.recovery`: Reuse Tree view's branch-local loading, retry, and cancellation contract. Retain accepted child collections between popup openings, discard caches when their source node is replaced, and never accept late results from a closed or removed tree. Labels for accepted loaded records remain available while the popup is closed.
- `tree-select.virtual.catalog`: Allow measured windowing through the adopted Tree view design. Keep complete hierarchy metadata and accepted values independently of mounted rows; selected native form proxies need not duplicate the full hierarchy.
- `tree-select.popup.geometry`: Use a 400px preferred minimum width, a 640px maximum, and a 480px height cap, all reduced by available space. Give the dialog 12px density-scaled padding and section gaps, reset the adopted menu panel padding so its content aligns, and cap the Tree view scroller at 280px. Keep the multiple-selection disclosure at a 48x48px target.

The [shared virtual-window decisions](../virtual-windows.md) own viewport coverage, measured-height anchoring, catalog-change recovery, and navigation priority.
