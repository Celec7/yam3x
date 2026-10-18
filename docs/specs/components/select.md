# Select menus: project extension guide

## Scope

Select presents a labeled field that opens a menu of choices. Material documents select menus as a use of Menus; this standalone form component packages that pattern.

## Design target

- Keep the field label and current choice clear before opening the menu. Apply the menu item hierarchy and selected-state treatment in [Menus guidelines](https://m3.material.io/components/menus/guidelines) and [specifications](https://m3.material.io/components/menus/specs).
- Keep zero inter-row gap in the Web menu, including while it scrolls; use dividers to separate groups.
- Use [Text fields guidance](https://m3.material.io/components/text-fields/overview) for the field label and presentation. Use the menu's adaptive guidance when a long choice set needs more room.
- Keep keyboard and pointer selection available and follow the menu interaction guidance in [Menus accessibility](https://m3.material.io/components/menus/accessibility).

## Project decisions

- Project-defined (`select.a11y.combobox`): Single selection uses Web combobox/listbox semantics based on the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/); Material does not define Web roles. Expose the label, expanded state, options, and current selection.
- Project-defined (`select.extension.multiple`): The field supports single or multiple selection. A single choice closes the menu after acceptance; a multiple-selection menu remains open while choices are toggled. Material documents both selection modes in [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Project-defined (`select.a11y.multiple`): Multiple selection uses a named button trigger and a multiselect listbox following the [WAI-ARIA listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/). Move DOM focus into the active option while open, expose selected values in the trigger's accessible description, and return focus to the trigger when the list closes. Material defines the menu selection behavior, not this Web role mapping.
- Project-defined: The component wraps the menu as a field. The consuming form owns the meaning and submission of the selected value.
- Project-defined (`select.options.catalog`): Accept a complete option catalog independently of mounted option rows. Keep accepted values and their labels stable through rendering changes; use a value itself when its label is unavailable and preserve its native form value. The application owns whether an accepted value should be cleared when its catalog changes. Data-driven and slotted options share selection, cancellation, keyboard, and native-form behavior.

- Project-defined (`select.selection.chips`): Offer an input-chip presentation of accepted multiple values, following [Chips guidelines](https://m3.material.io/components/chips/guidelines). Keep chip actions separate from the menu trigger. The chip body reopens the choice menu; its trailing action removes the accepted value through the same cancellable selection path as menu choices. Keep focus in the field after removal. This composition represents accepted choices, not free-form text editing.

- Project-defined (`select.search.query`): An optional editable field filters a complete catalog while accepted choices remain independent of query text. Confirm choices explicitly; typing, an empty result set, and dismissal preserve accepted native form values. Use a separate query model, clear it on dismissal and acceptance, and keep metadata registered while slotted rows are hidden.
- Project-defined (`select.search.focus`): Searchable single and multiple fields keep DOM focus on an editable combobox and expose the active option with `aria-activedescendant`. The multiple-selection composition extends the single-value [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with a multiselect listbox and an accepted-values description; it is a project Web mapping. Preserve native text editing and IME composition, skip disabled choices during navigation, and keep empty option groups out of the filtered popup.
