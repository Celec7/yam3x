# Toolbars: project design guide

## Scope

Toolbars collect frequent actions for the current page. This guide adopts Material 3 Expressive docked and floating variants. The docked toolbar replaces the baseline bottom app bar for new designs. See [Toolbars overview](https://m3.material.io/components/toolbars/overview).

## Design target

- `toolbar.variants.geometry`: Use a docked toolbar for actions that remain consistent across pages. It spans the window width at the bottom, with the height and edge padding shown in [Toolbar specifications](https://m3.material.io/components/toolbars/specs). Do not show it alongside a bottom navigation bar; see [Toolbar guidelines](https://m3.material.io/components/toolbars/guidelines).
- Docked toolbars use straight corners by default. On Web and large screens, they may use rounded corners. Floating toolbar containers are fully rounded; see [Toolbar guidelines: container](https://m3.material.io/components/toolbars/guidelines).
- Use a floating toolbar for actions related to the current page or selection. Keep it content-sized and within the offsets shown in the [placement and spacing figures](https://m3.material.io/components/toolbars/specs). Use overflow when actions do not fit. See [Toolbar guidelines](https://m3.material.io/components/toolbars/guidelines).
- Use the standard `surface-container` or vibrant `primary-container` scheme shown in [Toolbar specifications](https://m3.material.io/components/toolbars/specs). Match child controls to the scheme: standard icon buttons use `primary` or `on-primary-container`; the specified Filled and Toggle tonal buttons use their matching roles.
- Compose the toolbar from controls suited to its actions, such as icon buttons, buttons, text fields, or a menu trigger. Each control retains its own accessible name and interaction feedback. See [Toolbar guidelines](https://m3.material.io/components/toolbars/guidelines).
- `toolbar.a11y.keyboard`: Expose the Web container with `toolbar` semantics and support keyboard movement and activation through its controls. See [Toolbar accessibility](https://m3.material.io/components/toolbars/accessibility).
- `toolbar.a11y.orientation`: Set the Web toolbar's `aria-orientation` to match its effective layout: vertical for a vertical floating toolbar and horizontal otherwise. This follows the [WAI-ARIA Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), whose toolbar role defaults to horizontal.
- `toolbar.a11y.target`: Keep child controls at the minimum target size from [Toolbar accessibility](https://m3.material.io/components/toolbars/accessibility).
- Respect the scrolling behavior shown in [Toolbar guidelines](https://m3.material.io/components/toolbars/guidelines). Mirror logical leading and trailing placement in RTL.

## Project decisions

- Project-defined: This toolbar is a composable action container. The consuming layout owns placement, overflow contents, pairing with a FAB, and page-specific scrolling behavior.
- Project-defined: Rounded Docked corners begin at an 840px viewport width and map to System `corner-large` (16px). Material permits rounded Docked corners on Web and large screens but does not prescribe this radius or breakpoint. Slotted controls keep their own styling; the caller selects child color variants and roles to match the toolbar scheme.
- Project-defined: `aria-orientation` is derived from the effective `layout` and `vertical` props, so the component's accessibility semantics cannot conflict with its visual orientation or keyboard navigation.
