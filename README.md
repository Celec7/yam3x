# YAM3X Vue

English | [简体中文](README_zh-CN.md)

YAM3X provides Vue-native Material 3 Expressive components as editable source. Add a component to your Vue app, then adapt its `.vue`, `.ts`, and `.css` files to your product.

Components use Material design tokens and Vue APIs. Switch and Dialog use Ark UI internally for interaction behavior.

## Getting started

In an existing Vue/Vite app with `src/main.ts` or `src/main.js`, initialize the foundations and add components:

```sh
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
```

The CLI copies editable source and declares dependencies; the copied components need no additional Vite plugins or styling build step. See the [installation guide](apps/docs/guide/start/installation.md) for a complete walkthrough.

## Documentation

- [Documentation site](https://yam3x.iscccc.cc/)
- [Documentation index](docs/README.md)
- [Project glossary](docs/glossary.md)
- [Component delivery pipeline](docs/contributing/component-implementation.md)
- [Agent skill](skills/yam3x/SKILL.md)
- [Install and use components](apps/docs/guide/start/installation.md)
- [Foundations](apps/docs/guide/foundations/index.md)
- [Project component design guides](docs/specs/README.md)
- [Color and theming](apps/docs/guide/foundations/color.md)
- [Update copied source](apps/docs/guide/maintain/updating.md)
- [Shared design foundations](docs/specs/foundations.md)
- [Architecture and source ownership](docs/architecture.md)
- [CLI package reference](packages/cli/README.md)
- [Changelog](CHANGELOG.md)
- [CLI release procedure](docs/contributing/releasing.md)

## Development

`pnpm dev` starts the local VitePress component documentation site. The [contributing guide](CONTRIBUTING.md) covers workspace checks; CLI integration tests verify copied source in a disposable Vue/Vite consumer.

## References

- [Material 3 Expressive guidance](https://m3.material.io/)
- [Jetpack Compose Material 3](https://developer.android.com/develop/ui/compose/designsystems/material3)
- [Android Views Material Components](https://github.com/material-components/material-components-android)
- [Material Web](https://github.com/material-components/material-web)
