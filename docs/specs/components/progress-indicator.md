# Progress indicators: project design guide

## Scope

Progress indicators show the status of an ongoing process. This guide adopts Material 3 Expressive linear and circular indicators, including determinate and indeterminate behavior and flat or wavy active shapes. See [Progress indicators overview](https://m3.material.io/components/progress-indicators/overview).

## Design target

### Use and placement

- Use one indicator for a group of related loading items. For an almost immediate operation under 200 ms, use no indicator; use a Loading indicator for a short 200 ms to 5 s wait and a Progress indicator for a longer wait. Allow a person to leave the page during a long process when it can continue safely. See [Progress indicators guidelines: duration and usage](https://m3.material.io/components/progress-indicators/guidelines) and the [Loading indicator guide](loading-indicator.md).
- Place a Linear indicator at the edge of a loading container or page. Center a Circular indicator over the content being loaded or where new content will appear. See [Progress indicators guidelines: placement](https://m3.material.io/components/progress-indicators/guidelines).

### Values and appearance

- `progress-indicator.a11y.determinate-value`: Use determinate behavior when progress can be measured, and keep the displayed amount accurate. Use indeterminate behavior while a process is known to be active but its progress is unknown; change to determinate when measurements become available. Expose the current value only for determinate progress. See [Progress indicators accessibility: values](https://m3.material.io/components/progress-indicators/accessibility).
- Use `primary` for the active indicator and `secondary-container` for the track. Linear indicators use a 4 dp default thickness and adapt to their container width, with at least a 4 dp inset from each edge; avoid placing them in elements narrower than 40 dp. Circular indicators can scale between 24 dp and 240 dp, with very large sizes reserved for large windows. See [Progress indicators guidelines: responsive layout](https://m3.material.io/components/progress-indicators/guidelines) and the [measurement figures](https://m3.material.io/components/progress-indicators/specs).
- `progress-indicator.geometry.linear`: Use a 4 dp default thickness for a Linear indicator. See [Progress indicators specs: Linear measurements](https://m3.material.io/components/progress-indicators/specs).
- M3 Expressive supports flat and wavy active shapes. Use a wavy form when a more expressive treatment suits the product; it increases overall height. Use a flat form at very small sizes where the wave is difficult to see. See [Progress indicators guidelines: shapes](https://m3.material.io/components/progress-indicators/guidelines) and [specifications](https://m3.material.io/components/progress-indicators/specs).
- `progress-indicator.color.contrast`: A Linear determinate indicator ends with a stop indicator when the track has less than 3:1 contrast with its container or surrounding surface. Do not use it on Circular or indeterminate indicators. Inside a button or another component, ensure the active indicator has 3:1 contrast; it may use the control's text or icon color, with the track omitted when needed. See [Progress indicators specs: stop indicator and color](https://m3.material.io/components/progress-indicators/specs).

### Motion and accessibility

- `progress-indicator.direction.rtl`: Mirror Linear progress direction in RTL. Circular indicators continue clockwise. See [Progress indicators specs: direction](https://m3.material.io/components/progress-indicators/specs).
- Give the indicator `progressbar` semantics and an accessible name that describes the process and affected content. Expose the current value when determinate. See [Progress indicators accessibility: labeling and values](https://m3.material.io/components/progress-indicators/accessibility).
- `progress-indicator.motion.reduced`: When progress animation is reduced, preserve the indicator's track and current progress state. See [Progress indicators accessibility: motion](https://m3.material.io/components/progress-indicators/accessibility).
- A Linear indicator animates left-to-right by default; Circular determinate progress sweeps clockwise. Use the figures in the [Progress indicators specifications](https://m3.material.io/components/progress-indicators/specs) for motion behavior.

## Component token mapping

The official token selector exposes `Progress Indicator - Common`, `Linear - baseline`, and `Circular - baseline`; the thick Linear and Circular sets are deprecated. Expressive configurations are listed separately: thickness can vary and the active shape can be flat or wavy. The baseline token values below remain the source for defaults.

| Official token or requirement                                                                   | Project mapping                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linear height 4dp; active and track thickness 4dp; with-wave height 10dp                        | Private aliases default to 4px thickness and 3px wave amplitude, producing 10px total height.                                                                             |
| Linear `track-active-indicator-space` 4dp; stop indicator 4dp; trailing space 0                 | A 4px end inset and 4px stop indicator; the stop sits at the trailing end. `stopSize` is a component prop.                                                                |
| Linear wave amplitude 3dp; wavelength 40dp; indeterminate wavelength 20dp                       | `--_yam3x-linear-progress-wave-amplitude`, `--_yam3x-linear-progress-wave-wavelength`, and `--_yam3x-linear-progress-indeterminate-wave-wavelength` map those defaults.   |
| Circular size 40dp; with-wave size 48dp; active and track thickness 4dp                         | `--_yam3x-circular-progress-diameter-flat`, `--_yam3x-circular-progress-diameter-wavy`, and `--_yam3x-circular-progress-thickness` map the defaults.                      |
| Circular wave amplitude 1.6dp; wavelength 15dp                                                  | `--_yam3x-circular-progress-wave-amplitude` and `--_yam3x-circular-progress-wave-wavelength` map the defaults.                                                            |
| Active and stop color `primary`; track color `secondary-container`                              | Private color aliases reference `--md-sys-color-primary` and `--md-sys-color-secondary-container`. The Circular track uses the same `secondary-container` role.           |
| Linear end inset is at least 4dp and follows its container width; Circular size ranges 24–240dp | The linear default inset is 4px; callers can change geometry with documented CSS overrides. Circular defaults are 40px flat and 48px wavy; callers own responsive sizing. |

Progress indicator styles consume private `--_yam3x-*` Component aliases. Intentional `--yam3x-*` CSS overrides are listed on the public [Progress indicators page](../../../apps/docs/components/progress-indicator.md); internal progress values and buffer positions remain private.

## Project decisions

- Project-defined: `buffer` and `query` are additional linear API modes. Material's Expressive configurations define determinate and indeterminate behavior; these modes do not expand the official design target.
- Project-defined: The official color figure names Linear roles. Circular indicators use the same active and track roles so the two variants retain one shared color mapping.
