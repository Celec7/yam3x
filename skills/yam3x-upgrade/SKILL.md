---
name: yam3x-upgrade
description: Use when adopting a newer YAM3X copied-source version, recording the 0.6.0 baseline, or reconciling local source edits with upstream changes in a consumer application.
---

# YAM3X upgrade

Use this skill when an application already contains copied YAM3X source and must adopt a newer upstream version. The application owns every copied file; the upgrade is a merge, not a package update.

Do not use this skill for component design, page composition, or repository component alignment. Use the `yam3x` skill for application work and `yam3x-component-alignment` inside the YAM3X repository.

## Guardrails

- Never overwrite a copied file merely because upstream changed. Local edits are application behavior until the application decides otherwise.
- Never fabricate a baseline from the current local files. A local patch written as the baseline can be overwritten on the next upgrade.
- Never use `add` to advance an existing source baseline. `add` installs missing files; it does not merge or rebase tracked source.
- Never remove a tracked file only because upstream removed it. Check imports, local edits, and behavior first.
- Treat formatting-only changes as `local-only`; do not silently normalize them into an upstream match.
- Stop and report when the baseline version is unsupported, the lock is missing or invalid, or the available evidence cannot distinguish intent.

## Inputs

Resolve these from the application rather than assuming paths or versions:

1. The installed `yam3x.lock.json` and the supported adopt baseline documented in Update copied source.
2. `status` and `diff` output from the project’s YAM3X CLI. Prefer `--json` for a complete file list.
3. The release notes or migration page for the target version, when one exists.
4. The application’s own notes about local extensions.

The update guide owns the commands and state definitions. Do not hand-compute hashes or edit the lock to mark progress.

## Procedure

1. **Establish the baseline.** If the lock is absent and the app is on the supported 0.6.0 installation, run `adopt` with `--dry-run` first, then write and commit the lock. If the app is older than 0.6.0, stop; it must reach 0.6.0 manually. If a lock already exists, do not replace it.
2. **Inspect.** Run `status` and `diff`. Record counts and the exact targets for `upstream-only`, `local-only`, `conflict`, `missing`, `untracked`, `added`, and `removed`. Keep `converged` files as already current.
3. **Plan before editing.** For each non-clean target, state whether the application intends to keep, merge, restore, or remove it. Do not start with a bulk copy. If a breaking API or behavior change lacks a migration page, stop and report the gap.
4. **Apply clean files.** Run `upgrade --apply-clean` to copy `upstream-only` files and advance their lock entries. The CLI leaves every other state untouched. Do not bulk-copy `conflict` files.
5. **Preserve `local-only` files.** Leave them untouched unless the application explicitly decides to drop the local extension.
6. **Resolve `conflict` files by intent.** Read the local change and the upstream change separately. Combine behavior, not text. Re-check state ownership, focus, keyboard paths, and accessibility after merging. Record each resolution with `upgrade --resolve <target>`; it advances the baseline without requiring the local result to equal upstream.
7. **Decide missing and untracked files.** Restore a `missing` file when the component is incomplete; confirm an intentional deletion otherwise. Adopt an `untracked` file only after identifying its upstream source.
8. **Handle removed files.** Remove a tracked file only when its imports are gone and the application does not rely on the local copy. Keep local-only files as application-owned source.
9. **Align dependencies.** Run `status` and `sync` after the source merge. Do not let `sync` modify copied source.
10. **Verify.** Run the application type check and build. Exercise the affected interactions in a browser at compact, medium, and expanded widths; include keyboard flow, focus return, 200% text, RTL, reduced motion, and forced colors where relevant.
11. **Finalize.** Run `upgrade --finalize` only when the journal and every blocking state are resolved. `local-only` files may remain. Report state counts, files intentionally kept local, files removed, unresolved conflicts, and the lock version. Do not claim a clean upgrade while a `conflict` or unexplained `missing` remains.

The upgrade journal lives in `.yam3x/upgrade-journal.json` and is not committed. If a command is interrupted, rerun the upgrade; applied files are reconciled from their hashes before new work starts.

## Conflict judgment

Read [Conflict resolution](references/conflict-resolution.md) when a file is locally modified and upstream also changed. The short rule: preserve the application’s intent, apply the upstream intent, and stop when those intents cannot both be true.

## Reference

- [Update copied source](https://yam3x.iscccc.cc/guide/maintain/updating)
- [Configuration and customization](https://yam3x.iscccc.cc/guide/foundations/)
- [Component catalog](https://yam3x.iscccc.cc/components/)
