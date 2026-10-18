# Descriptions: project extension guide

## Scope

Descriptions presents labelled attributes of one record, such as a project summary or account details. Material 3 Expressive does not define a standalone Descriptions component. It is a read-only information composition, not an editable Form or a comparison Data table.

## Design target

- Keep labels and values consistently aligned so attributes can be scanned. Use [Lists guidelines: alignment and non-interactive lists](https://m3.material.io/components/lists/guidelines) as a composition reference.
- Use typography and spacing to separate content roles, following [Applying type](https://m3.material.io/styles/typography/applying-type). Do not rely on color alone to distinguish a label from its value.
- Adapt the layout and reading width to the available container. The [Lists adaptive design guidance](https://m3.material.io/components/lists/guidelines) permits multi-column compositions to avoid excessively long lines.

## Project decisions

- Project-defined (`descriptions.content.association`): Use a native description list, with each term immediately followed by its description in source order. An optional heading names the list. Values may contain application-owned links or controls without making the whole attribute interactive.
- Project-defined: Use Label Large / On Surface Variant for labels and Body Large / On Surface for values. Support stacked and inline arrangements, retaining the same label/value order. Wrap complete values and long identifiers rather than clipping them.
- Project-defined (`descriptions.layout.responsive`): Use one column in compact containers, with up to the configured maximum as space grows. Allow individual attributes to occupy a complete row. Keep optional outlines on the group, with no hover, pressed, or selection state on static attributes.
- Project-defined (`descriptions.content.empty`): Distinguish missing values from legitimate zero, false, and empty-string values. Resolve missing-value and empty-list text through shared localization, preserving component overrides. The application owns labels, values, and formatting.
