# Floating action buttons and Extended FABs: project design guide

## Scope

This guide covers FAB and Extended FAB as one project family. Material documents them separately: [FAB](https://m3.material.io/components/floating-action-button/overview) and [Extended FAB](https://m3.material.io/components/extended-fab/overview).

## Design target

- Reserve a FAB-family control for the screen's primary constructive action. Material recommends Medium FAB for most use and advises against multiple FABs on one screen. See [FAB guidelines](https://m3.material.io/components/floating-action-button/guidelines) and [Extended FAB guidelines](https://m3.material.io/components/extended-fab/guidelines).
- Use an Extended FAB when its visible label makes the action clearer. Keep the label concise and avoid wrapping or truncation; an icon is optional. See [Extended FAB guidelines](https://m3.material.io/components/extended-fab/guidelines).
- Use the current sizes, color styles, and state treatment shown in the [FAB specifications](https://m3.material.io/components/floating-action-button/specs) and [Extended FAB specifications](https://m3.material.io/components/extended-fab/specs). Use the specification figures for exact geometry.
- Use FAB, Medium FAB, and Large FAB sizes. Small FAB remains available but is no longer recommended. Extended FAB uses Small (56 dp), Medium (80 dp), or Large (96 dp); the baseline 56 dp Extended FAB is no longer recommended. Apply the specified typography tokens for each size, including title-medium for small Extended FAB.
- Use the six expressive color styles: primary, secondary, or tertiary, with either the matching container role or direct color role. Surface color is no longer recommended.
- Use a filled icon for an icon-only FAB. An Extended FAB needs a short action label; an icon is optional, but an icon without a label is not an Extended FAB. Keep labels to one or two words and prevent wrapping or truncation.
- On Web, show a concise action tooltip when an icon-only FAB is hovered or focused; compose the project Tooltip with the FAB rather than making it a built-in control. See [FAB guidelines](https://m3.material.io/components/floating-action-button/guidelines).
- Use one primary FAB per screen. Omit the FAB while its action is unavailable instead of presenting a disabled FAB.
- An icon-only FAB needs an action-describing accessible name and at least 3:1 icon-to-container contrast. Support keyboard focus and activation. See [FAB accessibility](https://m3.material.io/components/floating-action-button/accessibility) and [Extended FAB accessibility](https://m3.material.io/components/extended-fab/accessibility).
- For an Extended FAB, keep the visible label and icon within one focusable control. If an explicit accessible name is provided, it must begin with the same first word as the visible label. Do not add a tooltip; the visible label already names the action. See [Extended FAB accessibility](https://m3.material.io/components/extended-fab/accessibility).
- Adapt placement to the screen layout using the [responsive placement guidance](https://m3.material.io/components/floating-action-button/guidelines). Keep a FAB out of the way of other frequent controls and their visible focus.

## Project decisions

- Project-defined: The consuming layout owns placement and chooses the standard or extended form at responsive breakpoints. The FAB component itself does not position itself on the screen.
- Project-defined: Name the baseline 56 dp standard FAB size `default`, matching its role as the default FAB while keeping `medium` and `large` available as distinct expressive sizes.
- Project-defined: Expose the six expressive color styles and omit the legacy surface color style because Material no longer recommends it.
- Project-defined: Provide a lower-elevation FAB style as an extension; Material FAB specifications do not define this style.
- Project-defined: The `expanded` API can visually transform an icon-bearing Extended FAB into a FAB. When no icon is supplied, keep its required text label visible.
