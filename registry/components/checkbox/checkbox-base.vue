<script setup lang="ts">
import { ref, useId, watchEffect } from 'vue'
import { vRipple } from '../_shared/ripple'
import type { CheckboxState } from './checkbox.types'

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    id?: string
    name?: string
    value?: string
    form?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
    state: CheckboxState
    initialState: CheckboxState
    inputTabindex?: number
  }>(),
  {
    description: undefined,
    id: undefined,
    name: undefined,
    value: 'on',
    form: undefined,
    required: false,
    disabled: false,
    invalid: false,
  },
)

const emit = defineEmits<{
  'update:state': [state: CheckboxState]
  click: [event: MouseEvent]
  input: [event: Event]
  invalid: [event: Event]
  change: [event: Event]
}>()
const input = ref<HTMLInputElement>()
const control = ref<HTMLElement>()
const descriptionId = `yam3x-checkbox-description-${useId()}`
watchEffect(
  (onCleanup) => {
    // Rebind reset handling when Vue changes the native `form` association.
    void props.form
    const associatedForm = input.value?.form ?? null
    associatedForm?.addEventListener('reset', onReset)
    onCleanup(() => associatedForm?.removeEventListener('reset', onReset))
  },
  { flush: 'post' },
)

function onClick(event: MouseEvent): void {
  emit('click', event)
  if (event.defaultPrevented) {
    event.preventDefault()
    return
  }

  if (props.disabled) return
  emit('update:state', props.state === 'checked' ? 'unchecked' : 'checked')
}

function onInput(event: Event): void {
  emit('input', event)
}

function onChange(event: Event): void {
  emit('change', event)
}

function onInvalid(event: Event): void {
  emit('invalid', event)
}

function onLabelPointerDown(event: PointerEvent): void {
  const host = control.value
  if (
    !host ||
    host.contains(event.target as Node) ||
    !event.isPrimary ||
    (event.pointerType === 'mouse' && event.button !== 0)
  )
    return
  const bounds = host.getBoundingClientRect()
  host.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: false,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: true,
      button: event.button,
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
    }),
  )
}

function onReset(): void {
  // Restore the value that was supplied when this checkbox mounted.
  queueMicrotask(() => {
    emit('update:state', props.initialState)
    if (input.value) {
      input.value.checked = props.initialState === 'checked'
      input.value.indeterminate = props.initialState === 'indeterminate'
    }
  })
}
</script>

<template>
  <div
    class="yam3x-checkbox"
    :class="{ 'yam3x-checkbox--invalid': invalid }"
    :data-state="state"
    :data-disabled="disabled ? '' : undefined"
  >
    <label
      class="yam3x-checkbox__label"
      @pointerdown="onLabelPointerDown"
    >
      <span
        ref="control"
        v-ripple
        class="yam3x-checkbox__control yam3x-state-layer yam3x-touch-target"
        data-yam3x-ripple-role="checkbox"
        data-yam3x-ripple-min-pressed-duration="225"
        data-yam3x-ripple-target=".yam3x-ripple-container"
        :aria-disabled="disabled ? 'true' : undefined"
      >
        <input
          :id="id"
          ref="input"
          class="yam3x-checkbox__input"
          type="checkbox"
          :tabindex="inputTabindex"
          :name="state === 'indeterminate' ? undefined : name"
          :value="value"
          :form="form"
          :checked="state === 'checked'"
          :indeterminate="state === 'indeterminate'"
          :disabled="disabled"
          :required="required"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="description ? descriptionId : undefined"
          @change="onChange"
          @click="onClick"
          @invalid="onInvalid"
          @input="onInput"
        />
        <span
          class="yam3x-checkbox__state"
          aria-hidden="true"
        >
          <span class="yam3x-checkbox__box">
            <span class="yam3x-checkbox__outline" />
            <span class="yam3x-checkbox__background" />
            <svg
              v-if="state !== 'unchecked'"
              class="yam3x-checkbox__icon"
              viewBox="0 0 18 18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                v-if="state === 'indeterminate'"
                d="M3.6 9h10.8"
              />
              <path
                v-else
                d="M3.6 9 7.2 12.6 14.4 5.4"
              />
            </svg>
          </span>
        </span>
      </span>
      <span class="yam3x-checkbox__label-text">{{ label }}</span>
    </label>
    <span
      v-if="description"
      :id="descriptionId"
      class="yam3x-checkbox__description"
      >{{ description }}</span
    >
  </div>
