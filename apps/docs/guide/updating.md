# Update copied source

Your app maintains installed components and foundation files. Running `pnpm dlx @celec7/yam3x@latest add` again adds missing files only; it does not overwrite files already copied or edited, and it does not merge upstream changes automatically.

To adopt a newer version from this repository:

1. Compare `src/components/yam3x/`, `src/styles/yam3x-*.css`, and `src/lib/yam3x/` in your app with the corresponding source under this repository's `registry/` directory.
2. Merge related changes to components, shared helpers, and design foundations together, while preserving your app's own changes.
3. Check the component's file and dependency declarations in `registry/registry.json`, then install any new dependencies.
4. Run your app's type check and build, then try the affected interactions in a browser.

To add a new component, follow [Installation and first use](/guide/installation). Command options are documented in `packages/cli/README.md` in the repository.
