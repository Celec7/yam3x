# Record source baselines and inspect drift before upgrading copied source

**Status:** implemented
**Date:** 2026-11-26
**Owner:** [CLI lock and source classification](../../../../packages/cli/src/lock.mjs), [CLI source states](../../../../packages/cli/src/source.mjs), [Update copied source](../../../../apps/docs/guide/maintain/updating.md)

## Problem

YAM3X distributes editable source instead of a runtime package. Once a consumer edits a copied file, the CLI cannot distinguish an intentional local change from an outdated upstream file. `add` preserves existing files and `status` only checked file presence and dependency declarations, so consumers had to compare their source tree with a repository checkout to find changed files. That made local patches invisible and made an upgrade depend on memory and manual inspection.

## Decision

The CLI records a committed `yam3x.lock.json` baseline and reads it during source inspection:

- Each entry maps a project-relative target to its upstream `source`, the upstream `version` that supplied the baseline, a normalized SHA-256 `integrity`, and its component or core ownership.
- The lock has no single version field because `add` may mix a new component from a newer CLI with older installed files. Each file carries its own baseline version.
- `init` and `add` record files they create. `add` does not advance the baseline of an existing entry.
- `adopt` records the 0.6.0 baseline for existing installations without modifying source. The published 0.6.0 package is immutable; the CLI ships a generated baseline manifest for that version. Versions before 0.6.0 are outside this flow.
- `status` reports source state counts alongside dependency state. `diff` is read-only and classifies files as `current`, `converged`, `upstream-only`, `local-only`, `conflict`, `missing`, `untracked`, `added`, or `removed`.
- `upgrade --apply-clean` copies only `upstream-only` files and advances their baseline. A `.yam3x/upgrade-journal.json` transaction reconciles interrupted applies from file hashes.
- `upgrade --resolve <target>` advances a resolved `conflict` or `converged` file to the target upstream without requiring the local result to equal upstream. `upgrade --finalize` refuses while the journal or any blocking state remains.
- The CLI never overwrites `local-only`, `conflict`, `missing`, `untracked`, `added`, or `removed` source. Local edits and conflicts remain explicit.

## Alternatives considered

- **A single lock version.** Rejected because copying one new component with a newer CLI creates a legitimately mixed baseline; a single version would lie about older files.
- **Hash the current local file as the baseline during adoption.** Rejected because a local patch would become indistinguishable from upstream content and could be overwritten on a later upgrade.
- **Fetch arbitrary historical versions from npm or git.** Rejected for the first slice. The supported baseline is 0.6.0, which keeps adoption deterministic and avoids a network path in the CLI.
- **Automatically overwrite copied source during `add` or upgrade.** Rejected because the copied source belongs to the application and may contain intentional behavior changes. A future apply flow must preserve conflicts rather than replace them.
- **Publish per-component packages.** Rejected; copied source remains the distribution model and per-component versions would add a second compatibility system.

## Consequences

- Consumers must commit `yam3x.lock.json`; otherwise source drift is reproducible only on the machine that created the lock.
- Formatting copied source counts as a local change because integrity is exact after BOM and line-ending normalization. Whitespace-only changes are not hidden.
- Missing files and intentional deletions are ambiguous and require a decision; the CLI reports them without restoring or deleting source.
- A known 0.6.0 local patch is classified as `local-only`; an upstream change touching the same file remains a `conflict`.
- Clean source application is transactional but not a three-way merge. Conflicts remain manual, and `--resolve` records the application’s decision rather than proving the merge is correct.

## Verification

- `pnpm test:cli` passed 68 tests, including lock generation, idempotent `add`, local-edit preservation, `adopt` from the 0.6.0 baseline, source-state classification, clean apply, conflict resolution/finalization, journal recovery, and packed CLI installation.
- `packages/cli/test/lock.test.mjs` covers hash normalization, deterministic lock writes, invalid schemas, and drift counts.
- `packages/cli/test/source.test.mjs` covers the state matrix and component filtering.
- `packages/cli/test/upgrade.test.mjs` covers journal filtering, ordering, target removal, and validation.
- `pnpm format:check` and `pnpm lint` cover the changed CLI and test files.

## Conditions to reconsider

- Consumers need automatic three-way merges or automatic conflict resolution; clean-file application and explicit resolution are implemented, but conflicts remain manual.
- Another historical version must be adoptable; the baseline manifest then needs a defined generation and support policy.
- The lock schema, journal schema, or integrity normalization changes; that requires a schema migration and an upgrade note for consumers.
