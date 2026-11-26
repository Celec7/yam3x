# Navigation rail: project design guide

## Scope

A navigation rail switches between top-level destinations along the leading edge of a layout. Material 3 Expressive defines collapsed and expanded rails; the baseline rail is no longer recommended. The expanded rail replaces the navigation drawer for new designs.

## Design target

- `navigation-rail.adaptive.layout`: Use the rail in medium and larger layouts, with the navigation bar in compact layouts. The [adaptive guidance](https://m3.material.io/components/navigation-rail/guidelines) shows placement and its relationship to content.
- Use three to seven destinations and at most one optional FAB. Destination count remains the application's information-architecture choice.
- Use outlined icons for inactive destinations and filled icons for the selected destination when the icon family provides both. See [Navigation rail accessibility](https://m3.material.io/components/navigation-rail/accessibility).
- Keep the rail vertical at the leading edge, outside content panes, and mirror it in RTL. See [Navigation rail guidelines](https://m3.material.io/components/navigation-rail/guidelines).
- `navigation-rail.geometry.collapsed`: Use the collapsed rail for primary destinations and the expanded rail when secondary destinations or labels need more space. See [Navigation rail overview](https://m3.material.io/components/navigation-rail/overview) and [specifications](https://m3.material.io/components/navigation-rail/specs).
- Make the active destination clear with the indicator and selected icon treatment. Keep the entire destination row as the target in the expanded form.
- Keep labels visible at increased text size and allow wrapping. Place badges at the icon when collapsed and beside the label when expanded. See [Navigation rail guidelines](https://m3.material.io/components/navigation-rail/guidelines).
- `navigation-rail.color.contrast`: Use the official color roles and state treatment, with at least 3:1 icon contrast. See [Navigation rail specifications](https://m3.material.io/components/navigation-rail/specs) and [accessibility](https://m3.material.io/components/navigation-rail/accessibility).
- `navigation-rail.a11y.keyboard`: Expose a labeled navigation landmark, clear destination names, and visible focus. Support keyboard movement and selection. See [Navigation rail accessibility](https://m3.material.io/components/navigation-rail/accessibility).

## Project decisions

- The component supports the standard 96 px collapsed rail and the 220 to 360 px expanded rail. The 80 px narrow collapsed variant is outside the component's scope.
- Use `surface-container` for the rail surface even though Material permits omitting the fill when contrast is met. Map the indicator to `secondary-container` and selected content to its paired role. Inactive content uses `on-surface-variant`.
- Use System `label-medium` for vertical labels and `label-large` for horizontal labels. Map badge colors to the `error` pair.
- Keep vertical active indicators at 56 by 32 px and horizontal indicators at 56 px high with 16 px inline space. Use 4 px between collapsed destinations and no gap between expanded destinations.
- Keep the menu icon aligned with the destination icon axis in both forms. Use a 40 px gap between the header and destination list, and 20 px outer surface padding. The expanded destination's 16 px inset and 8 px icon-label gap follow the horizontal layout.
- Disabled destination content uses `on-surface` at 38% opacity because the official selector has no disabled mapping.
- Navigation items retain native link semantics. The application owns routing and whether destination state is preserved.
- `density="compact"` is a project extension for vertically tighter rails. It reduces the top inset, header gap, collapsed row padding, and expanded row height without changing the 96/220 px rail widths. Material defines no compact navigation-rail density; do not describe it as an official variant.
- `children` is a one-level project extension for child pages below a destination. Children render only while expanded in a named nested list. A child may be current; when collapsed, the parent carries the current state and focus returns to the parent from a child. `secondary` remains the expanded-only top-level destination mechanism; do not present `children` as an official Material navigation hierarchy.
- Below 840 px, `mode="auto"` leaves the rail unavailable so the consuming layout can show the navigation bar. This follows Material's numeric window breakpoints: Compact and Medium may use a navigation bar, while Expanded and larger use a navigation rail.

Current API details belong to the component source and the public [Navigation rail page](../../../apps/docs/components/navigation-rail.md).
