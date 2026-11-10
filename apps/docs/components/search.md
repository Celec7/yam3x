<script setup lang="ts">
import SearchExample from './demos/SearchExample.vue'
import SearchAppBarExample from './demos/SearchAppBarExample.vue'
</script>

# Search

Search lets people enter a query and review related suggestions or results. Search is a Material 3 Expressive component; choose a presentation that keeps the query and its result context easy to follow.

It is distinct from the Search app-bar variant, which is an entry point to a separate search view. The component owns query entry, the expanded results surface, and focus management; the feature using it owns the searched data, result ranking, and what selecting a result does.

## Examples

### Basic and layout states

<div class="vp-raw yam3x-doc-demo-theme"><SearchExample /></div>

Adjust the pane width to switch between full-screen and docked results, change the bar style, mirror the layout, and add loading or empty results. Focus the search field, type, press Enter to search, use arrow keys through results, choose a suggestion, or clear and close the surface. The trailing actions are composition content, not built-in Search actions.

::: details View demo source

<<< ./demos/SearchExample.vue{vue}

:::

### In an app bar

<div class="vp-raw yam3x-doc-demo-theme"><SearchAppBarExample /></div>

The app bar keeps a single entry point and mounts Search only while it is open. The feature closes and unmounts the search view, then returns focus to the app-bar trigger. Page content stays behind the docked scrim or the full-screen surface.

::: details View demo source

<<< ./demos/SearchAppBarExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Search } from './components/yam3x/search'

const query = ref('')
const open = ref(false)
const suggestions = ref([{ id: '1', title: 'Project docs' }])

function runSearch(value: string): void {
  console.log('search:', value)
}

function select(item: { id: string; title: string }): void {
  console.log('selected:', item.title)
}
</script>

<template>
  <Search
    v-model:query="query"
    v-model:open="open"
    label="Search messages"
    @search="runSearch"
  >
    <template #default="{ query: currentQuery, close }">
      <ul aria-label="Search suggestions and results">
        <li
          v-for="item in suggestions"
          :key="item.id"
        >
          <button
            type="button"
            @click="
              select(item)
              close()
            "
          >
            {{ item.title }}
          </button>
        </li>
      </ul>
      <p v-if="!suggestions.length">No results for {{ currentQuery }}</p>
    </template>
  </Search>
</template>
```

The `default` slot owns the result content and receives `{ query, close }`. Render a named semantic list and give every actionable item a clear name. Call `close()` after a selection to return to the collapsed bar.

::: details Custom input and icon slots

```vue
<template>
  <Search
    v-model:query="query"
    v-model:open="open"
    label="Search files"
  >
    <template #input-field="{ inputProps }">
      <input
        v-bind="inputProps"
        class="my-search-input"
      />
    </template>
    <template #leading>
      <span aria-hidden="true">⌕</span>
    </template>
    <template #trailing>
      <button
        type="button"
        aria-label="Search filters"
      >
        ☷
      </button>
    </template>
    <template #back>
      <span aria-hidden="true">←</span>
    </template>
  </Search>
