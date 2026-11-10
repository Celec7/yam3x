<script setup lang="ts">
import SplitButtonExample from './demos/SplitButtonExample.vue'
import SplitButtonStatesExample from './demos/SplitButtonStatesExample.vue'
import SplitButtonCompositionExample from './demos/SplitButtonCompositionExample.vue'
import SplitButtonPopupExample from './demos/SplitButtonPopupExample.vue'
</script>

# Split buttons

Split buttons open a menu to give people more options related to an action. Use one when a frequent action needs its own button while related choices stay one step away.

Split buttons are used to add a menu of actions alongside a main action. This reduces visual complexity by hiding extra options. Split buttons work well alone or alongside common buttons and icon buttons.

## Examples

### Basic

The leading button runs the action; the trailing button opens `items` in a Menu. Use the controls to compare color, shape, size, menu placement, and right-to-left layout.

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonExample /></div>

::: details View demo source

<<< ./demos/SplitButtonExample.vue{vue}

:::

### States

Disable the leading action, the menu, or both. The primary action keeps native button and form behavior, accepts `href`, and can be icon-only with its own accessible name.

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonStatesExample /></div>

::: details View demo source

<<< ./demos/SplitButtonStatesExample.vue{vue}

:::

## Use in your app

Import the copied component from `./components/yam3x/split-button`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SplitButton, type MenuItem } from './components/yam3x/split-button'

const open = ref(false)
const items: MenuItem[] = [
  { value: 'document', label: 'Save document', type: 'radio', group: 'format' },
  { value: 'image', label: 'Export as image', type: 'radio', group: 'format' },
]

function save(): void {
  console.log('Saved')
}
</script>

<template>
  <SplitButton
    v-model:open="open"
    label="Save"
    :items="items"
    menu-label="Save options"
    group-label="Save actions"
    @click="save"
  />
</template>
```

Provide concise primary-action text with `label` or the default slot, and use `#icon` for an icon. Generated menu and trailing-button names can inherit [LocaleProvider](/components/localization)'s `actions` messages; `locale` overrides the language, defaulting to the provider then `en-US`, and label props take precedence.

## Advanced

### Composition

Use the composition API when the caller needs direct control of the two buttons or popup. `SplitButtonLayout` provides the shared variant, size, shape, and spacing; its `#leading` and `#trailing` slots hold independently implemented controls. Spacing defaults to the 2px Material value and can be overridden with `spacing`. `SplitButtonTrailingButton` exposes its expanded state through `v-model:checked`. The layout does not own menu state or content.

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonCompositionExample /></div>

::: details View demo source

<<< ./demos/SplitButtonCompositionExample.vue{vue}

:::

::: details Composition snippet

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from './components/yam3x/menu'
import {
  SplitButtonLayout,
  SplitButtonLeadingButton,
  SplitButtonTrailingButton,
} from './components/yam3x/split-button'

const open = ref(false)
const items: MenuItem[] = [{ value: 'copy', label: 'Save a copy' }]

function save(): void {
  console.log('Saved')
}
</script>

<template>
  <SplitButtonLayout
    aria-label="Save actions"
    spacing="4px"
  >
    <template #leading>
      <SplitButtonLeadingButton @click="save">Save</SplitButtonLeadingButton>
    </template>
    <template #trailing>
      <Menu
        v-model:open="open"
        :items="items"
        label="Save options"
        trigger-label="More save options"
      >
        <template #trigger="{ triggerProps }">
          <SplitButtonTrailingButton
            v-bind="triggerProps"
            v-model:checked="open"
            aria-label="More save options"
          />
        </template>
      </Menu>
    </template>
  </SplitButtonLayout>
</template>
```

:::

### Custom popup

Use `#popup` when the trailing button should open other content such as a card. It receives `{ anchor, open, close, popupId }` and renders in a positioning context matching the trailing button, so an absolutely positioned popup can open below it with `inset-block-start: calc(100% + 4px); inset-inline-start: 0`. Slotted content controls its final placement, semantics, and interactions. Use `popupId` to connect `aria-controls` and `popupRole` to identify the popup type. For menus, prefer the built-in `items` path.

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonPopupExample /></div>

::: details View demo source

<<< ./demos/SplitButtonPopupExample.vue{vue}

:::

