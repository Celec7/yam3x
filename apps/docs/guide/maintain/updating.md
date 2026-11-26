# Update copied source

Your app owns the source copied by `add`. The CLI adds missing files and reconciles dependency declarations; it does not overwrite edited files or merge upstream source automatically.

Agents that support Agent Skills can install the upgrade workflow with `npx skills add Celec7/yam3x@yam3x-upgrade`. The skill owns merge judgment; this page owns the commands and states.

## Record the 0.6.0 baseline

Installs made with the current CLI create `yam3x.lock.json`. The lock records the upstream version and content hash for each copied file. Commit it with the copied source.

An app that predates the lock can record its existing 0.6.0 installation without changing source:

```sh
pnpm dlx @celec7/yam3x@latest adopt
pnpm dlx @celec7/yam3x@latest adopt --dry-run
```

`adopt` supports the 0.6.0 baseline. Use `--from 0.6.0` when the version must be explicit. It refuses to replace an existing lock. Installations older than 0.6.0 must first be brought to 0.6.0 manually; later releases write the lock when they install source.

## Inspect source drift

```sh
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest diff
pnpm dlx @celec7/yam3x@latest diff --json
pnpm dlx @celec7/yam3x@latest diff --component button
```

`status` reports dependency declarations and a source summary. `diff` lists source files whose content or upstream source differs from the lock. Neither command writes source.

| State           | Meaning                                                    | Action                                                |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| `current`       | Local, baseline, and upstream content are unchanged        | None                                                  |
| `converged`     | Local content already matches the current upstream content | None                                                  |
| `upstream-only` | The local file matches the baseline; upstream changed      | Merge the upstream change                             |
| `local-only`    | Local content changed; upstream matches the baseline       | Keep the local change                                 |
| `conflict`      | Local and upstream both changed                            | Merge both intents and check behavior                 |
| `missing`       | The lock lists a file that is absent locally               | Restore it or confirm that the removal is intentional |
| `untracked`     | A file exists without a lock entry                         | Add it only after identifying its upstream source     |
| `added`         | Upstream provides a file that is absent locally            | Copy it when the installed component needs it         |
| `removed`       | Upstream no longer provides a tracked source file          | Remove it only after checking imports and local edits |

`status` exits with a nonzero code for dependency issues, conflicts, and missing files. `diff` exits with a nonzero code for any state other than `current` or `converged`.

## Merge source

1. Start from a clean application worktree and keep the lock committed.
2. Run `diff` and review every `upstream-only` and `conflict` file.
3. Merge component files, shared helpers, and foundation files together; do not apply one layer without the others.
4. Preserve `local-only` changes deliberately. Record why a divergence exists in the application's own notes.
5. Treat `missing`, `untracked`, and `removed` entries as decisions, not cleanup commands.

The CLI does not apply source changes automatically. `add` remains an install command: it fills missing files but does not advance an existing lock baseline.

## Align dependencies

After the source merge:

```sh
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest sync
```

`sync` adds missing runtime and development dependencies and narrows declarations that permit versions outside the registry requirement. It does not remove dependencies or modify copied source.

## Verify

Run the application type check and build, then exercise the affected interactions in a browser. Check compact and expanded layouts, keyboard order, focus return, 200% text, RTL, forced colors, and reduced motion where the change touches them.

To add a new component, follow [Installation and first use](/guide/start/installation). Command options are documented in the CLI package reference.

See [Foundations](/guide/foundations/) for the typography, spacing, shape, and motion guidance that source updates follow.
