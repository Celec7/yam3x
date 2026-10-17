# Sliders: project design guide

## Scope

Sliders let people choose and adjust a value along a range. This guide adopts Material's standard, centered, and range variants, with horizontal or vertical orientation. See [Sliders overview](https://m3.material.io/components/sliders/overview).

## Design target

### Use and appearance

- Use a standard slider for a range that starts at its minimum, a centered slider when the neutral value is in the middle, and a range slider to choose lower and upper values. See [Sliders guidelines](https://m3.material.io/components/sliders/guidelines).
- Material recommends keeping range sliders horizontal and advises against vertical range sliders: two handles add cognitive load, and people generally expect sliders to be horizontal. This is guidance, not a runtime restriction.
- `slider.selection.range`: Keep the active and inactive track segments and range handles as shown in the [anatomy and state figures](https://m3.material.io/components/sliders/specs). Mirror value direction in RTL.
- `slider.geometry.sizes`: Use XS/S/M/L/XL track heights of 16/24/40/56/96dp, with corresponding handle heights of 44/44/52/68/108dp and track corners of 8/8/12/16/28dp. Match size and visible emphasis to the task. See [Sliders specifications](https://m3.material.io/components/sliders/specs) and its size figures.
- Show interior stop indicators only when values are predetermined; the handle snaps to the nearest stop. Use endpoint stop indicators when needed to ensure at least 3:1 contrast between the end of the inactive track and its background. They may be omitted when the inactive track already provides that contrast. See [Sliders guidelines](https://m3.material.io/components/sliders/guidelines) and [accessibility](https://m3.material.io/components/sliders/accessibility).

### Interaction and accessibility

- `slider.a11y.keyboard`: Give the slider an accessible name matching its label and expose its current value. Tab reaches the handle; arrow keys adjust it, and Home and End select the minimum and maximum. See [Sliders accessibility](https://m3.material.io/components/sliders/accessibility).
- `slider.state.focused-handle`: Shrink the handle to 2dp while focused; retain a visible focus indicator. See the focused state in [Sliders specifications](https://m3.material.io/components/sliders/specs) and the interaction guidance in [Sliders accessibility](https://m3.material.io/components/sliders/accessibility).
- `slider.state.disabled-stops`: Keep disabled stop indicators legible against both active and inactive tracks using their corresponding foreground roles and disabled opacity. See the disabled state and stop-indicator tokens in [Sliders specifications](https://m3.material.io/components/sliders/specs).
- Preserve visible keyboard focus and communicate the value through both the control and its accessible value semantics. See [Sliders accessibility](https://m3.material.io/components/sliders/accessibility).

## Project decisions

- Project-defined: The owning feature determines the range, step interval, units, and any synchronized text-field presentation.
- Project-defined: The API continues to allow vertical range sliders for layouts that need them; horizontal is the recommended choice.
- Project-defined: When endpoint indicators are rendered, center them on the rounded track end caps by positioning them one end-corner radius from each track boundary. This keeps them aligned with the track across sizes.
- Project-defined: The `stops` prop controls interior stops, which appear only for steps greater than 1. Render endpoint indicators only where an inactive track segment reaches the slider boundary; this keeps indicators aligned with visible inactive track.
- Project-defined: On standard sliders with inset icons, move the icon to the inactive side while the active track fraction is below 30%. This threshold keeps the icon legible near the start of the range.
