# Filter chip set: project extension guide

## Scope

`FilterChipSet` is a project helper for coordinating related Material Filter chips. Material defines the chip pattern, not this Vue composition or its API. See [Filter chips](filter-chip.md) and the shared [Chips family guide](chips.md).

## Design target

- Keep the filter group and its choices in a clear, perceivable context. See [Chips accessibility: grouping and context](https://m3.material.io/components/chips/accessibility).
- Use either single- or multi-selection consistently throughout the filter experience. See [Chips guidelines: Filter chip selection](https://m3.material.io/components/chips/guidelines).
- On the Web, expose a labeled chip set as a grid of selectable grid cells. Tab enters the set at one chip; arrow keys move focus between chips; Space or Enter selects or deselects the focused chip. In a multi-select set, multiple chips may be selected while focus stays on one chip at a time. See [Chips accessibility: keyboard navigation and roles](https://m3.material.io/components/chips/accessibility).
- Preserve the Filter chip's selected appearance and semantics, shared 48 dp target, keyboard access, and visible focus. See [Chips specs: Filter chip states](https://m3.material.io/components/chips/specs) and [Chips accessibility](https://m3.material.io/components/chips/accessibility).
- Keep at least 8 dp between chips, including between wrapped rows. Filter chip sets may wrap or scroll horizontally as the layout requires. See [Chips guidelines: placement](https://m3.material.io/components/chips/guidelines).

## Project decisions

- Project-defined extension: The helper owns group-level labeling and selection coordination because Material defines the Filter chip pattern but not a Vue set component.
- Vue selection behavior: single-select starts empty and lets activating the selected chip clear it to `null`; multi-select toggles each value independently. Material defines chip activation and allows single or multiple selection, but does not prescribe this helper's model contract.
- Layout behavior: the helper wraps chips by default and offers a vertical layout. Its gap follows the configured spacing density when that makes the gap larger, but never falls below the official 8 dp minimum.
