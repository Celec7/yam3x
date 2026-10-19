# Switch: project design guide

## Scope

A switch controls one independent setting whose effect takes place immediately. It represents an on/off choice, including a setting shown in a list.

## Design target

### Use and selection

- Use a switch for an independent setting that takes effect immediately. Do not use it for mutually exclusive choices, multiple choices that require a separate Save action, or an action. See [Switch guidelines: switch or checkbox](https://m3.material.io/components/switch/guidelines).
- Pair the control with a short inline label that describes what happens when it is on; keep the label stable as the setting changes. A handle icon may reinforce the state when its meaning is clear. See [Switch guidelines: labeling and icons](https://m3.material.io/components/switch/guidelines) and [Switch accessibility: labeling](https://m3.material.io/components/switch/accessibility).

### Appearance and states

- `switch.geometry.track`: Use a 52 × 32 dp fully rounded track with a 2 dp outline when off. See [Switch specs: measurements](https://m3.material.io/components/switch/specs).
- `switch.color.roles`: Map track and handle colors to the semantic roles in the [Switch color and state specifications](https://m3.material.io/components/switch/specs).
- Map selected and unselected state-layer colors to the roles in the color and state figures. Keep the label on `on-surface`; supporting text may use `on-surface-variant`.
- The handle changes size for off, on, icon, and pressed states; when selected, it moves to the opposite side of the track. The state layer is 40 dp. Use the [Switch state and measurement figures](https://m3.material.io/components/switch/specs) for exact geometry.
- `switch.geometry.pressed-handle`: Expand the handle to 28 dp while pressed. See [Switch specs: pressed state](https://m3.material.io/components/switch/specs).
- `switch.a11y.target`: Provide an interactive target of at least 48 × 48 CSS px, corresponding to Material's 48 × 48 dp minimum. See [Switch specs: target area](https://m3.material.io/components/switch/specs).

### Interaction and accessibility

- `switch.behavior.immediate-effect`: Update the setting as soon as the switch is activated. See [Switch guidelines: usage](https://m3.material.io/components/switch/guidelines).
- `switch.behavior.keyboard`: A focused switch toggles with Space or Enter. See [Switch accessibility: keyboard interaction](https://m3.material.io/components/switch/accessibility).
- `switch.a11y.name-description`: The inline label provides the accessible name; supporting text may provide a description. See [Switch accessibility: labeling](https://m3.material.io/components/switch/accessibility).
- `switch.a11y.focus`: Keyboard focus lands on the handle, with its focus indicator around the handle rather than the full track. See [Switch accessibility: initial focus](https://m3.material.io/components/switch/accessibility).

## Project decisions

- Map selected icons to `primary` and the selected hover handle to `primary-container`, following the named token values in the specs selector. The color figure labels selected icons `on-primary-container`; the selector is the chosen mapping source for this project.
- When `icons="both"`, keep the unselected icon visible while disabled, using the disabled-unselected icon color at 38% opacity. This uses the disabled icon token available in the selector and keeps both icon variants available to the component.
