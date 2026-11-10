<script setup lang="ts">
import OptionBasicExample from './demos/OptionBasicExample.vue'
import OptionExample from './demos/OptionExample.vue'
import OptionDialogExample from './demos/OptionDialogExample.vue'
</script>

# Option

`Option`, `OptionGroup`, and `OptionPanel` are project primitives for selection lists and popup surfaces. They render the row, grouping, and panel that parent controls such as [Select](/components/select) and [Autocomplete](/components/autocomplete) own. The primitives are a project extension; the row and menu treatments follow Material 3 Expressive menu guidance, while the composition and keyboard contract are project decisions.

The closest Compose Material 3 analogs are `SelectableDropdownMenuItem` for selection and `CheckableDropdownMenuItem` for checkable rows. Material defines item treatment within owning surfaces such as Menus and Lists, not a universal standalone Option.

Use them to build a custom picker or to extend a project control. Use [Select](/components/select) when a standard form control fits; use these primitives when the trigger, panel content, or focus model is application-owned.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><OptionBasicExample /></div>

::: details View demo source

<<< ./demos/OptionBasicExample.vue{vue}

:::

Group related rows with `OptionGroup`. The parent control owns the accepted value, moves focus, and commits selection. `Option` only reports `{ value, source }`; it does not store a second selected value. The disabled row stays visible but cannot be activated.

### Anchored panel

<div class="vp-raw yam3x-doc-demo-theme"><OptionExample /></div>

::: details View demo source

<<< ./demos/OptionExample.vue{vue}

:::

The standalone panel anchors to an element with `anchor`. The demo opens it from a trigger, moves focus to the first enabled option after `positioned` becomes true, and implements the arrow, Home, End, Escape, and Tab behavior the panel expects its parent to provide. The panel content control exposes loading and empty states without creating selectable options.

### Dialog mode

<div class="vp-raw yam3x-doc-demo-theme"><OptionDialogExample /></div>

::: details View demo source

<<< ./demos/OptionDialogExample.vue{vue}

:::

Set `role="dialog"` when the surface contains controls that are not a single option list. The application names the dialog, moves focus inside after positioning, closes it on Escape or when focus leaves, and returns focus to the trigger. Dialog mode changes surface semantics only; `OptionPanel` does not trap focus or make the page inert.

## Use in your app

After [installation](/guide/installation), import the copied primitives from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'
import { Option, OptionGroup } from './components/yam3x/option'
import { Select } from './components/yam3x/select'

const order = ref('recent')
</script>

<template>
  <FormField label="Sort order">
    <Select
      v-model="order"
      name="order"
    >
      <OptionGroup label="Sort">
        <Option
          value="recent"
          label="Recently added"
        />
        <Option
          value="name"
          label="Name"
        />
      </OptionGroup>
    </Select>
  </FormField>
</template>
```

::: details Standalone panel with an anchor

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Option, OptionGroup, OptionPanel } from './components/yam3x/option'

const anchor = ref<HTMLElement | null>(null)
const panel = ref<{ show: () => void } | null>(null)
const open = ref(false)
const selected = ref('all')
</script>

<template>
  <button
    ref="anchor"
    type="button"
    aria-haspopup="listbox"
    :aria-expanded="open"
    @click="panel?.show()"
  >
    Choose a project
  </button>
  <OptionPanel
    ref="panel"
    v-model:open="open"
    :anchor="anchor"
    label="Projects"
  >
    <OptionGroup label="Projects">
      <Option
        value="all"
        label="All projects"
        :selected="selected === 'all'"
      />
      <Option
        value="recent"
        label="Recently opened"
        :selected="selected === 'recent'"
      />
    </OptionGroup>
  </OptionPanel>
</template>
```

Wait for `positioned` before moving focus into a newly opened panel. The component keeps the popup hidden while the positioning pass runs.

:::

::: details Dialog-mode surface

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OptionPanel } from './components/yam3x/option'

const anchor = ref<HTMLElement | null>(null)
const panel = ref<{ show: () => void } | null>(null)
const open = ref(false)
const showArchived = ref(false)
</script>