## Behavior and accessibility

### Keyboard

- Tab moves between the two segments; Space or Enter activates the focused segment.
- Only the leading button emits `click`; the trailing button opens and closes the menu or popup.
- A menu opened from `items` follows [Menu](/components/menu) keyboard behavior: arrows move between items, Space or Enter selects, and Escape closes the menu.
- Space and Enter activate only the focused segment, so a disabled segment does not block the other one.

### Focus and dismissal

- Focus should land on the leading button then move to the trailing button. This can depend on the operating system's settings.
- Selecting a menu item or pressing Escape returns focus to the trailing button.
- Clicking outside the menu, focusing another page control, and Escape dismiss the `items` menu.
- A custom `#popup` gets `close()` and owns its dismissal, semantics, and keyboard handling. A popup declaring `role="menu"` must implement menu focus, keyboard navigation, and dismissal.

### Responsive and RTL

- Split buttons have five recommended sizes. These sizes match the sizes offered on buttons and icon buttons. Scale up the split button in large breakpoints, or to create more emphasis in smaller windows.
- In right-to-left languages, the component layout is mirrored.
- Sizes are independent of neighboring controls: the same action area can mix a larger prominent control with smaller secondary ones.

### State ownership

- `v-model:open` owns menu or popup visibility and can be set from outside the component.
- Menu lifecycle and selection events are forwarded: `beforetoggle`, `toggle`, `beforeselect`, and `select`.
- Disable the leading and trailing segments separately with `primaryDisabled` and `menuDisabled`; `disabled` disables both and also closes an open menu.

## API

### Exports

`SplitButton`, `SplitButtonLayout`, `SplitButtonLeadingButton`, `SplitButtonTrailingButton`, plus the `MenuItem`, `ButtonSize`, `ButtonShape`, and `SplitButtonVariant` types.

### `SplitButton`

| Prop              | Type                                                            | Default                            | Description                                                            |
| ----------------- | --------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `label`           | `string`                                                        | —                                  | Leading-button text when the default slot is empty.                    |
| `items`           | `MenuItem[]`                                                    | —                                  | Menu items opened by the trailing button; uses the built-in Menu path. |
| `variant`         | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'`        | `'filled'`                         | Color role pair shared by both segments.                               |
| `size`            | `ButtonSize`                                                    | `'small'`                          | Size of both segments: `extra-small` to `extra-large`.                 |
| `shape`           | `'round' \| 'square'`                                           | `'round'`                          | Outer shape of the pair. `square` is a project extension.              |
| `menuLabel`       | `string`                                                        | Localized `"<label> options"`      | Accessible name of the menu.                                           |
| `menuButtonLabel` | `string`                                                        | Localized `"More <label> options"` | Accessible name of the trailing button.                                |
| `groupLabel`      | `string`                                                        | —                                  | Accessible name of the `role="group"` wrapper.                         |
| `positionX`       | `'before' \| 'after'`                                           | `'after'`                          | Preferred menu alignment edge.                                         |
| `positionY`       | `'above' \| 'below'`                                            | `'below'`                          | Preferred menu side.                                                   |
| `disabled`        | `boolean`                                                       | `false`                            | Disables both segments and closes an open menu.                        |
| `primaryDisabled` | `boolean`                                                       | `false`                            | Disables only the leading button.                                      |
| `menuDisabled`    | `boolean`                                                       | `false`                            | Disables only the trailing button.                                     |
| `popupId`         | `string`                                                        | Generated                          | ID of the custom popup, also used for `aria-controls`.                 |
| `popupRole`       | `'menu' \| 'dialog' \| 'listbox' \| 'tree' \| 'grid' \| 'true'` | `'true'`                           | `aria-haspopup` value for a custom popup.                              |
| `locale`          | `string`                                                        | Provider then `en-US`              | Language for generated accessible names.                               |
| `open`            | `v-model:open: boolean`                                         | `false`                            | Menu or popup visibility.                                              |

| Event          | Payload                                                                             | Description                                    |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| `click`        | `(event: MouseEvent)`                                                               | The leading button was activated.              |
| `beforetoggle` | `(event: CustomEvent<{ open: boolean }>)`                                           | Forwarded from Menu before visibility changes. |
| `toggle`       | `(event: CustomEvent<{ open: boolean }>)`                                           | Forwarded from Menu after visibility changes.  |
| `beforeselect` | `(item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>)` | Forwarded from Menu before selection.          |
| `select`       | `(item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>)` | Forwarded from Menu after selection.           |

