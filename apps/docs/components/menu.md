<script setup lang="ts">
import MenuExample from './demos/MenuExample.vue'
import MenuFieldsExample from './demos/MenuFieldsExample.vue'
</script>

# Menus

Menus display a list of choices on a temporary surface. Menus can open from a variety of components, including icon buttons and text fields. Keep a menu tied to its trigger, and use a different pattern for actions that must remain visible.

## Examples

### Menus and selection

The demo combines explicit actions, checkbox and radio items, a submenu, a link, and grouped surfaces. Use the controls to switch color, dense spacing, placement, and direction, and open the context menu with `show(anchor)`. The grouped menu uses a project gap between surfaces; prefer a divider for Web dropdowns.

<div class="vp-raw yam3x-doc-demo-theme"><MenuExample /></div>

::: details View demo source

<<< ./demos/MenuExample.vue{vue}

:::

### Item anatomy

Menu items can show a leading icon, supporting text, a badge, trailing text or a shortcut, and a trailing icon. Disabled items remain focusable so keyboard users can read them.

<div class="vp-raw yam3x-doc-demo-theme"><MenuFieldsExample /></div>

::: details View demo source

<<< ./demos/MenuFieldsExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app:

```vue
<script setup lang="ts">
import { Menu, type MenuItem } from './components/yam3x/menu'

const items: MenuItem[] = [
  { value: 'open', label: 'Open' },
  { value: 'favorite', label: 'Favorite', type: 'checkbox' },
  { value: 'more', label: 'More', items: [{ value: 'share', label: 'Share' }] },
]
</script>

<template>
  <Menu
    :items="items"
    label="File actions"
  />
</template>
```

::: details Context menus, grouped items, and custom triggers

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from './components/yam3x/menu'

const menu = ref<InstanceType<typeof Menu> | null>(null)
const items: MenuItem[] = [
  { value: 'rename', label: 'Rename', leadingIcon: true },
  { value: 'group-gap', type: 'gap' },
  { value: 'export', label: 'Export', trailingIcon: true },
  { value: 'divider-1', type: 'divider' },
  { value: 'delete', label: 'Delete' },
]
</script>

<template>
  <button
    type="button"
    @click="menu?.show($event.currentTarget as HTMLElement)"
  >
    Open context menu
  </button>
  <Menu
    ref="menu"
    :items="items"
    label="Layer actions"
  >
    <template #trigger="{ triggerProps }">
      <button
        v-bind="triggerProps"
        type="button"
      >
        Choose a layer action
      </button>
    </template>
  </Menu>