</template>

<style scoped>
.yam3x-checkbox {
  --_yam3x-checkbox-target-size: var(--md-sys-touch-target-size, 48px);
  --_yam3x-checkbox-state-layer-size: 40px;
  --_yam3x-checkbox-box-size: 18px;
  --_yam3x-checkbox-icon-size: var(--_yam3x-checkbox-box-size);
  --_yam3x-checkbox-corner: 2px;
  --_yam3x-checkbox-outline-width: 2px;
  --_yam3x-checkbox-outline: var(--md-sys-color-on-surface-variant);
  --_yam3x-checkbox-selected-container: var(--md-sys-color-primary);
  --_yam3x-checkbox-selected-icon: var(--md-sys-color-on-primary);
  --_yam3x-checkbox-label: var(--md-sys-color-on-surface);
  --_yam3x-checkbox-description: var(--md-sys-color-on-surface-variant);
  --_yam3x-checkbox-disabled-label: var(--_yam3x-checkbox-disabled-on-surface);
  --_yam3x-checkbox-error: var(--md-sys-color-error);
  --_yam3x-checkbox-selected-error-icon: var(--md-sys-color-on-error);
  --_yam3x-checkbox-disabled-on-surface: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 38%,
    transparent
  );
  --_yam3x-checkbox-disabled-icon: var(--md-sys-color-surface);
  --_yam3x-checkbox-hover-outline: var(--md-sys-color-on-surface);
  --_yam3x-checkbox-hover-opacity: var(--md-sys-state-hover-opacity);
  --_yam3x-checkbox-focus-opacity: var(--md-sys-state-focus-opacity);
  --_yam3x-checkbox-pressed-opacity: var(--md-sys-state-pressed-opacity);
  --_yam3x-checkbox-interaction-color: var(--md-sys-color-on-surface);
  --_yam3x-checkbox-focus-indicator: var(--md-sys-color-secondary);
  --_yam3x-checkbox-focus-outline-width: 2px;
  --_yam3x-checkbox-focus-outline-offset: 4px;
  --_yam3x-checkbox-motion-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-checkbox-motion-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-checkbox-label-font: var(--md-sys-typescale-body-large-font);
  --_yam3x-checkbox-description-font: var(--md-sys-typescale-body-medium-font);
  --_yam3x-checkbox-label-gap: var(
    --md-sys-spacing-4,
    calc(4px * var(--md-sys-density-spacing-scale, 1))
  );
  --_yam3x-checkbox-description-offset: calc(0px - var(--_yam3x-checkbox-label-gap));
  --_yam3x-checkbox-description-padding: var(
    --md-sys-spacing-8,
    calc(8px * var(--md-sys-density-spacing-scale, 1))
  );
  display: grid;
  grid-template-columns: var(--_yam3x-checkbox-target-size) minmax(0, 1fr);
  align-content: center;
  column-gap: var(--_yam3x-checkbox-label-gap);
  width: fit-content;
  min-height: var(--_yam3x-checkbox-target-size);
  color: var(--_yam3x-checkbox-label);
}
.yam3x-checkbox__label {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  gap: var(--_yam3x-checkbox-label-gap);
  width: fit-content;
  cursor: pointer;
  user-select: none;
}
.yam3x-checkbox__label-text {
  font: var(--_yam3x-checkbox-label-font);
}
.yam3x-checkbox__control {
  --yam3x-control-height: var(--_yam3x-checkbox-target-size);
  --yam3x-state-layer-color: var(--_yam3x-checkbox-interaction-color);
  --yam3x-ripple-color: var(--_yam3x-checkbox-interaction-color);
  position: relative;
  display: grid;
  width: var(--_yam3x-checkbox-target-size);
  height: var(--_yam3x-checkbox-target-size);
  flex: none;
  place-items: center;
}
:deep(.yam3x-checkbox__control .yam3x-ripple-container) {
  inset: max(
    0px,
    calc((var(--_yam3x-checkbox-target-size) - var(--_yam3x-checkbox-state-layer-size)) / 2)
  );
  border-radius: 50%;
}
.yam3x-checkbox__input {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: var(--_yam3x-checkbox-target-size);
  height: var(--_yam3x-checkbox-target-size);
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.yam3x-checkbox__state {
  position: relative;
  display: grid;
  width: var(--_yam3x-checkbox-state-layer-size);
  height: var(--_yam3x-checkbox-state-layer-size);
  place-items: center;
  border-radius: 50%;
  pointer-events: none;
}
.yam3x-checkbox__box {
  position: relative;
  width: var(--_yam3x-checkbox-box-size);
  height: var(--_yam3x-checkbox-box-size);
  border-radius: var(--_yam3x-checkbox-corner);
}
.yam3x-checkbox__outline,
.yam3x-checkbox__background,
.yam3x-checkbox__icon {
  position: absolute;
  inset: 0;
  width: var(--_yam3x-checkbox-icon-size);
  height: var(--_yam3x-checkbox-icon-size);
}
.yam3x-checkbox__outline {
  box-sizing: border-box;
  border: var(--_yam3x-checkbox-outline-width) solid var(--_yam3x-checkbox-outline);
  border-radius: inherit;
}
.yam3x-checkbox__background {
  border-radius: inherit;
  background: var(--_yam3x-checkbox-selected-container);
}
.yam3x-checkbox__icon {
  color: var(--_yam3x-checkbox-selected-icon);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: square;
}
.yam3x-checkbox__background,
.yam3x-checkbox__icon {
  opacity: 0;
  transform: scale(0.6);
  transition:
    transform var(--_yam3x-checkbox-motion-spatial),
    opacity var(--_yam3x-checkbox-motion-effects);
}
.yam3x-checkbox:is([data-state='checked'], [data-state='indeterminate'])
  :is(.yam3x-checkbox__background, .yam3x-checkbox__icon) {
  opacity: 1;
  transform: scale(1);
}
.yam3x-checkbox__description {
  grid-column: 2;
  margin-top: var(--_yam3x-checkbox-description-offset);
  padding-bottom: var(--_yam3x-checkbox-description-padding);
  color: var(--_yam3x-checkbox-description);
  font: var(--_yam3x-checkbox-description-font);
}
.yam3x-checkbox[data-state='unchecked']:not(.yam3x-checkbox--invalid)
  .yam3x-checkbox__input:hover:not(:disabled)
  + .yam3x-checkbox__state
  .yam3x-checkbox__outline {
  border-color: var(--_yam3x-checkbox-hover-outline);
}
.yam3x-checkbox__control::after {
  inset: max(
    0px,
    calc((var(--_yam3x-checkbox-target-size) - var(--_yam3x-checkbox-state-layer-size)) / 2)
  );
  border-radius: 50%;
  background: var(--_yam3x-checkbox-interaction-color);
}
.yam3x-checkbox__control:hover:not([aria-disabled='true'])::after {
  opacity: var(--_yam3x-checkbox-hover-opacity);
}
.yam3x-checkbox__control:has(.yam3x-checkbox__input:focus-visible)::after {
  opacity: var(--_yam3x-checkbox-focus-opacity);
}
.yam3x-checkbox__control:active:not([aria-disabled='true'])::after,
.yam3x-checkbox__control[data-yam3x-pressed]::after {
  opacity: var(--_yam3x-checkbox-pressed-opacity);
}
.yam3x-checkbox__input:focus-visible + .yam3x-checkbox__state .yam3x-checkbox__box {
  outline: var(--_yam3x-checkbox-focus-outline-width) solid var(--_yam3x-checkbox-focus-indicator);
  outline-offset: var(--_yam3x-checkbox-focus-outline-offset);
}
.yam3x-checkbox:is([data-state='checked'], [data-state='indeterminate']):not(
    .yam3x-checkbox--invalid
  ) {
  --_yam3x-checkbox-interaction-color: var(--md-sys-color-primary);
}
.yam3x-checkbox--invalid {
  --_yam3x-checkbox-interaction-color: var(--md-sys-color-error);
}
.yam3x-checkbox--invalid:is([data-state='checked'], [data-state='indeterminate']) {
  --_yam3x-checkbox-interaction-color: var(--md-sys-color-on-error);
}
.yam3x-checkbox--invalid:is([data-state='checked'], [data-state='indeterminate'])
  .yam3x-checkbox__background {
  background: var(--_yam3x-checkbox-error);
}
.yam3x-checkbox--invalid:is([data-state='checked'], [data-state='indeterminate'])
  .yam3x-checkbox__icon {
  color: var(--_yam3x-checkbox-selected-error-icon);
}
.yam3x-checkbox--invalid[data-state='unchecked'] .yam3x-checkbox__outline {
  border-color: var(--_yam3x-checkbox-error);
}
.yam3x-checkbox--invalid .yam3x-checkbox__description {
  color: var(--_yam3x-checkbox-error);
}
.yam3x-checkbox[data-disabled] {
  --_yam3x-checkbox-interaction-color: var(--_yam3x-checkbox-label);
  color: var(--_yam3x-checkbox-disabled-label);
}
.yam3x-checkbox[data-disabled] .yam3x-checkbox__label {
  cursor: not-allowed;
}
.yam3x-checkbox[data-disabled] .yam3x-checkbox__outline {
  border-color: var(--_yam3x-checkbox-disabled-on-surface);
}
.yam3x-checkbox[data-disabled] .yam3x-checkbox__background {
  background: var(--_yam3x-checkbox-disabled-on-surface);
}
.yam3x-checkbox[data-disabled] .yam3x-checkbox__icon {
  color: var(--_yam3x-checkbox-disabled-icon);
}
.yam3x-checkbox[data-disabled] :is(.yam3x-checkbox__background, .yam3x-checkbox__icon) {
  transition-duration: 0s;
}
.yam3x-checkbox[data-disabled] .yam3x-checkbox__description {
  color: inherit;
}
.yam3x-checkbox--invalid[data-disabled][data-state='unchecked'] .yam3x-checkbox__outline {
  border-color: var(--_yam3x-checkbox-error);
}
.yam3x-checkbox--invalid[data-disabled] .yam3x-checkbox__description {
  color: var(--_yam3x-checkbox-error);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-checkbox__control::after,
  .yam3x-checkbox__background,
  .yam3x-checkbox__icon {
    animation: none;
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-checkbox__outline {
    border-color: CanvasText;
  }
  .yam3x-checkbox__background {
    background: Highlight;
  }
  .yam3x-checkbox__icon {
    color: HighlightText;
  }
  .yam3x-checkbox[data-disabled] .yam3x-checkbox__outline {
    border-color: GrayText;
  }
  .yam3x-checkbox[data-disabled] .yam3x-checkbox__background {
    background: GrayText;
  }
  .yam3x-checkbox[data-disabled] .yam3x-checkbox__icon {
    color: Canvas;
  }
  .yam3x-checkbox__control::after {
    display: none;
  }
  .yam3x-checkbox__input:focus-visible + .yam3x-checkbox__state .yam3x-checkbox__box {
    outline-color: Highlight;
  }
}
</style>
