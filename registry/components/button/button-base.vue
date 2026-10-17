<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { vRipple } from '../_shared/ripple'
import {
  buttonVariants,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from './button.variants'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    role?: string
    type?: 'button' | 'submit' | 'reset'
    href?: string
    id?: string
    name?: string
    value?: string
    form?: string
    disabled?: boolean
    disabledInteractive?: boolean
    toggle?: boolean
  }>(),
  {
    variant: 'filled',
    size: 'small',
    shape: 'round',
    type: 'button',
    href: undefined,
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
    disabled: false,
    disabledInteractive: false,
    toggle: false,
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
const isToggle = computed(() => props.toggle && !isLink.value)
const resolvedVariant = computed<ButtonVariant>(() =>
  isToggle.value && props.variant === 'text' ? 'filled' : props.variant,
)
const classes = computed(() => buttonVariants({ variant: resolvedVariant.value, size: props.size }))

function onClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }

  emit('click', event)
  if (!isToggle.value || event.defaultPrevented) return
  selected.value = !selected.value
}
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-bind="$attrs"
    :id="id"
    v-ripple
    :class="[classes, `yam3x-button--${shape}`]"
    :href="isLink && !isDisabled ? href : undefined"
    :name="isLink ? undefined : name"
    :value="isLink ? undefined : value"
    :form="isLink ? undefined : form"
    :role="isLink ? (isDisabled ? 'link' : undefined) : role"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : disabled && !disabledInteractive"
    :tabindex="resolvedTabindex"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-pressed="isToggle && role !== 'radio' ? selected : undefined"
    :aria-checked="isToggle && role === 'radio' ? selected : undefined"
    @click="onClick"
  >
    <span
      v-if="$slots.icon && !(isToggle && selected && $slots['selected-icon'])"
      class="yam3x-button__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span
      v-if="isToggle && selected && $slots['selected-icon']"
      class="yam3x-button__icon"
      aria-hidden="true"
    >
      <slot name="selected-icon" />
    </span>
    <span class="yam3x-button__label relative z-10 inline-flex items-center justify-center">
      <slot
        v-if="toggle && selected && !isLink"
        name="selected"
        ><slot
      /></slot>
      <slot v-else />
    </span>
    <span
      v-if="$slots['trailing-icon']"
      class="yam3x-button__icon"
      aria-hidden="true"
    >
      <slot name="trailing-icon" />
    </span>
  </component>
</template>