</template>
```

:::

## Behavior and accessibility

### Selection

- The menu emits cancellable `beforetoggle` and `beforeselect` events, then `toggle` and `select`. Call `preventDefault()` on a before-event to stop opening, closing, or selection.
- Checkbox selection stores each value in `v-model:checked` and keeps the menu open.
- Radio selection stores one value per group in `v-model:selected`, keyed by the item's `group` name, and closes the menu.
- Action and link activation closes the menu. Submenu activation opens its nested menu instead.
- Link items keep native navigation and honor `target`, `rel`, and `download`.
- Disabled items can receive focus but cannot be activated.

### Keyboard and submenus

- Opening the menu moves focus to the first item. Arrow Down and Arrow Up on the trigger open at the first or last item.
- Arrow keys wrap through enabled and disabled action items. Home and End move to the first or last item, and character keys search by label.
- In a submenu, Arrow Right opens the next level in left-to-right layouts and Arrow Left opens it in right-to-left layouts. The opposite arrow returns to the parent, and Escape closes one level at a time and restores focus.
- Tab closes the menu and moves focus in document order. Escape and outside clicks also close it.

### Grouping and spacing

- Separate groups with `{ value: 'divider-1', type: 'divider' }` or `{ value: 'gap-1', type: 'gap' }`. Every item needs a unique `value`.
- The project-defined gap creates separate group surfaces and becomes a divider in scrollable menus.
- `{ type: 'label' }` adds a presentation-only group heading.
- A menu item's `leadingIcon` or `trailingIcon` reserves 20px of space when the corresponding icon slot renders conditionally by item. Without icon slots, regular items leave no empty icon slot.

### Placement and RTL

- `position-x` and `position-y` set preferred expansion directions. The popup flips or shifts near viewport edges, and its transition expands from the trigger-facing edge.
- Submenus open beside the parent and follow the menu's writing direction.
- `dense` reduces vertical container padding without changing item labels or roles.
- A menu whose content exceeds the maximum height scrolls and keeps the focused item in view.

## API

### Exports

| Export                                                                      | Description                                   |
| --------------------------------------------------------------------------- | --------------------------------------------- |
| `Menu`                                                                      | The trigger, surface, and selection behavior. |
| `MenuItem`, `MenuItemType`, `MenuVariant`, `MenuPositionX`, `MenuPositionY` | Type exports for items and props.             |

### `Menu` props and models

| Prop / model   | Type                                       | Default                | Description                                          |
| -------------- | ------------------------------------------ | ---------------------- | ---------------------------------------------------- |
| `items`        | `MenuItem[]`                               | Required               | Menu definitions; each item needs a unique `value`.  |
| `label`        | `string`                                   | Localized `Options`    | Accessible name of the menu surface.                 |
| `triggerLabel` | `string`                                   | Localized `Open menu`  | Accessible name of the built-in trigger.             |
| `variant`      | `'standard' \| 'vibrant'`                  | `'standard'`           | Color mapping; `vibrant` uses tertiary roles.        |
| `dense`        | `boolean`                                  | `false`                | Reduces vertical container padding.                  |
| `positionX`    | `'before' \| 'after'`                      | `'after'`              | Preferred horizontal expansion from the trigger.     |
| `positionY`    | `'above' \| 'below'`                       | `'below'`              | Preferred vertical expansion from the trigger.       |
| `locale`       | `string`                                   | Provider, then `en-US` | Overrides the language of built-in interface labels. |
| `open`         | `v-model:open: boolean`                    | `false`                | Controls visibility.                                 |
| `checked`      | `v-model:checked: string[]`                | `[]`                   | Values of selected checkbox items.                   |
| `selected`     | `v-model:selected: Record<string, string>` | `{}`                   | Selected radio value per group name.                 |

Built-in labels inherit from [LocaleProvider](/components/localization)'s `actions` namespace. Label props override the corresponding shared defaults.

### `Menu` events

| Event          | Payload                                                       | Description                                                            |
| -------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `beforetoggle` | `CustomEvent<{ open: boolean }>`                              | Cancelable. Fired before the menu opens or closes.                     |
| `toggle`       | `CustomEvent<{ open: boolean }>`                              | Fired after the menu opens or closes.                                  |
| `beforeselect` | `(item: MenuItem, event: CustomEvent<{ item, sourceEvent }>)` | Cancelable. Fired before an item is selected.                          |
| `select`       | `(item: MenuItem, event: CustomEvent<{ item, sourceEvent }>)` | Fired after an item is selected, including checkbox and radio changes. |

### `Menu` slots

| Slot            | Props                            | Description                                                          |
| --------------- | -------------------------------- | -------------------------------------------------------------------- |
| `trigger`       | `{ open, toggle, triggerProps }` | Replaces the built-in trigger. Bind `triggerProps` or call `toggle`. |
| `icon`          | `{ item }`                       | Leading icon content for items that reserve the leading slot.        |
| `trailing-icon` | `{ item }`                       | Trailing icon content for items that reserve the trailing slot.      |

### `Menu` methods

Access these through a template ref. The component also exposes `root`, its host element.

| Method            | Returns | Description                                                            |
| ----------------- | ------- | ---------------------------------------------------------------------- |
| `show(anchor?)`   | `void`  | Opens the menu against `anchor`, or the built-in trigger when omitted. |
| `hide()`          | `void`  | Closes the menu without restoring focus.                               |
| `toggle(anchor?)` | `void`  | Toggles the menu for `anchor`, or the built-in trigger when omitted.   |

### `MenuItem` schema

| Field            | Type                                                                            | Applies to              | Description                                                  |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------ |
| `value`          | `string`                                                                        | All items               | Required unique identifier used by models and events.        |
| `type`           | `'item' \| 'checkbox' \| 'radio' \| 'submenu' \| 'divider' \| 'label' \| 'gap'` | All items               | Defaults to `item`.                                          |
| `label`          | `string`                                                                        | Items, submenus, labels | Visible text; required for action, submenu, and label items. |
| `group`          | `string`                                                                        | Radio items             | Groups radio items; defaults to `default`.                   |
| `items`          | `MenuItem[]`                                                                    | Submenus                | Nested items; an item with `items` becomes a submenu.        |
| `href`           | `string`                                                                        | Leaf actions            | Renders an anchor instead of a button.                       |
| `target`         | `string`                                                                        | Leaf actions            | Anchor target, forwarded with `href`.                        |
| `rel`            | `string`                                                                        | Leaf actions            | Anchor relationship, forwarded with `href`.                  |
| `download`       | `boolean \| string`                                                             | Leaf actions            | Anchor download attribute, forwarded with `href`.            |
| `disabled`       | `boolean`                                                                       | Actions, submenus       | Keeps the item focusable but prevents activation.            |
| `supportingText` | `string`                                                                        | Actions, submenus       | Secondary line below the label.                              |
| `trailingText`   | `string`                                                                        | Actions, submenus       | Trailing text; takes precedence over `shortcut`.             |
| `badge`          | `string \| number`                                                              | Actions, submenus       | Trailing badge content.                                      |
| `shortcut`       | `string`                                                                        | Actions, submenus       | Shortcut hint shown in the trailing text position.           |
| `leadingIcon`    | `boolean`                                                                       | Actions, submenus       | Reserves the 20px leading icon slot.                         |
| `trailingIcon`   | `boolean`                                                                       | Leaf actions            | Reserves the 20px trailing icon slot.                        |

## Styling

Set these properties on the `Menu` root. `variant="vibrant"` supplies its own color mapping; runtime placement and scroll caps stay internal. Material defines the component roles and dimensions; these CSS property names and override behavior are project API.

::: details CSS overrides

| Property                                 | Default                          | Description                               |
| ---------------------------------------- | -------------------------------- | ----------------------------------------- |
| `--yam3x-menu-container-min-width`       | `112px`                          | Minimum popup width.                      |
| `--yam3x-menu-container-max-height`      | `280px`, limited by the viewport | Maximum popup height before it scrolls.   |
| `--yam3x-menu-container-padding-block`   | `2px`                            | Block padding around the item list.       |
| `--yam3x-menu-container-shape`           | System large corner              | Popup corner radius.                      |
| `--yam3x-menu-active-container-shape`    | System large corner              | Corner radius of the active menu surface. |
| `--yam3x-menu-inactive-container-shape`  | System small corner              | Corner radius of inactive group surfaces. |
| `--yam3x-menu-item-container-height`     | `44px`                           | Minimum item height.                      |
| `--yam3x-menu-item-icon-label-space`     | `12px`                           | Gap between a leading icon and its label. |
| `--yam3x-menu-item-shape`                | System extra-small corner        | Item corner radius.                       |
| `--yam3x-menu-item-focus-ring-shape`     | Inherits the item shape          | Focus ring corner radius.                 |
| `--yam3x-menu-item-label-text-font-size` | System `label-large`             | Item label font size.                     |

:::

## Material references

[Menus overview](https://m3.material.io/components/menus/overview) · [guidelines](https://m3.material.io/components/menus/guidelines) · [specs](https://m3.material.io/components/menus/specs) · [accessibility](https://m3.material.io/components/menus/accessibility)
