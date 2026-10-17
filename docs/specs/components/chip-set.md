# Chip set: project extension guide

## Scope

`ChipSet` is a project layout helper for arranging related chips. Material defines chip patterns and group guidance, not this Vue helper or its API. Shared source-backed requirements are collected in the [Chips family guide](chips.md).

## Design target

- Keep related chips together in an inline group. Wrap or horizontally scroll the set when space requires, and provide an accessible way to reveal all options when they overflow. See [Chips guidelines: chip sets and overflow](https://m3.material.io/components/chips/guidelines).
- Keep at least 8 dp between chips and preserve the 48 dp target for interactive chips. See [Chips guidelines: spacing](https://m3.material.io/components/chips/guidelines) and [Chips accessibility: target size](https://m3.material.io/components/chips/accessibility).
- Give the group enough visible or programmatic context for people to understand its choices. Keep selection and input behavior with the individual chip or the helper designed for that variant. See [Chips accessibility: grouping and context](https://m3.material.io/components/chips/accessibility).

## Project decisions

- Project-defined extension: `ChipSet` owns layout only and does not impose selection or input semantics, leaving those behaviors to the chips and their purpose-built set helpers.
- Project-defined layout: A vertical arrangement is allowed when the surrounding design deliberately calls for it; Material's chip-set guidance uses an inline group.
