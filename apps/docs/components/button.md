<script setup lang="ts">
import ButtonExample from './demos/ButtonExample.vue'
import ButtonSizesExample from './demos/ButtonSizesExample.vue'
import ButtonStatesExample from './demos/ButtonStatesExample.vue'
import ToggleButtonExample from './demos/ToggleButtonExample.vue'
</script>

# Buttons

`Button` performs an action or navigates to a destination. `ToggleButton` keeps a binary choice selected until the person changes it. Both are Material 3 Expressive buttons with five color styles, five sizes, and round or square shapes. Use a [Button group](/components/button-group) when related actions or choices share one container.

Choose filled for the most important action, tonal or outlined for medium emphasis, and text for the lowest emphasis. Use a toggle only for a persistent binary state, and let its icon and label communicate that state.

## Examples

### Variants

The five color styles map to Material color roles. Filled is the highest emphasis; elevated and tonal sit below it, and outlined and text are the quietest.

<div class="vp-raw yam3x-doc-demo-theme"><ButtonExample /></div>

::: details View demo source

<<< ./demos/ButtonExample.vue{vue}

:::

### Sizes and shape

Extra-small through extra-large sizes keep the same label and icon anatomy, and every size keeps a 48 px interactive target. `shape="square"` replaces the resting pill with the size's square corner, and the shape morphs again on press and selection.

<div class="vp-raw yam3x-doc-demo-theme"><ButtonSizesExample /></div>

::: details View demo source

<<< ./demos/ButtonSizesExample.vue{vue}

:::

### Links and disabled states

`href` renders a native link. `disabledInteractive` keeps an unavailable control in the tab order and exposes `aria-disabled` while cancelling activation, and the status reports the blocked activations. The disabled row applies the Material disabled colors and removes elevation.

<div class="vp-raw yam3x-doc-demo-theme"><ButtonStatesExample /></div>

::: details View demo source

<<< ./demos/ButtonStatesExample.vue{vue}

:::

### Persistent selection

`ToggleButton` binds its selection with `v-model:checked`, swaps the leading icon and label through slots, and exposes `aria-pressed`, or `aria-checked` with `role="radio"`. The text style is not available to toggles.

<div class="vp-raw yam3x-doc-demo-theme"><ToggleButtonExample /></div>

::: details View demo source

<<< ./demos/ToggleButtonExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, ToggleButton } from './components/yam3x/button'

const saved = ref(false)
const favorite = ref(false)
</script>

<template>
  <Button @click="saved = true">Save</Button>
  <ToggleButton v-model:checked="favorite">Favorite</ToggleButton>
  <p role="status">{{ saved ? 'Saved' : '' }}</p>
  <p role="status">{{ favorite ? 'Favorited' : 'Not favorited' }}</p>
</template>
```

::: details Links, forms, and radio-style toggles

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, ToggleButton } from './components/yam3x/button'

const alignment = ref('start')
</script>

<template>
  <Button
    href="/guide/installation"
    variant="outlined"
  >
    Installation
  </Button>

  <form @submit.prevent="save">
    <Button
      type="submit"
      name="intent"
      value="save"
    >
      Save changes
    </Button>
    <Button
      type="reset"
      variant="text"
    >
      Reset
    </Button>
  </form>

  <div
    role="radiogroup"
    aria-label="Alignment"
  >
    <ToggleButton
      v-for="option in ['start', 'center', 'end']"
      :key="option"
      role="radio"
      :name="`alignment-${option}`"
      :value="option"
      :checked="alignment === option"
      @update:checked="alignment = option"
    >
      {{ option }}
    </ToggleButton>
  </div>
</template>
```

:::

A button without `href` participates in native form submission with the configured `type`; the default is `button`, so choose `submit` or `reset` explicitly. A link does not submit the surrounding form, and a disabled link keeps link semantics while removing its destination and tab stop.

## Behavior and accessibility

### Keyboard and focus

- Tab reaches each enabled button. Space or Enter activates it.
- The shared focus indicator is a 3 px `secondary` ring with a 2 px offset, and it stays visible at 200% text size and in forced colors.
- `disabled` removes a button from the tab order and cancels activation. `disabledInteractive` stays focusable, keeps `aria-disabled="true"`, and cancels activation without firing the click event.
- A disabled link exposes `role="link"`, `aria-disabled="true"`, and no `href`; it is not a tab stop. A `disabledInteractive` link stays focusable and still suppresses navigation.

### Links and forms

- `href` switches the rendered element to an anchor. Native link navigation, target, rel, and download attributes are owned by the consumer through attrs.
- Native `id`, `name`, `value`, and `form` are forwarded to the button element. In link mode those button-only attributes are omitted.
- Preventing the `click` event prevents navigation or submission for pointer and keyboard activation.

### Toggle selection

- `ToggleButton` emits `click`, then flips `checked` unless the click was cancelled. Calling `preventDefault()` on `click` therefore keeps the previous selection.
- With the default `role="button"`, selection is exposed through `aria-pressed`. With `role="radio"`, it is exposed through `aria-checked`. The component still toggles the stored value, so a radio group must accept only the updates that should change its single selection.
- The selected state can replace the visible label and leading icon through the `selected` and `selected-icon` slots. Decorative icons are hidden from assistive technology.
- A round toggle takes the square corner while selected; a square toggle becomes fully rounded.

### Labels and icons

- The visible label supplies the accessible name. Keep it concise and on one line; icon-only content is not supported because the icon slots are decorative.
- The optional leading icon sits before the label in LTR and after it in RTL. `#trailing-icon` is a project extension that always follows the label.
- Both components have no built-in loading state. While work is pending, disable the trigger or change its label instead of adding a spinner-only state.

