# Navigation bar: project design guide

## Scope

A navigation bar switches between three to five stable, top-level destinations. It is for compact and medium layouts, not single tasks or desktop navigation. This project follows Material 3 Expressive's flexible navigation bar; the baseline navigation bar is no longer recommended.

## Design target

- `navigation-bar.adaptive.layout`: Use the flexible navigation bar in compact and medium layouts. Place it at the bottom; use the compact vertical icon-over-label and medium horizontal icon-and-label arrangements shown in the [adaptive layout guidance](https://m3.material.io/components/navigation-bar/guidelines). For wider layouts, consider the [navigation rail](https://m3.material.io/components/navigation-rail/overview).
- Keep three to five peer destinations in a stable order. Use tabs for related views within one destination and another navigation pattern when there are more destinations. See [Navigation bar guidelines: usage](https://m3.material.io/components/navigation-bar/guidelines).
- Give destinations short visible labels and recognizable icons. At text scaling, allow the bar and labels to grow rather than clipping or removing labels. See [Navigation bar guidelines: text scaling](https://m3.material.io/components/navigation-bar/guidelines).
- `navigation-bar.selection.indicator`: Show one active destination using the active indicator and selected icon treatment in the [anatomy and state figures](https://m3.material.io/components/navigation-bar/specs).
- `navigation-bar.color.selected`: Use the official semantic colors and keep icon contrast at or above 3:1. See [Navigation bar specifications: color](https://m3.material.io/components/navigation-bar/specs) and [accessibility: contrast](https://m3.material.io/components/navigation-bar/accessibility).
- Place a badge over the destination icon, as shown in the [anatomy figures](https://m3.material.io/components/navigation-bar/specs). Use badges only for meaningful updates or counts. See [Badge](badge.md).
- `navigation-bar.a11y.semantics`: Expose one labeled navigation landmark and an accessible name for each destination. Mark the current destination distinctly, keep focus visible, and support keyboard and touch use. See [Navigation bar accessibility](https://m3.material.io/components/navigation-bar/accessibility).
- `navigation-bar.text.scaling`: Keep destination labels visible when text is enlarged. Let the component grow and labels wrap when needed. See [Navigation bar guidelines: text scaling](https://m3.material.io/components/navigation-bar/guidelines).

## Component token mapping

The official specs expose `Nav bar - Common`, `Nav bar - Item - Vertical`, and `Nav bar - Item - Horizontal` token groups. Map their semantic color roles to System tokens and their layout-specific measurements to component-owned values:

| Official token or role                                                                             | Project mapping                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `md.comp.nav-bar.container.color` (`surface-container`)                                            | `--_yam3x-navigation-bar-container-color` → `--md-sys-color-surface-container`                                                                                    |
| `md.comp.nav-bar.item.active.indicator.color` (`secondary-container`)                              | `--_yam3x-navigation-bar-active-indicator-color` → `--md-sys-color-secondary-container`                                                                           |
| `md.comp.nav-bar.item.active.icon.color` (`on-secondary-container`)                                | `--_yam3x-navigation-bar-active-icon-color` → `--md-sys-color-on-secondary-container`                                                                             |
| `md.comp.nav-bar.item.active.label-text.color` (`secondary`)                                       | `--_yam3x-navigation-bar-active-label-color` → `--md-sys-color-secondary`                                                                                         |
| `md.comp.nav-bar.item.inactive.icon.color` and `.inactive.label-text.color` (`on-surface-variant`) | `--_yam3x-navigation-bar-inactive-color` → `--md-sys-color-on-surface-variant`                                                                                    |
| Vertical indicator width 56dp and height 32dp; icon-label gap 4dp; container-between gap 6dp       | Component values define the 56×32dp indicator and 6dp compact item gap. The 4dp selector value describes indicator-to-icon alignment in the official arrangement. |
| Horizontal indicator height 40dp; leading and trailing space 16dp; icon-label gap 4dp              | Component values define a 40dp indicator, 16dp inset on each side, and 4dp horizontal icon-label gap.                                                             |
| `md.comp.nav-bar.container.shadow-color` and `.elevation`                                          | Project rendering choice: use the container color without a shadow.                                                                                               |

Navigation bar styles consume private `--_yam3x-navigation-bar-*` aliases declared on the component root. No navigation-bar custom-property override is part of the public API; documented props and slots are the customization surface.

## Project decisions

- Project-defined (`navigation-bar.motion.selection`): Selection feedback animates the indicator from the item center. Material shows expressive motion but leaves this component's web transition implementation to the project.
- Project-defined: Destinations represent page navigation and retain native link semantics. The consuming application owns routing and whether destination state is preserved or reset.
- Project-defined: Reselecting the active destination returns its screen to the top. The application owns this navigation policy.
- Project-defined breakpoint: At 960 px and wider, compose Navigation Rail in place of Navigation Bar; at narrower widths, use Navigation Bar. The numeric breakpoint is project-owned because Material defines window classes but not numeric boundaries.
- Project-defined breakpoint: `mode="auto"` uses compact item layout below 600 px and horizontal item layout from 600 px. This bar-layout threshold is separate from the 960 px bar-to-rail composition threshold above; neither value is an official Material breakpoint.
- Project-defined: The selector's enabled, hover, focus, and pressed color roles map to System colors and shared state opacities. Disabled rendering uses on-surface at 38% opacity because the component selector does not provide a disabled color mapping.
- Current item data, link attributes, Vue events, and examples belong to the component source and the public [Navigation bar page](../../../apps/docs/components/navigation-bar.md).
