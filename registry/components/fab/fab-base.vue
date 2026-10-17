<script setup lang="ts">
import { computed } from 'vue'
import { vRipple } from '../_shared/ripple'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    kind: 'standard' | 'extended'
    size?: 'small' | 'default' | 'medium' | 'large'
    variant?:
      | 'primary-container'
      | 'secondary-container'
      | 'tertiary-container'
      | 'primary'
      | 'secondary'
      | 'tertiary'
    href?: string
    type?: 'button' | 'submit' | 'reset'
    id?: string
    name?: string
    value?: string
    form?: string
    /** @deprecated Material recommends omitting the FAB while its action is unavailable. */
    disabled?: boolean
    /** @deprecated Material recommends omitting the FAB while its action is unavailable. */
    disabledInteractive?: boolean
    lowered?: boolean
    expanded?: boolean
    hasIcon?: boolean
  }>(),
  {
    variant: 'primary-container',
    type: 'button',
    href: undefined,
    id: undefined,
    name: undefined,
    value: undefined,
    form: undefined,
    disabled: false,
    disabledInteractive: false,
    lowered: false,
    expanded: true,
    hasIcon: false,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const isLink = computed(() => props.href !== undefined)
const isDisabled = computed(() => props.disabled || props.disabledInteractive)
const isExtended = computed(() => props.kind === 'extended')
const size = computed(() => props.size ?? (isExtended.value ? 'medium' : 'default'))

const sizeProperties = [
  'container-height',
  'label-text-font-family',
  'label-text-font-size',
  'label-text-font-weight',
  'label-text-line-height',
  'label-text-tracking',
  'icon-size',
  'shape',
  'leading-space',
  'trailing-space',
  'icon-label-space',
] as const
type SizeProperty = (typeof sizeProperties)[number]
type SizeTokens = Record<SizeProperty, string>
type FabSize = 'small' | 'default' | 'medium' | 'large'
const variantProperties = [
  'label-text-color',
  'icon-color',
  'container-color',
  'container-elevation',
  'lowered-container-elevation',
  'disabled-container-color',
  'disabled-container-opacity',
  'disabled-icon-color',
  'disabled-icon-opacity',
  'disabled-label-text-color',
  'disabled-label-text-opacity',
  'disabled-container-elevation',
  'lowered-disabled-container-elevation',
  'hover-icon-color',
  'hover-label-text-color',
  'hover-state-layer-color',
  'hover-state-layer-opacity',
  'hover-container-elevation',
  'lowered-hover-container-elevation',
  'focus-icon-color',
  'focus-label-text-color',
  'focus-state-layer-color',
  'focus-state-layer-opacity',
  'focus-container-elevation',
  'lowered-focus-container-elevation',
  'pressed-icon-color',
  'pressed-label-text-color',
  'pressed-state-layer-color',
  'pressed-state-layer-opacity',
  'pressed-container-elevation',
  'lowered-pressed-container-elevation',
] as const

const standardSizeDefaults: Record<FabSize, SizeTokens> = {
  small: {
    'container-height': '40px',
    'label-text-font-family': 'inherit',
    'label-text-font-size': '16px',
    'label-text-font-weight': '500',
    'label-text-line-height': '24px',
    'label-text-tracking': '0.1px',
    'icon-size': '24px',
    shape: '12px',
    'leading-space': '8px',
    'trailing-space': '8px',
    'icon-label-space': '8px',
  },
  default: {
    'container-height': '56px',
    'label-text-font-family': 'inherit',
    'label-text-font-size': '16px',
    'label-text-font-weight': '500',
    'label-text-line-height': '24px',
    'label-text-tracking': '0.1px',
    'icon-size': '24px',
    shape: '16px',
    'leading-space': '16px',
    'trailing-space': '16px',
    'icon-label-space': '8px',
  },
  medium: {
    'container-height': '80px',
    'label-text-font-family': 'inherit',
    'label-text-font-size': '22px',
    'label-text-font-weight': '500',
    'label-text-line-height': '28px',
    'label-text-tracking': '0px',
    'icon-size': '28px',
    shape: '20px',
    'leading-space': '26px',
    'trailing-space': '26px',
    'icon-label-space': '12px',
  },
  large: {
    'container-height': '96px',
    'label-text-font-family': 'inherit',
    'label-text-font-size': '24px',
    'label-text-font-weight': '400',
    'label-text-line-height': '32px',
    'label-text-tracking': '0px',
    'icon-size': '36px',
    shape: '28px',
    'leading-space': '28px',
    'trailing-space': '28px',
    'icon-label-space': '16px',
  },
}

const extendedSizeDefaults: Record<'small' | 'medium' | 'large', SizeTokens> = {
  small: {
    'container-height': '56px',
    'label-text-font-family': 'var(--md-sys-typescale-title-medium-font-family)',
    'label-text-font-size': 'var(--md-sys-typescale-title-medium-font-size)',
    'label-text-font-weight': 'var(--md-sys-typescale-title-medium-font-weight)',
    'label-text-line-height': 'var(--md-sys-typescale-title-medium-line-height-small)',
    'label-text-tracking': 'var(--md-sys-typescale-title-medium-tracking)',
    'icon-size': '24px',
    shape: 'var(--md-sys-shape-corner-large)',
    'leading-space': '16px',
    'trailing-space': '16px',
    'icon-label-space': '8px',
  },
  medium: {
    'container-height': '80px',
    'label-text-font-family': 'var(--md-sys-typescale-title-large-font-family)',
    'label-text-font-size': 'var(--md-sys-typescale-title-large-font-size)',
    'label-text-font-weight': 'var(--md-sys-typescale-title-large-font-weight)',
    'label-text-line-height': 'var(--md-sys-typescale-title-large-line-height-small)',
    'label-text-tracking': 'var(--md-sys-typescale-title-large-tracking)',
    'icon-size': '28px',
    shape: 'var(--md-sys-shape-corner-large-increased)',
    'leading-space': '26px',
    'trailing-space': '26px',
    'icon-label-space': '12px',
  },
  large: {
    'container-height': '96px',
    'label-text-font-family': 'var(--md-sys-typescale-headline-small-font-family)',
    'label-text-font-size': 'var(--md-sys-typescale-headline-small-font-size)',
    'label-text-font-weight': 'var(--md-sys-typescale-headline-small-font-weight)',
    'label-text-line-height': 'var(--md-sys-typescale-headline-small-line-height-small)',
    'label-text-tracking': 'var(--md-sys-typescale-headline-small-tracking)',
    'icon-size': '36px',
    shape: 'var(--md-sys-shape-corner-extra-large)',
    'leading-space': '28px',
    'trailing-space': '28px',
    'icon-label-space': '16px',
  },
}

const colorRoles = {
  'primary-container': ['primary-container', 'on-primary-container'],
  'secondary-container': ['secondary-container', 'on-secondary-container'],
  'tertiary-container': ['tertiary-container', 'on-tertiary-container'],
  primary: ['primary', 'on-primary'],
  secondary: ['secondary', 'on-secondary'],
  tertiary: ['tertiary', 'on-tertiary'],
} as const

const componentStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  const currentSize = size.value
  const componentPrefix = isExtended.value ? 'extended-fab' : 'floating-action-button'
  const sizePrefix = `--yam3x-${componentPrefix}-${currentSize}-`
  const defaults = isExtended.value
    ? extendedSizeDefaults[currentSize as keyof typeof extendedSizeDefaults]
    : standardSizeDefaults[currentSize]
  for (const property of sizeProperties) {
    const common = `var(--yam3x-${componentPrefix}-${property}, ${defaults[property]})`
    style[`--_yam3x-fab-${property}`] = `var(${sizePrefix}${property}, ${common})`
  }

  const [containerRole, contentRole] = colorRoles[props.variant]
  const fallback: Record<(typeof variantProperties)[number], string> = {
    'label-text-color': `var(--md-sys-color-${contentRole})`,
    'icon-color': `var(--md-sys-color-${contentRole})`,
    'container-color': `var(--md-sys-color-${containerRole})`,
    'container-elevation': 'var(--md-sys-elevation-level3)',
    'lowered-container-elevation': 'var(--md-sys-elevation-level2)',
    'disabled-container-color': 'var(--md-sys-color-on-surface)',
    'disabled-container-opacity': '10%',
    'disabled-icon-color': 'var(--md-sys-color-on-surface)',
    'disabled-icon-opacity': '38%',
    'disabled-label-text-color': 'var(--md-sys-color-on-surface)',
    'disabled-label-text-opacity': '38%',
    'disabled-container-elevation': 'var(--md-sys-elevation-level0)',
    'lowered-disabled-container-elevation': 'var(--md-sys-elevation-level0)',
    'hover-icon-color': `var(--md-sys-color-${contentRole})`,
    'hover-label-text-color': `var(--md-sys-color-${contentRole})`,
    'hover-state-layer-color': `var(--md-sys-color-${contentRole})`,
    'hover-state-layer-opacity': 'var(--md-sys-state-hover-opacity)',
    'hover-container-elevation': 'var(--md-sys-elevation-level4)',
    'lowered-hover-container-elevation': 'var(--md-sys-elevation-level3)',
    'focus-icon-color': `var(--md-sys-color-${contentRole})`,
    'focus-label-text-color': `var(--md-sys-color-${contentRole})`,
    'focus-state-layer-color': `var(--md-sys-color-${contentRole})`,
    'focus-state-layer-opacity': 'var(--md-sys-state-focus-opacity)',
    'focus-container-elevation': 'var(--md-sys-elevation-level3)',
    'lowered-focus-container-elevation': 'var(--md-sys-elevation-level2)',
    'pressed-icon-color': `var(--md-sys-color-${contentRole})`,
    'pressed-label-text-color': `var(--md-sys-color-${contentRole})`,
    'pressed-state-layer-color': `var(--md-sys-color-${contentRole})`,
    'pressed-state-layer-opacity': 'var(--md-sys-state-pressed-opacity)',
    'pressed-container-elevation': 'var(--md-sys-elevation-level3)',
    'lowered-pressed-container-elevation': 'var(--md-sys-elevation-level2)',
  }
  const variantPrefix = `--yam3x-${props.variant}-${componentPrefix}-`
  for (const property of variantProperties) {
    const common = `var(--yam3x-${componentPrefix}-${property}, ${fallback[property]})`
    style[`--_yam3x-fab-${property}`] = `var(${variantPrefix}${property}, ${common})`
  }
  return style
})

function onClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-bind="$attrs"
    :id="id"
    v-ripple
    class="yam3x-state-layer yam3x-touch-target"
    :class="[
      isExtended ? 'yam3x-extended-fab' : 'yam3x-floating-action-button',
      `${isExtended ? 'yam3x-extended-fab' : 'yam3x-floating-action-button'}--${size}`,
      `${isExtended ? 'yam3x-extended-fab' : 'yam3x-floating-action-button'}--${variant}`,
      { 'yam3x-floating-action-button--lowered': lowered && !isExtended },
      { 'yam3x-extended-fab--lowered': lowered && isExtended },
      { 'yam3x-extended-fab--expanded': isExtended && (expanded || !hasIcon) },
      { 'yam3x-extended-fab--collapsed': isExtended && !expanded && hasIcon },
    ]"
    :style="componentStyle"
    :href="isLink && !isDisabled ? href : undefined"
    :type="isLink ? undefined : type"
    :name="isLink ? undefined : name"
    :value="isLink ? undefined : value"
    :form="isLink ? undefined : form"
    :disabled="isLink ? undefined : disabled && !disabledInteractive"
    :role="isLink && isDisabled ? 'link' : undefined"
    :tabindex="isLink && disabled ? -1 : isLink && disabledInteractive ? 0 : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    @click="onClick"
  >
    <span class="yam3x-fab__content">
      <span
        v-if="!isExtended || hasIcon"
        class="yam3x-fab__icon"
        aria-hidden="true"
      >
        <slot name="icon"><slot v-if="!isExtended" /></slot>
      </span>
      <span
        v-if="isExtended"
        class="yam3x-fab__label"
        ><slot
      /></span>
    </span>
  </component>
