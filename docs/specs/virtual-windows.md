# Shared virtual windows: project design guide

## Scope

These project decisions govern measured windows in Select, Autocomplete, Tree view, and TreeSelect. Material does not define a virtualization algorithm or a standalone VirtualList component. Windowing changes which records are mounted; the owning component still defines appearance, semantics, selection, and keyboard behavior. It does not imply paging, loading, or a grid.

## Design target

Retain the adopted [Menu](components/menu.md) presentation for choice rows and the [Tree view](components/tree-view.md) hierarchy and focus behavior. Content must remain readable as text and layout change, following the [shared design foundations](foundations.md). The viewport policies below are project-defined Web behavior.

## Project decisions

- `virtual.window.coordinates`: Cover the complete visible content region, including when no extra rows are rendered or container padding changes. Padding scrolls with the content; it must not leave visible records unmounted. Keep the first and last records reachable.
- `virtual.window.measurement`: Measure content instead of imposing an estimated fixed height. Retain the first visible record and its row-relative offset when heights change; clamp that offset when the record shrinks so it remains visible.
- `virtual.window.anchor`: Catalog insertions and removals preserve the first visible record and its row-relative offset. If it is removed, start at the next surviving record in the previous order, then the preceding survivor; if none survive, return to the beginning. Respect available scroll boundaries and treat synchronous updates as one change to the reading position.
- `virtual.window.navigation`: Explicit keyboard and search navigation takes priority over queued anchor restoration. Routine data reconciliation must not scroll back to an unchanged offscreen focus target. Restore lost owned focus through the component's recovery policy without taking unrelated focus.

Accepted values, complete record metadata, and required ancestor groups remain independent of the mounted window. Component guides own their selection, form, and loading contracts.
