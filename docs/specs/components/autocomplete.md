# Autocomplete: project extension guide

## Scope

Autocomplete combines an editable text field with a filtered suggestion menu. Material documents the visual filtering pattern within Menus, not a standalone Autocomplete component. Closest composition: Compose `ExposedDropdownMenuBox` with an editable text field and menu items.

## Design target

- `autocomplete.material.filtering`: Keep the text field as the query entry point and filter menu options as the query changes. See the filtering example in [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Ease suggestions into their new positions as the query changes. Do not add gaps to scrollable menus; use dividers for grouping on Web. See [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Map the Standard menu container to `surface-container-low` and selected items to `tertiary-container` with `on-tertiary-container`; unselected text and state layers use the corresponding surface roles. The Expressive menu specifications also define a Vibrant tertiary-based mapping. See [Menus specifications](https://m3.material.io/components/menus/specs).
- Map popup shape to `md.comp.menus.container.shape`, selected option shape to `md.comp.menus.menu-item.selected.shape`, and first and last option shapes and inner corners to their `md.comp.menus.menu-item.*` shape tokens. The System mappings are `shape.corner.large`, `shape.corner.medium`, and `shape.corner.extra-small`.
- Follow Material menu item hierarchy and states for suggestions, and text-field guidance for the field's label, value, and supporting text. See [Text fields](https://m3.material.io/components/text-fields/overview).

## Project decisions

The following are project decisions.

- `autocomplete.extension.value-commit`: Typed query text and an accepted option are separate values. Typing filters suggestions; accepting a suggestion commits it. The consuming form decides whether unmatched free text is valid.
- `autocomplete.a11y.combobox`: The component wraps the Material menu-filtering pattern. It uses combobox and listbox semantics from the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) because Material does not define a Web role mapping for the pattern. Keep keyboard focus in the editable field while exposing the active suggestion and result count.
- Expose the official Standard and Vibrant menu color mappings as a variant choice, with Standard as the default, consistent with the project's Menu design. Material defines the mappings, not an Autocomplete option.
- `autocomplete.css-overrides`: Keep a zero-gap popup and expose only documented Autocomplete geometry, shape, elevation, and label-size overrides. Colors stay mapped to theme System tokens and change through the selected variant.
- Loading and no-results status text follows the selected popup color mapping so both remain legible on Standard and Vibrant surfaces.
- Result counts and state text are announced only after the query settles. The component debounces the polite live region so typing does not interrupt assistive technology with intermediate counts.
- The trailing suggestions control is omitted when no popup can open for an enabled field; disabled and read-only fields keep it visibly disabled.
- A controlled query is read after the parent renders. If the parent normalizes the query, active-option and popup state use the normalized value.
- The optional `floatLabel="always"` mode follows the Form field outlined label and measured notch geometry. The default keeps the label above the field for backward compatibility. Material defines text-field floating labels; Autocomplete's mode is a project extension.
- Use a 280px popup height cap plus loading and no-results rows. Material does not specify these as standalone Autocomplete requirements.
- The field exposes optional hint and error supporting text. Error replaces the hint, marks the field invalid with the System error role, and is announced as an alert. The field uses the 3px primary focus outline; suggestions use 44px visual rows inside 48px targets with a 3px secondary focus ring and level 2 popup elevation.
- `autocomplete.virtual.catalog`: Allow opt-in measured windowing for large suggestion catalogs. Filtering, accepted values, and keyboard navigation use the full catalog; keep the active suggestion mounted and expose its logical result position. Preserve input focus, loading and no-results states, and filtering motion for retained rows; recycled rows enter immediately. Keep visible rows covered when overscan is disabled or popup spacing changes. Material does not define a virtualization algorithm. Follow the [combobox focus pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) for Web semantics.

The [shared virtual-window decisions](../virtual-windows.md) own viewport coverage, measured-height anchoring, catalog-change recovery, and navigation priority.
