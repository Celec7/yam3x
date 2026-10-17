<script setup lang="ts">
import { computed, inject, ref, useId } from 'vue'
import { radioGroupContextKey } from './radio-group.types'
import { vRipple } from '../_shared/ripple'

const props = withDefaults(
  defineProps<{
    value: string
    description?: string
    disabled?: boolean
    id?: string
  }>(),
  {
    description: undefined,
    disabled: false,
    id: undefined,
  },
)
const injectedContext = inject(radioGroupContextKey)
if (!injectedContext) throw new Error('RadioButton must be used inside RadioGroup.')
const context = injectedContext

const generatedId = useId()
const inputId = computed(() => props.id ?? `yam3x-radio-${generatedId}`)
const descriptionId = computed(() => `${inputId.value}-description`)
const checked = computed(() => context.modelValue.value === props.value)
const disabled = computed(() => context.disabled.value || props.disabled)
const target = ref<HTMLElement>()

function onClick(): void {
  if (disabled.value || checked.value) return
  context.requestSelect(props.value)
}

function onLabelPointerDown(event: PointerEvent): void {
  const host = target.value
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
      bubbles: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: true,
      button: event.button,
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
    }),
  )
}
</script>

<template>
  <div
    class="yam3x-radio-button"
    :data-state="checked ? 'selected' : 'unselected'"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="context.invalid.value ? 'true' : undefined"
  >
    <label
      class="yam3x-radio-button__label"
      :for="inputId"
      @pointerdown="onLabelPointerDown"
    >
      <span
        ref="target"
        v-ripple
        class="yam3x-radio-button__target yam3x-touch-target"
        data-yam3x-ripple=""
        data-yam3x-ripple-role="radio"
        data-yam3x-ripple-min-pressed-duration="225"
        data-yam3x-ripple-target=".yam3x-radio-button__state"
        data-yam3x-ripple-container-target=".yam3x-radio-button__state"
        :aria-disabled="disabled ? 'true' : undefined"
      >
        <input
          :id="inputId"
          class="yam3x-radio-button__input"
          type="radio"
          :name="context.name.value"
          :value="value"
          :form="context.form.value"
          :checked="checked"
          :disabled="disabled"
          :required="context.required.value"
          :aria-invalid="context.invalid.value ? 'true' : undefined"
          :aria-describedby="description ? descriptionId : undefined"
          data-yam3x-radio-input
          @click="onClick"
        />
        <span
          class="yam3x-radio-button__state yam3x-state-layer"
          aria-hidden="true"
        >
          <svg
            class="yam3x-radio-button__icon"
            viewBox="0 0 20 20"
            focusable="false"
          >
            <circle
              class="yam3x-radio-button__ring"
              cx="10"
              cy="10"
              r="9"
            />
            <circle
              v-if="checked"
              class="yam3x-radio-button__dot"
              cx="10"
              cy="10"
              r="5"
            />
          </svg>
        </span>
      </span>
      <span class="yam3x-radio-button__text"><slot /></span>
    </label>
    <span
      v-if="description"
      :id="descriptionId"
      class="yam3x-radio-button__description"
      >{{ description }}</span
    >
  </div>
</template>

