<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, onUpdated, ref, useAttrs, watch } from 'vue'
import {
  circularArcPath,
  circularWaveArcPath,
  circularWavySweep,
  progressFraction,
  progressMaximum,
} from './progress-utils'
import type { ProgressVariant } from './progress-utils'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    value?: number
    max?: number
    indeterminate?: boolean
    variant?: ProgressVariant
  }>(),
  {
    value: 0,
    max: 100,
    indeterminate: false,
    variant: 'flat',
  },
)
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const geometry = ref({ size: 40, thickness: 4, amplitude: 1.6, wavelength: 15 })
const maxValue = computed(() => progressMaximum(props.max))
const fraction = computed(() => progressFraction(props.value, maxValue.value))
const displayedFraction = ref(fraction.value)
const variant = computed(() => (props.variant === 'wavy' ? 'wavy' : 'flat'))
const wavePadding = computed(() => geometry.value.amplitude + geometry.value.thickness / 2)
const drawingSize = computed(() => geometry.value.size + 2 * wavePadding.value)
const radius = computed(() => Math.max(0, geometry.value.size / 2 - geometry.value.thickness / 2))
const sweep = ref(150)
const wavePhase = ref(0)
const reducedMotion = ref(false)
const activeDegrees = computed(() => {
  const degrees = displayedFraction.value * 360
  if (degrees <= 0 || degrees >= 360) return degrees
  const minimum = ((geometry.value.thickness * 2) / (2 * Math.PI * radius.value)) * 360
  return Math.max(degrees, minimum)
})
const activeArc = computed(() =>
  circularArcPath(
    geometry.value.size,
    geometry.value.thickness,
    0,
    activeDegrees.value,
    activeDegrees.value < 360 ? geometry.value.thickness : 0,
  ),
)
const flatIndeterminateLeftArc = computed(() =>
  circularArcPath(
    geometry.value.size,
    geometry.value.thickness,
    -45,
    90 + geometry.value.thickness,
  ),
)
const flatIndeterminateRightArc = computed(() =>
  circularArcPath(geometry.value.size, geometry.value.thickness, -geometry.value.thickness, 135),
)
const minimumArcDegrees = computed(
  () => ((geometry.value.thickness * 2) / (2 * Math.PI * radius.value)) * 360,
)
const trackArc = computed(() =>
  360 - activeDegrees.value >= minimumArcDegrees.value
    ? circularArcPath(
        geometry.value.size,
        geometry.value.thickness,
        activeDegrees.value,
        360,
        activeDegrees.value > 0 ? geometry.value.thickness : 0,
      )
    : '',
)
const waveAmplitude = computed(() =>
  displayedFraction.value <= 0.1 || displayedFraction.value >= 0.95 ? 0 : geometry.value.amplitude,
)
const wavyActiveArc = computed(() =>
  circularWaveArcPath(
    drawingSize.value,
    geometry.value.thickness,
    waveAmplitude.value,
    geometry.value.wavelength,
    0,
    activeDegrees.value,
    200,
    wavePhase.value,
  ),
)
const wavyFlatActiveArc = computed(() =>
  circularArcPath(
    drawingSize.value,
    geometry.value.thickness,
    0,
    activeDegrees.value,
    activeDegrees.value < 360 ? geometry.value.thickness : 0,
    geometry.value.amplitude,
  ),
)
const wavyTrackArc = computed(() =>
  360 - activeDegrees.value >= minimumArcDegrees.value
    ? circularArcPath(
        drawingSize.value,
        geometry.value.thickness,
        activeDegrees.value,
        360,
        activeDegrees.value > 0 ? geometry.value.thickness : 0,
        geometry.value.amplitude,
      )
    : '',
)
const indeterminateTrackArc = computed(() =>
  circularArcPath(
    drawingSize.value,
    geometry.value.thickness,
    sweep.value,
    360,
    geometry.value.thickness,
    geometry.value.amplitude,
  ),
)
const indeterminateWaveArc = computed(() =>
  circularWaveArcPath(
    drawingSize.value,
    geometry.value.thickness,
    geometry.value.amplitude,
    geometry.value.wavelength,
    0,
    sweep.value,
  ),
)

