<script setup lang="ts">
import ListExample from './demos/ListExample.vue'
import ListContentExample from './demos/ListContentExample.vue'
import ListSelectionExample from './demos/ListSelectionExample.vue'
</script>

# Lists

Lists present related items in a continuous, scannable sequence. Choose a static item, action, or selection option according to what each row does.

Lists are a Material 3 Expressive component family. The project exports one list container with standard and segmented variants, plus static, action, selection, and expandable item components. The Expressive row treatment is the default visual target; standard and segmented configurations remain available when they support the content hierarchy better.

## Examples

### Action and expandable lists

<div class="vp-raw yam3x-doc-demo-theme"><ListExample /></div>

This demo is an `ActionList` with an expandable inbox, a link destination, and a row with a separate trailing action. The controls switch standard and segmented appearance, narrow the list pane, mirror the layout for RTL, and simulate the dragged state. The detail pane outside the list shows which destination the application accepted.

::: details View demo source

<<< ./demos/ListExample.vue{vue}

:::

### Content and media lists

<div class="vp-raw yam3x-doc-demo-theme"><ListContentExample /></div>

The content demo compares one-, two-, and three-line static items, avatar and icon leading content, an image, a disabled video attachment with trailing text and icon, and an explicit divider. The appearance control explains the shape and gap difference between standard and segmented lists.

::: details View demo source

<<< ./demos/ListContentExample.vue{vue}

:::

### Selection lists and forms

<div class="vp-raw yam3x-doc-demo-theme"><ListSelectionExample /></div>

The selection demo combines a single-select listbox, a multiple listbox, and a native form. It shows selected and disabled options, keyboard roving, `required` validation with the invalid state, submitted values, and reset. The appearance and dragged-state controls apply to every list in the demo.

::: details View demo source

<<< ./demos/ListSelectionExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ActionList, ListAction } from './components/yam3x/list'

function openDrafts(): void {
  // Navigate to the drafts destination owned by the application.
}
</script>

<template>
  <ActionList aria-label="Mail actions">
    <ListAction @click="openDrafts">
      Drafts
      <template #supporting-text>4 unread drafts</template>
      <template #actions>
        <button
          type="button"
          aria-label="More draft actions"
          style="min-inline-size: 48px; min-block-size: 48px"
        >
          ⋮
        </button>
      </template>
    </ListAction>
  </ActionList>
</template>
```

`ActionList` supplies one roving tab stop for its rows. `ListAction` renders a native button, or a link when `href` is set. Give the list an accessible name and give every custom trailing control its own descriptive name.

::: details Static content, selection, and expansion

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  List,
  ListItem,
  ListAction,
  ListOption,
  SelectionList,
  ExpandableListItem,
} from './components/yam3x/list'

const destination = ref('inbox')
const open = ref(false)
</script>

<template>
  <List aria-label="Recent contacts">
    <ListItem leading-type="avatar">
      Ada Lovelace
      <template #supporting-text>Last active today</template>
      <template #trailing-text>09:41</template>
    </ListItem>
  </List>

  <SelectionList
    v-model="destination"
    label="Default inbox"
  >
    <ListOption value="inbox">Inbox</ListOption>
    <ListOption value="priority">Priority</ListOption>
    <ListOption
      value="archive"
      disabled
      >Archive</ListOption
    >
  </SelectionList>

  <ExpandableListItem v-model:open="open">
    Inbox
    <template #items>
      <ListAction>Primary</ListAction>
    </template>
  </ExpandableListItem>
</template>
```

Do not put `ListOption` directly in `List`; selection options belong inside `SelectionList`. The expandable `items` slot usually holds `ListAction` rows; nest a `SelectionList` there when the child rows must select values.

:::

## Behavior and accessibility

### Item anatomy and line counts

