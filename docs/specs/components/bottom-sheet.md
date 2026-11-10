# Bottom sheets: project design guide

## Scope

Bottom sheets present secondary content anchored to the bottom edge. This guide covers Material's standard and modal variants. See [Bottom sheets overview](https://m3.material.io/components/bottom-sheets/overview).

## Design target

### Variants and layout

- `bottom-sheet.variant.standard`: Use a standard sheet when people should continue interacting with the primary screen. It has no scrim and does not block the screen. Use a modal sheet for focused choices or actions that temporarily block the screen; place it over a scrim and provide a clear dismissal path. See [Bottom sheets guidelines: standard and modal](https://m3.material.io/components/bottom-sheets/guidelines).
- Keep content secondary to the screen's main task. The container is required; a drag handle and supporting content are optional when they suit the task. See [Bottom sheets specifications: anatomy](https://m3.material.io/components/bottom-sheets/specs).
- `bottom-sheet.geometry.wide`: On wider windows, use the maximum width and margins shown in the [measurement figure](https://m3.material.io/components/bottom-sheets/specs). Do not stretch the sheet to fill an expanded window.

### Interaction and accessibility

- `bottom-sheet.modal.focus`: A modal sheet blocks interaction with the background and keeps keyboard focus within the modal until dismissal. See [Bottom sheets accessibility](https://m3.material.io/components/bottom-sheets/accessibility).
- `bottom-sheet.a11y.resize`: When resizing is offered, provide both dragging and a single-pointer alternative. The resize control needs an accessible name, button semantics, visible focus, and the target size shown in [Bottom sheets accessibility](https://m3.material.io/components/bottom-sheets/accessibility).
- Use the light and dark color roles for the container, handle, and modal scrim shown in [Bottom sheets specifications](https://m3.material.io/components/bottom-sheets/specs). A standard sheet does not use a scrim.

## Project decisions

The following are project decisions.

- The sheet remains bottom-anchored at every width. A consuming layout may use the [Side sheet](https://m3.material.io/components/side-sheets/overview) when that pattern better fits an expanded screen.
- Standard is the default presentation; Material does not prescribe a default.
- The sheet may rest at a partial or expanded height. Height stops are ordered from lowest to highest, and closing preserves the selected stop.
