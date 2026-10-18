<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useId,
} from 'vue'
import InlineMessage from '../inline-message/inline-message.vue'
import Heading from '../heading/heading.vue'
import {
  adapterIssues,
  focusTarget,
  formControls,
  formSignature,
  isFormEdit,
  nativeIssues,
  type InternalFormIssue,
} from './form.utils'
import type {
  FormContext,
  FormFailure,
  FormIssue,
  FormMessages,
  FormPhase,
  FormStatus,
  FormSubmitResult,
  FormValidation,
} from './form.types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    submit: (context: FormContext) => FormSubmitResult | void | Promise<FormSubmitResult | void>
    validate?: (context: FormContext) => FormValidation | void | Promise<FormValidation | void>
    locale?: string
    summaryHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6
    messages?: Partial<FormMessages>
  }>(),
  { validate: undefined, locale: undefined, summaryHeadingLevel: 2, messages: undefined },
)
const emit = defineEmits<{
  invalid: [detail: { issues: FormIssue[]; message: string }]
  success: [context: FormContext]
  failure: [detail: FormFailure]
  outdated: [detail: { context: FormContext; phase: FormPhase; error?: unknown }]
  reset: [event: Event]
}>()
defineSlots<{
  default(scope: {
    fieldErrors: Readonly<Record<string, string>>
    pending: boolean
    status: FormStatus
  }): unknown
  instructions?(): unknown
  actions?(scope: { pending: boolean; status: FormStatus }): unknown
}>()
const attrs = useAttrs()
const form = ref<HTMLFormElement>()
const summary = ref<HTMLElement>()
const uid = useId().replace(/:/g, '')
const headingId = `yam3x-form-summary-${uid}`
const issues = shallowRef<InternalFormIssue[]>([])
const message = ref('')
const notice = ref('')
const successMessage = ref('')
interface FormOperation {
  context: FormContext
  phase: FormPhase
  revision: number
  signature: string
  controller: AbortController
}
const active = shallowRef<FormOperation | null>(null)
let revision = 0
let starting = false
let attempted = false
let disposed = false
let generatedId = 0
const pending = computed(() => active.value !== null)
const hasErrors = computed(() => issues.value.length > 0 || Boolean(message.value))
const fieldErrors = computed<Readonly<Record<string, string>>>(() =>
  Object.fromEntries(
    issues.value
      .filter((issue) => issue.source === 'adapter')
      .map((issue) => [issue.name, issue.message]),
  ),
)
const status = computed<FormStatus>(() =>
  active.value
    ? active.value.phase === 'validation'
      ? 'validating'
      : 'submitting'
    : hasErrors.value
      ? 'error'
      : successMessage.value
        ? 'success'
        : 'idle',
)
const { messages } = useComponentLocale(
  'form',
  () => props.locale,
  () => props.messages,
)
function invalidate() {
  revision++
  active.value?.controller.abort()
  issues.value = issues.value.filter((issue) => issue.source === 'native')
  message.value = ''
  successMessage.value = ''
}
function onEdit(event: Event) {
  if (!form.value || !isFormEdit(form.value, event.target)) return
  invalidate()
  void nextTick(() => {
    if (attempted && form.value) issues.value = nativeIssues(form.value, messages.value.field)
  })
}
function onInteraction(event: Event) {
  if (!active.value || !form.value || !isFormEdit(form.value, event.target)) return
  void nextTick(() => {
    const operation = active.value
    if (
      operation &&
      !operation.controller.signal.aborted &&
      formSignature(operation.context.form) !== operation.signature
    )
      onEdit(event)
  })
}