- `lines="auto"` detects the presence of overline and supporting content, then measures wrapping. Set `lines="one" | "two" | "three"` for a fixed baseline.
- Supporting text is limited to three lines and truncates responsively. Headline text stays the primary readable content.
- `leadingType` sizes the leading region: `icon` at 20px, `avatar` at 40px, `image` at 56px, and `video` at 100 × 56px. `control` and `custom` leave sizing to the slot content.
- Keep the content area widest. Leading media uses the small corner shape; images and video fill their leading box with `object-fit: cover`.
- `dragged` only paints the external reorder state. The component does not implement sorting, drop zones, or drag events.

### Actions and focus

- `ActionList` applies roving tabindex: one available action has `tabindex="0"` and the rest `-1`. Focus in the list makes that row the active stop.
- Arrow Down and Arrow Up wrap through available actions. Home and End move to the first and last. Arrow Right and Arrow Left move in logical order and reverse in RTL.
- Disabled actions, hidden rows, and closed expandable panels are skipped. Secondary controls inside a row join the same roving order and are not separate Tab stops.
- Buttons activate with Space or Enter; links activate with Enter and keep native navigation. `beforetoggle` on an expandable header can cancel opening or closing.
- Escape closes an open inline expandable panel and returns focus to its header. In full-screen mode, focus moves into the dialog, Tab is trapped, and Escape or the back button closes it and restores focus.
- `current` sets `aria-current="page"` and the current-destination styling. It is independent of option selection and does not set `aria-selected`.

### Selection and forms

- `SelectionList` is a listbox with an accessible name from `label`. Single mode uses `aria-selected` on one option; `mode="multiple"` adds `aria-multiselectable`.
- One enabled option is the tab stop. Arrow keys wrap through enabled options, Home and End move to the ends, and Space or Enter selects or toggles the focused option. Disabled options stay visible with `aria-disabled="true"` and are skipped.
- A cancellable `beforeinput` event is dispatched on the listbox before the model changes. Cancelling it keeps the previous selection.
- The model is a string, `null`, or a string array. Changing to `multiple` converts a single value into an array; changing back keeps the first value.
- Give each `ListOption` a stable, unique `value`. Duplicate values produce a console warning.
- Set `name` to submit selected values through hidden inputs. `form` associates the group with an external form, `required` adds native constraint validation, and `disabled` blocks selection. Validation does not require `name`.
- Invalid submission sets `aria-invalid="true"`, emits `invalid`, and focuses the first enabled option. Native reset restores the initial model, clears the invalid state, and restores the `required` proxy.
- Selected values submit in option order. The internal validation proxy is removed from `FormData` and never appears as a submitted value.
- `invalid` is an application-owned state. The component does not render an error message; pair it with [Inline message](/components/inline-message) or Form field text.

### Variants, dividers, and localization

- A standard list keeps rows at full width and relies on an explicit divider between groups. Place `<HorizontalDivider />` inside `<li class="yam3x-list-divider" role="separator">`; the list supplies 16px logical start and end insets.
- A segmented list is one visual group with 2px gaps and the large container corner shape. Use a separate labelled list for each group instead of nesting groups.
- `ExpandableListItem` uses the `actions` namespace for its full-screen back label. `closeLabel` overrides that label; `locale` selects the provider language, then `en-US`.
- Lists render all supplied rows. Virtual scrolling is not built in; page or window large collections in the application before rendering.

### Responsive and RTL

- Items fill their parent width; the surrounding layout controls columns, group spacing, and line length. Rows grow with text instead of clipping it.
- The list layout follows logical properties. Leading content stays at the inline start, trailing content at the inline end, and RTL mirrors the order.
- The roving arrow order reverses in RTL.
- Keep custom trailing targets at least 48 × 48px and do not nest interactive controls in the headline.

### State ownership

`ActionList` owns focus movement, not the active destination; the application updates `aria-current`, routes, and detail content. `SelectionList` owns accepted selection through `v-model`, while the application owns option data, validation messages, and submission handling. `ExpandableListItem` owns only its `open` model and disclosure behavior. Drag state and reordering remain application-owned.

## API

### Exports

