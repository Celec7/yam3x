<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { vRipple } from '../_shared/ripple'
import type {
  IconButtonShape,
  IconButtonSize,
  IconButtonVariant,
  IconButtonWidth,
} from './icon-button.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: IconButtonVariant
    size?: IconButtonSize
    width?: IconButtonWidth
    shape?: IconButtonShape
    disabled?: boolean
    disabledInteractive?: boolean
    toggle?: boolean
    role?: 'button' | 'radio'
    type?: 'button' | 'submit' | 'reset'
    href?: string
    id?: string
    name?: string
    value?: string
    form?: string
  }>(),
  {
    variant: 'filled',
    size: 'small',
    width: 'default',
    shape: 'round',
    disabled: false,
    disabledInteractive: false,
    toggle: false,
    role: 'button',
    type: 'button',
    href: undefined,
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
  },
)

const selected = defineModel<boolean>('selected', { default: false })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()
const isLink = computed(() => props.href !== undefined)
const isDisabled = computed(() => props.disabled || props.disabledInteractive)
const resolvedTabindex = computed(() => {
  if (isLink.value && props.disabled) return -1
  if (isLink.value && props.disabledInteractive) return 0
  return attrs.tabindex as string | number | undefined
})
function onClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    return
  }

  emit('click', event)
  if (!props.toggle || isLink.value || event.defaultPrevented) return
  if (props.role === 'radio' && selected.value) return
  selected.value = props.role === 'radio' || !selected.value
}
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-bind="$attrs"
    :id="id"
    v-ripple
    class="yam3x-icon-button yam3x-state-layer yam3x-touch-target"
    :class="[
      `yam3x-icon-button--${variant}`,
      `yam3x-icon-button--size-${size}`,
      `yam3x-icon-button--width-${width}`,
      `yam3x-icon-button--${shape}`,
    ]"
    data-yam3x-ripple-min-pressed-duration="225"
    :href="isLink && !isDisabled ? href : undefined"
    :name="isLink ? undefined : name"
    :value="isLink ? undefined : value"
    :form="isLink ? undefined : form"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : disabled && !disabledInteractive"
    :tabindex="resolvedTabindex"
    :role="isLink ? (isDisabled ? 'link' : undefined) : role"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-pressed="toggle && !isLink && role !== 'radio' ? selected : undefined"
    :aria-checked="toggle && !isLink && role === 'radio' ? selected : undefined"
    @click="onClick"
  >
    <span class="yam3x-icon-button__content">
      <slot
        v-if="toggle && selected"
        name="selected-icon"
        ><slot
      /></slot>
      <slot v-else />
    </span>
  </component>
</template>

<style scoped>
.yam3x-icon-button {
  --_yam3x-icon-button-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-icon-button-density-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-icon-button-touch-target-size: var(--md-sys-touch-target-size);
  --_yam3x-icon-button-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-icon-button-focus-ring-color: var(--md-sys-color-secondary);
  --_yam3x-icon-button-disabled-color: var(--md-sys-color-on-surface);
  --_yam3x-icon-button-focus-ring-thickness: var(--yam3x-focus-ring-thickness, 3px);
  --_yam3x-icon-button-focus-ring-outward-offset: var(--yam3x-focus-ring-outward-offset, 2px);
  --_yam3x-icon-button-focus-ring-duration: var(--yam3x-focus-ring-duration, 500ms);
  --_yam3x-icon-button-focus-ring-growth-factor: var(--yam3x-focus-ring-growth-factor, 2);
  --_yam3x-icon-button-current-radius: var(--_yam3x-icon-button-shape-round);
  --_yam3x-icon-button-leading-space: var(--_yam3x-icon-button-default-leading-space);
  --_yam3x-icon-button-trailing-space: var(--_yam3x-icon-button-default-trailing-space);
  --_yam3x-icon-button-width: calc(
    var(--_yam3x-icon-button-icon-size) +
      (var(--_yam3x-icon-button-leading-space) + var(--_yam3x-icon-button-trailing-space)) *
      var(--_yam3x-icon-button-density-spacing-scale)
  );
  --_yam3x-icon-button-interaction-inset-inline: max(
    0px,
    calc((var(--_yam3x-icon-button-touch-target-size) - var(--_yam3x-icon-button-width)) / 2)
  );
  --_yam3x-icon-button-interaction-inset-block: max(
    0px,
    calc(
      (
          var(--_yam3x-icon-button-touch-target-size) - var(--_yam3x-icon-button-container-height) *
            var(--_yam3x-icon-button-density-container-scale)
        ) /
        2
    )
  );

  appearance: none;
  display: inline-flex;
  width: var(--_yam3x-icon-button-width);
  height: calc(
    var(--_yam3x-icon-button-container-height) * var(--_yam3x-icon-button-density-container-scale)
  );
  align-items: center;
  justify-content: center;
  margin-inline: max(
    calc(0px * var(--_yam3x-icon-button-density-spacing-scale)),
    calc((var(--_yam3x-icon-button-touch-target-size) - var(--_yam3x-icon-button-width)) / 2)
  );
  padding: 0;
  border: 0;
  border-radius: var(--_yam3x-icon-button-current-radius);
  outline: var(--_yam3x-icon-button-outline-thickness) solid var(--_yam3x-icon-button-outline-color);
  outline-offset: calc(0px - var(--_yam3x-icon-button-outline-thickness));
  background: var(--_yam3x-icon-button-container-color);
  box-shadow: var(--_yam3x-icon-button-container-elevation);
  color: var(--_yam3x-icon-button-icon-color);
  cursor: pointer;
  font: inherit;
  text-decoration: none;
  transition:
    border-radius var(--_yam3x-icon-button-fast-effects),
    background-color var(--_yam3x-icon-button-fast-effects),
    color var(--_yam3x-icon-button-fast-effects),
    box-shadow var(--_yam3x-icon-button-fast-effects);
}

