<script setup lang="ts">
import SnackbarExample from './demos/SnackbarExample.vue'
import SnackbarLifetimeExample from './demos/SnackbarLifetimeExample.vue'
</script>

# Snackbar

Snackbars show short updates about app processes at the bottom of the screen. They can disappear or remain on screen until the user takes action. Use a snackbar for non-blocking status; use [Dialog](/components/dialog) when the user must make a decision.

## Examples

### Feedback and host placement

The demo shows plain, long, actionable, timed, queued, and keyed messages. Alignment, bottom offset, and the anchor control change where the single host places the notification. The timed message sets `inlineFeedback: true`; use a timeout only when the same information is also available in page content.

<div class="vp-raw yam3x-doc-demo-theme"><SnackbarExample /></div>

::: details View demo source

<<< ./demos/SnackbarExample.vue{vue}

:::

### Lifetime and keyboard shortcut

A provider can use a custom shortcut. This demo uses Alt+Shift+S to focus the active notification's action or close button, and shows a notification with no close button and no timer.

<div class="vp-raw yam3x-doc-demo-theme"><SnackbarLifetimeExample /></div>

::: details View demo source

<<< ./demos/SnackbarLifetimeExample.vue{vue}

:::

## Use in your app

`App.vue`:

```vue
<script setup lang="ts">
import { SnackbarProvider } from './components/yam3x/snackbar'
import SaveButton from './SaveButton.vue'
</script>

<template>
  <SnackbarProvider><SaveButton /></SnackbarProvider>
</template>
```

`SaveButton.vue`:

```vue
<script setup lang="ts">
import { useSnackbar } from './components/yam3x/snackbar'

const snackbar = useSnackbar()

async function save(): Promise<void> {
  const result = await snackbar.show({
    message: 'Changes saved',
    actionLabel: 'Undo',
    onAction: () => restoreChanges(),
  })
  if (result === 'action') refresh()
}

function discard(): void {
  snackbar.dismiss()
}
</script>

<template>
  <button
    type="button"
    @click="save"
  >
    Save
  </button>
  <button
    type="button"
    @click="discard"
  >
    Dismiss
  </button>
</template>
```

::: details Host configuration

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SnackbarProvider } from './components/yam3x/snackbar'

const anchor = ref<HTMLElement | null>(null)
</script>

<template>
  <SnackbarProvider
    alignment="start"
    :anchor="anchor"
    :bottom-offset="24"
    shortcut="Alt+Shift+S"
  >
    <button
      ref="anchor"
      type="button"
    >
      Anchor control
    </button>
  </SnackbarProvider>
