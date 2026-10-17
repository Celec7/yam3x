<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useAttrs,
  useId,
  watch,
  type StyleValue,
} from 'vue'
import FormField from '../form-field/form-field.vue'
import IconButton from '../icon-button/icon-button.vue'
import Icon from '../icon/icon.vue'
import { addNumberStep, createNumberCodec } from './number-field.utils'
import type { NumberFieldInvalidDetail, NumberFieldMessages } from './number-field.types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    label: string
    id?: string
    name?: string
    form?: string
    locale?: string
    min?: number
    max?: number
    step?: number
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    controls?: boolean
    variant?: 'outlined' | 'filled'
    hint?: string
    error?: string | boolean
    width?: string
    hideRequiredMarker?: boolean
    messages?: Partial<NumberFieldMessages>
  }>(),
  {
    id: undefined,
    name: undefined,
    form: undefined,
    locale: 'en-US',
    min: undefined,
    max: undefined,
    step: 1,
    required: false,
    disabled: false,
    readonly: false,
    controls: true,
    variant: 'outlined',
    hint: '',
    error: false,
    width: undefined,
    hideRequiredMarker: false,
    messages: undefined,
  },
)
const modelValue = defineModel<number | null>({ default: null })
const emit = defineEmits<{
  input: [text: string]
  change: [value: number | null]
  invalid: [detail: NumberFieldInvalidDetail]
}>()
const slots = defineSlots<{
  'prefix-text'?(): unknown
  'suffix-text'?(): unknown
}>()
const attrs = useAttrs()
const inputAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !['class', 'style', 'aria-describedby'].includes(key)),
  ),
)
const uid = useId().replace(/:/g, '')
const controlId = computed(() => props.id || `yam3x-number-control-${uid}`)
const prefixId = `yam3x-number-prefix-${uid}`
const suffixId = `yam3x-number-suffix-${uid}`
const input = ref<HTMLInputElement>()
const formValue = ref<HTMLInputElement>()
const codec = computed(() => createNumberCodec(props.locale))
const draft = ref(codec.value.format(modelValue.value))
const showErrors = ref(false)
const initialValue = modelValue.value
let associatedForm: HTMLFormElement | null = null
const messages = computed<NumberFieldMessages>(() => {
  const chinese = /^zh/i.test(props.locale)
  return {
    valueMissing: chinese ? '此项为必填项。' : 'This field is required.',
    badInput: chinese ? '请输入有效数字。' : 'Enter a valid number.',
    rangeUnderflow: chinese
      ? `请输入不小于 ${codec.value.format(props.min ?? null)} 的数字。`
      : `Enter a number of at least ${codec.value.format(props.min ?? null)}.`,
    rangeOverflow: chinese
      ? `请输入不大于 ${codec.value.format(props.max ?? null)} 的数字。`
      : `Enter a number no greater than ${codec.value.format(props.max ?? null)}.`,
    customError: chinese ? '请检查此项。' : 'Check this field.',
    increment: chinese ? `增加${props.label}` : `Increase ${props.label}`,
    decrement: chinese ? `减少${props.label}` : `Decrease ${props.label}`,
    ...props.messages,
  }
})
const parsed = computed(() => codec.value.parse(draft.value))
const problem = computed<NumberFieldInvalidDetail | null>(() => {
  let reason: NumberFieldInvalidDetail['reason'] | undefined
  if (props.error) reason = 'customError'
  else if (!draft.value.trim()) reason = props.required ? 'valueMissing' : undefined
  else if (parsed.value === null) reason = 'badInput'
  else if (props.min !== undefined && parsed.value < props.min) reason = 'rangeUnderflow'
  else if (props.max !== undefined && parsed.value > props.max) reason = 'rangeOverflow'
  if (!reason) return null
  return {
    reason,
    message:
      reason === 'customError' && typeof props.error === 'string'
        ? props.error
        : messages.value[reason],
  }
})
const visibleError = computed(() =>
  props.error || showErrors.value ? problem.value?.message || '' : '',
)
const describedBy = computed(
  () =>
    [
      attrs['aria-describedby'],
      slots['prefix-text'] ? prefixId : '',
      slots['suffix-text'] ? suffixId : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined,
)

function syncNative(): void {
  if (input.value) {
    input.value.setCustomValidity(problem.value?.message ?? '')
    if (input.value.value !== draft.value) input.value.value = draft.value
  }
  if (formValue.value)
    formValue.value.value = modelValue.value === null ? '' : String(modelValue.value)
}
function accept(value: number | null): void {
  const previous = modelValue.value
  modelValue.value = value
  draft.value = codec.value.format(value)
  showErrors.value = false
  syncNative()
  // Native submit handlers can read FormData before Vue flushes the controlled model.
  if (formValue.value) formValue.value.value = value === null ? '' : String(value)
  if (!Object.is(previous, value)) {
    emit('change', value)
    input.value?.dispatchEvent(new Event('change', { bubbles: true }))
  }
  // Controlled consumers may reject a proposed value.
  void nextTick(() => {
    if (!Object.is(modelValue.value, value)) {
      draft.value = codec.value.format(modelValue.value)
      syncNative()
    }
  })
}
function commit(): boolean {
  syncNative()
  if (problem.value) {
    showErrors.value = true
    emit('invalid', problem.value)
    return false
  }
  accept(parsed.value)
  return true
}
function onInput(event: Event): void {
  draft.value = (event.target as HTMLInputElement).value
  syncNative()
  emit('input', draft.value)
}
function onInvalid(): void {
  showErrors.value = true
  if (problem.value) emit('invalid', problem.value)
}
function stepCandidate(direction: 1 | -1): number | null {
  if (props.disabled || props.readonly || !Number.isFinite(props.step) || props.step <= 0)
    return null
  const value = problem.value ? modelValue.value : parsed.value
  if (value !== null && !Number.isFinite(value)) return null
  let next = addNumberStep(value ?? 0, props.step, direction)
  if (value === null) next = Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, next))
  if (
    !Number.isFinite(next) ||
    Object.is(next, value) ||
    (props.min !== undefined && next < props.min) ||
    (props.max !== undefined && next > props.max)
  )
    return null
  return next
}
const canIncrement = computed(() => stepCandidate(1) !== null)
const canDecrement = computed(() => stepCandidate(-1) !== null)
function stepBy(direction: 1 | -1): void {
  const next = stepCandidate(direction)
  if (next === null) return
  accept(next)
  input.value?.focus({ preventScroll: true })
}
function onKeydown(event: KeyboardEvent): void {
  if (
    event.isComposing ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    props.disabled ||
    props.readonly
  )
    return
  if (event.key === 'Enter') {
    commit()
    return
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    stepBy(event.key === 'ArrowUp' ? 1 : -1)
  } else if (
    (event.key === 'Home' && props.min !== undefined) ||
    (event.key === 'End' && props.max !== undefined)
  ) {
    event.preventDefault()
    accept(event.key === 'Home' ? props.min! : props.max!)
  }
}
function onSubmit(event: Event): void {
  if (props.disabled || props.readonly) return
  if (!commit()) {
    event.preventDefault()
    input.value?.reportValidity()
  }
}
function onReset(event: Event): void {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    modelValue.value = initialValue
    draft.value = codec.value.format(initialValue)
    showErrors.value = false
    syncNative()
  })
}
function syncForm(): void {
  const next = input.value?.form ?? null
  if (next === associatedForm) return
  associatedForm?.removeEventListener('submit', onSubmit, true)
  associatedForm?.removeEventListener('reset', onReset)
  associatedForm = next
  associatedForm?.addEventListener('submit', onSubmit, true)
  associatedForm?.addEventListener('reset', onReset)
}
watch(
  modelValue,
  (value) => {
    draft.value = codec.value.format(value)
    showErrors.value = false
    syncNative()
  },
  { flush: 'sync' },
)
watch(codec, (next, previous) => {
  const value = previous.parse(draft.value)
  if (value !== null) draft.value = next.format(value)
  syncNative()
})
watch(
  [problem, () => props.disabled, () => props.readonly, () => props.form],
  () => {
    syncNative()
    syncForm()
  },
  { flush: 'post' },
)
onMounted(() => {
  syncNative()
  syncForm()
})
onUpdated(syncForm)
onBeforeUnmount(() => {
  associatedForm?.removeEventListener('submit', onSubmit, true)
  associatedForm?.removeEventListener('reset', onReset)
})
defineExpose({
  focus: () => input.value?.focus(),
  checkValidity: () => {
    syncNative()
    return input.value?.checkValidity() ?? true
  },
  reportValidity: () => {
    syncNative()
    return input.value?.reportValidity() ?? true
  },
})
</script>

