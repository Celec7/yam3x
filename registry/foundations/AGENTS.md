# YAM3X design guidance

When working in this YAM3X component directory:

- Read the [YAM3X design guide](https://yam3x.iscccc.cc/guide/design) before choosing a page layout or customizing components.
- Treat the linked Material 3 Expressive pages as the design authority. Use the relevant YAM3X component page for supported variants, API, accessibility behavior, and documented styling hooks.
- Keep page structure, gutters, and responsive layout in application-owned containers. Customize component internals through documented props, slots, and CSS custom properties.
- Preserve semantic heading order, localized text context, and content-driven sizing so layouts can reflow.
