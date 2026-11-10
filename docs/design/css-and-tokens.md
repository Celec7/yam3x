# CSS and token conventions

This guide defines theme-value and CSS ownership in the installable registry. Material 3 Expressive remains the design authority for component roles, dimensions, states, and motion. See [design and implementation references](references.md) for source precedence and [component design and implementation](../contributing/component-implementation.md) for the delivery workflow.

## Token flow and ownership

| Layer       | Owner and purpose                                                                                                                                                          | Typical values                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Theme input | The application or theme API chooses a seed color, light or dark mode, and supported dynamic-color options. Inputs configure generation; component CSS does not read them. | Seed color, mode, dynamic scheme options                     |
| Reference   | The theme generator produces raw palettes and base quantities used to construct semantic tokens. These are generation materials, not normal component styling inputs.      | `--md-ref-palette-*`                                         |
| System      | The shared foundation exposes cross-component semantic roles and scales. Theme changes update applicable system values.                                                    | `--md-sys-color-*`, `--md-sys-shape-*`, `--md-sys-motion-*`  |
| Component   | The component maps official component requirements to component-owned aliases. Component styles consume this layer.                                                        | `--_yam3x-button-*`, documented `--yam3x-button-*` overrides |

Material Color Utilities generates reference palettes and semantic colors from the same scheme. They are not a CSS derivation chain: changing a `--md-ref-*` value alone does not regenerate dependent `--md-sys-*` values. Prefer M3 Expressive system values where defined; retain M3 baseline values as fallback for components that have not adopted Expressive updates. Theme generation belongs to [`registry/foundations/theme`](../../registry/foundations/theme/), and generated static fallback tokens belong to [`tokens.css`](../../registry/foundations/styles/tokens.css).

Theme application writes tokens to a target element. CSS custom properties inherit only through that element's descendants. Vue provide/inject does not make variables available to teleported DOM outside the target; place overlays within the themed subtree or apply the theme to their DOM target.

The `--md-sys-*` namespace is reserved for Material system semantics. Project-wide hooks such as focus-ring visibility, scrollbar colors, and density configuration are project extensions even when an existing name uses an `md-sys` prefix. The `--yam3x-*` prefix alone does not make a property public: document supported consumer overrides in the component page. Move undocumented implementation properties directly to `--_yam3x-*` without compatibility aliases. Renaming a documented override requires an explicit breaking-change and migration plan. Do not present project extensions as official Material tokens.

Project-owned custom properties use the `yam3x` name, including documented component overrides and private implementation aliases. No legacy `m3x` or unprefixed compatibility aliases are provided.

## Component mappings and overrides

Map each requirement from its applicable Material 3 Expressive specification. A component alias references a System token when the meanings match. Put official component-specific values in the Component layer when no semantically suitable System token exists. Do not borrow an unrelated System token or duplicate a value owned by another layer.

Use one source for each mapping:

- Put static mappings in the component's CSS custom-property declarations.
- Put prop-dependent mappings in a pure, registry-local `*.tokens.ts` module when that keeps mapping logic understandable. Keep the resulting aliases local to that component.
- Do not define the same mapping in both CSS and TypeScript. Runtime styles set only values that vary with props or runtime state; static styling remains in CSS.

Modal overlay scrims use a shared 32% opacity default from `--_yam3x-overlay-scrim-opacity`. Each component maps that foundation value through its own private alias. Material defines the Dialog Scrim color role without prescribing an opacity value.

Use `--_yam3x-{component}-*` for implementation aliases. Expose `--yam3x-{component}-*` only when the override is intentional, documented, and stable enough to support. Resolve overrides in this order:

1. Variant- or size-specific public override.
2. Component-wide public override.
3. The component's official mapping, which may reference a System token or define a component-specific value.

The theme system owns generation and application of shared tokens; each component owns its mapping; the consuming application owns explicit overrides. Overrides must not silently change the meaning of a Material System token.

## CSS ownership and structure

- Put genuinely cross-component behavior in [`base.css`](../../registry/foundations/styles/base.css): shared state layers, touch targets, control scales, and global focus or selection behavior.
- Keep component selectors and component-specific styling in `registry/components/`. Component styles consume Component aliases rather than theme input or raw Reference values.
- Use `yam3x-*` BEM class names. Treat published selectors and public custom properties as part of the copied-source contract.
- Keep static styling in CSS. Use inline styles for runtime values, preferably by setting component custom properties instead of duplicating declarations.
- Compute a custom property in an element scope where all dependencies are available. A child-defined variable is not available to its parent; keep dependent calculations on the element that owns the dependency or a descendant that inherits it.

### Component style boundaries

- Scope component-owned selectors to the component. Vue single-file components use scoped styles; do not define unscoped selectors for component-owned classes. Reach child internals with `:deep()` only when the component owns the dependency and the rule cannot live in that child.
- Do not style host-provided ancestors, list items, or form wrappers from a component. Reset the component's own margins when host typography or list rules would enter its box; do not change external layout to protect internal appearance.
- Derive a fixed component dimension from the shared tokens that define it when possible, such as a selection column equal to the touch target plus both inline paddings. Keep truly component-specific constants local and documented when they affect use.
- Optical adjustments of 1 to 2 px are fixed CSS pixels, not density-scaled spacing. Give a reused optical value a local custom property and record it in the component guide when it affects visible alignment.
- Keep `:focus-visible`, state layers, touch targets, and other cross-component behavior in the foundation stylesheet. A component may override a documented exception but should not duplicate the shared default.

Token layers describe value ownership independently of CSS cascade layers. Foundation rules use the native CSS `@layer base`; component styles remain unlayered so copied components keep ordinary specificity. Broader `@layer` adoption requires compatibility review with consuming applications.

## Registry distribution and generated files

Registry components and foundation dependencies must remain independently distributable. Do not make registry source depend on VitePress or files under `apps/docs/`. Declare foundation source-to-target mappings in [`registry/foundations/registry.json`](../../registry/foundations/registry.json); the generator follows imports and emits required shared styles and token files into [`registry/registry.json`](../../registry/registry.json). Verify generated output and isolated installation through the CLI checks when those dependencies change.

Generated token blocks in `tokens.css` are owned by [`pnpm tokens:generate`](../../scripts/generate-foundation-tokens.mjs); edit their generator inputs and regenerate instead of hand-editing generated output. Keep hand-maintained foundation rules outside generated blocks.

When revising a component or foundation, classify its properties, document intentional overrides, and move incidental implementation properties directly to the private namespace. Verify that aliases resolve under the intended theme target, public overrides have predictable precedence, and registry installation includes all required CSS and token sources.
