# Release the CLI

The public package is `yam3x` in `packages/cli`. It bundles the generated registry and installs editable component source into an existing Vue/Vite app. The CLI binary is also named `yam3x`.

## Before the first release

1. Confirm that the unscoped npm name `yam3x` is available to the release owner. If the package name changes, update `packages/cli/package.json` and every `pnpm dlx` command in the READMEs and English/Chinese docs, including this release procedure.
2. Confirm that `packages/cli/package.json` links to the canonical GitHub repository, documentation site, and issue tracker.
3. Review the package version, MIT copyright notice, README, and generated source list.
4. From the repository root, run:

   ```sh
   pnpm install --frozen-lockfile
   pnpm registry:check
   pnpm test:cli
   pnpm build
   ```

5. Pack the CLI and inspect the archive contents. The `prepack` script copies the current registry files and root MIT license into the package before packing:

   ```sh
   cd packages/cli
   pnpm pack --pack-destination /tmp/yam3x-release
   ```

   Confirm the archive includes `src/index.mjs`, `registry/registry.json`, all source files referenced by the registry, `README.md`, and `LICENSE`. The package test exercises the packed CLI against a disposable consumer app.

## First publish

The npm trusted publisher is configured in the settings for an existing package, so the first version must be published manually. After the package name is final and the checks pass, authenticate with npm and publish from `packages/cli`:

```sh
cd packages/cli
pnpm publish --access public
```

After that initial publish, configure trusted publishing when preparing the first new version that CI will publish. Open `yam3x` on npmjs.com and add a GitHub Actions trusted publisher with:

- GitHub owner: `Celec7`
- Repository: `yam3x`
- Workflow filename: `publish.yml`
- Environment: leave empty
- Allowed action: enable direct `npm publish`

The workflow needs this publisher configuration before a new version can be published by CI. npm expires a new trusted publisher configuration unless its first CI publish succeeds within two days, so configure it shortly before pushing the first new version tag.

If you tag the manually published version, CI runs the checks and skips the registry upload because that version already exists.

## Later releases

For each release, update `packages/cli/package.json` to a new stable version and commit the change to `main`. For the first CI release, configure the trusted publisher immediately before pushing its tag. Then push a tag that matches the package version. For example, package version `0.2.0` uses tag `v0.2.0`:

```sh
git tag v0.2.0
git push origin v0.2.0
```

The `Publish npm package` workflow verifies the tag matches the package version, runs the repository checks, packs the CLI, and publishes that exact archive using npm trusted publishing. It also waits for the new package version to become available. No npm token is stored in GitHub secrets. Do not reuse a version that has already been published.

The OIDC publisher settings must match the repository and workflow filename exactly. If the workflow is renamed, update the npm trusted publisher configuration before the next release. For background, see npm's [trusted publishing guide](https://docs.npmjs.com/trusted-publishers/) and pnpm's [`publish` reference](https://pnpm.io/cli/publish).
