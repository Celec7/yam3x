<script setup lang="ts">
import FabMenuExample from './demos/FabMenuExample.vue'
import FabMenuCompositionExample from './demos/FabMenuCompositionExample.vue'
</script>

# FAB menu

The floating action button (FAB) menu opens from a FAB to display multiple related actions.

Use `FabMenu` for a data-driven list of actions, or compose `FloatingActionButtonMenu` with `FloatingActionButtonMenuItem` and `ToggleFloatingActionButton` when the trigger or item content needs direct control. A FAB menu opens from a FAB to show 2–6 related actions floating on screen. Fab menu is not used with extended FABs and it is available in primary, secondary, and tertiary color sets.

## Examples

### Basic

`FabMenu` renders the standard trigger and owns expanded state, placement, focus, and keyboard navigation. There is one FAB menu size for all sizes of FABs; extended FAB sizes are not available for the menu.

<div class="vp-raw yam3x-doc-demo-theme">
  <FabMenuExample />
</div>

::: details View demo source

<<< ./demos/FabMenuExample.vue{vue}

:::

### Composition

The compound API exposes the trigger slot, the expanded model, and public `open`, `close`, and `toggle` methods. This demo also shows a disabled compound menu and external open and close controls.

<div class="vp-raw yam3x-doc-demo-theme">
  <FabMenuCompositionExample />
</div>

::: details View demo source

<<< ./demos/FabMenuCompositionExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { FabMenu, type FabMenuItem } from './components/yam3x/fab-menu'

const actions: FabMenuItem[] = [
  { value: 'camera', label: 'Take photo' },
  { value: 'upload', label: 'Upload file' },
]
</script>

<template>
  <FabMenu
    :items="actions"
    label="Create actions"
    trigger-label="Create"
  />
</template>
```

::: details Compound composition

Bind `triggerProps` to the trigger for menu semantics and keyboard handling. `FloatingActionButtonMenu` does not add a click handler to `triggerProps`; share the model with `ToggleFloatingActionButton`, or call `toggle` from another trigger.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ToggleFloatingActionButton } from './components/yam3x/fab'
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from './components/yam3x/fab-menu'

const expanded = ref(false)
</script>

<template>
  <FloatingActionButtonMenu
    v-model:expanded="expanded"
    label="Create actions"
  >
    <template #trigger="{ triggerProps }">
      <ToggleFloatingActionButton
        v-bind="triggerProps"
        v-model:checked="expanded"
        aria-label="Create"
      />
    </template>
    <FloatingActionButtonMenuItem
      value="camera"
      label="Take photo"
    />
    <FloatingActionButtonMenuItem
      value="upload"
      label="Upload file"
    />
  </FloatingActionButtonMenu>
</template>
```

:::

## Behavior and accessibility

### Keyboard

- Tab reaches the trigger. Enter or Space toggles the menu.
- While closed, Arrow Down and Arrow Up on the trigger open the menu and move to the first or last enabled action.
- While open, Arrow Down and Arrow Up move through enabled actions and wrap; Home and End move to the first and last enabled action.
- Escape closes the menu and restores focus to the trigger.
- Tab closes the menu and continues in page order.
- Disabled actions remain visible but are skipped by focus and cannot activate.
- Activating an enabled action emits `select`, closes the menu, and restores focus to the trigger.

### Focus and dismissal

- Opening leaves focus on the trigger.
- Clicking outside the trigger and popup closes the menu.
- `FabMenu` dispatches a cancelable `beforetoggle` DOM event on its root before changing state. `FloatingActionButtonMenu` emits `beforetoggle` and exposes `open`, `close`, and `toggle`.
- `beforeselect` is cancelable. Calling `preventDefault()` keeps the menu open.
- A disabled menu closes and cannot open; `close()` remains safe to call.

### Placement and responsive

- The pill stack opens above by default. It opens below only when fewer than two actions fit above and there is space below; exactly two fitting actions keep it above. Placement recalculates as the page scrolls.
- `presentation` chooses `pill-stack` or `web-menu`. This is a project decision; the layout does not switch automatically by viewport size.
- `horizontal-alignment` defaults to `end`; `start` and `center` are project positioning options.
- The popup is teleported to `body`, mirrors the document direction, and receives System tokens from the nearest `[data-theme]` ancestor.
- The action list scrolls within the available space without covering the trigger.

