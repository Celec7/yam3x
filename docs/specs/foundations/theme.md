# Theme and color: project design guide

## Scope

This guide describes how the project applies Material color guidance across its shared theme and component families. It defines design intent, not theme-generation APIs or the exact options currently exposed by Vue source.

## Material 3 Expressive basis

- [Color](https://m3.material.io/styles/color/overview) and the [color system](https://m3.material.io/styles/color/the-color-system) define semantic color roles, role pairs, and their use across surfaces and content.
- The Material color overview describes dynamic color and coordinated schemes generated from a source color.
- Each component's own specifications define the roles used by its variants and states. Apply those mappings consistently in light and dark appearances.

## Project design guidance

- Use semantic roles such as primary, secondary, surface, outline, and their corresponding content roles. Components consume the role appropriate to their Material variant and state instead of hard-coding a palette.
- Keep foreground and container roles paired so text, icons, focus, and state feedback remain legible against their surfaces. Follow the component-specific contrast guidance.
- Apply a coherent light and dark scheme to the same semantic roles. A scheme change should preserve component hierarchy and selection meaning.
- A source color may generate a coordinated Material scheme; the source color itself is not a substitute for the component's assigned semantic roles.

## Project decisions

- The project provides a shared theme mechanism so copied components can consume the same semantic roles. Material defines color design, not this project's provider, source-color workflow, configuration API, or generated CSS surface.
- Exact theme variants, contrast options, configuration fields, and helpers are implementation and public API facts. Maintain them in source and `apps/docs/`, not as design requirements in this guide.
