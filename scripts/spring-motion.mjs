// Spring sampling for CSS transitions.
//
// CSS cannot express a spring directly. Sample the analytic motion of a
// damped harmonic oscillator and emit a `linear()` timing function whose
// duration is the point where the spring stays within the settle tolerance.
// Model and damping/stiffness values follow Compose's spring simulation.

const DEFAULT_MASS = 1
const DEFAULT_TOLERANCE = 0.002
const DEFAULT_SAMPLES = 49
const SCAN_STEP = 0.0002

/**
 * Analytic progress of an underdamped spring from 0 to 1.
 *
 * @param {number} time seconds
 * @param {{ damping: number, stiffness: number, mass?: number }} spring
 */
export function springProgress(time, spring) {
  const mass = spring.mass ?? DEFAULT_MASS
  const dampingRatio = spring.damping
  const naturalFrequency = Math.sqrt(spring.stiffness / mass)
  if (dampingRatio >= 1) {
    return 1 - Math.exp(-naturalFrequency * time)
  }
  const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatio * dampingRatio)
  const decay = Math.exp(-dampingRatio * naturalFrequency * time)
  return (
    1 -
    decay *
      (Math.cos(dampedFrequency * time) +
        ((dampingRatio * naturalFrequency) / dampedFrequency) * Math.sin(dampedFrequency * time))
  )
}

/**
 * Last sampled time whose distance from the target exceeds the tolerance.
 * The returned duration ends after the overshoot has decayed enough that a
 * CSS transition can snap to the final value without a visible jump.
 *
 * @param {{ damping: number, stiffness: number, mass?: number }} spring
 * @param {number} tolerance fraction of the animated distance
 */
export function springSettleDuration(spring, tolerance = DEFAULT_TOLERANCE) {
  let duration = 0
  for (let time = 0; time <= 2; time += SCAN_STEP) {
    if (Math.abs(springProgress(time, spring) - 1) > tolerance) duration = time
  }
  return duration
}

/**
 * Piecewise-linear approximation of the spring progress.
 * The last value is clamped to 1 so the transition lands exactly on the target.
 */
export function sampleSpringCurve(spring, duration, samples = DEFAULT_SAMPLES) {
  const points = []
  for (let index = 0; index < samples; index += 1) {
    const progress = index / (samples - 1)
    const value = index === samples - 1 ? 1 : springProgress(progress * duration, spring)
    points.push({ progress, value })
  }
  return points
}

function formatPercent(progress) {
  return `${Number((progress * 100).toFixed(3))}%`
}

function formatValue(value) {
  return Number(value.toFixed(4))
}

/** CSS `linear()` easing for the sampled spring. */
export function springLinearEasing(points) {
  const values = points.map((point, index) => {
    const value = formatValue(point.value)
    return index === 0 ? `${value}` : `${value} ${formatPercent(point.progress)}`
  })
  return `linear(${values.join(', ')})`
}

/** Largest deviation between the sampled easing and the analytic spring. */
export function springLinearError(spring, points, duration, steps = 5000) {
  let max = 0
  let at = 0
  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps
    const time = progress * duration
    let sample = points[points.length - 1].value
    for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
      const previous = points[pointIndex - 1]
      const next = points[pointIndex]
      if (progress <= next.progress) {
        const span = next.progress - previous.progress
        const fraction = span === 0 ? 0 : (progress - previous.progress) / span
        sample = previous.value + (next.value - previous.value) * fraction
        break
      }
    }
    const error = Math.abs(sample - springProgress(time, spring))
    if (error > max) {
      max = error
      at = time
    }
  }
  return { max, at }
}

/**
 * Composite CSS motion values for a shape morph driven by `spring`.
 *
 * @param {{ damping: number, stiffness: number, mass?: number }} spring
 * @param {{ tolerance?: number, samples?: number }} [options]
 */
export function shapeMorphMotion(spring, options = {}) {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE
  const samples = options.samples ?? DEFAULT_SAMPLES
  const duration = springSettleDuration(spring, tolerance)
  const points = sampleSpringCurve(spring, duration, samples)
  const easing = springLinearEasing(points)
  const error = springLinearError(spring, points, duration)
  return {
    durationMilliseconds: Math.round(duration * 1000),
    duration: `${Math.round(duration * 1000)}ms`,
    easing,
    maxError: error.max,
    maxErrorAtMilliseconds: Math.round(error.at * 1000),
    samples,
    tolerance,
  }
}
