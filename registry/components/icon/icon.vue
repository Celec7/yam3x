<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import { getRegisteredIcon, observeIcon } from './icon-registry'
import type { IconGrade, IconVariant, IconWeight } from './icon.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    name?: string
    variant?: IconVariant
    filled?: boolean
    grade?: IconGrade
    weight?: IconWeight
    opticalSize?: number
    ariaLabel?: string
    ariaLabelledby?: string
    ariaHidden?: 'true' | 'false'
  }>(),
  {
    name: '',
    variant: 'outlined',
    filled: false,
    grade: 'auto',
    weight: 400,
    opticalSize: 24,
  },
)

const attrs = useAttrs()
const validVariants: IconVariant[] = ['outlined', 'rounded', 'sharp']
const validGrades: IconGrade[] = ['low', 'medium', 'high']
const validWeights: IconWeight[] = [100, 200, 300, 400, 500, 600, 700]
const resolvedVariant = computed<IconVariant>(() =>
  validVariants.includes(props.variant) ? props.variant : 'outlined',
)
const resolvedGrade = computed<IconGrade>(() =>
  props.grade === 'auto' || validGrades.includes(props.grade) ? props.grade : 'auto',
)
const resolvedWeight = computed<IconWeight>(() =>
  validWeights.includes(props.weight) ? props.weight : 400,
)
const resolvedOpticalSize = computed(() =>
  Number.isFinite(Number(props.opticalSize)) ? Number(props.opticalSize) : 24,
)
const gradeValue = computed(() =>
  resolvedGrade.value === 'auto'
    ? 'var(--_yam3x-icon-auto-grade)'
    : resolvedGrade.value === 'low'
      ? -25
      : resolvedGrade.value === 'high'
        ? 200
        : 0,
)
const accessibleNamePresent = computed(() => Boolean(props.ariaLabel || props.ariaLabelledby))
const ariaHidden = computed(
  () => props.ariaHidden ?? (accessibleNamePresent.value ? undefined : 'true'),
)
const registryVersion = ref(0)
watch(
  [() => props.name, resolvedVariant],
  ([name, variant], _previous, onCleanup) => {
    const stop = observeIcon(name, variant, () => {
      registryVersion.value++
    })
    onCleanup(stop)
  },
  { immediate: true },
)

const icon = computed(() => {
  void registryVersion.value
  return getRegisteredIcon(props.name, resolvedVariant.value)
})
const iconStyle = computed(() => ({
  '--_yam3x-icon-font-family': `"Material Symbols ${resolvedVariant.value === 'outlined' ? 'Outlined' : resolvedVariant.value === 'rounded' ? 'Rounded' : 'Sharp'}"`,
  '--_yam3x-icon-font-variation-settings': `'FILL' ${props.filled ? 1 : 0}, 'wght' ${resolvedWeight.value}, 'GRAD' ${gradeValue.value}, 'opsz' ${resolvedOpticalSize.value}`,
}))
</script>

<template>
  <span
    v-bind="attrs"
    class="yam3x-icon"
    :role="typeof attrs.role === 'string' ? attrs.role : 'img'"
    :aria-label="props.ariaLabel"
    :aria-labelledby="props.ariaLabelledby"
    :aria-hidden="ariaHidden"
    :style="iconStyle"
  >
    <svg
      v-if="icon"
      class="yam3x-icon__svg"
      :viewBox="props.filled ? icon.filledViewBox : icon.outlinedViewBox"
      aria-hidden="true"
      focusable="false"
    >
      <path :d="props.filled ? icon.filledPath : icon.outlinedPath" />
    </svg>
    <span
      v-else
      class="yam3x-icon__ligature"
      aria-hidden="true"
      translate="no"
      >{{ props.name }}</span
    >
  </span>
</template>

<style scoped>
.yam3x-icon {
  --_yam3x-icon-size: var(--yam3x-icon-size, 24px);
  --_yam3x-icon-auto-grade: var(--yam3x-icon-auto-grade, var(--_yam3x-icon-default-auto-grade));
  display: inline-block;
  width: 1em;
  height: 1em;
  overflow: hidden;
  vertical-align: middle;
  user-select: none;
  font-size: var(--_yam3x-icon-size);
  font-family: var(--_yam3x-icon-font-family);
  font-variation-settings: var(--_yam3x-icon-font-variation-settings);
  line-height: 1em;
}
:global(:root) {
  --_yam3x-icon-default-auto-grade: 0;
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme]):not(.dark)) {
    --_yam3x-icon-default-auto-grade: -25;
  }
}
:global([data-theme='dark']),
:global(.dark) {
  --_yam3x-icon-default-auto-grade: -25;
}
:global([data-theme='light']) {
  --_yam3x-icon-default-auto-grade: 0;
}
.yam3x-icon__ligature {
  display: block;
  width: inherit;
  height: inherit;
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  overflow-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
.yam3x-icon__svg {
  display: block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  font-size: inherit;
}
.yam3x-icon[hidden] {
  display: none;
}
</style>
