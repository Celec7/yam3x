# Drawer container: project extension guide

## Scope

`DrawerContainer` is a project-defined layout primitive that places optional panels beside or over primary content. Material does not define a generic two-sided drawer container.

## Design target

- When a panel contains contextual information or actions, use [Side sheets](https://m3.material.io/components/side-sheets/overview) as the design reference. When it contains top-level destinations, use the expanded [Navigation rail](https://m3.material.io/components/navigation-rail/overview).
- The official standard/modal comparisons define the layout distinction: standard content remains beside the primary region; modal content overlays it and blocks interaction behind a scrim. See [Side sheets guidelines](https://m3.material.io/components/side-sheets/guidelines) and [Navigation drawer guidelines](https://m3.material.io/components/navigation-drawer/guidelines).
- Map in-flow side-sheet surfaces to System `surface`; map modal side-sheet surfaces to `surface-container-low`. Optional persistent dividers use `outline-variant`, following the Side sheet color diagrams. These roles do not prescribe the generic container's width or content padding.
- Material 3 Expressive no longer recommends Navigation drawer for top-level destinations; use the expanded Navigation rail pattern instead.

## Project decisions

- Project-defined (`drawer-container.extension.modal-focus`): A modal panel traps focus, blocks background interaction, exposes the `dialog` role, and returns focus after dismissal. The consumer supplies a visible close affordance inside modal content; the scrim label is not a substitute for it.
- When a modal panel composes a Side sheet, the outer panel provides the single named dialog boundary and focus trap. Keep the Side sheet's inner section structural so the composition does not expose nested dialogs or duplicate focus management.
- When composing a Side sheet, keep the panel's horizontal overflow clipped and place its content within the available width.
- Project-defined (`drawer-container.extension.adaptive`): The container supports start/end panels and chooses modal, reflowing, or persistent layout from the available space. The consumer chooses explicit modes when content or surrounding layout requires them.
- Project-defined: The generic container owns placement and layout relationships, not navigation roles, selected destinations, or sheet anatomy. `NavigationDrawer` is the public navigation surface and may compose this primitive internally. Keep current props, slots, events, and responsive thresholds in the component source and public docs.
- Project-defined: Keep the generic container width at 360px by default. The dedicated `SideSheet` composition has its own 400px default width and owns Side sheet content anatomy.
