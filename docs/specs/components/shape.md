# Shape library: project extension guide

## Scope

This project extension applies Material's decorative shapes to content and clipping. It is separate from the corner-radius scale that Material components use for their own containers.

## Design target

- `shape.library.names`: The Material Shape Library contains 35 named forms. Use decorative shapes sparingly and avoid unconventional shapes on text-heavy containers. See [Shape overview: Shape library](https://m3.material.io/styles/shape/overview-principles).
- `shape.motion.morph`: Shape morphing may communicate interaction states, progress, or environmental changes. Use it when the transition clarifies a change or adds an intentional expressive moment. See [Shape principles](https://m3.material.io/styles/shape/overview-principles) and [Shape morph](https://m3.material.io/styles/shape/shape-morph).
- Shape is versatile rather than semantic; do not assign a fixed meaning to a decorative form. Preserve clarity and keep important content legible. See [Shape principles: versatility and use](https://m3.material.io/styles/shape/overview-principles).
- Material exposes shape-library and morph APIs through platform-specific implementations; its Shape morph page states that Web is not currently available. The corner-radius token selector describes a separate System scale, not the decorative library. See [Shape morph](https://m3.material.io/styles/shape/shape-morph) and [Corner radius scale: Shape tokens](https://m3.material.io/styles/shape/corner-radius-scale).

## Project decisions

- Project-defined extension: `Shape` clips consumer-provided content and transitions between its forms with CSS. The consuming interface owns the content's accessibility meaning and context.
- `shape.extension.geometry` (project-defined): The public names follow the Material Shape Library, while normalized paths are project-adapted for CSS clipping and interpolation. They are not official Material geometry, component tokens, or corner-radius values.
- Project mapping: The default size is `48px`, the named-shape fill uses System `primary`, and morphing uses System `spring-slow-spatial`. Material does not prescribe these values for a Web Shape component.
- `shape.motion.reduced` (project-defined): Respect reduced motion by stopping shape morph motion while preserving the rendered form.
