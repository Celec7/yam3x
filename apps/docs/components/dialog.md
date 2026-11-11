<script setup lang="ts">
import DialogExample from './demos/DialogExample.vue'
import DialogVariantsExample from './demos/DialogVariantsExample.vue'
import DialogFormExample from './demos/DialogFormExample.vue'
</script>

# Dialogs

`Dialog` is the project implementation of the Material 3 Expressive basic dialog. It presents a modal surface for a decision or for information that needs acknowledgement. The component is always modal, uses the `alertdialog` role, and does not provide a non-modal or full-screen variant.

Use a dialog when the task must interrupt the current flow; prefer [Side sheet](/components/side-sheet) or [Navigation drawer](/components/navigation-drawer) when the content can stay open beside the page.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><DialogExample /></div>

::: details View demo source

<<< ./demos/DialogExample.vue{vue}

:::

A basic dialog needs `title` plus at least one way to close it. `description` adds supporting text, `#divider` separates the body, and `#actions` holds the decision buttons. The demo closes with `close(value)` so the accepted result remains observable, and the event log shows the lifecycle order.

### Variants

<div class="vp-raw yam3x-doc-demo-theme"><DialogVariantsExample /></div>

::: details View demo source

<<< ./demos/DialogVariantsExample.vue{vue}

:::

The icon dialog adds `#icon` and a project close button. The urgent alert keeps `dismissOnEscape` off while allowing outside dismissal, and the review dialog does the opposite. Each dismissal path is independent.

### Composition

<div class="vp-raw yam3x-doc-demo-theme"><DialogFormExample /></div>

::: details View demo source

<<< ./demos/DialogFormExample.vue{vue}

:::

The default slot carries dialog content. Here a [Form field](/components/form-field) and [Select](/components/select) choose an installation source while the dialog keeps focus inside the modal surface. A popup opened from dialog content layers above the dialog.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from './components/yam3x/button'
import { Dialog } from './components/yam3x/dialog'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">Review draft</Button>
  <Dialog
    v-model:open="open"
    title="Review draft?"
    description="Continue reviewing this draft."
  >
    <template #actions>
      <Button
        variant="text"
        @click="open = false"
      >
        Cancel
      </Button>
      <Button
        variant="text"
        @click="open = false"
      >
        Continue
      </Button>
    </template>
  </Dialog>
</template>
```

::: details Return values, icons, and form content

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from './components/yam3x/button'
import { Dialog } from './components/yam3x/dialog'
import { Icon } from './components/yam3x/icon'

const open = ref(false)
const returnValue = ref('')
const dialog = ref<InstanceType<typeof Dialog> | null>(null)
</script>

<template>
  <Dialog
    v-model:open="open"
    v-model:return-value="returnValue"
    title="Delete workspace?"
    description="This action can be undone later."
    show-close-button
    close-label="Close delete dialog"
  >
    <template #icon><Icon name="warning" /></template>
    <p>Archived workspaces can be restored from the administration panel.</p>
    <template #actions>
      <Button
        variant="text"
        @click="dialog?.close('cancelled')"
      >
        Cancel
      </Button>
      <Button
        variant="text"
        @click="dialog?.close('deleted')"
      >
        Delete
      </Button>
    </template>
  </Dialog>
</template>
```

`close(value)` closes through the same cancellation checks as user dismissal and stores the accepted value in `returnValue`.

:::

## Behavior and accessibility

### Focus and dismissal

- Opening a dialog moves focus into the surface and traps it there. Closing restores focus to the element that opened the dialog.
- Escape and outside pointer input dismiss by default. `dismissOnEscape` and `dismissOnClickOutside` control each path separately.
- `showCloseButton` renders a separate 48 px close target. It is independent of both dismissal props and uses the localized `close` action unless `closeLabel` overrides it.
- The surface is an `alertdialog` named by its title and described by `description`. Background content cannot be scrolled while a dialog is open.
- Reduced motion removes spatial movement while keeping the visible open state; forced colors keep the dialog boundary and focus ring.

### Forms

Dialog content keeps native form behavior. The dialog does not create a form, submit values, or add fields. Put the form inside the default slot; its controls, validation, reset, and submission continue to work normally. A dialog action that submits must use the form's own submit control or call the application's submit handler.

### Layering and nested dialogs

- A newly opened dialog reserves a higher overlay layer than earlier dialogs, so a dialog opened above another remains on top and lower popups close.
- Each open dialog is a separate modal surface: it traps focus, locks page scrolling, and restores focus on close. Close the outer dialog when its task ends; do not leave an inactive dialog open behind another.
- A popup opened from dialog content, such as a Select panel, is placed above the dialog it belongs to.

### Responsive and RTL