| Export               | Kind      | Use                                                          |
| -------------------- | --------- | ------------------------------------------------------------ |
| `List`               | Component | Static list container with standard or segmented appearance. |
| `ListItem`           | Component | Non-interactive row.                                         |
| `ListAction`         | Component | Button or link row.                                          |
| `ActionList`         | Component | Action rows with roving tabindex.                            |
| `SelectionList`      | Component | Single- or multiple-select listbox with form support.        |
| `ListOption`         | Component | Selectable row inside `SelectionList`.                       |
| `ExpandableListItem` | Component | Disclosure row with inline or full-screen child list.        |
| `ListVariant`        | Type      | `'standard' \| 'segmented'`.                                 |
| `ListSelectionMode`  | Type      | `'single' \| 'multiple'`.                                    |

### `List`

| Prop      | Type                        | Default      | Use                                   |
| --------- | --------------------------- | ------------ | ------------------------------------- |
| `variant` | `'standard' \| 'segmented'` | `'standard'` | Row shape, gap, and group appearance. |

| Slot    | Scope | Use        |
| ------- | ----- | ---------- |
| default | —     | List rows. |

`List` renders a `ul` with `role="list"` and forwards other attributes, including `aria-label`, to that element.

### `ListItem`

| Prop          | Type                                                                | Default    | Use                                 |
| ------------- | ------------------------------------------------------------------- | ---------- | ----------------------------------- |
| `disabled`    | `boolean`                                                           | `false`    | Applies the disabled row treatment. |
| `dragged`     | `boolean`                                                           | `false`    | Paints the external reorder state.  |
| `leadingType` | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'` | Sizes the leading region.           |
| `lines`       | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`   | Content line count.                 |

| Slot              | Scope | Use                                                    |
| ----------------- | ----- | ------------------------------------------------------ |
| default           | —     | Headline content.                                      |
| `leading`         | —     | Icon, avatar, image, video, or custom leading content. |
| `overline`        | —     | Small text above the headline.                         |
| `supporting`      | —     | Supporting text below the headline.                    |
| `supporting-text` | —     | Alias that takes precedence over `supporting`.         |
| `trailing-text`   | —     | Text at the inline end.                                |
| `trailing`        | —     | Trailing icon or control.                              |

`ListItem` is static: it adds no role, focus target, or click behavior. The disabled and dragged props change appearance only.

### `ListAction`

| Prop          | Type                                                                | Default    | Use                                         |
| ------------- | ------------------------------------------------------------------- | ---------- | ------------------------------------------- |
| `disabled`    | `boolean`                                                           | `false`    | Disables the button or link.                |
| `dragged`     | `boolean`                                                           | `false`    | Paints the external reorder state.          |
| `href`        | `string`                                                            | —          | Renders an anchor instead of a button.      |
| `target`      | `string`                                                            | —          | Anchor target, forwarded with `href`.       |
| `rel`         | `string`                                                            | —          | Anchor relationship, forwarded with `href`. |
| `download`    | `string \| boolean`                                                 | —          | Anchor download attribute.                  |
| `type`        | `'button' \| 'submit' \| 'reset'`                                   | `'button'` | Native button type.                         |
| `leadingType` | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'` | Sizes the leading region.                   |
| `lines`       | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`   | Content line count.                         |

| Event   | Payload               | Use                    |
| ------- | --------------------- | ---------------------- |
| `click` | `(event: MouseEvent)` | The row was activated. |

| Slot              | Scope | Use                                                |
| ----------------- | ----- | -------------------------------------------------- |
| default           | —     | Row label.                                         |
| `leading`         | —     | Leading content.                                   |
| `overline`        | —     | Small text above the label.                        |
| `supporting`      | —     | Supporting text.                                   |
| `supporting-text` | —     | Alias that takes precedence over `supporting`.     |
| `trailing-text`   | —     | Text at the inline end.                            |
| `trailing`        | —     | Trailing icon.                                     |
| `actions`         | —     | Separate trailing controls outside the row action. |

In an `ActionList`, the row itself and its `actions` controls share one roving tab stop. Without that context, the row is a normal tab stop.

### `ActionList`

| Prop      | Type                        | Default      | Use                                   |
| --------- | --------------------------- | ------------ | ------------------------------------- |
| `variant` | `'standard' \| 'segmented'` | `'standard'` | Row shape, gap, and group appearance. |

| Slot    | Scope | Use                                      |
| ------- | ----- | ---------------------------------------- |
| default | —     | Action rows, including expandable items. |

`ActionList` renders a `ul` with `role="list"`, forwards attributes, and manages the roving tabindex described above.

### `SelectionList`

| Prop and model | Type                         | Default      | Use                                               |
| -------------- | ---------------------------- | ------------ | ------------------------------------------------- |
| `label`        | `string`                     | Required     | Accessible name of the listbox.                   |
| `v-model`      | `string \| string[] \| null` | `null`       | Accepted value, or values in multiple mode.       |
| `mode`         | `'single' \| 'multiple'`     | `'single'`   | Selection behavior.                               |
| `variant`      | `'standard' \| 'segmented'`  | `'standard'` | Row shape, gap, and group appearance.             |
| `name`         | `string`                     | —            | Submits selected values through hidden inputs.    |
| `form`         | `string`                     | —            | Associates the group with an external form by id. |
| `required`     | `boolean`                    | `false`      | Requires a selection during native validation.    |
| `disabled`     | `boolean`                    | `false`      | Disables every option and the listbox.            |
| `invalid`      | `boolean`                    | `false`      | Marks the listbox invalid.                        |

| Event         | Payload | Use                                        |
| ------------- | ------- | ------------------------------------------ |
| `beforeinput` | `Event` | Cancellable before the model changes.      |
| `input`       | `Event` | The accepted model changed.                |
| `change`      | `Event` | The accepted model changed, after `input`. |
| `invalid`     | `Event` | Native constraint validation failed.       |

| Slot    | Scope | Use           |
| ------- | ----- | ------------- |
| default | —     | List options. |

The listbox exposes `aria-multiselectable`, `aria-required`, `aria-invalid`, and `aria-disabled` from its props.

### `ListOption`

| Prop          | Type                                                                | Default    | Use                                |
| ------------- | ------------------------------------------------------------------- | ---------- | ---------------------------------- |
| `value`       | `string`                                                            | Required   | Stable, unique option value.       |
| `disabled`    | `boolean`                                                           | `false`    | Prevents selection and focus.      |
| `dragged`     | `boolean`                                                           | `false`    | Paints the external reorder state. |
| `leadingType` | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'` | Sizes the leading region.          |
| `lines`       | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`   | Content line count.                |

| Slot              | Scope | Use                                            |
| ----------------- | ----- | ---------------------------------------------- |
| default           | —     | Option label.                                  |
| `leading`         | —     | Leading content.                               |
| `overline`        | —     | Small text above the label.                    |
| `supporting`      | —     | Supporting text.                               |
| `supporting-text` | —     | Alias that takes precedence over `supporting`. |
| `trailing-text`   | —     | Text before the selection indicator.           |
| `trailing`        | —     | Trailing icon.                                 |
| `indicator`       | —     | Replaces the radio or checkbox indicator.      |

`ListOption` renders `role="option"` with `aria-selected` and `aria-disabled`, and uses the selection list context. Replacing `#indicator` does not change the option's semantics or keyboard behavior.