function current(operation: FormOperation) {
  return (
    !disposed &&
    !operation.controller.signal.aborted &&
    operation.revision === revision &&
    formSignature(operation.context.form) === operation.signature
  )
}
function targetFor(issue: InternalFormIssue) {
  return form.value ? focusTarget(form.value, issue.control) : undefined
}
function linkFor(issue: InternalFormIssue) {
  const target = targetFor(issue)
  if (!target) return undefined
  if (!target.id) target.id = `yam3x-form-control-${uid}-${++generatedId}`
  return `#${target.id}`
}
function focusIssue(issue: InternalFormIssue) {
  targetFor(issue)?.focus()
}
function focusField(name: string) {
  if (!form.value) return false
  const target = focusTarget(
    form.value,
    formControls(form.value).find((control) => control.name === name),
  )
  target?.focus()
  return Boolean(target)
}
async function showInvalid() {
  emit('invalid', {
    issues: issues.value.map(({ name, label, message }) => ({ name, label, message })),
    message: message.value,
  })
  await nextTick()
  const activeElement = form.value?.ownerDocument.activeElement
  if (
    form.value &&
    (!activeElement ||
      activeElement === form.value.ownerDocument.body ||
      isFormEdit(form.value, activeElement))
  )
    summary.value?.focus()
}
async function onSubmit(event: SubmitEvent) {
  event.preventDefault()
  if (starting || active.value || !form.value) return
  starting = true
  const expectedRevision = revision
  attempted = true
  issues.value = []
  message.value = ''
  notice.value = ''
  successMessage.value = ''
  let operation: FormOperation | undefined
  try {
    // Inputs commit their editing state in form capture listeners before this bubble handler.
    await nextTick()
    if (disposed || revision !== expectedRevision || !form.value) return
    const element = form.value
    element.checkValidity()
    issues.value = nativeIssues(element, messages.value.field)
    if (issues.value.length) {
      await showInvalid()
      return
    }
    const submitter = event.submitter
    const data = submitter ? new FormData(element, submitter) : new FormData(element)
    const controller = new AbortController()
    const context: FormContext = { form: element, data, submitter, signal: controller.signal }
    operation = {
      context,
      controller,
      revision,
      signature: formSignature(element),
      phase: 'validation',
    }
    active.value = operation
    const validation = await props.validate?.(context)
    if (!current(operation)) {
      reportOutdated(operation)
      return
    }
    issues.value = adapterIssues(element, validation?.fieldErrors, messages.value.field)
    message.value = validation?.message ?? ''
    if (hasErrors.value) {
      await showInvalid()
      return
    }
    operation.phase = 'submission'
    active.value = { ...operation }
    const result = await props.submit(context)
    if (!current(operation)) {
      reportOutdated(operation)
      return
    }
    if (result?.status === 'error') {
      issues.value = adapterIssues(element, result.fieldErrors, messages.value.field)
      message.value = result.message
      emit('failure', { kind: 'rejected', result, context })
      await showInvalid()
    } else {
      successMessage.value = result?.message ?? messages.value.success
      emit('success', context)
    }
  } catch (error) {
    if (!operation) {
      if (disposed) return
      message.value = messages.value.validationFailure
      emit('failure', { kind: 'exception', error, phase: 'preparation' })
      await showInvalid()
      return
    }
    if (!current(operation)) {
      reportOutdated(operation, error)
      return
    }
    message.value =
      operation.phase === 'submission' ? messages.value.failure : messages.value.validationFailure
    emit('failure', {
      kind: 'exception',
      error,
      phase: operation.phase,
      context: operation.context,
    })
    await showInvalid()
  } finally {
    starting = false
    active.value = null
  }
}
function reportOutdated(operation: FormOperation, error?: unknown) {
  if (disposed) return
  if (operation.phase === 'submission') notice.value = messages.value.changed
  emit('outdated', { context: operation.context, phase: operation.phase, error })
}
function onReset(event: Event) {
  emit('reset', event)
  queueMicrotask(() => {
    if (event.defaultPrevented || disposed) return
    invalidate()
    attempted = false
    issues.value = []
    notice.value = ''
  })
}
function onInvalid(event: Event) {
  event.preventDefault()
}
onMounted(() => {
  const document = form.value?.ownerDocument
  // Bubble after input model handlers so feedback updates preserve the editing value.
  document?.addEventListener('input', onEdit)
  document?.addEventListener('change', onEdit)
  document?.addEventListener('click', onInteraction)
  document?.addEventListener('keyup', onInteraction)
})
onBeforeUnmount(() => {
  disposed = true
  active.value?.controller.abort()
  const document = form.value?.ownerDocument
  document?.removeEventListener('input', onEdit)
  document?.removeEventListener('change', onEdit)
  document?.removeEventListener('click', onInteraction)
  document?.removeEventListener('keyup', onInteraction)
})
defineExpose({
  element: form,
  invalidate,
  focusField,
  requestSubmit: (submitter?: HTMLButtonElement | HTMLInputElement) =>
    form.value?.requestSubmit(submitter),
  reset: () => form.value?.reset(),
})
</script>

