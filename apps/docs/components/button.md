<script setup lang="ts">
import ButtonExample from './demos/ButtonExample.vue'
import ToggleButtonExample from './demos/ToggleButtonExample.vue'
</script>

# Buttons

Use `Button` for an action or link. Use `ToggleButton` for a choice that remains selected until the user changes it.

## Interactive examples

### Actions and links

<div class="vp-raw yam3x-doc-demo-theme">
  <ButtonExample />
</div>

::: details View demo source

<<< ./demos/ButtonExample.vue{vue}

:::

### Persistent selection

<div class="vp-raw yam3x-doc-demo-theme">
  <ToggleButtonExample />
</div>

::: details View demo source

<<< ./demos/ToggleButtonExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app:

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
</template>
```

## API

### `Button`

| Prop                          | Type                                                     | Default  | Description                                                                                |
| ----------------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `variant`                     | `filled \| filled-tonal \| elevated \| outlined \| text` | `filled` | Visual emphasis.                                                                           |
| `size`                        | `extra-small \| small \| medium \| large \| extra-large` | `small`  | Size.                                                                                      |
| `shape`                       | `round \| square`                                        | `round`  | Resting shape; morphs on press.                                                            |
| `href`                        | `string`                                                 | —        | Uses native link navigation; link mode does not participate in form submission.            |
| `disabled`                    | `boolean`                                                | `false`  | Disables the button. A disabled link retains link semantics but cancels navigation.        |
| `disabledInteractive`         | `boolean`                                                | `false`  | Shows a disabled state while remaining focusable; activation and navigation are cancelled. |
| `type`                        | `button \| submit \| reset`                              | `button` | Native form button type.                                                                   |
| `id`, `name`, `value`, `form` | Native props                                             | —        | Forwarded to the native button; `href` mode does not participate in form submission.       |

`Button` emits `click(MouseEvent)`. The default slot supplies the label; `#icon` and `#trailing-icon` supply decorative icons.

### `ToggleButton`

| Prop                          | Type                                                     | Default  | Description                                       |
| ----------------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------- |
| `variant`                     | `filled \| filled-tonal \| elevated \| outlined`         | `filled` | Visual emphasis.                                  |
| `size`                        | `extra-small \| small \| medium \| large \| extra-large` | `small`  | Size.                                             |
| `shape`                       | `round \| square`                                        | `round`  | Resting shape; morphs on press and selection.     |
| `v-model:checked`             | `boolean`                                                | `false`  | Persistent selected state.                        |
| `disabled`                    | `boolean`                                                | `false`  | Disables the button.                              |
| `role`                        | `button \| radio`                                        | —        | Use `radio` when composing a single-choice group. |
| `type`                        | `button \| submit \| reset`                              | `button` | Native form button type.                          |
| `id`, `name`, `value`, `form` | Native props                                             | —        | Forwarded to the native button.                   |

`ToggleButton` emits `click(MouseEvent)` and `update:checked(boolean)`. The default slot supplies the label; `#selected` can replace it while selected. `#icon`, `#selected-icon`, and `#trailing-icon` supply decorative icons.

## Behavior and accessibility

`href` makes `Button` a native link, which does not submit a form. A disabled link retains link semantics but cannot navigate and leaves keyboard navigation. `disabledInteractive` keeps a button or link focusable while cancelling activation.

Preventing a `ToggleButton` click also prevents its selection change. It exposes `aria-pressed` by default, or `aria-checked` with `role="radio"`. Both components default to `type="button"` to avoid accidental form submission.

Icons do not supply the accessible name; provide a visible label. `#trailing-icon` is a project extension. Use `#icon` for Material's direction-aware leading icon position.

## Styling

`--yam3x-button-container-color` overrides the variant and selection container color. The exported `buttonVariants({ variant, size })` helper returns the corresponding classes for custom compositions.

## Material references

[Overview](https://m3.material.io/components/buttons/overview) · [Guidelines](https://m3.material.io/components/buttons/guidelines) · [Specs](https://m3.material.io/components/buttons/specs) · [Accessibility](https://m3.material.io/components/buttons/accessibility)
