<script setup lang="ts">
import InlineMessageExample from './demos/InlineMessageExample.vue'
import InlineMessageCompactExample from './demos/InlineMessageCompactExample.vue'
</script>

# Inline message

`InlineMessage` presents persistent feedback beside the content it concerns. Use it for information, caution, or a recoverable error that should stay in the reading flow; use a Snackbar for temporary feedback and a Dialog when a response must interrupt the current task.

InlineMessage is a project extension. Material 3 Expressive does not define a standalone Inline message component; the closest Compose Material 3 composition is a `Surface` or `Card` containing a `Row` of `Icon`, `Text`, and optional `TextButton` or `IconButton` actions. The tone mapping, title role, and dismissal behavior are project decisions.

## Examples

### Tones, announcement, and dismissal

<div class="vp-raw yam3x-doc-demo-theme"><InlineMessageExample /></div>

::: details View demo source

<<< ./demos/InlineMessageExample.vue{vue}

:::

The demo pairs a static info message, a warning with a level-2 title, and a polite error with a retry action and dismiss control. Retrying closes the error and inserts a polite success message. Dismissing the error returns focus to the Show save error button, and the component does not mark the underlying save problem resolved.

### Compact messages and appearance

<div class="vp-raw yam3x-doc-demo-theme"><InlineMessageCompactExample /></div>

::: details View demo source

<<< ./demos/InlineMessageCompactExample.vue{vue}

:::

A message can omit its title, icon, and actions. The compact forms keep only the body, or pair a body with a text action, while the final message overrides the container color, foreground, and corner shape together.

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

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

The default slot is the message body. Use `#actions` for recovery buttons or links, and `#icon` to replace the tone icon. `v-model:open` controls visibility and defaults to `true`; without a binding the component owns the open state.

::: details Dismissal with a focus destination

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { InlineMessage } from './components/yam3x/inline-message'
import { Button } from './components/yam3x/button'

const open = ref(true)
const trigger = ref<HTMLButtonElement | null>(null)
</script>

<template>
  <InlineMessage
    v-model:open="open"
    title="Export failed"
    tone="error"
    announcement="polite"
    dismissible
    dismiss-label="Dismiss export error"
    :dismiss-focus="() => trigger"
  >
    The file was not created. Try the export again.
  </InlineMessage>
  <Button
    ref="trigger"
    variant="outlined"
    @click="open = true"
  >
    Show export error
  </Button>
</template>
```

Return focus to the control that can repeat the failed task. When adjacent content may be removed together with the message, provide an explicit destination.

:::

## Behavior and accessibility

### Tone and announcement

- `tone="info"`, `success`, and `warning` use Surface Container with On Surface content. Their meaning comes from the text and optional icon, not hue alone.
- `tone="error"` uses Error Container with On Error Container.
- `announcement="off"` adds no live role. `polite` uses `status`, and `assertive` uses `alert`; both set `aria-atomic="true"`.
- Tone and urgency are independent. A static error can stay silent, while a non-error update can be announced. Live roles are reliable for messages inserted or updated after load, not for content present at first render.
- The default tone icon is decorative and hidden from assistive technology. The text must carry the meaning.

### Dismissal and focus

- `dismissible` adds a separate 48 px IconButton with a tooltip and an accessible name. The default label comes from the localized `actions.dismissMessage` text; `dismissLabel` overrides it.
- Dismissing sets `open` to false and emits `dismiss`. It does not mark the underlying condition resolved.
- If dismissal removes focus, focus moves to `dismissFocus()` or to the containing element. The fallback receives a temporary programmatic focus target without entering the Tab order.
- If application code already moved focus elsewhere, the component preserves that focus. Closing an unrelated message does not move focus.
- There is no timeout and no focus movement on appearance.

### Actions

- `#actions` sits below the text and wraps. Use it for recovery, retry, or a link to more detail.
- Enabled Text Button actions and the dismiss IconButton inherit the message foreground. Filled, tonal, outlined, and elevated actions keep their own Button colors.
- Keep field-level errors with their fields; an Inline message can summarize a wider failure without replacing local validation.

### Content and density

- The message grows with its content, wraps, and inherits its region's width. It does not add page-level margins.
- There is no separate compact variant prop. Omit the title, icon, or actions for a shorter message; shared density spacing controls padding and gaps.
- The leading symbol is aligned with the first line using a fixed 2 px block offset that does not scale with density.

### RTL and narrow layouts

- Text, icon, and actions follow the writing direction. Actions wrap below the text when the region is narrow.
- The dismiss target stays separate from the actions in either direction.
- Long words wrap without widening the page, and the message keeps its reading order when text enlarges.

### State ownership

- `open` is a model defaulting to true. Bind it when the application needs to show, hide, or replace the message.
- The application owns the condition and its resolution, the result of an action, and any announcement policy for repeated updates.

## API

Built-in interface text inherits [LocaleProvider](/components/localization)'s `actions` namespace. `locale` overrides the language, defaulting to the provider then `en-US`; `dismissLabel` overrides the dismiss action name.

### Exports

| Export          | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `InlineMessage` | Persistent message with tone, actions, and optional dismissal. |

### Props and models

| Prop           | Default                | Use                                                                                   |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `title`        | Empty                  | Optional short title, using Title Small.                                              |
| `headingLevel` | `3`                    | Semantic level, 1–6, for the optional title. Override it for the surrounding outline. |
| `tone`         | `info`                 | `info`, `success`, `warning`, or `error`.                                             |
| `announcement` | `off`                  | `off` has no live role; `polite` uses `status`; `assertive` uses `alert`.             |
| `icon`         | Tone icon              | Material Symbol name, or `false` to omit it.                                          |
| `dismissible`  | `false`                | Shows a separate dismiss action.                                                      |
| `dismissLabel` | Localized default      | Accessible name of the dismiss action; localize it.                                   |
| `dismissFocus` | Containing element     | Function returning a nearby focus destination after focused content is dismissed.     |
| `locale`       | Provider, then `en-US` | Language of the default dismiss label.                                                |
| `open`         | `true`                 | Visibility model; supports `v-model:open`.                                            |

### Events

| Event     | Payload | Use                                                        |
| --------- | ------- | ---------------------------------------------------------- |
| `dismiss` | —       | The dismiss action requested closure. `open` is now false. |

### Slots

| Slot      | Use                                               |
| --------- | ------------------------------------------------- |
| `default` | Message content; required in practice.            |
| `icon`    | Replaces the decorative leading icon.             |
| `actions` | Recovery or follow-up controls below the message. |

### Methods

InlineMessage exposes no instance methods. Close it through `v-model:open`.

## Styling

InlineMessage exposes three project-defined custom properties. Override the color pair together to preserve contrast. The message uses a Medium corner role by default and inherits its region width.

| Property                                 | Default                                          | Use                                        |
| ---------------------------------------- | ------------------------------------------------ | ------------------------------------------ |
| `--yam3x-inline-message-container-color` | Surface Container, or Error Container for errors | Container fill.                            |
| `--yam3x-inline-message-content-color`   | On Surface, or On Error Container for errors     | Foreground for text and inherited actions. |
| `--yam3x-inline-message-shape`           | System medium corner                             | Corner radius.                             |

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Color roles](https://m3.material.io/styles/color/roles) · [WAI-ARIA alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) · [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines)
