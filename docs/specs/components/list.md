# Lists: project design guide

## Scope

Lists present related content, destinations, or actions as rows. Choose the item treatment that matches the content hierarchy and interaction purpose. See [Lists overview](https://m3.material.io/components/lists/overview).

## Design target

- Use the Expressive list treatment for new designs. Use the variants and grouping shown in [Lists guidelines](https://m3.material.io/components/lists/guidelines) when the content hierarchy calls for a standard or segmented configuration.
- `list.geometry.rows`: Use the documented list-item anatomy, line configurations, spacing, and dimensions shown in [Lists specifications](https://m3.material.io/components/lists/specs). Keep primary text prominent, supporting content secondary, and trailing information aligned.
- Limit supporting text to three lines and truncate it responsively when it exceeds the available space, following [Lists guidelines](https://m3.material.io/components/lists/guidelines).
- `list.selection.semantics`: Give each list a coherent interaction purpose. A row that navigates, selects, or performs an action must communicate that role. Preserve the keyboard, selection, and accessible-name behavior in [Lists accessibility](https://m3.material.io/components/lists/accessibility).
- Adapt a list to its containing layout using the [canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview).

## Token mapping

- Map `md.comp.list.list-item.*` through registry-local Component aliases. Component colors resolve to System color roles; typography resolves to System type roles; state shapes resolve to System shape roles where those semantics match. CSS selectors consume only the Component aliases.
- Keep List-specific row heights, insets, gaps, media dimensions, and state geometry in the List Component layer when Material defines no matching shared System token. Do not use selector sample hex values as component defaults.
- Map `md.comp.list.expand.*` through separate Expandable List Component aliases. The expanded row and disclosure treatments use semantic System roles; their light-mode selector samples are references, not fixed colors.
- `registry/components/list/` owns these mappings and remains independently distributable. Its styles do not depend on the documentation site.

## Project decisions

- Project-defined: Expressive is the default visual target. Standard and segmented configurations remain available when they better support a specific content hierarchy.
- Project-defined extension: `ExpandableListItem` uses inline disclosure by default. Its optional `presentation="fullScreen"` mode provides the official full-screen container-transform pattern and requires an accessible dialog name, supplied through `fullScreenTitle`, the `#full-screen-title` slot, or the root `aria-label`.
- Project-defined extension: Web `aria-current="page"` styling represents the current navigation destination. It remains visually distinct in state semantics from `ListOption` selection (`aria-selected`), even where both use the same selected colors.
- Project-defined extension: the density spacing scale adjusts List Component spacing aliases; the official token dimensions map to CSS pixels using the project's density convention.
