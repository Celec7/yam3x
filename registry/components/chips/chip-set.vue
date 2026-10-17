<script setup lang="ts">
withDefaults(defineProps<{ vertical?: boolean; label?: string }>(), {
  vertical: false,
  label: undefined,
})
</script>

<template>
  <div
    class="yam3x-chip-set"
    :class="{ 'yam3x-chip-set--vertical': vertical }"
    :role="label ? 'group' : undefined"
    :aria-label="label"
  >
    <slot />
  </div>
</template>

<style scoped>
.yam3x-chip-set {
  --_yam3x-chip-set-gap: max(
    8px,
    var(--md-sys-spacing-8, calc(8px * var(--md-sys-density-spacing-scale, 1)))
  );
  display: inline-flex;
  max-width: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--_yam3x-chip-set-gap);
}
.yam3x-chip-set--vertical {
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
}
</style>
