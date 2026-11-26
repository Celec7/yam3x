# Conflict resolution

Use this reference after `diff` reports a non-clean file. Classify the intent before editing. A textual merge is not evidence that the component still behaves correctly.

## Upstream-only

The local file matches the baseline and upstream changed. Apply the upstream change as a unit with its shared helpers and foundation files. Re-check the component’s public surface after the merge.

Stop if the upstream change depends on a migration page that is absent, or if the file’s imports no longer resolve in the application.

## Local-only

The local file changed and upstream still matches the baseline. Leave the file alone. Record why the local extension exists when the application maintains such notes.

Do not “clean up” a local extension because the upstream file looks different. That difference is the application’s current behavior.

## Both changed

Compare three states: baseline, local, upstream. Decide separately:

- What application behavior does the local change provide?
- What behavior or fix does the upstream change provide?
- Can both be true at the same time?

If both can be true, merge by behavior and preserve the component’s public API unless the application owns the migration. If only one can be true, stop and ask for a product decision; do not choose silently.

Pay particular attention to focus order, event ownership, controlled state, async cleanup, and keyboard paths. A merge that compiles can still duplicate activation or lose focus restoration.

## Missing

A tracked file is absent locally. Restore it when the component is incomplete. If the removal was intentional, record that decision; the lock still records the upstream file, so a later `diff` will continue to report it until the application resolves the baseline.

## Untracked

A file exists without a lock entry. Identify its upstream source and whether the application authored it. Do not add it to the baseline by inventing a hash or copying a new upstream file over it.

## Added

Upstream provides a file that is absent locally. Copy it when the installed component requires it. If the application deliberately omits it, record the reason and expect the state to persist.

## Removed

Upstream no longer provides a tracked source file. Check imports and local edits before removing it. If the application still needs the file, keep it as local-only source until the component no longer imports it.

## Formatting-only differences

Formatting changes are local changes under the lock’s integrity rule. Use a normal diff to confirm that only whitespace moved. Do not rewrite the lock baseline to hide the formatting; either accept the file as local-only or apply the application’s formatting policy deliberately.

## Verification after a conflict

- Type-check and build the application.
- Exercise the changed behavior, not only the component’s default state.
- Check keyboard order and focus return.
- Check compact and expanded layouts.
- Check 200% text, RTL, reduced motion, and forced colors when the file owns those behaviors.
- Report any remaining conflict or unexplained state instead of calling the upgrade complete.
