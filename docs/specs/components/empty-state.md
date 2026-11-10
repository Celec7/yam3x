# Empty state: project extension guide

## Scope

This project extension explains an empty content region and, when useful, offers a next action. It covers an unused collection and an empty search or filter result. Loading, request failures, and completed-task results have different meanings and are not automatically rendered as empty content. Compose has no EmptyState primitive; Column, Icon or Image, Text, and Button compose it. Apply the [shared foundations](../foundations.md).

## Design target

- Establish a clear title and supporting-text hierarchy using the roles in [Applying type](https://m3.material.io/styles/typography/applying-type).
- Use optional expressive imagery intentionally. Abstract shapes can enrich decorative moments but have no inherent semantic meaning; they must not obscure clarity. See [Shape principles: sparing use and aesthetic moments](https://m3.material.io/styles/shape/overview-principles).
- Choose action emphasis according to the [Buttons guide](button.md), using a filled action sparingly for the most important next step. See [Buttons guidelines: usage](https://m3.material.io/components/buttons/guidelines).
- Let content resize and reflow with its containing region. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design).

## Project decisions

The following are project decisions. A short explanatory title is required; a description, image, and action group are optional.

| Context                      | Title          | Description |
| ---------------------------- | -------------- | ----------- |
| Embedded collection or panel | Title Medium   | Body Medium |
| Main empty destination       | Headline Small | Body Large  |

- Use On Surface for the title and On Surface Variant for the description, on the inherited content surface. Do not add a card or raised background merely because content is absent. The title is a level-3 heading by default so an empty region remains identifiable in the document outline; callers override the level for a page title or a different surrounding hierarchy.
- Use 24 px region padding, 16 px between imagery and text or text and actions, and 8 px between title and description. Center a short standalone message; use leading alignment when the surrounding section or longer explanation calls for it. Keep the text block around 40 characters wide where practical, allowing natural wrapping and growth.
- An optional 48 px symbol or larger illustration supports the explanation rather than replacing it. Decorative imagery is hidden from assistive technology; informative imagery receives an appropriate alternative. Render current-color artwork with On Surface Variant so it stays supporting content; expose an illustration-color override for a different surface or intentional emphasis.
- Explain whether the collection has no items yet or the current query has no matches. Offer creation for the former and an appropriate query or filter action for the latter when available. Do not imply that a failed request returned an empty collection.
- Keep existing section titles, search controls, filters, and useful navigation in place. A table may retain its headers around an empty body. The message occupies the affected region without taking over unrelated content.
- `empty-state.content.adaptive`: Actions remain keyboard- and touch-accessible and wrap without truncating their labels. Empty-state appearance does not automatically move focus. After a user-initiated query, the containing result region may announce the result once rather than making every static empty message a live alert.
