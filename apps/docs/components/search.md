<script setup lang="ts">
import SearchExample from './demos/SearchExample.vue'
</script>

# Search

Search lets people enter a query and review related suggestions or results. Choose a presentation that keeps the query and its result context easy to follow.

## Interactive example

Resize the pane and focus the search field to see how full-screen and docked modes switch. When expanded, enter text, press Enter to search, browse results with arrow keys, select a suggestion, or press Escape to return.

<div class="vp-raw yam3x-doc-demo-theme"><SearchExample /></div>

::: details View demo source

<<< ./demos/SearchExample.vue{vue}

:::

## Use in your app

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
    <template #input-field="{ inputProps }">
      <input
        v-bind="inputProps"
        class="my-search-input"
      />
    </template>
    <template #default="{ query, close }">
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
    </template>
  </Search>
</template>
```

## API

This component can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

| Prop               | Default           | Description                                                                                                                                                                        |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`            | Localized default | Used as both the input hint and accessible name; describe what can be searched.                                                                                                    |
| `layout`           | `auto`            | `auto` adapts to the current content pane width: full-screen below the project-defined 600px breakpoint and docked at 600px or wider. Can also be set to `fullscreen` or `docked`. |
| `variant`          | `contained`       | Visual style. `contained` is the M3 Expressive recommended style; `divided` remains available as a project option for the baseline style.                                          |
| `disabled`         | `false`           | Disables input and expansion.                                                                                                                                                      |
| `hide-search-icon` | `false`           | Hides the default decorative search icon; provide another visible search entry point in the interface.                                                                             |
| `clearable`        | `true`            | Shows the clear button when the query is not empty.                                                                                                                                |
| `close-label`      | `Back`            | Accessible name for the back button when expanded.                                                                                                                                 |
| `clear-label`      | `Clear`           | Accessible name for the clear button.                                                                                                                                              |
| `v-model:query`    | `''`              | Query text; can be controlled or managed internally.                                                                                                                               |
| `v-model:open`     | `false`           | Expanded state; can be controlled or managed internally.                                                                                                                           |

## Behavior and accessibility

Search emits `search(query)` and `clear` events. The `input-field` slot can replace the native input and receives `{ inputProps, query, open, disabled }`; bind `inputProps` to the actual native `<input>` so query updates, focus behavior, accessibility attributes, and disabled state stay connected. When omitted, Search renders its default native input. The default slot displays suggestions or results and receives `{ query, close }`; callers implement row interactions, and `close` restores focus to the input. Render suggestions or results as a named semantic list (`<ul>` or `<ol>`), and give each actionable item a clear accessible name. Search exposes the results container as a polite live region and announces added or changed result content; do not add a nested live region for the same updates. The `leading` and `trailing` slots provide icons or up to two supporting actions. Customize the back icon with `back`. Icon buttons in slots need clear accessible names.

## Styling

The field fits its content pane. In docked mode, the results panel matches the pane width and appears above a scrim.

## Material references

[Search overview](https://m3.material.io/components/search/overview) · [guidelines](https://m3.material.io/components/search/guidelines) · [specs](https://m3.material.io/components/search/specs) · [accessibility](https://m3.material.io/components/search/accessibility)
