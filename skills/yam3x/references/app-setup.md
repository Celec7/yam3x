# App setup

This reference covers the setup a consumer agent usually needs before changing a page.

## Install and import

```sh
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
```

`init` copies foundation files (`src/yam3x.css`, `src/styles/yam3x-*.css`, and `src/lib/yam3x/`) and imports `yam3x.css` from the application entry point. `add` copies component source and declares dependencies. Run both from the application root.

Import copied components from the application's own tree:

```ts
import Button from './components/yam3x/button/button.vue'
```

Component pages use `@registry` imports for site demos only. Do not use them in an application.

## Fonts

The generated `yam3x.css` loads Roboto and three Material Symbols variants from Google Fonts. For offline apps or strict content security policies, self-host the fonts and keep the family names `Roboto`, `Material Symbols Outlined`, `Material Symbols Rounded`, and `Material Symbols Sharp`.

## Theme

Use the theme controller instead of hand-setting palette values:

```ts
import { createThemeController } from './lib/yam3x/theme/controller'

const theme = createThemeController(document.documentElement, {
  color: '#6750a4',
  variant: 'expressive',
  contrast: 'standard',
  mode: 'system',
  motion: 'expressive',
  density: 0,
  strongFocus: true,
})

// Call when the app shell unmounts.
theme.dispose()
```

- `mode`: `light`, `dark`, or `system`.
- `variant`: `expressive`, `vibrant`, `tonal-spot`, or `neutral`.
- `contrast`: `standard`, `medium`, or `high`.
- `motion`: `expressive` or `standard`.
- `density`: `0`, `-1`, or `-2`.
- `strongFocus`: also shows the shared focus ring on pointer focus.

The controller follows system color-scheme changes and dispatches a change event. Use `update` for later configuration changes. `getColorFromImage(img)` extracts a source color from a loaded image.

Theme application writes tokens to a target element. CSS variables inherit only through that element. Teleported overlays must sit inside the themed subtree or receive the theme on their DOM target.

See [Color and theming](https://yam3x.iscccc.cc/guide/foundations/color).

## Density

Density scales component spacing and supported container dimensions. It does not reduce type size or the 48px interactive target. Apply density through the theme, not by overriding individual components. Do not apply dense settings to focused tasks, menus, dialogs, or snackbars.

See [Spacing and density](https://yam3x.iscccc.cc/guide/foundations/spacing).

## Localization

Use `LocaleProvider` to share built-in interface language and message overrides across a Vue subtree:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LocaleProvider } from './components/yam3x/localization'
</script>

<template>
  <LocaleProvider locale="zh-CN">
    <slot />
  </LocaleProvider>
</template>
```

- The provider translates component-generated text, not application labels, record data, or server errors.
- Set the document or region `lang` and `dir` in the application; the provider does not change DOM language or writing direction.
- For SSR, choose one explicit locale for the server and the client to avoid a hydration mismatch.
- Calendar, Date input, Date picker, and Time picker use a browser locale fallback without a provider.

See [Localization](https://yam3x.iscccc.cc/components/localization).

## Motion and focus

The theme defaults to the expressive motion scheme and retains standard as an explicit option. Use the documented motion tokens; do not add local durations or easing curves. Preserve state information when reduced motion is requested.

Strong focus is a YAM3X option for pointer-focus visibility. Keep a visible keyboard focus indicator either way.

See [Gestures and interaction](https://yam3x.iscccc.cc/guide/foundations/gestures) and [Motion](https://m3.material.io/styles/motion/overview/how-it-works).

## Updating

Copied source is application-owned. `add` does not overwrite edited files or merge upstream changes. Follow [Update copied source](https://yam3x.iscccc.cc/guide/maintain/updating) when adopting a newer version, and re-run the application build and browser checks after merging.