<template>
  <button
    ref="anchor"
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="open"
    @click="panel?.show()"
  >
    Filter columns
  </button>
  <OptionPanel
    ref="panel"
    v-model:open="open"
    :anchor="anchor"
    role="dialog"
    label="Column filters"
  >
    <label>
      <input
        v-model="showArchived"
        type="checkbox"
      />
      Show archived projects
    </label>
  </OptionPanel>
</template>
```

In dialog mode the parent must name the surface, move focus inside, handle Escape and focus leaving, and return focus on close.

:::

## Behavior and accessibility

### Parent ownership and selection

- `Option` is controlled. `selected` is a prop, and the parent accepts or rejects the `select` detail. Inside Select, the parent context supplies the accepted selection and registers the option.
- `Option` renders `role="option"` and `aria-selected`; disabled options expose `aria-disabled` and keep `tabindex="-1"`.
- `OptionGroup` renders `role="group"` with a visible label. `hidden` removes the group and its rows from rendering.
- `OptionPanel` renders the temporary surface. It reports open, close, and toggle events but never selects a value.

### Keyboard and focus

- The parent control owns arrow-key navigation, Home and End, type-ahead, acceptance, and focus return. Options default to `tabindex="-1"` so the parent keeps one roving entry.
- An enabled option handles Enter and Space when it already has focus and reports `source: 'keyboard'`. Pointer activation reports `source: 'pointer'`.
- The panel itself is focusable with `tabindex="-1"`; it does not trap focus or add Tab stops.
- Wait for `positioned` before focusing a newly opened surface. It stays `false` while the positioning pass keeps the popup hidden.
- In dialog mode, the parent must move focus into the surface and restore it when the dialog closes.

### Positioning and dismissal

- The panel positions around `anchor`, flips and shifts within the viewport, and clamps its width and height. `fitAnchorWidth` defaults to `true`; `anchorOffset` defaults to `4` px.
- `teleport` defaults to `false`. When enabled, the panel moves to `body` and inherits the anchor's direction and custom properties.
- Outside pointer input closes the panel. `scrollStrategy="hide"` also closes it when the anchor scrolls; the default `reposition` keeps it aligned.
- `role` defaults to `listbox`. `multiple` adds `aria-multiselectable` to a listbox only.
- `role="dialog"` changes surface semantics only. It omits listbox-only attributes and does not add modal behavior, focus trapping, or page inertness.

### Loading, empty, and panel methods

- `loading` exposes `aria-busy="true"` and renders a status instead of options. `empty` renders the no-data status. Both status messages use the `optionPanel` locale namespace; `loadingText`, `noDataText`, and their slots take precedence.
- The status rows are not options and cannot be selected.
- `show()`, `hide()`, and `toggle()` are available through a component ref. `show()` opens against the supplied anchor; it does not move focus.
- A cancelable `beforetoggle` event runs before every programmatic, outside, or scroll-driven change. Calling `preventDefault()` leaves the panel in its previous state.

### Forms and state ownership

The primitives do not submit form values. The owning form control stores the accepted value, required validation, and reset behavior. Keep `selected` in the application when the parent is custom; `Option` never keeps an independent value. `OptionGroup` and `OptionPanel` keep only presentation state.

## API

Built-in loading and empty text can inherit shared [LocaleProvider](/components/localization) configuration's `optionPanel` namespace. `locale`, `loadingText`, `noDataText`, and the corresponding slots take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export                                                                                         | Description                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `Option`, `OptionGroup`, `OptionPanel`                                                         | The row, group, and popup surface primitives.     |
| `OptionHighlightMode`, `OptionSelectionDetail`, `OptionSelectionSource`, `OptionToggleDetail`  | Type exports for highlighting, selection, and toggling. |

### `Option` props and models

| Prop                     | Type                                   | Default      | Use                                                          |
| ------------------------ | -------------------------------------- | ------------ | ------------------------------------------------------------ |
| `value`                  | `string`                               | Required     | Unique option value reported by `select`.                    |
| `label`                  | `string`                               | Required     | Visible text and accessible name.                            |
| `selected`               | `boolean`                              | `false`      | Accepted selection; the parent owns the value.               |
| `disabled`               | `boolean`                              | `false`      | Prevents activation and keeps the row non-selectable.        |
| `id`                     | `string`                               | Generated    | Element ID used by `aria-activedescendant`.                  |
| `first`                  | `boolean`                              | `false`      | Applies the outer first-row corner treatment.                |
| `last`                   | `boolean`                              | `false`      | Applies the outer last-row corner treatment.                 |
| `tabindex`               | `number`                               | `-1`         | Tab index for the option when it is the focused entry.       |
| `term`                   | `string`                               | `''`         | Search term used for match highlighting.                     |
| `highlightMode`          | `'contains' \| 'starts-with' \| 'ends-with'` | `'contains'` | Match strategy for `term`.                              |
| `disableHighlight`       | `boolean`                              | `false`      | Disables matching highlight while keeping the label.         |
| `hideSelectionIndicator` | `boolean`                              | `false`      | Removes the built-in selected mark.                          |
| `selectionSource`        | `'pointer' \| 'keyboard' \| 'programmatic'` | `'pointer'` | Source reported for pointer activation.                  |

### `Option` events

| Event    | Payload                         | Use                                                               |
| -------- | ------------------------------- | ----------------------------------------------------------------- |
| `select` | `{ value, source }`             | Reports an enabled option's activation; the parent accepts it.    |

### `Option` slots

| Slot                 | Use                                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `default`            | Custom label content; the label still supplies the accessible name. |
| `leading`            | Decorative leading media, such as an icon or avatar.                |
| `selected-indicator` | Replaces the built-in selected mark.                                |
| `trailing`           | Trailing metadata or a badge.                                       |

Keep the row's interactive target free of nested controls or a second independent action.

### `OptionGroup` props

| Prop         | Type      | Default   | Use                                                      |
| ------------ | --------- | --------- | -------------------------------------------------------- |
| `label`      | `string`  | Undefined | Visible group label and accessible group name.           |
| `labelledby` | `string`  | Undefined | Existing element ID that names the group.                |
| `hidden`     | `boolean` | `false`   | Removes the group and its options.                       |

### `OptionGroup` slots

| Slot    | Use                                      |
| ------- | ---------------------------------------- |
| `default` | Grouped options.                       |
| `label` | Custom visible group label.              |

### `OptionPanel` props and models

| Prop and model   | Type                              | Default        | Use                                                          |
| ---------------- | --------------------------------- | -------------- | ------------------------------------------------------------ |
| `open`           | `v-model:open: boolean`           | `false`        | Controls visibility.                                         |
| `id`             | `string`                          | Generated      | Explicit panel element ID.                                   |
| `anchor`         | `HTMLElement \| null`             | `null`         | Element the panel positions against.                         |
| `role`           | `'listbox' \| 'dialog'`           | `'listbox'`    | Surface semantics.                                           |
| `label`          | `string`                          | `''`           | Accessible surface name.                                     |
| `labelledby`     | `string`                          | `''`           | Existing element ID that names the surface.                  |
| `multiple`       | `boolean`                         | `false`        | Adds `aria-multiselectable` to a listbox.                    |
| `fitAnchorWidth` | `boolean`                         | `true`         | Matches the panel width to the anchor.                       |
| `anchorOffset`   | `number`                          | `4`            | Gap between the anchor and panel, in CSS pixels.             |
| `scrollStrategy` | `'reposition' \| 'hide'`          | `'reposition'` | Keeps alignment or closes when the anchor scrolls.           |
| `loading`        | `boolean`                         | `false`        | Shows the loading status and sets `aria-busy`.               |
| `empty`          | `boolean`                         | `false`        | Shows the no-data status.                                    |
| `teleport`       | `boolean`                         | `false`        | Moves the panel to `body`.                                   |
| `loadingText`    | `string`                          | Localized      | Overrides the loading message.                               |
| `noDataText`     | `string`                          | Localized      | Overrides the empty message.                                 |
| `panelClass`     | `string`                          | `''`           | Extra classes on the panel element.                          |
| `locale`         | `string`                          | Provider → `en-US` | Language of built-in status text.                        |

### `OptionPanel` events

| Event          | Payload                                      | Use                                                                 |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `beforetoggle` | `CustomEvent<{ open, source }>`              | Cancelable before a change. Call `preventDefault()` to stop it.     |
| `toggle`       | `{ open, source }`                           | After the open state changes.                                       |
| `open`         | —                                            | After the panel opens.                                              |
| `close`        | —                                            | After the panel closes.                                             |

`source` is `programmatic`, `outside`, or `anchor-scroll`.

### `OptionPanel` slots

| Slot      | Use                                                   |
| --------- | ----------------------------------------------------- |
| `default` | Options or dialog content.                            |
| `loading` | Replaces the loading status.                          |
| `no-data` | Replaces the empty status.                            |

### `OptionPanel` methods

Access these through a template ref. The component also exposes `panel`, its element, and the reactive `positioned` flag.

| Method     | Returns | Use                                                        |
| ---------- | ------- | ---------------------------------------------------------- |
| `show()`   | `void`  | Opens against the supplied anchor without moving focus.   |
| `hide()`   | `void`  | Closes without restoring focus.                           |
| `toggle()` | `void`  | Toggles the current state.                                 |

## Styling

The primitives expose public `--yam3x-option-*` properties on their roots. Defaults map to the owning Material surface and system tokens. A fine primary pointer uses 16 px start and 10 px end insets with a 12 px icon gap; a coarse primary pointer uses 12 px on both sides with an 8 px gap. The visible row is 44 px high inside a 48 px interaction target. Rows use Medium outer corners and extra-small inner corners; a selected row keeps its selected Medium shape. Focus uses an inset 3 px `secondary` ring on the visual row and does not change its corner radius. Option labels use Label Large; group labels use the same role and keep a 32 px minimum height with 12 px start and 4 px end padding. Select trigger hooks are documented on the [Select page](/components/select#styling).

::: details Common CSS properties

| Area        | Properties                                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Row         | `--yam3x-option-container-height`, `--yam3x-option-height`, `--yam3x-option-shape`, `--yam3x-option-first-child-shape`, `--yam3x-option-last-child-shape` |
| Selected row| `--yam3x-option-selected-container-color`, `--yam3x-option-selected-color`, `--yam3x-option-selected-container-hover-color`, `--yam3x-option-selected-container-focus-color` |
| Text        | `--yam3x-option-color`, `--yam3x-option-disabled-color`, `--yam3x-option-label-text-font-size`, `--yam3x-option-label-text-font-weight`, `--yam3x-option-label-text-line-height`, `--yam3x-option-label-text-tracking` |
| Spacing     | `--yam3x-option-padding-start`, `--yam3x-option-padding-end`, `--yam3x-option-icon-size`, `--yam3x-option-icon-label-space` |
| State       | `--yam3x-option-container-hover-color`, `--yam3x-option-container-focus-color`, `--yam3x-option-ripple-color` |
| Group       | `--yam3x-option-group-label-color`, `--yam3x-option-group-divider-color`, `--yam3x-option-group-divider-inset` |
| Panel       | `--yam3x-option-panel-container-color`, `--yam3x-option-panel-container-shape`, `--yam3x-option-panel-container-min-width`, `--yam3x-option-panel-container-max-width`, `--yam3x-option-panel-container-max-height` |
| Panel state | `--yam3x-option-panel-container-padding-inline`, `--yam3x-option-panel-container-padding-block`, `--yam3x-option-panel-container-elevation`, `--yam3x-option-panel-divider-spacing`, `--yam3x-option-panel-loading-color`, `--yam3x-option-panel-text-highlight-color`, `--yam3x-option-panel-text-highlight-container-color` |

The temporary panel defaults to the System `surface-container-low` role and level 2 elevation and inherits row and group values. It uses 2 px block padding and 4 px inline padding. Hover and focus use separate state layers; the selected row keeps its selected container while using the selected state layer.

:::

## Material references

[Menus overview](https://m3.material.io/components/menus/overview) · [guidelines](https://m3.material.io/components/menus/guidelines) · [specs](https://m3.material.io/components/menus/specs) · [menus accessibility](https://m3.material.io/components/menus/accessibility) · [Select specs](https://m3.material.io/components/select/specs)