### State ownership

- `v-model:expanded` is the source of truth. `FabMenu` can also open and close through its public methods.
- `FloatingActionButtonMenuItem.selected` is a project extension controlled by the caller. It shows the baseline Menu selected appearance only in `web-menu` and does not change activation or dismissal.
- Disabled actions are a project extension. They remain visible in both APIs, use the same muted container and content treatment, and are skipped by keyboard navigation. Material's FAB menu API does not define disabled actions.
- Native `href`, `target`, `rel`, and `download` render a link. Disabled items omit the link and cannot activate.
- The caller should match the trigger's color variant to the menu's `variant`.

## API

### Exports

`FabMenu`, `FloatingActionButtonMenu`, `FloatingActionButtonMenuItem`, and the related types `FabMenuItem`, `FabMenuVariant`, `FabMenuPresentation`, `FabMenuHorizontalAlignment`, `FabMenuTriggerSize`, and `FabMenuSelectionSource`. The standard trigger is `ToggleFloatingActionButton` from the FAB entry point.

### Props and models

`FabMenu` and `FloatingActionButtonMenu` inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. `locale` overrides the provider language and falls back to `en-US`; `label` and `triggerLabel` override the shared defaults.

#### `FabMenu`

| Prop                  | Type                                     | Default        | Description                                                    |
| --------------------- | ---------------------------------------- | -------------- | -------------------------------------------------------------- |
| `items`               | `FabMenuItem[]`                          | Required       | Actions and links shown in the menu.                           |
| `label`               | `string`                                 | LocaleProvider | Accessible name of the menu.                                   |
| `triggerLabel`        | `string`                                 | LocaleProvider | Accessible name of the default trigger.                        |
| `variant`             | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'`    | Color set for the trigger and pill-stack items.                |
| `presentation`        | `'pill-stack' \| 'web-menu'`             | `'pill-stack'` | Project presentation for the action list.                      |
| `horizontalAlignment` | `'start' \| 'center' \| 'end'`           | `'end'`        | Popup alignment against the trigger.                           |
| `triggerSize`         | `'default' \| 'medium' \| 'large'`       | `'medium'`     | Size of the default trigger FAB.                               |
| `disabled`            | `boolean`                                | `false`        | Disables the trigger, closes the menu, and prevents opening.   |
| `locale`              | `string`                                 | Provider       | Overrides LocaleProvider language, then falls back to `en-US`. |
| `expanded`            | `boolean` (`v-model:expanded`)           | `false`        | Expanded state.                                                |

#### `FabMenuItem`

| Field      | Type                | Default  | Description                                                 |
| ---------- | ------------------- | -------- | ----------------------------------------------------------- |
| `value`    | `string`            | Required | Stable unique action value.                                 |
| `label`    | `string`            | Required | Visible action label.                                       |
| `disabled` | `boolean`           | `false`  | Keeps the action visible but prevents activation and focus. |
| `selected` | `boolean`           | `false`  | Selected appearance in `web-menu`; caller-controlled.       |
| `href`     | `string`            | —        | Native link URL instead of a button action.                 |
| `target`   | `string`            | —        | Native link target.                                         |
| `rel`      | `string`            | —        | Native link relationship.                                   |
| `download` | `boolean \| string` | —        | Native download attribute.                                  |

#### `FloatingActionButtonMenu`

| Prop                  | Type                                     | Default        | Description                                                    |
| --------------------- | ---------------------------------------- | -------------- | -------------------------------------------------------------- |
| `label`               | `string`                                 | LocaleProvider | Accessible name of the menu.                                   |
| `variant`             | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'`    | Color set passed to the panel and items.                       |
| `presentation`        | `'pill-stack' \| 'web-menu'`             | `'pill-stack'` | Project presentation for the slotted items.                    |
| `horizontalAlignment` | `'start' \| 'center' \| 'end'`           | `'end'`        | Popup alignment against the trigger.                           |
| `disabled`            | `boolean`                                | `false`        | Closes the menu and prevents opening.                          |
| `locale`              | `string`                                 | Provider       | Overrides LocaleProvider language, then falls back to `en-US`. |
| `expanded`            | `boolean` (`v-model:expanded`)           | `false`        | Expanded state.                                                |