let resizeObserver: ResizeObserver | undefined
let styleObserver: MutationObserver | undefined
let motionQuery: MediaQueryList | undefined
let animationFrame = 0
let animationStart: number | undefined
let progressFrame = 0
let progressStart = 0
let progressFrom = 0
let progressTo = fraction.value
function stopProgressAnimation() {
  if (progressFrame) cancelAnimationFrame(progressFrame)
  progressFrame = 0
}
function animateProgress(now: number) {
  const elapsed = Math.min(1, (now - progressStart) / 500)
  const eased = 1 - (1 - elapsed) ** 3
  displayedFraction.value = progressFrom + (progressTo - progressFrom) * eased
  if (elapsed < 1) progressFrame = requestAnimationFrame(animateProgress)
  else {
    displayedFraction.value = progressTo
    progressFrame = 0
  }
}
function syncProgressAnimation() {
  stopProgressAnimation()
  progressTo = fraction.value
  if (props.indeterminate || reducedMotion.value || !root.value) {
    displayedFraction.value = progressTo
    return
  }
  progressFrom = displayedFraction.value
  if (progressFrom === progressTo) return
  progressStart = performance.now()
  progressFrame = requestAnimationFrame(animateProgress)
}
function updateSweep(now: number) {
  if (
    variant.value !== 'wavy' ||
    reducedMotion.value ||
    (!props.indeterminate && waveAmplitude.value === 0)
  ) {
    animationFrame = 0
    animationStart = undefined
    return
  }
  animationStart ??= now
  const elapsed = (now - animationStart) / 1000
  if (props.indeterminate) {
    const padding = ((geometry.value.thickness * 360) / (Math.PI * geometry.value.size)) * 2
    sweep.value = circularWavySweep(elapsed, padding)
  } else {
    const waveCount =
      (2 *
        Math.PI *
        Math.max(
          0,
          geometry.value.size / 2 - geometry.value.thickness / 2 - geometry.value.amplitude,
        )) /
      geometry.value.wavelength
    wavePhase.value = (-waveCount * 2 * Math.PI * elapsed) / 8
  }
  animationFrame = requestAnimationFrame(updateSweep)
}
function syncAnimation() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
  animationStart = undefined
  if (
    variant.value === 'wavy' &&
    !reducedMotion.value &&
    (props.indeterminate || waveAmplitude.value > 0)
  ) {
    animationFrame = requestAnimationFrame(updateSweep)
  } else if (props.indeterminate && variant.value === 'wavy') {
    sweep.value = circularWavySweep(
      2.3625,
      ((geometry.value.thickness * 360) / (Math.PI * geometry.value.size)) * 2,
    )
  }
}
function onMotionPreferenceChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  syncProgressAnimation()
  syncAnimation()
}
function cssLength(probe: HTMLElement, name: string, fallback: number, allowZero = false): number {
  probe.style.width = `var(${name}, ${fallback}px)`
  const value = probe.getBoundingClientRect().width
  return Number.isFinite(value) && (value > 0 || (allowZero && value === 0)) ? value : fallback
}
function readGeometry() {
  if (!root.value) return
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:0'
  root.value.append(probe)
  const sizeName =
    variant.value === 'wavy'
      ? '--_yam3x-circular-progress-diameter-wavy'
      : '--_yam3x-circular-progress-diameter-flat'
  const nextGeometry = {
    size: cssLength(probe, sizeName, variant.value === 'wavy' ? 48 : 40),
    thickness: cssLength(probe, '--_yam3x-circular-progress-thickness', 4),
    amplitude: cssLength(probe, '--_yam3x-circular-progress-wave-amplitude', 1.6, true),
    wavelength: cssLength(probe, '--_yam3x-circular-progress-wave-wavelength', 15),
  }
  probe.remove()
  if (
    Object.keys(nextGeometry).some(
      (key) =>
        nextGeometry[key as keyof typeof nextGeometry] !==
        geometry.value[key as keyof typeof geometry.value],
    )
  ) {
    geometry.value = nextGeometry
  }
}
onMounted(async () => {
  await nextTick()
  readGeometry()
  if (root.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(readGeometry)
    resizeObserver.observe(root.value)
  }
  if (root.value && typeof MutationObserver !== 'undefined') {
    styleObserver = new MutationObserver(readGeometry)
    styleObserver.observe(root.value, { attributes: true, attributeFilter: ['style', 'class'] })
  }
  if (typeof window.matchMedia === 'function') {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = motionQuery.matches
    motionQuery.addEventListener?.('change', onMotionPreferenceChange)
  }
  syncAnimation()
})
onUpdated(readGeometry)
watch([fraction, () => props.indeterminate], syncProgressAnimation)
watch([variant, () => props.indeterminate], async () => {
  await nextTick()
  readGeometry()
  syncAnimation()
})
watch(geometry, syncAnimation)
watch(waveAmplitude, syncAnimation)
onUnmounted(() => {
  resizeObserver?.disconnect()
  styleObserver?.disconnect()
  motionQuery?.removeEventListener?.('change', onMotionPreferenceChange)
  if (animationFrame) cancelAnimationFrame(animationFrame)
  stopProgressAnimation()
})
</script>

