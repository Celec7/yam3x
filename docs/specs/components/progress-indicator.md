# Progress indicators: project design guide

## Scope

Progress indicators show the status of an ongoing process. This guide adopts Material 3 Expressive linear and circular indicators, determinate and indeterminate behavior, and flat or wavy active shapes. See [Progress indicators overview](https://m3.material.io/components/progress-indicators/overview).

## Design target

### Use and placement

- Use one indicator for a group of related loading items. For an operation under about 200 ms, use no indicator. For a short wait, use the [Loading indicator](loading-indicator.md); for longer work, use a progress indicator. Let people leave a page when a long process can continue safely. See [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines).
- Place a linear indicator at the edge of a loading container or page. Center a circular indicator over the content being loaded or where new content will appear.

### Values and appearance

- `progress-indicator.a11y.determinate-value`: Use determinate behavior when progress can be measured and keep the displayed amount accurate. Use indeterminate behavior while progress is unknown, and switch to determinate when measurements become available. Expose a value only for determinate progress. See [Progress indicators accessibility](https://m3.material.io/components/progress-indicators/accessibility).
- Use `primary` for the active indicator and `secondary-container` for the track. Linear indicators use a 4 dp default thickness, adapt to container width, and keep at least a 4 dp end inset; avoid containers narrower than 40 dp. Circular indicators scale between 24 and 240 dp, with the largest sizes reserved for large windows. See [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines) and [specifications](https://m3.material.io/components/progress-indicators/specs).
- `progress-indicator.geometry.linear`: Use a 4 dp default thickness. The wavy form uses a 3 dp amplitude and 10 dp overall height; the wave wavelength is 40 dp for determinate and 20 dp for indeterminate progress.
- `progress-indicator.color.contrast`: A linear determinate indicator ends with a stop indicator when the track has less than 3:1 contrast with its container or surrounding surface. Do not use a stop indicator on circular or indeterminate indicators. Inside another control, ensure at least 3:1 contrast; use the control's content color and omit the track when needed. See [Progress indicators specifications](https://m3.material.io/components/progress-indicators/specs).
- Use a flat active shape when the wave is too small to read. Use a wavy shape when the expressive treatment suits the product; it increases overall height. See [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines).
- Circular indicators default to 40 dp flat and 48 dp wavy, with a 4 dp thickness, 1.6 dp wave amplitude, and 15 dp wavelength.

### Motion and accessibility

- `progress-indicator.direction.rtl`: Mirror linear progress in RTL. Circular progress continues clockwise. See [Progress indicators specifications](https://m3.material.io/components/progress-indicators/specs).
- Give the indicator `progressbar` semantics and an accessible name describing the process and affected content. Expose the value for determinate progress. See [Progress indicators accessibility](https://m3.material.io/components/progress-indicators/accessibility).
- `progress-indicator.motion.reduced`: When motion is reduced, preserve the track and current progress state. See [Progress indicators accessibility](https://m3.material.io/components/progress-indicators/accessibility).
- Linear progress animates inline by default; circular determinate progress sweeps clockwise.

## Project decisions

- Support buffer and query modes as additional linear behaviors. Material's Expressive configurations define determinate and indeterminate progress; these modes do not expand the official design target.
- Circular indicators use the same active and track roles as linear indicators so both variants share one color mapping.

Current API details belong to the component source and the public [Progress indicators page](../../../apps/docs/components/progress-indicator.md).