</template>
```

Without an anchor, pass `bottom-offset` to clear fixed navigation bars or FABs.

:::

## Behavior and accessibility

### Timing and persistence

- Notifications with an action remain until the user activates it or closes the notification. Regular notifications persist by default.
- Set `timeoutMs` only with `inlineFeedback: true`. Values are clamped to 4–10 seconds.
- The timer pauses while the page is hidden or while the user hovers over or focuses the notification.
- `dismissible` defaults to `true` for notifications with an action or without a timeout. A timed inline-feedback notification defaults to `false`; set it explicitly to override.
- Messages appear in request order. A message with the same `key` updates the existing notification instead of adding another.

### Placement and anchoring

- `SnackbarProvider` gives its descendants a single host. The host accepts `alignment="center" | "start"` and `bottom-offset`.
- Pass an `HTMLElement` through a template ref to `anchor` to place the snackbar above a FAB or another element. The host keeps its 16px gap, and `bottom-offset` adds extra space above the anchor.
- If the anchor is missing, disconnected, or hidden, the host uses its viewport-bottom position.
- The host also moves above a focused page control when the two would overlap.
- The message wraps without clipping. A one-line snackbar is 48px high; a two-line snackbar is 64px high at compact widths and 68px at wider widths. If an action would leave less than 120px for the message, it moves below the message.

### Focus and keyboard

- Notifications do not steal focus. Press the provider's shortcut, Alt+G by default, to focus the current notification's action or close button.
- Press Escape to close a focused notification. `shortcut: null` disables the shortcut.
- After the notification closes, focus returns to the control that was focused before the shortcut moved it.
- The notification is announced as a `status` region with `aria-live="polite"` and `aria-atomic="true"`.

## API

### Exports

| Export                              | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `SnackbarProvider`                  | Host and queue for descendant notifications.     |
| `useSnackbar`                       | Returns the provider's `show` and `dismiss` API. |
| `SnackbarOptions`, `SnackbarResult` | Type exports for messages and results.           |

### `SnackbarProvider` props

| Prop           | Type                  | Default                | Description                                                                       |
| -------------- | --------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| `alignment`    | `'center' \| 'start'` | `'center'`             | Horizontal host alignment.                                                        |
| `anchor`       | `HTMLElement \| null` | —                      | Places the host above this element with a 16px gap.                               |
| `bottomOffset` | `number`              | `0`                    | Extra space above the viewport bottom or the anchor.                              |
| `shortcut`     | `string \| null`      | `'Alt+G'`              | Keyboard shortcut that focuses the current notification's action or close button. |
| `locale`       | `string`              | Provider, then `en-US` | Overrides the language of the default dismiss label.                              |

The provider renders its default slot and one host. Built-in text inherits from [LocaleProvider](/components/localization)'s `actions` namespace; notification-specific options take precedence.

### `SnackbarProvider` slots

| Slot      | Props | Description                                             |
| --------- | ----- | ------------------------------------------------------- |
| `default` | —     | App content whose descendants can call `useSnackbar()`. |

### `useSnackbar()` methods

| Method          | Returns                   | Description                                                                                          |
| --------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `show(options)` | `Promise<SnackbarResult>` | Queues a notification. Resolves to `action` when an action completes, or `dismissed` when it closes. |
| `dismiss()`     | `void`                    | Closes the current notification as `dismissed`.                                                      |

Without a `SnackbarProvider` ancestor, `useSnackbar()` throws.

### `SnackbarOptions`

| Field            | Type                          | Default                                                                       | Description                                                                                 |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `message`        | `string`                      | Required                                                                      | Notification text. An empty message throws.                                                 |
| `actionLabel`    | `string`                      | —                                                                             | Adds a trailing action. A notification with an action remains until the action or close.    |
| `onAction`       | `() => void \| Promise<void>` | —                                                                             | Runs when the action is activated. Its rejection rejects the `show()` promise.              |
| `dismissible`    | `boolean`                     | `true` with an action or without a timeout; `false` for timed inline feedback | Shows the close button.                                                                     |
| `dismissLabel`   | `string`                      | Localized `Dismiss notification`                                              | Accessible name of the close button.                                                        |
| `timeoutMs`      | `number`                      | —                                                                             | Auto-dismiss delay, clamped to 4000–10000ms. Requires `inlineFeedback: true`.               |
| `inlineFeedback` | `boolean`                     | `false`                                                                       | Confirms that the same information is available in page content. Required with `timeoutMs`. |
| `key`            | `string`                      | —                                                                             | Replaces an existing notification with the same key instead of queuing a new one.           |

When a notification omits `dismissLabel`, its close button follows the current language. Explicit `dismissLabel`, message, and action text retain their caller-provided values; changing language does not reset timers, queues, or pending actions.

### `SnackbarResult`

`SnackbarResult` is `'action' | 'dismissed'`.

## Styling

Snackbar has no public CSS override hooks. Color roles, shape, typography, elevation, and responsive geometry map Material system tokens, and spacing follows the System density scale. Use the provider props and options to change placement, timing, and content.

## Material references

[Snackbar overview](https://m3.material.io/components/snackbar/overview) · [guidelines](https://m3.material.io/components/snackbar/guidelines) · [specs](https://m3.material.io/components/snackbar/specs) · [accessibility](https://m3.material.io/components/snackbar/accessibility)
