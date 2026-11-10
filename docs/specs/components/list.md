# Lists: project design guide

## Scope

Lists present related content, destinations, or actions as rows. Choose the item treatment that matches the content hierarchy and interaction purpose. See [Lists overview](https://m3.material.io/components/lists/overview).

## Design target

- Use the Expressive list treatment for new designs. Use the variants and grouping shown in [Lists guidelines](https://m3.material.io/components/lists/guidelines) when the content hierarchy calls for a standard or segmented configuration.
- `list.geometry.rows`: Use the documented list-item anatomy, line configurations, spacing, and dimensions shown in [Lists specifications](https://m3.material.io/components/lists/specs). Keep primary text prominent, supporting content secondary, and trailing information aligned.
- `list.geometry.avatar`: Leading initials use the Avatar composition and the full `title-medium` role, including family, size, weight, line height, and tracking. Do not restyle the same initials with a smaller size or separate tracking.
- `list.geometry.media`: Use the official small corner shape for leading video and Expressive leading image media. The baseline image token has no rounding; the Expressive image variant uses `shape.corner.small`.
- `list.geometry.icons`: Use the 20 dp Expressive size for leading and trailing icons. The baseline icon size remains 24 dp.
- Limit supporting text to three lines and truncate it responsively when it exceeds the available space, following [Lists guidelines](https://m3.material.io/components/lists/guidelines).
- `list.selection.semantics`: Give each list a coherent interaction purpose. A row that navigates, selects, or performs an action must communicate that role. Preserve the keyboard, selection, and accessible-name behavior in [Lists accessibility](https://m3.material.io/components/lists/accessibility).
- `list.state.selected-icons`: Selected leading and trailing icons use the selected content role. Hover, focus, and pressed selected states switch those icons to `on-surface` while the label keeps the selected label role.
- `list.state.dragged`: The dragged visual state maps Compose `ReorderListTokens`: `tertiary-container` container, `on-tertiary-container` label and icons, and the large corner shape. Reordering and drop zones remain consumer-owned.
- Adapt a list to its containing layout using the [canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview).

## Project decisions

The following are project decisions.

- Expressive is the default visual target. Standard and segmented configurations remain available when they better support a specific content hierarchy.
- A segmented list represents one visual group. Multiple groups use separate labelled list instances, with spacing owned by the surrounding layout; no group container is introduced without a concrete requirement for multiple groups in one list.
- An expandable list item uses inline disclosure by default. An optional full-screen mode provides the official full-screen container-transform pattern and requires an accessible dialog name.
- Web `aria-current="page"` styling represents the current navigation destination. It stays visually and semantically distinct from option selection (`aria-selected`), even where both use the same selected colors.
- The density spacing scale adjusts list spacing. The official token dimensions map to CSS pixels using the project's density convention. Row heights, insets, gaps, media dimensions, and state geometry remain list-owned values where Material defines no matching shared System token.