</template>

<style scoped>
:is(.yam3x-floating-action-button, .yam3x-extended-fab) {
  --yam3x-control-height: var(--_yam3x-fab-container-height);
  --_yam3x-fab-line-height: var(--_yam3x-fab-label-text-line-height);
  --_yam3x-fab-container-scale: var(--md-sys-density-container-scale, 1);
  --_yam3x-fab-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-fab-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-fab-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-fab-default-effects: var(--md-sys-motion-spring-default-effects);

  display: inline-flex;
  min-width: calc(var(--_yam3x-fab-container-height) * var(--_yam3x-fab-container-scale));
  min-height: calc(var(--yam3x-control-height) * var(--_yam3x-fab-container-scale));
  align-items: center;
  justify-content: center;
  padding-inline-start: calc(var(--_yam3x-fab-leading-space) * var(--_yam3x-fab-spacing-scale));
  padding-inline-end: calc(var(--_yam3x-fab-trailing-space) * var(--_yam3x-fab-spacing-scale));
  border: 0;
  border-radius: var(--_yam3x-fab-shape);
  background: var(--_yam3x-fab-container-color);
  box-shadow: var(--_yam3x-fab-container-elevation);
  color: var(--_yam3x-fab-label-text-color);
  cursor: pointer;
  font-family: var(--_yam3x-fab-label-text-font-family);
  font-size: var(--_yam3x-fab-label-text-font-size);
  font-weight: var(--_yam3x-fab-label-text-font-weight);
  letter-spacing: var(--_yam3x-fab-label-text-tracking);
  line-height: calc((var(--_yam3x-fab-line-height)) * var(--_yam3x-fab-line-height-scale));
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--_yam3x-fab-fast-effects),
    box-shadow var(--_yam3x-fab-default-effects),
    color var(--_yam3x-fab-fast-effects);
}

