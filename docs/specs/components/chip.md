# Chip: project extension guide

## Scope

`Chip` is a passive visual label for short supplemental information. Material defines Assist, Filter, Input, and Suggestion chips, but no passive variant. See the [Chips overview](https://m3.material.io/components/chips/overview) and the [Chips family guide](chips.md).

## Design target

Material's chip specifications provide a shared visual language for the extension's container, spacing, and typography. They do not define this extension's behavior; see the [Chips specifications](https://m3.material.io/components/chips/specs).

## Project decisions

- Project-defined extension: Use passive `Chip` only for concise supplemental information, such as a category label; do not use it for an action, selection, filter, or user-entered value.
- `chip.extension.noninteractive` (project-defined): Keep the chip and its optional adornments non-interactive and out of the focus order. This preserves its role as supplemental information instead of suggesting an action or selection.