## API

### Exports

| Export                                                              | Description                                               |
| ------------------------------------------------------------------- | --------------------------------------------------------- |
| `Button`                                                            | Action or link button.                                    |
| `ToggleButton`                                                      | Persistent binary selection.                              |
| `buttonVariants`                                                    | Returns the class names for a custom composition.         |
| `ButtonVariant`, `ToggleButtonVariant`, `ButtonSize`, `ButtonShape` | Type exports for the supported styles, sizes, and shapes. |

### `Button` props and models

| Prop / model          | Type                                                               | Default    | Description                                                       |
| --------------------- | ------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------- |
| `variant`             | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined' \| 'text'` | `'filled'` | Color style and emphasis.                                         |
| `size`                | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`  | Label typography, height, icon size, and icon-label gap.          |
| `shape`               | `'round' \| 'square'`                                              | `'round'`  | Resting shape; the pressed state morphs from it.                  |
| `type`                | `'button' \| 'submit' \| 'reset'`                                  | `'button'` | Native button type in button mode.                                |
| `href`                | `string`                                                           | Undefined  | Renders a native link instead of a button when defined.           |
| `disabled`            | `boolean`                                                          | `false`    | Disables the button or removes the link destination and tab stop. |
| `disabledInteractive` | `boolean`                                                          | `false`    | Keeps the disabled control focusable and cancels activation.      |

::: details Native button attributes

| Prop    | Type     | Description                               |
| ------- | -------- | ----------------------------------------- |
| `id`    | `string` | Passed to the root element.               |
| `name`  | `string` | Form field name; ignored in link mode.    |
| `value` | `string` | Form value; ignored in link mode.         |
| `form`  | `string` | Associated form ID; ignored in link mode. |

Other attributes and listeners are forwarded to the root element.

:::

### `Button` events

| Event   | Payload      | Description                                                          |
| ------- | ------------ | -------------------------------------------------------------------- |
| `click` | `MouseEvent` | Fired for activation. Prevent it to cancel navigation or submission. |

### `Button` slots

| Slot            | Description                                       |
| --------------- | ------------------------------------------------- |
| `default`       | Visible label; required for an accessible name.   |
| `icon`          | Decorative leading icon. Position mirrors in RTL. |
| `trailing-icon` | Decorative trailing icon; a project extension.    |

### `ToggleButton` props and models

| Prop / model | Type                                                               | Default    | Description                                                      |
| ------------ | ------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------- |
| `checked`    | `v-model:checked: boolean`                                         | `false`    | Selected state.                                                  |
| `variant`    | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined'`           | `'filled'` | Color style; the text style is not supported.                    |
| `size`       | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`  | Same size mapping as `Button`.                                   |
| `shape`      | `'round' \| 'square'`                                              | `'round'`  | Resting shape; swaps while selected.                             |
| `role`       | `'button' \| 'radio'`                                              | Undefined  | Exposes `aria-pressed` or `aria-checked` for the selected state. |
| `disabled`   | `boolean`                                                          | `false`    | Disables the toggle.                                             |
| `type`       | `'button' \| 'submit' \| 'reset'`                                  | `'button'` | Native button type.                                              |

::: details Native button attributes

`id`, `name`, `value`, and `form` are forwarded to the button element. A toggle never renders a link, so `href` is not part of its API.

:::

### `ToggleButton` events

| Event            | Payload      | Description                                                       |
| ---------------- | ------------ | ----------------------------------------------------------------- |
| `click`          | `MouseEvent` | Fired before the selection changes; prevent it to keep the state. |
| `update:checked` | `boolean`    | Proposes a new selected state.                                    |

### `ToggleButton` slots

| Slot            | Description                                     |
| --------------- | ----------------------------------------------- |
| `default`       | Visible label shown while unselected.           |
| `icon`          | Decorative leading icon shown while unselected. |
| `selected`      | Replaces the label while selected.              |
| `selected-icon` | Replaces the leading icon while selected.       |
| `trailing-icon` | Decorative trailing icon; a project extension.  |

### `buttonVariants`

`buttonVariants({ variant?, size? })` returns the class string for a custom element and accepts `ButtonVariant` and `ButtonSize`. It does not add behavior, slots, or state handling.

### Types

| Type                  | Values                                                             |
| --------------------- | ------------------------------------------------------------------ |
| `ButtonVariant`       | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined' \| 'text'` |
| `ToggleButtonVariant` | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined'`           |
| `ButtonSize`          | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` |
| `ButtonShape`         | `'round' \| 'square'`                                              |

## Styling

Colors follow Material system roles, so changing the app theme updates every style and selection state. `--yam3x-button-container-color` overrides the container color for every variant and toggle state; set it on the button or an ancestor. `buttonVariants({ variant, size })` exposes the same classes for custom compositions.

::: details Shape, target, and motion

The compact sizes keep a 48 × 48 CSS px interactive target even when the visible container is smaller. Round buttons use a fully rounded resting shape, square buttons use the size's square corner, and press feedback morphs toward the pressed shape with the shared spring approximation (178 ms) and no transition under reduced motion. Focus, state layers, and disabled opacity remain internal to the component.

:::

## Material references

[Buttons overview](https://m3.material.io/components/buttons/overview) · [Guidelines](https://m3.material.io/components/buttons/guidelines) · [Specs](https://m3.material.io/components/buttons/specs) · [Accessibility](https://m3.material.io/components/buttons/accessibility)
