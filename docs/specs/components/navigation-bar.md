# Navigation bar: project design guide

## Scope

A navigation bar switches between three to five stable top-level destinations. It is for compact and medium layouts, not single tasks or desktop navigation. This project follows Material 3 Expressive's flexible navigation bar; the baseline navigation bar is no longer recommended.

## Design target

- `navigation-bar.adaptive.layout`: Use the flexible navigation bar in compact and medium layouts at the bottom. Use the vertical icon-over-label arrangement at compact widths and the horizontal icon-and-label arrangement at medium widths. For wider layouts, use a [navigation rail](https://m3.material.io/components/navigation-rail/overview). See [Navigation bar guidelines](https://m3.material.io/components/navigation-bar/guidelines).
- Keep three to five peer destinations in a stable order. Use tabs for related views within one destination and another navigation pattern when there are more destinations.
- Give destinations short visible labels and recognizable icons. At text scaling, allow the bar and labels to grow instead of clipping or removing labels. See [Navigation bar guidelines](https://m3.material.io/components/navigation-bar/guidelines).
- `navigation-bar.selection.indicator`: Show one active destination with the active indicator and selected icon treatment in the [anatomy and state figures](https://m3.material.io/components/navigation-bar/specs).
- `navigation-bar.color.selected`: Use the official semantic colors and keep icon contrast at or above 3:1. See [Navigation bar specifications](https://m3.material.io/components/navigation-bar/specs) and [accessibility](https://m3.material.io/components/navigation-bar/accessibility).
- Place a badge over the destination icon and use it only for meaningful updates or counts. See [Badge](badge.md).
- `navigation-bar.a11y.semantics`: Expose one labeled navigation landmark and a name for each destination. Mark the current destination distinctly, keep focus visible, and support keyboard and touch use. See [Navigation bar accessibility](https://m3.material.io/components/navigation-bar/accessibility).
- `navigation-bar.text.scaling`: Keep labels visible when text is enlarged; let the component grow and labels wrap. See [Navigation bar guidelines](https://m3.material.io/components/navigation-bar/guidelines).

## Project decisions

- Vertical items use a 56 by 32 dp active indicator, an 8 dp icon-row-to-label gap, and Label Medium. Horizontal items use a 40 dp indicator, 16 dp inline insets, a 4 dp icon-label gap, and Label Medium. Selection changes label color and icon treatment, not label weight.
- Use `surface-container` for the container; use `secondary-container` for the active indicator, `on-secondary-container` for the active icon and horizontal label, `secondary` for the active vertical label, and `on-surface-variant` for inactive content.
- Use the container color without a shadow.
- `navigation-bar.motion.selection`: Animate the indicator from the item center. Material shows expressive motion but leaves the Web transition implementation to the project.
- Destinations retain native link semantics. The application owns routing and whether destination state is preserved.
- Reselecting the active destination returns its screen to the top. The application owns this navigation policy.
- At 960 px and wider, compose a navigation rail instead. This breakpoint is project-defined; Material defines window classes without numeric boundaries.
- `mode="auto"` uses the compact item layout below 600 px and horizontal items from 600 px. This threshold is separate from the 960 px bar-to-rail threshold.
- Disabled content uses `on-surface` at 38% opacity because the selector has no disabled mapping.

Current API details belong to the component source and the public [Navigation bar page](../../../apps/docs/components/navigation-bar.md).
