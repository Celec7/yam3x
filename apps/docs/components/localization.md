<script setup lang="ts">
import LocalizationExample from './demos/LocalizationExample.vue'
</script>

# Localization

`LocaleProvider` is a project extension that shares built-in UI language and message overrides across a Vue subtree. Use it to configure related components together while keeping application content and translations separate from component behavior.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><LocalizationExample /></div>

::: details View demo source

<<< ./demos/LocalizationExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), add `localization` alongside the components you use. Installing a migrated component copies its internal locale dependencies; add `localization` to obtain the public provider entry point.

For an existing application, merge participating components following [Update copied source](/guide/updating). The CLI preserves existing files; adding the provider does not rewrite previously copied components.

```sh
pnpm dlx @celec7/yam3x@latest add localization pagination
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LocaleProvider, type LocaleOverrides } from './components/yam3x/localization'
import { Pagination } from './components/yam3x/pagination'

const locale = ref('zh-CN')
const messages: LocaleOverrides = { pagination: { next: '继续浏览' } }
</script>

<template>
  <LocaleProvider
    :locale="locale"
    :messages="messages"
  >
    <Pagination :total="200" />
  </LocaleProvider>
</template>
```

Keep application translations in your own files and pass a reactive message object. Functions in message entries retain their typed arguments, so an application can adapt an existing translation library without adding a library dependency to the copied components.

## API

| Prop       | Default                       | Use                                                                                                                                                           |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`   | Parent provider, then `en-US` | BCP 47 language tag for built-in text selection and each component's existing locale-sensitive operations.                                                    |
| `messages` | Inherited overrides           | `LocaleOverrides`, a partial object keyed by `pagination`, `form`, `fileUpload`, `dataTable`, and `treeView`. Each namespace accepts partial message entries. |

The default slot renders children without an extra DOM element. The provider has no models, events, or exposed methods. `LocaleMessages` describes the complete namespace contracts; existing component-specific message type exports remain available.

Provider support currently applies to [Pagination](/components/pagination), [Form](/components/form), [File upload](/components/file-upload), [Data table](/components/data-table), and [Tree view](/components/tree-view). Other components retain their own locale and label APIs.

## Behavior and accessibility

For each supported component, configuration resolves in this order:

1. Component `locale`, nearest provider `locale`, then `en-US`.
2. Built-in English messages, followed by the applicable built-in language messages.
3. Inherited provider overrides for the same language, nearest provider overrides, then component `messages`.

English and Simplified Chinese text lives in separate files under `localization/locales/`. Chinese language tags use the Simplified Chinese defaults; provide overrides when another Chinese translation is needed. Other valid tags retain their locale-sensitive formatting and use English text for untranslated entries. Invalid tags fall back to `en-US`. An omitted or `undefined` message entry falls back, while an empty string is an explicit override.

Nested providers inherit message overrides when their language is the same, including different regions. Changing language starts with that language's defaults and does not carry a parent's differently translated overrides. A component with an explicit different language likewise excludes provider messages from the other language.

Configuration updates reactively without remounting controls or resetting page, selection, check, queue, or form values. Already-created error messages and adapter results remain snapshots from their source; changing language does not rerun validation or retry requests. Separate provider trees have independent configuration, including during server rendering.

The provider translates built-in UI messages, not application labels, row data, browser-native validation messages, or server errors. Set document or region `lang` and `dir` in the application; a wrapperless Vue provider does not modify DOM language or writing direction.

## Styling

The provider adds no element or styling hook. Child components retain their own tokens and supported overrides.
