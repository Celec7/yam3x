# Loading indicator: project design guide

## Scope

Material's Loading indicator communicates an active process whose progress cannot be measured. Use a Progress indicator when the process has measurable progress. See [Loading indicator overview](https://m3.material.io/components/loading-indicator/overview) and the [Progress indicators guide](progress-indicator.md).

## Design target

### Use and appearance

- Use the default configuration directly on a surface. Use the contained configuration when the indicator needs its own background to remain distinct from the content behind it. See [Loading indicator guidelines: configurations](https://m3.material.io/components/loading-indicator/guidelines).
- `loading-indicator.geometry.size`: Use the 48 dp overall footprint and 38 dp active shape shown in the [Loading indicator measurement figures](https://m3.material.io/components/loading-indicator/specs).
- When adapting the indicator to its placement, keep its overall size between 24 dp and 240 dp and preserve the container-to-active-shape ratio. Reserve very large indicators for large or extra-large windows. See [Loading indicator guidelines: responsive layout](https://m3.material.io/components/loading-indicator/guidelines).
- `loading-indicator.color.contrast`: Apply the configuration's color roles from the [Loading indicator color specifications](https://m3.material.io/components/loading-indicator/specs). Preserve at least 3:1 contrast between the active shape and its immediate background. See [Loading indicator accessibility: color contrast](https://m3.material.io/components/loading-indicator/accessibility).
- The active shape loops through seven morphing shapes and rotates continuously. See [Loading indicator guidelines: anatomy](https://m3.material.io/components/loading-indicator/guidelines).

### Interaction and accessibility

- `loading-indicator.a11y.unknown-value`: Give the indicator an accessible name describing the process it represents and do not expose an unknown amount as a numeric value. See [Loading indicator accessibility: labeling and progress](https://m3.material.io/components/loading-indicator/accessibility).

## Component token mapping

The official selector contains one Loading indicator token set. Its default active shape uses a 48 dp container footprint and a 38 dp shape; the optional contained configuration has its own color roles.

| Official token or requirement                                                                                                        | Project mapping                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `md.comp.loading-indicator.container.width` and `.container.height`: 48 dp; `md.comp.loading-indicator.active-indicator.size`: 38 dp | The Component layer maps the public container size override to a 48 px default and derives the active shape at 38/48 of the container. A documented active-size override can replace that ratio.            |
| `md.comp.loading-indicator.container.shape`: circular                                                                                | The container shape alias references `--md-sys-shape-corner-full`; consumers may override the project CSS hook.                                                                                             |
| `md.comp.loading-indicator.active-indicator.color`: primary                                                                          | The uncontained active color maps to `--md-sys-color-primary`.                                                                                                                                              |
| `md.comp.loading-indicator.contained.container.color`: primary-container; `.contained.active-indicator.color`: on-primary-container  | The contained configuration maps to `--md-sys-color-primary-container` and `--md-sys-color-on-primary-container`.                                                                                           |
| Active indicator contrast of at least 3:1                                                                                            | Keep the selected role visible against its immediate surface or contained background; validate contrast when consumers override colors.                                                                     |
| Seven-shape morphing sequence                                                                                                        | The registry renders the sequence with local polygon data and CSS clipping. The official guidance defines the shape sequence; polygon coordinates and the 4666 ms cycle are project implementation choices. |

The older `md.comp.loading-indicator.container.color` token is marked deprecated in the official selector. The uncontained configuration has no colored background; the contained configuration uses its current dedicated roles.

Loading indicator styles consume private `--_yam3x-*` Component aliases. Documented `--yam3x-loading-indicator-*` properties are project CSS extension hooks listed on the public [Loading indicator page](../../../apps/docs/components/loading-indicator.md). The seven shape values and animation duration remain implementation details.

## Project decisions

- Project sizing decision: The consumer owns responsive scaling through `--yam3x-loading-indicator-container-size`, within Material's 24–240 dp guidance. The active shape stays at the official 38/48 ratio unless the project-specific `--yam3x-loading-indicator-active-indicator-size` override is explicitly set.

- `loading-indicator.motion.reduced` (project-defined): Honor the shared reduced-motion preference by freezing the active shape while keeping the indicator visible.
