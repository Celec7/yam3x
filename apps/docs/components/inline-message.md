<script setup lang="ts">
import InlineMessageExample from './demos/InlineMessageExample.vue'
</script>

# Inline message

`InlineMessage` is a project extension for persistent feedback beside the relevant content. Use a Snackbar for temporary feedback, and a Dialog when a response must interrupt the current task.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><InlineMessageExample /></div>

::: details View demo source

<<< ./demos/InlineMessageExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { InlineMessage } from './components/yam3x/inline-message'
</script>

<template>
  <InlineMessage
    title="Changes are not saved"
    tone="error"
    announcement="polite"
  >
    Your edits are still here. Check your connection, then try saving again.
  </InlineMessage>
</template>
```

## API

| Prop           | Default            | Use                                                                               |
| -------------- | ------------------ | --------------------------------------------------------------------------------- |
| `title`        | Empty              | Optional short title, using Title Small.                                          |
| `tone`         | `info`             | `info`, `success`, `warning`, or `error`.                                         |
| `announcement` | `off`              | `off` has no live role; `polite` uses `status`; `assertive` uses `alert`.         |
| `icon`         | Tone icon          | Material Symbol name, or `false` to omit it.                                      |
| `dismissible`  | `false`            | Show a separate dismiss action.                                                   |
| `dismissLabel` | `Dismiss message`  | Accessible name of the dismiss action; localize it.                               |
| `dismissFocus` | Containing element | Function returning a nearby focus destination after focused content is dismissed. |

`v-model:open` controls visibility and defaults to `true`. Without a binding, the component owns visibility. `dismiss()` is emitted after the dismiss action requests closure. Closing a message does not mark the underlying condition resolved.

The required default slot contains the message. `#icon` replaces the decorative icon; `#actions` contains your buttons or links. Actions are placed below the text and wrap; enabled text buttons in the actions area inherit the message foreground. Attributes, including `class`, `style`, and `id`, apply to the message root.

## Behavior and accessibility

For urgent announcements, follow the [WAI alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/).

There is no timeout or automatic focus on appearance. Tone and announcement urgency are independent: a static error can have no live role, while a non-error update can be announced. Choose announcement urgency for each event and avoid repeated announcements for routine progress updates. Live roles apply to dynamically inserted or updated messages; a message present at initial page load is not reliably announced by assistive technology.

When closing removes the focused content, focus returns to `dismissFocus()`, or to the containing element when no destination is supplied. The fallback receives a temporary programmatic focus target without entering the Tab sequence. If application code has already moved focus elsewhere, the component preserves that focus. Closing an unrelated message leaves focus alone. Keep an explicit nearby destination when the message or its parent may be removed together.

Information, success, and caution use Surface Container / On Surface; their text and icons express meaning. Errors use Error Container / On Error Container. The icon is decorative, so the message text must explain its meaning. Field-level errors remain with their fields.

## Styling

Supported overrides: `--yam3x-inline-message-container-color`, `--yam3x-inline-message-content-color`, and `--yam3x-inline-message-shape`. Override color pairs together to preserve contrast. The message grows with content and inherits its containing region's width.

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Color roles](https://m3.material.io/styles/color/roles) · [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines)
