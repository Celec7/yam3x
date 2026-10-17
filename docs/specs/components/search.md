# Search: project design guide

## Scope

Search lets people enter a query and review suggestions or results. It is distinct from the Search app-bar variant, which is an entry point to a separate search view. See [Search overview](https://m3.material.io/components/search/overview).

## Design target

### Appearance and layout

- Use the contained style for new designs. Its bar stays filled and rounded when focused, and its outer margins change from 24dp to 12dp. The divided style is the baseline configuration and separates the bar and result list with a divider. See [Search guidelines](https://m3.material.io/components/search/guidelines) and [Search specifications: variants](https://m3.material.io/components/search/specs).
- `search.geometry.contained`: Use the 56dp bar height, 360–720dp nominal width, 24dp unfocused and 12dp focused pane margins, 24dp icons, and 4dp icon-to-text gaps from the [Search specifications](https://m3.material.io/components/search/specs).
- `search.state.focus`: Use a 3dp focus indicator with a 2dp outline offset. Map the indicator to the System secondary role. See [Search specifications: Search bar tokens](https://m3.material.io/components/search/specs).
- Map Search bar and input colors to the roles in the [Search color diagrams](https://m3.material.io/components/search/specs): the bar uses surface-container-high; full-screen results use surface-container-low; docked results use surface-container-high; supporting text and trailing icons use on-surface-variant; input and leading icon use on-surface.
- `search.adaptive.layout`: Use full-screen Search at compact widths and docked Search at medium or expanded widths. Docked results appear below the bar and use a scrim over page content. See [Search guidelines: responsive layouts](https://m3.material.io/components/search/guidelines).
- Keep the query visible while results are shown. The Back affordance releases focus and returns the bar to its original state. See [Search guidelines](https://m3.material.io/components/search/guidelines).

### Interaction and accessibility

- `search.behavior.query`: Provide suggestions or results in a list below the focused bar. The hint names the searchable content and also labels the input. Give icon buttons action-specific names and announce result updates. See [Search accessibility](https://m3.material.io/components/search/accessibility).
- `search.a11y.focus`: Support keyboard movement through controls and results, and keep focus within modal Search until it closes. See [Search accessibility](https://m3.material.io/components/search/accessibility).

## Project decisions

- Project-defined: Keep both `contained` and `divided` available in the Vue API. Contained remains the default and follows the Expressive recommendation; divided is retained as the baseline option for existing project designs.
- Project-defined: Map input and supporting text through the shared System body-large typography tokens so theme-wide type settings stay consistent.
- Project-defined: Search styles consume private Component aliases under `--_yam3x-search-*`. These aliases map shared System roles and Search-specific values; they are implementation details, not consumer CSS overrides.
- Project-defined: In `auto` layout, use the measured content-pane width to select docked Search at 600px or wider and full-screen Search below 600px.
- Project-defined: The feature using Search owns the searched data, result ranking, and what selecting a result does. Search owns query entry and the focused results surface.
- Project-defined: Search fits its available pane instead of overflowing to enforce the 360dp nominal minimum. In panes narrower than 408px while unfocused or 384px while focused, the bar may be narrower than 360px. Provide enough space to meet the official width range when the layout allows it.
