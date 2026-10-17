# Side sheets: project design guide

## Scope

A side sheet presents optional contextual information or actions beside primary content. It is not a surface for top-level destination navigation. This guide adopts standard and modal variants. See [Side sheets overview](https://m3.material.io/components/side-sheets/overview).

## Design target

- Use a standard sheet when both the sheet and primary region should remain interactive. Use a modal sheet when the sheet temporarily blocks the primary region; place it over a scrim. See [Side sheets guidelines](https://m3.material.io/components/side-sheets/guidelines).
- Place the sheet on the trailing edge and mirror its position in RTL. Follow the inset and responsive placement in the [guideline figures](https://m3.material.io/components/side-sheets/guidelines).
- Include a headline and a visible, accessibly named close control inside the sheet. The close control remains available even when another exit action exists; scrim and Escape dismissal do not replace it. See [Side sheet specifications: anatomy](https://m3.material.io/components/side-sheets/specs) and [accessibility](https://m3.material.io/components/side-sheets/accessibility).
- Map standard sheet colors to `surface`, `on-surface-variant`, and `outline-variant`; map modal sheet containers to `surface-container-low`. Use the `title-large` System type scale for the headline. Follow the 24dp horizontal inset, 12dp top-element spacing, 72dp action area, 16dp/24dp action padding, 400dp maximum width, and 16dp detached margin in the [specification](https://m3.material.io/components/side-sheets/specs).
- Keep the sheet's content vertically scrollable when it exceeds the available height. Do not allow horizontal scrolling.
- Use dialog semantics and keep keyboard focus and actions available as shown in [Side sheet accessibility](https://m3.material.io/components/side-sheets/accessibility).

## Project decisions

- Project-defined: Use modal presentation on compact layouts and standard presentation when both regions can remain usable. The consuming layout owns the final presentation choice.
- Project-defined: The component defaults to a 400px width, matching the official maximum-width measurement, while the token selector's docked width is 256dp. Consumers can size the component with `width` and `maxWidth`.
- Project-defined: The shared density spacing scale adjusts measured spacing values. The header keeps a 64px minimum height; the action row uses an 8dp gap for multiple slotted actions; keyboard focus uses a 3px secondary-color outline with a 2px offset.
