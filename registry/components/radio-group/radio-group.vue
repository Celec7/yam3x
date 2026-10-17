<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, provide, ref, useId } from 'vue'
import { radioGroupContextKey } from './radio-group.types'

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    id?: string
    name?: string
    form?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
  }>(),
  {
    description: undefined,
    id: undefined,
    name: undefined,
    form: undefined,
    required: false,
    disabled: false,
    invalid: false,
  },
)
const modelValue = defineModel<string | null>({ default: null })
const emit = defineEmits<{
  input: [event: Event]
  change: [event: Event]
  invalid: [event: Event]
}>()

const generatedId = useId()
const nativeName = computed(() => props.name || `yam3x-radio-group-${generatedId}`)
const labelId = computed(() => `${props.id ?? `yam3x-radio-group-${generatedId}`}-label`)
const descriptionId = computed(
  () => `${props.id ?? `yam3x-radio-group-${generatedId}`}-description`,
)
const groupElement = ref<HTMLElement>()
const validationFailed = ref(false)
const hasError = computed(() => props.invalid || validationFailed.value)
const initialValue = modelValue.value
let associatedForms = new Set<HTMLFormElement>()
const context = {
  modelValue,
  name: nativeName,
  form: computed(() => props.form),
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
  invalid: hasError,
  requestSelect(value: string) {
    validationFailed.value = false
    modelValue.value = value
    void nextTick(() => {
      if (modelValue.value === value) return
      groupElement.value
        ?.querySelectorAll<HTMLInputElement>('[data-yam3x-radio-input]')
        .forEach((input) => {
          input.checked = input.value === modelValue.value
        })
    })
  },
}
provide(radioGroupContextKey, context)

function forwardInput(event: Event): void {
  emit('input', event)
}

function forwardChange(event: Event): void {
  emit('change', event)
}

function forwardInvalid(event: Event): void {
  validationFailed.value = true
  emit('invalid', event)
}

function resetGroup(): void {
  queueMicrotask(() => {
    validationFailed.value = false
    modelValue.value = initialValue
    groupElement.value
      ?.querySelectorAll<HTMLInputElement>('[data-yam3x-radio-input]')
      .forEach((input) => {
        input.checked = input.value === initialValue
      })
  })
}

function removeUnnamedValue(event: FormDataEvent): void {
  if (!props.name) event.formData.delete(nativeName.value)
}

function syncAssociatedForms(): void {
  const nextForms = new Set(
    [...(groupElement.value?.querySelectorAll<HTMLInputElement>('[data-yam3x-radio-input]') ?? [])]
      .map((input) => input.form)
      .filter((form): form is HTMLFormElement => form !== null),
  )
  associatedForms.forEach((form) => {
    form.removeEventListener('reset', resetGroup)
    form.removeEventListener('formdata', removeUnnamedValue)
  })
  nextForms.forEach((form) => {
    form.addEventListener('reset', resetGroup)
    form.addEventListener('formdata', removeUnnamedValue)
  })
  associatedForms = nextForms
}

onMounted(syncAssociatedForms)
onUpdated(syncAssociatedForms)
onBeforeUnmount(() =>
  associatedForms.forEach((form) => {
    form.removeEventListener('reset', resetGroup)
    form.removeEventListener('formdata', removeUnnamedValue)
  }),
)
</script>

<template>
  <div
    :id="id"
    ref="groupElement"
    class="yam3x-radio-group"
    role="radiogroup"
    :aria-labelledby="labelId"
    :aria-describedby="description ? descriptionId : undefined"
    :aria-required="required ? 'true' : undefined"
    :aria-invalid="hasError ? 'true' : undefined"
    @input="forwardInput"
    @change="forwardChange"
    @invalid.capture="forwardInvalid"
  >
    <span
      :id="labelId"
      class="yam3x-radio-group__label"
      >{{ label }}</span
    >
    <span
      v-if="description"
      :id="descriptionId"
      class="yam3x-radio-group__description"
      >{{ description }}</span
    >
    <div class="yam3x-radio-group__options"><slot /></div>
  </div>
</template>

<style scoped>
.yam3x-radio-group {
  --_yam3x-radio-group-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-radio-group-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-radio-group-label-font-family: var(--md-sys-typescale-title-small-font-family);
  --_yam3x-radio-group-label-font-size: var(--md-sys-typescale-title-small-font-size);
  --_yam3x-radio-group-label-font-weight: var(--md-sys-typescale-title-small-font-weight);
  --_yam3x-radio-group-label-line-height: var(--md-sys-typescale-title-small-line-height);
  --_yam3x-radio-group-label-tracking: var(--md-sys-typescale-title-small-tracking);
  --_yam3x-radio-group-description-font-family: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-radio-group-description-font-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-radio-group-description-font-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-radio-group-description-line-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-radio-group-description-tracking: var(--md-sys-typescale-body-medium-tracking);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
}
.yam3x-radio-group__label {
  color: var(--_yam3x-radio-group-color-on-surface);
  font-family: var(--_yam3x-radio-group-label-font-family);
  font-size: var(--_yam3x-radio-group-label-font-size);
  font-weight: var(--_yam3x-radio-group-label-font-weight);
  line-height: var(--_yam3x-radio-group-label-line-height);
  letter-spacing: var(--_yam3x-radio-group-label-tracking);
}
.yam3x-radio-group__description {
  color: var(--_yam3x-radio-group-color-on-surface-variant);
  font-family: var(--_yam3x-radio-group-description-font-family);
  font-size: var(--_yam3x-radio-group-description-font-size);
  font-weight: var(--_yam3x-radio-group-description-font-weight);
  line-height: var(--_yam3x-radio-group-description-line-height);
  letter-spacing: var(--_yam3x-radio-group-description-tracking);
}
.yam3x-radio-group__options {
  display: flex;
  flex-direction: column;
  width: max-content;
}
</style>
