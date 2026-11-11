<!--
Agent lifecycle guidance:
- Status: proposed.
- On implementation: move this file to docs/agents/notes/implemented/, change Status to implemented, rewrite ## Proposal into present-tense ## Decision, replace acceptance criteria and risks with ## Consequences and ## Verification, and commit in the same change as the code.
- If rejected: move to docs/agents/notes/rejected/ with a one-line rejection reason on the Status line.
-->

# Registry dependency lifecycle and generated metadata

**Status:** proposed
**Date:** 2026-11-11
**Owner:** [Architecture and ownership](../../../architecture.md), [registry package](../../../../registry/package.json), [CLI](../../../../packages/cli/src/index.mjs)

## Problem

YAM3X distributes editable component source. The registry currently has three inputs:

- Component and foundation imports under [`registry/`](../../../../registry).
- Dependency ranges in the [workspace catalog](../../../../pnpm-workspace.yaml).
- Runtime and peer package policy in [`registry/package.json`](../../../../registry/package.json).

[`scripts/generate-registry.mjs`](../../../../scripts/generate-registry.mjs) derives a fourth artifact, [`registry/registry.json`](../../../../registry/registry.json), containing each component's file closure and dependency ranges. That artifact is committed, copied into the CLI package during `prepack`, and checked for freshness by `pnpm registry:check`.

This creates avoidable drift and update work:

- A catalog version change makes the committed artifact stale even though the source and dependency topology did not change. Dependency PRs, including automated ones, need a second manual regeneration step.
- The root artifact duplicates information already present in source imports and the catalog. It is a build product committed as source.
- The CLI has no consumer-side dependency reconciliation. `add` only fills missing declarations, and an existing compatible range is never checked against the actual installed version.
- `validateDependencyRequirements` uses `semver.intersects`, which accepts a consumer range that includes versions the registry did not test. For example, `^5.0.0` intersects `^5.39.3` even though the consumer may still install 5.0.0.
- Vue is treated as a runtime dependency in the generated core metadata, so `init` can add or rewrite Vue rather than validating the application-provided peer.
- Dependency validation happens per component after earlier components have already copied files and updated `package.json`. A later incompatible component leaves a partial install.
- The allowlist is only checked in one direction. A package removed from all imports can remain in `registry/package.json` indefinitely.

The existing isolation tests are strong: [`packages/cli/test/cli.test.mjs`](../../../../packages/cli/test/cli.test.mjs) installs and builds every component with only its declared dependencies. The problem is the metadata lifecycle around those tests, not the closure calculation itself.

## Proposal

Adopt a derive-and-reconcile model. Source imports and the catalog are the only committed dependency inputs. The CLI consumes generated metadata and reconciles it against the application's actual files and dependency declarations. Do not add a second persistent state file for dependency synchronization.

### Generated metadata is a build artifact

- Refactor `scripts/generate-registry.mjs` into a side-effect-free `buildRegistry()` function plus a thin command entry point.
- Delete the committed root `registry/registry.json`.
- `prepare-cli-package.mjs` calls `buildRegistry()` and writes `packages/cli/registry/registry.json` before copying source files. That directory is already ignored by Git.
- The CLI always reads `packages/cli/registry/registry.json`, in both workspace development and the packed package. A missing file fails with a clear instruction to run `pnpm registry:prepare`.
- `pnpm registry:check` builds the model in memory and validates it; it no longer compares a committed snapshot.
- `pnpm yam3x`, `pnpm test:cli`, and `prepack` run the preparation step so local development and release packaging use the same generated input.
- The hand-authored [`registry/foundations/registry.json`](../../../../registry/foundations/registry.json) remains the source-to-target mapping. It is not generated.

This removes the stale-artifact problem and makes the published package the only place where resolved metadata exists at runtime. A catalog bump no longer requires a generated file commit.

### Normalize the generated registry

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
- `registry/package.json` gains `peerDependencies` for Vue. The generator removes core packages from component dependency lists to avoid duplication.
- The generator fails when a referenced package is absent from `packages`, when a package has no catalog range, or when a package is declared but not referenced by any foundation or component.
- A catalog bump changes one line in `packages`; repeating the same range in every component is unnecessary.

### Reconcile consumer state

Installed components are inferred from the copied source tree. No `yam3x` component list or lockfile is required for dependency synchronization:

- Core is installed when the path referenced by `yam3x.style` exists.
- A component is installed when its declared `index.ts` target exists under `src/components/yam3x/`.
- Missing files for an installed component are reported separately; no state is stored.

The CLI exposes three actions backed by one planner:

| Command                  | Reads                                                              | Writes                                    |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------- |
| `yam3x status`           | Registry, copied files, `package.json`, installed package versions | Nothing                                   |
| `yam3x sync`             | Installed components                                               | Dependency declarations only              |
| `yam3x add <components>` | Requested components                                               | Missing files and dependency declarations |

`status` reports:

- Missing runtime, peer, or dev dependencies.
- Declared ranges that are not a subset of the registry requirement, using `semver.subset` rather than `semver.intersects`.
- Installed versions from `node_modules/<package>/package.json` that do not satisfy the requirement.
- Missing files for installed components.

`sync` adds missing declarations and narrows unsafe ranges. It does not remove dependencies, because the application may use them independently. It does not overwrite copied source. It supports `--dry-run` and `--no-install`.

`add` preflights every requested component and the installed core before writing anything. It then copies missing files, writes `package.json` once, and installs once. A validation failure leaves the project unchanged.

The planner is a deep module rather than duplicated command logic:

