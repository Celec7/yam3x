export type SliderModel = number
export type RangeSliderModel = [number, number]
export type SliderValueModel = SliderModel | RangeSliderModel
export type SliderVariant = 'standard' | 'centered'
export type InternalSliderVariant = SliderVariant | 'range'
export type SliderSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

export interface SliderCommonProps {
  locale?: string
  orientation?: 'horizontal' | 'vertical'
  size?: SliderSize
  min?: number
  max?: number
  step?: number
  stops?: boolean
  labelled?: boolean
  disabled?: boolean
  name?: string
  form?: string
  label?: string
  formatValue?: (value: number) => string
}

export interface SliderProps extends SliderCommonProps {
  variant?: SliderVariant
  center?: number
}

export interface RangeSliderProps extends SliderCommonProps {
  lowerLabel?: string
  upperLabel?: string
}

export function sliderBounds(minimum: number, maximum: number): [number, number] {
  const min = Number.isFinite(minimum) ? minimum : 0
  const max = Number.isFinite(maximum) && maximum > min ? maximum : min + 100
  return [min, max]
}

export function sliderStep(step: number): number {
  return Number.isFinite(step) && step > 0 ? step : 1
}

export function sliderValue(value: number, min: number, max: number, step: number): number {
  const bounded = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
  if (bounded === max) return max
  const snapped = min + Math.round((bounded - min) / step) * step
  return Math.min(max, Math.max(min, Number(snapped.toFixed(10))))
}

export function sliderValues(
  model: SliderValueModel,
  variant: InternalSliderVariant,
  min: number,
  max: number,
  step: number,
): [number, number] {
  if (variant !== 'range') {
    const raw = Array.isArray(model) ? model[0] : model
    return [sliderValue(raw, min, max, step), max]
  }
  const raw = Array.isArray(model) ? model : [min, max]
  const lower = sliderValue(raw[0], min, max, step)
  const upper = sliderValue(raw[1], min, max, step)
  return lower <= upper ? [lower, upper] : [upper, lower]
}

export function sliderFraction(value: number, min: number, max: number): number {
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}
