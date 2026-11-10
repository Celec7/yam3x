# App bars: project design guide

## Scope

App bars provide page context, navigation, and essential actions. This guide adopts Material 3 Expressive Search, Small, Medium flexible, and Large flexible variants; baseline Medium and Large are no longer recommended. See [App bars overview](https://m3.material.io/components/app-bars/overview).

## Design target

### Variants and content

- `app-bar.variants.geometry`: Use Search when search is a primary entry point, Small for a dense layout, Medium flexible for a larger headline, and Large flexible for greater headline emphasis. Each variant's anatomy and measurements come from [App bars specifications](https://m3.material.io/components/app-bars/specs).
- Keep the app bar at the top of the window, full width, and square-edged. Small is 64 dp high. Search uses a 64 dp row with a 56 dp search container; flexible variants grow to fit visible content.
- Show the page, section, or product headline. A leading control is for product navigation, commonly Back or opening expanded navigation. Show one or two essential trailing actions, with the more-used action first. Move larger action sets to a Toolbar. At smaller widths, collapse trailing actions into overflow. See [App bars guidelines](https://m3.material.io/components/app-bars/guidelines).
- `app-bar.flexible.headlines`: Medium flexible and Large flexible support up to two headline lines. Small headlines stay on one line without truncation.
- Use Body Large for Search, Title Large for Small, Headline Medium for Medium flexible, and Display Small for Large flexible. See [App bars specifications](https://m3.material.io/components/app-bars/specs).

### Search and scroll behavior

- `app-bar.search.contrast`: Search is an entry point to a separate search view. Its hint includes the word "Search". The container uses `surface-container` with `on-surface-variant` text and needs at least 3:1 contrast. See [App bars guidelines](https://m3.material.io/components/app-bars/guidelines) and [accessibility](https://m3.material.io/components/app-bars/accessibility).
- Give Search 8 dp leading and trailing action space and 8 dp between icon and label. Its width is 312 dp until available width exceeds 624 dp, then half the available width.
- `app-bar.scroll.collapse`: A flexible app bar may collapse to Small while scrolling and remain Small until the page returns to the top. On scroll, the container may use `surface-container` for separation. Do not transform another variant into Search. See [App bars guidelines](https://m3.material.io/components/app-bars/guidelines).

### Interaction and accessibility

- `app-bar.a11y.keyboard`: Place focus first on the leading interactive control, then move through actions with Tab. Space or Enter activates a focused control. Preserve visible focus and accessible names for actions and the headline. See [App bars accessibility](https://m3.material.io/components/app-bars/accessibility).
- Align content to logical leading and trailing edges so the layout mirrors in RTL while action order remains meaningful.

## Project decisions

- The Search app bar provides the entry point; the consuming page owns the search view, query state, and results.
- The component fills its parent. Place it in a page shell that spans the full window width.
- Flexible variants collapse on scroll by default; Search and Small remain pinned. The collapsed state may enter immediately or after the content leaves its original position. A scroll target must contain the app bar so sticky positioning and scroll tracking share a container.
- Search's responsive width follows the official 312 dp and half-width thresholds.
- Keep the flexible headline sizes at their specified scales.
