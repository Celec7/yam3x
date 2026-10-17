# Calendar: project extension guide

## Scope

This project extension exposes a calendar grid outside a date-picker surface. Material defines calendar anatomy and date selection within [Date pickers](https://m3.material.io/components/date-pickers/overview), not as a separate Calendar component.

## Design target

- Reuse the month heading, weekday headers, date grid, and date states shown in the [Date picker specifications](https://m3.material.io/components/date-pickers/specs). Do not infer a separate visual system from the Vue API.
- `calendar.typography.date-labels`: Use the Date picker date and weekday label roles: Body Large, 16sp, 24sp line height, weight 400, and 0.5sp tracking. See the Date picker token selector in [Date picker specifications](https://m3.material.io/components/date-pickers/specs).
- Follow the date picker's selection, keyboard, localization, contrast, and target-size guidance in [Date picker guidelines](https://m3.material.io/components/date-pickers/guidelines) and [accessibility](https://m3.material.io/components/date-pickers/accessibility).
- In the date grid, Home and End move to the first and last day of the month; Page Up/Down move by month and Shift+Page Up/Down by year. Shift+M opens month selection and Shift+Y opens year selection, following Date picker accessibility guidance.
- Keep calendar presentation and placement with the containing layout. Use the [Date picker guide](date-picker.md) for modal or docked picker behavior.

## Project decisions

- Project-defined: A standalone calendar grid is an extension that reuses the Material date-picker calendar so it remains visually and behaviorally consistent with the project's Date picker.
