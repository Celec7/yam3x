<script setup lang="ts">
import { useId } from 'vue'
import Heading from '../heading/heading.vue'
import { useComponentLocale } from '../localization/context'
import type { DescriptionItem } from './descriptions.types'

const props = withDefaults(
  defineProps<{
    items?: readonly DescriptionItem[]
    title?: string
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
    columns?: 1 | 2 | 3 | 4
    layout?: 'stacked' | 'inline'
    outlined?: boolean
    locale?: string
    emptyText?: string
    missingValueText?: string
  }>(),
  {
    items: () => [],
    title: '',
    headingLevel: 3,
    columns: 3,
    layout: 'stacked',
    outlined: false,
  },
)
defineSlots<{
  label?(scope: { item: DescriptionItem }): unknown
  value?(scope: { item: DescriptionItem; value: DescriptionItem['value'] }): unknown
  empty?(): unknown
}>()
const titleId = `yam3x-descriptions-${useId()}`
const { messages } = useComponentLocale(
  'descriptions',
  () => props.locale,
  () => ({
    empty: props.emptyText,
    missingValue: props.missingValueText,
  }),
)
</script>

<template>
  <div
    class="yam3x-descriptions"
    :class="[
      `yam3x-descriptions--columns-${columns}`,
      `yam3x-descriptions--${layout}`,
      { 'yam3x-descriptions--outlined': outlined },
    ]"
  >
    <Heading
      v-if="title"
      :id="titleId"
      variant="title"
      size="medium"
      :level="headingLevel"
      class="yam3x-descriptions__title"
      >{{ title }}</Heading
    >
    <dl
      v-if="items.length"
      class="yam3x-descriptions__list"
      :aria-labelledby="title ? titleId : undefined"
    >
      <div
        v-for="item in items"
        :key="item.key"
        class="yam3x-descriptions__item"
        :class="{ 'yam3x-descriptions__item--full': item.fullWidth }"
      >
        <dt class="yam3x-descriptions__label">
          <slot
            name="label"
            :item="item"
            >{{ item.label }}</slot
          >
        </dt>
        <dd class="yam3x-descriptions__value">
          <slot
            name="value"
            :item="item"
            :value="item.value"
            >{{ item.value ?? messages.missingValue }}</slot
          >
        </dd>
      </div>
    </dl>
    <div
      v-else
      class="yam3x-descriptions__empty"
    >
      <slot name="empty">{{ messages.empty }}</slot>
    </div>
  </div>
</template>

<style>
.yam3x-descriptions {
  --_yam3x-descriptions-gap: var(
    --yam3x-descriptions-gap,
    calc(24px * var(--md-sys-density-spacing-scale, 1))
  );
  --_yam3x-descriptions-label: var(--md-sys-color-on-surface-variant);
  --_yam3x-descriptions-value: var(--md-sys-color-on-surface);
  --_yam3x-descriptions-outline: var(--md-sys-color-outline-variant);
  --_yam3x-descriptions-shape: var(--md-sys-shape-corner-medium);
  --_yam3x-descriptions-label-font: var(--md-sys-typescale-label-large-font-family);
  --_yam3x-descriptions-label-size: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-descriptions-label-weight: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-descriptions-label-line: var(--md-sys-typescale-label-large-line-height);
  --_yam3x-descriptions-label-tracking: var(--md-sys-typescale-label-large-tracking);
  --_yam3x-descriptions-value-font: var(--md-sys-typescale-body-large-font-family);
  --_yam3x-descriptions-value-size: var(--md-sys-typescale-body-large-font-size);
  --_yam3x-descriptions-value-weight: var(--md-sys-typescale-body-large-font-weight);
  --_yam3x-descriptions-value-line: var(--md-sys-typescale-body-large-line-height);
  --_yam3x-descriptions-value-tracking: var(--md-sys-typescale-body-large-tracking);
  container-type: inline-size;
  min-inline-size: 0;
  color: var(--_yam3x-descriptions-value);
}
.yam3x-descriptions--outlined {
  border: 1px solid var(--_yam3x-descriptions-outline);
  border-radius: var(--_yam3x-descriptions-shape);
  padding: var(--_yam3x-descriptions-gap);
}
.yam3x-descriptions .yam3x-descriptions__title {
  margin: 0 0 var(--_yam3x-descriptions-gap);
}
.yam3x-descriptions .yam3x-descriptions__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--_yam3x-descriptions-gap);
  margin: 0;
  padding: 0;
}
.yam3x-descriptions__item {
  display: grid;
  align-content: start;
  gap: 4px;
  min-inline-size: 0;
}
.yam3x-descriptions__item--full {
  grid-column: 1 / -1;
}
.yam3x-descriptions .yam3x-descriptions__label {
  margin: 0;
  color: var(--_yam3x-descriptions-label);
  font-family: var(--_yam3x-descriptions-label-font);
  font-size: var(--_yam3x-descriptions-label-size);
  font-weight: var(--_yam3x-descriptions-label-weight);
  line-height: var(--_yam3x-descriptions-label-line);
  letter-spacing: var(--_yam3x-descriptions-label-tracking);
  overflow-wrap: anywhere;
}
.yam3x-descriptions .yam3x-descriptions__value,
.yam3x-descriptions .yam3x-descriptions__empty {
  margin: 0;
  min-inline-size: 0;
  color: var(--_yam3x-descriptions-value);
  font-family: var(--_yam3x-descriptions-value-font);
  font-size: var(--_yam3x-descriptions-value-size);
  font-weight: var(--_yam3x-descriptions-value-weight);
  line-height: var(--_yam3x-descriptions-value-line);
  letter-spacing: var(--_yam3x-descriptions-value-tracking);
  overflow-wrap: anywhere;
}
.yam3x-descriptions--inline > .yam3x-descriptions__list > .yam3x-descriptions__item {
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  column-gap: 16px;
}
@container (min-width: 32rem) {
  .yam3x-descriptions:where(:not(.yam3x-descriptions--columns-1)) > .yam3x-descriptions__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container (min-width: 48rem) {
  .yam3x-descriptions--columns-3 > .yam3x-descriptions__list,
  .yam3x-descriptions--columns-4 > .yam3x-descriptions__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@container (min-width: 64rem) {
  .yam3x-descriptions--columns-4 > .yam3x-descriptions__list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (forced-colors: active) {
  .yam3x-descriptions--outlined {
    border-color: CanvasText;
  }
}
</style>
