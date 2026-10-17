# Form fields: project design guide

## Scope

This project wrapper applies Material text-field presentation to native single-line and multi-line controls. Material's text-field anatomy and states remain the visual target.

## Design target

- `form-field.geometry.anatomy`: Use the filled or outlined treatment and the relationships among input, label, icons, supporting text, and optional counter shown in [Text field guidelines](https://m3.material.io/components/text-fields/guidelines) and [specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.geometry.focus-indicator`: Use the specified enabled and focused indicator geometry: Outlined fields use a 1dp enabled outline and a 3dp focused outline; Filled fields use the active-indicator dimensions defined by their component tokens. See [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.color.hover`: Show the hover state with the specified on-surface label/indicator roles and state layer. Keep the error state treatment distinct. See [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.color.error`: Keep input text and supporting text in their specified error-state roles; error hover changes the indicator, label, and trailing icon while retaining the base error color for supporting text. Do not rely on color alone to convey validation. See [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.color.contrast`: Distinguish enabled, focused, error, disabled, and read-only states using the color roles and state treatment in [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.a11y.label`: Associate the visible label and any supporting or error text with the input. Keep instructions and errors available to keyboard and assistive-technology users. See [Text field accessibility](https://m3.material.io/components/text-fields/accessibility).
- Preserve the documented field geometry and 56dp target size. A multi-line field keeps the same hierarchy while allowing its value to occupy multiple lines. See [Text field specifications](https://m3.material.io/components/text-fields/specs).

## Project decisions

- Project-defined: Specialized controls keep their own keyboard and accessibility behavior when composed inside the wrapper. Parsing, validation, submission, and current API remain owned by each control.
- Project-defined: The component maps System tokens through private Component aliases. Error hover blends the current error role with on-surface so the state adapts to generated themes; supporting text retains the base error role.
- Project-defined: Density may reduce the 56px default container, but the target stays at least 48px. The default field width is 270px and can be set with the `width` prop.