#### `FloatingActionButtonMenuItem`

| Prop       | Type                | Default  | Description                                                 |
| ---------- | ------------------- | -------- | ----------------------------------------------------------- |
| `value`    | `string`            | Required | Stable unique action value.                                 |
| `label`    | `string`            | Required | Visible action label and default slot content.              |
| `disabled` | `boolean`           | `false`  | Keeps the action visible but prevents activation and focus. |
| `selected` | `boolean`           | `false`  | Selected appearance in `web-menu`; caller-controlled.       |
| `href`     | `string`            | —        | Native link URL instead of a button action.                 |
| `target`   | `string`            | —        | Native link target.                                         |
| `rel`      | `string`            | —        | Native link relationship.                                   |
| `download` | `boolean \| string` | —        | Native download attribute.                                  |

#### `ToggleFloatingActionButton`

| Prop       | Type                                     | Default     | Description                          |
| ---------- | ---------------------------------------- | ----------- | ------------------------------------ |
| `size`     | `'default' \| 'medium' \| 'large'`       | `'default'` | Closed size: 56px, 80px, or 96px.    |
| `variant`  | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | FAB color set.                       |
| `disabled` | `boolean`                                | `false`     | Disables the trigger.                |
| `type`     | `'button' \| 'submit' \| 'reset'`        | `'button'`  | Native button type.                  |
| `checked`  | `boolean` (`v-model:checked`)            | `false`     | Expanded state shared with the menu. |

### Events

#### `FabMenu`

| Event          | Payload                                                     | Description                                                     |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `toggle`       | `{ expanded: boolean }`                                     | Expanded state changed.                                         |
| `open`         | —                                                           | The menu opened.                                                |
| `close`        | —                                                           | The menu closed.                                                |
| `beforeselect` | `(item: FabMenuItem, event: CustomEvent<{ item, source }>)` | Cancelable selection request; `preventDefault()` keeps it open. |
| `select`       | `{ item: FabMenuItem, source: 'pointer' \| 'keyboard' }`    | An enabled action was activated.                                |

#### `FloatingActionButtonMenu`

| Event          | Payload                                                             | Description                    |
| -------------- | ------------------------------------------------------------------- | ------------------------------ |
| `beforetoggle` | `CustomEvent<{ expanded: boolean }>`                                | Cancelable visibility request. |
| `toggle`       | `{ expanded: boolean }`                                             | Expanded state changed.        |
| `open`         | —                                                                   | The menu opened.               |
| `close`        | —                                                                   | The menu closed.               |
| `select`       | `{ value: string, label: string, source: 'pointer' \| 'keyboard' }` | An enabled item was activated. |

#### `FloatingActionButtonMenuItem` and `ToggleFloatingActionButton`

| Component                      | Event   | Payload      | Description              |
| ------------------------------ | ------- | ------------ | ------------------------ |
| `FloatingActionButtonMenuItem` | `click` | `MouseEvent` | The item was clicked.    |
| `ToggleFloatingActionButton`   | `click` | `MouseEvent` | The trigger was clicked. |

### Slots

#### `FabMenu`

| Slot           | Props                                          | Description                                                              |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| `trigger`      | `{ expanded, toggle, triggerProps, progress }` | Replaces the default trigger; `triggerProps` includes the click handler. |
| `trigger-icon` | `{ expanded: boolean, progress: number }`      | Replaces the default trigger icon/animation.                             |
| `icon`         | `{ item: FabMenuItem }`                        | Leading icon for each item.                                              |
| `item`         | `{ item, expanded, activate, itemProps }`      | Replaces an item's content.                                              |

#### `FloatingActionButtonMenu`

