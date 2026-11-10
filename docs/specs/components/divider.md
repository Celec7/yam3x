# Divider: project design guide

## Scope

A divider is a thin, passive line that groups content in a list or container and can reinforce parent/child hierarchy. See [Divider overview](https://m3.material.io/components/divider/overview).

## Design target

### Use and appearance

- Use a full-width divider between larger sections or to distinguish interactive from non-interactive content. Use an inset divider between related items, aligned with leading content such as an icon or avatar. A vertical divider can structure side-by-side content on a larger screen. See [Divider guidelines: variants](https://m3.material.io/components/divider/guidelines).
- `md.comp.divider.thickness`: Use a 1 dp line by default. `md.comp.divider.color`: Map to the System `outline-variant` role. The default-light token selector displays `#CAC4D0`; the shared theme scheme owns the resolved color. Material describes dividers as decorative and sets no contrast minimum. See [Divider specs: color](https://m3.material.io/components/divider/specs) and [Divider accessibility](https://m3.material.io/components/divider/accessibility).
- `divider.geometry.inset`: Preserve the measured 16 dp leading inset and 16 dp middle inset on both sides. Full-width dividers span their container. The 4 dp divider-to-supporting-text spacing and 8 dp right/bottom margins belong to the containing layout rather than the line. See the [Divider measurement figures](https://m3.material.io/components/divider/specs).
- Prefer open space when it communicates a grouping clearly; repetitive list items may need only spacing. See [Divider guidelines: spacing](https://m3.material.io/components/divider/guidelines).

### Interaction and accessibility

- A divider is decorative by default: it does not take focus or intercept interaction. See [Divider accessibility: decorative dividers](https://m3.material.io/components/divider/accessibility).

## Project decisions

The following are project decisions.

- The component defaults to decorative semantics and permits a separator role when the boundary itself conveys meaningful structure.
- Horizontal and vertical dividers are distinct component entries with size and color customization. A vertical divider needs a parent height supplied by its layout.
- Map 1 dp to 1 CSS px on Web. Inset presets apply the measured 16 dp inset to the leading edge, the trailing edge, or both, and theme-level overrides remain available.
