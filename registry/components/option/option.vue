<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import type {
  OptionHighlightMode,
  OptionSelectionDetail,
  OptionSelectionSource,
} from './option.types'
import { selectOptionContextKey } from '../_shared/select-option.context'

const props = withDefaults(
  defineProps<{
    value: string
    label: string
    id?: string
    selected?: boolean
    disabled?: boolean
    first?: boolean
    last?: boolean
    tabindex?: number
    term?: string
    highlightMode?: OptionHighlightMode
    disableHighlight?: boolean
    hideSelectionIndicator?: boolean
    selectionSource?: OptionSelectionSource
  }>(),
  {
    selected: false,
    disabled: false,
    first: false,
    last: false,
    tabindex: -1,
    term: '',
    highlightMode: 'contains',
    disableHighlight: false,
    hideSelectionIndicator: false,
    selectionSource: 'pointer',
  },
)
const emit = defineEmits<{
  select: [detail: OptionSelectionDetail]
}>()
defineSlots<{
  default?(): unknown
  leading?(): unknown
  'selected-indicator'?(): unknown
  trailing?(): unknown
}>()

const parts = computed(() => {
  const { label, term, highlightMode } = props
  if (props.disableHighlight || selected.value || !term) return [{ text: label, match: false }]
  const source = label.toLocaleLowerCase()
  const needle = term.toLocaleLowerCase()
  const start =
    highlightMode === 'starts-with'
      ? source.startsWith(needle)
        ? 0
        : -1
      : highlightMode === 'ends-with'
        ? source.endsWith(needle)
          ? label.length - term.length
          : -1
        : source.indexOf(needle)
  if (start < 0 || !needle || source.length !== label.length) return [{ text: label, match: false }]
  return [
    ...(start > 0 ? [{ text: label.slice(0, start), match: false }] : []),
    { text: label.slice(start, start + term.length), match: true },
    ...(start + term.length < label.length
      ? [{ text: label.slice(start + term.length), match: false }]
      : []),
  ]
})
const selectContext = inject(selectOptionContextKey, null)
const selected = computed(() => selectContext?.isSelected(props.value) ?? props.selected)
const visible = computed(
  () =>
    selectContext?.isVisible?.({
      value: props.value,
      label: props.label,
      disabled: props.disabled,
      selected: props.selected,
    }) ?? true,
)
const active = computed(() => selectContext?.activeValue.value === props.value)
const generatedId = useId().replace(/:/g, '')
const optionId = computed(() => props.id || `yam3x-option-${generatedId}`)
const root = ref<HTMLElement | null>(null)
let unregister: (() => void) | undefined
function registerWithSelect() {
  unregister?.()
  unregister = selectContext?.register({
    value: props.value,
    label: props.label,
    disabled: props.disabled,
    selected: props.selected,
    id: optionId.value,
    element: root.value,
  })
}
onMounted(registerWithSelect)
watch(
  () => [props.value, props.label, props.disabled, props.selected, optionId.value],
  registerWithSelect,
)
onBeforeUnmount(() => unregister?.())

function activate(source: OptionSelectionSource) {
  if (!props.disabled) {
    selectContext?.select(props.value, source)
    emit('select', { value: props.value, source })
  }
}
function onClick() {
  activate(props.selectionSource)
}
function onKeydown(event: KeyboardEvent) {
  if (props.disabled || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  activate('keyboard')
}
</script>

<template>
  <div
    :id="optionId"
    ref="root"
    v-ripple
    class="yam3x-option yam3x-state-layer"
    :class="{
      'yam3x-option--selected': selected,
      'yam3x-option--active': active,
      'yam3x-option--disabled': disabled,
      'yam3x-option--first': first,
      'yam3x-option--last': last,
    }"
    :hidden="!visible || undefined"
    :data-value="value"
    role="option"
    :tabindex="disabled ? -1 : tabindex"
    :aria-label="label"
    :aria-selected="selected"
    :aria-disabled="disabled ? 'true' : undefined"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span
      v-if="$slots.leading"
      class="yam3x-option__leading"
      ><slot name="leading"
    /></span>
    <span class="yam3x-option__label">
      <slot>
        <template
          v-for="(part, index) in parts"
          :key="index"
        >
          <mark
            v-if="part.match"
            class="yam3x-option__match"
            >{{ part.text }}</mark
          >
          <template v-else>{{ part.text }}</template>
        </template>
      </slot>
    </span>
    <span
      v-if="selected && !hideSelectionIndicator"
      class="yam3x-option__indicator"
      aria-hidden="true"
    >
      <slot name="selected-indicator">
        <Icon name="check" />
      </slot>
    </span>
    <span
      v-if="$slots.trailing"
      class="yam3x-option__trailing"
      ><slot name="trailing"
    /></span>
  </div>
