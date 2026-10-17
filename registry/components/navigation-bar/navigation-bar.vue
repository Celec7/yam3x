<script setup lang="ts">
import { provide } from 'vue'
import type { NavigationBarDestination, NavigationBarLayout } from './navigation-bar.types'
import { navigationBarContextKey } from './navigation-bar.types'

const props = withDefaults(
  defineProps<{
    label: string
    layout?: NavigationBarLayout
  }>(),
  { layout: 'auto' },
)
const modelValue = defineModel<string>({ default: '' })
const emit = defineEmits<{
  navigate: [destination: NavigationBarDestination, event: MouseEvent]
}>()

function activate(destination: NavigationBarDestination, event: MouseEvent) {
  if (destination.disabled || destination.disabledInteractive) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return

  emit('navigate', destination, event)
  if (event.defaultPrevented) return
  modelValue.value = destination.value
}

provide(navigationBarContextKey, { modelValue, activate })
</script>

<template>
  <nav
    class="yam3x-navigation-bar"
    :aria-label="label"
    :data-layout="props.layout"
  >
    <slot />
  </nav>
</template>

<style>
.yam3x-navigation-bar {
  --_yam3x-navigation-bar-container-height: 64px;
  --_yam3x-navigation-bar-container-color: var(--md-sys-color-surface-container);
  --_yam3x-navigation-bar-density-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-navigation-bar-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-navigation-bar-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-navigation-bar-inactive-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-navigation-bar-active-icon-color: var(--md-sys-color-on-secondary-container);
  --_yam3x-navigation-bar-active-label-color: var(--md-sys-color-secondary);
  --_yam3x-navigation-bar-active-indicator-color: var(--md-sys-color-secondary-container);
  --_yam3x-navigation-bar-active-state-layer-color: var(--md-sys-color-on-secondary-container);
  --_yam3x-navigation-bar-inactive-state-layer-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-navigation-bar-disabled-color: var(--md-sys-color-on-surface);
  --_yam3x-navigation-bar-indicator-shape: var(--md-sys-shape-corner-full);
  --_yam3x-navigation-bar-motion-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-navigation-bar-motion-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-navigation-bar-hover-opacity: var(--md-sys-state-hover-opacity);
  --_yam3x-navigation-bar-focus-opacity: var(--md-sys-state-focus-opacity);
  --_yam3x-navigation-bar-pressed-opacity: var(--md-sys-state-pressed-opacity);
  --_yam3x-navigation-bar-label-font-family: var(--md-sys-typescale-label-medium-font-family);
  --_yam3x-navigation-bar-label-font-size: var(--md-sys-typescale-label-medium-font-size);
  --_yam3x-navigation-bar-label-line-height: var(--md-sys-typescale-label-medium-line-height-small);
  --_yam3x-navigation-bar-label-font-weight: var(--md-sys-typescale-label-medium-font-weight);
  --_yam3x-navigation-bar-active-label-font-weight: 700;
  --_yam3x-navigation-bar-compact-item-gap: 6px;
  --_yam3x-navigation-bar-horizontal-item-gap: 4px;
  --_yam3x-navigation-bar-compact-indicator-width: 56px;
  --_yam3x-navigation-bar-compact-indicator-height: 32px;
  --_yam3x-navigation-bar-compact-indicator-top: 12px;
  --_yam3x-navigation-bar-horizontal-indicator-height: 40px;
  --_yam3x-navigation-bar-horizontal-indicator-inset: 16px;
  --_yam3x-navigation-bar-horizontal-item-width: 144px;
  --_yam3x-navigation-bar-horizontal-item-inline-padding: 16px;
  --_yam3x-navigation-bar-icon-size: 24px;

  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  min-height: max(
    48px,
    calc(
      var(--_yam3x-navigation-bar-container-height) *
        var(--_yam3x-navigation-bar-density-container-scale)
    )
  );
  align-items: stretch;
  justify-content: center;
  gap: 0;
  width: 100%;
  background: var(--_yam3x-navigation-bar-container-color);
}
.yam3x-navigation-bar .yam3x-navigation-bar__item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  flex: 1 1 0;
  align-content: center;
  justify-items: center;
  gap: calc(
    var(--_yam3x-navigation-bar-compact-item-gap) *
      var(--_yam3x-navigation-bar-density-spacing-scale)
  );
  padding: calc(8px * var(--_yam3x-navigation-bar-density-spacing-scale))
    calc(4px * var(--_yam3x-navigation-bar-density-spacing-scale));
  color: var(--_yam3x-navigation-bar-inactive-color);
  text-decoration: none;
}
.yam3x-navigation-bar__indicator {
  position: absolute;
  z-index: 0;
  top: var(--_yam3x-navigation-bar-compact-indicator-top);
  left: calc(50% - var(--_yam3x-navigation-bar-compact-indicator-width) / 2);
  width: var(--_yam3x-navigation-bar-compact-indicator-width);
  height: var(--_yam3x-navigation-bar-compact-indicator-height);
  border-radius: var(--_yam3x-navigation-bar-indicator-shape);
  background: transparent;
  opacity: 0;
  transform: scaleX(0);
  transition:
    opacity var(--_yam3x-navigation-bar-motion-effects),
    transform var(--_yam3x-navigation-bar-motion-spatial);
}
.yam3x-navigation-bar__indicator::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--yam3x-state-layer-color);
  content: '';
  opacity: 0;
  transition: opacity var(--_yam3x-navigation-bar-motion-effects);
}
.yam3x-navigation-bar__graphic {
  position: relative;
  flex: none;
  width: var(--_yam3x-navigation-bar-icon-size);
  height: var(--_yam3x-navigation-bar-icon-size);
}
.yam3x-navigation-bar__icon {
  position: relative;
  z-index: 2;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
}
.yam3x-navigation-bar .yam3x-navigation-bar__icon svg {
  width: 100%;
  height: 100%;
}
.yam3x-navigation-bar__badge {
  position: absolute;
  z-index: 3;
  top: -4px;
  inset-inline-end: -4px;
  display: grid;
  place-items: center;
}
.yam3x-navigation-bar__label {
  position: relative;
  z-index: 2;
  font-family: var(--_yam3x-navigation-bar-label-font-family);
  font-size: var(--_yam3x-navigation-bar-label-font-size);
  font-weight: var(--_yam3x-navigation-bar-label-font-weight);
  line-height: calc(
    var(--_yam3x-navigation-bar-label-line-height) * var(--_yam3x-navigation-bar-line-height-scale)
  );
}
.yam3x-navigation-bar .yam3x-navigation-bar__item {
  border-radius: var(--_yam3x-navigation-bar-indicator-shape);
}
.yam3x-navigation-bar .yam3x-navigation-bar__item[aria-current='page'] {
  color: var(--_yam3x-navigation-bar-active-icon-color);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item[aria-current='page']
  .yam3x-navigation-bar__label {
  color: var(--_yam3x-navigation-bar-active-label-color);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item[aria-current='page']
  .yam3x-navigation-bar__label {
  font-weight: var(--_yam3x-navigation-bar-active-label-font-weight);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item[aria-current='page']
  .yam3x-navigation-bar__indicator {
  background: var(--_yam3x-navigation-bar-active-indicator-color);
}
.yam3x-navigation-bar .yam3x-navigation-bar__item:not([aria-current='page']):hover {
  color: var(--_yam3x-navigation-bar-inactive-color);
}
.yam3x-navigation-bar .yam3x-navigation-bar__item::after {
  display: none;
}
.yam3x-navigation-bar .yam3x-navigation-bar__item .yam3x-ripple-container {
  top: var(--_yam3x-navigation-bar-compact-indicator-top);
  left: calc(50% - var(--_yam3x-navigation-bar-compact-indicator-width) / 2);
  width: var(--_yam3x-navigation-bar-compact-indicator-width);
  height: var(--_yam3x-navigation-bar-compact-indicator-height);
  bottom: auto;
  right: auto;
  border-radius: var(--_yam3x-navigation-bar-indicator-shape);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item:not([aria-disabled='true']):is(
    :hover,
    :focus-visible,
    :active,
    [data-yam3x-pressed]
  )
  .yam3x-navigation-bar__indicator {
  opacity: 1;
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item:not([aria-disabled='true']):is(
    :hover,
    :focus-visible,
    :active,
    [data-yam3x-pressed]
  )
  .yam3x-navigation-bar__indicator {
  transform: scaleX(1);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item:not([aria-disabled='true']):hover
  .yam3x-navigation-bar__indicator::after {
  opacity: var(--_yam3x-navigation-bar-hover-opacity);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item:not([aria-disabled='true']):focus-visible
  .yam3x-navigation-bar__indicator::after {
  opacity: var(--_yam3x-navigation-bar-focus-opacity);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item:not([aria-disabled='true']):is(:active, [data-yam3x-pressed])
  .yam3x-navigation-bar__indicator::after {
  opacity: var(--_yam3x-navigation-bar-pressed-opacity);
}
.yam3x-navigation-bar .yam3x-navigation-bar__item[aria-disabled='true'] {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--_yam3x-navigation-bar-disabled-color) 38%, transparent);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item[aria-disabled='true']
  .yam3x-navigation-bar__label,
.yam3x-navigation-bar
  .yam3x-navigation-bar__item[aria-disabled='true']
  .yam3x-navigation-bar__icon {
  color: color-mix(in srgb, var(--_yam3x-navigation-bar-disabled-color) 38%, transparent);
}
.yam3x-navigation-bar
  .yam3x-navigation-bar__item[aria-current='page']:not([aria-disabled='true'])
  .yam3x-navigation-bar__indicator {
  opacity: 1;
  transform: scaleX(1);
}
.yam3x-navigation-bar .yam3x-navigation-bar__item:focus-visible {
  outline-offset: -3px;
}
.yam3x-navigation-bar__label {
  text-align: center;
  transform: translateY(10px);
}
@media (min-width: 600px) {
  .yam3x-navigation-bar[data-layout='auto'] {
    justify-content: center;
  }
  .yam3x-navigation-bar[data-layout='auto'] .yam3x-navigation-bar__item {
    display: flex;
    flex: 0 0 var(--_yam3x-navigation-bar-horizontal-item-width);
    align-items: center;
    justify-content: center;
    gap: calc(
      var(--_yam3x-navigation-bar-horizontal-item-gap) *
        var(--_yam3x-navigation-bar-density-spacing-scale)
    );
    padding: calc(12px * var(--_yam3x-navigation-bar-density-spacing-scale))
      calc(
        var(--_yam3x-navigation-bar-horizontal-item-inline-padding) *
          var(--_yam3x-navigation-bar-density-spacing-scale)
      );
  }
  .yam3x-navigation-bar[data-layout='auto'] .yam3x-navigation-bar__label {
    transform: none;
  }
  .yam3x-navigation-bar[data-layout='auto'] .yam3x-navigation-bar__indicator {
    top: calc(50% - 20px);
    left: var(--_yam3x-navigation-bar-horizontal-indicator-inset);
    width: calc(100% - 2 * var(--_yam3x-navigation-bar-horizontal-indicator-inset));
    height: var(--_yam3x-navigation-bar-horizontal-indicator-height);
    transform-origin: center;
  }
  .yam3x-navigation-bar[data-layout='auto'] .yam3x-navigation-bar__item .yam3x-ripple-container {
    top: calc(50% - 20px);
    left: var(--_yam3x-navigation-bar-horizontal-indicator-inset);
    width: calc(100% - 2 * var(--_yam3x-navigation-bar-horizontal-indicator-inset));
    height: var(--_yam3x-navigation-bar-horizontal-indicator-height);
  }
}
.yam3x-navigation-bar[data-layout='horizontal'] {
  justify-content: center;
}
.yam3x-navigation-bar[data-layout='horizontal'] .yam3x-navigation-bar__item {
  display: flex;
  flex: 0 0 var(--_yam3x-navigation-bar-horizontal-item-width);
  align-items: center;
  justify-content: center;
  gap: calc(
    var(--_yam3x-navigation-bar-horizontal-item-gap) *
      var(--_yam3x-navigation-bar-density-spacing-scale)
  );
  padding: calc(12px * var(--_yam3x-navigation-bar-density-spacing-scale))
    calc(
      var(--_yam3x-navigation-bar-horizontal-item-inline-padding) *
        var(--_yam3x-navigation-bar-density-spacing-scale)
    );
}
.yam3x-navigation-bar[data-layout='horizontal'] .yam3x-navigation-bar__label {
  transform: none;
}
.yam3x-navigation-bar[data-layout='horizontal'] .yam3x-navigation-bar__indicator {
  top: calc(50% - var(--_yam3x-navigation-bar-horizontal-indicator-height) / 2);
  left: var(--_yam3x-navigation-bar-horizontal-indicator-inset);
  width: calc(100% - 2 * var(--_yam3x-navigation-bar-horizontal-indicator-inset));
  height: var(--_yam3x-navigation-bar-horizontal-indicator-height);
  transform-origin: center;
}
.yam3x-navigation-bar[data-layout='horizontal']
  .yam3x-navigation-bar__item
  .yam3x-ripple-container {
  top: calc(50% - var(--_yam3x-navigation-bar-horizontal-indicator-height) / 2);
  left: var(--_yam3x-navigation-bar-horizontal-indicator-inset);
  width: calc(100% - 2 * var(--_yam3x-navigation-bar-horizontal-indicator-inset));
  height: var(--_yam3x-navigation-bar-horizontal-indicator-height);
}
/* Auto uses the project compact-to-medium threshold; horizontal can be forced at any width. */
@media (forced-colors: active) {
  .yam3x-navigation-bar
    .yam3x-navigation-bar__item[aria-current='page']
    .yam3x-navigation-bar__indicator {
    border: 2px solid Highlight;
  }
  .yam3x-navigation-bar
    .yam3x-navigation-bar__item[aria-disabled='true']
    .yam3x-navigation-bar__label,
  .yam3x-navigation-bar
    .yam3x-navigation-bar__item[aria-disabled='true']
    .yam3x-navigation-bar__icon {
    color: GrayText;
  }
  .yam3x-navigation-bar
    .yam3x-navigation-bar__item:not([aria-current='page']):not([aria-disabled='true']) {
    color: LinkText;
  }
  .yam3x-navigation-bar .yam3x-navigation-bar__item:focus-visible {
    outline-color: Highlight;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-navigation-bar__indicator,
  .yam3x-navigation-bar__indicator::after {
    transition: none;
  }
}
</style>
