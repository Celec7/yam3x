export type ProgressVariant = 'flat' | 'wavy'
export type LinearProgressMode = 'determinate' | 'indeterminate' | 'buffer' | 'query'

export interface WaveGeometry {
  path: string
  height: number
  viewBox: string
  width: number
}

export function progressMaximum(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 100
}

export function progressFraction(value: number, max: number): number {
  const normalizedMax = progressMaximum(max)
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value / normalizedMax)) : 0
}

export function circularWavePath(
  size: number,
  thickness: number,
  amplitude: number,
  wavelength: number,
): string {
  const center = size / 2
  const radius = Math.max(0, center - thickness / 2 - amplitude)
  const waveCount = Math.max(1, Math.round((2 * Math.PI * radius) / Math.max(wavelength, 2)))
  const steps = Math.max(64, waveCount * 16)
  const points = Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const angle = progress * Math.PI * 2
    const wave = Math.sin(progress * waveCount * 2 * Math.PI)
    const r = radius + amplitude * wave
    const x = center + r * Math.sin(angle)
    const y = center - r * Math.cos(angle)
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  })
  return points.join(' ')
}

export function linearWavePath(
  width: number,
  thickness: number,
  amplitude: number,
  wavelength: number,
  phase = 0,
): WaveGeometry {
  if (
    ![width, thickness, amplitude, wavelength].every(Number.isFinite) ||
    width <= 0 ||
    thickness <= 0 ||
    amplitude <= 0 ||
    wavelength <= 0
  ) {
    return {
      path: '',
      height: Math.max(0, thickness + amplitude * 2),
      viewBox: '0 0 0 0',
      width: 0,
    }
  }
  return {
    path: linearWaveSegmentPath(0, width, thickness, amplitude, wavelength, phase),
    height: thickness + amplitude * 2,
    viewBox: `0 0 ${width} ${thickness + amplitude * 2}`,
    width,
  }
}

export function linearWaveSegmentPath(
  start: number,
  end: number,
  thickness: number,
  amplitude: number,
  wavelength: number,
  phase = 0,
): string {
  if (
    ![start, end, thickness, amplitude, wavelength, phase].every(Number.isFinite) ||
    end <= start ||
    thickness <= 0 ||
    amplitude <= 0 ||
    wavelength <= 0
  )
    return ''
  // The centerline moves by `amplitude`; the stroke needs another half-width
  // above and below it. Keep both inside the SVG viewport.
  const baseline = amplitude + thickness / 2
  const segments = Math.min(2048, Math.ceil((end - start) / (wavelength / 4)))
  const step = (end - start) / segments
  const commands = [
    `M ${start} ${baseline + amplitude * Math.sin((2 * Math.PI * start) / wavelength + phase)}`,
  ]
  // Cubic segments follow the sine's value and tangent at each quarter-wave.
  // A quadratic through the crest only reaches half the requested amplitude.
  for (let index = 0; index < segments; index++) {
    const x = start + index * step
    const endX = start + (index + 1) * step
    const segment = step
    const angle = (2 * Math.PI * x) / wavelength + phase
    const endAngle = (2 * Math.PI * endX) / wavelength + phase
    const slope = (2 * Math.PI * amplitude) / wavelength
    const startY = baseline + amplitude * Math.sin(angle)
    const endY = baseline + amplitude * Math.sin(endAngle)
    commands.push(
      `C ${x + segment / 3} ${startY + (slope * Math.cos(angle) * segment) / 3} ${endX - segment / 3} ${endY - (slope * Math.cos(endAngle) * segment) / 3} ${endX} ${endY}`,
    )
  }
  return commands.join(' ')
}

