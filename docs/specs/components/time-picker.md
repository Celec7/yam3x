# Time pickers: project design guide

## Scope

Time pickers select a specific time through a dial or text input, optionally in a modal flow. This guide adopts Material's dial and input controls with hour, minute, and optional period selection. See [Time picker overview](https://m3.material.io/components/time-pickers/overview).

## Design target

- Provide dial and manual input modes. Use separate hour and minute fields and include period selection for 12-hour time. See [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines).
- Use the dial dimensions, target areas, selected states, and colors in [Time picker specifications](https://m3.material.io/components/time-pickers/specs). Adapt orientation or switch to input when the dial does not fit; avoid scrolling the picker.
- Map the picker container to `surface-container-high`; map the dial face and unselected time field to `surface-container-highest`. Selected time uses `primary-container` and `on-primary-container`. Selected period uses `tertiary-container` and `on-tertiary-container`; unselected period uses `on-surface-variant` and `outline`.
- Use `on-surface` for enlarged time values and `on-surface-variant` for Hour and Minute labels. Place those labels below the enlarged fields. See [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines).
- Use a 256 dp dial face, 48 dp targets and handle, 8 dp center, and 2 dp track. Use 96 by 80 dp time selectors, with the first selector 114 dp wide in the 24-hour vertical layout. Period selectors are 52 by 80 dp vertical, 216 by 38 dp horizontal, or 52 by 72 dp in input mode. Input fields are 96 by 72 dp, with 24 dp picker padding.
- Place the dial and input mode toggle at the leading edge of the bottom action row. In input mode, focus the selected field with a 2 dp primary outline and `primary-container` fill. Give selectors and period options a 3 dp secondary focus indicator with a 2 dp offset.
- `time-picker.color.roles`: Use the surface and selected-state roles in [Time picker specifications](https://m3.material.io/components/time-pickers/specs).
- Follow the 12-hour and 24-hour dial arrangements. In the 24-hour dial, place even hours on the inner ring and odd hours on the outer ring. Let locale or time-format settings choose the presentation. See [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines).
- Use the modal enter and exit transition and the transition between dial and input modes. Honor reduced-motion preferences. See [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines).
- Confirm commits the selected time; Cancel or dismissal closes without confirmation. Keep the mode switch and actions clearly labeled. See [Time picker accessibility](https://m3.material.io/components/time-pickers/accessibility).
- `time-picker.a11y.keyboard`: Give input fields and dial targets accessible names and keyboard access. Follow the labeling, target, and keyboard guidance in [Time picker accessibility](https://m3.material.io/components/time-pickers/accessibility).
- Localize dial value names and both directions of the mode-toggle name. A caller-provided dial value formatter receives the selected value, unit, and range maximum.

## Project decisions

- Expose the dial and text input as separate controls, with a dialog composition that keeps a draft until confirmation. Standalone controls update immediately.
- Represent time as `{ hour, minute, second? }` using 24-hour values independent of a calendar date. Support seconds only when the feature needs them.
- Support a docked dialog and an automatic compact layout. Material's modal flow remains the design target.
- Use a 684 px minimum width and 480 px minimum height for the horizontal dial, and a 596 px minimum height for the vertical dial. These keep the 256 px dial, surrounding content, and 24 px padding visible without scrolling.
- Use a fade-and-scale transition between hour, minute, and second faces; Material does not specify this transition.
- Preserve a one-digit raw value while its field is focused, then pad it on blur so two-digit entry remains possible.
- `time-picker.behavior.locale-draft`: A language change preserves the active mode and provisional time. Keep invalid automatic-hour-cycle input in its editing cycle until correction or dismissal so the change cannot reinterpret the draft or enable confirmation.
