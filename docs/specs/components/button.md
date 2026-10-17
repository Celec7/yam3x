# Buttons: project design guide

## Scope

Buttons perform actions with a clear visual hierarchy from high emphasis to low emphasis. The Material 3 Expressive button family includes standard and toggle buttons, five color styles, five sizes, and round or square shapes.

## Design target

### Use and selection

- `button.style.variants`: Provide the five Material styles: elevated, filled, tonal, outlined, and text. See [Buttons specs: variants](https://m3.material.io/components/buttons/specs).
- Use filled for the most important action and sparingly; use elevated sparingly, tonal or outlined for medium emphasis, and text for the lowest emphasis. Use a leading icon only when it reinforces the action. See [Buttons guidelines: usage and color styles](https://m3.material.io/components/buttons/guidelines).
- Toggle buttons represent persistent binary selection. Their selected and unselected colors and shapes follow the Expressive specifications; text style is not supported. See [Buttons guidelines: toggle buttons](https://m3.material.io/components/buttons/guidelines) and [Buttons specs: variants and color](https://m3.material.io/components/buttons/specs).
- Expressive buttons offer extra-small through extra-large sizes and round or square shapes. Use the [Buttons size and shape figures](https://m3.material.io/components/buttons/specs) for exact geometry.
- Use Label Large for extra-small and small labels, Title Medium for medium, Headline Small for large, and Headline Large for extra-large. See the [Buttons size token sets](https://m3.material.io/components/buttons/specs).
- Use icon-to-label gaps of 4, 8, 8, 12, and 16 dp for extra-small through extra-large buttons. See the [Button size measurements](https://m3.material.io/components/buttons/specs).

### Appearance and states

- `button.color.roles`: Apply the semantic container and label roles shown for the five styles and toggle selection in the [Buttons color specifications](https://m3.material.io/components/buttons/specs).
- Use the state-layer color roles shown in the color specifications.
- Enabled filled, tonal, and elevated containers need at least 3:1 contrast with the background; outlined and text labels need at least 3:1 contrast. See [Buttons accessibility: color contrast](https://m3.material.io/components/buttons/accessibility).
- `button.color.disabled-state`: Disabled buttons use the disabled colors and elevation shown in the [Buttons state specifications](https://m3.material.io/components/buttons/specs).
- `button.shape.round-rest`: Round buttons use fully rounded corners at rest. Square and pressed shapes vary by size; press feedback morphs toward a more square shape. See the [Buttons shape and measurement figures](https://m3.material.io/components/buttons/specs).
- Shape morphs use the spring parameters specified for button presses. See the [Buttons pressed shape token sets](https://m3.material.io/components/buttons/specs).

### Labels and accessibility

- `button.label.single-line`: Keep the visible label concise and fully visible on one line. Material recommends one to three words and sentence case. See [Buttons guidelines: label text](https://m3.material.io/components/buttons/guidelines) and [Buttons accessibility: 200% text size](https://m3.material.io/components/buttons/accessibility).
- `button.a11y.visible-focus`: Keep keyboard focus visible. See [Buttons accessibility: keyboard navigation](https://m3.material.io/components/buttons/accessibility).
- Tab reaches a button, and Space or Enter activates it. The accessible label should match the visible label. See [Buttons accessibility: keyboard navigation and labeling](https://m3.material.io/components/buttons/accessibility).

## Project decisions

- `button.a11y.small-hit-target` (project-defined): A small visual Button has a 48 × 48 CSS px interactive area. This extends the target-area guidance for extra-small and small icon buttons to the shared labeled Button. See [Buttons specs: target areas](https://m3.material.io/components/buttons/specs).
- `button.toggle.aria-state` (project-defined): Expose toggle selection through the button's accessible pressed state so assistive technology can report its current value.
- Project-defined: Approximate the button press spring with a CSS spatial curve and duration on Web; the official damping and stiffness values do not map directly to CSS transitions.
- Project-defined: Render a Button used for navigation as a native anchor so it retains link semantics and navigation behavior.
- Project-defined extension: `#trailing-icon` can place an icon after the label in LTR. Material places the optional icon before the label in LTR and after it in RTL; prefer direction-aware placement through the leading icon slot for official anatomy.