.yam3x-fab__content {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.yam3x-extended-fab .yam3x-fab__content {
  gap: calc(var(--_yam3x-fab-icon-label-space) * var(--_yam3x-fab-spacing-scale));
}
.yam3x-extended-fab--collapsed .yam3x-fab__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.yam3x-fab__icon svg {
  width: var(--_yam3x-fab-icon-size);
  height: var(--_yam3x-fab-icon-size);
  fill: currentColor;
}

.yam3x-fab__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--_yam3x-fab-icon-color);
}

.yam3x-fab__icon :deep(svg),
.yam3x-fab__label :deep(svg) {
  width: var(--_yam3x-fab-icon-size);
  height: var(--_yam3x-fab-icon-size);
  flex: none;
}
.yam3x-fab__icon :deep(.yam3x-icon),
.yam3x-fab__label :deep(.yam3x-icon) {
  width: var(--_yam3x-fab-icon-size);
  height: var(--_yam3x-fab-icon-size);
  font-size: var(--_yam3x-fab-icon-size);
}

:is(.yam3x-floating-action-button--lowered, .yam3x-extended-fab--lowered) {
  box-shadow: var(--_yam3x-fab-lowered-container-elevation);
}

@media (hover: hover) and (pointer: fine) {
  :is(.yam3x-floating-action-button, .yam3x-extended-fab):not(
      :disabled,
      [aria-disabled='true']
    ):hover {
    box-shadow: var(--_yam3x-fab-hover-container-elevation);
    --yam3x-state-layer-color: var(--_yam3x-fab-hover-state-layer-color);
    color: var(--_yam3x-fab-hover-label-text-color);
  }

  :is(.yam3x-floating-action-button--lowered, .yam3x-extended-fab--lowered):not(
      :disabled,
      [aria-disabled='true']
    ):hover {
    box-shadow: var(--_yam3x-fab-lowered-hover-container-elevation);
  }
}

