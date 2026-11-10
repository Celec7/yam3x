# Number field: project extension guide

## Scope

This project extension combines a numeric editor with optional increment and decrement actions. It uses the adopted Material text-field presentation; parsing, stepping, and numeric commitment are project-defined Web behavior. It is intended for quantities and ordinary finite numeric values, not an arbitrary-precision calculation system. Compose Material 3 has no number-field primitive; the closest composition is `OutlinedTextField` or `TextField` with trailing `IconButton`s. Apply the [shared foundations](../foundations.md).

## Design target

- Retain the filled or outlined anatomy, visible label, supporting text, and error treatment in the [Form field guide](form-field.md). Material permits currency prefixes and unit suffixes. See the prefix and suffix figures in [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines).
- Keep labels clear and provide an additional visual indication of error rather than relying on color alone. See [Text fields guidelines: label text and error icon](https://m3.material.io/components/text-fields/guidelines).
- Use tabular figures where changing digits should remain aligned. See [Applying type: tabular numbers](https://m3.material.io/styles/typography/applying-type).
- Increment and decrement actions use the adopted [Icon button](icon-button.md) treatment and target behavior rather than custom miniature hit areas.

## Project decisions

The following are project decisions.

### Layout and appearance

- Values, labels, and supporting content retain the type and color roles owned by Form field. Increment and decrement controls occupy a trailing group; unit or currency text remains visibly associated with the value.
- `number-field.geometry.targets`: Retain Form field's default container geometry and allow growth for enlarged text and language height. A step action reserves a 48 × 40 px minimum box using the shared touch-target width and a 40 px minimum height, with 4 px between the two actions; the default 56 px field resolves each box to 48 × 48 px. The editor is the only Tab stop, and pointer step actions are not Tab stops. Hide optional step actions when a text-only presentation is chosen; do not shrink the reserved boxes to force a fit.
- `number-field.geometry.padding`: The outlined composition adds 4 px block padding to the Form field container and control. The filled composition adds 4 px container block padding and a 16 px top inset with no bottom inset on the control, aligning the value with the floating label and the step row. These overrides preserve the 56 px container and replace, rather than add to, Form field's own block padding.
- Keep the value editable without requiring the pointer controls. Do not add a slider-like track or encode magnitude through shape changes; those would suggest a different interaction model.

### Editing and commitment

- `number-field.editing.commit`: Keep editing text distinct from a committed numeric value. Empty input is not zero. Temporary input such as a sign or trailing decimal separator remains editable until commitment; formatting must not repeatedly move the caret while typing.
- Interpret supported decimal and grouping separators using the field's locale. Apply display formatting at commitment, and expose a readable numeric value to assistive technology. Unit labels do not become part of the numeric value.
- `number-field.a11y.keyboard`: Support direct editing and keyboard stepping with the semantics in the [WAI spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/). Preserve ordinary text-editing shortcuts and name the step actions in relation to the field. The editor is the Tab stop; pointer step actions return focus to it, since keyboard users can step directly.
- A step action adds or subtracts the configured step from the current valid edit, or the last committed value when the edit is invalid. An empty field starts from zero and brings the first result into bounds. Direct input need not match a step grid. Invalid direct input remains visible with a correction message rather than being silently clamped on blur. Disable a step action when it cannot produce a valid next value. Wheel scrolling does not change the value.
- `number-field.form.submit`: Commit on Enter, leaving the editor, or validated form submission; an explicit step action also commits its result. Parsing failures and out-of-range values do not overwrite the last valid committed value. An invalid editor blocks form submission rather than silently submitting that previous value. Empty optional input commits an absent value; empty required input remains invalid. Reset follows the containing form's value contract.