### `ExpandableListItem`

| Prop and model    | Type                                                                | Default            | Use                                                         |
| ----------------- | ------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| `v-model:open`    | `boolean`                                                           | `false`            | Expanded state.                                             |
| `disabled`        | `boolean`                                                           | `false`            | Disables the disclosure header.                             |
| `dragged`         | `boolean`                                                           | `false`            | Paints the external reorder state.                          |
| `current`         | `boolean`                                                           | `false`            | Sets `aria-current="page"` and current-destination styling. |
| `leadingType`     | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'`         | Sizes the leading region.                                   |
| `lines`           | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`           | Header content line count.                                  |
| `presentation`    | `'inline' \| 'fullScreen'`                                          | `'inline'`         | Inline disclosure or full-screen container transform.       |
| `locale`          | `string`                                                            | Provider → `en-US` | Language of the built-in back label.                        |
| `closeLabel`      | `string`                                                            | Localized `Back`   | Overrides the full-screen back label.                       |
| `fullScreenTitle` | `string`                                                            | `''`               | Visible title fallback in full-screen mode.                 |

| Event          | Payload | Use                                           |
| -------------- | ------- | --------------------------------------------- |
| `beforetoggle` | `Event` | Cancellable before the panel opens or closes. |
| `opening`      | `Event` | The panel is about to open.                   |
| `opened`       | `Event` | The open transition finished.                 |
| `closing`      | `Event` | The panel is about to close.                  |
| `closed`       | `Event` | The close transition finished.                |

| Slot                | Scope | Use                                            |
| ------------------- | ----- | ---------------------------------------------- |
| default             | —     | Header label.                                  |
| `leading`           | —     | Leading content.                               |
| `overline`          | —     | Small text above the label.                    |
| `supporting`        | —     | Supporting text.                               |
| `supporting-text`   | —     | Alias that takes precedence over `supporting`. |
| `toggle-icon`       | —     | Replaces the expand/collapse icon.             |
| `items`             | —     | Child list content.                            |
| `full-screen-title` | —     | Replaces the full-screen dialog title.         |

In inline mode the panel is a `list`; in full-screen mode it is a modal `dialog`. Name that dialog with `fullScreenTitle`, `#full-screen-title`, or the root `aria-label`; the last also supplies the visible title fallback. Accepting `open` from the model controls the panel; the component does not expose imperative open or close methods.

