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
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest sync
```

`--version` prints the CLI version. `list` prints the component names accepted by `add`. `init` copies shared foundation files, including the YAM3X design route as `src/components/yam3x/AGENTS.md` when no file exists there, declares dependencies, and imports `yam3x.css` from the app entry. `add` initializes core when needed, then copies the requested components and their dependencies. The CLI installs dependencies with the package manager declared by the app, inferred from its lockfile, or npm by default.

Vue is a peer dependency. The CLI validates its declared range and installed version, but does not add Vue to the application.

`status` reports installed components, missing dependencies, declared ranges that permit versions outside the registry requirement, and installed versions that do not satisfy it. It writes nothing. `sync` adds missing runtime and development dependencies and narrows unsafe declarations for installed components; it does not remove dependencies or modify copied source. Use `--json` with `status` for machine-readable output, and `--dry-run` with `sync` to inspect the planned changes.

Use `--cwd <project>` to target a different directory. Use `--no-install` to update files and dependency declarations without running a package manager:

```sh
pnpm dlx @celec7/yam3x@latest add button --cwd ../my-app --no-install
```

The CLI preserves existing destination files, including an existing `src/components/yam3x/AGENTS.md`; an app-root `AGENTS.md` is independent. Running `add` again does not overwrite copied or edited source. It validates every requested component before copying files or declaring dependencies, but installation is not transactional: inspect the target if a later copy or package-manager step fails.