.yam3x-icon-button__content {
  position: relative;
  z-index: 2;
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding-inline-start: var(--_yam3x-icon-button-leading-space);
  padding-inline-end: var(--_yam3x-icon-button-trailing-space);
}

.yam3x-icon-button__content :deep(svg),
.yam3x-icon-button__content :deep(.yam3x-icon) {
  display: block;
  width: var(--_yam3x-icon-button-icon-size);
  height: var(--_yam3x-icon-button-icon-size);
  flex: none;
}
.yam3x-icon-button__content :deep(.yam3x-icon) {
  font-size: var(--_yam3x-icon-button-icon-size);
}

.yam3x-icon-button--width-narrow {
  --_yam3x-icon-button-leading-space: var(--_yam3x-icon-button-narrow-leading-space);
  --_yam3x-icon-button-trailing-space: var(--_yam3x-icon-button-narrow-trailing-space);
}
.yam3x-icon-button--width-default {
  --_yam3x-icon-button-leading-space: var(--_yam3x-icon-button-default-leading-space);
  --_yam3x-icon-button-trailing-space: var(--_yam3x-icon-button-default-trailing-space);
}
.yam3x-icon-button--width-wide {
  --_yam3x-icon-button-leading-space: var(--_yam3x-icon-button-wide-leading-space);
  --_yam3x-icon-button-trailing-space: var(--_yam3x-icon-button-wide-trailing-space);
}

