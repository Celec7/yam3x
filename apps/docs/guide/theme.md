# Color and theming

Components read color, shape, motion, state-layer, and touch-target values from semantic CSS variables. The CLI copies these foundation sources into the target app when you install components. See [Design foundations](/guide/design) for design principles and official entry points, and Material's [color guidance](https://m3.material.io/styles/color/overview) for color roles and dynamic color.

## Dynamic color

<ThemeExample />

<<< ../components/demos/ThemeExample.vue

<script setup>
import ThemeExample from '../components/demos/ThemeExample.vue'
</script>

`generateTheme` creates light and dark schemes from a six-digit hexadecimal source color with Material Color Utilities (MCU) using the 2025 color specification. It supports the `expressive`, `vibrant`, `tonal-spot`, and `neutral` variants and standard, medium, and high contrast. The default source is `#6750a4`, with `tonal-spot` as the project default variant. Initial CSS color tokens are generated from the same MCU configuration; VitePress supplies the image picker but does not define a separate color palette. `applyTheme` writes reference palettes and semantic color roles and can configure density, motion, and strong focus indicators. Motion defaults to `expressive`; set it to `standard` for less overshoot.

`density` accepts `0`, `-1`, or `-2`. The compact settings scale component spacing to 87.5% or 75% and reduce supported container dimensions. Font sizes and the 48px minimum interactive target remain unchanged. The factors and density levels are project decisions.

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
