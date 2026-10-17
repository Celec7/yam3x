# Contributing

This is a pnpm workspace with a local registry, CLI, and VitePress component documentation site. From the repository root:

```sh
pnpm install
pnpm dev
```

## Code style

Run `pnpm format` to apply Prettier and `pnpm lint` to check JavaScript, TypeScript, and Vue files. Use `pnpm lint:fix` only for ESLint fixes; review its changes before committing.

In Vue single-file components, declare props, models, emits, and slots in that order. Name event handlers `onX` (for example, `onKeydown`). Keep component-specific selectors in `yam3x-*` BEM classes and use `--yam3x-*` custom properties for project-owned CSS hooks. Keep Material system tokens under their official `--md-sys-*` names. Use kebab-case for component directories and filenames; expose Vue components with their PascalCase names and no project prefix.

These names are public because consumers copy registry source and can depend on its imports and CSS hooks. Breaking renames require a major-version migration.

For token-layer ownership, component mappings, CSS source structure, and custom-property scope rules, follow [CSS and token conventions](docs/css-and-tokens.md).

`pnpm dev` starts the VitePress site. Use its component pages to review appearance, API guidance, and interactions. Before finishing a component or foundation change, run the relevant checks:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:cli
pnpm test:e2e
pnpm build
```

GitHub Actions runs formatting, lint, type checks, unit tests, CLI and registry checks, and the documentation build on pull requests and pushes. It does not run the browser E2E suite. Run `pnpm test:e2e` locally when browser verification is needed. The Playwright config uses system Chromium if available; otherwise install its browser with `pnpm --filter yam3x-docs exec playwright install chromium`. Dependabot checks for GitHub Actions updates weekly. CLI tests create disposable Vue/Vite consumers and run typecheck/build for each component with only its declared dependencies available. Changes to motion parameters require `pnpm motion:generate` to update the generated curves in the token stylesheet.

## Dependency maintenance

Run commands from the repository root. Workspace package manifests must keep `"catalog:"` references; [`pnpm-workspace.yaml`](pnpm-workspace.yaml) is the only owner of dependency versions.

Update all dependencies within their existing version ranges:

```sh
pnpm update -r
```

For a targeted or major-version update, change that package's entry in the workspace catalog, then run `pnpm install`. Review major upgrades separately. Do not put a concrete version in a workspace `package.json`; exact pins belong in the catalog too. This keeps updates centralized and avoids commands rewriting one package manifest with a second version source.

When adding a dependency to registry source, add its catalog entry and declare the package name in `registry/package.json`. For a foundation setup tool, also list it in `registry/foundations/registry.json` under `devDependencies`. Workspace packages that use the dependency should refer to it as `"catalog:"`.

After changing dependencies used by the registry, regenerate and verify the CLI metadata, then run the checks:

```sh
pnpm registry:generate
pnpm registry:check
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:cli
pnpm test:e2e
pnpm build
```

`pnpm test:cli` also checks that workspace dependencies use the shared catalog and that each registry component builds with only its declared dependencies. Do not edit the generated [`registry/registry.json`](registry/registry.json) directly.

## Registry and documentation ownership

Component install requirements are derived from source imports. Keep foundation source-to-target mappings in [`registry/foundations/registry.json`](registry/foundations/registry.json), then run `pnpm registry:generate` after changing registry source or mappings. Keep exact component APIs in registry source and document public usage on the matching VitePress page. Project design guidance lives in [`docs/specs`](docs/specs/README.md); installation and update guidance live in `docs/`. Unit and browser tests under `apps/docs` hold detailed behavior evidence. The [documentation index](docs/README.md) maps documentation owners.
