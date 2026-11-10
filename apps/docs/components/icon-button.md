<script setup lang="ts">
import IconButtonExample from './demos/IconButtonExample.vue'
import IconButtonSizesExample from './demos/IconButtonSizesExample.vue'
import IconButtonToggleExample from './demos/IconButtonToggleExample.vue'
</script>

# Icon buttons

An icon button performs a compact action represented by an icon. `IconButton` is the action form and `IconToggleButton` keeps a binary state. Both are Material 3 Expressive icon buttons with standard, filled, tonal, and outlined styles, five sizes, three widths, and round or square shapes.

Every icon button needs an accessible name that describes the action, because the icon alone is decorative. Use an action button for a one-time command and a toggle only for a true binary choice.

## Examples

### Actions and variants

The demo shows the four styles, action and toggle forms, tooltips, a link, and a compatibility disabled control. The selected state swaps the toggle's icon through `#selected-icon`.

<div class="vp-raw yam3x-doc-demo-theme"><IconButtonExample /></div>

::: details View demo source

<<< ./demos/IconButtonExample.vue{vue}

:::

### Sizes and widths

Five sizes and three widths produce distinct visible containers while every combination keeps at least a 48 × 48 px interactive target.

<div class="vp-raw yam3x-doc-demo-theme"><IconButtonSizesExample /></div>

::: details View demo source

<<< ./demos/IconButtonSizesExample.vue{vue}

:::

### Toggle selection

Toggles expose `aria-pressed`. A selected round toggle adopts the size's square corner, and a selected square toggle becomes fully rounded, so the selected state stays visible without color alone.

<div class="vp-raw yam3x-doc-demo-theme"><IconButtonToggleExample /></div>

::: details View demo source

<<< ./demos/IconButtonToggleExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconButton, IconToggleButton } from './components/yam3x/icon-button'
import { Icon } from './components/yam3x/icon'

const favorite = ref(false)
</script>

<template>
  <IconButton aria-label="Search">
    <Icon
      name="search"
      filled
    />
  </IconButton>

  <IconToggleButton
    v-model:checked="favorite"
    aria-label="Favorite"
  >
    <Icon name="favorite" />
    <template #selected-icon>
      <Icon
        name="favorite"
        filled
      />
    </template>
  </IconToggleButton>
</template>
```

::: details Link and radio-style toggle

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconButton, IconToggleButton } from './components/yam3x/icon-button'
import { Icon } from './components/yam3x/icon'

const alignment = ref('start')
</script>

<template>
  <IconButton
    href="/guide/installation"
    variant="outlined"
    aria-label="Open installation"
  >
    <Icon
      name="arrow_forward"
      filled
    />
  </IconButton>

  <div
    role="radiogroup"
    aria-label="Alignment"
  >
    <IconToggleButton
      v-for="option in ['start', 'center', 'end']"
      :key="option"
      role="radio"
      :checked="alignment === option"
      :aria-label="`Align ${option}`"
      @update:checked="alignment = option"
    >
      <Icon :name="option === 'start' ? 'format_italic' : 'format_bold'" />
    </IconToggleButton>
  </div>
</template>
```

:::

A radio-style toggle never clears itself when activated again; the application updates the shared selection. Provide the surrounding `radiogroup` name and manage roving focus if you use that composition.

## Behavior and accessibility

### Accessible name

- Pass `aria-label`, or use `aria-labelledby` through attrs, on every icon button. The icon is `aria-hidden`; it never supplies the name.
- On Web, compose a [Tooltip](/components/tooltip) for hover and focus, but keep the accessible name independent of the tooltip.
- Use a filled icon for an action button. For a toggle, use an outlined icon while unselected and its filled version through `#selected-icon`; if no filled version exists, raise the icon weight.

### Toggle state and shape

- `IconToggleButton` binds `v-model:checked` and exposes `aria-pressed` by default.
- With `role="radio"`, it exposes `aria-checked` and does not deselect when activated again. The component does not provide group navigation; supply the `radiogroup` container and roving focus yourself.
- Selection changes use the specification's corner mapping: a selected round toggle takes the square corner, and a selected square toggle becomes fully rounded. The pressed state adds its own morph.
- Activating a link toggle is not supported: `href` is not part of the toggle API and a toggle always renders a button.

### Sizes, widths, and targets

- `size` sets the container height and icon size; `width` sets the inline space around the icon as `narrow`, `default`, or `wide`.
- Compact combinations keep a 48 × 48 px interactive target, with the expanded target following the visible corner shape.
- Tab reaches one control; Space or Enter activates it. The focus indicator is a 3 px `secondary` ring with a 2 px offset.

### Links, disabled states, and forms

