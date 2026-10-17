<script setup lang="ts">
import SnackbarExample from './demos/SnackbarExample.vue'
</script>

# Snackbar

Snackbars give brief, non-blocking feedback about an action or process. Keep the message concise and make any optional action clear.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><SnackbarExample /></div>

::: details View demo source

<<< ./demos/SnackbarExample.vue{vue}

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
function save(): void {
  void snackbar.show({ message: 'Changes saved' })
}
</script>

<template>
  <button
    type="button"
    @click="save"
  >
    Save
  </button>
</template>
```

## API

`SnackbarProvider` gives its descendants a single host. Messages appear in request order; a message with the same `key` updates the existing notification. The full message wraps without clipping; keep it concise enough to fit the recommended two lines on compact layouts. A one-line snackbar is 48px high; a two-line snackbar is 64px high at compact widths and 68px at wider widths. If an action would leave less than 120px for the message, it moves below the message. `show()` returns a Promise that resolves to `action` when an action completes or `dismissed` when the notification is closed. Notifications do not steal focus. Press **Alt+G** to focus the current notification’s action or close button, and Escape to close a focused notification.

## Behavior and accessibility

Notifications with an action remain until the user activates it or closes the notification. Regular notifications persist by default. Set `timeoutMs` to 4–10 seconds and `inlineFeedback: true` only when the same information is also available in page content. The timer pauses while the page is hidden or while the user hovers over or focuses the notification.

The host accepts `alignment="center" | "start"`, `anchor`, and `bottom-offset`. Pass an `HTMLElement` through a template ref to `anchor` to place the snackbar above a FAB or another element. The host keeps its 16px gap, and `bottom-offset` adds extra space above the anchor. If the anchor is missing, disconnected, or hidden, the host uses its viewport-bottom position. Without an anchor, use `bottom-offset` to avoid fixed navigation bars or FABs.

## Material references

[Snackbar overview](https://m3.material.io/components/snackbar/overview) · [guidelines](https://m3.material.io/components/snackbar/guidelines) · [specs](https://m3.material.io/components/snackbar/specs) · [accessibility](https://m3.material.io/components/snackbar/accessibility)
