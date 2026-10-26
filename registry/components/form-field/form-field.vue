<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { getFormValidationControl } from '../_shared/form-control'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

type FieldVariant = 'outlined' | 'filled'
type HideSubscript = 'always' | 'auto' | 'never'
type FloatLabel = 'always' | 'auto'

const props = withDefaults(
  defineProps<{
    locale?: string
    label: string
    id?: string
    variant?: FieldVariant
    hint?: string
    error?: string | boolean
    hideRequiredMarker?: boolean
    hideSubscript?: HideSubscript
    floatLabel?: FloatLabel
    width?: string
    counterLabel?: string
  }>(),
  {
    variant: 'outlined',
    hideRequiredMarker: false,
    hideSubscript: 'never',
    floatLabel: 'auto',
    counterLabel: undefined,
  },
)

const slots = defineSlots<{
  default?(): unknown
  label?(): unknown
  prefix?(): unknown
  'prefix-text'?(): unknown
  suffix?(): unknown
  'suffix-text'?(): unknown
  hint?(): unknown
  error?(): unknown
  counter?(props: { count: number; max: number | null }): unknown
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ characterCount: props.counterLabel }),
)

const generatedId = useId().replace(/:/g, '')
const controlId = computed(() => props.id || `yam3x-form-field-${generatedId}`)
const labelId = `yam3x-form-field-label-${generatedId}`
const hintId = `yam3x-form-field-hint-${generatedId}`
const errorId = `yam3x-form-field-error-${generatedId}`
const counterId = `yam3x-form-field-counter-${generatedId}`
const root = ref<HTMLElement | null>(null)
const control = ref<HTMLElement | null>(null)
const focused = ref(false)
const populated = ref(false)
const invalidState = ref(false)
const invalid = computed(
  () =>
    invalidState.value ||
    props.error === true ||
    (typeof props.error === 'string' && props.error.length > 0),
)
const validationMessage = ref('')
const nativeInvalid = ref(false)
const controlDisabled = ref(false)
const controlReadonly = ref(false)
const controlRequiredState = ref(false)
const controlRequired = computed(() => controlRequiredState.value)
const characterCount = ref(0)
const characterLimit = ref<number | null>(null)
const labelFloats = computed(
  () => props.floatLabel === 'always' || focused.value || populated.value || invalid.value,
)
const supportingText = computed(() =>
  invalid.value
    ? (typeof props.error === 'string' ? props.error : '') || validationMessage.value
    : props.hint || '',
)
const hasErrorContent = computed(
  () => invalid.value && (Boolean(supportingText.value) || Boolean(slots.error)),
)
const hasHintContent = computed(() => Boolean(props.hint) || Boolean(slots.hint))
const hasCounterContent = computed(() => Boolean(slots.counter) || characterLimit.value !== null)
const subscriptVisible = computed(
  () =>
    props.hideSubscript === 'never' ||
    (props.hideSubscript === 'auto' && (focused.value || invalid.value)),
)
const describedIds = computed(() => {
  const ids = hasErrorContent.value
    ? [errorId]
    : hasHintContent.value && (props.hideSubscript !== 'auto' || subscriptVisible.value)
      ? [hintId]
      : []
  if (hasCounterContent.value) ids.push(counterId)
  return ids
})
const stateClass = computed(() => ({
  'yam3x-form-field--focused': focused.value,
  'yam3x-form-field--populated': populated.value,
  'yam3x-form-field--floating': labelFloats.value,
  'yam3x-form-field--invalid': invalid.value,
  'yam3x-form-field--disabled': controlDisabled.value,
  'yam3x-form-field--readonly': controlReadonly.value,
}))

let observer: MutationObserver | undefined
let disabledObserver: MutationObserver | undefined
let prefixObserver: ResizeObserver | undefined
let observedForm: HTMLFormElement | null = null
let controlsToCleanup: HTMLElement[] = []
let ownsAriaInvalid = false

