# Public docs authoring

This guide covers content maintained in `apps/docs/`. The public site is bilingual: English is the source, and Chinese preserves the same structure, examples, and meaning.

## Shared rules

- Use English for the source page and mirror headings in Chinese. Keep component and API names consistent with code and official Material terminology.
- Use the official Material 3 Expressive component name for mapped components. Identify project extensions consistently and do not imply they are official Material components.
- For official descriptions and guidance, preserve the Material wording rather than paraphrasing it. Add project-specific explanations as separate sentences.
- Start with a concise explanation of the component or task and when to use it. Do not repeat the title or include implementation history.
- Keep examples executable and relevant. Use consumer-valid imports in page snippets. Demo-only `@registry` imports stay in `demos/`.
- Treat Vue source under `registry/` as the source of truth for props, models, events, slots, defaults, and behavior. Link to a project design guide when it explains intent; do not copy the guide into the API page.
- Include only sections that help the reader complete a task. Merge adjacent content when there is no useful distinction; do not add empty headings.

## Component pages

Keep the existing `/components/<name>` URL. Use this order:

```md
# Component name

State what it is and when to use it. For a family, distinguish members; for an extension, identify it as project-defined.

## Examples

### Basic

<Demo />

### Variants

<Demo />

### States

<Demo />

### Composition

<Demo />

## Use in your app

Show a short working example with consumer imports. Put advanced composition in a details block.

## Behavior and accessibility

### Keyboard

### Focus and dismissal

### Forms

### Responsive and RTL

### State ownership

## API

### Exports

### Props and models

### Events

### Slots

### Methods

Use a separate table for each exported component. Put advanced or low-frequency API behind `::: details`.

## Styling

State whether public styling hooks exist. Put long override tables behind `::: details`.

## Material references

Link the applicable Material 3 Expressive overview, guidelines, specifications, and accessibility pages.
```

Rules:

- Keep `## Use in your app`; the docs-site spec depends on it.
- Put basic examples and usage before exhaustive API tables.
- Do not put design rationale in API or Behavior. Put it in Examples, Usage, or the project design guide.
- Do not enumerate more than a few props in prose. Use tables.
- Do not hide a basic example behind a control panel or details block.
- Keep family members in separate API tables. Do not merge them into one table.
- Keep the page scannable: short paragraphs, bullets, and tables. Avoid paragraphs longer than roughly four lines.

Run `pnpm docs:check` after changing page structure or demo imports. It verifies bilingual section parity, required sections, demo references, consumer code fences, and skill frontmatter and reference links.

### Page types

| Type                  | Examples                                  | Additional structure                                        |
| --------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Material component    | Button, Dialog, Tabs                      | Standard page                                               |
| Project extension     | Data table, Tree view, Number field       | State the extension and Compose lineage in the intro        |
| Family                | Button, Chips                             | One API table per export                                    |
| Composition           | Fab menu, Split button, Navigation drawer | Add a short composition and state-ownership section         |
| Alias                 | Text fields                               | Point to the owning component; do not duplicate demo or API |
| Provider or directive | Localization, Textarea autosize           | Prioritize configuration and usage over variants            |

## Demo coverage

Every demo set must make the documented behavior observable. Consider this matrix and include the rows that apply:

| Layer       | Shows                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Basic       | The smallest useful composition                                       |
| Variants    | Every documented visual variant, size, and shape                      |
| States      | Disabled, invalid, loading, empty, selected, indeterminate, read-only |
| Composition | The component with its typical neighbors                              |
| Behavior    | Keyboard, focus, dismissal, RTL, responsive container                 |
| Advanced    | Server data, virtualization, lazy loading, custom slots               |

Rules:

- One demo file should demonstrate one main task or state family. Do not use a single kitchen-sink file for unrelated behaviors.
- Simple components may use one demo. Complex components should split into two to four demos.
- Prefer static galleries for variants and a separate control for runtime states.
- Do not hide the audited component at common desktop widths. Show responsive alternatives separately.
- Keep existing `data-testid` values and accessible names used by E2E. Add new stable test IDs for new scenarios.
- Use `useDemoLocale` for all visible copy and accessible names. Use its `localeTag` for date and time components.
- Use locale-aware internal links in demos. Do not send a Chinese page to an English route.
- Pass `dir` or a documented direction prop for demos that claim RTL support.
- Keep the demo source block. Do not duplicate the same demo source on another page.

## Guide information architecture

The site keeps lifecycle tasks, maintenance, and design foundations separate:

- `/guide/start/` is the entry point and path chooser.
- `/guide/start/installation` owns setup and the first component.
- `/guide/maintain/updating` owns version comparison and merge work.
- `/guide/foundations/` is the foundations overview.
- `/guide/foundations/layout`, `typography`, `color`, `spacing`, and `gestures` own one foundation each.

Keep old guide URLs as meta-refresh stubs when a route moves. Internal links use the new routes; `pnpm docs:check` rejects links to retired guide routes.

## Task guides

Use this structure for installation, configuration, and update tasks under `apps/docs/guide/`. Adapt steps to the task; troubleshooting is optional.

```md
# Task

State the result and who or what the task applies to.

## Prerequisites

List required environment, access, or existing setup. Omit when none is needed.

## Steps

Give commands, configuration, or UI actions in order. State the working directory, values to replace, and expected result.

## Verify

Explain how the reader can confirm success.

## Troubleshooting

Include only concrete problems that block the task and their remedies.

## Next steps

Link to the most relevant follow-up pages.
```

## Compositions and project extensions

For compositions, explain component composition and state ownership. Link to component pages instead of repeating APIs. For project extensions, state the use case, participating components, import and composition instructions, and which behaviors are project-defined. Link to Material guidance only where it supports the design.
