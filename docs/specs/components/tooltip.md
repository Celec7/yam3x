# Tooltips: project design guide

## Scope

Tooltips add brief context to a UI element. This guide adopts Material's plain and rich variants. See [Tooltips overview](https://m3.material.io/components/tooltips/overview).

## Design target

- Use a plain tooltip to briefly name or describe an element, especially an icon-only control. Do not repeat a visible label or place critical information only in a tooltip. See [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines).
- `tooltip.geometry.plain`: Use the plain tooltip dimensions, color roles, spacing, and default placement shown in [Tooltips specifications](https://m3.material.io/components/tooltips/specs).
- Map the container to System `inverse-surface` / `inverse-on-surface`, System `corner-extra-small`, and the System body-small type metrics (12/16/400/0.4). Preserve the 24 dp height and 8 dp inline spacing in the specification.
- A rich tooltip may include an optional subhead, supporting text, and up to two text actions. Use it for supplemental context, not information a person must see before a consequential action. See [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines).
- Map the container to System `surface-container` and `corner-medium`, supporting text and subhead to `on-surface-variant`, and action labels to `primary`. Use the specified 12/8/16 dp container spacing and official type metrics.
- Place rich tooltips as shown in the [placement figures](https://m3.material.io/components/tooltips/specs), adjusting to stay within the viewport without covering the target.
- Plain tooltips appear on hover or focus on desktop and on touch-and-hold on mobile. See [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines).
- `tooltip.a11y.semantics`: Expose tooltip semantics and label interactive controls according to their own accessibility requirements. See [Tooltips accessibility](https://m3.material.io/components/tooltips/accessibility).
- `tooltip.a11y.keyboard`: Keep rich-tooltip focus linear and do not trap focus. See [Tooltips accessibility](https://m3.material.io/components/tooltips/accessibility).
- Keep critical information in the primary content flow. Use a dialog when a person must see or respond before continuing. See [Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines).

## Project decisions

- Project-defined: Tooltip content is supplemental. The process-specific flow determines whether an interruptive message is required. Interactive Rich tooltips use dialog semantics; their focus remains in page order and is not trapped.
- Project-defined: Plain and Rich content is bounded to the viewport and scrolls if it exceeds the available height. The Vue API also supports persistent display, explicit placement, and documented CSS overrides; these are project extensions.
