# Empty state: project extension guide

## Scope

This project extension explains an empty content region and, when useful, offers a next action. It covers an unused collection and an empty search or filter result. Loading, request failures, and completed-task results have different meanings and are not automatically rendered as empty content. Material 3 Expressive does not define a standalone Empty state component. Apply the [shared foundations](../foundations.md).

## Design target

- Establish a clear title and supporting-text hierarchy using the roles in [Applying type](https://m3.material.io/styles/typography/applying-type).
- Use optional expressive imagery intentionally. Abstract shapes can enrich decorative moments but have no inherent semantic meaning; they must not obscure clarity. See [Shape principles: sparing use and aesthetic moments](https://m3.material.io/styles/shape/overview-principles).
- Choose action emphasis according to the [Buttons guide](button.md), using a filled action sparingly for the most important next step. See [Buttons guidelines: usage](https://m3.material.io/components/buttons/guidelines).
- Let content resize and reflow with its containing region. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design).

## Project decisions

### Anatomy and typography

The following assignments are project-defined. A short explanatory title is required; a description, image, and action group are optional.

| Context                      | Title          | Description |
| ---------------------------- | -------------- | ----------- |
| Embedded collection or panel | Title Medium   | Body Medium |
| Main empty destination       | Headline Small | Body Large  |

- Project-defined: Use On Surface for the title and On Surface Variant for the description, on the inherited content surface. Do not add a card or raised background merely because content is absent.
- Project-defined: Use 24 px region padding, 16 px between imagery and text or text and actions, and 8 px between title and description. Center a short standalone message; use leading alignment when the surrounding section or longer explanation calls for it. Keep the text block around 40 characters wide where practical, allowing natural wrapping and growth.
- Project-defined: An optional 48 px symbol or larger illustration supports the explanation rather than replacing it. Decorative imagery is hidden from assistive technology; informative imagery receives an appropriate alternative.

### Meaning and recovery

- Project-defined: Explain whether the collection has no items yet or the current query has no matches. Offer creation for the former and an appropriate query or filter action for the latter when available. Do not imply that a failed request returned an empty collection.
- Project-defined: Keep existing section titles, search controls, filters, and useful navigation in place. A table may retain its headers around an empty body. The message occupies the affected region without taking over unrelated content.
- `empty-state.content.adaptive` (project-defined): Actions remain keyboard- and touch-accessible and wrap without truncating their labels. Empty-state appearance does not automatically move focus. After a user-initiated query, the containing result region may announce the result once rather than making every static empty message a live alert.