### Events

Events are listed with the component that emits them. `ListItem`, `List`, and `ActionList` emit none.

### Methods

No list component exposes instance methods. Selection is controlled through models, and expansion is controlled through `v-model:open`.

## Styling

List geometry, insets, gaps, media dimensions, and state shapes are owned by the component and map to the Expressive list treatment. No list-specific custom properties are documented; use the shared System typescale tokens and the shared state-layer and ripple hooks instead.

| Interface                                                                | Use                                                         |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `--md-sys-typescale-body-large-*`                                        | Headline role.                                              |
| `--md-sys-typescale-body-medium-*`                                       | Supporting text role.                                       |
| `--md-sys-typescale-label-small-*`                                       | Overline and trailing text roles.                           |
| `--md-sys-density-spacing-scale`                                         | Scales list spacing with density.                           |
| `--yam3x-state-layer-hover-color`, `--yam3x-state-layer-focus-color`     | Shared state-layer colors for action and option surfaces.   |
| `--yam3x-state-layer-hover-opacity`, `--yam3x-state-layer-focus-opacity` | Shared state-layer opacities.                               |
| `--yam3x-ripple-color`, `--yam3x-ripple-opacity`                         | Shared pressed ripple colors for action and selection rows. |
| `--yam3x-collapsible-animation-duration`                                 | Expand and collapse duration; defaults to `300ms`.          |

A segmented list is one visual group with 2px gaps and the large container corner shape. A standard list keeps full-width rows and relies on explicit dividers. Items fill the parent width; the surrounding layout controls columns and reading width. Leading and trailing icons render at 20px, leading avatars at 40px, images at 56px, and video at 100 × 56px. Selected leading and trailing icons use the selected content role; hover, focus, and pressed selected states switch those icons to `on-surface` while the label keeps the selected label role.

## Material references

[Lists overview](https://m3.material.io/components/lists/overview) · [guidelines](https://m3.material.io/components/lists/guidelines) · [specs](https://m3.material.io/components/lists/specs) · [accessibility](https://m3.material.io/components/lists/accessibility)
