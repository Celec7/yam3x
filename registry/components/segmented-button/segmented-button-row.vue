<script setup lang="ts">
import { computed, provide, ref, shallowRef } from 'vue'
import {
  segmentedButtonGroupKey,
  type SegmentedButtonChangeDetail,
  type SegmentedButtonItemRecord,
  type SegmentedButtonValue,
} from './segmented-button.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    mode: 'single' | 'multiple'
    modelValue: SegmentedButtonValue
    disabled?: boolean
    name?: string
    density?: 0 | 1 | 2 | 3
  }>(),
  { disabled: false, density: 0 },
)
const emit = defineEmits<{
  'update:modelValue': [value: SegmentedButtonValue]
  change: [detail: SegmentedButtonChangeDetail]
}>()
defineSlots<{ default?(): unknown }>()
const root = ref<HTMLElement | null>(null)
const items = shallowRef<SegmentedButtonItemRecord[]>([])
const focusedValue = ref<string | null>(null)
const selectedValues = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : [],
)
const formValues = computed(() =>
  orderedItems()
    .filter(
      (item) => selectedValues.value.includes(item.value) && !props.disabled && !item.disabled,
    )
    .map((item) => item.value),
)
const densityStyle = computed(() => ({ '--_yam3x-segmented-button-density-step': props.density }))

function orderedItems(): SegmentedButtonItemRecord[] {
  return items.value
    .filter((item) => item.element.isConnected)
    .sort((left, right) => {
      const position = left.element.compareDocumentPosition(right.element)
      return position & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : position & Node.DOCUMENT_POSITION_PRECEDING
          ? 1
          : 0
    })
}

function isSelected(value: string): boolean {
  return selectedValues.value.includes(value)
}

function isDisabled(value: string): boolean {
  return props.disabled || Boolean(items.value.find((item) => item.value === value)?.disabled)
}

function tabIndex(value: string): 0 | -1 {
  if (isDisabled(value)) return -1
  const enabledItems = orderedItems().filter((item) => !item.disabled && !props.disabled)
  const direction = root.value ? getComputedStyle(root.value).direction : 'ltr'
  const initialTabStop = direction === 'rtl' ? enabledItems.at(-1)?.value : enabledItems[0]?.value
  const currentTabStop = enabledItems.some((item) => item.value === focusedValue.value)
    ? focusedValue.value
    : initialTabStop
  return currentTabStop === value ? 0 : -1
}

function registerItem(item: SegmentedButtonItemRecord): () => void {
  items.value = [...items.value, item]
  return () => {
    items.value = items.value.filter((entry) => entry !== item)
    if (focusedValue.value === item.value) focusedValue.value = null
  }
}

function updateItem(item: SegmentedButtonItemRecord): void {
  items.value = items.value.map((entry) => (entry.element === item.element ? item : entry))
}

function select(value: string): void {
  if (props.disabled || isDisabled(value)) return
  const previousValue = Array.isArray(props.modelValue) ? [...props.modelValue] : props.modelValue
  let nextValue: SegmentedButtonValue
  if (props.mode === 'multiple') {
    const values = Array.isArray(previousValue) ? previousValue : []
    nextValue = values.includes(value)
      ? values.filter((entry) => entry !== value)
      : [...values, value]
  } else {
    if (previousValue === value) return
    nextValue = value
  }
  emit('update:modelValue', nextValue)
  emit('change', { previousValue, value: Array.isArray(nextValue) ? [...nextValue] : nextValue })
}

function onFocusin(event: FocusEvent): void {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-segmented-button]')
  if (button && root.value?.contains(button))
    focusedValue.value = button.dataset.segmentedButton ?? null
}

function onKeydown(event: KeyboardEvent): void {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-segmented-button]')
  if (!button || !root.value?.contains(button)) return
  const enabledItems = orderedItems().filter((item) => !item.disabled && !props.disabled)
  if (!enabledItems.length) return
  const index = enabledItems.findIndex((item) => item.element === button)
  if (index < 0) return
  const rtl = getComputedStyle(root.value).direction === 'rtl'
  let nextIndex = -1
  if (event.key === 'ArrowRight')
    nextIndex = (index + (rtl ? -1 : 1) + enabledItems.length) % enabledItems.length
  else if (event.key === 'ArrowLeft')
    nextIndex = (index + (rtl ? 1 : -1) + enabledItems.length) % enabledItems.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = enabledItems.length - 1
  if (nextIndex < 0) return
  event.preventDefault()
  enabledItems[nextIndex]?.element.focus()
}

