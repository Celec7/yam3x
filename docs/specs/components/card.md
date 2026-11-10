# Cards: project design guide

## Scope

A card groups related content and actions about one subject. Material cards may be passive containers or one actionable surface. See [Cards overview](https://m3.material.io/components/cards/overview).

## Design target

### Use and appearance

- Material defines Elevated, Filled, and Outlined cards. They serve the same function; choose a style by visual hierarchy. `card.color.roles`: Use `surface-container-low` for Elevated, `surface-container-highest` for Filled, and `surface` with `outline-variant` for Outlined. See [Cards guidelines: styles](https://m3.material.io/components/cards/guidelines) and [Cards specs: color roles](https://m3.material.io/components/cards/specs).
- Use a card for scannable, related information about one topic. Establish a clear hierarchy for headlines, media, supporting text, and actions. See [Cards guidelines: content](https://m3.material.io/components/cards/guidelines).
- Card size follows its content. The measurement figures show a 12 dp corner, 16 dp side padding, and up to 8 dp between cards. See [Cards specs: measurements](https://m3.material.io/components/cards/specs).

### Interaction and accessibility

- `card.behavior.actionable`: An actionable card uses button or link semantics with a clear name and responds to pointer and keyboard activation. See [Cards accessibility: interaction](https://m3.material.io/components/cards/accessibility).
- Make the whole card actionable only when it represents one clear action; do not combine a whole-card action with nested controls. See [Cards guidelines: actionable cards](https://m3.material.io/components/cards/guidelines).
- `card.a11y.visible-focus`: Only actionable cards receive a focus stop and interaction feedback. Use the 3 dp `secondary` focus indicator with a 2 dp offset from the token selector. Controls inside a passive card remain independently reachable. See [Cards accessibility: interaction](https://m3.material.io/components/cards/accessibility).
- Hide decorative media from assistive technology and provide appropriate text alternatives for informative media. See [Cards accessibility: media](https://m3.material.io/components/cards/accessibility).
- Use the state treatment shown for hover, focus, press, drag, and disabled states in the [Cards state specifications](https://m3.material.io/components/cards/specs).

### Collections

- Arrange card collections in a grid, vertical list, or carousel with a shared resting elevation. Keep collection filtering and sorting controls outside the collection. See [Cards guidelines: collections](https://m3.material.io/components/cards/guidelines).

## Project decisions

The following are project decisions.

- Passive cards use a neutral container so the component does not imply article semantics. Wrap one in `<article>` when the surrounding content needs that meaning.
- Cards support vertical, horizontal, and inline layouts beyond the Material vertical card.
- A disabled actionable card may keep a focus stop so users can discover the unavailable action. Use this only when that discovery helps.
