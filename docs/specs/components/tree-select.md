# TreeSelect: project extension guide

## Scope

TreeSelect selects values from hierarchical records in a compact form field. Material 3 Expressive does not define TreeSelect. Compose the adopted [Text field](form-field.md), [Tree view](tree-view.md), and [Input chip](input-chip.md) designs, preserving the difference between expanding a branch and accepting a value.

## Design target

- Keep a persistent field label and distinguish selected content from supporting information, following [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines).
- Keep leading content and labels aligned for scanning, using [Lists guidelines: anatomy and alignment](https://m3.material.io/components/lists/guidelines). Tree indentation and disclosure remain project decisions.
- Represent removable multiple selections with the adopted Input chip treatment, following [Chips guidelines](https://m3.material.io/components/chips/guidelines). Keep removal separate from opening or navigating the hierarchy.

## Project decisions

- Project-defined: The field accepts stable record keys, independently of branch expansion and search text. Single selection accepts one key; multiple selection toggles independent keys. Selecting a parent does not silently select its descendants. Preserve accepted unknown keys until the application removes them.
- Project-defined: Open a labelled dialog containing the hierarchical picker, with a search field when searching is enabled. Move focus into the dialog on opening, support Escape without altering accepted values, and restore trigger focus on dismissal. Outside dismissal does not steal focus from its destination. Follow the [combobox dialog popup pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and the adopted Tree view navigation within the popup.
- Project-defined: Search reveals matching records and their ancestry. Keep search independent of accepted values and the application's expansion state. Never infer selections from filtered-out or unloaded records.
- Project-defined: Native form submission, required validation, disabled fields, and reset apply to accepted keys. Optional measured windowing follows Tree view's focus and ancestor preservation rules. Built-in control and status text uses shared localization; record labels remain application-owned.