<template>
  <FormField
    :id="controlId"
    :label="label"
    :variant="variant"
    :hint="hint"
    :error="visibleError"
    :width="width"
    :hide-required-marker="hideRequiredMarker"
    :class="['yam3x-number-field', attrs.class]"
    :style="attrs.style as StyleValue"
  >
    <template
      v-if="$slots['prefix-text']"
      #prefix-text
      ><span :id="prefixId"><slot name="prefix-text" /></span
    ></template>
    <input
      v-bind="inputAttrs"
      :id="controlId"
      ref="input"
      :data-form-field-control="controlId"
      class="yam3x-number-field__input"
      type="text"
      role="spinbutton"
      inputmode="decimal"
      :value="draft"
      :form="form"
      :lang="locale"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :aria-valuenow="parsed ?? undefined"
      :aria-valuetext="draft || undefined"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-describedby="describedBy"
      :aria-invalid="visibleError ? 'true' : undefined"
      @input="onInput"
      @blur="commit"
      @keydown="onKeydown"
      @invalid="onInvalid"
    />
    <input
      ref="formValue"
      :data-form-field-focus="controlId"
      type="hidden"
      :name="name"
      :form="form"
      :disabled="disabled"
      :value="modelValue ?? ''"
    />
    <template
      v-if="$slots['suffix-text']"
      #suffix-text
      ><span :id="suffixId"><slot name="suffix-text" /></span
    ></template>
    <template
      v-if="controls || visibleError"
      #suffix
    >
      <span class="yam3x-number-field__actions">
        <Icon
          v-if="visibleError"
          class="yam3x-number-field__error-icon"
          name="error"
          aria-hidden="true"
        />
        <template v-if="controls">
          <span class="yam3x-number-field__step">
            <IconButton
              variant="standard"
              size="extra-small"
              :aria-label="messages.decrement"
              :disabled="!canDecrement"
              :tabindex="-1"
              @mousedown.prevent
              @click="stepBy(-1)"
              ><Icon name="remove"
            /></IconButton>
          </span>
          <span class="yam3x-number-field__step">
            <IconButton
              variant="standard"
              size="extra-small"
              :aria-label="messages.increment"
              :disabled="!canIncrement"
              :tabindex="-1"
              @mousedown.prevent
              @click="stepBy(1)"
              ><Icon name="add"
            /></IconButton>
          </span>
        </template>
      </span>
    </template>
  </FormField>
