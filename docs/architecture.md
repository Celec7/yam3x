# Architecture and ownership

yam3x is a source registry for Vue applications. The package a user adopts is the copied source in their app. VitePress documents the public API and hosts interactive demos; CLI integration tests generate a disposable consumer to verify copied source independently. The CLI reads the local registry.

| Owner                                                                         | Responsibility                                                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`registry/foundations`](../registry/foundations)                             | Shared token data, generated semantic token CSS, styles, and dynamic theme functions |
| [`registry/components`](../registry/components)                               | Copyable Vue components, public props, slots, and local helpers                      |
| [`pnpm-workspace.yaml`](../pnpm-workspace.yaml)                               | Canonical dependency version ranges through the pnpm workspace catalog               |
| [`registry/foundations/registry.json`](../registry/foundations/registry.json) | Explicit source-to-target mappings for foundation files and foundation-only tools    |
| [`registry/registry.json`](../registry/registry.json)                         | Generated file and dependency metadata consumed by the CLI                           |
| [`packages/cli`](../packages/cli)                                             | Copy source into a target app and declare compatible npm dependencies                |
| [`scripts/generate-registry.mjs`](../scripts/generate-registry.mjs)           | Derive component entries and dependency closures from source imports                 |
| [`apps/docs`](../apps/docs)                                                   | VitePress component docs, direct registry demos, unit and browser verification       |
| [`packages/cli/test`](../packages/cli/test)                                   | Generate disposable Vue/Vite consumers; typecheck and build installed sources        |

The theme functions use Material Color Utilities. Switch and Dialog use Ark UI for behavior. Button variants use `tailwind-variants`. The registry generator derives package requirements from source imports and resolves versions through the workspace catalog, so the CLI installs the dependencies of the chosen components. Tailwind CSS v4 and its Vite plugin provide the utility styling used by copied source.

The CLI copies files only when the destination is missing. Core initialization also distributes its design-routing `AGENTS.md` to `src/components/yam3x/` when one is absent, keeping its scope on the copied YAM3X components. Once installed, the app owns copied changes and upgrades require a manual merge. Run `pnpm registry:generate` after changing component imports or foundation mappings; `pnpm registry:check` detects stale generated output. The [contributing guide](../CONTRIBUTING.md) lists the checks for that work. External sources and their roles are recorded in [References](references.md).

Shared UI language is scoped to Vue provider trees rather than process-wide mutable state. Locale dictionaries and message contracts live in `registry/components/localization`; components own their behavior and read resolved messages through that module. Application labels and server errors remain application-owned. See the [localization usage guide](../apps/docs/components/localization.md) for configuration and fallback behavior.

For CSS and theme-token ownership, see [CSS and token conventions](css-and-tokens.md).