<template>
  <div
    ref="root"
    v-bind="attrs"
    class="yam3x-circular-progress"
    :class="[
      `yam3x-circular-progress--${variant}`,
      { 'yam3x-circular-progress--indeterminate': indeterminate },
    ]"
    role="progressbar"
    aria-valuemin="0"
    :aria-valuemax="maxValue"
    :aria-valuenow="
      indeterminate
        ? undefined
        : Math.min(maxValue, Math.max(0, Number.isFinite(value) ? value : 0))
    "
  >
    <svg
      class="yam3x-circular-progress__graphic"
      :viewBox="`0 0 ${variant === 'wavy' ? drawingSize : geometry.size} ${variant === 'wavy' ? drawingSize : geometry.size}`"
      aria-hidden="true"
    >
      <circle
        v-if="variant === 'flat' && indeterminate"
        class="yam3x-circular-progress__track"
        :cx="geometry.size / 2"
        :cy="geometry.size / 2"
        :r="radius"
        pathLength="100"
      />
      <path
        v-if="variant === 'flat' && !indeterminate && trackArc"
        class="yam3x-circular-progress__track"
        :d="trackArc"
      />
      <path
        v-if="variant === 'wavy' && !indeterminate && wavyTrackArc"
        class="yam3x-circular-progress__track"
        :d="wavyTrackArc"
      />
      <path
        v-if="variant === 'flat' && !indeterminate && activeDegrees > 0"
        class="yam3x-circular-progress__indicator"
        :d="activeArc"
      />
      <g
        v-if="variant === 'wavy' && indeterminate"
        class="yam3x-circular-progress__wavy-spinner"
      >
        <path
          class="yam3x-circular-progress__track"
          :d="indeterminateTrackArc"
        />
        <path
          class="yam3x-circular-progress__indicator yam3x-circular-progress__indicator--wave"
          :d="indeterminateWaveArc"
        />
      </g>
      <path
        v-if="variant === 'wavy' && !indeterminate && activeDegrees > 0"
        class="yam3x-circular-progress__indicator yam3x-circular-progress__indicator--wave"
        :d="waveAmplitude > 0 ? wavyActiveArc : wavyFlatActiveArc"
      />
    </svg>
    <span
      v-if="variant === 'flat' && indeterminate"
      class="yam3x-circular-progress__rotation"
      aria-hidden="true"
    >
      <span class="yam3x-circular-progress__spinner">
        <span class="yam3x-circular-progress__half yam3x-circular-progress__half--left">
          <svg
            class="yam3x-circular-progress__arc"
            :viewBox="`0 0 ${geometry.size} ${geometry.size}`"
          >
            <path
              class="yam3x-circular-progress__indicator"
              :d="flatIndeterminateLeftArc"
            />
          </svg>
        </span>
        <span class="yam3x-circular-progress__half yam3x-circular-progress__half--right">
          <svg
            class="yam3x-circular-progress__arc"
            :viewBox="`0 0 ${geometry.size} ${geometry.size}`"
          >
            <path
              class="yam3x-circular-progress__indicator"
              :d="flatIndeterminateRightArc"
            />
          </svg>
        </span>
      </span>
    </span>
    <span
      class="yam3x-circular-progress__content"
      aria-hidden="true"
      inert
      ><slot
    /></span>
  </div>
</template>

