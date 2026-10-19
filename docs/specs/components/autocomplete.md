# Autocomplete: project extension guide

## Scope

Autocomplete combines an editable text field with a filtered suggestion menu. Material documents the visual filtering pattern within Menus, not a standalone Autocomplete component.

## Design target

- `autocomplete.material.filtering`: Keep the text field as the query entry point and filter menu options as the query changes. Follow the filtering example and menu surface guidance in [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Filter suggestions as the query changes and ease items into their new positions. Do not add gaps to scrollable menus; use dividers for Web menus when grouping is needed. See [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Map the Standard menu container to `surface-container-low`. Map selected items to `tertiary-container` and `on-tertiary-container`; unselected text and state layers use the corresponding surface roles. The Expressive menu specifications also define a Vibrant tertiary-based mapping. See [Menus specifications](https://m3.material.io/components/menus/specs).
- Map popup shape to `md.comp.menus.container.shape`, selected option shape to `md.comp.menus.menu-item.selected.shape`, and first/last option shapes and inner corners to their `md.comp.menus.menu-item.*` shape tokens. The System mappings are `shape.corner.large`, `shape.corner.medium`, and `shape.corner.extra-small`, respectively.
- Follow Material menu item hierarchy and states for suggestions, and text-field guidance for the field's label, value, and supporting text. See [Text fields](https://m3.material.io/components/text-fields/overview).

## Project decisions

- Project-defined (`autocomplete.extension.value-commit`): Typed query text and an accepted option are separate values. Typing filters suggestions; accepting a suggestion commits it. The consuming form decides whether unmatched free text is valid.
- Project-defined (`autocomplete.a11y.combobox`): The standalone Vue component wraps the Material menu-filtering pattern. It uses combobox/listbox semantics from the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) because Material does not define Web role mapping for the pattern. Keep keyboard focus in the editable field while exposing the active suggestion and result count.
- Project-defined (`variant` API): Expose the official Standard and Vibrant menu color mappings through `variant`, defaulting to `standard`, consistent with the project's Menu API. Material defines the mappings, not an Autocomplete prop.
- Project-defined (`autocomplete.css-overrides`): Keep a zero-gap popup and expose only documented Autocomplete geometry, shape, elevation, and label-size CSS overrides. Colors stay mapped to theme System tokens and change through `variant`.
- Project-defined: Loading and no-results status text follow the selected popup color mapping so both remain legible on Standard and Vibrant surfaces.
- Project-defined: Use a 280px popup height cap, loading/no-results rows, and the current positioning behavior. Material does not specify these as standalone Autocomplete requirements.

- Project-defined (`autocomplete.virtual.catalog`): Allow opt-in measured windowing for large suggestion catalogs. Filtering, accepted values, and keyboard navigation use the full catalog; keep the active suggestion mounted and expose its logical result position. Preserve input focus, loading/no-results states, and filtering motion for retained rows; recycled rows enter immediately. Keep visible rows covered when overscan is disabled or popup spacing changes. Material does not define a virtualization algorithm. Follow the [combobox focus pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) for Web semantics.

The [shared virtual-window decisions](../virtual-windows.md) own viewport coverage, measured-height anchoring, catalog-change recovery, and navigation priority.