provide(segmentedButtonGroupKey, {
  mode: props.mode,
  selectedValues,
  disabled: computed(() => props.disabled),
  name: computed(() => props.name),
  isSelected,
  isDisabled,
  tabIndex,
  registerItem,
  updateItem,
  select,
})
</script>

<template>
  <div
    ref="root"
    v-bind="$attrs"
    class="yam3x-segmented-button"
    :class="{
      'yam3x-segmented-button--multi': mode === 'multiple',
      'yam3x-segmented-button--disabled': disabled,
    }"
    :style="densityStyle"
    :role="mode === 'multiple' ? 'group' : 'radiogroup'"
    :aria-disabled="disabled ? 'true' : undefined"
    @keydown="onKeydown"
    @focusin="onFocusin"
  >
    <div class="yam3x-segmented-button__segments">
      <slot />
    </div>
    <input
      v-for="value in formValues"
      :key="value"
      type="hidden"
      :name="name"
      :value="value"
      aria-hidden="true"
      tabindex="-1"
    />
  </div>
</template>

<style>
.yam3x-segmented-button {
  /* System inputs mapped by this component. */
  --_yam3x-segmented-button-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-segmented-button-color-outline: var(--md-sys-color-outline);
  --_yam3x-segmented-button-color-secondary: var(--md-sys-color-secondary);
  --_yam3x-segmented-button-color-secondary-container: var(--md-sys-color-secondary-container);
  --_yam3x-segmented-button-color-on-secondary-container: var(
    --md-sys-color-on-secondary-container
  );
  --_yam3x-segmented-button-shape-full: var(--md-sys-shape-corner-full, 9999px);
  --_yam3x-segmented-button-motion: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-segmented-button-density-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-segmented-button-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-segmented-button-touch-target-size: var(--md-sys-touch-target-size, 48px);
  --_yam3x-segmented-button-label-font-family: var(--md-sys-typescale-label-large-font-family);
  --_yam3x-segmented-button-label-font-size: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-segmented-button-label-font-weight: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-segmented-button-label-line-height: var(--md-sys-typescale-label-large-line-height);
  --_yam3x-segmented-button-label-tracking: var(--md-sys-typescale-label-large-tracking);
  --_yam3x-segmented-button-hover-opacity: var(
    --yam3x-state-layer-hover-opacity,
    var(--md-sys-state-hover-opacity, 0.08)
  );
  --_yam3x-segmented-button-focus-opacity: var(
    --yam3x-state-layer-focus-opacity,
    var(--md-sys-state-focus-opacity, 0.1)
  );
  --_yam3x-segmented-button-pressed-opacity: var(
    --yam3x-ripple-opacity,
    var(--md-sys-state-pressed-opacity, 0.1)
  );
  --_yam3x-segmented-button-focus-indicator-color: var(
    --yam3x-focus-ring-color,
    var(--_yam3x-segmented-button-color-secondary)
  );

  /* Classic outlined component mappings. */
  --_yam3x-segmented-button-density-step: 0;
  --_yam3x-segmented-button-container-height: max(
    28px,
    calc(
      (40px - var(--_yam3x-segmented-button-density-step) * 4px) *
        var(--_yam3x-segmented-button-density-container-scale)
    )
  );
  --_yam3x-segmented-button-outline-width: 1px;
  --_yam3x-segmented-button-icon-size: 18px;
  --_yam3x-segmented-button-outline-color: var(--_yam3x-segmented-button-color-outline);
  --_yam3x-segmented-button-outer-shape: var(--_yam3x-segmented-button-shape-full);
  --_yam3x-segmented-button-spacing: calc(
    8px * var(--_yam3x-segmented-button-density-spacing-scale)
  );
  --_yam3x-segmented-button-padding-start: calc(
    16px * var(--_yam3x-segmented-button-density-spacing-scale)
  );
  --_yam3x-segmented-button-padding-end: calc(
    16px * var(--_yam3x-segmented-button-density-spacing-scale)
  );
  --_yam3x-segmented-button-with-icon-padding-start: calc(
    12px * var(--_yam3x-segmented-button-density-spacing-scale)
  );
  --_yam3x-segmented-button-unselected-label-text-color: var(
    --_yam3x-segmented-button-color-on-surface
  );
  --_yam3x-segmented-button-unselected-icon-color: var(--_yam3x-segmented-button-color-on-surface);
  --_yam3x-segmented-button-selected-container-color: var(
    --_yam3x-segmented-button-color-secondary-container
  );
  --_yam3x-segmented-button-selected-label-text-color: var(
    --_yam3x-segmented-button-color-on-secondary-container
  );
  --_yam3x-segmented-button-selected-icon-color: var(
    --_yam3x-segmented-button-color-on-secondary-container
  );
  --_yam3x-segmented-button-unselected-container-hover-color: var(
    --_yam3x-segmented-button-color-on-surface
  );
  --_yam3x-segmented-button-unselected-ripple-color: var(
    --_yam3x-segmented-button-color-on-surface
  );
  --_yam3x-segmented-button-selected-container-hover-color: var(
    --_yam3x-segmented-button-color-on-secondary-container
  );
  --_yam3x-segmented-button-selected-ripple-color: var(
    --_yam3x-segmented-button-color-on-secondary-container
  );
  --_yam3x-segmented-button-unselected-container-focus-color: var(
    --_yam3x-segmented-button-color-on-surface
  );
  --_yam3x-segmented-button-selected-container-focus-color: var(
    --_yam3x-segmented-button-color-on-secondary-container
  );
  --_yam3x-segmented-button-disabled-outline-color: var(--_yam3x-segmented-button-color-on-surface);
  --_yam3x-segmented-button-disabled-outline-opacity: 12%;
  --_yam3x-segmented-button-disabled-label-text-color: var(
    --_yam3x-segmented-button-color-on-surface
  );
  --_yam3x-segmented-button-disabled-label-text-opacity: 38%;
  --_yam3x-segmented-button-disabled-icon-color: var(--_yam3x-segmented-button-color-on-surface);
  --_yam3x-segmented-button-disabled-icon-opacity: 38%;
  display: inline-flex;
  flex-direction: column;
  width: max-content;
  max-width: 100%;
  vertical-align: middle;
  align-items: stretch;
  isolation: isolate;
  color: var(--_yam3x-segmented-button-color-on-surface);
}
.yam3x-segmented-button__segments {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(max-content, 1fr);
  width: max-content;
  max-width: 100%;
  align-items: center;
}
.yam3x-segmented-button__segment {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 48px;
  min-height: var(--_yam3x-segmented-button-touch-target-size);
  padding: 0;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  --yam3x-state-layer-color: var(--_yam3x-segmented-button-unselected-container-hover-color);
  --yam3x-ripple-color: var(--_yam3x-segmented-button-unselected-ripple-color);
}
.yam3x-segmented-button__segments > .yam3x-segmented-button__segment:first-child {
  border-start-start-radius: var(--_yam3x-segmented-button-outer-shape);
  border-end-start-radius: var(--_yam3x-segmented-button-outer-shape);
}
.yam3x-segmented-button__segments > .yam3x-segmented-button__segment:last-child {
  border-start-end-radius: var(--_yam3x-segmented-button-outer-shape);
  border-end-end-radius: var(--_yam3x-segmented-button-outer-shape);
}
.yam3x-segmented-button__surface {
  position: absolute;
  z-index: -1;
  inset-block-start: 50%;
  inset-inline: 0;
  height: var(--_yam3x-segmented-button-container-height);
  box-sizing: border-box;
  overflow: hidden;
  transform: translateY(-50%);
  border: var(--_yam3x-segmented-button-outline-width) solid
    var(--_yam3x-segmented-button-outline-color);
  border-inline-start-width: var(--_yam3x-segmented-button-outline-width);
  border-radius: 0;
  background: transparent;
  transition: background-color var(--_yam3x-segmented-button-motion);
}
.yam3x-segmented-button__segment:not(:first-child) .yam3x-segmented-button__surface {
  border-inline-start-width: 0;
}
.yam3x-segmented-button__segments
  > .yam3x-segmented-button__segment:first-child
  .yam3x-segmented-button__surface,
