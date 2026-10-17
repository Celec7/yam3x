# Input chips: project design guide

## Scope

Input chips turn text a person entered into a discrete value, such as a contact or a search term. They are one of Material's four chip variants. See the [Chips overview](https://m3.material.io/components/chips/overview).

## Design target

### Use and editing

- Use an Input chip for a user-authored value associated with a field or collection, not for a product-generated suggestion. A value may be edited by returning it to text. See [Chips guidelines: Input chips](https://m3.material.io/components/chips/guidelines).
- Provide a trailing remove action by default. On mobile, when removal is the only action, a chip may instead be selected and removed with Delete. See [Chips guidelines: removing Input chips](https://m3.material.io/components/chips/guidelines).
- When a chip has a separate primary action and remove action, give each a distinct, non-overlapping 48 dp target. See [Chips accessibility: Input chip actions](https://m3.material.io/components/chips/accessibility).

### Appearance and accessibility

- `input-chip.a11y.remove-name`: Name the remove action so it identifies which value will be removed. See [Chips accessibility: labeling Input chip actions](https://m3.material.io/components/chips/accessibility).
- Use an optional avatar or icon only to add context; keep the text value as the accessible label. See [Chips guidelines: Input chip icons](https://m3.material.io/components/chips/guidelines) and [Chips accessibility: labeling](https://m3.material.io/components/chips/accessibility).
- Follow the shared chip geometry, contrast, focus, and keyboard guidance in the [Chips family guide](chips.md).

## Project decisions

- Project-defined: A standalone `InputChip` exposes a controlled selected state and primary click. Text editing is provided by the `InputChipSet` convenience component, which prevents the standalone selection toggle when mapping the primary click to editing.
- Project-defined: The optional remove action is separate from the primary click and remains available on standalone input chips.