<style scoped>
.yam3x-radio-button {
  --_yam3x-radio-color-primary: var(--md-sys-color-primary);
  --_yam3x-radio-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-radio-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-radio-color-secondary: var(--md-sys-color-secondary);
  --_yam3x-radio-color-error: var(--md-sys-color-error);
  --_yam3x-radio-hover-state-layer-opacity: var(--md-sys-state-hover-opacity);
  --_yam3x-radio-focus-state-layer-opacity: var(--md-sys-state-focus-opacity);
  --_yam3x-radio-pressed-state-layer-opacity: var(--md-sys-state-pressed-opacity);
  --_yam3x-radio-motion-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-radio-icon-size: 20px;
  --_yam3x-radio-state-layer-size: 40px;
  --_yam3x-radio-target-size: 48px;
  --_yam3x-radio-focus-ring-width: 2px;
  --_yam3x-radio-focus-ring-offset: 4px;
  --_yam3x-radio-label-gap: calc(4px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-radio-description-offset: calc(-4px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-radio-description-padding: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-radio-icon-selected-color: var(--_yam3x-radio-color-primary);
  --_yam3x-radio-icon-unselected-color: var(--_yam3x-radio-color-on-surface-variant);
  --_yam3x-radio-hover-selected-state-layer-color: var(--_yam3x-radio-color-primary);
  --_yam3x-radio-hover-unselected-state-layer-color: var(--_yam3x-radio-color-on-surface);
  --_yam3x-radio-focus-selected-state-layer-color: var(--_yam3x-radio-color-primary);
  --_yam3x-radio-focus-unselected-state-layer-color: var(--_yam3x-radio-color-on-surface);
  --_yam3x-radio-pressed-selected-state-layer-color: var(--_yam3x-radio-color-on-surface);
  --_yam3x-radio-pressed-unselected-state-layer-color: var(--_yam3x-radio-color-primary);
  --_yam3x-radio-disabled-icon-opacity: 38%;
  --_yam3x-radio-focus-ring-color: var(--_yam3x-radio-color-secondary);
  --_yam3x-radio-error-state-color: var(--_yam3x-radio-color-error);
  --_yam3x-radio-label-font-family: var(--md-sys-typescale-body-large-font-family);
  --_yam3x-radio-label-font-size: var(--md-sys-typescale-body-large-font-size);
  --_yam3x-radio-label-font-weight: var(--md-sys-typescale-body-large-font-weight);
  --_yam3x-radio-label-line-height: var(--md-sys-typescale-body-large-line-height);
  --_yam3x-radio-label-tracking: var(--md-sys-typescale-body-large-tracking);
  --_yam3x-radio-description-font-family: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-radio-description-font-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-radio-description-font-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-radio-description-line-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-radio-description-tracking: var(--md-sys-typescale-body-medium-tracking);
  min-height: var(--_yam3x-radio-target-size);
  width: fit-content;
  color: var(--_yam3x-radio-color-on-surface);
}
.yam3x-radio-button__label {
  display: grid;
  grid-template-columns: var(--_yam3x-radio-target-size) minmax(0, 1fr);
  align-items: center;
  column-gap: var(--_yam3x-radio-label-gap);
  min-height: var(--_yam3x-radio-target-size);
  cursor: pointer;
  user-select: none;
}
.yam3x-radio-button__target {
  position: relative;
  display: grid;
  grid-column: 1;
  grid-row: 1;
  width: var(--_yam3x-radio-target-size);
  height: var(--_yam3x-radio-target-size);
  place-items: center;
  border-radius: 50%;
}
.yam3x-radio-button__input {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: var(--_yam3x-radio-target-size);
  height: var(--_yam3x-radio-target-size);
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.yam3x-radio-button__state {
  position: relative;
  display: grid;
  width: var(--_yam3x-radio-state-layer-size);
  height: var(--_yam3x-radio-state-layer-size);
  place-items: center;
  border-radius: 50%;
  color: var(--_yam3x-radio-icon-unselected-color);
  pointer-events: none;
}
.yam3x-radio-button__icon {
  display: block;
  width: var(--_yam3x-radio-icon-size);
  height: var(--_yam3x-radio-icon-size);
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.yam3x-radio-button__dot {
  fill: currentColor;
  stroke: none;
}
.yam3x-radio-button[data-state='selected'] .yam3x-radio-button__state {
  color: var(--_yam3x-radio-icon-selected-color);
}
.yam3x-radio-button__text {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
  color: var(--_yam3x-radio-color-on-surface);
  font-family: var(--_yam3x-radio-label-font-family);
  font-size: var(--_yam3x-radio-label-font-size);
  font-weight: var(--_yam3x-radio-label-font-weight);
  line-height: var(--_yam3x-radio-label-line-height);
  letter-spacing: var(--_yam3x-radio-label-tracking);
}
.yam3x-radio-button__description {
  display: block;
  margin-inline-start: calc(var(--_yam3x-radio-target-size) + var(--_yam3x-radio-label-gap));
  margin-block-start: var(--_yam3x-radio-description-offset);
  padding-block-end: var(--_yam3x-radio-description-padding);
  color: var(--_yam3x-radio-color-on-surface-variant);
  font-family: var(--_yam3x-radio-description-font-family);
  font-size: var(--_yam3x-radio-description-font-size);
  font-weight: var(--_yam3x-radio-description-font-weight);
  line-height: var(--_yam3x-radio-description-line-height);
  letter-spacing: var(--_yam3x-radio-description-tracking);
}
.yam3x-radio-button[data-disabled] .yam3x-radio-button__state {
  color: color-mix(
    in srgb,
    var(--_yam3x-radio-color-on-surface) var(--_yam3x-radio-disabled-icon-opacity),
    transparent
  );
}
.yam3x-radio-button__input:focus-visible + .yam3x-radio-button__state {
  outline: var(--_yam3x-radio-focus-ring-width) solid var(--_yam3x-radio-focus-ring-color);
  outline-offset: var(--_yam3x-radio-focus-ring-offset);
}
.yam3x-radio-button__target:not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-radio-hover-unselected-state-layer-color);
  --yam3x-ripple-color: var(--_yam3x-radio-pressed-unselected-state-layer-color);
}
.yam3x-radio-button[data-state='selected'] .yam3x-radio-button__target:not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-radio-hover-selected-state-layer-color);
  --yam3x-ripple-color: var(--_yam3x-radio-pressed-selected-state-layer-color);
}
.yam3x-radio-button__target:not([aria-disabled='true']):has(
    .yam3x-radio-button__input:focus-visible
  ) {
  --yam3x-state-layer-color: var(--_yam3x-radio-focus-unselected-state-layer-color);
}
.yam3x-radio-button[data-state='selected']
  .yam3x-radio-button__target:not([aria-disabled='true']):has(
    .yam3x-radio-button__input:focus-visible
  ) {
  --yam3x-state-layer-color: var(--_yam3x-radio-focus-selected-state-layer-color);
}
.yam3x-radio-button[data-invalid='true'] .yam3x-radio-button__target:not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-radio-error-state-color);
  --yam3x-ripple-color: var(--_yam3x-radio-error-state-color);
}
.yam3x-radio-button[data-invalid='true'] .yam3x-radio-button__state {
  color: var(--_yam3x-radio-error-state-color);
}
.yam3x-radio-button[data-invalid='true']
  .yam3x-radio-button__target:not([aria-disabled='true']):has(
    .yam3x-radio-button__input:focus-visible
  ) {
  --yam3x-state-layer-color: var(--_yam3x-radio-error-state-color);
}
.yam3x-radio-button__target:hover .yam3x-radio-button__state::after,
.yam3x-radio-button__label:hover .yam3x-radio-button__state::after {
  opacity: var(--_yam3x-radio-hover-state-layer-opacity);
}
.yam3x-radio-button__target:has(.yam3x-radio-button__input:focus-visible)
  .yam3x-radio-button__state::after {
  opacity: var(--_yam3x-radio-focus-state-layer-opacity);
}
.yam3x-radio-button__target:active .yam3x-radio-button__state::after,
.yam3x-radio-button__target[data-yam3x-pressed] .yam3x-radio-button__state::after,
.yam3x-radio-button__label:active .yam3x-radio-button__state::after {
  opacity: var(--_yam3x-radio-pressed-state-layer-opacity);
}
.yam3x-radio-button__label:hover .yam3x-radio-button__state::after {
  transition: opacity var(--_yam3x-radio-motion-fast-effects);
}
.yam3x-radio-button[data-disabled] .yam3x-radio-button__state::after,
.yam3x-radio-button:has(.yam3x-radio-button__input:disabled) .yam3x-radio-button__state::after {
  opacity: 0;
}
@media (forced-colors: active) {
  .yam3x-radio-button__input:focus-visible + .yam3x-radio-button__state {
    outline-color: Highlight;
  }
  .yam3x-radio-button[data-disabled] .yam3x-radio-button__state,
  .yam3x-radio-button:has(.yam3x-radio-button__input:disabled) .yam3x-radio-button__state {
    color: GrayText;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-radio-button__state::after {
    transition: none;
  }
}
</style>