.yam3x-segmented-button__segments
  > .yam3x-segmented-button__segment:first-child
  .yam3x-ripple-container {
  border-start-start-radius: var(--_yam3x-segmented-button-outer-shape);
  border-end-start-radius: var(--_yam3x-segmented-button-outer-shape);
}
.yam3x-segmented-button__segments
  > .yam3x-segmented-button__segment:last-child
  .yam3x-segmented-button__surface,
.yam3x-segmented-button__segments
  > .yam3x-segmented-button__segment:last-child
  .yam3x-ripple-container {
  border-start-end-radius: var(--_yam3x-segmented-button-outer-shape);
  border-end-end-radius: var(--_yam3x-segmented-button-outer-shape);
}
.yam3x-segmented-button__content {
  position: relative;
  z-index: 2;
  display: inline-flex;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: var(--_yam3x-segmented-button-spacing);
  padding-inline-start: max(
    calc(12px * var(--_yam3x-segmented-button-density-spacing-scale)),
    var(--_yam3x-segmented-button-padding-start)
  );
  padding-inline-end: max(
    calc(12px * var(--_yam3x-segmented-button-density-spacing-scale)),
    var(--_yam3x-segmented-button-padding-end)
  );
  pointer-events: none;
}
.yam3x-segmented-button__segment--with-icon .yam3x-segmented-button__content {
  padding-inline-start: max(
    calc(12px * var(--_yam3x-segmented-button-density-spacing-scale)),
    var(--_yam3x-segmented-button-with-icon-padding-start)
  );
}
.yam3x-segmented-button__label {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  color: var(--_yam3x-segmented-button-unselected-label-text-color);
  font-family: var(--_yam3x-segmented-button-label-font-family);
  font-size: var(--_yam3x-segmented-button-label-font-size);
  font-weight: var(--_yam3x-segmented-button-label-font-weight);
  line-height: var(--_yam3x-segmented-button-label-line-height);
  letter-spacing: var(--_yam3x-segmented-button-label-tracking);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--_yam3x-segmented-button-motion);
}
.yam3x-segmented-button__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--_yam3x-segmented-button-icon-size);
  height: var(--_yam3x-segmented-button-icon-size);
  color: var(--_yam3x-segmented-button-unselected-icon-color);
}
.yam3x-segmented-button__icon svg {
  display: block;
  width: 100%;
  height: 100%;
}
.yam3x-segmented-button__icon .yam3x-icon {
  width: 100%;
  height: 100%;
  font-size: var(--_yam3x-segmented-button-icon-size);
}
.yam3x-segmented-button__segment--selected:not(.yam3x-segmented-button__segment--disabled)
  .yam3x-segmented-button__surface {
  background-color: var(--_yam3x-segmented-button-selected-container-color);
}
.yam3x-segmented-button__segment--selected .yam3x-segmented-button__label {
  color: var(--_yam3x-segmented-button-selected-label-text-color);
}
.yam3x-segmented-button__segment--selected .yam3x-segmented-button__icon {
  color: var(--_yam3x-segmented-button-selected-icon-color);
}
.yam3x-segmented-button__segment--selected {
  --yam3x-state-layer-color: var(--_yam3x-segmented-button-selected-container-hover-color);
  --yam3x-ripple-color: var(--_yam3x-segmented-button-selected-ripple-color);
}
.yam3x-segmented-button__segment:hover:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-segmented-button-unselected-container-hover-color);
}
.yam3x-segmented-button__segment--selected:hover:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-segmented-button-selected-container-hover-color);
}
.yam3x-segmented-button__segment:focus-visible:not(:disabled) {
  z-index: 1;
  outline: 3px solid var(--_yam3x-segmented-button-focus-indicator-color);
  outline-offset: 2px;
}
.yam3x-segmented-button__segment:focus-visible:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-segmented-button-unselected-container-focus-color);
}
.yam3x-segmented-button__segment--selected:focus-visible:not(:disabled) {
  --yam3x-state-layer-color: var(--_yam3x-segmented-button-selected-container-focus-color);
}
.yam3x-segmented-button__segment.yam3x-state-layer::after {
  z-index: 1;
  inset-block-start: 50%;
  inset-inline: 0;
  height: var(--_yam3x-segmented-button-container-height);
  transform: translateY(-50%);
  border-radius: 0;
  opacity: 0;
  pointer-events: none;
}
.yam3x-segmented-button__segments
  > .yam3x-segmented-button__segment:first-child.yam3x-state-layer::after {
  border-start-start-radius: var(--_yam3x-segmented-button-outer-shape);
  border-end-start-radius: var(--_yam3x-segmented-button-outer-shape);
}
.yam3x-segmented-button__segments
  > .yam3x-segmented-button__segment:last-child.yam3x-state-layer::after {
  border-start-end-radius: var(--_yam3x-segmented-button-outer-shape);
  border-end-end-radius: var(--_yam3x-segmented-button-outer-shape);
}
.yam3x-segmented-button__segment.yam3x-state-layer:hover:not(:disabled)::after {
  opacity: var(--_yam3x-segmented-button-hover-opacity);
}
.yam3x-segmented-button__segment.yam3x-state-layer:focus-visible:not(:disabled)::after {
  opacity: var(--_yam3x-segmented-button-focus-opacity);
}
.yam3x-segmented-button__segment.yam3x-state-layer:is(:active, [data-yam3x-pressed]):not(
    :disabled
  )::after {
  opacity: var(--_yam3x-segmented-button-pressed-opacity);
}
.yam3x-segmented-button__segment:disabled {
  cursor: not-allowed;
}
.yam3x-segmented-button__segment--disabled .yam3x-segmented-button__surface {
  border-color: color-mix(
    in srgb,
    var(--_yam3x-segmented-button-disabled-outline-color)
      var(--_yam3x-segmented-button-disabled-outline-opacity),
    transparent
  );
}
.yam3x-segmented-button__segment--disabled .yam3x-segmented-button__label {
  color: color-mix(
    in srgb,
    var(--_yam3x-segmented-button-disabled-label-text-color)
      var(--_yam3x-segmented-button-disabled-label-text-opacity),
    transparent
  );
}
.yam3x-segmented-button__segment--disabled .yam3x-segmented-button__icon {
  color: color-mix(
    in srgb,
    var(--_yam3x-segmented-button-disabled-icon-color)
      var(--_yam3x-segmented-button-disabled-icon-opacity),
    transparent
  );
}
.yam3x-segmented-button__segment--disabled.yam3x-state-layer::after {
  content: none;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-segmented-button__surface,
  .yam3x-segmented-button__label {
    transition: none !important;
  }
}
@media (forced-colors: active) {
  .yam3x-segmented-button__segments {
    display: inline-grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(max-content, 1fr);
    width: max-content;
    max-width: 100%;
    align-items: center;
  }
  .yam3x-segmented-button__segment {
    color: ButtonText;
  }
  .yam3x-segmented-button__surface {
    border-color: ButtonText;
    transition: none;
  }
  .yam3x-segmented-button__segment--selected:not(.yam3x-segmented-button__segment--disabled)
    .yam3x-segmented-button__surface {
    background: ButtonText;
  }
  .yam3x-segmented-button__segment--selected .yam3x-segmented-button__label,
  .yam3x-segmented-button__segment--selected .yam3x-segmented-button__icon {
    color: ButtonFace;
    forced-color-adjust: none;
  }
  .yam3x-segmented-button__segment:disabled .yam3x-segmented-button__label,
  .yam3x-segmented-button__segment:disabled .yam3x-segmented-button__icon {
    color: GrayText;
  }
  .yam3x-segmented-button__segment:focus-visible:not(:disabled) {
    outline-color: Highlight;
  }
}
</style>
