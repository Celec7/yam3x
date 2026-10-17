<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue'
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ title: string; description?: string; disabled?: boolean }>(), {
  description: '',
  disabled: false,
})
defineSlots<{ default(): unknown }>()
const attrs = useAttrs()
const descriptionId = `yam3x-form-section-description-${useId().replace(/:/g, '')}`
const describedBy = computed(() =>
  [attrs['aria-describedby'], descriptionId].filter(Boolean).join(' '),
)
</script>

<template>
  <fieldset
    v-bind="attrs"
    class="yam3x-form-section"
    :disabled="disabled"
    :aria-describedby="
      description ? describedBy : (attrs['aria-describedby'] as string | undefined)
    "
  >
    <legend class="yam3x-form-section__title">{{ title }}</legend>
    <div class="yam3x-form-section__content">
      <p
        v-if="description"
        :id="descriptionId"
        class="yam3x-form-section__description"
      >
        {{ description }}
      </p>
      <slot />
    </div>
  </fieldset>
</template>

<style scoped>
.yam3x-form-section {
  --_yam3x-form-section-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-form-section-font: var(--md-sys-typescale-title-medium-font-family);
  --_yam3x-form-section-size: var(--md-sys-typescale-title-medium-font-size);
  --_yam3x-form-section-height: var(--md-sys-typescale-title-medium-line-height);
  --_yam3x-form-section-weight: var(--md-sys-typescale-title-medium-font-weight);
  --_yam3x-form-section-tracking: var(--md-sys-typescale-title-medium-tracking);
  --_yam3x-form-section-body-font: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-form-section-body-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-form-section-body-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-form-section-body-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-form-section-body-tracking: var(--md-sys-typescale-body-medium-tracking);
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.yam3x-form-section__title {
  padding: 0;
  margin-block-end: var(--_yam3x-form-section-gap);
  font-family: var(--_yam3x-form-section-font);
  font-size: var(--_yam3x-form-section-size);
  font-weight: var(--_yam3x-form-section-weight);
  line-height: var(--_yam3x-form-section-height);
  letter-spacing: var(--_yam3x-form-section-tracking);
}
.yam3x-form-section__content {
  display: grid;
  gap: var(--_yam3x-form-section-gap);
  min-inline-size: 0;
}
.yam3x-form-section__description {
  margin: 0;
  font-family: var(--_yam3x-form-section-body-font);
  font-size: var(--_yam3x-form-section-body-size);
  font-weight: var(--_yam3x-form-section-body-weight);
  line-height: var(--_yam3x-form-section-body-height);
  letter-spacing: var(--_yam3x-form-section-body-tracking);
}
.yam3x-form-section[hidden] {
  display: none;
}
</style>
