# Filter chips: project design guide

## Scope

Filter chips represent criteria that include items in a collection or search result. They are one of Material's four chip variants. See the [Chips overview](https://m3.material.io/components/chips/overview).

## Design target

### Use and selection

- Use a Filter chip for a category to include in a collection, not for an action or user-entered value. Use a concise noun label that describes what is included, and avoid showing only one filter option. See [Chips guidelines: Filter chips](https://m3.material.io/components/chips/guidelines).
- A set may use single- or multi-selection, but do not mix the selection pattern within one experience. A selected chip may show a leading checkmark. See [Chips guidelines: selection](https://m3.material.io/components/chips/guidelines) and [Chips specs: selected state](https://m3.material.io/components/chips/specs).
- A standalone chip uses button semantics. Within a labeled filter set, expose the selectable chip as a grid cell with its selected state; use the set's grid keyboard model. See [Chips accessibility: roles and keyboard navigation](https://m3.material.io/components/chips/accessibility).

### Appearance and states

- Use `secondary-container` and `on-secondary-container` for a selected Filter chip. See the [Chips color specifications](https://m3.material.io/components/chips/specs).
- Keep the label at least 3:1 contrast with the chip background. Use `outline` rather than `outline-variant` for the interactive cue when needed to meet that contrast. See [Chips accessibility: color contrast](https://m3.material.io/components/chips/accessibility).
- Use the shared chip geometry and state feedback from the [Chips specifications](https://m3.material.io/components/chips/specs); see the [family guide](chips.md) for shared measurements and accessibility requirements.

### Responsive behavior

- In medium and expanded layouts, a trailing menu or removal action may appear. In compact layouts, the whole chip may open the menu so the action remains accessible. See [Chips guidelines: responsive behavior](https://m3.material.io/components/chips/guidelines) and the [Filter chip specification figures](https://m3.material.io/components/chips/specs).
