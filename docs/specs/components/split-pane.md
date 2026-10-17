# Supporting panes: project extension guide

## Scope

This project extension presents primary content beside related supporting content and optionally lets people resize the divider. Material describes supporting-pane layouts but does not define a standalone draggable Split pane component.

## Design target

- A supporting pane holds content that is meaningful in relation to the primary area. For parent-child content, use the [list-detail layout](https://m3.material.io/foundations/layout/canonical-examples/list-detail) instead.
- In the official [Supporting pane layout](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane), the supporting area appears below the primary area at compact and medium breakpoints; at compact sizes a bottom sheet can keep focus on the primary area. At expanded sizes, the supporting area appears on the leading or trailing side and has a fixed 360dp width in the example.
- These layout examples establish content relationship and placement; they do not define a draggable Split pane component or its CSS tokens.
- Divider semantics and keyboard behavior follow the [WAI-ARIA window splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/), not Material layout guidance.

## Project decisions

- Project-defined (`split-pane.extension.separator`): When enabled, expose the divider as a keyboard-operable separator with a visible focus state and bounded value. Resizing changes space allocation without changing which content is primary.
- Project-defined (`split-pane.extension.keyboard`): Support keyboard resizing and preserve the selected proportion when orientation changes. The component also supports drag resizing; Material does not define these interactions.
- Project-defined adaptive API: `v-model:compact-pane` selects one pane in compact `auto` mode, with primary content shown by default. The consuming scaffold owns the control that switches between panes. This intentionally differs from the Material Supporting pane example, which places supporting content below the primary area at compact sizes.
- Project-defined breakpoint implementation: compact, medium, and expanded window categories map to 0–599px, 600–839px, and 840px or wider viewports.
- Project-defined sizing: medium `auto` layouts stack both panes; expanded layouts show them side by side and remain user-resizable. Unlike the official example's fixed 360dp supporting area, the divider ratio is controlled by the component model and bounds.
- Project-defined appearance: the divider handle geometry and its hover, focus, and drag states have no official Supporting pane component tokens. Use the Component CSS hooks documented by the public component page; their default colors, state opacity, shape, and motion map to shared System tokens.
