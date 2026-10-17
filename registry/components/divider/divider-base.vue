<script setup lang="ts">
import { computed } from 'vue'
import type { DividerOrientation, DividerProps } from './divider.types'

const props = withDefaults(defineProps<DividerProps & { orientation: DividerOrientation }>(), {
  thickness: undefined,
  color: undefined,
  inset: false,
  insetStart: false,
  insetEnd: false,
  decorative: true,
})

const lineStyle = computed(() => ({
  '--_yam3x-divider-thickness':
    props.thickness === undefined
      ? undefined
      : typeof props.thickness === 'number'
        ? `${props.thickness}px`
        : props.thickness,
  '--_yam3x-divider-color': props.color,
}))
</script>

<template>
  <div
    class="yam3x-divider"
    :class="{
      'yam3x-divider--vertical': orientation === 'vertical',
      'yam3x-divider--inset-start': inset || insetStart,
      'yam3x-divider--inset-end': inset || insetEnd,
    }"
    :role="decorative ? undefined : 'separator'"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-orientation="!decorative && orientation === 'vertical' ? 'vertical' : undefined"
    :style="lineStyle"
  >
    <span
      class="yam3x-divider__line"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.yam3x-divider {
  --_yam3x-divider-thickness: var(--yam3x-divider-thickness, 1px);
  --_yam3x-divider-color: var(--yam3x-divider-color, var(--md-sys-color-outline-variant));
  --_yam3x-divider-inset-size: var(--yam3x-divider-inset-size, 16px);
  --_yam3x-divider-inset-start-size: var(
    --yam3x-divider-inset-start-size,
    var(--_yam3x-divider-inset-size)
  );
  --_yam3x-divider-inset-end-size: var(
    --yam3x-divider-inset-end-size,
    var(--_yam3x-divider-inset-size)
  );
  --_yam3x-divider-active-start: 0px;
  --_yam3x-divider-active-end: 0px;
  display: block;
  position: relative;
  width: 100%;
  height: var(--_yam3x-divider-thickness);
  flex: none;
  pointer-events: none;
}

.yam3x-divider[hidden] {
  display: none;
}

.yam3x-divider--vertical {
  width: var(--_yam3x-divider-thickness);
  height: 100%;
  align-self: stretch;
}

.yam3x-divider--inset-start {
  --_yam3x-divider-active-start: var(--_yam3x-divider-inset-start-size);
}

.yam3x-divider--inset-end {
  --_yam3x-divider-active-end: var(--_yam3x-divider-inset-end-size);
}

.yam3x-divider__line {
  position: absolute;
  inset-block: 0;
  inset-inline-start: var(--_yam3x-divider-active-start);
  inset-inline-end: var(--_yam3x-divider-active-end);
  background: var(--_yam3x-divider-color);
}

.yam3x-divider--vertical .yam3x-divider__line {
  inset-inline: 0;
  inset-block-start: var(--_yam3x-divider-active-start);
  inset-block-end: var(--_yam3x-divider-active-end);
}

@media (forced-colors: active) {
  .yam3x-divider__line {
    background: GrayText;
  }
}
</style>
