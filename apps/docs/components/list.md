<script setup lang="ts">
import ListExample from './demos/ListExample.vue'
import ListContentExample from './demos/ListContentExample.vue'
import ListSelectionExample from './demos/ListSelectionExample.vue'
</script>

# Lists

Lists present related items in a continuous, scannable sequence. Choose a static item, action, or selection option according to what each row does.

## Interactive examples

### Action and expandable lists

<div class="vp-raw yam3x-doc-demo-theme"><ListExample /></div>

::: details View demo source

<<< ./demos/ListExample.vue{vue}

:::

### Content lists

<div class="vp-raw yam3x-doc-demo-theme"><ListContentExample /></div>

::: details View demo source

<<< ./demos/ListContentExample.vue{vue}

:::

### Selection lists and forms

<div class="vp-raw yam3x-doc-demo-theme"><ListSelectionExample /></div>

::: details View demo source

<<< ./demos/ListSelectionExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ActionList, ListAction } from './components/yam3x/list'
</script>

<template>
  <ActionList aria-label="Mail actions">
    <ListAction>
      Drafts
      <template #actions>
        <button
          type="button"
          aria-label="More draft actions"
          style="min-width: 48px; min-height: 48px"
        >
          ⋮
        </button>
      </template>
    </ListAction>
  </ActionList>
</template>
```

## API

`ExpandableListItem` can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

`List` and `ActionList` accept `variant="standard" | "segmented"`. `ListItem` is static; `ListAction` renders a native button, or a link when `href` is set. `ActionList` exposes an `actions` slot for separate trailing controls. These components, plus `SelectionList`, `ListOption`, and `ExpandableListItem`, are exported from `./components/yam3x/list`.

Items use `lines="auto"` by default. Set `lines="one" | "two" | "three"` when a fixed baseline layout is needed. `SelectionList` requires an accessible `label`; `mode` defaults to `single`, and `multiple` enables independent selection. Its `v-model` is a string, `null`, or a string array. Give each `ListOption` a stable, unique `value`. Set `name` to submit selected values, `form` to associate an external form, and `required` for native validation; validation does not require `name`.

`ExpandableListItem` accepts `v-model:open`, an `items` slot, `current`, and `presentation="fullScreen"`. The default inline disclosure and optional full-screen container transform are project extensions. `ListItem`, `ListAction`, `ListOption`, and `ExpandableListItem` accept `dragged` to display an external sorting system's drag state; they do not implement sorting.

## Behavior and accessibility

Supporting text wraps to three lines and then truncates; the row uses the matching one-, two-, or three-line layout. Keep the main content area widest and give custom actions a descriptive name and at least a 48 × 48px target. Avoid nested controls that interrupt row navigation or make focus order unclear.

Expansion reveals child items. `current` independently sets `aria-current="page"` and the selected destination state. In full-screen mode, name the dialog with `fullScreenTitle`, the `#full-screen-title` slot, or root `aria-label`; the latter also supplies the visible title fallback. Focus stays within the dialog while open; Escape or the back button closes it.

## Styling

Place an explicit horizontal [Divider](/components/divider) in `<li class="yam3x-list-divider" role="separator">` for a standard list. Its default logical start and end insets are 16px. Segmented lists use space between items instead. Items fill their parent width; the surrounding layout controls columns and line length.

## Material references

[Lists overview](https://m3.material.io/components/lists/overview) · [guidelines](https://m3.material.io/components/lists/guidelines) · [specs](https://m3.material.io/components/lists/specs) · [accessibility](https://m3.material.io/components/lists/accessibility)
