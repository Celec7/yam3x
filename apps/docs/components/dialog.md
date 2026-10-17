<script setup lang="ts">
import DialogExample from './demos/DialogExample.vue'
</script>

# Dialogs

Dialogs interrupt the current flow to present important content or a decision. Reserve them for tasks that need focused attention, and give the title and actions clear names.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <DialogExample />
</div>

::: details View demo source

<<< ./demos/DialogExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from './components/yam3x/dialog'

const open = ref(false)
</script>

<template>
  <button
    type="button"
    @click="open = true"
  >
    Review draft
  </button>
  <Dialog
    v-model:open="open"
    title="Review draft?"
    description="Continue reviewing this draft."
  >
    <template #actions>
      <button
        type="button"
        @click="open = false"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="open = false"
      >
        Continue
      </button>
    </template>
  </Dialog>
</template>
```

## API

| Prop                    | Type                           | Default  | Description                                                                                                                                        |
| ----------------------- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                  | `v-model:open: boolean`        | `false`  | Controls visibility.                                                                                                                               |
| `returnValue`           | `v-model:return-value: string` | `''`     | Records the result of a complete, cancel, or close action. You can also call `close(value)` through the component ref to close and set the result. |
| `title`                 | `string`                       | Required | Dialog title and accessible name.                                                                                                                  |
| `description`           | `string`                       | —        | Optional description associated with the dialog.                                                                                                   |
| `showCloseButton`       | `boolean`                      | `false`  | Shows the project close button. It is independent of Escape and outside-click dismissal.                                                           |
| `dismissOnEscape`       | `boolean`                      | `true`   | Allows Escape to close the dialog.                                                                                                                 |
| `dismissOnClickOutside` | `boolean`                      | `true`   | Allows a click outside the dialog to close it.                                                                                                     |
| `closeLabel`            | `string`                       | `Close`  | Accessible name of the close button.                                                                                                               |

## Behavior and accessibility

Use the default slot for additional dialog content. Customize the title and close icon with `#title` and `#close-icon`; optional `#icon` and `#divider` slots provide basic-dialog anatomy, and `#actions` holds up to two actions. Use text buttons for actions. With two actions, place the dismissive action before the confirming action so confirmation is at the trailing edge; a single action is for acknowledgement. When `#icon` is present, center the icon, title, and supporting description; without it, align the title and description to the start. Lifecycle events are `opening`, `opened`, `cancel`, `closing`, and `closed`; call `preventDefault()` on `opening`, `cancel`, or `closing` to cancel the corresponding transition. The dialog always uses the `alertdialog` role, traps focus, and prevents background scrolling. On close, focus returns to the trigger. Escape and outside-click dismissal are enabled by default and can be controlled separately. Keep the title short and describe the decision; label action buttons with clear verbs.

The project implementation caps dialog height at 560px, further limited by viewport height. Material specifies dynamic height but does not define this desktop maximum.

## Material references

[Dialogs overview](https://m3.material.io/components/dialogs/overview) · [guidelines](https://m3.material.io/components/dialogs/guidelines) · [specs](https://m3.material.io/components/dialogs/specs) · [accessibility](https://m3.material.io/components/dialogs/accessibility)