<template>
  <form
    v-bind="attrs"
    ref="form"
    class="yam3x-form"
    novalidate
    @submit="onSubmit"
    @reset="onReset"
    @invalid.capture="onInvalid"
  >
    <div
      v-if="$slots.instructions"
      class="yam3x-form__instructions"
    >
      <slot name="instructions" />
    </div>
    <div
      v-if="hasErrors"
      ref="summary"
      class="yam3x-form__summary"
      role="group"
      :aria-labelledby="headingId"
      tabindex="-1"
    >
      <InlineMessage
        tone="error"
        announcement="assertive"
        :icon="false"
      >
        <Heading
          :id="headingId"
          variant="title"
          size="medium"
          :level="summaryHeadingLevel"
          >{{ messages.summary }}</Heading
        >
        <p
          v-if="message"
          class="yam3x-form__message"
        >
          {{ message }}
        </p>
        <ul
          v-if="issues.length"
          class="yam3x-form__errors"
        >
          <li
            v-for="issue in issues"
            :key="issue.key"
          >
            <a
              v-if="linkFor(issue)"
              :href="linkFor(issue)"
              @click.prevent="focusIssue(issue)"
              >{{ issue.label }}: {{ issue.message }}</a
            ><span v-else>{{ issue.label }}: {{ issue.message }}</span>
          </li>
        </ul>
      </InlineMessage>
    </div>
    <div class="yam3x-form__fields">
      <slot
        :field-errors="fieldErrors"
        :pending="pending"
        :status="status"
      />
    </div>
    <div
      v-if="$slots.actions"
      class="yam3x-form__actions"
    >
      <slot
        name="actions"
        :pending="pending"
        :status="status"
      />
    </div>
    <p
      v-if="pending"
      role="status"
      class="yam3x-form__message"
    >
      {{ status === 'validating' ? messages.validating : messages.submitting }}
    </p>
    <InlineMessage
      v-if="notice"
      tone="warning"
      announcement="polite"
      >{{ notice }}</InlineMessage
    >
    <InlineMessage
      v-if="successMessage"
      tone="success"
      announcement="polite"
      >{{ successMessage }}</InlineMessage
    >
  </form>
</template>

<style scoped>
.yam3x-form {
  --_yam3x-form-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-form-section-gap: calc(24px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-form-font: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-form-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-form-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-form-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-form-tracking: var(--md-sys-typescale-body-medium-tracking);
  --_yam3x-form-color: var(--md-sys-color-on-surface);
  display: grid;
  gap: var(--_yam3x-form-section-gap);
  min-inline-size: 0;
  color: var(--_yam3x-form-color);
}
.yam3x-form__fields {
  display: grid;
  gap: var(--_yam3x-form-gap);
  min-inline-size: 0;
}
.yam3x-form__fields:has(> .yam3x-form-section) {
  gap: var(--_yam3x-form-section-gap);
}
.yam3x-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--_yam3x-form-gap);
}
.yam3x-form__instructions,
.yam3x-form__message {
  margin: 0;
  font-family: var(--_yam3x-form-font);
  font-size: var(--_yam3x-form-size);
  font-weight: var(--_yam3x-form-weight);
  line-height: var(--_yam3x-form-height);
  letter-spacing: var(--_yam3x-form-tracking);
  overflow-wrap: anywhere;
}
.yam3x-form__summary {
  min-inline-size: 0;
}
.yam3x-form__errors {
  margin: var(--_yam3x-form-gap) 0 0;
  padding-inline-start: 1.5em;
}
.yam3x-form__errors a {
  color: inherit;
  text-decoration: underline;
}
.yam3x-form[hidden] {
  display: none;
}
</style>
