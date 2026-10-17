# Date and time input: project extension guide

## Scope

This project extension combines direct date or time entry in a form field. Material defines date entry within Date pickers and time entry within Time pickers, but not this combined standalone component.

## Design target

- Use the Material date-entry pattern and locale-aware date guidance from [Date picker guidelines](https://m3.material.io/components/date-pickers/guidelines) and [Date picker accessibility](https://m3.material.io/components/date-pickers/accessibility).
- For time entry, follow the hour, minute, and optional period fields in the [Time picker specifications](https://m3.material.io/components/time-pickers/specs) and the input-mode guidance in [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines).
- Present the extension as a labeled form field with supporting and error text following [Text fields guidance](https://m3.material.io/components/text-fields/overview). Material's input patterns inform this extension; they do not specify a new combined component.
- Show the required marker beside the label. Associate error text with the affected segments, announce it as an alert, and include the error icon shown in the recommended text-field treatment.

## Project decisions

- Project-defined: The component supports date-only, time-only, and combined date-time entry. A combined mode composes the Material date and time patterns.
- Project-defined: Parsing, validation, free-text acceptance, and locale policy belong to the consuming form. Keep typed input editable and explain invalid or incomplete values.