.yam3x-icon-button--size-extra-small {
  --_yam3x-icon-button-container-height: 32px;
  --_yam3x-icon-button-outline-thickness: 1px;
  --_yam3x-icon-button-icon-size: 20px;
  --_yam3x-icon-button-shape-round: 16px;
  --_yam3x-icon-button-shape-square: 12px;
  --_yam3x-icon-button-selected-shape-round: 12px;
  --_yam3x-icon-button-selected-shape-square: 16px;
  --_yam3x-icon-button-shape-pressed-morph: 8px;
  --_yam3x-icon-button-narrow-leading-space: 4px;
  --_yam3x-icon-button-narrow-trailing-space: 4px;
  --_yam3x-icon-button-default-leading-space: 6px;
  --_yam3x-icon-button-default-trailing-space: 6px;
  --_yam3x-icon-button-wide-leading-space: 10px;
  --_yam3x-icon-button-wide-trailing-space: 10px;
}
.yam3x-icon-button--size-small {
  --_yam3x-icon-button-container-height: 40px;
  --_yam3x-icon-button-outline-thickness: 1px;
  --_yam3x-icon-button-icon-size: 24px;
  --_yam3x-icon-button-shape-round: 20px;
  --_yam3x-icon-button-shape-square: 12px;
  --_yam3x-icon-button-selected-shape-round: 16px;
  --_yam3x-icon-button-selected-shape-square: 20px;
  --_yam3x-icon-button-shape-pressed-morph: 8px;
  --_yam3x-icon-button-narrow-leading-space: 4px;
  --_yam3x-icon-button-narrow-trailing-space: 4px;
  --_yam3x-icon-button-default-leading-space: 8px;
  --_yam3x-icon-button-default-trailing-space: 8px;
  --_yam3x-icon-button-wide-leading-space: 14px;
  --_yam3x-icon-button-wide-trailing-space: 14px;
}
.yam3x-icon-button--size-medium {
  --_yam3x-icon-button-container-height: 56px;
  --_yam3x-icon-button-outline-thickness: 1px;
  --_yam3x-icon-button-icon-size: 24px;
  --_yam3x-icon-button-shape-round: 28px;
  --_yam3x-icon-button-shape-square: 16px;
  --_yam3x-icon-button-selected-shape-round: 24px;
  --_yam3x-icon-button-selected-shape-square: 28px;
  --_yam3x-icon-button-shape-pressed-morph: 12px;
  --_yam3x-icon-button-narrow-leading-space: 12px;
  --_yam3x-icon-button-narrow-trailing-space: 12px;
  --_yam3x-icon-button-default-leading-space: 16px;
  --_yam3x-icon-button-default-trailing-space: 16px;
  --_yam3x-icon-button-wide-leading-space: 24px;
  --_yam3x-icon-button-wide-trailing-space: 24px;
}
.yam3x-icon-button--size-large {
  --_yam3x-icon-button-container-height: 96px;
  --_yam3x-icon-button-outline-thickness: 2px;
  --_yam3x-icon-button-icon-size: 32px;
  --_yam3x-icon-button-shape-round: 48px;
  --_yam3x-icon-button-shape-square: 28px;
  --_yam3x-icon-button-selected-shape-round: 40px;
  --_yam3x-icon-button-selected-shape-square: 48px;
  --_yam3x-icon-button-shape-pressed-morph: 16px;
  --_yam3x-icon-button-narrow-leading-space: 16px;
  --_yam3x-icon-button-narrow-trailing-space: 16px;
  --_yam3x-icon-button-default-leading-space: 32px;
  --_yam3x-icon-button-default-trailing-space: 32px;
  --_yam3x-icon-button-wide-leading-space: 48px;
  --_yam3x-icon-button-wide-trailing-space: 48px;
}
.yam3x-icon-button--size-extra-large {
  --_yam3x-icon-button-container-height: 136px;
  --_yam3x-icon-button-outline-thickness: 3px;
  --_yam3x-icon-button-icon-size: 40px;
  --_yam3x-icon-button-shape-round: 68px;
  --_yam3x-icon-button-shape-square: 28px;
  --_yam3x-icon-button-selected-shape-round: 56px;
  --_yam3x-icon-button-selected-shape-square: 68px;
  --_yam3x-icon-button-shape-pressed-morph: 16px;
  --_yam3x-icon-button-narrow-leading-space: 32px;
  --_yam3x-icon-button-narrow-trailing-space: 32px;
  --_yam3x-icon-button-default-leading-space: 48px;
  --_yam3x-icon-button-default-trailing-space: 48px;
  --_yam3x-icon-button-wide-leading-space: 72px;
  --_yam3x-icon-button-wide-trailing-space: 72px;
}

.yam3x-icon-button--standard {
  --_yam3x-icon-button-container-color: transparent;
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-icon-button-outline-color: transparent;
  color: var(--_yam3x-icon-button-icon-color);
  background: var(--_yam3x-icon-button-container-color);
  outline-color: var(--_yam3x-icon-button-outline-color);
}
.yam3x-icon-button--filled {
  --_yam3x-icon-button-container-color: var(--md-sys-color-primary);
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-primary);
  --_yam3x-icon-button-outline-color: transparent;
  color: var(--_yam3x-icon-button-icon-color);
  background: var(--_yam3x-icon-button-container-color);
  outline-color: var(--_yam3x-icon-button-outline-color);
}
.yam3x-icon-button--tonal {
  --_yam3x-icon-button-container-color: var(--md-sys-color-secondary-container);
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-secondary-container);
  --_yam3x-icon-button-outline-color: transparent;
  color: var(--_yam3x-icon-button-icon-color);
  background: var(--_yam3x-icon-button-container-color);
  outline-color: var(--_yam3x-icon-button-outline-color);
}
.yam3x-icon-button--outlined {
  --_yam3x-icon-button-container-color: transparent;
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-icon-button-outline-color: var(--md-sys-color-outline-variant);
  color: var(--_yam3x-icon-button-icon-color);
  background: var(--_yam3x-icon-button-container-color);
  outline-color: var(--_yam3x-icon-button-outline-color);
}

.yam3x-icon-button--filled:is([aria-pressed='false'], [aria-checked='false']) {
  --_yam3x-icon-button-container-color: var(--md-sys-color-surface-container);
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-surface-variant);
}
.yam3x-icon-button--filled:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-icon-button-container-color: var(--md-sys-color-primary);
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-primary);
}
.yam3x-icon-button--tonal:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-icon-button-container-color: var(--md-sys-color-secondary);
  --_yam3x-icon-button-icon-color: var(--md-sys-color-on-secondary);
}
.yam3x-icon-button--outlined:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-icon-button-container-color: var(--md-sys-color-inverse-surface);
  --_yam3x-icon-button-icon-color: var(--md-sys-color-inverse-on-surface);
  --_yam3x-icon-button-outline-color: transparent;
}
.yam3x-icon-button--standard:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-icon-button-icon-color: var(--md-sys-color-primary);
}

