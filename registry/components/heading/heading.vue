<script setup lang="ts">
import { computed } from 'vue'

type HeadingVariant = 'display' | 'headline' | 'title' | 'label'
type HeadingSize = 'small' | 'medium' | 'large'
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const props = withDefaults(
  defineProps<{
    variant?: HeadingVariant
    size?: HeadingSize
    emphasized?: boolean
    level?: HeadingLevel
  }>(),
  {
    variant: 'display',
    size: 'medium',
    emphasized: false,
  },
)

const validVariants: HeadingVariant[] = ['display', 'headline', 'title', 'label']
const validSizes: HeadingSize[] = ['small', 'medium', 'large']
const resolvedVariant = computed(() =>
  validVariants.includes(props.variant) ? props.variant : 'display',
)
const resolvedSize = computed(() => (validSizes.includes(props.size) ? props.size : 'medium'))
const resolvedLevel = computed(() =>
  Number.isInteger(props.level) && props.level! >= 1 && props.level! <= 6 ? props.level : undefined,
)
const rootTag = computed(() => (resolvedLevel.value ? `h${resolvedLevel.value}` : 'span'))
const typescale = computed(
  () => `${props.emphasized ? 'emphasized-' : ''}${resolvedVariant.value}-${resolvedSize.value}`,
)
const typography = computed(() => ({
  '--_yam3x-heading-font-family': `var(--md-sys-typescale-${typescale.value}-font-family)`,
  '--_yam3x-heading-font-size': `var(--md-sys-typescale-${typescale.value}-font-size)`,
  '--_yam3x-heading-font-weight': `var(--md-sys-typescale-${typescale.value}-font-weight)`,
  '--_yam3x-heading-line-height': `var(--md-sys-typescale-${typescale.value}-line-height)`,
  '--_yam3x-heading-tracking': `var(--md-sys-typescale-${typescale.value}-tracking)`,
}))
</script>

<template>
  <component
    :is="rootTag"
    class="yam3x-heading"
    :style="typography"
  >
    <slot />
  </component>
</template>

<style scoped>
.yam3x-heading {
  display: block;
  margin: 0;
  font-family: var(--_yam3x-heading-font-family);
  font-size: var(--_yam3x-heading-font-size);
  font-weight: var(--_yam3x-heading-font-weight);
  line-height: var(--_yam3x-heading-line-height);
  letter-spacing: var(--_yam3x-heading-tracking);
  color: inherit;
}
.yam3x-heading[hidden] {
  display: none;
}
</style>
