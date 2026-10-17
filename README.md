# YAM3X Vue

English | [简体中文](README_zh-CN.md)

YAM3X provides Vue-native Material 3 Expressive components as editable source. Add a component to your Vue app, then adapt its `.vue`, `.ts`, and `.css` files to your product.

Components use Material design tokens and Vue APIs. Switch and Dialog use Ark UI internally for interaction behavior.

## Getting started

In an existing Vue/Vite app with `src/main.ts` or `src/main.js`, initialize the foundations and add components:

```sh
pnpm dlx yam3x@latest init
pnpm dlx yam3x@latest add button switch dialog
```

The CLI copies editable source and declares dependencies. Add `@tailwindcss/vite` to the app's Vite plugins if it is not already configured; the CLI does not edit Vite configuration. See the [installation guide](apps/docs/guide/installation.md) for a complete walkthrough.

## Documentation

- [Documentation site](https://yam3x.iscccc.cc/)
- [Documentation index](docs/README.md)
- [Install and use components](apps/docs/guide/installation.md)
- [Design foundations](apps/docs/guide/design.md)
- [Project component design guides](docs/specs/README.md)
- [Theme and dynamic color](apps/docs/guide/theme.md)
- [Update copied source](apps/docs/guide/updating.md)
- [Shared design foundations](docs/specs/foundations.md)
- [Architecture and source ownership](docs/architecture.md)
- [CLI package reference](packages/cli/README.md)
- [CLI release procedure](docs/releasing.md)

## Development

`pnpm dev` starts the local VitePress component documentation site. The [contributing guide](CONTRIBUTING.md) covers workspace checks; CLI integration tests verify copied source in a disposable Vue/Vite consumer.

## References

- [Material 3 Expressive guidance](https://m3.material.io/)
- [matraic/m3e](https://github.com/matraic/m3e)
