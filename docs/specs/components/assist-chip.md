# Assist chips: project design guide

## Scope

Assist chips provide a contextual or automated action, or surface supplemental information related to the current task. They are one of Material's four chip variants. See the [Chips overview](https://m3.material.io/components/chips/overview).

## Design target

### Use and content

- Use an Assist chip for a dynamic, contextual action or supplemental information. They often appear after primary content. Do not use them as a primary button or to advance a major workflow. See [Chips guidelines: Assist chips](https://m3.material.io/components/chips/guidelines).
- Keep the action label short and direct; it commonly begins with a verb. An icon should reinforce the action rather than carry its meaning alone. See [Chips guidelines: labels and icons](https://m3.material.io/components/chips/guidelines) and [Chips accessibility: labeling](https://m3.material.io/components/chips/accessibility).
- An Assist chip may show progress or confirmation while its action completes. See [Chips guidelines: Assist chip states](https://m3.material.io/components/chips/guidelines).

### Appearance and interaction

- `assist-chip.geometry.rest`: Use the shared chip height and corner shown in the [Chips measurement figures](https://m3.material.io/components/chips/specs).
- `assist-chip.behavior.activate`: Activation performs the action represented by the chip. Use the interaction states shown in the [Chips state specifications](https://m3.material.io/components/chips/specs).
- Keep keyboard focus visible. See [Chips accessibility: keyboard navigation](https://m3.material.io/components/chips/accessibility).
