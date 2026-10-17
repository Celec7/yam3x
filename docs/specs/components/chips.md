# Chips: project design guide

## Scope

Material 3 Expressive defines four chip variants: Assist, Filter, Input, and Suggestion. Each supports a different task role. See the [Chips overview](https://m3.material.io/components/chips/overview).

## Design target

### Use and selection

- Use chips as contextual, supplemental choices in related groups. Do not use them to complete or advance a major task; use buttons for those actions. See [Chips guidelines: usage](https://m3.material.io/components/chips/guidelines).
- Choose Assist for contextual or automated actions, Filter for collection criteria, Input for discrete user-entered values, and Suggestion for product-generated next steps or responses. See the [Chips overview](https://m3.material.io/components/chips/overview).
- Filter chips may use single- or multi-selection, but keep one selection pattern throughout an experience. See [Chips guidelines: Filter chips](https://m3.material.io/components/chips/guidelines).
- Filter chips may include an optional trailing action separate from selection; expose a distinct accessible name and target for that action. See [Chips guidelines: Filter chips](https://m3.material.io/components/chips/guidelines).
- Input chips represent entered values. A trailing remove action is the default; for the mobile interaction where removal is the only action, a chip may instead be selected and removed with Delete. When a chip has a separate primary action and remove action, keep their targets distinct. See [Chips guidelines: Input chips](https://m3.material.io/components/chips/guidelines).

### Shared appearance and accessibility

- Chips are 32 dp high with an 8 dp corner. Provide a 48 dp target and at least 8 dp between chips. See [Chips specs: measurements](https://m3.material.io/components/chips/specs) and [Chips guidelines: spacing](https://m3.material.io/components/chips/guidelines).
- Keep chip labels to 20 characters or fewer. Optional icons add context and do not replace the text label. See [Chips guidelines: labels and icons](https://m3.material.io/components/chips/guidelines) and [Chips accessibility: labeling](https://m3.material.io/components/chips/accessibility).
- Keep chip labels at least 3:1 contrast against their background. Use `outline` for interactive chip strokes so their affordance reaches 3:1 contrast; reserve `outline-variant` for passive chips. Use `secondary-container` and `on-secondary-container` for a selected Filter chip. See [Chips accessibility: color contrast and interactivity](https://m3.material.io/components/chips/accessibility) and [Chips specs: color roles](https://m3.material.io/components/chips/specs).
- Use the state feedback shown in the specifications. An elevated container is for use over an image or complex background, not a pressed-state cue. See [Chips specs: interaction states](https://m3.material.io/components/chips/specs).
- Tab reaches a chip or chip group; Space or Enter activates or selects; arrow keys move between chips. In a multi-select set, multiple chips can be selected while focus stays on one chip at a time. Backspace or Delete removes a focused Input chip. See [Chips accessibility: keyboard navigation](https://m3.material.io/components/chips/accessibility).

## Project decisions

- Project-defined extensions are not additional Material chip variants: the passive [Chip](chip.md), layout-only [ChipSet](chip-set.md), [FilterChipSet](filter-chip-set.md), and [InputChipSet](input-chip-set.md). Their local guides identify which composition decisions extend the official chip family.
