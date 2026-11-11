<!--
Lifecycle: implemented. The code, documentation, and verification landed together. Record follow-up defects as new records rather than reopening this one.
-->

# Registry dependency lifecycle and generated metadata

**Status:** implemented
**Date:** 2026-11-11
**Owner:** [Architecture and ownership](../../../architecture.md), [registry package](../../../../registry/package.json), [CLI](../../../../packages/cli/src/index.mjs)

## Problem

YAM3X distributes editable component source. The registry has three committed inputs:

- Component and foundation imports under [`registry/`](../../../../registry).
- Dependency ranges in the [workspace catalog](../../../../pnpm-workspace.yaml).
- Runtime, peer, and foundation setup policy in [`registry/package.json`](../../../../registry/package.json).

Before this decision, [`scripts/generate-registry.mjs`](../../../../scripts/generate-registry.mjs) derived a fourth artifact, `registry/registry.json`, containing each component's file closure and dependency ranges. That artifact was committed, copied into the CLI package during `prepack`, and checked for freshness by `pnpm registry:check`.

This created avoidable drift and update work:

- A catalog version change made the committed artifact stale even though the source and dependency topology did not change. Dependency PRs needed a second manual regeneration step.
- The root artifact duplicated information already present in source imports and the catalog. It was a build product committed as source.
- The CLI had no consumer-side dependency reconciliation. `add` only filled missing declarations, and an existing compatible range was never checked against the actual installed version.
- `validateDependencyRequirements` used `semver.intersects`, which accepted a consumer range that included versions the registry did not test. For example, `^5.0.0` intersects `^5.39.3` even though the consumer could still install 5.0.0.
- Vue was treated as a runtime dependency in the generated core metadata, so `init` could add or rewrite Vue rather than validating the application-provided peer.
- Dependency validation happened per component after earlier components had already copied files and updated `package.json`. A later incompatible component left a partial install.
- The allowlist was only checked in one direction. A package removed from all imports could remain in `registry/package.json` indefinitely.

The existing isolation tests were strong: [`packages/cli/test/cli.test.mjs`](../../../../packages/cli/test/cli.test.mjs) installs and builds every component with only its declared dependencies. The problem was the metadata lifecycle around those tests, not the closure calculation itself.

## Decision

Adopt a derive-and-reconcile model. Source imports and the catalog are the only committed dependency inputs. The CLI consumes generated metadata and reconciles it against the application's actual files and dependency declarations. Dependency synchronization stores no second persistent state file.

### Generated metadata is a build artifact

- [`scripts/generate-registry.mjs`](../../../../scripts/generate-registry.mjs) exports a side-effect-free `buildRegistry()` function and a thin command entry point.
- The committed root `registry/registry.json` is removed.
- [`scripts/prepare-cli-package.mjs`](../../../../scripts/prepare-cli-package.mjs) calls `buildRegistry()`, writes `packages/cli/registry/registry.json`, then copies the referenced source files. The package registry directory is ignored by Git.
- The CLI always reads `packages/cli/registry/registry.json`, in both workspace development and the packed package. A missing file fails with an instruction to run `pnpm registry:prepare`.
- `pnpm registry:check` builds the model in memory and validates it; it no longer compares a committed snapshot.
- `pnpm yam3x`, `pnpm test:cli`, and `prepack` prepare the CLI registry so local development and release packaging use the same generated input.
- The hand-authored [`registry/foundations/registry.json`](../../../../registry/foundations/registry.json) remains the source-to-target mapping. It is not generated.
- The documentation site resolves component slugs through a Vite virtual module backed by `buildRegistry()` instead of importing a committed snapshot.

This removes the stale-artifact problem and makes the published package the only place where resolved metadata exists at runtime. A catalog bump no longer requires a generated file commit.

### Normalized registry schema

Schema version 4 separates package versions from component dependency names:

```json
{
  "schemaVersion": 4,
  "packages": {
    "@ark-ui/vue": { "range": "^5.39.3", "kind": "runtime" },
    "@floating-ui/dom": { "range": "^1.8.0", "kind": "runtime" },
    "@material/material-color-utilities": { "range": "^0.4.0", "kind": "runtime" },
    "composed-offset-position": { "range": "^0.0.6", "kind": "runtime" },
    "vue": { "range": "^3.5.44", "kind": "peer" }
  },
  "foundations": {
    "core": {
      "files": [],
      "dependencies": ["@material/material-color-utilities"],
      "peerDependencies": ["vue"],
      "devDependencies": []
    }
  },
  "components": {
    "switch": {
      "files": [],
      "dependencies": ["@ark-ui/vue"],
      "peerDependencies": [],
      "foundations": ["core"]
    }
  }
}
```

