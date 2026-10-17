<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { loadingShapes } from './loading-shapes'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{ variant?: 'uncontained' | 'contained' }>(), {
  variant: 'uncontained',
})
const attrs = useAttrs()
const variant = computed(() => (props.variant === 'contained' ? 'contained' : 'uncontained'))
const shapeStyles = {
  '--_yam3x-loading-shape-soft-burst': loadingShapes['soft-burst'],
  '--_yam3x-loading-shape-nine-cookie': loadingShapes['9-sided-cookie'],
  '--_yam3x-loading-shape-pentagon': loadingShapes.pentagon,
  '--_yam3x-loading-shape-pill': loadingShapes.pill,
  '--_yam3x-loading-shape-sunny': loadingShapes.sunny,
  '--_yam3x-loading-shape-four-cookie': loadingShapes['4-sided-cookie'],
  '--_yam3x-loading-shape-oval': loadingShapes.oval,
}
</script>

<template>
  <span
    v-bind="attrs"
    class="yam3x-loading-indicator"
    :class="`yam3x-loading-indicator--${variant}`"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span
      class="yam3x-loading-indicator__container"
      aria-hidden="true"
    >
      <span class="yam3x-loading-indicator__rotation">
        <span
          class="yam3x-loading-indicator__active"
          :style="shapeStyles"
        />
      </span>
    </span>
  </span>
</template>

<style scoped>
.yam3x-loading-indicator {
  --_yam3x-loading-indicator-container-size: var(--yam3x-loading-indicator-container-size, 48px);
  --_yam3x-loading-indicator-container-shape: var(
    --yam3x-loading-indicator-container-shape,
    var(--md-sys-shape-corner-full)
  );
  --_yam3x-loading-indicator-active-size: var(
    --yam3x-loading-indicator-active-indicator-size,
    calc(var(--_yam3x-loading-indicator-container-size) * 0.79166667)
  );
  --_yam3x-loading-indicator-active-color: var(
    --yam3x-loading-indicator-active-indicator-color,
    var(--md-sys-color-primary)
  );
  --_yam3x-loading-indicator-contained-container-color: var(
    --yam3x-loading-indicator-contained-container-color,
    var(--md-sys-color-primary-container)
  );
  --_yam3x-loading-indicator-contained-active-color: var(
    --yam3x-loading-indicator-contained-active-indicator-color,
    var(--md-sys-color-on-primary-container)
  );
  --_yam3x-loading-indicator-motion-duration: 4666ms;
  display: inline-block;
  width: var(--_yam3x-loading-indicator-container-size);
  aspect-ratio: 1;
  vertical-align: middle;
  pointer-events: none;
}
.yam3x-loading-indicator[hidden] {
  display: none;
}
.yam3x-loading-indicator__container {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border-radius: var(--_yam3x-loading-indicator-container-shape);
}
.yam3x-loading-indicator--contained .yam3x-loading-indicator__container {
  background: var(--_yam3x-loading-indicator-contained-container-color);
}
.yam3x-loading-indicator__rotation {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  animation: yam3x-loading-outer-rotation var(--_yam3x-loading-indicator-motion-duration) linear
    infinite;
}
.yam3x-loading-indicator__active {
  display: block;
  width: var(--_yam3x-loading-indicator-active-size);
  aspect-ratio: 1;
  background: var(--_yam3x-loading-indicator-active-color);
  clip-path: var(--_yam3x-loading-shape-soft-burst);
  animation: yam3x-loading-inner-morph var(--_yam3x-loading-indicator-motion-duration)
    cubic-bezier(0.34, 0.88, 0.34, 1) infinite;
}
.yam3x-loading-indicator--contained .yam3x-loading-indicator__active {
  background: var(--_yam3x-loading-indicator-contained-active-color);
}
@keyframes yam3x-loading-outer-rotation {
  to {
    transform: rotate(360deg);
  }
}
@keyframes yam3x-loading-inner-morph {
  0% {
    clip-path: var(--_yam3x-loading-shape-soft-burst);
    transform: rotate(0deg);
  }
  14% {
    clip-path: var(--_yam3x-loading-shape-nine-cookie);
    transform: rotate(154deg);
  }
  29% {
    clip-path: var(--_yam3x-loading-shape-pentagon);
    transform: rotate(309deg);
  }
  43% {
    clip-path: var(--_yam3x-loading-shape-pill);
    transform: rotate(463deg);
  }
  57% {
    clip-path: var(--_yam3x-loading-shape-sunny);
    transform: rotate(617deg);
  }
  71% {
    clip-path: var(--_yam3x-loading-shape-four-cookie);
    transform: rotate(771deg);
  }
  83% {
    clip-path: var(--_yam3x-loading-shape-oval);
    transform: rotate(926deg);
  }
  100% {
    clip-path: var(--_yam3x-loading-shape-soft-burst);
    transform: rotate(1080deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-loading-indicator__rotation,
  .yam3x-loading-indicator__active {
    animation: none;
  }
}
@media (forced-colors: active) {
  .yam3x-loading-indicator--contained .yam3x-loading-indicator__container {
    forced-color-adjust: none;
    background: Canvas;
    outline: 1px solid GrayText;
  }
  .yam3x-loading-indicator__active {
    forced-color-adjust: none;
    background: CanvasText;
  }
}
</style>
