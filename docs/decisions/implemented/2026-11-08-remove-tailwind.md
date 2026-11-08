<!--
Lifecycle: implemented. The code, documentation, and verification landed together. Record follow-up defects as new records rather than reopening this one.
-->

# Remove Tailwind from development and distribution

**Status:** implemented
**Date:** 2026-11-08
**Owner:** [Architecture and ownership](../../architecture.md), [CSS and token conventions](../../design/css-and-tokens.md)

## Problem

YAM3X targets Material 3 Expressive through Vue components delivered as editable source. Source delivery lets developers and agents inspect component behavior and compose interfaces using the actual implementation. It does not require a utility-first styling framework.

The project combined component-owned CSS and Material semantic tokens with a mandatory Tailwind build dependency:

- [Button variants](../../../registry/components/button/button.variants.ts) selected semantic component classes and a small set of utilities, while [component CSS](../../../registry/components/button/button-base.vue) owned their visual mappings and states.
- The [foundation entry stylesheet](../../../registry/foundations/entry.css) imported Tailwind and declared a source scan; the [token stylesheet](../../../registry/foundations/styles/tokens.css) also exposed Tailwind theme aliases.
- [Foundation metadata](../../../registry/foundations/registry.json) required Tailwind and its Vite plugin in consumer projects. The [documentation app](../../../apps/docs/package.json) and [workspace catalog](../../../pnpm-workspace.yaml) also declared Tailwind-related dependencies.

Tailwind therefore imposed installation, build configuration, and additional styling conventions without owning the component system's primary design semantics. Expanding its use merely to justify the dependency would prioritize a framework convention over the project's Material component model. Low utility usage alone was not the reason for removal; the dependency's responsibilities and required integration were the mismatch.

## Decision

Adopt Vue, TypeScript, and standard CSS as the component implementation stack. YAM3X does not depend on Tailwind in project-owned development, builds, or distributed source requirements.

### Styling contract

- Material semantic tokens, dynamic theme generation, component token mappings, and documented CSS customization hooks remain. Component styling follows the existing [CSS ownership boundaries](../../design/css-and-tokens.md), with foundation CSS for shared behavior and component-local CSS for component rules.
- Explicit standard CSS replaces Tailwind utility usage. Ordinary TypeScript class selection replaces `tailwind-variants` where component variants need it; no other utility compiler or class-merging framework is introduced.
- The foundation entry stylesheet imports only project token and base styles. Tailwind imports, directives, theme aliases, and source scanning are gone; no legacy utility shims, second styling implementation, or official optional Tailwind adapter remain.
- Base styles that components require are explicit. Components do not rely on Preflight; the foundation base stylesheet owns the reset and global behavior the components use.

### Development and distribution contract

- Workspace manifests, the catalog, generated registry metadata, the documentation site, demos, the CLI, and verification fixtures declare no Tailwind integration.
- Copied components work in a normal Vue/Vite application without installing or configuring Tailwind or its Vite plugin. Editable-source distribution remains the delivery model.
- Consuming applications choose their own styling tools, including Tailwind, without requiring those tools for YAM3X. This does not promise that arbitrary application styles cannot override component styles.
- Removal of published utility aliases is a breaking change. The changelog documents replacements using retained `--md-sys-*` custom properties or application-owned CSS, following the [breaking-release policy](../../../CONTRIBUTING.md#code-style). The CLI does not delete or rewrite application styles or dependencies.

The decision does not redesign public Vue component APIs, change the MD3E design target, or remove unrelated interaction, positioning, color-generation, or development libraries. API alignment with official platform implementations remains a separate design concern.

## Alternatives considered

- **Keep the hybrid.** Avoids migration work and preserves existing utilities, but retains a mandatory consumer build integration alongside the CSS/token system that owns component styling.
- **Rebuild around Tailwind-first styling.** Could provide a unified utility vocabulary for components and application layouts, but would require rewriting substantial component styling and defining class composition, merging, and override contracts. The desired source readability and Material component semantics do not require this additional public styling model.
- **Make Tailwind an optional official adapter.** Removes the mandatory consumer dependency but preserves another integration surface, alias vocabulary, documentation path, and verification obligation. A single CSS implementation better serves the chosen unification goal; consumers remain free to use Tailwind independently.

## Consequences

- The project owns its required base CSS explicitly. Preflight and generated utilities previously supplied behavior that component CSS did not state; the base stylesheet now declares box sizing, typography inheritance, form-control font inheritance, focus, and selection behavior.
- Consumers lose the bundled utility vocabulary and express application layout with their own CSS or tooling. Applications that used `bg-yam3x-*`, `text-yam3x-*`, `rounded-yam3x-*`, or the other generated aliases must replace them with retained `--md-sys-*` custom properties or application-owned CSS.
- Existing consumers may have locally edited copies. Removing project dependencies does not migrate those applications automatically; adopting the change requires merging the copied foundation and component files.
- Removing Tailwind does not by itself fix application stylesheet conflicts, CSS cascade boundaries, or theme inheritance. Those remain CSS ownership concerns.

## Verification

- Project manifests, the workspace catalog, generated registry metadata, and the lockfile contain no Tailwind packages.
- `pnpm registry:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass. The documentation site builds without Tailwind.
- `pnpm test:cli` installs, typechecks, and builds every installable component in disposable Vue/Vite consumers without Tailwind dependencies or plugins, and exercises the packed CLI.
- Targeted browser checks cover the affected documentation demos and component behavior: button, button group, card, tooltip, radio group, segmented button, inline message, theme switching, focus treatment, density, reduced motion, and narrow-viewport layout. The documentation-site navigation spec has a pre-existing selector mismatch unrelated to this change.
