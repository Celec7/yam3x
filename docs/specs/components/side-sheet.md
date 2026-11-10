# Side sheets: project design guide

## Scope

A side sheet presents optional contextual information or actions beside primary content. It is not a surface for top-level destination navigation. This guide adopts standard and modal variants. See [Side sheets overview](https://m3.material.io/components/side-sheets/overview).

## Design target

- Use a standard sheet when both the sheet and primary region should remain interactive. Use a modal sheet when the sheet temporarily blocks the primary region; place it over a scrim. See [Side sheets guidelines](https://m3.material.io/components/side-sheets/guidelines).
- Place the sheet on the trailing edge and mirror its position in RTL. Follow the inset and responsive placement in the [guideline figures](https://m3.material.io/components/side-sheets/guidelines).
- Include a headline and a visible, accessibly named close control inside the sheet. The close control remains available even when another exit action exists; scrim and Escape dismissal do not replace it. See [Side sheet specifications: anatomy](https://m3.material.io/components/side-sheets/specs) and [accessibility](https://m3.material.io/components/side-sheets/accessibility).
- Map standard sheet colors to `surface`, `on-surface-variant`, and `outline-variant`; map modal sheet containers to `surface-container-low`. Use the `title-large` System type scale for the headline. Follow the 24 dp horizontal inset, 12 dp top-element spacing, 72 dp action area, 16 dp/24 dp action padding, 400 dp maximum width, and 16 dp detached margin in the [specification](https://m3.material.io/components/side-sheets/specs).
- Keep the sheet's content vertically scrollable when it exceeds the available height. Do not allow horizontal scrolling.
- Use dialog semantics and keep keyboard focus and actions available as shown in [Side sheet accessibility](https://m3.material.io/components/side-sheets/accessibility).

## Project decisions

The following are project decisions.

- Use modal presentation on compact layouts and standard presentation when both regions can remain usable. The consuming layout owns the final presentation choice.
- Modal sheets are detached from the window by the official 16 dp margin on the top, trailing, and bottom edges and use a 16 dp corner radius. Standard sheets remain attached to the edge.
- The component defaults to a 400 px width, matching the official maximum-width measurement, while the token selector's docked width is 256 dp. Consumers can override the width and maximum width.
- The shared density spacing scale adjusts measured spacing values. The header keeps a 64 px minimum height; the action row uses an 8 dp gap for multiple slotted actions; keyboard focus uses a 3 px secondary-color outline with a 2 px offset.
