<script setup lang="ts">
import { useAttrs } from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    variant?: 'outlined' | 'elevated'
    selectionIndicator?: boolean
    trailingActionLabel?: string
  }>(),
  {
    disabled: false,
    variant: 'outlined',
    selectionIndicator: true,
    trailingActionLabel: 'More actions',
  },
)
const selected = defineModel<boolean>('selected', { default: false })
const emit = defineEmits<{ action: [event: MouseEvent] }>()

const attrs = useAttrs()
</script>

<template>
  <span
    class="yam3x-filter-chip-shell"
    :class="{
      'yam3x-filter-chip-shell--with-action': Boolean($slots['trailing-action']),
      'yam3x-filter-chip-shell--selected': selected,
    }"
  >
    <button
      v-ripple
      v-bind="attrs"
      type="button"
      class="yam3x-filter-chip yam3x-state-layer yam3x-touch-target"
      :class="[
        `yam3x-filter-chip--${variant}`,
        {
          'yam3x-filter-chip--selected': selected,
          'yam3x-filter-chip--has-leading':
            (selected && selectionIndicator) || Boolean($slots.icon),
        },
        { 'yam3x-filter-chip--hide-selection': !selectionIndicator },
      ]"
      :aria-pressed="attrs.role === 'gridcell' ? undefined : selected"
      :disabled="disabled"
      @click="selected = !selected"
    >
      <span
        class="yam3x-filter-chip__leading"
        aria-hidden="true"
      >
        <span
          v-if="$slots.icon"
          class="yam3x-filter-chip__icon"
          ><slot name="icon"
        /></span>
        <Icon
          class="yam3x-filter-chip__check"
          name="check"
        />
      </span>
      <span class="yam3x-filter-chip__label"><slot /></span>
    </button>
    <button
      v-if="$slots['trailing-action']"
      v-ripple
      type="button"
      class="yam3x-filter-chip__action yam3x-state-layer yam3x-touch-target"
      :aria-label="props.trailingActionLabel"
      :disabled="disabled"
      @click.stop="emit('action', $event)"
    >
      <slot name="trailing-action" />
    </button>
  </span>
</template>