function findControl() {
  if (!root.value) return null
  return root.value.querySelector<HTMLElement>(
    '[data-form-field-control], input, textarea, select, m3e-select, m3e-date-input, m3e-input-chip-set',
  )
}
function getValue(element: HTMLElement) {
  return [element, getFormValidationControl(element)].some((control) => {
    const value = (control as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value
    return typeof value === 'string' ? value.length > 0 : Boolean(value)
  })
}
function isControlValid(element: HTMLElement) {
  const candidate = getFormValidationControl(element) as HTMLElement & {
    validity?: ValidityState
    willValidate?: boolean
  }
  if (candidate.matches('input, select, textarea'))
    return !candidate.willValidate || candidate.validity?.valid !== false
  return element.getAttribute('aria-invalid') !== 'true'
}
function getValidationMessage(element: HTMLElement) {
  const candidate = getFormValidationControl(element) as HTMLElement & {
    validationMessage?: string
  }
  return candidate.validationMessage || ''
}

function syncLabelInset() {
  if (!root.value) return
  const prefix = root.value.querySelector<HTMLElement>('.yam3x-form-field__prefix')
  const prefixText = root.value.querySelector<HTMLElement>('.yam3x-form-field__prefix-text')
  const leadingInset = prefix || prefixText ? 12 : 16
  const prefixWidth =
    prefix?.getBoundingClientRect().width ?? prefixText?.getBoundingClientRect().width ?? 0
  const gap = prefix ? 16 : prefixText ? 8 : 0
  root.value.style.setProperty(
    '--_yam3x-form-field-label-inset',
    `${leadingInset + prefixWidth + gap}px`,
  )
  if (prefix) prefixObserver?.observe(prefix)
  if (prefixText) prefixObserver?.observe(prefixText)
}
function syncControl() {
  syncLabelInset()
  const nextControl = findControl()
  if (control.value !== nextControl) {
    for (const previous of controlsToCleanup) previous.removeEventListener('invalid', onInvalid)
    controlsToCleanup = []
    control.value = nextControl
    nativeInvalid.value = false
    validationMessage.value = ''
  }
  const element = control.value
  if (!element) return
  if (props.id && element.id !== props.id) element.id = props.id
  else if (!element.id) element.id = controlId.value
  if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
    element.setAttribute('aria-labelledby', labelId)
  } else if (!element.hasAttribute('aria-label') && element.hasAttribute('aria-labelledby')) {
    const labels = (element.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean)
    if (!labels.includes(labelId))
      element.setAttribute('aria-labelledby', [...labels, labelId].join(' '))
  }
  if (describedIds.value.length) {
    const internalIds = [hintId, errorId, counterId]
    const existing = (element.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter(Boolean)
      .filter((id) => !internalIds.includes(id))
    const next = [...existing, ...describedIds.value].join(' ')
    if (element.getAttribute('aria-describedby') !== next)
      element.setAttribute('aria-describedby', next)
  } else if (element.hasAttribute('aria-describedby')) {
    const internalIds = [hintId, errorId, counterId]
    const existing = (element.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter(Boolean)
      .filter((id) => !internalIds.includes(id))
    if (existing.length) {
      const next = existing.join(' ')
      if (element.getAttribute('aria-describedby') !== next)
        element.setAttribute('aria-describedby', next)
    } else element.removeAttribute('aria-describedby')
  }
  if (invalid.value && element.getAttribute('aria-invalid') !== 'true') {
    element.setAttribute('aria-invalid', 'true')
    ownsAriaInvalid = true
  } else if (!invalid.value && ownsAriaInvalid) {
    element.removeAttribute('aria-invalid')
    ownsAriaInvalid = false
  }
  populated.value = getValue(element)
  const controlValue = (element as HTMLInputElement | HTMLTextAreaElement).value
  characterCount.value = typeof controlValue === 'string' ? controlValue.length : 0
  const maxLength = (element as HTMLInputElement | HTMLTextAreaElement).maxLength
  characterLimit.value = Number.isInteger(maxLength) && maxLength >= 0 ? maxLength : null
  controlDisabled.value =
    element.matches(':disabled') ||
    element.hasAttribute('disabled') ||
    (element as HTMLInputElement).disabled === true
  controlReadonly.value =
    element.hasAttribute('readonly') ||
    (element as HTMLInputElement).readOnly === true ||
    element.getAttribute('aria-readonly') === 'true'
  controlRequiredState.value =
    element.hasAttribute('required') ||
    (element as HTMLInputElement).required === true ||
    element.getAttribute('aria-required') === 'true'
  const form = (element as HTMLInputElement).form || null
  if (observedForm !== form) {
    observedForm?.removeEventListener('reset', onReset)
    observedForm = form
    observedForm?.addEventListener('reset', onReset)
  }
  if (!controlsToCleanup.includes(element)) {
    element.addEventListener('invalid', onInvalid)
    controlsToCleanup.push(element)
  }
}
function onInvalid(event: Event) {
  nativeInvalid.value = true
  invalidState.value = true
  validationMessage.value =
    event.target instanceof HTMLElement ? getValidationMessage(event.target) : ''
  syncControl()
}
function onReset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    nativeInvalid.value = false
    invalidState.value = false
    validationMessage.value = ''
    requestAnimationFrame(() => {
      syncControl()
    })
  })
}
function onFocusIn() {
  focused.value = !controlDisabled.value
}
function onFocusOut() {
  requestAnimationFrame(() => {
    focused.value = Boolean(
      root.value?.contains(document.activeElement) && document.activeElement === control.value,
    )
    if (nativeInvalid.value && control.value) {
      const candidate = control.value
      invalidState.value = !isControlValid(candidate)
      validationMessage.value = invalidState.value ? getValidationMessage(candidate) : ''
      if (!invalidState.value) nativeInvalid.value = false
    }
    syncControl()
  })
}
function onInput() {
  void nextTick(() => {
    syncControl()
    if (nativeInvalid.value && control.value) {
      const candidate = control.value
      invalidState.value = !isControlValid(candidate)
      validationMessage.value = invalidState.value ? getValidationMessage(candidate) : ''
      if (!invalidState.value) nativeInvalid.value = false
    }
  })
}