- A package has one range and one `kind`: `runtime`, `peer`, or `dev`. Components reference package names.
- [`registry/package.json`](../../../../registry/package.json) declares Vue under `peerDependencies`. The generator removes core packages from component dependency lists to avoid duplication.
- The generator fails when a referenced package is absent from `packages`, when a package has no catalog range, when a package is declared but not referenced, or when runtime source imports a dev-only package.
- A catalog bump changes one line in `packages`; repeating the same range in every component is unnecessary.

### Consumer reconciliation

Installed components are inferred from the copied source tree. No `yam3x` component list or lockfile is used for dependency synchronization:

- Core is installed when the path referenced by `yam3x.style` exists.
- A component is installed when its declared `index.ts` target exists under `src/components/yam3x/`.
- Missing files for an installed component are reported separately; no state is stored.
- A project without `yam3x` component state is inferred from its copied entrypoints.

The CLI exposes three actions backed by one planner in [`packages/cli/src/plan.mjs`](../../../../packages/cli/src/plan.mjs):

| Command                  | Reads                                                              | Writes                                    |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------- |
| `yam3x status`           | Registry, copied files, `package.json`, installed package versions | Nothing                                   |
| `yam3x sync`             | Installed components                                               | Dependency declarations only              |
| `yam3x add <components>` | Requested components                                               | Missing files and dependency declarations |

`status` reports:

- Missing runtime, peer, or development dependencies.
- Declared ranges that are not a subset of the registry requirement, using `semver.subset` rather than `semver.intersects`.
- Installed versions from `node_modules/<package>/package.json` that do not satisfy the requirement.
- Missing files for installed components.

`sync` adds missing declarations and narrows unsafe ranges. It does not remove dependencies, because the application may use them independently. It does not overwrite copied source. It supports `--dry-run` and `--no-install`.

`add` preflights every requested component and the installed core before writing anything. It then copies missing files, writes `package.json` once, and installs once. A validation failure leaves the project unchanged. `add` still preserves existing copied files and does not merge changed source.

The planner owns ordering, range validation, section selection, and file actions. `status` prints the plan. `sync` applies the dependency portion. `add` applies file and dependency actions. Tests exercise the commands through disposable consumers, including unsafe ranges, missing dependencies, peer validation, preflight behavior, and state-free component inference.

### Developer workflow

Dependencies are updated in source policy, never in generated JSON.

#### Add a runtime dependency

1. Add the package and range to the [catalog](../../../../pnpm-workspace.yaml).
2. Add the package to `registry/package.json` under `dependencies` with `"catalog:"`.
3. Import it from the component or foundation source.
4. Run `pnpm install`, `pnpm registry:check`, and `pnpm test:cli`.
5. Run focused browser checks for affected components.

The generator discovers the import. No component-level range is authored.

#### Remove a dependency

1. Remove all imports from registry source.
2. Run `pnpm registry:check`; the unused-allowlist invariant fails.
3. Remove the package from `registry/package.json`, and from the catalog when no other workspace package uses it.
4. Run `pnpm install` and `pnpm test:cli`.

There is no committed generated file to clean up.

#### Upgrade a dependency

1. Change the package range in the catalog.
2. Run `pnpm install`.
3. Run `pnpm registry:check` and `pnpm test:cli`. The latter builds every component in a disposable consumer with the new resolved version.
4. Run targeted browser checks for components that directly or transitively use the package.
5. For a major upgrade, review upstream API and behavior changes before changing component source.

`pnpm deps:update` refreshes catalog ranges and resolved versions to current compatible releases and runs the registry and CLI checks. It does not apply major upgrades; review those separately.

#### Add a peer dependency

1. Add it to `registry/package.json` under `peerDependencies` with `"catalog:"`.
2. Import it where needed.
3. Run the standard checks.

The CLI validates the peer range and installed version but does not add it to the application's runtime dependencies. A missing or unsafe peer blocks `init`, `add`, and `sync` with an actionable error.

#### Add a foundation setup tool

