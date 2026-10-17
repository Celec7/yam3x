# Number field: project extension guide

## Scope

This project extension combines a numeric editor with optional increment and decrement actions. It uses the adopted Material text-field presentation; parsing, stepping, and numeric commitment are project-defined Web behavior. It is intended for quantities and ordinary finite numeric values, not an arbitrary-precision calculation system. Apply the [shared foundations](../foundations.md).

## Design target

- Retain the filled or outlined anatomy, visible label, supporting text, and error treatment in the [Form field guide](form-field.md). Material permits currency prefixes and unit suffixes. See the prefix and suffix figures in [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines).
- Keep labels clear and provide an additional visual indication of error rather than relying on color alone. See [Text fields guidelines: label text and error icon](https://m3.material.io/components/text-fields/guidelines).
- Use tabular figures where changing digits should remain aligned. See [Applying type: tabular numbers](https://m3.material.io/styles/typography/applying-type).
- Increment and decrement actions use the adopted [Icon button](icon-button.md) treatment and target behavior rather than custom miniature hit areas.

## Project decisions

### Layout and appearance

- Project-defined: Values, labels, and supporting content retain the type and color roles owned by Form field. Increment and decrement controls occupy a trailing group; unit or currency text remains visibly associated with the value.
- `number-field.geometry.targets` (project-defined): Retain Form field's default container geometry and allow growth for enlarged text and language height. Reserve each step action's interactive area without overlap. Hide optional step actions when a text-only presentation is chosen; do not shrink the targets to force a fit.
- Project-defined: Keep the value editable without requiring the pointer controls. Do not add a slider-like track or encode magnitude through shape changes; those would suggest a different interaction model.

### Editing and commitment

- `number-field.editing.commit` (project-defined): Keep editing text distinct from a committed numeric value. Empty input is not zero. Temporary input such as a sign or trailing decimal separator remains editable until commitment; formatting must not repeatedly move the caret while typing.
- Project-defined: Interpret supported decimal and grouping separators using the field's locale. Apply display formatting at commitment, and expose a readable numeric value to assistive technology. Unit labels do not become part of the numeric value.
- `number-field.a11y.keyboard` (project-defined): Support direct editing and keyboard stepping with the semantics in the [WAI spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/). Preserve ordinary text-editing shortcuts and name the step actions in relation to the field. The editor is the Tab stop; pointer step actions return focus to it, since keyboard users can step directly.
- Project-defined: A step action adds or subtracts the configured step from the current valid edit, or the last committed value when the edit is invalid. An empty field starts from zero and brings the first result into bounds. Direct input need not match a step grid. Invalid direct input remains visible with a correction message rather than being silently clamped on blur. Disable a step action when it cannot produce a valid next value. Wheel scrolling does not change the value.
- `number-field.form.submit` (project-defined): Commit on Enter, leaving the editor, or validated form submission; an explicit step action also commits its result. Parsing failures and out-of-range values do not overwrite the last valid committed value. An invalid editor blocks form submission rather than silently submitting that previous value. Empty optional input commits an absent value; empty required input remains invalid. Reset follows the containing form's value contract.