- `href` renders a native link with link semantics. A disabled link keeps `role="link"`, exposes `aria-disabled`, removes `href`, and leaves the tab order; a `disabledInteractive` link stays focusable and suppresses navigation.
- `disabledInteractive` on a button keeps it focusable, exposes `aria-disabled="true"`, and suppresses activation and state feedback.
- `type`, `id`, `name`, `value`, and `form` apply in button mode. A toggle with `type="submit"` and `name`/`value` submits like a native button; `aria-pressed` alone adds no form value. The toggle never renders a link, so `href` is not available on `IconToggleButton`.

## API

### Exports

| Export                                                                      | Description                                         |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| `IconButton`                                                                | Action represented by an icon.                      |
| `IconToggleButton`                                                          | Persistent binary selection represented by an icon. |
| `IconButtonVariant`, `IconButtonSize`, `IconButtonWidth`, `IconButtonShape` | Type exports for styles, sizes, widths, and shapes. |

### `IconButton` props and models

| Prop / model          | Type                                                               | Default     | Description                                                       |
| --------------------- | ------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------- |
| `variant`             | `'standard' \| 'filled' \| 'tonal' \| 'outlined'`                  | `'filled'`  | Visual style and emphasis.                                        |
| `size`                | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`   | Container height and icon size.                                   |
| `width`               | `'narrow' \| 'default' \| 'wide'`                                  | `'default'` | Inline space around the icon.                                     |
| `shape`               | `'round' \| 'square'`                                              | `'round'`   | Resting corner shape.                                             |
| `disabled`            | `boolean`                                                          | `false`     | Disables the button or removes the link destination and tab stop. |
| `disabledInteractive` | `boolean`                                                          | `false`     | Keeps the disabled control focusable and cancels activation.      |
| `href`                | `string`                                                           | Undefined   | Renders a native link when defined.                               |

::: details Native button attributes

`type` (`'button' | 'submit' | 'reset'`, default `'button'`), `id`, `name`, `value`, and `form` are forwarded in button mode. Other attributes and listeners are forwarded to the root element.

:::

### `IconButton` events

| Event   | Payload      | Description                                            |
| ------- | ------------ | ------------------------------------------------------ |
| `click` | `MouseEvent` | Fired for activation. Prevent it to cancel navigation. |

### `IconButton` slots

| Slot      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `default` | Icon content; it is decorative and must not supply the name. |

### `IconToggleButton` props and models

| Prop / model          | Type                                                               | Default     | Description                                                 |
| --------------------- | ------------------------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| `checked`             | `v-model:checked: boolean`                                         | `false`     | Selected state.                                             |
| `variant`             | `'standard' \| 'filled' \| 'tonal' \| 'outlined'`                  | `'filled'`  | Visual style and emphasis.                                  |
| `size`                | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`   | Container height and icon size.                             |
| `width`               | `'narrow' \| 'default' \| 'wide'`                                  | `'default'` | Inline space around the icon.                               |
| `shape`               | `'round' \| 'square'`                                              | `'round'`   | Resting shape; swaps while selected.                        |
| `role`                | `'button' \| 'radio'`                                              | `'button'`  | Exposes `aria-pressed` or `aria-checked`.                   |
| `disabled`            | `boolean`                                                          | `false`     | Disables the toggle.                                        |
| `disabledInteractive` | `boolean`                                                          | `false`     | Keeps the disabled toggle focusable and cancels activation. |

::: details Native button attributes

`type` (`'button' | 'submit' | 'reset'`, default `'button'`), `id`, `name`, `value`, and `form` are forwarded. `href` is not available.

:::

### `IconToggleButton` events

| Event            | Payload      | Description                                                      |
| ---------------- | ------------ | ---------------------------------------------------------------- |
| `click`          | `MouseEvent` | Fired before the state change; prevent it to keep the selection. |
| `update:checked` | `boolean`    | Proposes a new selected state.                                   |

### `IconToggleButton` slots

| Slot            | Description                                           |
| --------------- | ----------------------------------------------------- |
| `default`       | Icon content while unselected.                        |
| `selected-icon` | Icon content while selected; falls back to `default`. |

### Methods

Neither component exposes public instance methods.

## Styling

Colors follow Material system roles, so changing the app theme updates every style and selected state. The component exposes no public custom properties: geometry, hit targets, state layers, and focus behavior remain internal, and the supported adjustments are `size`, `width`, and `shape`.

::: details Color and state mapping

The filled style uses `primary`/`on-primary`; tonal uses `secondary-container`/`on-secondary-container`; outlined keeps a transparent container with an outline; standard uses a transparent container. Unselected filled toggles use `surface-container` with `on-surface-variant`. Hover adds the shared state layer without changing the icon, and forced colors retain visible boundaries.

:::

## Material references

[Icon buttons overview](https://m3.material.io/components/icon-buttons/overview) · [Guidelines](https://m3.material.io/components/icon-buttons/guidelines) · [Specs](https://m3.material.io/components/icon-buttons/specs) · [Accessibility](https://m3.material.io/components/icon-buttons/accessibility)
