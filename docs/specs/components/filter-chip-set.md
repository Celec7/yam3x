# Filter chip set: project extension guide

## Scope

`FilterChipSet` is a project helper for coordinating related Material Filter chips. Material defines the chip pattern, not this composition or its API. See [Filter chips](filter-chip.md) and the shared [Chips family guide](chips.md). Compose `FlowRow` with `FilterChip` children and set-level selection semantics is the closest composition.

## Design target

- Keep the filter group and its choices in a clear, perceivable context. See [Chips accessibility: grouping and context](https://m3.material.io/components/chips/accessibility).
- Use either single- or multi-selection consistently throughout the filter experience. See [Chips guidelines: Filter chip selection](https://m3.material.io/components/chips/guidelines).
- On the Web, expose a labeled chip set as a toolbar of toggle buttons, matching Material Web's chip-set mapping. Tab enters the set at one chip; arrow keys move focus between chips; Space or Enter selects or deselects the focused chip. In a multi-select set, multiple chips may be selected while focus stays on one chip at a time. See [Chips accessibility: keyboard navigation and roles](https://m3.material.io/components/chips/accessibility).
- Preserve the Filter chip's selected appearance and semantics, shared 48 dp target, keyboard access, and visible focus. See [Chips specs: Filter chip states](https://m3.material.io/components/chips/specs) and [Chips accessibility](https://m3.material.io/components/chips/accessibility).
- Keep at least 8 dp between chips, including between wrapped rows. Filter chip sets may wrap or scroll horizontally as the layout requires. See [Chips guidelines: placement](https://m3.material.io/components/chips/guidelines).

## Project decisions

The following are project decisions.

- The helper owns group-level labeling and selection coordination because Material defines the Filter chip pattern but not a set component. An external visible heading may supply the group label, with an inline label as the fallback. Do not emit grid, row, or gridcell roles. Use toolbar orientation for horizontal and vertical layouts.
- Keep selected chips visible in forced colors with the System Highlight and HighlightText pair; unselected chips use a CanvasText border and focus uses Highlight.
- Lay out the leading selection indicator or icon and the label in one centered flex row with an 8px gap. Do not rely on inline baseline alignment for the check indicator.
- Single-selection starts empty and activating the selected chip clears the selection; multi-selection toggles each value independently. Material defines chip activation and allows single or multiple selection, but does not prescribe this helper's model contract.
- The helper wraps chips by default and offers a vertical layout. Its gap follows the configured spacing density when that makes the gap larger, but never falls below the official 8 dp minimum.
