# Public docs authoring

This guide covers content maintained in `apps/docs/`. The public site is bilingual: the English page is the source, and its Chinese counterpart should preserve the same structure, examples, and meaning.

## Shared rules

- Use English for the source page and mirror its headings in Chinese on the paired page. Keep component and API names consistent with the code and official Material terminology.
- Use the official Material 3 Expressive component name for a mapped component. Identify project-defined extensions consistently and do not imply that they are official Material components.
- Start with a concise explanation of the component or task and its use. Do not repeat the title or include internal implementation history.
- Keep examples executable and relevant. Use the existing demo component for interactive examples and a consumer-valid import path for application examples.
- Treat Vue source under `registry/` as the source of truth for current props, models, events, slots, defaults, and behavior. Link to a project design guide when it helps explain intended design; do not copy the whole guide into a public API page.
- For Material design guidance, use the applicable pages explicitly marked Expressive. Keep the component page's Material section to relevant official links; put current project behavior beside its usage or API explanation.
- Include only sections that help the reader complete a task. Merge adjacent content when there is no useful distinction; do not add empty headings to satisfy a template.

## Component pages

Use this outline for `apps/docs/components/*.md`. Keep the prose concise and omit sections that have no useful content.

```md
<script setup lang="ts">
import Example from './demos/Example.vue'
</script>

# Official component name or project extension

State what it does and when to use it. For a family, distinguish the members; for an extension, identify it as project-defined.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><Example /></div>

::: details View demo source

<<< ./demos/Example.vue{vue}

:::

## Use in your app

Link to installation when needed. Show a short working example with imports from the copied application's `./components/yam3x/` tree; demo-only `@registry` imports are not consumer paths.

## API

Document caller-facing props, models, events, slots, and important defaults from `registry/`. Group a family by exported member. Explain native-attribute forwarding without listing every HTML attribute. Link to the page that owns an API instead of repeating it.

## Behavior and accessibility

State keyboard, focus, form, link, and state-ownership behavior that the API section does not make clear. Identify project-defined behavior where it matters to the caller.

## Styling

Describe supported styling entry points and precedence only when callers need them.

## Material references

Link the applicable Material 3 Expressive overview, guidelines, specs, and accessibility pages that exist. Do not repeat the design guide here.
```

Keep related examples together. A family page may add a short choice guide and group its API by member. A composition page explains which component owns state, focus, dismissal, and navigation, linking to the API pages of its parts. A design-pattern page without a matching export names the actual component and links to its API. A legacy page identifies its supported use and points to the current pattern. Check exported helpers as well as Vue components when deciding what the page's API owns.

## Task guides

Use this structure for installation, configuration, and update tasks under `apps/docs/guide/`. Adapt steps to the actual task; troubleshooting is optional.

```md
# Task

State the result and who or what the task applies to.

## Prerequisites

List required environment, access, or existing setup. Omit this section when none is needed.

## Steps

Give commands, configuration, or UI actions in order. State the working directory, values to replace, and expected result where helpful.

## Verify

Explain how the reader can confirm success.

## Troubleshooting

Include only concrete problems that block this task and their remedies.

## Next steps

Link to the most relevant follow-up pages.
```

## Compositions and project extensions

For compositions such as a navigation drawer or side panel, explain component composition and state ownership. Link to component pages instead of repeating their APIs. For project extensions, state the use case, participating components, import and composition instructions, and which behaviors are project-defined. Link to Material guidance only where it genuinely supports the design.