:is(.yam3x-floating-action-button, .yam3x-extended-fab):hover:not(:disabled, [aria-disabled='true'])
  .yam3x-fab__icon {
  color: var(--_yam3x-fab-hover-icon-color);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):hover:not(
    :disabled,
    [aria-disabled='true']
  )::after {
  opacity: var(--_yam3x-fab-hover-state-layer-opacity);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):focus-visible:not(
    :disabled,
    [aria-disabled='true']
  ) {
  box-shadow: var(--_yam3x-fab-focus-container-elevation);
  --yam3x-state-layer-color: var(--_yam3x-fab-focus-state-layer-color);
  color: var(--_yam3x-fab-focus-label-text-color);
}
:is(.yam3x-floating-action-button--lowered, .yam3x-extended-fab--lowered):focus-visible:not(
    :disabled,
    [aria-disabled='true']
  ) {
  box-shadow: var(--_yam3x-fab-lowered-focus-container-elevation);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):focus-visible:not(
    :disabled,
    [aria-disabled='true']
  )::after {
  opacity: var(--_yam3x-fab-focus-state-layer-opacity);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):focus-visible:not(
    :disabled,
    [aria-disabled='true']
  )
  .yam3x-fab__icon {
  color: var(--_yam3x-fab-focus-icon-color);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):is(:active, [data-yam3x-pressed]):not(
    :disabled,
    [aria-disabled='true']
  ) {
  box-shadow: var(--_yam3x-fab-pressed-container-elevation);
  --yam3x-state-layer-color: var(--_yam3x-fab-pressed-state-layer-color);
  --yam3x-ripple-color: var(--_yam3x-fab-pressed-state-layer-color);
  color: var(--_yam3x-fab-pressed-label-text-color);
}
:is(.yam3x-floating-action-button--lowered, .yam3x-extended-fab--lowered):is(
    :active,
    [data-yam3x-pressed]
  ):not(:disabled, [aria-disabled='true']) {
  box-shadow: var(--_yam3x-fab-lowered-pressed-container-elevation);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):is(:active, [data-yam3x-pressed]):not(
    :disabled,
    [aria-disabled='true']
  )::after {
  opacity: 0;
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):is(:active, [data-yam3x-pressed]):not(
    :disabled,
    [aria-disabled='true']
  )
  .yam3x-fab__icon {
  color: var(--_yam3x-fab-pressed-icon-color);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab) .yam3x-ripple--visible {
  opacity: var(--_yam3x-fab-pressed-state-layer-opacity);
}

:is(.yam3x-floating-action-button, .yam3x-extended-fab):is(:disabled, [aria-disabled='true']) {
  border-color: transparent;
  box-shadow: var(--_yam3x-fab-disabled-container-elevation);
  color: color-mix(
    in srgb,
    var(--_yam3x-fab-disabled-label-text-color) var(--_yam3x-fab-disabled-label-text-opacity),
    transparent
  );
  cursor: not-allowed;
  background: color-mix(
    in srgb,
    var(--_yam3x-fab-disabled-container-color) var(--_yam3x-fab-disabled-container-opacity),
    transparent
  );
}
:is(.yam3x-floating-action-button--lowered, .yam3x-extended-fab--lowered):is(
  :disabled,
  [aria-disabled='true']
) {
  box-shadow: var(--_yam3x-fab-lowered-disabled-container-elevation);
}
:is(.yam3x-floating-action-button, .yam3x-extended-fab):is(:disabled, [aria-disabled='true'])
  .yam3x-fab__icon {
  color: color-mix(
    in srgb,
    var(--_yam3x-fab-disabled-icon-color) var(--_yam3x-fab-disabled-icon-opacity),
    transparent
  );
}

@media (prefers-reduced-motion: reduce) {
  :is(.yam3x-floating-action-button, .yam3x-extended-fab) {
    transition: none;
  }
}

@media (forced-colors: active) {
  :is(.yam3x-floating-action-button, .yam3x-extended-fab) {
    border: 1px solid ButtonText;
    background: ButtonFace;
    box-shadow: none;
    color: ButtonText;
  }

  :is(.yam3x-floating-action-button, .yam3x-extended-fab):is(:disabled, [aria-disabled='true']) {
    border-color: GrayText;
    color: GrayText;
  }

  :is(.yam3x-floating-action-button, .yam3x-extended-fab):focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 3px;
  }
}
</style>