</template>

<style>
.yam3x-number-field {
  --_yam3x-number-field-target-size: var(--md-sys-touch-target-size, 48px);
  --_yam3x-number-field-error-color: var(
    --yam3x-form-field-invalid-color,
    var(--md-sys-color-error)
  );
  --_yam3x-number-field-action-gap: 4px;
  --_yam3x-number-field-block-padding: 4px;
  --_yam3x-number-field-filled-top-padding: 16px;
  --_yam3x-number-field-step-height: 40px;
}
.yam3x-number-field .yam3x-form-field__container {
  padding-block: var(--_yam3x-number-field-block-padding);
}
.yam3x-number-field .yam3x-form-field__control {
  padding-block: var(--_yam3x-number-field-block-padding);
}
.yam3x-number-field.yam3x-form-field--filled .yam3x-form-field__control {
  padding-block: var(--_yam3x-number-field-filled-top-padding) 0;
}
.yam3x-number-field__input {
  font-variant-numeric: tabular-nums;
}
.yam3x-number-field__actions {
  display: flex;
  align-items: center;
  gap: var(--_yam3x-number-field-action-gap);
}
.yam3x-number-field__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: var(--_yam3x-number-field-target-size);
  min-block-size: var(--_yam3x-number-field-step-height);
}
.yam3x-number-field__error-icon {
  color: var(--_yam3x-number-field-error-color);
}
</style>
