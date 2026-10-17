# Date pickers: project design guide

## Scope

This guide covers Material date pickers with docked or modal presentation, single-date or range selection, and calendar or manual-entry views. See [Date pickers overview](https://m3.material.io/components/date-pickers/overview).

## Design target

### Presentation and selection

- Use docked or modal presentation according to the available layout and task. Follow the adaptive and dismissal guidance in [Date picker guidelines](https://m3.material.io/components/date-pickers/guidelines).
- Support calendar selection and direct date entry where the selected picker variant provides it. The manual-entry view remains part of the date picker. See [Date picker specifications](https://m3.material.io/components/date-pickers/specs).
- For range selection, distinguish the start and end dates and show the interval between them. Keep selected, today, unavailable, and range states as shown in the [calendar state figures](https://m3.material.io/components/date-pickers/specs).
- For modal range selection, browse months in a continuous vertical calendar as shown in [Date picker range guidelines](https://m3.material.io/components/date-pickers/guidelines). Keep single-date and docked calendars on their existing one-month paging behavior.
- Follow locale conventions for date order, month names, weekday labels, and spoken date names. Keep date entry editable rather than forcing an input mask. See [Date picker accessibility](https://m3.material.io/components/date-pickers/accessibility).

### Appearance and accessibility

- Preserve the relationships among month and year controls, weekday headings, calendar grid, and confirmation actions shown in the [docked and modal anatomy figures](https://m3.material.io/components/date-pickers/specs).
- Keep keyboard movement and selection available throughout the calendar. Expose a complete localized date name and selection state; follow the published target-size and contrast requirements in [Date picker accessibility](https://m3.material.io/components/date-pickers/accessibility).

## Project decisions

- Project-defined: Vue exposes `DatePicker` and `DateRangePicker` as separate entry points with distinct value types, while sharing one component family. Material defines both selection patterns; separate entry points let TypeScript catch mismatched value shapes.
- Project-defined: On compact viewports, use a full-screen modal if a bounded dialog cannot fit without clipping. This adapts Material's compact guidance to a resizable web viewport.
- A standalone date input is a separate [project extension](date-input.md), not a new Material date-picker variant.
