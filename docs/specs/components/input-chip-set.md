# Input chip set: project extension guide

## Scope

`InputChipSet` composes a text-entry field with multiple Material Input chips. Material defines the chip pattern, not this Vue helper or its API. See [Input chips](input-chip.md) and the shared [Chips family guide](chips.md).

## Design target

- Treat each chip as a discrete value in its containing field. Let the person add, edit, and remove values without losing that field's context. See [Chips guidelines: Input chip behavior](https://m3.material.io/components/chips/guidelines).
- Values may be arranged inline, stacked, or in a horizontally scrollable field as the layout requires. See [Chips guidelines: Input chip layout](https://m3.material.io/components/chips/guidelines).
- When Backspace removes the preceding value, first select that value so its pending removal is visible; remove it on the next Backspace. See [Chips accessibility: keyboard removal](https://m3.material.io/components/chips/accessibility).
- Keep every chip keyboard reachable and distinguish its primary action from a separate remove action. Follow [Chips accessibility: Input chip actions](https://m3.material.io/components/chips/accessibility) and the [family guide](chips.md) for shared target and contrast guidance.
- Optional project capability: when `reorderable` is enabled, chips can be reordered by dragging or with Alt+Arrow keys. Reordering is a project extension; it preserves the entered values and their selection context.

## Project decisions

- Project-defined extension: This field-plus-values helper composes a text field with Input chips; it is not an additional Material chip variant.
- Project-defined extension: Chip reordering and the `reorder` change event are project behavior; Material does not require reordering for every input-chip collection.
