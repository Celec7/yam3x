# yam3x

Add editable Material 3 Expressive Vue component source to an existing Vue/Vite app. The CLI copies files into your app so you can adapt them directly.

## Requirements

- Vue and Vite
- A `package.json`
- `src/main.ts` or `src/main.js`

## Usage

Run from the target app root:

```sh
pnpm dlx @celec7/yam3x@latest --version
pnpm dlx @celec7/yam3x@latest list
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
pnpm dlx @celec7/yam3x@latest adopt
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest diff
pnpm dlx @celec7/yam3x@latest upgrade
pnpm dlx @celec7/yam3x@latest upgrade --apply-clean
pnpm dlx @celec7/yam3x@latest sync
```

`--version` prints the CLI version. `list` prints the component names accepted by `add`. `init` copies shared foundation files, including the YAM3X design route as `src/components/yam3x/AGENTS.md` when no file exists there, declares dependencies, and imports `yam3x.css` from the app entry. `add` initializes core when needed, then copies the requested components and their dependencies. The CLI installs dependencies with the package manager declared by the app, inferred from its lockfile, or npm by default.

`init` and `add` write `yam3x.lock.json` for source files they create. The lock records the upstream version and normalized content hash for each file. Keep it committed with the copied source. `add` preserves existing files and does not advance the baseline of a file that already has a lock entry.

An app with copied source but no lock can record the 0.6.0 baseline without modifying source:

```sh
pnpm dlx @celec7/yam3x@latest adopt
pnpm dlx @celec7/yam3x@latest adopt --from 0.6.0 --dry-run
```

`adopt` supports the 0.6.0 baseline and refuses to replace an existing lock. Installations older than 0.6.0 must first be brought to 0.6.0 manually. Later releases write the lock when they install source.

Vue is a peer dependency. The CLI validates its declared range and installed version, but does not add Vue to the application.

`status` reports installed components, dependency declarations, installed versions, and a source summary. `diff` lists source files whose local content, baseline, or upstream source differs:

```sh
pnpm dlx @celec7/yam3x@latest diff --json
pnpm dlx @celec7/yam3x@latest diff --component button
```

`diff` states are `current`, `converged`, `upstream-only`, `local-only`, `conflict`, `missing`, `untracked`, `added`, and `removed`. It writes nothing and exits nonzero for any state other than `current` or `converged`. `status` exits nonzero for dependency issues, conflicts, and missing files. Neither command applies source changes.

`upgrade` plans the source merge without writing by default. `--apply-clean` copies only `upstream-only` files and advances their lock entries; it never overwrites `local-only`, `conflict`, `missing`, `untracked`, `added`, or `removed` files. A local `.yam3x/upgrade-journal.json` records an in-progress apply and is not committed.

After resolving a conflict in the application source, record the resolution and advance that file’s baseline:

```sh
pnpm dlx @celec7/yam3x@latest upgrade --resolve src/components/yam3x/button/button.vue
pnpm dlx @celec7/yam3x@latest upgrade --finalize
```

`--resolve` accepts a `conflict` or `converged` target. `--finalize` refuses while the journal or any `upstream-only`, `conflict`, `missing`, `untracked`, `added`, or `removed` state remains; `local-only` files may remain intentionally. `upgrade`, `--apply-clean`, `--resolve`, and `--finalize` support `--json`; `--apply-clean --dry-run` prints the plan without writing.

`sync` adds missing runtime and development dependencies and narrows unsafe declarations for installed components; it does not remove dependencies or modify copied source. Use `--json` with `status` or `diff` for machine-readable output, and `--dry-run` with `sync` to inspect the planned changes.

Use `--cwd <project>` to target a different directory. Use `--no-install` to update files and dependency declarations without running a package manager:

```sh
pnpm dlx @celec7/yam3x@latest add button --cwd ../my-app --no-install
```

The CLI preserves existing destination files, including an existing `src/components/yam3x/AGENTS.md`; an app-root `AGENTS.md` is independent. Running `add` again does not overwrite copied or edited source. It validates every requested component before copying files or declaring dependencies, but installation is not transactional: inspect the target if a later copy or package-manager step fails.