function emphasizedAccelerate(progress: number): number {
  const target = Math.min(1, Math.max(0, progress))
  if (target === 0 || target === 1) return target
  let low = 0
  let high = 1
  for (let index = 0; index < 20; index++) {
    const t = (low + high) / 2
    const x = 3 * 0.3 * (1 - t) ** 2 * t + 3 * 0.8 * (1 - t) * t ** 2 + t ** 3
    if (x < target) low = t
    else high = t
  }
  const t = (low + high) / 2
  return 3 * 0.15 * (1 - t) * t ** 2 + t ** 3
}

export function linearWavyIndeterminateFrame(elapsedMs: number): {
  first: [number, number]
  second: [number, number]
  phase: number
} {
  const cycle = 1750
  const elapsed = Number.isFinite(elapsedMs) ? elapsedMs : 0
  const time = ((elapsed % cycle) + cycle) % cycle
  const waveTime = ((elapsed % 1000) + 1000) % 1000
  const position = (delay: number, duration: number) =>
    emphasizedAccelerate((time - delay) / duration)
  return {
    first: [position(250, 1000), position(0, 1000)],
    second: [position(900, 850), position(650, 850)],
    phase: (-2 * Math.PI * waveTime) / 1000,
  }
}

export function circularArcPath(
  size: number,
  thickness: number,
  startAngle: number,
  endAngle: number,
  gap = 0,
  radialInset = 0,
): string {
  const radius = Math.max(0, size / 2 - thickness / 2 - radialInset)
  if (radius <= 0 || endAngle <= startAngle) return ''
  const gapDegrees = (gap / (2 * Math.PI * radius)) * 360
  const start = startAngle + gapDegrees
  const end = endAngle - gapDegrees
  if (end <= start) return ''
  const point = (angle: number) => {
    const radians = ((angle - 90) * Math.PI) / 180
    return { x: size / 2 + radius * Math.cos(radians), y: size / 2 + radius * Math.sin(radians) }
  }
  if (end - start >= 359.999) {
    const a = point(start)
    const b = point(start + 180)
    return `M ${a.x} ${a.y} A ${radius} ${radius} 0 1 1 ${b.x} ${b.y} A ${radius} ${radius} 0 1 1 ${a.x} ${a.y}`
  }
  const a = point(start)
  const b = point(end)
  const largeArc = end - start > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${largeArc} 1 ${b.x} ${b.y}`
}

export function circularWaveArcPath(
  size: number,
  thickness: number,
  amplitude: number,
  wavelength: number,
  startAngle: number,
  endAngle: number,
  steps = 200,
  phaseOffset = 0,
): string {
  const radius = Math.max(0, size / 2 - thickness / 2 - amplitude)
  if (radius <= 0 || wavelength <= 0 || endAngle <= startAngle) return ''
  const waveCount = (2 * Math.PI * radius) / wavelength
  const phase = (Math.PI / 2) * (waveCount - 1)
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angleDegrees = startAngle + t * (endAngle - startAngle)
    const angle = ((angleDegrees - 90) * Math.PI) / 180
    const wave = Math.sin(angle * waveCount + phase + phaseOffset)
    const r = radius - amplitude * wave
    const x = size / 2 + r * Math.cos(angle)
    const y = size / 2 + r * Math.sin(angle)
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return points.join(' ')
}

export function circularWavySweep(elapsedSeconds: number, sweepPaddingDegrees: number): number {
  const minimum = 18 + sweepPaddingDegrees
  const maximum = 280 - sweepPaddingDegrees
  const phaseDuration = 1.575
  const phase =
    (((Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0) % (phaseDuration * 4)) +
      phaseDuration * 4) %
    (phaseDuration * 4)
  const smooth = (value: number) => value * value * (3 - 2 * value)
  if (phase < phaseDuration) return minimum
  if (phase < phaseDuration * 2)
    return minimum + (maximum - minimum) * smooth((phase - phaseDuration) / phaseDuration)
  if (phase < phaseDuration * 3) return maximum
  return maximum - (maximum - minimum) * smooth((phase - phaseDuration * 3) / phaseDuration)
}
