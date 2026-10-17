<script setup lang="ts">
import { computed, provide, ref, toRef, useAttrs } from 'vue'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import type { SplitButtonVariant } from './split-button.types'
import { splitButtonContextKey } from './split-button.context'
import { splitButtonTokens } from './split-button.tokens'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    variant?: SplitButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    spacing?: string
  }>(),
  { variant: 'filled', size: 'small', shape: 'round', spacing: '2px' },
)
defineSlots<{
  leading?(): unknown
  trailing?(): unknown
}>()
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const accessibleName = computed(() => attrs['aria-label'] as string | undefined)
provide(splitButtonContextKey, {
  variant: toRef(props, 'variant'),
  size: toRef(props, 'size'),
  shape: toRef(props, 'shape'),
})
const style = computed(() => {
  const tokens = splitButtonTokens[props.size]
  return {
    '--_yam3x-split-button-gap': props.spacing,
    '--_yam3x-split-button-inner-rest': `${tokens.innerCornerRest}px`,
    '--_yam3x-split-button-inner-active': `${tokens.innerCornerActive}px`,
  }
})
defineExpose({ root })
</script>

<template>
  <div
    ref="root"
    class="yam3x-split-button yam3x-control-size"
    :class="[$attrs.class, `yam3x-control-size--${size}`]"
    :style="[$attrs.style, style]"
    :data-size="size"
    :data-shape="shape"
    role="group"
    :aria-label="accessibleName"
  >
    <slot name="leading" />
    <slot name="trailing" />
  </div>
</template>

<style scoped>
.yam3x-split-button {
  --_yam3x-split-button-shape-corner-full: var(--md-sys-shape-corner-full, 999px);
  --_yam3x-split-button-motion-duration-short: var(--md-sys-motion-duration-short, 150ms);
  --_yam3x-split-button-motion-easing-standard: var(
    --md-sys-motion-easing-standard,
    cubic-bezier(0.2, 0, 0, 1)
  );
  --_yam3x-split-button-elevation-level1: var(--md-sys-elevation-level1);
  --_yam3x-split-button-elevation-level2: var(--md-sys-elevation-level2);
  --_yam3x-split-button-color-surface-container-low: var(--md-sys-color-surface-container-low);
  --_yam3x-split-button-color-primary: var(--md-sys-color-primary);
  --_yam3x-split-button-density-scale: var(--md-sys-density-spacing-scale, 1);
  display: inline-flex;
  align-items: center;
  gap: var(--_yam3x-split-button-gap, calc(2px * var(--_yam3x-split-button-density-scale)));
  vertical-align: middle;
}

/* Menu owns the popup; its trigger becomes the second visual segment here. */
.yam3x-split-button :deep(.yam3x-menu) {
  display: contents;
}
.yam3x-split-button :deep(.yam3x-menu__trigger-wrap) {
  display: contents;
}
.yam3x-split-button :deep(.yam3x-icon-button) {
  margin-inline: 0;
}
.yam3x-split-button__menu-anchor {
  position: relative;
  display: inline-flex;
  flex: none;
}
.yam3x-split-button :deep(.yam3x-split-button__primary) {
  flex: 1 1 auto;
  min-width: 0;
  --_yam3x-split-button-control-height: var(--yam3x-control-height, 48px);
  border-start-end-radius: var(--_yam3x-split-button-inner-rest);
  border-end-end-radius: var(--_yam3x-split-button-inner-rest);
}
.yam3x-split-button :deep(.yam3x-split-button__menu) {
  flex: none;
  --_yam3x-split-button-control-height: var(--yam3x-control-height, 48px);
  border-start-start-radius: var(--_yam3x-split-button-inner-rest);
  border-end-start-radius: var(--_yam3x-split-button-inner-rest);
}
@media (hover: hover) and (pointer: fine) {
  .yam3x-split-button
    :deep(.yam3x-split-button__menu--elevated:hover:not(:disabled, [aria-disabled='true'])) {
    --_yam3x-icon-button-container-elevation: var(--_yam3x-split-button-elevation-level2);
  }
}
.yam3x-split-button
  :deep(.yam3x-split-button__primary:focus-visible:not(:disabled, [aria-disabled='true'])) {
  border-start-end-radius: var(--_yam3x-split-button-inner-active);
  border-end-end-radius: var(--_yam3x-split-button-inner-active);
}
.yam3x-split-button
  :deep(.yam3x-split-button__menu:focus-visible:not(:disabled, [aria-disabled='true'])) {
  border-start-start-radius: var(--_yam3x-split-button-inner-active);
  border-end-start-radius: var(--_yam3x-split-button-inner-active);
}
@media (hover: hover) and (pointer: fine) {
  .yam3x-split-button
    :deep(
      .yam3x-split-button__primary:hover:not(
          :disabled,
          [aria-disabled='true'],
          [data-yam3x-pressed]
        )
    ) {
    border-start-end-radius: var(--_yam3x-split-button-inner-active);
    border-end-end-radius: var(--_yam3x-split-button-inner-active);
  }
  .yam3x-split-button
    :deep(
      .yam3x-split-button__menu:hover:not(:disabled, [aria-disabled='true'], [aria-expanded='true'])
    ) {
    border-start-start-radius: var(--_yam3x-split-button-inner-active);
    border-end-start-radius: var(--_yam3x-split-button-inner-active);
  }
}
.yam3x-split-button
  :deep(
    .yam3x-split-button__primary:is(:active, [data-yam3x-pressed]):not(
        :disabled,
        [aria-disabled='true']
      )
  ) {
  border-start-start-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
  border-end-start-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
  border-start-end-radius: var(--_yam3x-split-button-inner-active);
  border-end-end-radius: var(--_yam3x-split-button-inner-active);
}
.yam3x-split-button
  :deep(
    .yam3x-split-button__menu:is(:active, [data-yam3x-pressed]):not(
        :disabled,
        [aria-disabled='true']
      )
  ) {
  border-start-start-radius: var(--_yam3x-split-button-inner-active);
  border-end-start-radius: var(--_yam3x-split-button-inner-active);
  border-start-end-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
  border-end-end-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
}
.yam3x-split-button :deep(.yam3x-split-button__menu[aria-expanded='true']) {
  border-start-start-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
  border-end-start-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
  border-start-end-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
  border-end-end-radius: min(
    var(--_yam3x-split-button-shape-corner-full),
    calc(var(--_yam3x-split-button-control-height) / 2)
  );
}
.yam3x-split-button__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform var(--_yam3x-split-button-motion-duration-short)
    var(--_yam3x-split-button-motion-easing-standard);
}
.yam3x-split-button__chevron svg {
  display: block;
  fill: currentColor;
}
.yam3x-split-button__chevron .yam3x-icon {
  display: block;
  inline-size: var(--_yam3x-icon-button-icon-size);
  block-size: var(--_yam3x-icon-button-icon-size);
  font-size: var(--_yam3x-icon-button-icon-size);
}
.yam3x-split-button
  :deep(.yam3x-split-button__menu[aria-expanded='true'])
  .yam3x-split-button__chevron {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-split-button__chevron {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-split-button :deep(.yam3x-split-button__primary),
  .yam3x-split-button :deep(.yam3x-split-button__menu) {
    outline: 1px solid ButtonText;
    outline-offset: -1px;
  }
  .yam3x-split-button :deep(.yam3x-split-button__primary:focus-visible),
  .yam3x-split-button :deep(.yam3x-split-button__menu:focus-visible) {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
</style>
