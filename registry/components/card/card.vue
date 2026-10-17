<script setup lang="ts">
import { computed } from 'vue'
import { vRipple } from '../_shared/ripple'

const props = withDefaults(
  defineProps<{
    variant?: 'elevated' | 'filled' | 'outlined'
    interactive?: boolean
    href?: string
    type?: 'button' | 'submit' | 'reset'
    name?: string
    value?: string
    disabled?: boolean
    disabledInteractive?: boolean
    orientation?: 'horizontal' | 'vertical'
    inline?: boolean
  }>(),
  {
    variant: 'filled',
    interactive: false,
    href: undefined,
    type: 'button',
    name: undefined,
    value: undefined,
    disabled: false,
    disabledInteractive: false,
    orientation: 'vertical',
    inline: false,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const isActionable = computed(() => props.interactive || Boolean(props.href))
const isDisabled = computed(() => props.disabled || props.disabledInteractive)
const rootTag = computed(() => (props.href ? 'a' : isActionable.value ? 'button' : 'div'))
function activate(event: MouseEvent) {
  if (isActionable.value && isDisabled.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }
  if (isActionable.value) emit('click', event)
}
</script>

<template>
  <component
    :is="rootTag"
    v-ripple
    class="yam3x-card rounded-yam3x-md"
    :class="[
      `yam3x-card--${variant}`,
      `yam3x-card--${orientation}`,
      inline && 'yam3x-card--inline',
      $slots.header && 'yam3x-card--has-header',
      $slots.content && 'yam3x-card--has-named-content',
      $slots.actions && 'yam3x-card--has-actions',
      $slots.footer && 'yam3x-card--has-footer',
      isActionable && 'yam3x-card--actionable yam3x-state-layer',
    ]"
    :href="href && !isDisabled ? href : undefined"
    :type="isActionable && !href ? type : undefined"
    :name="isActionable && !href ? name : undefined"
    :value="isActionable && !href ? value : undefined"
    :disabled="!href && isActionable ? disabled && !disabledInteractive : undefined"
    :role="href && isDisabled ? 'link' : undefined"
    :aria-disabled="isActionable && isDisabled ? 'true' : undefined"
    :tabindex="href && isDisabled ? (disabledInteractive ? 0 : -1) : undefined"
    @click="activate"
  >
    <div
      v-if="$slots.header"
      class="yam3x-card__header"
    >
      <slot name="header" />
    </div>
    <div
      class="yam3x-card__content"
      :class="{ 'yam3x-card__content--padded': $slots.content }"
    >
      <slot name="content"><slot /></slot>
    </div>
    <div
      v-if="$slots.actions"
      class="yam3x-card__actions"
    >
      <slot name="actions" />
    </div>
    <div
      v-if="$slots.footer"
      class="yam3x-card__footer"
    >
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
.yam3x-card {
  --_yam3x-card-shape: var(--md-sys-shape-corner-medium);
  --_yam3x-card-padding: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-card-motion: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-card-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-card-outline-variant: var(--md-sys-color-outline-variant);
  --_yam3x-card-outline: var(--md-sys-color-outline);
  --_yam3x-card-surface: var(--md-sys-color-surface);
  --_yam3x-card-surface-variant: var(--md-sys-color-surface-variant);
  --_yam3x-card-elevation-level0: var(--md-sys-elevation-level0);
  --_yam3x-card-elevation-level1: var(--md-sys-elevation-level1);
  --_yam3x-card-elevation-level2: var(--md-sys-elevation-level2);
  display: flex;
  min-width: 0;
  overflow: hidden;
  border-radius: var(--yam3x-card-shape, var(--_yam3x-card-shape));
  transition:
    background-color var(--_yam3x-card-motion),
    box-shadow var(--_yam3x-card-motion),
    border-color var(--_yam3x-card-motion);
}
.yam3x-card--vertical {
  flex-direction: column;
}
.yam3x-card--horizontal {
  flex-direction: row;
  align-items: stretch;
}
.yam3x-card.yam3x-card--inline {
  display: inline-flex;
  width: fit-content;
  vertical-align: middle;
}
.yam3x-card__header,
.yam3x-card__actions,
.yam3x-card__footer {
  display: flex;
  align-items: center;
  flex: none;
}
.yam3x-card__content {
  flex: 1 1 auto;
  min-width: 0;
}
.yam3x-card:not(.yam3x-card--has-named-content) .yam3x-card__content:not(:has(> img, > video)) {
  padding: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--vertical .yam3x-card__header,
.yam3x-card--vertical .yam3x-card__actions,
.yam3x-card--vertical .yam3x-card__footer {
  flex-direction: row;
}
.yam3x-card--horizontal .yam3x-card__header,
.yam3x-card--horizontal .yam3x-card__actions,
.yam3x-card--horizontal .yam3x-card__footer {
  flex-direction: column;
}
.yam3x-card--vertical.yam3x-card--has-header:not(
    :has(.yam3x-card__header > img, .yam3x-card__header > video)
  )
  .yam3x-card__header {
  margin: var(--yam3x-card-padding, var(--_yam3x-card-padding))
    var(--yam3x-card-padding, var(--_yam3x-card-padding)) 0;
}
.yam3x-card--horizontal.yam3x-card--has-header:not(
    :has(.yam3x-card__header > img, .yam3x-card__header > video)
  )
  .yam3x-card__header {
  margin: var(--yam3x-card-padding, var(--_yam3x-card-padding)) 0
    var(--yam3x-card-padding, var(--_yam3x-card-padding))
    var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card__header:has(> img, > video) {
  overflow: hidden;
}
.yam3x-card__header:has(> img, > video) :is(img, video) {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}
.yam3x-card--vertical.yam3x-card--has-named-content .yam3x-card__content {
  margin-inline: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--vertical.yam3x-card--has-named-content:not(.yam3x-card--has-header)
  .yam3x-card__content {
  margin-block-start: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--vertical.yam3x-card--has-named-content:not(.yam3x-card--has-actions):not(
    .yam3x-card--has-footer
  )
  .yam3x-card__content {
  margin-block-end: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--horizontal.yam3x-card--has-named-content .yam3x-card__content {
  margin-block: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--horizontal.yam3x-card--has-named-content:not(.yam3x-card--has-header)
  .yam3x-card__content {
  margin-inline-start: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--horizontal.yam3x-card--has-named-content:not(.yam3x-card--has-actions):not(
    .yam3x-card--has-footer
  )
  .yam3x-card__content {
  margin-inline-end: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--has-actions .yam3x-card__actions {
  margin: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--vertical.yam3x-card--has-footer .yam3x-card__footer {
  margin-inline: var(--yam3x-card-padding, var(--_yam3x-card-padding));
  margin-block-end: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--horizontal.yam3x-card--has-footer .yam3x-card__footer {
  margin-block: var(--yam3x-card-padding, var(--_yam3x-card-padding));
  margin-inline-end: var(--yam3x-card-padding, var(--_yam3x-card-padding));
}
.yam3x-card--elevated {
  --_yam3x-card-container-color: var(--md-sys-color-surface-container-low);
  color: var(--_yam3x-card-on-surface);
  background: var(--_yam3x-card-container-color);
  box-shadow: var(--_yam3x-card-elevation-level1);
}
.yam3x-card--filled {
  --_yam3x-card-container-color: var(--md-sys-color-surface-container-highest);
  color: var(--_yam3x-card-on-surface);
  background: var(--_yam3x-card-container-color);
  box-shadow: var(--_yam3x-card-elevation-level0);
}
.yam3x-card--outlined {
  --_yam3x-card-container-color: var(--_yam3x-card-surface);
  --_yam3x-card-outline-color: var(--_yam3x-card-outline-variant);
  color: var(--_yam3x-card-on-surface);
  border: 1px solid var(--_yam3x-card-outline-color);
  background: var(--_yam3x-card-container-color);
  box-shadow: var(--_yam3x-card-elevation-level0);
}
.yam3x-card--actionable {
  --yam3x-state-layer-color: var(--_yam3x-card-on-surface);
  display: flex;
  box-sizing: border-box;
  width: 100%;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: start;
  text-decoration: none;
  user-select: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.yam3x-card--inline.yam3x-card--actionable {
  display: inline-flex;
  width: fit-content;
}
.yam3x-card--outlined.yam3x-card--actionable {
  border-width: 1px;
  border-style: solid;
  border-color: var(
    --_yam3x-card-outlined-outline-color,
    var(--_yam3x-card-outline-color, var(--_yam3x-card-outline-variant))
  );
}
.yam3x-card--actionable:disabled,
.yam3x-card--actionable[aria-disabled='true'] {
  cursor: not-allowed;
}
.yam3x-card--actionable {
  --_yam3x-card-hover-text: var(--_yam3x-card-on-surface);
  --_yam3x-card-hover-layer: var(--_yam3x-card-on-surface);
  --_yam3x-card-hover-opacity: 8%;
  --_yam3x-card-focus-text: var(--_yam3x-card-on-surface);
  --_yam3x-card-focus-layer: var(--_yam3x-card-on-surface);
  --_yam3x-card-focus-opacity: 10%;
  --_yam3x-card-pressed-text: var(--_yam3x-card-on-surface);
  --_yam3x-card-pressed-layer: var(--_yam3x-card-on-surface);
  --_yam3x-card-pressed-opacity: 10%;
  --_yam3x-card-hover-outline: var(--_yam3x-card-outline-variant);
  --_yam3x-card-focus-outline: var(--_yam3x-card-on-surface);
  --_yam3x-card-pressed-outline: var(--_yam3x-card-outline-variant);
}
.yam3x-card--filled.yam3x-card--actionable {
  --_yam3x-card-hover-elevation: var(--_yam3x-card-elevation-level1);
  --_yam3x-card-focus-elevation: var(--_yam3x-card-elevation-level0);
  --_yam3x-card-pressed-elevation: var(--_yam3x-card-elevation-level0);
}
.yam3x-card--elevated.yam3x-card--actionable {
  --_yam3x-card-hover-elevation: var(--_yam3x-card-elevation-level2);
  --_yam3x-card-focus-elevation: var(--_yam3x-card-elevation-level1);
  --_yam3x-card-pressed-elevation: var(--_yam3x-card-elevation-level1);
}
.yam3x-card--outlined.yam3x-card--actionable {
  --_yam3x-card-hover-elevation: var(--_yam3x-card-elevation-level1);
  --_yam3x-card-focus-elevation: var(--_yam3x-card-elevation-level0);
  --_yam3x-card-pressed-elevation: var(--_yam3x-card-elevation-level0);
}
.yam3x-card--actionable {
  --yam3x-ripple-color: var(--_yam3x-card-pressed-layer, var(--_yam3x-card-on-surface));
}
.yam3x-card--actionable::after {
  background: var(--_yam3x-card-hover-layer, var(--_yam3x-card-on-surface));
}
.yam3x-card--actionable:hover::after {
  background: var(--_yam3x-card-hover-layer);
}
.yam3x-card--actionable:focus-visible::after {
  background: var(--_yam3x-card-focus-layer, var(--_yam3x-card-on-surface));
}
.yam3x-card--actionable:is(:active, [data-yam3x-pressed])::after {
  background: var(--_yam3x-card-pressed-layer, var(--_yam3x-card-on-surface));
}
.yam3x-card--actionable:hover:not(:disabled, [aria-disabled='true']) {
  color: var(--_yam3x-card-hover-text);
  box-shadow: var(--_yam3x-card-hover-elevation);
  --md-sys-state-hover-opacity: var(--_yam3x-card-hover-opacity);
}
.yam3x-card--actionable:focus-visible:not(:disabled, [aria-disabled='true']) {
  color: var(--_yam3x-card-focus-text);
  box-shadow: var(--_yam3x-card-focus-elevation);
  --md-sys-state-focus-opacity: var(--_yam3x-card-focus-opacity);
}
.yam3x-card--actionable:is(:active, [data-yam3x-pressed]):not(:disabled, [aria-disabled='true']) {
  color: var(--_yam3x-card-pressed-text);
  box-shadow: var(--_yam3x-card-pressed-elevation);
  --md-sys-state-pressed-opacity: var(--_yam3x-card-pressed-opacity);
}
.yam3x-card--outlined.yam3x-card--actionable:hover:not(:disabled, [aria-disabled='true']) {
  border-color: var(--_yam3x-card-hover-outline);
}
.yam3x-card--outlined.yam3x-card--actionable:focus-visible:not(:disabled, [aria-disabled='true']) {
  border-color: var(--_yam3x-card-focus-outline);
}
.yam3x-card--outlined.yam3x-card--actionable:is(:active, [data-yam3x-pressed]):not(
    :disabled,
    [aria-disabled='true']
  ) {
  border-color: var(--_yam3x-card-pressed-outline);
}
.yam3x-card--actionable:disabled,
.yam3x-card--actionable[aria-disabled='true'] {
  box-shadow: none;
  color: color-mix(
    in srgb,
    var(--_yam3x-card-disabled-text-color) var(--_yam3x-card-disabled-text-opacity),
    transparent
  );
}
.yam3x-card--filled.yam3x-card--actionable:is(:disabled, [aria-disabled='true']) {
  --_yam3x-card-disabled-image-opacity: var(
    --_yam3x-card-filled-disabled-image-opacity,
    var(--_yam3x-card-disabled-image-opacity, 0.38)
  );
  --_yam3x-card-disabled-shadow-color: color-mix(
    in srgb,
    var(--_yam3x-card-on-surface) 38%,
    transparent
  );
  --yam3x-elevation-color: var(--_yam3x-card-disabled-shadow-color);
  --_yam3x-card-disabled-text-color: var(
    --_yam3x-card-filled-disabled-text-color,
    var(--_yam3x-card-disabled-text-color, var(--_yam3x-card-on-surface))
  );
  --_yam3x-card-disabled-text-opacity: var(
    --_yam3x-card-filled-disabled-text-opacity,
    var(--_yam3x-card-disabled-text-opacity, 38%)
  );
  background: color-mix(in srgb, var(--_yam3x-card-surface-variant) 38%, transparent);
  box-shadow: none;
}
.yam3x-card--elevated.yam3x-card--actionable:is(:disabled, [aria-disabled='true']) {
  --_yam3x-card-disabled-image-opacity: var(
    --_yam3x-card-elevated-disabled-image-opacity,
    var(--_yam3x-card-disabled-image-opacity, 0.38)
  );
  --_yam3x-card-disabled-shadow-color: color-mix(
    in srgb,
    var(--_yam3x-card-on-surface) 38%,
    transparent
  );
  --yam3x-elevation-color: var(--_yam3x-card-disabled-shadow-color);
  --_yam3x-card-disabled-text-color: var(
    --_yam3x-card-elevated-disabled-text-color,
    var(--_yam3x-card-disabled-text-color, var(--_yam3x-card-on-surface))
  );
  --_yam3x-card-disabled-text-opacity: var(
    --_yam3x-card-elevated-disabled-text-opacity,
    var(--_yam3x-card-disabled-text-opacity, 38%)
  );
  background: color-mix(in srgb, var(--_yam3x-card-surface) 38%, transparent);
  box-shadow: var(
    --_yam3x-card-elevated-disabled-container-elevation,
    var(
      --_yam3x-card-disabled-container-elevation,
      0px 2px 1px -1px color-mix(in srgb, var(--_yam3x-card-disabled-shadow-color) 20%, transparent),
      0px 1px 1px 0px color-mix(in srgb, var(--_yam3x-card-disabled-shadow-color) 14%, transparent),
      0px 1px 3px 0px color-mix(in srgb, var(--_yam3x-card-disabled-shadow-color) 12%, transparent)
    )
  );
}
.yam3x-card--outlined.yam3x-card--actionable:is(:disabled, [aria-disabled='true']) {
  --_yam3x-card-disabled-image-opacity: var(
    --_yam3x-card-outlined-disabled-image-opacity,
    var(--_yam3x-card-disabled-image-opacity, 0.38)
  );
  --_yam3x-card-disabled-shadow-color: color-mix(
    in srgb,
    var(--_yam3x-card-on-surface) 38%,
    transparent
  );
  --yam3x-elevation-color: var(--_yam3x-card-disabled-shadow-color);
  --_yam3x-card-disabled-text-color: var(
    --_yam3x-card-outlined-disabled-text-color,
    var(--_yam3x-card-disabled-text-color, var(--_yam3x-card-on-surface))
  );
  --_yam3x-card-disabled-text-opacity: var(
    --_yam3x-card-outlined-disabled-text-opacity,
    var(--_yam3x-card-disabled-text-opacity, 38%)
  );
  box-shadow: none;
  background: transparent;
  border-color: color-mix(in srgb, var(--_yam3x-card-outline) 12%, transparent);
}
.yam3x-card--actionable:is(:disabled, [aria-disabled='true']) img,
.yam3x-card--actionable:is(:disabled, [aria-disabled='true']) video {
  opacity: var(--_yam3x-card-disabled-image-opacity, 0.38);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-card {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-card {
    border-style: solid !important;
    border-color: CanvasText !important;
    border-width: 1px !important;
  }
  .yam3x-card--actionable:disabled,
  .yam3x-card--actionable[aria-disabled='true'] {
    color: GrayText !important;
    border-color: GrayText !important;
  }
  .yam3x-card--actionable:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
</style>