```text
readProjectState(registry, projectRoot)
  -> planReconcile(registry, state, requestedComponents)
  -> applyPlan(plan)
```

`status` prints the plan. `sync` applies the dependency portion. `add` applies file and dependency actions. Tests can exercise `planReconcile` directly with fixtures.

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
2. Run `pnpm registry:check`; the unused-allowlist invariant must fail.
3. Remove the package from `registry/package.json`, and from the catalog when no other workspace package uses it.
4. Run `pnpm install` and `pnpm test:cli`.

There is no committed generated file to clean up.

#### Upgrade a dependency

1. Change the package range in the catalog.
2. Run `pnpm install`.
3. Run `pnpm registry:check` and `pnpm test:cli`. The latter builds every component in a disposable consumer with the new resolved version.
4. Run targeted browser checks for components that directly or transitively use the package.
5. For a major upgrade, review upstream API and behavior changes before changing component source.

`pnpm deps:update` updates resolved versions within existing catalog ranges and runs the checks. It does not replace a deliberate catalog change for a major or targeted upgrade.

#### Add a peer dependency

1. Add it to `registry/package.json` under `peerDependencies` with `"catalog:"`.
2. Import it where needed.
3. Run the standard checks.

The CLI validates the peer range and installed version but does not add it to the application's runtime dependencies.

#### Add a foundation setup tool

1. Add it to `registry/package.json` under `devDependencies`.
2. List its package name in `registry/foundations/registry.json` under `core.devDependencies`.
3. Run the standard checks.

If no foundation setup tool exists, remove this unused extension point rather than keeping an untested path.

### Repository automation

- Add an npm Dependabot ecosystem entry for the pnpm workspace. Catalog and lockfile updates then open as normal PRs.
- Add `pnpm deps:update` as `pnpm update -r && pnpm registry:check && pnpm test:cli`.
- Keep `pnpm test:cli` as the compatibility gate. It already installs every component with only its declared dependencies.
- Make `prepack` generate metadata before copying files, so a stale package is impossible.
- Do not auto-remove application dependencies during `sync`, and do not auto-overwrite copied source.

## Alternatives considered

- **Keep the committed registry and add `registry:generate` to dependency PRs.** Preserves reviewable dependency diffs but retains a derived file that drifts on every catalog change. Rejected because the source imports and catalog already express the change; the generated file adds a second update step without adding authority.
- **Keep the committed registry and add an installed-component manifest or lockfile.** Makes `status` easier for old projects but introduces a fourth state source that must be kept synchronized with copied files. Rejected for dependency synchronization; a lockfile remains appropriate later if source diff/hash-based updates are implemented.
- **Use `semver.intersects` for compatibility.** Simpler and matches the current code, but accepts declared ranges that may resolve to untested versions. Rejected in favor of `semver.subset` plus actual installed-version checks.
- **Publish components as an npm package with package exports.** Solves updates through normal package management but abandons the editable-source delivery model that defines YAM3X. Rejected.
- **Create a `package.json` per component with independent versions.** Introduces a second version source and separate release management for modules that are copied together. Rejected unless components become independently published packages.
- **Automatically overwrite copied source during `sync` or `update`.** Would destroy application-owned edits. Rejected; source upgrades remain an explicit diff/apply workflow, separate from dependency reconciliation.

## Acceptance criteria

- A clean checkout has no root `registry/registry.json`; `pnpm test:cli` and `pnpm pack` generate metadata from source and catalog.
- `packages/cli/registry/registry.json` is produced by `buildRegistry()` and is not committed.
- `pnpm registry:check` fails for a missing catalog range, an undeclared import, or an unused `registry/package.json` entry.
- Schema version 4 emits a single `packages` table and component dependency names; Vue is a peer dependency and is not added to a consumer's runtime dependencies.
- `yam3x status` detects a missing dependency, a declared range that is not a subset of the requirement, and an installed version that does not satisfy it.
- `yam3x sync` changes only dependency declarations for installed components and leaves copied source untouched.
- `yam3x add button switch` with an incompatible dependency for `switch` writes no files and leaves `package.json` unchanged.
- An npm dependency update that changes only catalog ranges passes `pnpm test:cli` without a generated-file commit.
- `pnpm deps:update`, `pnpm registry:check`, `pnpm test:cli`, and `pnpm build` pass in CI.

## Risks

- Generated metadata is no longer visible in Git diffs. If review visibility is required, publish the generated JSON as a CI artifact or add a read-only `registry:print` command; do not make it a second committed source.
- `prepack` now requires the root build tooling used by the generator. The release and test workflows already install development dependencies; a production-only install is not a supported packaging environment.
- Removing the root metadata file changes test, documentation, and CLI paths. All references must migrate in the same change; the existing `registry:check` name should remain as the invariant check to limit contributor confusion.
- Filesystem-based installed-component detection can miss components moved outside `src/components/yam3x/`. Add an explicit components-directory option only if that workflow becomes real.
- Dependency synchronization cannot detect upstream source changes. A lockfile with content hashes should be introduced only when source diff/update is implemented.
- `sync` narrows unsafe ranges and may surprise an application that intentionally declared a broader range. Keep it explicit, support `--dry-run`, and never remove dependencies.
- Peer enforcement can reject a broad Vue range such as `^3.4.0`. That is intentional because the registry tests against `^3.5.44`; the error must name the required range and the installed or declared version.

Revisit this decision if consumers need reproducible source updates, if components become independently published packages, or if another package manager cannot expose installed versions through a `node_modules` layout.
