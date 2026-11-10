<script setup lang="ts">
import IconAxesExample from './demos/IconAxesExample.vue'
import IconBasicExample from './demos/IconBasicExample.vue'
import IconExample from './demos/IconExample.vue'
</script>

# Icon

Icons are small symbols to easily identify actions and categories. `Icon` is the project renderer for Material Symbols ligatures and for SVGs registered from your app.

Use it for nearby content or inside an accessible control, never as a substitute for the control's name. Register an SVG when the app cannot load the icon font.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme">
  <IconBasicExample />
</div>

`name` selects the Material Symbols ligature. An icon without `aria-label` or `aria-labelledby` stays decorative; the parent element carries the label. Size follows `--yam3x-icon-size`, which defaults to `24px`.

::: details View demo source

<<< ./demos/IconBasicExample.vue{vue}

:::

### Style and fill axes

Material Symbols are the new default, and are available in three styles: outlined, rounded, and sharp. Material Symbols have four adjustable stylistic variable font attributes called axes. `variant` selects the style family; `filled`, `grade`, `weight`, and `opticalSize` set the fill, grade, weight, and optical size axes.

<div class="vp-raw yam3x-doc-demo-theme">
  <IconAxesExample />
</div>

::: details View demo source

<<< ./demos/IconAxesExample.vue{vue}

:::

### Registered SVG

<div class="vp-raw yam3x-doc-demo-theme">
  <IconExample />
</div>

Registered SVGs support outlined and filled paths, and update when registered after an icon has mounted. The surrounding native button carries the favorite action; the icon remains decorative.

::: details View demo source

<<< ./demos/IconExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import Icon from './components/yam3x/icon/icon.vue'
</script>

<template>
  <button
    type="button"
    aria-label="Open settings"
  >
    <Icon name="settings" />
  </button>
</template>
```

### Load the Material Symbols font

`Icon` does not load the icon font. The app provides it, either from Google Fonts or self-hosted, and the family names stay `Material Symbols Outlined`, `Material Symbols Rounded`, and `Material Symbols Sharp` for the variants you use. Load only the icon names and axes you need to reduce the font asset size:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=home,settings&display=block"
  rel="stylesheet"
/>
```

Without that font, an unregistered `name` renders its ligature text instead of a glyph.

::: details Advanced: register an SVG icon

Registration replaces the font ligature for that name and variant. Both the outlined and the filled path are required, and each needs a `viewBox` with four numbers and path data using standard SVG path commands.

```vue
<script setup lang="ts">
import Icon from './components/yam3x/icon/icon.vue'
import { registerIcon } from './components/yam3x/icon/icon-registry'

registerIcon('home', 'rounded', {
  outlined: {
    viewBox: '0 0 24 24',
    path: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  },
  filled: {
    viewBox: '0 0 24 24',
    path: 'm2 10 10-8 10 8v10a2 2 0 0 1-2 2h-5v-7H9v7H4a2 2 0 0 1-2-2Z',
  },
})
</script>

<template>
  <Icon
    name="home"
    variant="rounded"
    aria-label="Home"
  />
</template>
```

:::

## Behavior and accessibility

- An icon is decorative by default and renders `role="img" aria-hidden="true"`.
- Passing `aria-label` or `aria-labelledby` exposes an image name and drops `aria-hidden`.
- Icons take no keyboard or pointer input and no `tabindex`; the parent control owns the interaction target. Symbols of 24dp should have a target size of 48dp by default.
- Use caution if icons are displayed without labels. Icon meaning should always be unambiguous and accessible for all users.
- `weight` accepts 100 through 700; unsupported runtime values fall back to 400. Don’t use the lightest weight for standard-size (24dp) icons. The minimum weight for this size should be 200.
- `grade` uses the nearest `data-theme` or `.dark` target for `auto`, otherwise the system color scheme. To match the apparent icon size, the default grade for a dark icon on a light background is 0, and -25 for a light icon on a dark background.
- `opticalSize` accepts finite values clamped to the 20–48 range; non-finite values fall back to 24. Optical sizes range from 20dp to 48dp.
- Registered icons notify mounted instances, so late registration and replacement update the rendered path without remounting.

## API

### Props

| Prop             | Type                                            | Default    | Description                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`           | `string`                                        | `''`       | Material Symbols name or registered SVG key.                                                                                                                                                                       |
| `variant`        | `outlined \| rounded \| sharp`                  | `outlined` | Font style family, rounded to `outlined` for unsupported runtime values, or registry key for registered SVGs.                                                                                                      |
| `filled`         | `boolean`                                       | `false`    | Sets the fill axis; switches between the outlined and filled path for registered SVGs.                                                                                                                             |
| `grade`          | `auto \| low \| medium \| high`                 | `auto`     | `auto` uses GRAD `0` in light mode and `-25` in dark mode; explicit values map to `-25`, `0`, and `200`. Unsupported runtime values fall back to `auto`. Set `--yam3x-icon-auto-grade` to override automatic mode. |
| `weight`         | `100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700` | `400`      | Sets the `wght` axis. Unsupported runtime values fall back to `400`.                                                                                                                                               |
| `opticalSize`    | `number`                                        | `24`       | Sets the `opsz` axis. Finite values are clamped to Material Symbols' 20–48 range; non-finite values fall back to 24.                                                                                               |
| `ariaLabel`      | `string`                                        | Undefined  | Accessible image name. Also settable as the native `aria-label` attribute.                                                                                                                                         |
| `ariaLabelledby` | `string`                                        | Undefined  | ID reference for the accessible image name.                                                                                                                                                                        |
| `ariaHidden`     | `'true' \| 'false'`                             | Automatic  | Overrides `aria-hidden`. The default hides the icon unless an accessible name is present.                                                                                                                          |

### Icon registry

`registerIcon(name, variant, fillSet)` adds a self-hosted SVG under a name and variant.

| Parameter | Type                                   | Use                                                                      |
| --------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `name`    | `string`                               | Lookup key used by the `name` prop.                                      |
| `variant` | `outlined \| rounded \| sharp`         | Registry key used by the `variant` prop; other values throw.             |
| `fillSet` | `{ outlined, filled }: SvgIconFillSet` | Each entry is `{ viewBox: string, path: string }` and both are required. |

The `viewBox` and `path` are validated before storage; invalid data throws and leaves the previous entry in place. Register icons before or after creating an instance: a new entry with the same `name` and `variant` replaces the old one and updates mounted instances.

## Styling

Set `--yam3x-icon-size` on the icon or an ancestor to change the font size and box dimensions; it defaults to `24px`. Set `--yam3x-icon-auto-grade` to override the automatic grade. Registered SVGs and font glyphs both size from the same variable, and color follows `currentColor`.

## Material references

[Icons overview](https://m3.material.io/styles/icons/overview) · [Applying icons](https://m3.material.io/styles/icons/applying-icons) · [Designing icons](https://m3.material.io/styles/icons/designing-icons)
