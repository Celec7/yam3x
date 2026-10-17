<script setup lang="ts">
import Heading from '../heading/heading.vue'
import Icon from '../icon/icon.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    context?: 'embedded' | 'page'
    align?: 'center' | 'start'
    icon?: string
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  }>(),
  {
    description: '',
    context: 'embedded',
    align: 'center',
    icon: undefined,
    headingLevel: undefined,
  },
)
defineSlots<{ default?(): unknown; illustration?(): unknown; actions?(): unknown }>()
</script>

<template>
  <div
    class="yam3x-empty-state"
    :class="[`yam3x-empty-state--${context}`, `yam3x-empty-state--${align}`]"
  >
    <div
      v-if="$slots.illustration || icon"
      class="yam3x-empty-state__illustration"
    >
      <slot name="illustration"
        ><Icon
          :name="icon"
          class="yam3x-empty-state__icon"
      /></slot>
    </div>
    <div class="yam3x-empty-state__text">
      <Heading
        :variant="context === 'page' ? 'headline' : 'title'"
        :size="context === 'page' ? 'small' : 'medium'"
        :level="headingLevel"
        >{{ title }}</Heading
      >
      <div
        v-if="$slots.default || description"
        class="yam3x-empty-state__description"
      >
        <slot>{{ description }}</slot>
      </div>
    </div>
    <div
      v-if="$slots.actions"
      class="yam3x-empty-state__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.yam3x-empty-state {
  --_yam3x-empty-state-title-color: var(--md-sys-color-on-surface);
  --_yam3x-empty-state-description-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-empty-state-padding: calc(24px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-empty-state-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-empty-state-text-gap: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-empty-state-body-font: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-empty-state-body-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-empty-state-body-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-empty-state-body-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-empty-state-body-tracking: var(--md-sys-typescale-body-medium-tracking);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--_yam3x-empty-state-gap);
  min-inline-size: 0;
  padding: var(--_yam3x-empty-state-padding);
  color: var(--_yam3x-empty-state-title-color);
  text-align: center;
  overflow-wrap: anywhere;
}
.yam3x-empty-state--page {
  --_yam3x-empty-state-body-font: var(--md-sys-typescale-body-large-font-family);
  --_yam3x-empty-state-body-size: var(--md-sys-typescale-body-large-font-size);
  --_yam3x-empty-state-body-weight: var(--md-sys-typescale-body-large-font-weight);
  --_yam3x-empty-state-body-height: var(--md-sys-typescale-body-large-line-height);
  --_yam3x-empty-state-body-tracking: var(--md-sys-typescale-body-large-tracking);
}
.yam3x-empty-state--start {
  align-items: flex-start;
  text-align: start;
}
.yam3x-empty-state__text {
  display: grid;
  gap: var(--_yam3x-empty-state-text-gap);
  max-inline-size: min(100%, 40ch);
}
.yam3x-empty-state__description {
  color: var(--_yam3x-empty-state-description-color);
  font-family: var(--_yam3x-empty-state-body-font);
  font-size: var(--_yam3x-empty-state-body-size);
  font-weight: var(--_yam3x-empty-state-body-weight);
  line-height: var(--_yam3x-empty-state-body-height);
  letter-spacing: var(--_yam3x-empty-state-body-tracking);
}
.yam3x-empty-state__illustration {
  max-inline-size: 100%;
  color: var(--_yam3x-empty-state-description-color);
}
.yam3x-empty-state__illustration :deep(img),
.yam3x-empty-state__illustration :deep(svg) {
  max-inline-size: 100%;
  block-size: auto;
}
.yam3x-empty-state .yam3x-empty-state__icon {
  --yam3x-icon-size: 48px;
}
.yam3x-empty-state__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--_yam3x-empty-state-text-gap);
  max-inline-size: 100%;
}
.yam3x-empty-state--start .yam3x-empty-state__actions {
  justify-content: flex-start;
}
.yam3x-empty-state[hidden] {
  display: none;
}
</style>