function focusControl() {
  if (controlDisabled.value || !control.value) return
  ;(control.value as HTMLElement & { focus?: () => void }).focus?.()
}

watch([describedIds, invalid], () => {
  void nextTick(syncControl)
})
watch(controlId, () => {
  void nextTick(syncControl)
})
onMounted(() => {
  syncControl()
  disabledObserver = new MutationObserver(syncControl)
  for (let ancestor = root.value?.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.localName === 'fieldset')
      disabledObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] })
  }
  prefixObserver = new ResizeObserver(syncLabelInset)
  syncLabelInset()
  observer = new MutationObserver(() => syncControl())
  if (root.value)
    observer.observe(root.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'disabled',
        'readonly',
        'required',
        'aria-required',
        'value',
        'maxlength',
        'aria-describedby',
        'aria-invalid',
      ],
    })
})
onBeforeUnmount(() => {
  observer?.disconnect()
  disabledObserver?.disconnect()
  prefixObserver?.disconnect()
  observedForm?.removeEventListener('reset', onReset)
  for (const element of controlsToCleanup) element.removeEventListener('invalid', onInvalid)
})
</script>

<template>
  <div
    ref="root"
    class="yam3x-form-field"
    :class="[
      `yam3x-form-field--${variant}`,
      stateClass,
      {
        'yam3x-form-field--with-prefix': !!$slots.prefix || !!$slots['prefix-text'],
        'yam3x-form-field--with-suffix': !!$slots.suffix || !!$slots['suffix-text'],
        'yam3x-form-field--multiline': control?.localName === 'textarea',
      },
    ]"
    :style="width ? { '--_yam3x-form-field-width-runtime': width } : undefined"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @input="onInput"
    @change="syncControl"
  >
    <div
      class="yam3x-form-field__container"
      @click.self="focusControl"
    >
      <div
        v-if="$slots.prefix"
        class="yam3x-form-field__prefix"
        data-yam3x-field-prefix
      >
        <slot name="prefix" />
      </div>
      <span
        v-if="$slots['prefix-text']"
        class="yam3x-form-field__prefix-text"
        data-yam3x-field-prefix-text
        ><slot name="prefix-text"
      /></span>
      <div class="yam3x-form-field__control"><slot /></div>
      <span
        v-if="$slots['suffix-text']"
        class="yam3x-form-field__suffix-text"
        data-yam3x-field-suffix-text
        ><slot name="suffix-text"
      /></span>
      <div
        v-if="$slots.suffix"
        class="yam3x-form-field__suffix"
        data-yam3x-field-suffix
      >
        <slot name="suffix" />
      </div>
      <label
        :id="labelId"
        class="yam3x-form-field__label"
        :class="{ 'yam3x-form-field__label--floating': labelFloats }"
        :for="control?.id || controlId"
      >
        <slot name="label">{{ label }}</slot
        ><span v-if="controlRequired && !hideRequiredMarker"> *</span>
      </label>
    </div>
    <div
      class="yam3x-form-field__subscript"
      :class="{
        'yam3x-form-field__subscript--visible': subscriptVisible,
        'yam3x-form-field__subscript--sr-only': hideSubscript === 'always',
      }"
    >
      <span
        v-if="hasErrorContent"
        :id="errorId"
        class="yam3x-form-field__error"
        role="alert"
        ><slot name="error">{{ supportingText }}</slot></span
      >
      <span
        v-else-if="hasHintContent"
        :id="hintId"
        class="yam3x-form-field__hint"
        ><slot name="hint">{{ hint }}</slot></span
      >
      <span
        v-if="hasCounterContent"
        :id="counterId"
        class="yam3x-form-field__counter"
      >
        <template v-if="characterLimit !== null">
          <span aria-hidden="true"
            ><slot
              name="counter"
              :count="characterCount"
              :max="characterLimit"
              >{{ characterCount }}/{{ characterLimit }}</slot
            ></span
          >
          <span class="yam3x-form-field__sr-only"
            >{{ actionMessages.characterCount }}: {{ characterCount }}/{{ characterLimit }}</span
          >
        </template>
        <slot
          v-else
          name="counter"
          :count="characterCount"
          :max="null"
        />
      </span>
    </div>
  </div>
