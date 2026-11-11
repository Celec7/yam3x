# Color and theming

Components read color, shape, motion, state-layer, and touch-target values from semantic CSS variables. The CLI copies these foundation sources into the target app when you install components. See [Foundations](/guide/foundations/) for design principles and official entry points, and Material's [color guidance](https://m3.material.io/styles/color/overview) for color roles and dynamic color.

## Dynamic color

<ThemeExample />

<<< ../../components/demos/ThemeExample.vue

<script setup>
import ThemeExample from '../../components/demos/ThemeExample.vue'
</script>

`generateTheme` creates light and dark schemes from a six-digit hexadecimal source color with Material Color Utilities (MCU) using the 2025 color specification. It supports the `expressive`, `vibrant`, `tonal-spot`, and `neutral` variants and standard, medium, and high contrast. The default source is `#6750a4`, with `tonal-spot` as the project default variant. Initial CSS color tokens are generated from the same MCU configuration; VitePress supplies the image picker but does not define a separate color palette. `applyTheme` writes reference palettes and semantic color roles and can configure density, motion, and strong focus indicators. Strong focus also shows the shared focus ring on pointer focus, not only `:focus-visible`. Motion defaults to `expressive`; set it to `standard` for less overshoot.

The theme preview can apply its settings to interactive demos on component pages. Docs text and site navigation keep the docs theme. The selection stays active while navigating between docs pages; return here and use **Reset component demo theme** to clear it. A full page reload resets the preview selection.

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

// Call when the app shell is unmounted.
theme.dispose()
```

Set `mode` to `light`, `dark`, or `system`. The controller follows system color-scheme changes and dispatches a bubbling `change` event when the effective configuration changes. Use `update` to change the configuration later.

`getColorFromImage(img)` extracts a theme source color from a loaded image. The theme guide reads a selected local image in the browser and does not upload it.

## Theme preview icon

`theme-preview-icon.vue` supports `color`, `variant`, `scheme` (`auto`/`light`/`dark`), and the accessible name `label`. Customize its preview with `--yam3x-theme-icon-size`, `--yam3x-theme-icon-shape`, `--yam3x-theme-icon-outline-color`, `--yam3x-theme-icon-outline-opacity`, `--yam3x-theme-icon-container-color`, and `--yam3x-theme-icon-color`.

## Custom tokens

Default tokens are in `src/styles/yam3x-tokens.css`; shared interaction styles are in `src/styles/yam3x-base.css`. Edit these copied files in your app to customize them. Component demos use the registry source, not your app's copy.

## Application styles

The foundation stylesheet also exposes semantic color, typography, shape, and spacing custom properties for application-owned CSS. Use them directly:

```css
.notice {
  padding: var(--md-sys-spacing-16);
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-family: Roboto, ui-sans-serif, system-ui, sans-serif;
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  font-weight: var(--md-sys-typescale-body-medium-font-weight);
}
```

For a YAM3X component's internal appearance, use the props and documented CSS custom properties on its component page.

The project does not ship utility classes. Consuming applications may add their own styling tools, including Tailwind, but YAM3X components use standard CSS and the semantic custom properties above.

## Related foundations

- [Spacing and density](/guide/foundations/spacing) for density configuration and application spacing.
- [Gestures and interaction](/guide/foundations/gestures) for pointer capability flags.

## Material references

[Color roles](https://m3.material.io/styles/color/roles) · [Color system](https://m3.material.io/styles/color/overview) · [Dynamic color](https://m3.material.io/styles/color/dynamic-color/overview)
