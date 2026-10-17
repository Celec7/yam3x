# yam3x

Add editable Material 3 Expressive Vue component source to an existing Vue/Vite app. The CLI copies files into your app so you can adapt them directly.

## Requirements

- Vue and Vite
- Tailwind CSS v4
- A `package.json`
- `src/main.ts` or `src/main.js`

## Usage

Run from the target app root:

```sh
pnpm dlx @celec7/yam3x@latest --version
pnpm dlx @celec7/yam3x@latest list
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
```

`--version` prints the CLI version. `list` prints the component names accepted by `add`. `init` copies shared foundation files, declares their dependencies, and imports `yam3x.css` from the app entry. `add` copies the requested components and declares their dependencies. The CLI installs dependencies with the package manager declared by the app, inferred from its lockfile, or npm by default.

Add `@tailwindcss/vite` to the existing Vite plugin list if it is not configured. The CLI prints a reminder but does not edit Vite configuration.

Use `--cwd <project>` to target a different directory. Use `--no-install` to update files and dependency declarations without running a package manager:

```sh
pnpm dlx @celec7/yam3x@latest add button --cwd ../my-app --no-install
```

The CLI preserves existing destination files. Running `add` again does not overwrite copied or edited source. It validates component names and dependency ranges before copying, but installation is not transactional: inspect the target if a later copy or package-manager step fails.