.yam3x-icon-button--size-extra-small,
.yam3x-icon-button--size-small,
.yam3x-icon-button--size-medium,
.yam3x-icon-button--size-large,
.yam3x-icon-button--size-extra-large {
  --yam3x-control-height: calc(
    var(--_yam3x-icon-button-container-height) * var(--_yam3x-icon-button-density-container-scale)
  );
  --yam3x-control-icon-size: var(--_yam3x-icon-button-icon-size);
}

.yam3x-icon-button--square {
  --_yam3x-icon-button-current-radius: var(--_yam3x-icon-button-shape-square);
}
.yam3x-icon-button--round:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-icon-button-current-radius: var(--_yam3x-icon-button-selected-shape-round);
}
.yam3x-icon-button--square:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-icon-button-current-radius: var(--_yam3x-icon-button-selected-shape-square);
}
.yam3x-icon-button:is(:active, [data-yam3x-pressed]):not(:disabled, [aria-disabled='true']) {
  --_yam3x-icon-button-current-radius: var(--_yam3x-icon-button-shape-pressed-morph);
}
.yam3x-icon-button::before {
  border-radius: calc(
      var(--_yam3x-icon-button-current-radius) + var(--_yam3x-icon-button-interaction-inset-inline)
    ) /
    calc(
      var(--_yam3x-icon-button-current-radius) + var(--_yam3x-icon-button-interaction-inset-block)
    );
  transition: border-radius var(--_yam3x-icon-button-fast-effects);
}
.yam3x-icon-button:focus-visible:not(:disabled, [aria-disabled='true']) {
  outline-width: var(--_yam3x-icon-button-focus-ring-thickness);
  outline-offset: var(--_yam3x-icon-button-focus-ring-outward-offset);
  outline-color: var(--_yam3x-icon-button-focus-ring-color);
  animation: yam3x-icon-button-focus-ring var(--_yam3x-icon-button-focus-ring-duration) ease-in-out;
}
.yam3x-icon-button:focus-visible[aria-disabled='true']:not(:disabled) {
  outline-color: var(--_yam3x-icon-button-focus-ring-color);
  outline-width: var(--_yam3x-icon-button-focus-ring-thickness);
  outline-offset: var(--_yam3x-icon-button-focus-ring-outward-offset);
  animation: yam3x-icon-button-focus-ring var(--_yam3x-icon-button-focus-ring-duration) ease-in-out;
}
.yam3x-icon-button:is([aria-pressed='false'], [aria-checked='false']):focus-visible:not(
    :disabled,
    [aria-disabled='true']
  ) {
  color: var(--_yam3x-icon-button-focus-unselected-icon-color);
  --yam3x-state-layer-color: var(--_yam3x-icon-button-focus-unselected-state-layer-color);
}
.yam3x-icon-button:is([aria-pressed='true'], [aria-checked='true']):focus-visible:not(
    :disabled,
    [aria-disabled='true']
  ) {
  color: var(--_yam3x-icon-button-focus-selected-icon-color);
  --yam3x-state-layer-color: var(--_yam3x-icon-button-focus-selected-state-layer-color);
}
.yam3x-icon-button:is(:active, [data-yam3x-pressed]):not(:disabled, [aria-disabled='true']) {
}

.yam3x-icon-button:is(:disabled, [aria-disabled='true']) {
  outline-color: transparent;
  background: color-mix(in srgb, var(--_yam3x-icon-button-disabled-color) 10%, transparent);
  color: color-mix(in srgb, var(--_yam3x-icon-button-disabled-color) 38%, transparent);
  cursor: not-allowed;
}

@media (forced-colors: active) {
  .yam3x-icon-button {
    transition: none;
  }
  .yam3x-icon-button:not([aria-disabled='true']):not(:disabled) {
    background: ButtonFace;
    outline-color: ButtonText;
    color: ButtonText;
  }
  .yam3x-icon-button:is([aria-pressed='true'], [aria-checked='true']):not(:disabled) {
    background: ButtonText;
    outline-color: transparent;
    color: ButtonFace;
  }
  .yam3x-icon-button:is(:disabled, [aria-disabled='true']) {
    background: Canvas;
    outline-color: GrayText;
    color: GrayText;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-icon-button {
    transition: none;
    animation: none;
  }
  .yam3x-icon-button:focus-visible:not(:disabled, [aria-disabled='true']),
  .yam3x-icon-button:focus-visible[aria-disabled='true']:not(:disabled) {
    animation: none;
  }
}

@keyframes yam3x-icon-button-focus-ring {
  50% {
    outline-width: calc(
      var(--_yam3x-icon-button-focus-ring-thickness) *
        var(--_yam3x-icon-button-focus-ring-growth-factor)
    );
  }
}
</style>
