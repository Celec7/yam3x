# Form fields: project design guide

## Scope

This project wrapper applies Material text-field presentation to native single-line and multi-line controls. Material's text-field anatomy and states remain the visual target.

## Design target

- `form-field.geometry.anatomy`: Use the filled or outlined treatment and the relationships among input, label, icons, supporting text, and optional counter shown in [Text field guidelines](https://m3.material.io/components/text-fields/guidelines) and [specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.geometry.focus-indicator`: Outlined fields use a 1dp enabled outline and a 3dp focused outline; filled fields use the active-indicator dimensions defined by their component tokens. Focus changes the stroke without moving the label or content. See [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.geometry.label-notch`: In the outlined treatment, the floating label sits in a transparent gap in the outline; the surface behind the field shows through and no fill is painted behind the label. See the outlined anatomy in [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.color.hover`: Show the hover state with the specified on-surface label and indicator roles and state layer. Keep the error state treatment distinct. See [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.color.error`: Keep input text and supporting text in their specified error-state roles; error hover changes the indicator, label, and trailing icon while retaining the base error color for supporting text. Do not rely on color alone to convey validation. See [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.color.contrast`: Distinguish enabled, focused, error, disabled, and read-only states using the color roles and state treatment in [Text field specifications](https://m3.material.io/components/text-fields/specs).
- `form-field.a11y.label`: Associate the visible label and any supporting or error text with the input. Keep instructions and errors available to keyboard and assistive-technology users. See [Text field accessibility](https://m3.material.io/components/text-fields/accessibility).
- Preserve the documented field geometry and 56dp target size. A multi-line field keeps the same hierarchy while allowing its value to occupy multiple lines. See [Text field specifications](https://m3.material.io/components/text-fields/specs).

## Project decisions

The choices below are project-defined; the wrapper owns text-field presentation, while parsing, validation, and submission belong to the composed control.

- Specialized controls keep their own keyboard and accessibility behavior when composed inside the wrapper.
- Density may reduce the 56px default container, but the target stays at least 48px. Use 270px as the default field width when the layout does not supply one.
- Error hover blends the current error role with on-surface so the state adapts to generated themes; supporting text retains the base error role.