| Slot        | Scope                              | Description                                                |
| ----------- | ---------------------------------- | ---------------------------------------------------------- |
| default     | —                                  | Leading-button content; `label` is the fallback.           |
| `icon`      | —                                  | Leading icon.                                              |
| `menu-icon` | `{ item: MenuItem }`               | Per-item leading icon in the built-in menu.                |
| `popup`     | `{ anchor, open, close, popupId }` | Custom popup content rendered next to the trailing button. |

::: details Methods

| Method                | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `show(anchor?)`       | Opens the menu or popup, optionally anchored to the given element. |
| `hide(restoreFocus?)` | Closes the menu or popup and optionally restores focus.            |
| `toggle(target?)`     | Toggles the menu or popup from an element or click event target.   |
| `root`                | The layout's root `HTMLElement`, or `null` before mount.           |

:::

### `SplitButtonLayout`

| Prop      | Type                                                     | Default    | Description                                  |
| --------- | -------------------------------------------------------- | ---------- | -------------------------------------------- |
| `variant` | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'` | `'filled'` | Variant shared with segment context.         |
| `size`    | `ButtonSize`                                             | `'small'`  | Size that selects inner corners and spacing. |
| `shape`   | `'round' \| 'square'`                                    | `'round'`  | Outer shape of the pair.                     |
| `spacing` | `string`                                                 | `'2px'`    | Gap between the two segments.                |

| Slot       | Description           |
| ---------- | --------------------- |
| `leading`  | The leading control.  |
| `trailing` | The trailing control. |

The layout renders `role="group"` and forwards other attributes, including `class`, `style`, and `aria-label`, to that root element. It provides `variant`, `size`, and `shape` to the segment components and exposes `root`.

### `SplitButtonLeadingButton`

| Prop       | Type                                                     | Default  | Description                   |
| ---------- | -------------------------------------------------------- | -------- | ----------------------------- |
| `variant`  | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'` | Injected | Overrides the layout variant. |
| `size`     | `ButtonSize`                                             | Injected | Overrides the layout size.    |
| `shape`    | `'round' \| 'square'`                                    | Injected | Overrides the layout shape.   |
| `disabled` | `boolean`                                                | `false`  | Disables the button.          |

| Slot            | Description                          |
| --------------- | ------------------------------------ |
| default         | Button label.                        |
| `icon`          | Leading icon.                        |
| `trailing-icon` | Trailing icon inside the label area. |

It emits `click` and forwards native button attributes, form attributes, or `href` to the underlying Button. Without a layout context, the defaults are `filled`, `small`, and `round`.

### `SplitButtonTrailingButton`

| Prop       | Type                                                     | Default     | Description                                  |
| ---------- | -------------------------------------------------------- | ----------- | -------------------------------------------- |
| `variant`  | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'` | Injected    | Overrides the layout variant.                |
| `size`     | `ButtonSize`                                             | Injected    | Overrides the layout size.                   |
| `shape`    | `'round' \| 'square'`                                    | Injected    | Overrides the layout shape.                  |
| `width`    | `'narrow' \| 'default' \| 'wide'`                        | `'default'` | Icon-button width.                           |
| `disabled` | `boolean`                                                | `false`     | Disables the button.                         |
| `checked`  | `v-model:checked: boolean`                               | `false`     | Expanded state; also drives `aria-expanded`. |

It renders the expand/collapse icon, centers that icon while `checked` is true, and forwards other attributes to the underlying IconButton. Without a layout context, the defaults are `filled`, `small`, `round`, and `default`.

## Styling

The inner corner radius and segment spacing come from the layout and `size`; the Material spacing is 2px and `spacing` overrides it for manually composed pairs. Component tokens own color, state layers, and motion, so no public style hooks are documented here.

## Material references

[Split buttons overview](https://m3.material.io/components/split-button/overview) · [guidelines](https://m3.material.io/components/split-button/guidelines) · [specs](https://m3.material.io/components/split-button/specs) · [accessibility](https://m3.material.io/components/split-button/accessibility)
