# Radio button: project design guide

## Scope

Radio buttons let people choose one option from a visible set. See [Radio button guidelines](https://m3.material.io/components/radio-button/guidelines).

## Design target

### Use and selection

- Use radio buttons for one-of-many choices. Material recommends them for five or fewer visible choices; use another selection pattern when options are numerous or space is constrained. See [Radio button guidelines: choosing a selection control](https://m3.material.io/components/radio-button/guidelines).
- Present the options together, preferably as a vertical list, and pair each radio with a clear adjacent label. Give the group an accessible name that describes its category. See [Radio button guidelines: placement](https://m3.material.io/components/radio-button/guidelines) and [Radio button accessibility: labeling](https://m3.material.io/components/radio-button/accessibility).
- Only one option in a group can be selected. Guidelines recommend keeping one option selected. Accessibility guidance permits a group to start with no selection; keyboard focus then enters at the first option. See [Radio button guidelines: choosing a selection control](https://m3.material.io/components/radio-button/guidelines), [Radio button specs: states](https://m3.material.io/components/radio-button/specs), and [Radio button accessibility: keyboard navigation](https://m3.material.io/components/radio-button/accessibility).

### Appearance and states

- Map selected and unselected radio icons to the semantic roles in the [Radio button color specifications](https://m3.material.io/components/radio-button/specs). Keep each option label on `on-surface` across states.
- Use the 20 dp icon, 40 dp state layer, and 48 dp target shown in the [Radio button anatomy and measurement figures](https://m3.material.io/components/radio-button/specs).

### Interaction and accessibility

- Tab enters the selected option when one exists. Arrow keys move focus and selection; Space selects the focused option. Activating the selected option does not clear the group. See [Radio button accessibility: keyboard navigation](https://m3.material.io/components/radio-button/accessibility).

## Project decisions

- The public group API remains nullable so callers can represent a state with no meaningful default. This follows the Accessibility allowance; examples and product interfaces should follow the Guidelines recommendation to preselect an option when appropriate.
- The group wrapper, group label and description, per-option supporting description, invalid state, and secondary focus outline are project extensions around the Material radio control.
- Component styles consume local `--_yam3x-radio-*` aliases that map to shared System color, type, motion, and state-opacity tokens. The 20 dp icon, 40 dp state layer, 48 dp target, and selected/unselected state-layer roles follow the component specification; option typography uses the shared body-large role by project choice.
