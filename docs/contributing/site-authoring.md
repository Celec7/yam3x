# Public docs authoring

This guide covers content maintained in `apps/docs/`. The public site is bilingual: English is the source, and Chinese preserves the same structure, examples, and meaning.

## Shared rules

- Use English for the source page and mirror headings in Chinese. Keep component and API names consistent with code and official Material terminology.
- Use the official Material 3 Expressive component name for mapped components. Identify project extensions consistently and do not imply they are official Material components.
- Start with a concise explanation of the component or task and when to use it. Do not repeat the title or include implementation history.
- Keep examples executable and relevant. Use the existing demo component for interactive examples and a consumer-valid import path for application examples.
- Treat Vue source under `registry/` as the source of truth for props, models, events, slots, defaults, and behavior. Link to a project design guide when it helps explain intent; do not copy the whole guide into an API page.
- For Material guidance, use pages explicitly marked Expressive. Keep the component's Material section to relevant official links; put current project behavior beside usage or API explanation.
- Include only sections that help the reader complete a task. Merge adjacent content when there is no useful distinction; do not add empty headings.

## Component pages

Use this outline for `apps/docs/components/*.md`:

```md
<script setup lang="ts">
import Example from './demos/Example.vue'
</script>

# Official component name or project extension

State what it does and when to use it. For a family, distinguish members; for an extension, identify it as project-defined.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><Example /></div>

::: details View demo source

<<< ./demos/Example.vue{vue}

:::

## Use in your app

Show a short working example with imports from `./components/yam3x/`. Demo-only `@registry` imports are not consumer paths.

## API

Document caller-facing props, models, events, slots, and important defaults from `registry/`. Group a family by exported member. Explain native-attribute forwarding without listing every HTML attribute. Link to the page that owns an API instead of repeating it.

## Behavior and accessibility

State keyboard, focus, form, link, and state-ownership behavior not made clear by the API section. Identify project-defined behavior where it matters.

## Styling

Describe supported styling entry points and precedence only when callers need them.

## Material references

Link the applicable Material 3 Expressive overview, guidelines, specifications, and accessibility pages. Do not repeat the design guide.
```

Keep related examples together. A family page may add a short choice guide and group its API by member. A composition page explains which component owns state, focus, dismissal, and navigation, and links to the API pages of its parts. A design-pattern page without a matching export names the actual component. A legacy page identifies its supported use and points to the current pattern. Check exported helpers as well as Vue components when deciding what the API owns.

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