</template>

<style>
.yam3x-option[hidden] {
  display: none;
}

.yam3x-option {
  --_yam3x-option-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-option-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-option-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-option-icon-label-space: var(--yam3x-option-icon-label-space, 8px);
  --_yam3x-option-container-height: var(--yam3x-option-container-height, 44px);
  --_yam3x-option-padding-start: var(--yam3x-option-padding-start, 12px);
  --_yam3x-option-padding-end: var(--yam3x-option-padding-end, 12px);
  --_yam3x-option-shape: var(--yam3x-option-shape, var(--md-sys-shape-corner-extra-small, 4px));
  --_yam3x-option-color: var(--yam3x-option-color, var(--md-sys-color-on-surface));
  --_yam3x-option-label-text-font-size: var(--yam3x-option-label-text-font-size, 14px);
  --_yam3x-option-label-text-font-weight: var(--yam3x-option-label-text-font-weight, 500);
  --_yam3x-option-label-text-line-height: var(--yam3x-option-label-text-line-height, 20px);
  --_yam3x-option-label-text-tracking: var(--yam3x-option-label-text-tracking, 0.1px);
  --_yam3x-option-container-hover-color: var(
    --yam3x-option-container-hover-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-option-container-focus-color: var(
    --yam3x-option-container-focus-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-option-focus-color: var(--md-sys-color-primary);
  --_yam3x-option-focus-opacity: var(--md-sys-state-focus-opacity, 0.12);
  --_yam3x-option-ripple-color: var(--yam3x-option-ripple-color, var(--md-sys-color-on-surface));
  --_yam3x-option-icon-size: var(--yam3x-option-icon-size, 20px);
  --_yam3x-option-panel-text-highlight-container-color: var(
    --yam3x-option-panel-text-highlight-container-color,
    transparent
  );
  --_yam3x-option-panel-text-highlight-color: var(
    --yam3x-option-panel-text-highlight-color,
    currentColor
  );
  --_yam3x-option-selected-shape: var(
    --yam3x-option-selected-shape,
    var(--md-sys-shape-corner-medium, 12px)
  );
  --_yam3x-option-selected-container-color: var(
    --yam3x-option-selected-container-color,
    var(--md-sys-color-tertiary-container)
  );
  --_yam3x-option-selected-color: var(
    --yam3x-option-selected-color,
    var(--md-sys-color-on-tertiary-container)
  );
  --_yam3x-option-selected-container-hover-color: var(
    --yam3x-option-selected-container-hover-color,
    var(--md-sys-color-on-tertiary-container)
  );
  --_yam3x-option-selected-container-focus-color: var(
    --yam3x-option-selected-container-focus-color,
    var(--md-sys-color-on-tertiary-container)
  );
  --_yam3x-option-selected-ripple-color: var(
    --yam3x-option-selected-ripple-color,
    var(--md-sys-color-on-tertiary-container)
  );
  --_yam3x-option-first-child-shape: var(
    --yam3x-option-first-child-shape,
    var(--md-sys-shape-corner-medium, 12px)
  );
  --_yam3x-option-last-child-shape: var(
    --yam3x-option-last-child-shape,
    var(--md-sys-shape-corner-medium, 12px)
  );
  --_yam3x-option-focus-ring-shape: var(--yam3x-option-focus-ring-shape, inherit);
  --_yam3x-option-disabled-color: var(
    --yam3x-option-disabled-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-option-disabled-opacity: var(--yam3x-option-disabled-opacity, 38%);
  position: relative;
  isolation: isolate;
  display: flex;
  flex: none;
  align-items: center;
  box-sizing: border-box;
  gap: calc(var(--_yam3x-option-icon-label-space) * var(--_yam3x-option-spacing-scale));
  min-inline-size: 0;
  min-block-size: max(
    48px,
    calc(var(--_yam3x-option-container-height) * var(--_yam3x-option-container-scale))
  );
  padding-inline-start: calc(
    var(--_yam3x-option-padding-start) * var(--_yam3x-option-spacing-scale)
  );
  padding-inline-end: calc(var(--_yam3x-option-padding-end) * var(--_yam3x-option-spacing-scale));
  overflow: hidden;
  border-radius: var(--_yam3x-option-shape);
  color: var(--_yam3x-option-color);
  font-size: var(--_yam3x-option-label-text-font-size);
  font-weight: var(--_yam3x-option-label-text-font-weight);
  line-height: calc(
    (var(--_yam3x-option-label-text-line-height)) * var(--_yam3x-option-line-height-scale)
  );
  letter-spacing: var(--_yam3x-option-label-text-tracking);
  cursor: pointer;
  outline: none;
  --yam3x-state-layer-color: var(--_yam3x-option-container-hover-color);
  --yam3x-ripple-color: var(--_yam3x-option-ripple-color);
}
.yam3x-option__label {
  flex: 1 1 auto;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.yam3x-option__leading,
.yam3x-option__trailing,
.yam3x-option__indicator {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: var(--_yam3x-option-icon-size);
  block-size: var(--_yam3x-option-icon-size);
}
.yam3x-option__indicator svg {
  inline-size: 100%;
  block-size: 100%;
  fill: currentColor;
}
.yam3x-option__indicator .yam3x-icon {
  inline-size: 100%;
  block-size: 100%;
  font-size: var(--_yam3x-option-icon-size);
}
.yam3x-option__match {
  background: var(--_yam3x-option-panel-text-highlight-container-color);
  color: var(--_yam3x-option-panel-text-highlight-color);
  font-weight: 600;
}
.yam3x-option--selected {
  border-radius: var(--_yam3x-option-selected-shape);
  background: var(--_yam3x-option-selected-container-color);
  color: var(--_yam3x-option-selected-color);
  --yam3x-state-layer-color: var(--_yam3x-option-selected-container-hover-color);
  --yam3x-ripple-color: var(--_yam3x-option-selected-ripple-color);
}
.yam3x-option--first:not(.yam3x-option--last) {
  border-start-start-radius: var(--_yam3x-option-first-child-shape);
  border-start-end-radius: var(--_yam3x-option-first-child-shape);
  border-end-start-radius: var(--_yam3x-option-shape);
  border-end-end-radius: var(--_yam3x-option-shape);
}
.yam3x-option--first.yam3x-option--selected:not(.yam3x-option--last) {
  border-end-start-radius: var(--_yam3x-option-selected-shape);
  border-end-end-radius: var(--_yam3x-option-selected-shape);
}
.yam3x-option--last:not(.yam3x-option--first) {
  border-start-start-radius: var(--_yam3x-option-shape);
  border-start-end-radius: var(--_yam3x-option-shape);
  border-end-start-radius: var(--_yam3x-option-last-child-shape);
  border-end-end-radius: var(--_yam3x-option-last-child-shape);
}
.yam3x-option--last.yam3x-option--selected:not(.yam3x-option--first) {
  border-start-start-radius: var(--_yam3x-option-selected-shape);
  border-start-end-radius: var(--_yam3x-option-selected-shape);
}
.yam3x-option:not(.yam3x-option--disabled):not(.yam3x-option--selected):hover {
  --yam3x-state-layer-color: var(--_yam3x-option-container-hover-color);
}
.yam3x-option:not(.yam3x-option--disabled):not(.yam3x-option--selected):focus-visible {
  outline: 2px solid var(--_yam3x-option-focus-color);
  outline-offset: -2px;
  border-radius: var(--_yam3x-option-focus-ring-shape);
  --yam3x-state-layer-color: var(--_yam3x-option-container-focus-color);
}
.yam3x-option.yam3x-option--selected:not(.yam3x-option--disabled):hover {
  --yam3x-state-layer-color: var(--_yam3x-option-selected-container-hover-color);
}
.yam3x-option.yam3x-option--selected:not(.yam3x-option--disabled):focus-visible {
  outline: 2px solid var(--_yam3x-option-focus-color);
  outline-offset: -2px;
  border-radius: var(--_yam3x-option-focus-ring-shape);
  --yam3x-state-layer-color: var(--_yam3x-option-selected-container-focus-color);
}
.yam3x-option--active:not(.yam3x-option--disabled) {
  --yam3x-state-layer-color: var(--_yam3x-option-container-focus-color);
}
.yam3x-option--active:not(.yam3x-option--disabled)::after {
  opacity: var(--_yam3x-option-focus-opacity);
}
.yam3x-option--selected.yam3x-option--active:not(.yam3x-option--disabled) {
  --yam3x-state-layer-color: var(--_yam3x-option-selected-container-focus-color);
}
.yam3x-option--disabled {
  color: color-mix(
    in srgb,
    var(--_yam3x-option-disabled-color) var(--_yam3x-option-disabled-opacity),
    transparent
  );
  cursor: default;
  --yam3x-state-layer-color: transparent;
  --yam3x-ripple-color: transparent;
}
.yam3x-option--disabled.yam3x-option--selected {
  background: transparent;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-option {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-option {
    color: MenuText;
  }
  .yam3x-option--selected {
    outline: 2px solid SelectedItem;
    color: SelectedItemText;
  }
  .yam3x-option--disabled {
    color: GrayText;
  }
  .yam3x-option:focus-visible,
  .yam3x-option--active {
    outline: 2px solid Highlight;
  }
}
</style>