<style scoped>
.yam3x-button {
  --_yam3x-button-height: var(--yam3x-control-height);
  --_yam3x-button-padding-inline: var(--yam3x-control-padding);
  --_yam3x-button-icon-size: var(--yam3x-control-icon-size);
  --_yam3x-button-icon-label-space: var(--yam3x-control-icon-label-gap);
  --_yam3x-button-content-gap: var(--yam3x-control-gap);
  --_yam3x-button-min-width: var(--md-sys-touch-target-size);
  --_yam3x-button-label-size: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-button-label-line-height: var(--md-sys-typescale-label-large-line-height);
  --_yam3x-button-label-weight: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-button-square-shape: var(--yam3x-control-square-shape);
  --_yam3x-button-pressed-shape: var(--yam3x-control-pressed-shape);
  --_yam3x-button-round-shape: min(
    var(--md-sys-shape-corner-full),
    calc(var(--_yam3x-button-height) / 2)
  );
  --_yam3x-button-current-shape: var(--_yam3x-button-round-shape);
  --_yam3x-button-outline-width: 0px;
  --_yam3x-button-outline-color: transparent;
  --_yam3x-button-elevation: none;
  --_yam3x-button-state-layer-color: var(--_yam3x-button-label-color);
  --_yam3x-button-disabled-container-color: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 10%,
    transparent
  );
  --_yam3x-button-disabled-label-color: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 38%,
    transparent
  );
  --_yam3x-button-disabled-outline-color: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 12%,
    transparent
  );
  --_yam3x-button-effects-motion: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-button-shape-duration: 178ms;
  --yam3x-state-layer-color: var(--_yam3x-button-state-layer-color);
  --_yam3x-button-shape-spring: linear(
    0,
    0.15 10%,
    0.407 20%,
    0.632 30%,
    0.792 40%,
    0.892 50%,
    0.949 60%,
    0.979 70%,
    0.993 80%,
    0.999 90%,
    1.001 100%
  );
  column-gap: var(--_yam3x-button-icon-label-space);
  min-height: var(--_yam3x-button-height);
  min-width: var(--_yam3x-button-min-width);
  padding-inline: var(--_yam3x-button-padding-inline);
  padding-block: calc(
    (var(--_yam3x-button-height) - var(--_yam3x-button-label-line-height)) / 2 -
      var(--_yam3x-button-outline-width)
  );
  font-size: var(--_yam3x-button-label-size);
  line-height: var(--_yam3x-button-label-line-height);
  font-weight: var(--_yam3x-button-label-weight);
  cursor: pointer;
  border-width: var(--_yam3x-button-outline-width);
  border-style: solid;
  border-color: var(--_yam3x-button-outline-color);
  border-radius: var(--_yam3x-button-current-shape);
  background-color: var(--yam3x-button-container-color, var(--_yam3x-button-container-color));
  color: var(--_yam3x-button-label-color);
  box-shadow: var(--_yam3x-button-elevation);
  text-decoration: none;
  transition:
    border-radius var(--_yam3x-button-shape-duration) var(--_yam3x-button-shape-spring),
    background-color var(--_yam3x-button-effects-motion),
    color var(--_yam3x-button-effects-motion),
    box-shadow var(--_yam3x-button-effects-motion);
}
.yam3x-button.yam3x-control-size--medium {
  --_yam3x-button-label-size: var(--md-sys-typescale-title-medium-font-size);
  --_yam3x-button-label-line-height: var(--md-sys-typescale-title-medium-line-height);
  --_yam3x-button-label-weight: var(--md-sys-typescale-title-medium-font-weight);
}
.yam3x-button.yam3x-control-size--large {
  --_yam3x-button-label-size: var(--md-sys-typescale-headline-small-font-size);
  --_yam3x-button-label-line-height: var(--md-sys-typescale-headline-small-line-height);
  --_yam3x-button-label-weight: var(--md-sys-typescale-headline-small-font-weight);
}
.yam3x-button.yam3x-control-size--extra-large {
  --_yam3x-button-label-size: var(--md-sys-typescale-headline-large-font-size);
  --_yam3x-button-label-line-height: var(--md-sys-typescale-headline-large-line-height);
  --_yam3x-button-label-weight: var(--md-sys-typescale-headline-large-font-weight);
}
.yam3x-button__label {
  gap: var(--_yam3x-button-content-gap);
  white-space: nowrap;
}
.yam3x-button__icon :deep(svg),
.yam3x-button__label :deep(svg),
.yam3x-button__icon :deep(.yam3x-icon),
.yam3x-button__label :deep(.yam3x-icon) {
  width: var(--_yam3x-button-icon-size);
  height: var(--_yam3x-button-icon-size);
  flex: none;
}
.yam3x-button__icon :deep(.yam3x-icon),
.yam3x-button__label :deep(.yam3x-icon) {
  font-size: var(--_yam3x-button-icon-size);
}
.yam3x-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.yam3x-button--filled {
  --_yam3x-button-container-color: var(--md-sys-color-primary);
  --_yam3x-button-label-color: var(--md-sys-color-on-primary);
}
.yam3x-button--filled-tonal {
  --_yam3x-button-container-color: var(--md-sys-color-secondary-container);
  --_yam3x-button-label-color: var(--md-sys-color-on-secondary-container);
}
.yam3x-button--elevated {
  --_yam3x-button-container-color: var(--md-sys-color-surface-container-low);
  --_yam3x-button-label-color: var(--md-sys-color-primary);
  --_yam3x-button-elevation: var(--md-sys-elevation-level1);
}
.yam3x-button--outlined {
  --_yam3x-button-container-color: transparent;
  --_yam3x-button-label-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-button-outline-color: var(--md-sys-color-outline-variant);
  --_yam3x-button-outline-width: var(--yam3x-control-outline);
}
.yam3x-button--text {
  --_yam3x-button-container-color: transparent;
  --_yam3x-button-label-color: var(--md-sys-color-primary);
}
.yam3x-button--square,
.yam3x-button--round:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-button-current-shape: var(--_yam3x-button-square-shape);
}
.yam3x-button--square:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-button-current-shape: var(--_yam3x-button-round-shape);
}
@media (hover: hover) and (pointer: fine) {
  .yam3x-button--elevated:hover:not(:disabled, [aria-disabled='true']) {
    --_yam3x-button-elevation: var(--md-sys-elevation-level2);
  }
}
.yam3x-button:is(:active, [data-yam3x-pressed]):not(:disabled, [aria-disabled='true']) {
  --_yam3x-button-current-shape: var(--_yam3x-button-pressed-shape);
}
.yam3x-button--elevated:active:not(:disabled, [aria-disabled='true']) {
  --_yam3x-button-elevation: var(--md-sys-elevation-level1);
}

.yam3x-button--filled-tonal:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-button-container-color: var(--md-sys-color-secondary);
  --_yam3x-button-label-color: var(--md-sys-color-on-secondary);
}
.yam3x-button--elevated:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-button-container-color: var(--md-sys-color-primary);
  --_yam3x-button-label-color: var(--md-sys-color-on-primary);
}
.yam3x-button--outlined:is([aria-pressed='true'], [aria-checked='true']) {
  --_yam3x-button-outline-color: transparent;
  --_yam3x-button-container-color: var(--md-sys-color-inverse-surface);
  --_yam3x-button-label-color: var(--md-sys-color-inverse-on-surface);
}
.yam3x-button--filled:is([aria-pressed='false'], [aria-checked='false']) {
  --_yam3x-button-container-color: var(--md-sys-color-surface-container);
  --_yam3x-button-label-color: var(--md-sys-color-on-surface-variant);
}

.yam3x-button:is(:disabled, [aria-disabled='true']) {
  cursor: not-allowed;
  --_yam3x-button-elevation: none;
  --_yam3x-button-label-color: var(--_yam3x-button-disabled-label-color);
  transform: none;
}
.yam3x-button--filled:is(:disabled, [aria-disabled='true']),
.yam3x-button--filled-tonal:is(:disabled, [aria-disabled='true']),
.yam3x-button--elevated:is(:disabled, [aria-disabled='true']) {
  --_yam3x-button-outline-color: transparent;
  --_yam3x-button-container-color: var(--_yam3x-button-disabled-container-color);
}
.yam3x-button--outlined:is(:disabled, [aria-disabled='true']) {
  --_yam3x-button-outline-color: var(--_yam3x-button-disabled-outline-color);
  --_yam3x-button-container-color: transparent;
}
.yam3x-button--text:is(:disabled, [aria-disabled='true']) {
  --_yam3x-button-container-color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  .yam3x-button {
    transition: none;
  }
}
</style>