</template>

<style>
.yam3x-form-field {
  --_yam3x-form-field-width: var(--_yam3x-form-field-width-runtime, 270px);
  --_yam3x-form-field-color: var(--md-sys-color-on-surface);
  --_yam3x-form-field-font-family: var(--md-sys-typescale-body-large-font-family, inherit);
  --_yam3x-form-field-font-size: var(--md-sys-typescale-body-large-size, 16px);
  --_yam3x-form-field-font-weight: var(--md-sys-typescale-body-large-weight, 400);
  --_yam3x-form-field-line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  --_yam3x-form-field-tracking: var(--md-sys-typescale-body-large-tracking, 0.5px);
  --_yam3x-form-field-label-font-size: var(--md-sys-typescale-body-large-size, 16px);
  --_yam3x-form-field-label-font-weight: var(--md-sys-typescale-body-large-weight, 400);
  --_yam3x-form-field-label-line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  --_yam3x-form-field-label-tracking: var(--md-sys-typescale-body-large-tracking, 0.5px);
  --_yam3x-form-field-icon-size: 24px;
  --_yam3x-form-field-subscript-line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  --_yam3x-form-field-subscript-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-form-field-subscript-font-size: var(--md-sys-typescale-body-small-size, 12px);
  --_yam3x-form-field-subscript-font-weight: var(--md-sys-typescale-body-small-weight, 400);
  --_yam3x-form-field-subscript-tracking: var(--md-sys-typescale-body-small-tracking, 0.4px);
  --_yam3x-form-field-outline-color: var(
    --yam3x-form-field-outline-color,
    var(--md-sys-color-outline)
  );
  --_yam3x-form-field-filled-indicator-color: var(
    --yam3x-form-field-outline-color,
    var(--md-sys-color-on-surface-variant)
  );
  --_yam3x-form-field-container-shape: var(
    --yam3x-form-field-container-shape,
    var(--md-sys-shape-corner-extra-small, 4px)
  );
  --_yam3x-form-field-container-color: var(
    --yam3x-form-field-container-color,
    var(--md-sys-color-surface-container-highest)
  );
  --_yam3x-form-field-focused-outline-color: var(
    --yam3x-form-field-focused-outline-color,
    var(--md-sys-color-primary)
  );
  --_yam3x-form-field-focused-color: var(
    --yam3x-form-field-focused-color,
    var(--md-sys-color-primary)
  );
  --_yam3x-form-field-invalid-color: var(
    --yam3x-form-field-invalid-color,
    var(--md-sys-color-error)
  );
  --_yam3x-form-field-hover-outline-color: var(--md-sys-color-on-surface);
  --_yam3x-form-field-hover-container-color: var(--md-sys-color-on-surface);
  --_yam3x-form-field-hover-opacity: var(--md-sys-state-hover-opacity, 0.08);
  --_yam3x-form-field-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-form-field-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-form-field-surface: var(--md-sys-color-surface);
  --_yam3x-form-field-motion-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-form-field-motion-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-form-field-density-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-form-field-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-form-field-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-form-field-disabled-opacity: 38%;
  --_yam3x-form-field-disabled-container-opacity: 4%;
  --_yam3x-form-field-error-hover-color: color-mix(
    in srgb,
    var(--_yam3x-form-field-invalid-color) 80%,
    var(--_yam3x-form-field-on-surface) 20%
  );
  display: inline-flex;
  flex: 0 1 var(--_yam3x-form-field-width, 270px);
  flex-direction: column;
  vertical-align: middle;
  width: min(100%, var(--_yam3x-form-field-width, 270px));
  min-width: 0;
  color: var(--_yam3x-form-field-color);
  font-family: var(--_yam3x-form-field-font-family);
  font-size: var(--_yam3x-form-field-font-size);
  font-weight: var(--_yam3x-form-field-font-weight);
  line-height: calc(
    var(--_yam3x-form-field-line-height) * var(--_yam3x-form-field-line-height-scale)
  );
  letter-spacing: var(--_yam3x-form-field-tracking);
}
.yam3x-form-field:focus-within {
  position: relative;
  z-index: 41;
}
.yam3x-form-field__container {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: max(48px, calc(56px * var(--_yam3x-form-field-density-container-scale, 1)));
  min-width: 0;
  padding-inline: calc(16px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field__control {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  min-height: 24px;
}
.yam3x-form-field__control input,
.yam3x-form-field__control textarea,
.yam3x-form-field__control select,
.yam3x-form-field__control [data-form-field-control] {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 24px;
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
}
.yam3x-form-field__label {
  position: absolute;
  z-index: 2;
  top: 50%;
  inset-inline-start: calc(
    var(--_yam3x-form-field-label-inset, 16px) * var(--_yam3x-form-field-density-spacing-scale, 1)
  );
  max-width: calc(100% - var(--_yam3x-form-field-label-inset, 16px) - 16px);
  overflow: visible;
  color: var(--_yam3x-form-field-on-surface-variant);
  font-size: var(--_yam3x-form-field-label-font-size);
  font-weight: var(--_yam3x-form-field-label-font-weight);
  line-height: calc(
    var(--_yam3x-form-field-label-line-height) * var(--_yam3x-form-field-line-height-scale)
  );
  letter-spacing: var(--_yam3x-form-field-label-tracking);
  white-space: nowrap;
  pointer-events: auto;
  cursor: text;
  transform: translateY(-50%);
  transform-origin: top left;
  transition:
    top var(--_yam3x-form-field-motion-spatial),
    transform var(--_yam3x-form-field-motion-spatial),
    color var(--_yam3x-form-field-motion-effects);
}
.yam3x-form-field--multiline.yam3x-form-field--outlined:not(.yam3x-form-field--floating)
  .yam3x-form-field__label {
  top: calc(
    var(--_yam3x-form-field-label-line-height) * var(--_yam3x-form-field-line-height-scale) * 0.5
  );
}
.yam3x-form-field:not(.yam3x-form-field--floating) .yam3x-form-field__control input::placeholder,
.yam3x-form-field:not(.yam3x-form-field--floating)
  .yam3x-form-field__control
  textarea::placeholder {
  color: transparent;
}
.yam3x-form-field__label--floating {
  top: 0;
  transform: translateY(-50%) scale(0.75);
}
.yam3x-form-field:dir(rtl) .yam3x-form-field__label {
  transform-origin: top right;
}
.yam3x-form-field__prefix,
.yam3x-form-field__suffix {
  position: relative;
  z-index: 1;
  display: grid;
  flex: none;
  min-inline-size: var(--_yam3x-form-field-icon-size);
  min-block-size: var(--_yam3x-form-field-icon-size);
  color: var(--_yam3x-form-field-on-surface-variant);
  place-items: center;
}
.yam3x-form-field--invalid .yam3x-form-field__suffix {
  color: var(--_yam3x-form-field-invalid-color);
}
.yam3x-form-field__prefix {
  margin-inline-end: calc(12px * var(--_yam3x-form-field-density-spacing-scale, 1));
  margin-inline-start: calc(-4px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field__suffix {
  margin-inline-start: calc(8px * var(--_yam3x-form-field-density-spacing-scale, 1));
  margin-inline-end: calc(-4px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field__prefix-text,
.yam3x-form-field__suffix-text {
  position: relative;
  z-index: 1;
  flex: none;
}
.yam3x-form-field__prefix-text {
  margin-inline-end: calc(8px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field__suffix-text {
  margin-inline-start: calc(8px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field__subscript {
  display: flex;
  box-sizing: border-box;
  min-height: var(--_yam3x-form-field-subscript-line-height);
  margin: calc(4px * var(--_yam3x-form-field-density-spacing-scale, 1))
    calc(16px * var(--_yam3x-form-field-density-spacing-scale, 1)) 0;
  color: var(--_yam3x-form-field-subscript-color);
  font-size: var(--_yam3x-form-field-subscript-font-size);
  font-weight: var(--_yam3x-form-field-subscript-font-weight);
  line-height: calc(
    var(--_yam3x-form-field-subscript-line-height) * var(--_yam3x-form-field-line-height-scale)
  );
  letter-spacing: var(--_yam3x-form-field-subscript-tracking);
}
.yam3x-form-field__subscript--sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: calc(-1px * var(--_yam3x-form-field-density-spacing-scale, 1));
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.yam3x-form-field__subscript:not(.yam3x-form-field__subscript--visible):not(
    .yam3x-form-field__subscript--sr-only
  ) {
  visibility: hidden;
}
.yam3x-form-field__error,
.yam3x-form-field__hint {
  overflow-wrap: anywhere;
}
.yam3x-form-field__counter {
  flex: none;
  margin-inline-start: auto;
  padding-inline-start: calc(16px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: calc(-1px * var(--_yam3x-form-field-density-spacing-scale, 1));
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.yam3x-form-field--outlined .yam3x-form-field__container {
  border: 1px solid var(--_yam3x-form-field-outline-color);
  border-radius: var(--_yam3x-form-field-container-shape);
  background: transparent;
}
.yam3x-form-field--filled .yam3x-form-field__container {
  align-items: end;
  padding-block: calc(8px * var(--_yam3x-form-field-density-spacing-scale, 1));
  border: 0;
  border-bottom: 1px solid var(--_yam3x-form-field-filled-indicator-color);
  border-start-start-radius: var(--_yam3x-form-field-container-shape);
  border-start-end-radius: var(--_yam3x-form-field-container-shape);
  background: var(--_yam3x-form-field-container-color);
}
.yam3x-form-field--filled .yam3x-form-field__control {
  padding-top: calc(16px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field--filled .yam3x-form-field__label {
  top: 8px;
  transform: none;
}
.yam3x-form-field--filled .yam3x-form-field__label--floating {
  top: 5px;
  transform: scale(0.75);
}
.yam3x-form-field--focused .yam3x-form-field__container {
  border-color: var(--_yam3x-form-field-focused-outline-color);
}
.yam3x-form-field--focused .yam3x-form-field__label {
  color: var(--_yam3x-form-field-focused-color);
}
.yam3x-form-field--focused.yam3x-form-field--outlined .yam3x-form-field__container {
  border-width: 3px;
}
.yam3x-form-field--focused.yam3x-form-field--filled .yam3x-form-field__container {
  border-bottom-width: 3px;
}
.yam3x-form-field--focused.yam3x-form-field--filled .yam3x-form-field__container {
  padding-inline: calc(15px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field--invalid .yam3x-form-field__container {
  border-color: var(--_yam3x-form-field-invalid-color);
}
.yam3x-form-field--invalid .yam3x-form-field__label,
.yam3x-form-field--invalid .yam3x-form-field__subscript {
  color: var(--_yam3x-form-field-invalid-color);
}
.yam3x-form-field:not(.yam3x-form-field--disabled):not(.yam3x-form-field--focused):not(
    .yam3x-form-field--invalid
  ):hover.yam3x-form-field--outlined
  .yam3x-form-field__container {
  border-color: var(--_yam3x-form-field-hover-outline-color);
}
.yam3x-form-field:not(.yam3x-form-field--disabled):not(.yam3x-form-field--focused):not(
    .yam3x-form-field--invalid
  ):hover
  .yam3x-form-field__label {
  color: var(--_yam3x-form-field-on-surface);
}
.yam3x-form-field:not(.yam3x-form-field--disabled):not(
    .yam3x-form-field--focused
  ):hover.yam3x-form-field--filled
  .yam3x-form-field__container {
  background: var(--_yam3x-form-field-container-color);
}
.yam3x-form-field:not(.yam3x-form-field--disabled):not(
    .yam3x-form-field--focused
  ):hover.yam3x-form-field--filled
  .yam3x-form-field__container::before {
  position: absolute;
  z-index: 0;
  border-radius: inherit;
  background: var(--_yam3x-form-field-hover-container-color);
  opacity: var(--_yam3x-form-field-hover-opacity);
  content: '';
  inset: 0;
  pointer-events: none;
}
.yam3x-form-field:not(.yam3x-form-field--disabled):not(.yam3x-form-field--focused):not(
    .yam3x-form-field--invalid
  ):hover.yam3x-form-field--filled
  .yam3x-form-field__container {
  border-bottom-color: var(--_yam3x-form-field-hover-outline-color);
}
.yam3x-form-field--invalid:not(.yam3x-form-field--disabled):hover .yam3x-form-field__container {
  border-color: var(--_yam3x-form-field-error-hover-color);
}
.yam3x-form-field--invalid:not(.yam3x-form-field--disabled):hover .yam3x-form-field__label,
.yam3x-form-field--invalid:not(.yam3x-form-field--disabled):hover .yam3x-form-field__suffix {
  color: var(--_yam3x-form-field-error-hover-color);
}
.yam3x-form-field--disabled {
  color: color-mix(
    in srgb,
    var(--_yam3x-form-field-on-surface) var(--_yam3x-form-field-disabled-opacity, 38%),
    transparent
  );
}
.yam3x-form-field--disabled .yam3x-form-field__label,
.yam3x-form-field--disabled .yam3x-form-field__subscript {
  color: color-mix(
    in srgb,
    var(--_yam3x-form-field-on-surface) var(--_yam3x-form-field-disabled-opacity, 38%),
    transparent
  );
}
.yam3x-form-field--disabled.yam3x-form-field--filled .yam3x-form-field__container {
  background: color-mix(
    in srgb,
    var(--_yam3x-form-field-on-surface) var(--_yam3x-form-field-disabled-container-opacity, 4%),
    transparent
  );
}
.yam3x-form-field--disabled.yam3x-form-field--outlined .yam3x-form-field__container,
.yam3x-form-field--disabled.yam3x-form-field--filled .yam3x-form-field__container {
  border-color: color-mix(in srgb, var(--_yam3x-form-field-on-surface) 12%, transparent);
}
.yam3x-form-field--disabled.yam3x-form-field--outlined .yam3x-form-field__container {
  background: transparent;
}
.yam3x-form-field--disabled .yam3x-form-field__control {
  pointer-events: none;
}
.yam3x-form-field--readonly .yam3x-form-field__container {
  cursor: text;
}
.yam3x-form-field--with-prefix .yam3x-form-field__container {
  padding-inline-start: calc(12px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field--with-suffix .yam3x-form-field__container {
  padding-inline-end: calc(12px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field--outlined.yam3x-form-field--floating .yam3x-form-field__label {
  padding-inline: calc(4px * var(--_yam3x-form-field-density-spacing-scale, 1));
  background: var(--_yam3x-form-field-surface);
}
.yam3x-form-field--filled .yam3x-form-field__subscript {
  margin-top: calc(4px * var(--_yam3x-form-field-density-spacing-scale, 1));
}
.yam3x-form-field:focus-within .yam3x-form-field__container {
  transition:
    border-color var(--_yam3x-form-field-motion-effects),
    background-color var(--_yam3x-form-field-motion-effects);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-form-field__container,
  .yam3x-form-field__label,
  .yam3x-form-field__subscript {
    transition: none !important;
  }
}
@media (forced-colors: active) {
  .yam3x-form-field__container {
    border-color: CanvasText;
  }
  .yam3x-form-field--invalid .yam3x-form-field__container,
  .yam3x-form-field--focused .yam3x-form-field__container {
    outline: 2px solid Highlight;
    outline-offset: 1px;
  }
  .yam3x-form-field--disabled {
    color: GrayText;
  }
}
</style>
