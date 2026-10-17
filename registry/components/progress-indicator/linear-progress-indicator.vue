<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue'
import {
  linearWavePath,
  linearWaveSegmentPath,
  linearWavyIndeterminateFrame,
  progressFraction,
  progressMaximum,
} from './progress-utils'
import type { LinearProgressMode, ProgressVariant } from './progress-utils'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    value?: number
    max?: number
    bufferValue?: number
    mode?: LinearProgressMode
    variant?: ProgressVariant
    stopSize?: number
  }>(),
  { value: 0, max: 100, bufferValue: 0, mode: 'determinate', variant: 'flat', stopSize: 4 },
)
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const trackWidth = ref(0)
const waveMetrics = ref({ thickness: 4, amplitude: 3, wavelength: 40, indeterminateWavelength: 20 })
const maxValue = computed(() => progressMaximum(props.max))
const fraction = computed(() => progressFraction(props.value, maxValue.value))
const bufferFraction = computed(() => progressFraction(props.bufferValue, maxValue.value))
const stopSize = computed(() => (Number.isFinite(props.stopSize) ? Math.max(0, props.stopSize) : 4))
const mode = computed<LinearProgressMode>(() =>
  ['determinate', 'indeterminate', 'buffer', 'query'].includes(props.mode)
    ? props.mode
    : 'determinate',
)
const variant = computed(() => (props.variant === 'wavy' ? 'wavy' : 'flat'))
const renderVariant = computed(() =>
  variant.value === 'wavy' && waveMetrics.value.amplitude > 0 ? 'wavy' : 'flat',
)
const indeterminate = computed(() => mode.value === 'indeterminate' || mode.value === 'query')
const wavyIndeterminate = computed(() => indeterminate.value && renderVariant.value === 'wavy')
const firstWave = ref<SVGPathElement | null>(null)
const secondWave = ref<SVGPathElement | null>(null)
const indeterminateTrack = ref<SVGPathElement | null>(null)
const activeWavelength = computed(() =>
  indeterminate.value ? waveMetrics.value.indeterminateWavelength : waveMetrics.value.wavelength,
)
const waveWidth = computed(() => trackWidth.value * fraction.value + activeWavelength.value * 3)
const wave = computed(() =>
  linearWavePath(
    waveWidth.value,
    waveMetrics.value.thickness,
    waveMetrics.value.amplitude,
    activeWavelength.value,
  ),
)
const progressStyle = computed(() => ({
  '--_yam3x-progress-value': `${fraction.value * 100}%`,
  '--_yam3x-progress-buffer': `${bufferFraction.value * 100}%`,
  '--_yam3x-linear-progress-stop-size-prop': `${stopSize.value}px`,
}))
let resizeObserver: ResizeObserver | undefined
let styleObserver: MutationObserver | undefined
let motionQuery: MediaQueryList | undefined
let animationFrame = 0
let animationStart: number | undefined
let reducedMotion = false
function paintWavyFrame(elapsedMs: number) {
  const width = trackWidth.value
  if (width <= 0 || !firstWave.value || !secondWave.value || !indeterminateTrack.value) return
  const { thickness, amplitude, indeterminateWavelength } = waveMetrics.value
  const frame = linearWavyIndeterminateFrame(elapsedMs)
  const intervals = [frame.first, frame.second]
    .map(([start, end]) => [Math.max(0, start * width), Math.min(width, end * width)] as const)
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0])
  const activePaths = [firstWave.value, secondWave.value]
  for (let index = 0; index < activePaths.length; index++) {
    const [start, end] = frame[index === 0 ? 'first' : 'second'].map((value) => value * width)
    activePaths[index]?.setAttribute(
      'd',
      linearWaveSegmentPath(
        start!,
        end!,
        thickness,
        amplitude,
        indeterminateWavelength,
        frame.phase,
      ),
    )
  }
  const baseline = amplitude + thickness / 2
  const gap = thickness * 2
  const track: string[] = []
  let cursor = thickness / 2
  for (const [start, end] of intervals) {
    const stop = Math.max(cursor, start - gap)
    if (stop > cursor) track.push(`M ${cursor} ${baseline} H ${stop}`)
    cursor = Math.max(cursor, end + gap)
  }
  const trackEnd = width - thickness / 2
  if (trackEnd > cursor) track.push(`M ${cursor} ${baseline} H ${trackEnd}`)
  indeterminateTrack.value.setAttribute('d', track.join(' '))
}
function animateWavy(now: number) {
  if (!wavyIndeterminate.value || reducedMotion) {
    animationFrame = 0
    return
  }
  animationStart ??= now
  paintWavyFrame(now - animationStart)
  animationFrame = requestAnimationFrame(animateWavy)
}
function syncWavyAnimation() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
  animationStart = undefined
  if (!wavyIndeterminate.value) return
  if (reducedMotion) paintWavyFrame(1100)
  else animationFrame = requestAnimationFrame(animateWavy)
}
function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion = event.matches
  syncWavyAnimation()
}
function cssLength(
  element: HTMLElement,
  name: string,
  fallback: number,
  allowZero = false,
): number {
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:0'
  probe.style.width = `var(${name}, ${fallback}px)`
  element.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return Number.isFinite(value) && (value > 0 || (allowZero && value === 0)) ? value : fallback
}
function readGeometry() {
  if (!root.value) return
  const nextWidth = (
    root.value.querySelector<HTMLElement>('.yam3x-linear-progress__track') ?? root.value
  ).getBoundingClientRect().width
  const nextMetrics = {
    thickness: cssLength(root.value, '--_yam3x-linear-progress-thickness', 4),
    amplitude: cssLength(root.value, '--_yam3x-linear-progress-wave-amplitude', 3, true),
    wavelength: cssLength(root.value, '--_yam3x-linear-progress-wave-wavelength', 40),
    indeterminateWavelength: cssLength(
      root.value,
      '--_yam3x-linear-progress-indeterminate-wave-wavelength',
      20,
    ),
  }
  if (nextWidth !== trackWidth.value) trackWidth.value = nextWidth
  if (
    Object.keys(nextMetrics).some(
      (key) =>
        nextMetrics[key as keyof typeof nextMetrics] !==
        waveMetrics.value[key as keyof typeof waveMetrics.value],
    )
  ) {
    waveMetrics.value = nextMetrics
  }
}
onMounted(() => {
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
    reducedMotion = motionQuery.matches
    motionQuery.addEventListener?.('change', onMotionChange)
  }
  void nextTick(syncWavyAnimation)
})
watch([wavyIndeterminate, trackWidth, waveMetrics], async () => {
  await nextTick()
  syncWavyAnimation()
})
onUnmounted(() => {
  resizeObserver?.disconnect()
  styleObserver?.disconnect()
  motionQuery?.removeEventListener?.('change', onMotionChange)
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <div
    ref="root"
    v-bind="attrs"
    class="yam3x-linear-progress"
    :class="[
      `yam3x-linear-progress--${mode}`,
      `yam3x-linear-progress--${renderVariant}`,
      { 'yam3x-linear-progress--complete': !indeterminate && fraction === 1 },
    ]"
    :style="progressStyle"
    role="progressbar"
    aria-valuemin="0"
    :aria-valuemax="maxValue"
    :aria-valuenow="
      indeterminate
        ? undefined
        : Math.min(maxValue, Math.max(0, Number.isFinite(value) ? value : 0))
    "
  >
    <div
      class="yam3x-linear-progress__track"
      aria-hidden="true"
    >
      <div class="yam3x-linear-progress__buffer" />
      <div
        v-if="!wavyIndeterminate"
        class="yam3x-linear-progress__indicator"
      >
        <svg
          v-if="renderVariant === 'wavy' && wave.path"
          class="yam3x-linear-progress__wave"
          :width="wave.width"
          :height="wave.height"
          :viewBox="wave.viewBox"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path :d="wave.path" />
        </svg>
      </div>
      <div
        v-if="indeterminate && !wavyIndeterminate"
        class="yam3x-linear-progress__secondary"
      />
      <svg
        v-if="wavyIndeterminate"
        class="yam3x-linear-progress__indeterminate-graphic"
        :viewBox="`0 0 ${Math.max(trackWidth, 1)} ${waveMetrics.thickness + waveMetrics.amplitude * 2}`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref="indeterminateTrack"
          class="yam3x-linear-progress__indeterminate-track"
        />
        <path
          ref="firstWave"
          class="yam3x-linear-progress__indeterminate-wave"
        />
        <path
          ref="secondWave"
          class="yam3x-linear-progress__indeterminate-wave"
        />
      </svg>
      <span
        v-if="!indeterminate && fraction < 1 && stopSize > 0"
        class="yam3x-linear-progress__stop"
      />
    </div>
  </div>
</template>

<style scoped>
.yam3x-linear-progress {
  --_yam3x-progress-color-active: var(
    --yam3x-progress-indicator-color,
    var(--md-sys-color-primary)
  );
  --_yam3x-progress-color-track: var(
    --yam3x-progress-indicator-track-color,
    var(--md-sys-color-secondary-container)
  );
  --_yam3x-progress-motion-default-spatial: var(--md-sys-motion-spring-default-spatial);
  --_yam3x-linear-progress-thickness: var(--yam3x-linear-progress-indicator-thickness, 4px);
  --_yam3x-linear-progress-end-inset: var(--yam3x-linear-progress-indicator-end-inset, 4px);
  --_yam3x-linear-progress-shape: var(--yam3x-linear-progress-indicator-shape, 4px);
  --_yam3x-linear-progress-stop-size: var(--_yam3x-linear-progress-stop-size-prop);
  --_yam3x-linear-progress-wave-amplitude: var(
    --yam3x-linear-wavy-progress-indicator-amplitude,
    3px
  );
  --_yam3x-linear-progress-wave-wavelength: var(
    --yam3x-linear-wavy-progress-indicator-wavelength,
    40px
  );
  --_yam3x-linear-progress-indeterminate-wave-wavelength: var(
    --yam3x-linear-wavy-indeterminate-progress-indicator-wavelength,
    20px
  );
  display: block;
  width: 100%;
  height: var(--_yam3x-linear-progress-thickness);
  color: var(--_yam3x-progress-color-active);
}
.yam3x-linear-progress[hidden] {
  display: none;
}
.yam3x-linear-progress--wavy {
  height: calc(
    var(--_yam3x-linear-progress-thickness) + 2 * var(--_yam3x-linear-progress-wave-amplitude)
  );
}
.yam3x-linear-progress__track {
  position: absolute;
  inset-block: 0;
  inset-inline: var(--_yam3x-linear-progress-end-inset);
  overflow: hidden;
  border-radius: var(--_yam3x-linear-progress-shape);
  background: var(--_yam3x-progress-color-track);
}
.yam3x-linear-progress {
  position: relative;
}
.yam3x-linear-progress__indicator {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: var(--_yam3x-progress-value);
  overflow: hidden;
  border-radius: inherit;
  background: currentColor;
  transition: width var(--_yam3x-progress-motion-default-spatial);
}
.yam3x-linear-progress__buffer {
  display: none;
}
.yam3x-linear-progress--buffer .yam3x-linear-progress__buffer {
  display: block;
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: var(--_yam3x-progress-buffer);
  inset-inline-end: calc(var(--_yam3x-linear-progress-thickness) * 2);
  height: var(--_yam3x-linear-progress-thickness);
  background: radial-gradient(circle, var(--_yam3x-progress-color-track) 48%, transparent 52%) 0
    50% / calc(var(--_yam3x-linear-progress-thickness) * 2) 100% repeat-x;
  transform: translateY(-50%);
}
.yam3x-linear-progress__stop {
  position: absolute;
  z-index: 1;
  inset-block-start: 50%;
  inset-inline-end: 0;
  width: var(--_yam3x-linear-progress-stop-size);
  height: var(--_yam3x-linear-progress-stop-size);
  border-radius: 50%;
  background: currentColor;
  transform: translateY(-50%);
}
.yam3x-linear-progress--determinate .yam3x-linear-progress__track {
  background: transparent;
}
.yam3x-linear-progress--determinate .yam3x-linear-progress__track::before {
  content: '';
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(var(--_yam3x-progress-value) + var(--_yam3x-linear-progress-thickness));
  inset-inline-end: calc(var(--_yam3x-linear-progress-thickness) * 2);
  border-radius: inherit;
  background: var(--_yam3x-progress-color-track);
}
.yam3x-linear-progress--buffer .yam3x-linear-progress__track {
  background: transparent;
}
.yam3x-linear-progress--buffer .yam3x-linear-progress__track::before {
  content: '';
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(var(--_yam3x-progress-value) + var(--_yam3x-linear-progress-thickness));
  inset-inline-end: calc(100% - var(--_yam3x-progress-buffer));
  border-radius: inherit;
  background: var(--_yam3x-progress-color-track);
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__track {
  background: transparent;
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__track::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  inset-block-start: 50%;
  height: var(--_yam3x-linear-progress-thickness);
  background: var(--_yam3x-progress-color-track);
  transform: translateY(-50%);
}
.yam3x-linear-progress--wavy.yam3x-linear-progress--determinate
  .yam3x-linear-progress__track::before {
  inset-inline-start: calc(var(--_yam3x-progress-value) + var(--_yam3x-linear-progress-thickness));
  inset-inline-end: calc(var(--_yam3x-linear-progress-thickness) * 2);
}
.yam3x-linear-progress--wavy.yam3x-linear-progress--buffer .yam3x-linear-progress__track::before {
  inset-block: auto;
  inset-block-start: 50%;
  height: var(--_yam3x-linear-progress-thickness);
  inset-inline-start: calc(var(--_yam3x-progress-value) + var(--_yam3x-linear-progress-thickness));
  inset-inline-end: calc(100% - var(--_yam3x-progress-buffer));
  transform: translateY(-50%);
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__track {
  overflow: hidden;
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__indicator {
  overflow: hidden;
  background: transparent;
}
.yam3x-linear-progress__wave {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: calc(-1 * var(--_yam3x-linear-progress-wave-wavelength));
  max-width: none;
  overflow: visible;
}
.yam3x-linear-progress__wave path {
  fill: none;
  stroke: currentColor;
  stroke-width: var(--_yam3x-linear-progress-thickness);
  vector-effect: non-scaling-stroke;
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__indicator {
  z-index: 1;
}
.yam3x-linear-progress--wavy.yam3x-linear-progress--complete .yam3x-linear-progress__indicator {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 0;
  width: 100%;
  height: var(--_yam3x-linear-progress-thickness);
  border-radius: inherit;
  background: currentColor;
  transform: translateY(-50%);
}
.yam3x-linear-progress--wavy.yam3x-linear-progress--complete .yam3x-linear-progress__wave {
  display: none;
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__wave path {
  animation: yam3x-progress-wave-slide 1s linear infinite;
}
.yam3x-linear-progress__secondary {
  display: none;
}
.yam3x-linear-progress--indeterminate .yam3x-linear-progress__indicator,
.yam3x-linear-progress--query .yam3x-linear-progress__indicator {
  width: 8%;
  animation: yam3x-progress-linear 2.1s infinite linear;
}
.yam3x-linear-progress--indeterminate .yam3x-linear-progress__secondary,
.yam3x-linear-progress--query .yam3x-linear-progress__secondary {
  display: block;
  position: absolute;
  inset-block: 0;
  width: 8%;
  overflow: hidden;
  color: currentColor;
  animation: yam3x-progress-linear-secondary 2.1s infinite linear;
  animation-delay: 1.15s;
  animation-fill-mode: backwards;
}
.yam3x-linear-progress--flat.yam3x-linear-progress--indeterminate .yam3x-linear-progress__secondary,
.yam3x-linear-progress--flat.yam3x-linear-progress--query .yam3x-linear-progress__secondary {
  background: currentColor;
}
.yam3x-linear-progress--wavy.yam3x-linear-progress--indeterminate
  .yam3x-linear-progress__track::before,
.yam3x-linear-progress--wavy.yam3x-linear-progress--query .yam3x-linear-progress__track::before {
  display: none;
}
.yam3x-linear-progress__indeterminate-graphic {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.yam3x-linear-progress__indeterminate-graphic path {
  fill: none;
  stroke-width: var(--_yam3x-linear-progress-thickness);
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.yam3x-linear-progress__indeterminate-track {
  stroke: var(--_yam3x-progress-color-track);
}
.yam3x-linear-progress__indeterminate-wave {
  stroke: currentColor;
}
.yam3x-linear-progress--query:not(:dir(rtl)) .yam3x-linear-progress__track,
.yam3x-linear-progress--indeterminate:dir(rtl) .yam3x-linear-progress__track {
  transform: scaleX(-1);
}
.yam3x-linear-progress--wavy .yam3x-linear-progress__indicator {
  transition: width var(--_yam3x-progress-motion-default-spatial);
}
@keyframes yam3x-progress-linear-secondary {
  0% {
    inset-inline-start: -54.888%;
    width: 8%;
  }
  20% {
    inset-inline-start: -20%;
    width: 48%;
  }
  60% {
    inset-inline-start: 60%;
    width: 78%;
  }
  100% {
    inset-inline-start: 160%;
    width: 8%;
  }
}
@keyframes yam3x-progress-wave-slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-1 * var(--_yam3x-linear-progress-wave-wavelength)));
  }
}
@keyframes yam3x-progress-linear {
  0% {
    inset-inline-start: -145.167%;
    width: 8%;
  }
  20% {
    inset-inline-start: -113.333%;
    width: 48%;
  }
  60% {
    inset-inline-start: 56.333%;
    width: 78%;
  }
  100% {
    inset-inline-start: 100%;
    width: 8%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-linear-progress__indicator,
  .yam3x-linear-progress__wave path {
    transition: none;
    animation: none !important;
  }
  .yam3x-linear-progress--indeterminate .yam3x-linear-progress__indicator,
  .yam3x-linear-progress--query .yam3x-linear-progress__indicator {
    inset-inline-start: 31%;
    width: 38%;
  }
}
@media (forced-colors: active) {
  .yam3x-linear-progress__track {
    background: Canvas;
    outline: 1px solid GrayText;
  }
  .yam3x-linear-progress__indicator,
  .yam3x-linear-progress__stop {
    background: CanvasText;
  }
  .yam3x-linear-progress--wavy .yam3x-linear-progress__wave path,
  .yam3x-linear-progress__indeterminate-wave {
    stroke: CanvasText;
  }
  .yam3x-linear-progress__indeterminate-track {
    stroke: GrayText;
  }
}
</style>
