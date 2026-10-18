<script setup lang="ts">
import FormExample from './demos/FormExample.vue'
</script>

# Form

`Form` is a project extension that coordinates native validation, an optional validation adapter, submission, and recovery. Applications own their values and rules; inputs own editing and parsing. `FormSection` groups related fields with a native fieldset and legend.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><FormExample /></div>

::: details View demo source

<<< ./demos/FormExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormSection, type FormContext } from './components/yam3x/form'
import { FormField } from './components/yam3x/form-field'
import { Button } from './components/yam3x/button'
const email = ref('')
async function save({ data, signal }: FormContext) {
  const response = await fetch('/api/settings', { method: 'POST', body: data, signal })
  if (!response.ok)
    return { status: 'error' as const, message: 'Settings could not be saved. Try again.' }
  return { status: 'success' as const }
}
</script>

<template>
  <Form
    :submit="save"
    @reset="email = ''"
  >
    <template #instructions>Fields marked * are required.</template>
    <template #default="{ fieldErrors }">
      <FormSection title="Contact">
        <FormField
          label="Email"
          :error="fieldErrors.email"
        >
          <input
            v-model="email"
            name="email"
            type="email"
            required
          />
        </FormField>
      </FormSection>
    </template>
    <template #actions="{ pending }">
      <Button
        type="submit"
        :disabled="pending"
        >Save settings</Button
      >
      <Button
        type="reset"
        variant="text"
        >Reset</Button
      >
    </template>
  </Form>
</template>
```

## API

Built-in UI text can inherit shared [LocaleProvider](/components/localization) configuration. Explicit `locale` and `messages` take precedence; without a provider, the locale defaults to `en-US`.

| Form prop             | Default            | Use                                                                                                                |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `submit`              | Required           | `(context) => result` or a promise; invoked only after validation succeeds.                                        |
| `validate`            | None               | Optional `(context) => validation` or a promise for application rules.                                             |
| `locale`              | Provider → `en-US` | English or Chinese built-in feedback; other locales use English unless overridden.                                 |
| `summaryHeadingLevel` | `2`                | Error-summary heading level, 1–6, chosen for the surrounding page.                                                 |
| `messages`            | English or Chinese | Override `summary`, `validating`, `submitting`, `success`, `failure`, `validationFailure`, `changed`, and `field`. |

`FormContext` contains `form`, a `data` FormData snapshot, the native `submitter` or null, and an AbortSignal. Read `data` for the attempted submission rather than rereading live controls later. Named submitter values are included. Native attributes such as `id` apply to the form root; this coordinator handles submission instead of navigating to an `action` URL.

`validate` returns nothing when valid, or `{ fieldErrors?: Record<string, string>, message?: string }`. Keys match native field names. `submit` returns nothing or `{ status: 'success', message? }` on success; expected rejection returns `{ status: 'error', message, fieldErrors? }`. Localize adapter messages in the application. Exceptions produce generic visible recovery feedback; raw exceptions remain in the diagnostic event rather than in the page.

Events: `invalid({ issues, message })` reports a failed validation or submission summary; each issue contains `name`, `label`, and `message`. `success(context)` reports an accepted result. `failure(detail)` distinguishes `kind: 'rejected'` with `result` and `context`, from `kind: 'exception'` with `error`, `phase`, and optional `context`. Phases are `preparation`, `validation`, or `submission`; preparation failures can precede creation of the context. `outdated({ context, phase, error? })` reports a discarded result. `reset(event)` lets the application restore its model snapshot or cancel native reset with `preventDefault()`.

The default slot receives `{ fieldErrors, pending, status }`. Bind adapter errors to each input's existing error presentation, such as `FormField.error` or `NumberField.error`. Native constraint errors remain owned by their controls and use the browser’s language; `messages` only changes coordinator copy. `#instructions` precedes the summary and fields; `#actions` follows the fields and receives `{ pending, status }`. Status is `idle`, `validating`, `submitting`, `error`, or `success`.

Component refs expose `element`, `requestSubmit(submitter?)`, `reset()`, `invalidate()`, and `focusField(name)`. Use `requestSubmit()` for programmatic submission so inputs can commit their drafts. `focusField` returns whether it found a visible focus target. Call `invalidate()` after programmatic model changes that do not dispatch edit events; final DOM-value checks also reject changed snapshots.

| FormSection prop | Default  | Use                                                                        |
| ---------------- | -------- | -------------------------------------------------------------------------- |
| `title`          | Required | Group name, rendered as a legend with Title Medium.                        |
| `description`    | Empty    | Body Medium explanation before the controls, associated with the fieldset. |
| `disabled`       | `false`  | Native fieldset disabled state.                                            |

`FormSection`'s default slot contains the fields. Root attributes and existing `aria-describedby` associations are preserved.

## Behavior and accessibility

For error notification and recovery, follow [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).

The form uses `novalidate` and checks native constraints itself, exposing local errors and a linked error summary without a competing browser validation popup. Untouched required fields are not reported by Form before the first submission. Inputs commit editing before the coordinator takes its snapshot. Native labels and the focus targets of Select and Number field are used in the summary. Hidden, inert, disabled, or closed content is never an error-link focus destination; unavailable fields remain explanatory text.

Adapter errors clear when editing invalidates their result and are rechecked at the next submission. Native errors update after an exposed error is corrected. A failed submission focuses the summary when focus still belongs to this form; it does not pull focus back from unrelated content. Error links focus their current targets. Keep each field's local error in its existing presentation rather than adding a second label or error below it.

Pending work has visible status and an internal duplicate-submission guard. Bind `pending` to submit controls for visible affordance; the component does not disable or erase the input values. Editing, reset, or `invalidate()` requests cancellation, and older results cannot replace current field feedback. The guard remains until the adapter settles, even after cancellation. Adapters should settle promptly when their signal is aborted and own network timeouts and idempotency. An abort does not prove server rollback; an obsolete submission produces a notice to check the earlier result before retrying. Handle `outdated` when the application needs to refresh saved data.

Native reset restores native defaults; project inputs retain their own reset contracts. Use `@reset` to restore application-owned Vue models, as in the example. Reset clears form feedback without inventing a rollback for pending server work. Use a different Vue `key` when loading a different record to establish a new form session and input reset baseline. Hidden fields keep their values unless the application removes them; the form does not generate or own the data model.

## Styling

The form inherits its background. Direct fields use 16 px gaps; section groups use 24 px gaps. Instructions and action groups wrap, and field content determines height. Each input keeps its own typography and geometry. Use root classes to arrange related short fields in columns while preserving DOM reading and focus order.

## Material references

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
