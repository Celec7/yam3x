<script setup lang="ts">
import LocalizationExample from './demos/LocalizationExample.vue'
import LocalizationOverridesExample from './demos/LocalizationOverridesExample.vue'
import ActionLocalizationExample from './demos/ActionLocalizationExample.vue'
</script>

# Localization

`LocaleProvider` is a project extension that shares built-in interface language and message overrides across a Vue subtree. It translates the text a component generates, such as action names, empty states, and validation prompts. It does not translate application labels, record data, or server errors.

Use it to configure related components together. For a single instance, prefer the component's own `locale`, `messages`, or label props. Material does not define a localization provider; the component mapping and precedence rules are project decisions.

## Examples

### Provider and inheritance

<div class="vp-raw yam3x-doc-demo-theme"><LocalizationExample /></div>

::: details View demo source

<<< ./demos/LocalizationExample.vue{vue}

:::

Switch the inherited language while page, file, number, selection, and form state stay unchanged. The nested English provider keeps its own pagination text even when the outer language changes. The demo also shows application labels that remain in the application's language while built-in text translates.

### Component overrides

<div class="vp-raw yam3x-doc-demo-theme"><LocalizationOverridesExample /></div>

::: details View demo source

<<< ./demos/LocalizationOverridesExample.vue{vue}

:::

One provider sets `en-US` and overrides the pagination `next` message. A component `locale` replaces the language for that instance, and a component `messages` entry replaces both. An omitted entry falls back; an empty string is an explicit override.

### Action names

<div class="vp-raw yam3x-doc-demo-theme"><ActionLocalizationExample /></div>

::: details View demo source

<<< ./demos/ActionLocalizationExample.vue{vue}

:::

The `actions` namespace supplies generated names and accessible labels for buttons, menu triggers, chips, badges, breadcrumbs, sliders, dialogs, and notifications. Changing language updates those names without restarting an open dialog edit, a snackbar timeout, or a range slider focus target.

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
const messages = ref<LocaleOverrides>({ pagination: { next: '继续浏览' } })
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

::: details Server rendering

Choose one explicit locale for the server and the client:

```vue
<script setup lang="ts">
import { LocaleProvider } from './components/yam3x/localization'
</script>

<template>
  <LocaleProvider locale="en-US">
    <slot />
  </LocaleProvider>
</template>
```

Separate provider trees keep independent configuration during server rendering. Calendar, Date input, Date pickers, and Time pickers use a browser locale fallback without a provider; set the same explicit locale on both sides to avoid a hydration mismatch.

:::

## Behavior and accessibility

### Resolution order

For each supported component, configuration resolves in this order:

1. Component `locale`, nearest provider `locale`, then the component's standalone default (`en-US` except Calendar, Date input, Date pickers, and Time pickers' browser locale).
2. Built-in English messages, followed by the applicable built-in language messages.
3. Inherited provider overrides for the same language, nearest provider overrides, then component `messages` or individual label and message props.

A component with an explicit different language excludes provider messages from the other language. Nested providers inherit overrides when their language is the same, including different regions.

### Catalogs and fallback

- Built-in translations live in separate files under `localization/locales/`. English and Simplified Chinese cover all supported namespaces.
- Additional partial catalogs preserve Date input group labels for `ar`, `de`, `es`, `fr`, `it`, `ja`, `ko`, `pt`, and `ru`.
- Chinese language tags use the Simplified Chinese defaults; provide overrides when another Chinese translation is needed.
- Other valid tags retain their locale-sensitive formatting and use English text for untranslated entries. Invalid tags fall back to `en-US`.
- An omitted or `undefined` message entry falls back. An empty string is an explicit override.

### Reactivity

Configuration updates reactively without remounting controls or resetting page, selection, check, queue, or form values. Stored error messages and adapter results remain snapshots from their source. Computed validation feedback, such as Date input's current error, follows the active catalog. Changing language does not restart Form validation adapters or retry requests.

### Scope and SSR

The provider translates built-in UI messages, not application labels, row data, browser-native validation messages, or server errors. Set the document or region `lang` and `dir` in the application; a wrapperless Vue provider does not modify DOM language or writing direction. Separate provider trees have independent configuration, including during server rendering.

### Message namespaces

The `LocaleOverrides` object is keyed by component namespace. Each namespace accepts partial entries; `LocaleMessages` describes the complete contracts.

::: details Namespace map

| Namespace       | Covers                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| `actions`       | Shared action, generated-name, and role labels across dialogs, sheets, menus, tabs, chips, badges, breadcrumbs, sliders, forms, and snackbars. |
| `select`        | Empty select text.                                                                      |
| `autocomplete`  | Result counts, suggestion names, and required-selection text.                           |
| `optionPanel`   | Loading and no-data text.                                                               |
| `datePicker`    | Field, range, navigation, mode, action, and validation text.                            |
| `timePicker`    | Field, mode, action, dialog, dial, and validation text.                                 |
| `dateInput`     | Date, time, and datetime group labels plus validation and segment names.                |
| `calendar`      | Navigation, period, and range text.                                                     |
| `numberField`   | Range and step messages; functions receive formatted bounds or the field label.         |
| `pagination`    | Label, page navigation, page size, pending, and range text.                             |
| `form`          | Summary, validation, submission, success, and failure text.                             |
| `fileUpload`    | Selection, queue, progress, actions, rejections, and summaries.                         |
| `dataTable`     | Query, selection, loading, empty, error, and scroll text.                               |
| `treeView`      | Instructions, expansion, checking, loading, failure, and empty text.                    |
| `treeSelect`    | Search, empty, and no-result text.                                                      |
| `cascader`      | Search, empty, no-result, and level text.                                               |
| `descriptions`  | Empty and missing-value text.                                                           |

Function entries receive typed arguments. For example, `numberField.rangeUnderflow(minimum)` and `rangeOverflow(maximum)` receive formatted bounds, while `pagination.range(start, end, total)` receives formatted counts.

:::

## API

### Exports

| Export           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `LocaleProvider` | Provides locale and message overrides to its descendants. |
| `LocaleMessages`, `LocaleOverrides` | Complete namespace contracts and partial override map. |

### Props

| Prop       | Type             | Default                       | Use                                                                                              |
| ---------- | ---------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `locale`   | `string`         | Parent provider, then `en-US` | BCP 47 language tag for built-in text and each component's locale-sensitive operations.          |
| `messages` | `LocaleOverrides`| Inherited overrides           | Partial object keyed by component namespace. Each namespace accepts partial message entries.     |

### Slots

| Slot      | Use                                                        |
| --------- | ---------------------------------------------------------- |
| `default` | Renders children without an extra DOM element or wrapper.  |

The provider has no models, events, or exposed methods. Existing component-specific message type exports remain available.

## Styling

The provider adds no element or styling hook. Child components retain their own tokens and supported overrides.