- The surface is at least 280 px wide and at most 560 px wide, limited by the viewport with 24 px inset. It is centered in the viewport at every width.
- Height is capped at 560 px and further limited by the viewport. The body scrolls while the header and actions remain visible.
- The close target stays inside the dialog bounds at narrow widths. Text can wrap, and actions wrap instead of overflowing.
- The dialog follows the document's writing direction; header alignment, action order, and the close target position mirror in RTL.
- With an icon, the icon, title, and supporting description are centered; without one, the title and description align to the start.

### State ownership

`open` and `returnValue` are models owned by the application when bound. The component does not store a second visibility or result state. Bind both the value and update handler, normally with `v-model`, to observe and control the dialog. A canceled `cancel` or `closing` event leaves the dialog open; a direct `open` change is treated as accepted state.

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `closeLabel` take precedence; without a provider, the locale defaults to `en-US`.

### Exports

| Export   | Description                                       |
| -------- | ------------------------------------------------- |
| `Dialog` | The modal surface, focus behavior, and lifecycle. |

### Props and models

| Prop and model          | Type                           | Default            | Use                                               |
| ----------------------- | ------------------------------ | ------------------ | ------------------------------------------------- |
| `open`                  | `v-model:open: boolean`        | `false`            | Controls visibility.                              |
| `returnValue`           | `v-model:return-value: string` | `''`               | Result written by `close(value)`.                 |
| `title`                 | `string`                       | Required           | Visible title and accessible dialog name.         |
| `description`           | `string`                       | Undefined          | Supporting text associated with the dialog.       |
| `showCloseButton`       | `boolean`                      | `false`            | Shows the separate project close target.          |
| `dismissOnEscape`       | `boolean`                      | `true`             | Allows Escape to close the dialog.                |
| `dismissOnClickOutside` | `boolean`                      | `true`             | Allows outside pointer input to close the dialog. |
| `closeLabel`            | `string`                       | Localized `Close`  | Accessible name of the close target.              |
| `locale`                | `string`                       | Provider → `en-US` | Language of built-in interface text.              |

### Events

| Event     | Payload | Use                                                                                |
| --------- | ------- | ---------------------------------------------------------------------------------- |
| `opening` | `Event` | Before the dialog opens. A direct `open` model change emits a notification.        |
| `opened`  | `Event` | After the open transition and focus placement.                                     |
| `cancel`  | `Event` | Cancelable, before Escape dismissal. Call `preventDefault()` to keep it open.      |
| `closing` | `Event` | Before the dialog closes. Cancelable for Escape, outside dismissal, and `close()`. |
| `closed`  | `Event` | After the close transition and focus return.                                       |

A direct `open` model change emits `opening` or `closing` as a notification and then `opened` or `closed`. Dismissal paths and `close()` emit a cancelable `closing`; a prevented close emits no `closed` event.

### Slots

| Slot         | Use                                                                 |
| ------------ | ------------------------------------------------------------------- |
| `default`    | Dialog body content. Omitted when empty.                            |
| `title`      | Replaces the title content while preserving the heading element.    |
| `icon`       | Adds supporting icon media and centers the header content.          |
| `close-icon` | Replaces the icon inside the project close target.                  |
| `divider`    | Adds a divider between the body and actions, for example `Divider`. |
| `actions`    | Holds up to two text actions; the confirming action goes last.      |

### Methods

Access these through a template ref.

| Method          | Returns  | Use                                                                          |
| --------------- | -------- | ---------------------------------------------------------------------------- |
| `close(value?)` | `void`   | Closes the dialog, stores `value` in `returnValue`, and honors cancellation. |
| `returnValue`   | `string` | Exposed model value; prefer `v-model:return-value`.                          |

## Styling

`Dialog` defines no public `--yam3x-*` styling properties. Color, shape, elevation, and type come from Material system roles; width, padding, and the desktop height cap are project measurements.

::: details System roles and measured geometry

- Surface: `surface-container-high`; text: `on-surface`; supporting text: `on-surface-variant`; focus and close ring: `secondary`; divider: `outline`; backdrop: `scrim`.
- Shape: `corner-extra-large`; elevation: level 3; title: Headline Small; supporting text: Body Medium; body: Body Large.
- The project close target is 48 px with a 24 px icon, a 40 px state layer, and an inset 3 px `secondary` focus ring.
- Viewport inset, header gap, body gap, action gap, and action inset use the density spacing scale. The demo and API describe the resulting geometry rather than separate per-dialog overrides.
- Reduced motion removes the fade and spatial transition; forced colors add a `CanvasText` dialog border and a `Highlight` focus ring.

:::

## Material references

[Dialogs overview](https://m3.material.io/components/dialogs/overview) · [guidelines](https://m3.material.io/components/dialogs/guidelines) · [specs](https://m3.material.io/components/dialogs/specs) · [accessibility](https://m3.material.io/components/dialogs/accessibility)
