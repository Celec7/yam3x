<script setup lang="ts">
import IconExample from './demos/IconExample.vue'
</script>

# Icon

Icon is a project renderer for Material Symbols and registered SVGs. Use it to support nearby content or an accessible control, not as a substitute for a control’s name.

## Interactive example

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

## API

| Prop          | Type                                            | Default    | Description                                                                                                                                                                                                                                                              |
| ------------- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | `string`                                        | `''`       | Material Symbols name or registered SVG key.                                                                                                                                                                                                                             |
| `variant`     | `outlined \| rounded \| sharp`                  | `outlined` | Font style or registry key.                                                                                                                                                                                                                                              |
| `filled`      | `boolean`                                       | `false`    | Sets the fill axis; switches between two paths for registered SVGs.                                                                                                                                                                                                      |
| `grade`       | `auto \| low \| medium \| high`                 | `auto`     | `auto` uses GRAD `0` in light mode and `-25` in dark mode; explicit values map to `-25`, `0`, and `200`. The nearest `data-theme` or `.dark` target controls automatic mode; otherwise it follows the system color scheme. Set `--yam3x-icon-auto-grade` to override it. |
| `weight`      | `100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700` | `400`      | Sets the `wght` axis. For a standard 24px icon, Material recommends regular weight 400 and a minimum weight of 200.                                                                                                                                                      |
| `opticalSize` | `number`                                        | `24`       | Sets the `opsz` axis; choose within Material Symbols' 20–48 range for the rendered icon.                                                                                                                                                                                 |

`registerIcon(name, variant, { outlined, filled })` accepts `{ viewBox, path }` for each provided path. Register icons before or after creating an instance. The path and viewBox are validated before storage; a new entry with the same name and variant replaces the old one.

## Behavior and accessibility

By default, an icon is decorative and receives `role="img" aria-hidden="true"`. Passing `aria-label` or `aria-labelledby` exposes an image name to assistive technology. The icon does not receive keyboard or pointer input; the parent control owns the interaction target.

The renderer accepts custom axis values without runtime clamping. Material's minimum weight of 200 applies to standard 24px icons. Common icon sizes are 20, 24, 40, and 48px; the `opsz` axis supports values from 20 to 48.

## Styling

Set `--yam3x-icon-size` on the icon or an ancestor to change its font size and box dimensions; it defaults to `24px`. Set `--yam3x-icon-auto-grade` to override the automatic grade.

### Load the Material Symbols font

The app provides the font. You can use Google Fonts or self-host it. Load only the icon names and axes you need to reduce the font asset size:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=home,settings&display=block"
  rel="stylesheet"
/>
```

## Material references

[Icons overview](https://m3.material.io/styles/icons/overview)
