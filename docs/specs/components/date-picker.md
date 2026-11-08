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
- `date-picker.header.docked`: Docked calendars place month and year controls in separate groups. Each group has its own dropdown and adjacent range arrows.
- `date-picker.header.modal`: Modal calendars combine the month and year into one dropdown, with the month arrows beside it. The dropdown opens the year list; horizontal paging changes months.
- `date-picker.menu.docked`: Docked month and year menus are vertical listboxes. Each row is 48px high and full width; the selected row uses `secondary-container` with a leading check.
- `date-picker.calendar.weekdays`: Weekday headers use the locale's narrow one-character label. The full localized weekday remains the accessible name and hover title.
- `date-picker.calendar.today`: An unselected today uses the `primary` label and a 1dp `primary` outline. Selected and in-range treatments take precedence.
- `date-picker.state.selected-hover`: A selected range endpoint keeps its `primary` fill while hovered. The state layer adds the `on-primary` tint over that fill; it must not replace the selection with a state-layer-only surface.
- `date-picker.field.focus`: The docked field draws its outline in a separate layer, with a transparent notch around each floating label. Focus raises the stroke to 3px without moving layout; the inner input does not draw a second ring.
- `date-picker.modal.headline`: The modal headline is one line with an abbreviated month and numeric day and year. The accessible name remains the complete localized date.
- `date-picker.range.continuous`: A modal range calendar uses one visible weekday row above a continuous month sequence. Month titles separate the grids; the range view has no month paging header. Each grid keeps a visually hidden weekday header for assistive technology.
- `date-picker.compact.close`: A full-screen modal adds a close icon button in the header; the footer actions remain available.

### Appearance and accessibility

- Preserve the relationships among month and year controls, weekday headings, calendar grid, and confirmation actions shown in the [docked and modal anatomy figures](https://m3.material.io/components/date-pickers/specs).
- Keep keyboard movement and selection available throughout the calendar. Expose a complete localized date name and selection state; follow the published target-size and contrast requirements in [Date picker accessibility](https://m3.material.io/components/date-pickers/accessibility).

## Project decisions

- Project-defined: Vue exposes `DatePicker` and `DateRangePicker` as separate entry points with distinct value types, while sharing one component family. Material defines both selection patterns; separate entry points let TypeScript catch mismatched value shapes.
- Project-defined: On compact viewports, use a full-screen modal if a bounded dialog cannot fit without clipping. This adapts Material's compact guidance to a resizable web viewport.
- A standalone date input is a separate [project extension](date-input.md), not a new Material date-picker variant.
- Project-defined (**date-picker.behavior.locale-draft**): A language change preserves the provisional date selection, current view, and focused date. Parse pending text using its editing language, independently for each range endpoint, so translating the UI cannot reinterpret the date. Reformat untouched values and start a fresh language context after clearing.
