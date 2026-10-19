# CSS and token conventions

This guide defines ownership boundaries for theme values and CSS in the installable registry. It describes project conventions; Material 3 Expressive remains the design authority for component roles, dimensions, states, and motion. See [design and implementation references](references.md) for source precedence and [component design and implementation](component-implementation.md) for the component workflow.

## Token flow and ownership

Use four conceptual layers:

| Layer       | Owner and purpose                                                                                                                                                                            | Typical values                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Theme input | The application or theme API chooses a seed color, light or dark mode, and supported dynamic-color style or contrast options. Inputs configure generation; component CSS does not read them. | Seed color, mode, dynamic scheme options                     |
| Reference   | The shared theme generator produces raw palettes and base quantities used to construct semantic tokens. These are generation materials, not normal component styling inputs.                 | `--md-ref-palette-*`                                         |
| System      | The shared foundation exposes cross-component semantic roles and scales. Theme changes update applicable system values.                                                                      | `--md-sys-color-*`, `--md-sys-shape-*`, `--md-sys-motion-*`  |
| Component   | The component maps official component requirements to component-owned aliases. Component styles consume this layer.                                                                          | `--_yam3x-button-*`, documented `--yam3x-button-*` overrides |

As a project decision, Material Color Utilities generates dynamic color schemes from the configured source color, mode, and supported scheme options. Reference palette values and semantic system colors are generated together from the same scheme; they are not a CSS derivation chain. Changing a `--md-ref-*` value alone does not regenerate dependent `--md-sys-*` values. Prefer M3 Expressive system values where the project defines them; retain M3 baseline values as the fallback for components that have not adopted Expressive updates. Theme generation and application belong to [`registry/foundations/theme`](../registry/foundations/theme/), while generated static fallback tokens belong to [`tokens.css`](../registry/foundations/styles/tokens.css).

Theme application writes tokens to a target element. CSS custom properties inherit only through descendants of that target. Vue provide/inject does not make CSS variables available to teleported DOM outside the target; place overlays within the themed subtree or explicitly apply the theme to their DOM target.

The `--md-sys-*` namespace is reserved for Material system semantics. Project-wide hooks such as focus-ring visibility, scrollbar colors, and density configuration are project extensions even where an existing name uses an `md-sys` prefix. The `--yam3x-*` prefix alone does not make a property public: list supported consumer overrides in the component documentation. When revising a component, move undocumented implementation properties directly to `--_yam3x-*`; do not keep compatibility aliases for those incidental names. Renaming a documented override requires an explicit breaking-change and migration plan. Do not present project extensions as official Material tokens.

As a project decision, project-owned CSS custom properties use the `yam3x` name, including documented component overrides, private implementation aliases, and Tailwind theme tokens. Consumers must update any `m3x`-named overrides or utility tokens; no compatibility aliases are provided.

## Component mappings and overrides

Map each component's requirements from its applicable Material 3 Expressive specification. A component alias should reference a System token when the meanings match. Put official component-specific values in the Component layer when no semantically suitable System token exists. Do not borrow an unrelated System token or duplicate a value already owned by another layer.

Use one source for each mapping:

- Put static, simple mappings in the component's CSS custom-property declarations.
- Put prop-dependent mappings in a pure, registry-local `*.tokens.ts` module when that keeps mapping logic understandable. Keep the resulting aliases local to that component.
- Do not define the same mapping in both CSS and TypeScript. Runtime styles should set only values that vary with props or runtime state; static styling remains in CSS.

As a project decision, modal overlay scrims use a shared 32% opacity default from `--_yam3x-overlay-scrim-opacity`. Each component maps that foundation value through its own private Component alias. Material defines the Dialog Scrim color role without prescribing an opacity value.

Use `--_yam3x-{component}-*` for implementation aliases. Expose `--yam3x-{component}-*` as a consumer override only when the override is intentional, documented, and stable enough to support. When several override levels apply, resolve them in this order:

1. Variant- or size-specific public override.
2. Component-wide public override.
3. The component's official mapping, which may reference a System token or define a component-specific value.

The theme system owns generation and application of shared tokens; each component owns its mapping; the consuming application owns explicit overrides. Overrides must not silently change the meaning of a Material System token.

## CSS ownership and structure

- Put genuinely cross-component behavior in [`registry/foundations/styles/base.css`](../registry/foundations/styles/base.css), such as shared state layers, touch targets, control scales, and global focus or selection behavior. Foundation styles may consume System tokens directly for shared behavior.
- Keep component selectors and component-specific styling with the component source in `registry/components/`. Component styles should consume Component aliases rather than reading theme input or raw Reference values.
- Use `yam3x-*` BEM class names for component selectors. Treat published selectors and public custom properties as part of the copied-source contract.
- Keep static styling in CSS. Use inline styles for runtime values, preferably by setting component custom properties instead of duplicating CSS declarations.
- Compute a custom property in an element scope where all of its dependencies are available. Inherited variables can be consumed by descendants, but a child-defined variable is not available to its parent. Keep dependent calculations on the element that owns the dependency, or on a descendant that inherits it.

Token layers describe value ownership and are independent of CSS cascade layers. The project currently uses Tailwind's `@layer base` for foundation rules; it has not established a general cascade-layer convention for component styles. Any broader `@layer` adoption needs compatibility review with Tailwind and consuming applications before it becomes a project rule.

## Registry distribution and generated files

Registry components and their foundation dependencies must remain independently distributable. Do not make registry source depend on VitePress or files under `apps/docs/`. Declare foundation source-to-target mappings in [`registry/foundations/registry.json`](../registry/foundations/registry.json); the registry generator follows imports and emits the required shared styles and token files into [`registry/registry.json`](../registry/registry.json). Verify generated output and isolated component installation through the CLI checks when changing those dependencies.

Generated token blocks in `tokens.css` are owned by [`pnpm tokens:generate`](../scripts/generate-foundation-tokens.mjs); edit their generator inputs and regenerate instead of hand-editing generated output. Keep hand-maintained foundation rules outside generated blocks.

## Adoption

Existing components do not yet use one uniform token structure. During a component or foundation revision, classify its current properties, document intentional overrides, and move incidental implementation properties directly to the private namespace without dual-name compatibility aliases. For each change, verify that component aliases resolve under the intended theme target, public overrides have predictable precedence, and registry installation includes all required CSS and token sources.
