<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { shapeNames, shapePolygons, type ShapeName } from './shape-polygons'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{ name?: ShapeName | null }>(), { name: null })
const attrs = useAttrs()
const shapeName = computed(() =>
  props.name && shapeNames.includes(props.name) ? props.name : null,
)
const clipPath = computed(() =>
  shapeName.value ? `polygon(${shapePolygons[shapeName.value]})` : undefined,
)
</script>

<template>
  <span
    v-bind="attrs"
    class="yam3x-shape"
    :data-name="shapeName || undefined"
  >
    <span
      class="yam3x-shape__wrapper"
      :style="clipPath ? { '--_yam3x-shape-clip-path': clipPath } : undefined"
      ><slot
    /></span>
  </span>
</template>

<style scoped>
.yam3x-shape {
  --_yam3x-shape-size: var(--yam3x-shape-size, 48px);
  --_yam3x-shape-container-color: var(--yam3x-shape-container-color, var(--md-sys-color-primary));
  --_yam3x-shape-system-motion-spring-slow-spatial: var(--md-sys-motion-spring-slow-spatial);
  --_yam3x-shape-transition: var(
    --yam3x-shape-transition,
    clip-path var(--_yam3x-shape-system-motion-spring-slow-spatial)
  );
  position: relative;
  display: inline-block;
  width: var(--_yam3x-shape-size);
  aspect-ratio: 1 / 1;
  vertical-align: middle;
}
.yam3x-shape[hidden] {
  display: none;
}
.yam3x-shape__wrapper {
  position: relative;
  display: block;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  height: 100%;
  clip-path: var(--_yam3x-shape-clip-path, none);
  transition: var(--_yam3x-shape-transition);
  transform-origin: center;
}
.yam3x-shape[data-name] .yam3x-shape__wrapper {
  background-color: var(--_yam3x-shape-container-color);
}
.yam3x-shape__wrapper :slotted(img),
.yam3x-shape__wrapper :slotted(video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-shape__wrapper {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-shape[data-name] .yam3x-shape__wrapper {
    background-color: CanvasText;
  }
}
</style>
