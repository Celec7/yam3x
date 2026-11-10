# Data table: project extension guide

## Scope

A data table presents comparable records in rows and columns with filtering, sorting, selection, and optional pagination. It uses semantic table structure, not an editable spreadsheet grid. [Pagination](pagination.md) may follow the table. Material 3 Expressive has no standalone Data table specification in its [component catalog](https://m3.material.io/components). Compose Material 3 has no table primitive; its closest composition is rows and columns of `ListItem`-like content with `Checkbox`, `DropdownMenu`, `Button`, and `LinearProgressIndicator`. Apply the [shared foundations](../foundations.md).

## Design target

- Use short titles, readable body content, and tabular figures for comparable numbers. See [Applying type](https://m3.material.io/styles/typography/applying-type).
- Keep repeated information aligned for scanning. The [Lists guidelines](https://m3.material.io/components/lists/guidelines) inform alignment, not table geometry or semantics.
- Compose [Buttons](button.md), [Checkbox](checkbox.md), [Menus](menu.md), [Toolbars](toolbar.md), and [Progress indicators](progress-indicator.md) from their adopted project designs. Those components do not define the table anatomy.
- Use a multi-select menu when a filter accepts several values. Keep choices visible and editable until dismissal, with checkmarks and selected-item highlights. See [Expressive Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Adapt the composition to available space. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design).

## Project decisions

### Anatomy and typography

| Element                              | Type role    | Resting treatment                               |
| ------------------------------------ | ------------ | ----------------------------------------------- |
| Visible table title                  | Title Medium | On surface                                      |
| Static column heading                | Title Small  | On surface                                      |
| Sorting action label                 | Label Large  | Text Button color; separate direction indicator |
| Cell content                         | Body Medium  | On surface; numbers align to the trailing edge  |
| Supporting content and range summary | Body Small   | On surface variant; wrap when needed            |

- Use 16 px inline and 12 px block cell padding, with a 56 px minimum header and row height. Rows grow for wrapped content, language height, and enlarged text.
- Start-align text and keep numeric alignment consistent within a column. A truncated value needs a keyboard- and touch-accessible detail path; a hover-only tooltip is insufficient.
- Size a selectable leading column from the shared touch-target size plus both inline paddings. Keep a filterable header's trailing inset on the shared 8 px spacing token. Derive fixed-column offsets from measured header cells, not standalone constants. Keep the 20 px sort icon and 40 rem default minimum documented with the table geometry.

### Appearance and adaptation

- Use a Surface body, On Surface content, Outline Variant horizontal separators, and a Surface Container Low header. Avoid per-cell card shapes and elevation so rows remain comparable.
- Selected rows use Secondary Container and On Secondary Container. Keep checkbox selection, hover, and keyboard focus distinguishable without changing row geometry.
- Keep the table within its content region and allow horizontal overflow. A narrow layout may switch to list-detail; do not silently remove essential columns or change record identity.
- Keep the associated title outside horizontal scrolling. Start with a 40 rem table minimum and let layouts adjust it to content.

### Sorting and selection

- `data-table.sort.affordance`: Present sorting as a compact text Button around the column name and direction indicator. Keep the container transparent and use the adopted Button's hover, focus, pressed shape, and touch target. Do not extend the state layer across unused header space. See [Expressive text button states](https://m3.material.io/components/buttons/specs).
- `data-table.sort.pipeline`: Use native table structure, named sorting controls, and the sorted header's accessible sort state. Local sorting precedes pagination, preserves ties, and restores supplied order when cleared. Rows do not acquire grid navigation. Follow the [WAI table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/).
- `data-table.selection.page`: Select-all affects selectable rows on the current page and states that scope. Selecting all server results requires a separately named application action. The application owns cross-page selection, queries, and stable record identity; a selection request must not replace its accepted key set.
- `data-table.query.accepted`: A server request does not advance the displayed page or sort marker until its result is accepted. Preserve the accepted snapshot on failure. Applications own cancellation and reconciliation.
- `data-table.content.states`: Keep usable records during refresh. Distinguish initial loading, empty collection, no filter matches, and failed request. Preserve column context and recovery. Use [Empty state](empty-state.md) only for actual absence.
- `data-table.focus.recovery`: If a built-in recovery action disappears while focused, return focus to the persistent table region. Do not take focus that has moved to unrelated content.

### Column filtering

- `data-table.filter.pipeline`: Combine values within one column with OR and active columns with AND. Filter the complete client collection before sorting and pagination, so totals and page selection describe the same result set. Do not mutate records or clear retained selection keys.
- `data-table.filter.draft`: Give each filterable header a separately named menu trigger. Edit multiple choices as a draft; Apply commits them together, Clear removes that column's constraint, and dismissal discards edits. Keep menu choices as single-action rows. Keep the draft usable through a language change and return focus to the trigger after Apply or Clear.
- `data-table.filter.accepted`: Filter requests return to the first page and include other accepted conditions. Only accepted filters change the trigger's active marker and displayed results. A failed request preserves accepted filters and records.

### Fixed context

- `data-table.fixed.context`: Optionally retain the header at the block start and chosen identity or action columns at the logical inline edges. Preserve one native table and source order rather than cloning headers or controls. Measure rendered column widths so neighboring fixed columns stay aligned as content, language, or density changes. Keep the enabled selection column with start-fixed columns.
- `data-table.fixed.adaptation`: Keep fixed cells opaque with the header or current row surface, including selected and hovered states. Intersections appear above both layers. Account for fixed regions when scrolling focused controls into view. Release inline fixation when the combined groups would cover the whole scroll region; all columns remain reachable by scrolling.