<style scoped>
.yam3x-filter-chip-shell {
  --_yam3x-filter-chip-height: calc(32px * var(--md-sys-density-container-scale, 1));
  --_yam3x-filter-chip-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-filter-chip-gap: var(
    --md-sys-spacing-8,
    calc(8px * var(--md-sys-density-spacing-scale, 1))
  );
  --_yam3x-filter-chip-padding: var(
    --md-sys-spacing-16,
    calc(16px * var(--md-sys-density-spacing-scale, 1))
  );
  --_yam3x-filter-chip-icon-padding: var(
    --md-sys-spacing-8,
    calc(8px * var(--md-sys-density-spacing-scale, 1))
  );
  --_yam3x-filter-chip-font: var(--md-sys-typescale-label-large-font);
  --_yam3x-filter-chip-shape: var(--md-sys-shape-corner-small);
  --_yam3x-filter-chip-outline: var(--md-sys-color-outline);
  --_yam3x-filter-chip-label: var(--md-sys-color-on-surface-variant);
  --_yam3x-filter-chip-selected-container: var(--md-sys-color-secondary-container);
  --_yam3x-filter-chip-selected-label: var(--md-sys-color-on-secondary-container);
  --_yam3x-filter-chip-leading-icon: var(--md-sys-color-primary);
  --_yam3x-filter-chip-selected-icon: var(--md-sys-color-on-secondary-container);
  --_yam3x-filter-chip-elevated-container: var(--md-sys-color-surface-container-low);
  --_yam3x-filter-chip-elevation: var(--md-sys-elevation-level1);
  --_yam3x-filter-chip-hover-elevation: var(--md-sys-elevation-level2);
  --_yam3x-filter-chip-motion: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-filter-chip-focus-indicator: var(--md-sys-color-secondary);
  --_yam3x-filter-chip-icon-size: 18px;
  --_yam3x-filter-chip-min-width: 48px;
  --_yam3x-filter-chip-max-width: min(100%, 280px);
  --_yam3x-filter-chip-action-overlap: calc(-1px * var(--_yam3x-filter-chip-spacing-scale));
  --_yam3x-filter-chip-hidden-icon-offset: calc(
    0px - var(--_yam3x-filter-chip-icon-size) - var(--_yam3x-filter-chip-gap)
  );
  --_yam3x-filter-chip-disabled-outline: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 12%,
    transparent
  );
  --_yam3x-filter-chip-disabled-container: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 12%,
    transparent
  );
  --_yam3x-filter-chip-disabled-label: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 38%,
    transparent
  );
  --_yam3x-filter-chip-state-layer: var(--_yam3x-filter-chip-label);
  --_yam3x-filter-chip-trailing-action-color: var(--_yam3x-filter-chip-label);
  --_yam3x-filter-chip-trailing-action-size: var(--_yam3x-filter-chip-height);
  display: inline-flex;
  max-width: 100%;
  align-items: stretch;
}
.yam3x-filter-chip-shell--selected {
  --_yam3x-filter-chip-trailing-action-color: var(--_yam3x-filter-chip-selected-label);
}
.yam3x-filter-chip {
  --yam3x-control-height: var(--_yam3x-filter-chip-height);
  --yam3x-state-layer-color: var(--_yam3x-filter-chip-state-layer);
  --yam3x-ripple-color: var(--_yam3x-filter-chip-state-layer);
  min-height: var(--yam3x-control-height);
  min-width: var(--_yam3x-filter-chip-min-width);
  max-width: var(--_yam3x-filter-chip-max-width);
  gap: var(--_yam3x-filter-chip-gap);
  padding-inline: var(--_yam3x-filter-chip-padding);
  border: 1px solid var(--_yam3x-filter-chip-outline);
  border-radius: var(--_yam3x-filter-chip-shape);
  background: transparent;
  color: var(--_yam3x-filter-chip-label);
  cursor: pointer;
  font: var(--_yam3x-filter-chip-font);
  transition:
    padding-inline-start var(--_yam3x-filter-chip-motion),
    background-color var(--_yam3x-filter-chip-motion),
    border-color var(--_yam3x-filter-chip-motion),
    color var(--_yam3x-filter-chip-motion),
    box-shadow var(--_yam3x-filter-chip-motion);
}
.yam3x-filter-chip--has-leading {
  padding-inline-start: var(--_yam3x-filter-chip-icon-padding);
}
.yam3x-filter-chip--selected {
  --_yam3x-filter-chip-state-layer: var(--_yam3x-filter-chip-selected-label);
  border-color: transparent;
  background: var(--_yam3x-filter-chip-selected-container);
  color: var(--_yam3x-filter-chip-selected-label);
}
.yam3x-filter-chip-shell--with-action .yam3x-filter-chip {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}
.yam3x-filter-chip__action {
  --yam3x-control-height: var(--_yam3x-filter-chip-height);
  --yam3x-state-layer-color: var(--_yam3x-filter-chip-trailing-action-color);
  --yam3x-ripple-color: var(--_yam3x-filter-chip-trailing-action-color);
  display: inline-grid;
  width: var(--_yam3x-filter-chip-trailing-action-size);
  min-width: var(--_yam3x-filter-chip-trailing-action-size);
  height: var(--_yam3x-filter-chip-trailing-action-size);
  min-height: var(--_yam3x-filter-chip-trailing-action-size);
  flex: none;
  place-items: center;
  margin-inline-start: var(--_yam3x-filter-chip-action-overlap);
  border: 1px solid var(--_yam3x-filter-chip-outline);
  border-start-end-radius: var(--_yam3x-filter-chip-shape);
  border-end-end-radius: var(--_yam3x-filter-chip-shape);
  background: transparent;
  color: var(--_yam3x-filter-chip-trailing-action-color);
  cursor: pointer;
}
.yam3x-filter-chip__action:disabled {
  border-color: var(--_yam3x-filter-chip-disabled-outline);
  background: var(--_yam3x-filter-chip-disabled-container);
  color: var(--_yam3x-filter-chip-disabled-label);
  cursor: not-allowed;
}
.yam3x-filter-chip--elevated {
  border-color: transparent;
  background: var(--_yam3x-filter-chip-elevated-container);
  box-shadow: var(--_yam3x-filter-chip-elevation);
}
.yam3x-filter-chip--elevated.yam3x-filter-chip--selected {
  background: var(--_yam3x-filter-chip-selected-container);
}
@media (hover: hover) and (pointer: fine) {
  .yam3x-filter-chip--elevated:hover:not(:disabled) {
    box-shadow: var(--_yam3x-filter-chip-hover-elevation);
  }
}
.yam3x-filter-chip.yam3x-state-layer:focus-visible {
  outline: 3px solid var(--_yam3x-filter-chip-focus-indicator);
  outline-offset: 2px;
}
.yam3x-filter-chip__leading {
  position: relative;
  z-index: 2;
  display: inline-grid;
  width: var(--_yam3x-filter-chip-icon-size);
  height: var(--_yam3x-filter-chip-icon-size);
  flex: none;
  place-items: center;
  margin-inline-start: var(--_yam3x-filter-chip-hidden-icon-offset);
  transition: margin-inline-start var(--_yam3x-filter-chip-motion);
}
.yam3x-filter-chip__label {
  position: relative;
  z-index: 10;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.yam3x-filter-chip--has-leading .yam3x-filter-chip__leading {
  margin-inline-start: 0;
}
.yam3x-filter-chip__icon,
.yam3x-filter-chip__check {
  grid-area: 1 / 1;
  width: var(--_yam3x-filter-chip-icon-size);
  height: var(--_yam3x-filter-chip-icon-size);
}
.yam3x-filter-chip__icon {
  color: var(--_yam3x-filter-chip-leading-icon);
}
.yam3x-filter-chip--selected .yam3x-filter-chip__icon {
  color: var(--_yam3x-filter-chip-selected-icon);
}
.yam3x-filter-chip__check {
  font-size: var(--_yam3x-filter-chip-icon-size);
}
.yam3x-filter-chip__icon {
  display: grid;
  place-items: center;
  opacity: 1;
  transition: opacity var(--_yam3x-filter-chip-motion);
}
.yam3x-filter-chip__icon :deep(svg) {
  width: var(--_yam3x-filter-chip-icon-size);
  height: var(--_yam3x-filter-chip-icon-size);
}
.yam3x-filter-chip__check {
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity var(--_yam3x-filter-chip-motion),
    transform var(--_yam3x-filter-chip-motion);
}
.yam3x-filter-chip--selected .yam3x-filter-chip__icon {
  opacity: 0;
}
.yam3x-filter-chip--selected .yam3x-filter-chip__check {
  opacity: 1;
  transform: scale(1);
}
.yam3x-filter-chip--hide-selection .yam3x-filter-chip__check {
  display: none;
}
.yam3x-filter-chip--hide-selection.yam3x-filter-chip--selected .yam3x-filter-chip__icon {
  opacity: 1;
}
.yam3x-filter-chip:disabled {
  cursor: not-allowed;
  border-color: var(--_yam3x-filter-chip-disabled-outline);
  color: var(--_yam3x-filter-chip-disabled-label);
}
.yam3x-filter-chip:disabled .yam3x-filter-chip__icon {
  color: var(--_yam3x-filter-chip-disabled-label);
}
.yam3x-filter-chip:not(.yam3x-filter-chip--selected):disabled {
  background: transparent;
}
.yam3x-filter-chip--selected:disabled {
  border-color: transparent;
  background: var(--_yam3x-filter-chip-disabled-container);
}
.yam3x-filter-chip--elevated:disabled {
  background: var(--_yam3x-filter-chip-disabled-container);
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-filter-chip,
  .yam3x-filter-chip__leading,
  .yam3x-filter-chip__icon,
  .yam3x-filter-chip__check {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-filter-chip.yam3x-state-layer:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-filter-chip__action:disabled {
    border-color: GrayText;
    color: GrayText;
  }
}
</style>