<style scoped>
.yam3x-circular-progress {
  --_yam3x-progress-color-active: var(
    --yam3x-progress-indicator-color,
    var(--md-sys-color-primary)
  );
  --_yam3x-progress-color-track: var(
    --yam3x-progress-indicator-track-color,
    var(--md-sys-color-secondary-container)
  );
  --_yam3x-circular-progress-diameter-flat: var(
    --yam3x-circular-flat-progress-indicator-diameter,
    40px
  );
  --_yam3x-circular-progress-diameter-wavy: var(
    --yam3x-circular-wavy-progress-indicator-diameter,
    48px
  );
  --_yam3x-circular-progress-thickness: var(--yam3x-circular-progress-indicator-thickness, 4px);
  --_yam3x-circular-progress-wave-amplitude: var(
    --yam3x-circular-wavy-progress-indicator-amplitude,
    1.6px
  );
  --_yam3x-circular-progress-wave-wavelength: var(
    --yam3x-circular-wavy-progress-indicator-wavelength,
    15px
  );
  display: inline-grid;
  width: var(--_yam3x-circular-progress-diameter-flat);
  aspect-ratio: 1;
  position: relative;
  place-items: center;
  vertical-align: middle;
  color: var(--_yam3x-progress-color-active);
}
.yam3x-circular-progress[hidden] {
  display: none;
}
.yam3x-circular-progress--wavy {
  width: var(--_yam3x-circular-progress-diameter-wavy);
}
.yam3x-circular-progress__graphic,
.yam3x-circular-progress__content,
.yam3x-circular-progress__rotation,
.yam3x-circular-progress__spinner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.yam3x-circular-progress__track,
.yam3x-circular-progress__indicator {
  fill: none;
  stroke-width: var(--_yam3x-circular-progress-thickness);
}
.yam3x-circular-progress__track {
  stroke: var(--_yam3x-progress-color-track);
}
.yam3x-circular-progress__indicator {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dashoffset: 0;
  transform-origin: 50% 50%;
}
circle.yam3x-circular-progress__indicator {
  transform: rotate(-90deg);
}
.yam3x-circular-progress--indeterminate
  > .yam3x-circular-progress__graphic
  > .yam3x-circular-progress__track,
.yam3x-circular-progress--indeterminate
  .yam3x-circular-progress__wavy-spinner
  .yam3x-circular-progress__track {
  opacity: 0.35;
}
.yam3x-circular-progress__rotation,
.yam3x-circular-progress__spinner,
.yam3x-circular-progress__wavy-spinner {
  transform-origin: 50% 50%;
}
.yam3x-circular-progress__half {
  position: absolute;
  inset-block: 0;
  width: 50%;
  overflow: hidden;
}
.yam3x-circular-progress__half--left {
  left: 0;
}
.yam3x-circular-progress__half--right {
  right: 0;
}
.yam3x-circular-progress__arc {
  position: absolute;
  top: 0;
  width: 200%;
  height: 100%;
  overflow: visible;
  animation: yam3x-progress-circular-expand 1.333s cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}
.yam3x-circular-progress__half--left .yam3x-circular-progress__arc {
  left: 0;
  rotate: 135deg;
}
.yam3x-circular-progress__half--right .yam3x-circular-progress__arc {
  right: 0;
  rotate: 100deg;
  animation-delay: -0.6665s;
}
.yam3x-circular-progress__arc .yam3x-circular-progress__indicator {
  stroke-linecap: round;
}
.yam3x-circular-progress--indeterminate .yam3x-circular-progress__rotation {
  animation: yam3x-progress-circular-linear-rotate 1.568s linear infinite;
}
.yam3x-circular-progress--indeterminate .yam3x-circular-progress__spinner {
  animation: yam3x-progress-circular-arc 5.332s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.yam3x-circular-progress--wavy.yam3x-circular-progress--indeterminate
  .yam3x-circular-progress__wavy-spinner {
  animation: yam3x-progress-wavy-spin 1.575s linear infinite;
}
.yam3x-circular-progress--wavy.yam3x-circular-progress--indeterminate
  .yam3x-circular-progress__indicator {
  transition: none;
}
.yam3x-circular-progress__content {
  display: grid;
  place-items: center;
  color: inherit;
}
.yam3x-circular-progress--indeterminate .yam3x-circular-progress__content {
  display: none;
}
@keyframes yam3x-progress-circular-linear-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes yam3x-progress-circular-arc {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
@keyframes yam3x-progress-circular-expand {
  0%,
  100% {
    transform: rotate(265deg);
  }
  50% {
    transform: rotate(130deg);
  }
}
@keyframes yam3x-progress-wavy-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-circular-progress--indeterminate .yam3x-circular-progress__rotation,
  .yam3x-circular-progress--indeterminate .yam3x-circular-progress__spinner,
  .yam3x-circular-progress--indeterminate .yam3x-circular-progress__arc,
  .yam3x-circular-progress--indeterminate .yam3x-circular-progress__wavy-spinner,
  .yam3x-circular-progress--indeterminate .yam3x-circular-progress__indicator {
    animation: none !important;
  }
}
@media (forced-colors: active) {
  .yam3x-circular-progress__track {
    stroke: GrayText;
  }
  .yam3x-circular-progress__indicator {
    stroke: CanvasText;
  }
}
</style>
