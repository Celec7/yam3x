# App bars: project design guide

## Scope

App bars provide page context, navigation, and essential actions. This guide adopts the Material 3 Expressive Search, Small, Medium flexible, and Large flexible variants; baseline Medium and Large are no longer recommended. See [App bars overview](https://m3.material.io/components/app-bars/overview).

## Design target

### Variants and content

- `app-bar.variants.geometry`: Use Search when search is a primary entry point, Small for a dense layout, Medium flexible for a larger headline, and Large flexible when the headline needs greater emphasis. Use the [App bars specifications](https://m3.material.io/components/app-bars/specs) for each variant's anatomy and measurements.
- Keep the app bar at the top of the window, full width, and square-edged. Search and Small are 64 dp high; flexible variants grow to fit visible content. See [App bars specs: dimensions](https://m3.material.io/components/app-bars/specs).
- Show the page, section, or product headline. A leading control is for product navigation, commonly Back or opening expanded navigation. Show one or two essential trailing actions, with the more-used action first. Move larger action sets to a Toolbar. At smaller widths, collapse trailing actions into overflow. See [App bars guidelines: content and actions](https://m3.material.io/components/app-bars/guidelines).
- `app-bar.flexible.headlines`: Medium flexible and Large flexible support up to two headline lines. Small headlines stay on one line without truncation. See [App bars guidelines: headline text](https://m3.material.io/components/app-bars/guidelines).
- Use the M3 headline type scale for each variant: Body Large for Search, Title Large for Small, Headline Medium for Medium flexible, and Display Small for Large flexible. See [App bars specs: typography](https://m3.material.io/components/app-bars/specs).

### Search and scroll behavior

- `app-bar.search.contrast`: Search presents an entry point to the separate search view. Its hint includes the word “Search”. The container uses `surface-container` with `on-surface-variant` text, and needs at least 3:1 contrast. See [App bars guidelines: Search](https://m3.material.io/components/app-bars/guidelines) and [App bars accessibility: contrast](https://m3.material.io/components/app-bars/accessibility).
- `app-bar.scroll.collapse`: Flexible app bars may collapse to Small while scrolling and remain Small until the page returns to the top. On scroll, the container may use `surface-container` for separation. Do not transform another variant into Search. See [App bars guidelines: scrolling](https://m3.material.io/components/app-bars/guidelines).

### Interaction and accessibility

- `app-bar.a11y.keyboard`: Place keyboard focus first on the leading interactive control, then move through actions with Tab. Space or Enter activates a focused control. Preserve visible focus and accessible names for actions and the page headline. See [App bars accessibility: keyboard navigation and labeling](https://m3.material.io/components/app-bars/accessibility).
- Align content to logical leading and trailing edges so the layout mirrors in RTL, while keeping action order meaningful. See [App bars guidelines: layout direction](https://m3.material.io/components/app-bars/guidelines).

### Token mapping

| Official Expressive token                              | Value or role                                                          | Component mapping                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `md.comp.app-bar.small.container.height`               | 64 dp                                                                  | `--_yam3x-app-bar-small-container-height`                                         |
| `md.comp.app-bar.small.search.container.height`        | 56 dp                                                                  | `--_yam3x-app-bar-search-container-height`                                        |
| `md.comp.app-bar.icon-button-space`                    | 0 dp                                                                   | `--_yam3x-app-bar-icon-button-space`                                              |
| Search leading/trailing space                          | 8 dp                                                                   | `--_yam3x-app-bar-search-action-space`                                            |
| Search icon-to-label space                             | 8 dp                                                                   | `--_yam3x-app-bar-search-icon-label-space`                                        |
| Search maximum width behavior                          | 312 dp until available width exceeds 624 dp, then half available width | `--_yam3x-app-bar-search-min-width` and `--_yam3x-app-bar-search-max-width`       |
| Search container / label                               | `surface-container` / `on-surface-variant`                             | `--_yam3x-app-bar-search-container-color` / `--_yam3x-app-bar-search-label-color` |
| Search container on scroll                             | `surface-container-highest`                                            | `--_yam3x-app-bar-search-container-color-on-scroll`                               |
| Small, Medium flexible, Large flexible headline styles | Title Large 22/28; Headline Medium 28/36; Display Small 36/44          | Variant-specific private typography mappings                                      |

The remaining System color, shape, motion, and density inputs are mapped to private Component aliases at the app bar root. Component rules consume only those aliases. The five documented `--yam3x-app-bar-*` CSS overrides are project-defined extension points; the official values remain the defaults. Material recommends keeping the flexible headline sizes at their specified scales.

## Project decisions

- Project-defined: The Search app bar provides the entry point; the consuming page owns the search view, query state, and results.
- Project-defined layout responsibility: The component fills its parent. Place it in a page shell that spans the full window width to meet Material's full-width placement guidance.
- Project-defined API mapping: `scrollBehavior` exposes `pinned`, `enter-always`, and `exit-until-collapsed`; Flexible variants default to `exit-until-collapsed`, while Search and Small default to `pinned`. An element `scrollTarget` must contain the app bar so sticky positioning and scroll tracking use the same container.
- Project-defined CSS extension: Search’s responsive width follows the official 312 dp and half-width thresholds. The five documented CSS overrides support local brand adjustments; they do not replace the default Material mapping.