| Slot      | Props                                             | Description                                                |
| --------- | ------------------------------------------------- | ---------------------------------------------------------- |
| `default` | —                                                 | `FloatingActionButtonMenuItem` children.                   |
| `trigger` | `{ expanded, toggle, setExpanded, triggerProps }` | Required trigger; `triggerProps` excludes a click handler. |

#### `FloatingActionButtonMenuItem`

| Slot      | Props | Description                 |
| --------- | ----- | --------------------------- |
| `default` | —     | Replaces the visible label. |
| `icon`    | —     | Leading icon.               |

#### `ToggleFloatingActionButton`

| Slot   | Props                                    | Description                        |
| ------ | ---------------------------------------- | ---------------------------------- |
| `icon` | `{ checked: boolean, progress: number }` | Replaces the plus and close icons. |

### Methods

#### `FabMenu`

| Method     | Description                   |
| ---------- | ----------------------------- |
| `open()`   | Requests the expanded state.  |
| `close()`  | Requests the collapsed state. |
| `toggle()` | Flips the expanded state.     |

#### `FloatingActionButtonMenu`

| Method     | Description                   |
| ---------- | ----------------------------- |
| `open()`   | Requests the expanded state.  |
| `close()`  | Requests the collapsed state. |
| `toggle()` | Flips the expanded state.     |

#### `ToggleFloatingActionButton`

| Property  | Description                               |
| --------- | ----------------------------------------- |
| `element` | The underlying button element, or `null`. |

## Styling

Set public FAB menu properties on the menu root. The menu copies them to the teleported panel and items.

::: details Style properties

| Area                | Properties                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu geometry       | `--yam3x-fab-menu-spacing`, `--yam3x-fab-menu-max-width`                                                                                                                                                                                                                                                                                                                                                                                 |
| Item surface        | `--yam3x-fab-menu-item-container-color`, `--yam3x-fab-menu-item-content-color`                                                                                                                                                                                                                                                                                                                                                           |
| Primary FAB roles   | `--yam3x-primary-fab-color`, `--yam3x-primary-fab-container-color`, `--yam3x-primary-fab-hover-color`, `--yam3x-primary-fab-focus-color`, `--yam3x-primary-fab-ripple-color`                                                                                                                                                                                                                                                             |
| Secondary FAB roles | `--yam3x-secondary-fab-color`, `--yam3x-secondary-fab-container-color`, `--yam3x-secondary-fab-hover-color`, `--yam3x-secondary-fab-focus-color`, `--yam3x-secondary-fab-ripple-color`                                                                                                                                                                                                                                                   |
| Tertiary FAB roles  | `--yam3x-tertiary-fab-color`, `--yam3x-tertiary-fab-container-color`, `--yam3x-tertiary-fab-hover-color`, `--yam3x-tertiary-fab-focus-color`, `--yam3x-tertiary-fab-ripple-color`                                                                                                                                                                                                                                                        |
| Item metrics        | `--yam3x-fab-menu-item-height`, `--yam3x-fab-menu-item-font-size`, `--yam3x-fab-menu-item-font-weight`, `--yam3x-fab-menu-item-line-height`, `--yam3x-fab-menu-item-tracking`, `--yam3x-fab-menu-item-shape`, `--yam3x-fab-menu-item-leading-space`, `--yam3x-fab-menu-item-trailing-space`, `--yam3x-fab-menu-item-top-space`, `--yam3x-fab-menu-item-bottom-space`, `--yam3x-fab-menu-item-spacing`, `--yam3x-fab-menu-item-icon-size` |
| Disabled actions    | `--yam3x-fab-menu-item-disabled-container-color`, `--yam3x-fab-menu-item-disabled-container-opacity`, `--yam3x-fab-menu-item-disabled-color`, `--yam3x-fab-menu-item-disabled-opacity`                                                                                                                                                                                                                                                   |

:::

## Material references

[FAB menu overview](https://m3.material.io/components/fab-menu/overview) · [guidelines](https://m3.material.io/components/fab-menu/guidelines) · [specs](https://m3.material.io/components/fab-menu/specs) · [accessibility](https://m3.material.io/components/fab-menu/accessibility)
