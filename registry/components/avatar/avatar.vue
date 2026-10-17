<template>
  <span class="yam3x-avatar">
    <span class="yam3x-avatar__base"><slot /></span>
  </span>
</template>

<style scoped>
.yam3x-avatar {
  --_yam3x-avatar-size: 40px;
  --_yam3x-avatar-shape: var(--md-sys-shape-corner-full);
  --_yam3x-avatar-container-color: var(--md-sys-color-primary-container);
  --_yam3x-avatar-label-color: var(--md-sys-color-on-primary-container);
  --_yam3x-avatar-font-size: var(--md-sys-typescale-title-medium-font-size);
  --_yam3x-avatar-font-weight: var(--md-sys-typescale-title-medium-font-weight);
  --_yam3x-avatar-line-height: var(--md-sys-typescale-title-medium-line-height);
  --_yam3x-avatar-tracking: var(--md-sys-typescale-title-medium-tracking);
  display: inline-block;
  width: var(--yam3x-avatar-size, var(--_yam3x-avatar-size));
  aspect-ratio: 1 / 1;
  vertical-align: middle;
}
.yam3x-avatar[hidden] {
  display: none;
}
.yam3x-avatar__base {
  contain: layout style paint;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: var(--yam3x-avatar-shape, var(--_yam3x-avatar-shape));
  background-color: var(--yam3x-avatar-color, var(--_yam3x-avatar-container-color));
  color: var(--yam3x-avatar-label-color, var(--_yam3x-avatar-label-color));
  font-size: var(--yam3x-avatar-font-size, var(--_yam3x-avatar-font-size));
  font-weight: var(--yam3x-avatar-font-weight, var(--_yam3x-avatar-font-weight));
  line-height: var(--yam3x-avatar-line-height, var(--_yam3x-avatar-line-height));
  letter-spacing: var(--yam3x-avatar-tracking, var(--_yam3x-avatar-tracking));
  user-select: none;
  white-space: nowrap;
}
.yam3x-avatar__base :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  margin-inline: auto;
  overflow: hidden;
  object-fit: cover;
}
@media (forced-colors: active) {
  .yam3x-avatar__base {
    outline: 1px solid CanvasText;
    outline-offset: -1px;
  }
}
</style>
