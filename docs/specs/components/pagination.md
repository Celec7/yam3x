# Pagination: project extension guide

## Scope

This project extension navigates a collection with a known total page count. It can accompany a table, list, or search result region. It is independent of data fetching and does not represent cursor-only navigation with a fabricated page count. Material 3 Expressive does not define a standalone Pagination component. Apply the [shared foundations](../foundations.md).

## Design target

- Compose page and directional actions using the adopted [Button](button.md) and [Icon button](icon-button.md) designs, preserving their keyboard access and readable labels. See [Buttons guidelines](https://m3.material.io/components/buttons/guidelines) and [Icon buttons accessibility](https://m3.material.io/components/icon-buttons/accessibility).
- Use tabular figures for changing page and result counts. See [Applying type: tabular numbers](https://m3.material.io/styles/typography/applying-type).
- Resize or change the presentation when available space is limited rather than reducing text and action targets. See [Adaptive design: adapting components](https://m3.material.io/foundations/layout/layout-overview/adaptive-design).

## Project decisions

### Anatomy and layout

The following assignments are project-defined. Use Label Large for compact page actions and Body Small for an optional range summary. The current page may use the emphasized Label Large counterpart; ordinary page labels stay baseline.

- Project-defined: Arrange previous, page choices, and next in reading order with 8 px gaps. Reserve at least 48 px for each compact page action's interactive area. A selected page uses Secondary Container and On Secondary Container with a Full corner role; unselected page actions have no persistent filled container.
- `pagination.layout.adaptive` (project-defined): Show the first, last, current, and nearby page numbers when they fit. Ellipses indicate omitted pages and are not interactive controls. In narrow containers use previous, a visible current/total summary, and next; keep the same current page through the presentation change.
- Project-defined: Place page-size selection and result summaries in a wrapping secondary group. They must not squeeze the primary navigation controls or require a fixed component width.

### Navigation and states

- Project-defined: Expose a named navigation region and identify the current page with its accessible current-page state. Use links for addressable destinations and buttons for in-place changes; do not expose current-page identity as a toggle-button pressed state.
- Project-defined: Previous and next are unavailable at the relevant boundary. An empty collection presents a zero-result summary and no actionable numbered pages. A single page may retain its summary without redundant navigation actions.
- `pagination.state.accepted` (project-defined): The application owns the requested page, accepted page, page size, and query result. Distinguish a pending request from the page actually displayed. Failure leaves the displayed page identifiable and provides recovery in the result region.
- Project-defined: A page-size change preserves the first visible record when the application can do so. If the total shrinks, the application resolves a valid page instead of leaving an unreachable current-page marker. Keep keyboard focus on a surviving equivalent control when the page window changes.
