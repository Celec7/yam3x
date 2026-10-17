# Options: project extension guide

## Scope

The Option family supplies reusable rows for choice and action surfaces. Material defines item treatment within owning components such as Menus and Lists, not a universal standalone Option component.

## Design target

- Match each row to its owning surface: use [menu item](https://m3.material.io/components/menus/specs) treatment for transient actions and [list item](https://m3.material.io/components/lists/specs) treatment for persistent content or selection.
- `option.geometry.edge-corners`: Match the Menu first/last item token mapping: medium outer corners and extra-small inner corners. A selected item keeps its selected medium shape; a first/last shape override changes only the corresponding outer edge. See [Menu specifications](https://m3.material.io/components/menus/specs).
- Use the standard Menu container role, `surface-container-low`, as the default OptionPanel surface. An owning component may override it only when its documented design calls for a different surface role.
- Keep zero inter-row gap in the Web popup; separate groups with dividers following [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Keep option text as the primary label. Use supporting content only to clarify a choice; do not place a second independent action inside one option. Follow [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Apply selection, focus, disabled, and keyboard behavior from the owning menu or list pattern. Web role mapping follows the applicable [WAI-ARIA menu](https://www.w3.org/WAI/ARIA/apg/patterns/menu/) or [listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) pattern, not a Material rule for a standalone Option.

## Project decisions

- Project-defined (`option.extension.parent-selection`): The Option row reports activation intent; the parent control owns the current selection and value commitment. The containing component determines semantics, spacing, colors, and keyboard behavior.