1. Add it to `registry/package.json` under `devDependencies`.
2. List its package name in `registry/foundations/registry.json` under `core.devDependencies`.
3. Run the standard checks.

If no foundation setup tool exists, remove this unused extension point rather than keeping an untested path.

### Repository automation

- `pnpm deps:update` is `pnpm update -r && pnpm registry:check && pnpm test:cli`.
- `pnpm test:cli` prepares the CLI registry, checks catalog usage, and builds every component with only its declared dependencies.
- `prepack` generates metadata before copying files, so a stale package is impossible.
- `sync` does not remove application dependencies, and no command automatically overwrites copied source.

## Alternatives considered

- **Keep the committed registry and add `registry:generate` to dependency PRs.** Preserved reviewable dependency diffs but retained a derived file that drifted on every catalog change. Rejected because the source imports and catalog already express the change; the generated file added a second update step without adding authority.
- **Keep the committed registry and add an installed-component manifest or lockfile.** Made `status` easier for old projects but introduced a fourth state source that had to be kept synchronized with copied files. Rejected for dependency synchronization; a lockfile remains appropriate later if source diff/hash-based updates are implemented.
- **Use `semver.intersects` for compatibility.** Simpler and matched the earlier code, but accepted declared ranges that could resolve to untested versions. Rejected in favor of `semver.subset` plus actual installed-version checks.
- **Publish components as an npm package with package exports.** Solved updates through normal package management but abandoned the editable-source delivery model that defines YAM3X. Rejected.
- **Create a `package.json` per component with independent versions.** Introduced a second version source and separate release management for modules that are copied together. Rejected unless components become independently published packages.
- **Automatically overwrite copied source during `sync` or `update`.** Would destroy application-owned edits. Rejected; source upgrades remain an explicit diff/apply workflow, separate from dependency reconciliation.

## Consequences

### Positive impacts

- A catalog version bump no longer creates a stale committed artifact or requires a second regeneration step in dependency PRs.
- The CLI package always ships metadata generated from the source and catalog used by the tests.
- Vue is treated as an application-provided peer instead of being added as a runtime dependency.
- Range checks reject declarations that permit untested versions, and `status` also checks the actual installed version when `node_modules` is available.
- `add` validates the complete request before writing, eliminating partial installs caused by a later incompatible component.
- `status` and `sync` make dependency drift observable and repairable without introducing new persistent state.
- Component discovery works for existing projects because it uses the copied entrypoints rather than a manifest that older installations lack.

### Costs and obligations

- Generated dependency metadata is no longer visible in Git diffs. Reviewers inspect the catalog, `registry/package.json`, and source imports; a generated JSON artifact can be produced for debugging with `node scripts/generate-registry.mjs`.
- `prepack` now requires the root development tooling used by the generator. Release and test workflows install development dependencies; a production-only install is not a supported packaging environment.
- The documentation site builds a small Vite virtual module backed by `buildRegistry()` instead of importing a committed JSON file.
- Filesystem inference misses components moved outside `src/components/yam3x/`. Add an explicit components-directory option only if that workflow becomes real.
- Dependency synchronization cannot detect upstream source changes. A lockfile with content hashes should be introduced only when source diff/update is implemented.
- `sync` narrows unsafe ranges and may surprise an application that intentionally declared a broader range. It is explicit, supports `--dry-run`, and never removes dependencies.
- Peer enforcement rejects a broad Vue range such as `^3.4.0`. That is intentional because the registry tests against `^3.5.44`; the error names the required range and the existing declaration.

## Verification

- `pnpm registry:check`: `OK: 62 component(s), 5 package(s), 0 issues.`
- `pnpm test:cli`: 41 tests passed, including every component build with only declared dependencies, the packed CLI, unsafe-range detection, missing-dependency repair, source-preserving sync, peer enforcement, preflight behavior, and state-free component inference.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm build`: passed with the documentation virtual module and no root registry snapshot.
- `pnpm docs:check`: 62 component page pairs, 15 guide pages, 148 demos, and 2 skills checked.
- `pnpm test:release`: 4 tests passed.

## Conditions to reconsider

Revisit this decision if consumers need reproducible source updates, if components become independently published packages, or if another package manager cannot expose installed versions through a `node_modules` layout. If generated metadata needs reviewability, publish it as a CI artifact or add a read-only print command rather than restoring a committed snapshot.
