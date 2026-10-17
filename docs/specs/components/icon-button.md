# Icon buttons: project design guide

## Scope

An icon button performs a compact action represented by an icon. A toggle icon button represents a persistent binary state. See [Icon buttons overview](https://m3.material.io/components/icon-buttons/overview).

## Design target

- Use the current filled, tonal, outlined, or standard styles according to action emphasis. Filled is the highest-emphasis style. See [Icon button guidelines](https://m3.material.io/components/icon-buttons/guidelines).
- Use an icon that clearly communicates the action. A toggle is for a true binary choice, not a one-shot action; expose its selected state. See [Icon button specifications](https://m3.material.io/components/icon-buttons/specs).
- Use a filled icon for a default icon button. For toggles, use an outlined icon when unselected and its filled version when selected. If no filled version exists, increase the icon weight to semibold, or bold when needed. See [Icon button guidelines: icon](https://m3.material.io/components/icon-buttons/guidelines).
- `icon-button.a11y.target`: Give every icon button an accessible name that describes its action and a 48 × 48 dp minimum target, including when the visible button is smaller. Keep keyboard focus and activation available. See [Icon button accessibility](https://m3.material.io/components/icon-buttons/accessibility).
- Keep icon and state contrast at or above 3:1. Use the size, width, shape, and color mappings in the [Icon button specifications](https://m3.material.io/components/icon-buttons/specs).
- On Web, compose a concise Tooltip for icon-only actions on hover/focus. Keep the icon button's accessible name independent of the tooltip. See [Icon button accessibility](https://m3.material.io/components/icon-buttons/accessibility).

## Project decisions

- Project-defined: `IconButton` represents actions and `IconToggleButton` represents binary selection. The toggle model and `#selected-icon` slot follow Vue composition conventions; role-radio activation keeps an already selected item selected. Public props, defaults, and link handling belong to the source and public [Icon button page](../../../apps/docs/components/icon-button.md).
- Project-defined: Keep component geometry as private implementation tokens and use Material system color roles for theming. This avoids exposing a second set of color and dimension overrides for a compact component.