</template>
```

Bind `inputProps` to the actual native `<input>` so query updates, focus, accessibility attributes, and disabled state stay connected. Icon buttons inside `trailing` need their own accessible names.

:::

## Behavior and accessibility

### Query and results

- `label` is both the input's accessible name and its placeholder; it also names the results region (`<label> suggestions and results`). Describe the searchable content rather than the action.
- The open surface is a modal dialog with `aria-modal="true"`; page scroll is locked while it is open. The results section is a polite live region and receives focus after a search is submitted.
- Submitting the form emits `search(query)`, blurs the input, and moves focus to the results. The `default` slot receives the current query and a `close` callback.
- The clear button appears only while the surface is open and the query is not empty. It clears the query, emits `clear`, and focuses the input again.
- `v-model:query` owns the text and `v-model:open` owns expanded state. Both may be controlled or left to the component.
- Do not nest another live region around the results. Result ranking, loading, and empty-result policy belong to the feature using Search.

### Keyboard and focus

- Focusing the field opens the surface unless the component is disabled. Opening moves focus into the search input.
- Arrow Down from the input moves focus into the results. Arrow Down and Arrow Up cycle through visible results and controls.
- Enter submits the query. Escape closes the surface. Tab cycles through controls and results inside the open surface instead of reaching background content.
- The clear and back buttons have action-specific names; the back button collapses the surface. Closures unmount the results view and release the page scroll lock.
- `disabled` prevents opening and closes an already open surface. If `clearable` is false, no clear button is rendered.

### Layout and dismissal

- `layout="auto"` measures the content pane and chooses full-screen below 600px and docked at 600px or wider. Set `fullscreen` or `docked` to remove that measurement.
- Full-screen results replace the bar's surroundings with the results surface. Docked results appear below the bar, match the bar width, and sit above a scrim.
- Clicking the docked scrim closes the surface. Full-screen Search is dismissed with Back or Escape.
- Contained is the default Expressive style; divided is available as the baseline project option. Both keep the query visible while results are shown.
- The component follows the surrounding writing direction. The bar and results fit the available pane instead of overflowing, so very narrow panes may be narrower than the nominal minimum width.

### Composition

The Search app-bar variant is only an entry point. Mount Search when the user opens search, keep the feature's query and result data outside the component, and return focus to the app-bar trigger after closing. The Search component itself does not call an API, rank results, or select records.

## API

Built-in interface text can inherit [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; `label`, `closeLabel`, and `clearLabel` override the corresponding defaults.

### Exports

| Export          | Kind      | Use                                                     |
| --------------- | --------- | ------------------------------------------------------- |
| `Search`        | Component | Query bar, modal results surface, and focus management. |
| `SearchLayout`  | Type      | `'auto'`, `'fullscreen'`, or `'docked'`.                |
| `SearchVariant` | Type      | `'contained'` or `'divided'`.                           |

### Props and models

| Prop / model              | Type                                 | Default            | Description                                                                |
| ------------------------- | ------------------------------------ | ------------------ | -------------------------------------------------------------------------- |
| `label`                   | `string`                             | Localized `Search` | Input placeholder and accessible name; also names the results region.      |
| `layout`                  | `'auto' \| 'fullscreen' \| 'docked'` | `'auto'`           | Chooses full-screen below 600px and docked from 600px.                     |
| `variant`                 | `'contained' \| 'divided'`           | `'contained'`      | Expressive contained bar or baseline divided bar.                          |
| `disabled`                | `boolean`                            | `false`            | Disables input and expansion, and closes an open surface.                  |
| `hideSearchIcon`          | `boolean`                            | `false`            | Hides the leading search icon; provide another visible search entry point. |
| `clearable`               | `boolean`                            | `true`             | Shows the clear button while the open query is not empty.                  |
| `closeLabel`              | `string`                             | Localized `Back`   | Accessible name for the back button.                                       |
| `clearLabel`              | `string`                             | Localized `Clear`  | Accessible name for the clear button.                                      |
| `query` / `v-model:query` | `string`                             | `''`               | Query text.                                                                |
| `open` / `v-model:open`   | `boolean`                            | `false`            | Expanded surface state.                                                    |
| `locale`                  | `string`                             | Provider → `en-US` | Language of built-in interface labels.                                     |

### Events

| Event    | Payload         | Description                                     |
| -------- | --------------- | ----------------------------------------------- |
| `search` | `query: string` | The query was submitted.                        |
| `clear`  | —               | The query was cleared through the clear action. |

### Slots

| Slot          | Props                                   | Description                                                     |
| ------------- | --------------------------------------- | --------------------------------------------------------------- |
| `default`     | `{ query, close }`                      | Suggestions or results. Call `close` after a selection.         |
| `input-field` | `{ inputProps, query, open, disabled }` | Replaces the native input; bind `inputProps` to a native input. |
| `leading`     | —                                       | Replaces the collapsed leading icon.                            |
| `trailing`    | —                                       | Adds trailing actions beside the input.                         |
| `back`        | —                                       | Replaces the back icon while expanded.                          |

### Methods

Access these through a template ref.

| Member    | Signature    | Description                                             |
| --------- | ------------ | ------------------------------------------------------- |
| `close()` | `() => void` | Collapses the results surface.                          |
| `clear()` | `() => void` | Clears the query, emits `clear`, and focuses the input. |
| `focus()` | `() => void` | Focuses the search input.                               |

## Styling

Search exposes no public CSS custom properties. Its bar, results view, focus indicator, and scrim map to material System color and shape roles, and the theme supplies those values. Use the slots for content and the host element for layout-specific adjustments.

::: details Applied roles and geometry

| Part                               | Treatment                                                                |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Bar                                | Surface Container High; 56px height; full shape.                         |
| Focus indicator                    | 3px secondary outline with 2px offset.                                   |
| Full-screen results                | Surface Container Low.                                                   |
| Docked results                     | Surface Container High with a scrim over page content.                   |
| Input and leading icon             | On Surface.                                                              |
| Supporting text and trailing icons | On Surface Variant.                                                      |
| Icons                              | 24px; leading/trailing targets are 48px and inset 4px from the bar edge. |
| Pane margins                       | 24px unfocused, 12px focused in the contained style.                     |

:::

## Material references

[Search overview](https://m3.material.io/components/search/overview) · [guidelines](https://m3.material.io/components/search/guidelines) · [specs](https://m3.material.io/components/search/specs) · [accessibility](https://m3.material.io/components/search/accessibility)
