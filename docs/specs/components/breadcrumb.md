# Breadcrumbs: project extension guide

## Scope

Breadcrumbs show a page's position within a hierarchy and provide links to ancestor pages. Material 3 does not define a dedicated Breadcrumb component or visual contract.

## Design target

- Material 3 has no dedicated breadcrumb component or behavioral specification. Use Material [typography](https://m3.material.io/styles/typography/applying-type) and [color roles](https://m3.material.io/styles/color/the-color-system) when styling this project extension.
- Use the [WAI-ARIA breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) for Web navigation semantics and current-page indication. This is Web accessibility guidance, not a Material requirement.

## Project decisions

- Project-defined (`breadcrumb.extension.navigation-semantics`): Present the hierarchy as a compact navigation trail with links to ancestor destinations, a labeled navigation landmark, and a clear current-page item. Keep destinations as native links.
- Project-defined (`breadcrumb.extension.narrow-layout`): Preserve hierarchy and full accessible names at narrow widths. Wrap or shorten visible labels without causing page-level horizontal overflow.
- Project-defined: Map linked ancestors to the System primary color, the non-link current item to on-surface, and compact labels to System Label Large. Material defines these reusable roles, but not their mapping to breadcrumbs.
- Project-defined: Separators communicate hierarchy visually, remain decorative to assistive technology, and do not interrupt reading order. Keep focus, hover, and current-page treatments distinct.
