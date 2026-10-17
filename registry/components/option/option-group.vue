<script setup lang="ts">
import { computed, useId } from 'vue'

defineProps<{
  label?: string
  labelledby?: string
  hidden?: boolean
}>()
defineSlots<{
  default?(): unknown
  label?(): unknown
}>()
const generatedId = useId()
const labelId = computed(() => `yam3x-option-group-${generatedId}`)
</script>

<template>
  <div
    v-if="!hidden"
    class="yam3x-option-group"
    role="group"
    :aria-label="label || undefined"
    :aria-labelledby="labelledby || ($slots.label || label ? labelId : undefined)"
  >
    <div
      v-if="$slots.label || label"
      :id="labelId"
      class="yam3x-option-group__label"
    >
      <slot name="label">{{ label }}</slot>
    </div>
    <slot />
  </div>
</template>

<style>
.yam3x-option-group {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}
.yam3x-option-group__label {
  --_yam3x-option-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-option-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-option-height: var(--yam3x-option-height, 48px);
  --_yam3x-option-padding-start: var(
    --yam3x-option-padding-start,
    calc(12px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-padding-end: var(
    --yam3x-option-padding-end,
    calc(12px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-color: var(--yam3x-option-color, var(--md-sys-color-on-surface-variant));
  --_yam3x-option-font-size: var(--yam3x-option-font-size, 14px);
  --_yam3x-option-font-weight: var(--yam3x-option-font-weight, 500);
  --_yam3x-option-line-height: var(--yam3x-option-line-height, 20px);
  --_yam3x-option-tracking: var(--yam3x-option-tracking, 0.1px);
  --_yam3x-option-group-label-color: var(
    --yam3x-option-group-label-color,
    var(--_yam3x-option-color)
  );
  --_yam3x-option-group-label-font-size: var(
    --yam3x-option-group-label-font-size,
    var(--_yam3x-option-font-size)
  );
  --_yam3x-option-group-label-font-weight: var(
    --yam3x-option-group-label-font-weight,
    var(--_yam3x-option-font-weight)
  );
  --_yam3x-option-group-label-line-height: var(
    --yam3x-option-group-label-line-height,
    var(--_yam3x-option-line-height)
  );
  --_yam3x-option-group-label-tracking: var(
    --yam3x-option-group-label-tracking,
    var(--_yam3x-option-tracking)
  );
  --_yam3x-option-group-divider-inset: var(--yam3x-option-group-divider-inset, 12px);
  --_yam3x-option-group-divider-color: var(
    --yam3x-option-group-divider-color,
    var(--md-sys-color-outline-variant)
  );
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex: none;
  min-block-size: var(--_yam3x-option-height);
  padding-inline-start: var(--_yam3x-option-padding-start);
  padding-inline-end: var(--_yam3x-option-padding-end);
  color: var(--_yam3x-option-group-label-color);
  font-size: var(--_yam3x-option-group-label-font-size);
  font-weight: var(--_yam3x-option-group-label-font-weight);
  line-height: calc(
    var(--_yam3x-option-group-label-line-height) * var(--_yam3x-option-line-height-scale)
  );
  letter-spacing: var(--_yam3x-option-group-label-tracking);
}
.yam3x-option-group__label::after {
  position: absolute;
  inset-inline: var(--_yam3x-option-group-divider-inset);
  inset-block-end: 0;
  block-size: 1px;
  background: var(--_yam3x-option-group-divider-color);
  content: '';
  pointer-events: none;
}
</style>
