# YAM3X design guidance

When working in this YAM3X component directory:

- Read the [YAM3X design guide](https://yam3x.iscccc.cc/guide/foundations/) before choosing a page layout or customizing components.
- Use the linked Material 3 Expressive pages, figures, and motion recordings for design intent. Use the relevant YAM3X component page for supported variants, API, accessibility behavior, and documented styling hooks.
- If the agent supports Agent Skills, install the YAM3X skill: `npx skills add Celec7/yam3x@yam3x`. It covers layout, component selection, foundations, customization, and verification.
- For a newer copied-source version, use `npx skills add Celec7/yam3x@yam3x-upgrade` and follow the Update copied source guide. Record the baseline before merging; never overwrite a local edit only because upstream changed.
- Prefer public props, slots, and documented CSS custom properties. The copied source is editable; if you change it, treat the change as a local extension, keep it scoped, and re-check it when merging upstream updates.
- Keep page structure, gutters, and responsive layout in application-owned containers. Do not restyle component internals from application CSS.
- Preserve semantic heading order, localized text context, content-driven sizing, keyboard access, and 48px interactive targets.
- Verify the changed surface in a browser at compact, medium, and expanded widths, including focus, 200% text, RTL, and reduced motion where relevant.
