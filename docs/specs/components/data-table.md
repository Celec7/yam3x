# Data table: project extension guide

## Scope

This project extension presents comparable records in rows and columns, with sorting, row selection, and optional pagination. It adopts a semantic data table rather than a spreadsheet-style editing grid. Material 3 Expressive does not define a standalone Data table specification in its [current component catalog](https://m3.material.io/components). Apply the [shared foundations](../foundations.md); the mappings below are project decisions.

## Design target

- Establish hierarchy with short titles and readable body content, and use tabular figures for comparable numbers. See [Applying type: roles and tabular numbers](https://m3.material.io/styles/typography/applying-type).
- Preserve alignment so repeated information is easy to scan. Material's [Lists guidelines: usage and alignment figures](https://m3.material.io/components/lists/guidelines) inform this principle, not table-row geometry or table semantics.
- Use the adopted [Checkbox](checkbox.md), [Menus](menu.md), [Toolbars](toolbar.md), and [Progress indicators](progress-indicator.md) designs when composing those controls. Their specifications do not define the table's own anatomy.
- Allow the composition to resize or change presentation as available space changes. See [Adaptive design: adapting components](https://m3.material.io/foundations/layout/layout-overview/adaptive-design).

## Project decisions

### Anatomy and typography

The following role assignments are project-defined. The table has a caption or associated title, column headers, and data rows. A separate action area may precede it; [Pagination](pagination.md) may follow it.

| Element                                   | Adopted type role | Resting text treatment                         |
| ----------------------------------------- | ----------------- | ---------------------------------------------- |
| Visible table title                       | Title Medium      | On surface                                     |
| Column heading                            | Title Small       | On surface; sorting has a separate indicator   |
| Cell content                              | Body Medium       | On surface; numbers align to the trailing edge |
| Supporting cell content and range summary | Body Small        | On surface variant; wrap when needed           |

- Project-defined: Use 16 px inline and 12 px block cell padding, with a 56 px minimum header and row height. Rows grow for wrapped content, language height, and enlarged text. These spacing-scale choices leave room for text and independent controls without adopting List row dimensions.
- Project-defined: Start-align text and keep numeric alignment consistent within each column. A truncated value must remain available through a keyboard- and touch-accessible detail path; a hover-only tooltip is insufficient.

### Appearance and adaptation

- Project-defined: Use a Surface table body, On Surface content, and Outline Variant horizontal separators. Use a Surface Container Low header to distinguish column labels. Avoid individual card shapes and elevation on every cell so cross-row comparison remains clear.
- Project-defined: Selected rows use Secondary Container with On Secondary Container content. Keep checkbox selection, hover, and keyboard focus distinguishable; selection does not require bolding every cell or changing row geometry.
- Project-defined: Keep the table within its content region with horizontal overflow when columns cannot fit. The application may provide a list-detail presentation for narrow containers; do not silently remove essential columns or change record identity when adapting.

### Interaction and content states

- Project-defined: Use native HTML table structure, named sorting controls, and the sorted header's accessible sort state. Row checkboxes select records; cells do not acquire grid-navigation behavior. Follow the [WAI table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/).
- Project-defined: Select-all affects selectable rows on the current page and communicates that scope. Selecting all matching server results requires a separately named application action. The application owns cross-page selection policy and data queries; stable record identity survives sorting and paging.
- Project-defined: Keep existing records visible during refresh when usable. Distinguish initial loading, an empty collection, no filter matches, and a failed request. Preserve column context and provide recovery for failures; use the [Empty state](empty-state.md) design only for an actual absence of content.
