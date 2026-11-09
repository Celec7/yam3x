# Checkbox: project design guide

## Scope

Checkboxes let people select multiple related options, show a group's partial selection, or toggle an option in a list. See [Checkbox guidelines](https://m3.material.io/components/checkbox/guidelines).

## Design target

### Use and selection

- Use checkboxes for multi-select options. Use radio buttons for one choice from a visible set, and switches for independent settings that take effect immediately. See [Checkbox guidelines: choosing a selection control](https://m3.material.io/components/checkbox/guidelines).
- `checkbox.state.indeterminate-mark`: Show the indeterminate mark when the control is in the indeterminate state, distinct from checked and unchecked. See the [Checkbox state figures](https://m3.material.io/components/checkbox/specs).
- An indeterminate parent represents partial child selection; selecting it selects all child options. See [Checkbox guidelines: parent and child options](https://m3.material.io/components/checkbox/guidelines).
- An error state may accompany checked, unchecked, or indeterminate selection. See [Checkbox specs: states](https://m3.material.io/components/checkbox/specs).

### Appearance and states

- Use the 18 dp container and check icon, 2 dp container corner, and 40 dp state layer shown in the [Checkbox anatomy and measurement figures](https://m3.material.io/components/checkbox/specs).
- Map the unselected outline to `on-surface-variant`; map the selected container and check icon to `primary` and `on-primary`. Keep the adjacent label on `on-surface` across selection states. Use the state-layer roles and opacities from the [Checkbox color and state figures](https://m3.material.io/components/checkbox/specs).
- Keep the error treatment visible with the error color roles shown in the [Checkbox state specifications](https://m3.material.io/components/checkbox/specs).

### Interaction and accessibility

- `checkbox.a11y.target`: Provide the 48 × 48 CSS px target corresponding to Material's 48 × 48 dp minimum. See [Checkbox specs: target area](https://m3.material.io/components/checkbox/specs).
- `checkbox.a11y.label-activation`: Let either the checkbox or its adjacent label select the option. See [Checkbox accessibility: labeling](https://m3.material.io/components/checkbox/accessibility).
- Preserve the native checkbox's Space activation and visible focus. See [Checkbox accessibility: keyboard navigation](https://m3.material.io/components/checkbox/accessibility).

## Project decisions

- Project-defined: A Checkbox represents one value and does not coordinate sibling controls. The parent form or selection owner derives an indeterminate state and applies parent changes to children, keeping group coordination with the owner of that selection.
- Project-defined: Keyboard focus uses a 44 px circular `secondary` ring with a 3 px stroke, centered in the 48 px target. This follows Material Web's focus-ring mechanics and the official focus-state figure. The 40 px state layer remains for hover and pressed feedback.
