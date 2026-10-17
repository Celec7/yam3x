<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import FloatingActionButton from './floating-action-button.vue'
import Icon from '../icon/icon.vue'
import type { ToggleFloatingActionButtonSize, ToggleFloatingActionButtonVariant } from './fab.types'

type ToggleFabVariant =
  ToggleFloatingActionButtonVariant | `${ToggleFloatingActionButtonVariant}-container`

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    size?: ToggleFloatingActionButtonSize
    variant?: ToggleFloatingActionButtonVariant
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { size: 'default', variant: 'primary', disabled: false, type: 'button' },
)
const checked = defineModel<boolean>('checked', { default: false })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ icon?(props: { checked: boolean; progress: number }): unknown }>()
const button = ref<{ $el?: HTMLElement } | null>(null)

const progress = ref(checked.value ? 1 : 0)
let frame = 0
function animateProgress(target: number) {
  cancelAnimationFrame(frame)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress.value = target
    return
  }
  const startValue = progress.value
  const startTime = performance.now()
  const styleElement = button.value?.$el ?? document.documentElement
  const motionStyles = getComputedStyle(styleElement)
  const springToken = motionStyles.getPropertyValue('--md-sys-motion-spring-fast-spatial').trim()
  const durationToken =
    motionStyles.getPropertyValue('--md-sys-motion-duration-fast-spatial').trim() ||
    springToken.match(/^\d*\.?\d+(?:ms|s)/)?.[0] ||
    ''
  const duration = durationToken.endsWith('s')
    ? Number.parseFloat(durationToken) * (durationToken.endsWith('ms') ? 1 : 1000)
    : 472
  const easingToken =
    motionStyles.getPropertyValue('--md-sys-motion-easing-fast-spatial').trim() ||
    springToken.slice(durationToken.length).trim()
  const linearValues = easingToken
    .match(/^linear\((.*)\)$/)?.[1]
    ?.split(',')
    .map((value) => Number.parseFloat(value))
    .filter(Number.isFinite)
  const bezierValues = easingToken
    .match(/^cubic-bezier\(([^)]+)\)$/)?.[1]
    ?.split(',')
    .map(Number)
  const ease = (amount: number) => {
    if (amount === 0 || amount === 1) return amount
    if (linearValues && linearValues.length > 1) {
      const position = amount * (linearValues.length - 1)
      const index = Math.min(Math.floor(position), linearValues.length - 2)
      const fraction = position - index
      return linearValues[index]! + (linearValues[index + 1]! - linearValues[index]!) * fraction
    }
    if (bezierValues?.length === 4) {
      const [x1, y1, x2, y2] = bezierValues as [number, number, number, number]
      const cubic = (time: number, first: number, second: number) =>
        3 * (1 - time) ** 2 * time * first + 3 * (1 - time) * time ** 2 * second + time ** 3
      let low = 0
      let high = 1
      let parameter = amount
      for (let index = 0; index < 12; index += 1) {
        parameter = (low + high) / 2
        if (cubic(parameter, x1, x2) < amount) low = parameter
        else high = parameter
      }
      return cubic(parameter, y1, y2)
    }
    return amount
  }
  const tick = (time: number) => {
    const amount = Math.min(1, (time - startTime) / duration)
    progress.value = startValue + (target - startValue) * ease(amount)
    if (amount < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}
watch(checked, (value) => animateProgress(value ? 1 : 0))
onBeforeUnmount(() => cancelAnimationFrame(frame))

const sizePixels: Record<ToggleFloatingActionButtonSize, number> = {
  small: 40,
  default: 56,
  medium: 80,
  large: 96,
}
const dimensions = computed(() => {
  const from = sizePixels[props.size]
  const to = 56
  return from + (to - from) * progress.value
})
const radius = computed(() => {
  const from = ({ small: 12, default: 16, medium: 24, large: 28 } as const)[props.size]
  return from + (28 - from) * progress.value
})
const buttonStyle = computed(() => ({
  width: `${dimensions.value}px`,
  minWidth: `${dimensions.value}px`,
  height: `${dimensions.value}px`,
  minHeight: `${dimensions.value}px`,
  borderRadius: `${radius.value}px`,
  '--yam3x-toggle-fab-anchor-shift': `${-((sizePixels[props.size] - 56) * progress.value)}px`,
}))
const variant = computed<ToggleFabVariant>(() =>
  checked.value ? props.variant : `${props.variant}-container`,
)
function onClick(event: MouseEvent) {
  if (props.disabled) return
  checked.value = !checked.value
  emit('click', event)
}

defineExpose({ element: computed(() => button.value?.$el ?? null) })
</script>

<template>
  <FloatingActionButton
    ref="button"
    v-bind="$attrs"
    :class="[
      'yam3x-toggle-floating-action-button',
      { 'yam3x-toggle-floating-action-button--checked': checked },
    ]"
    :style="buttonStyle"
    :size="size"
    :variant="variant"
    :disabled="disabled"
    :type="type"
    :aria-pressed="checked"
    @click="onClick"
  >
    <slot
      name="icon"
      :checked="checked"
      :progress="progress"
    >
      <span
        class="yam3x-toggle-floating-action-button__icons"
        :style="{ '--toggle-progress': progress }"
        aria-hidden="true"
      >
        <Icon
          class="yam3x-toggle-floating-action-button__add"
          name="add"
        />
        <Icon
          class="yam3x-toggle-floating-action-button__close"
          name="close"
        />
      </span>
    </slot>
  </FloatingActionButton>
</template>

<style>
.yam3x-toggle-floating-action-button {
  justify-content: center;
}
.yam3x-floating-action-button.yam3x-toggle-floating-action-button[aria-pressed] {
  transition:
    background-color var(--md-sys-motion-spring-fast-effects),
    box-shadow var(--md-sys-motion-spring-default-effects),
    color var(--md-sys-motion-spring-fast-effects);
}
.yam3x-floating-action-button.yam3x-toggle-floating-action-button[data-fab-menu-trigger] {
  transform: translateY(var(--yam3x-toggle-fab-anchor-shift, 0px));
}
.yam3x-toggle-floating-action-button__icons {
  position: relative;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
}
.yam3x-toggle-floating-action-button__icons .yam3x-icon {
  position: absolute;
}
.yam3x-toggle-floating-action-button__add {
  opacity: calc(1 - var(--toggle-progress));
  transform: rotate(calc(var(--toggle-progress) * 45deg));
}
.yam3x-toggle-floating-action-button__close {
  opacity: var(--toggle-progress);
  transform: rotate(calc((1 - var(--toggle-progress)) * -45deg));
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-floating-action-button.yam3x-toggle-floating-action-button[aria-pressed],
  .yam3x-toggle-floating-action-button__icons .yam3x-icon {
    transition: none;
  }
}
</style>
