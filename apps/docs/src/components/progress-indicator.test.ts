import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CircularProgressIndicator from '../../../../registry/components/progress-indicator/circular-progress-indicator.vue'
import LinearProgressIndicator from '../../../../registry/components/progress-indicator/linear-progress-indicator.vue'
import {
  circularArcPath,
  circularWaveArcPath,
  circularWavePath,
  circularWavySweep,
  linearWavePath,
  linearWaveSegmentPath,
  linearWavyIndeterminateFrame,
  progressFraction,
  progressMaximum,
} from '../../../../registry/components/progress-indicator/progress-utils'

describe('progress indicator value helpers', () => {
  it('uses a positive finite maximum and clamps non-finite or out-of-range values', () => {
    expect(progressMaximum(0)).toBe(100)
    expect(progressMaximum(Number.NaN)).toBe(100)
    expect(progressFraction(-4, 10)).toBe(0)
    expect(progressFraction(15, 10)).toBe(1)
    expect(progressFraction(Number.POSITIVE_INFINITY, 10)).toBe(0)
  })

  it('builds a closed waveform path within the circular drawing area', () => {
    const path = circularWavePath(48, 4, 1.6, 15)
    expect(path).toMatch(/^M /)
    expect(path).toContain(' L ')
    expect(path.split(' L ').length).toBeGreaterThan(50)
  })

  it('keeps the full linear wave and its stroke inside the viewport', () => {
    const wave = linearWavePath(40, 4, 3, 40)
    expect(wave.height).toBe(10)
    expect(wave.viewBox).toBe('0 0 40 10')
    expect(wave.path).toContain('C ')
    expect(wave.path).toContain(' 8 ')
    expect(linearWavePath(40, 4, 3, 40, Math.PI / 2).path).toMatch(/^M 0 8 /)
  })

  it('anchors separated wave segments to the same global track and motion phase', () => {
    const first = linearWaveSegmentPath(0, 24, 4, 3, 24, Math.PI / 3)
    const next = linearWaveSegmentPath(24, 48, 4, 3, 24, Math.PI / 3)
    expect(Number(first.split(' ').at(-1))).toBeCloseTo(Number(next.split(' ')[2]), 5)
    const cycleStart = linearWavyIndeterminateFrame(0)
    const firstOnly = linearWavyIndeterminateFrame(500)
    const both = linearWavyIndeterminateFrame(1100)
    const secondOnly = linearWavyIndeterminateFrame(1500)
    expect(cycleStart.first).toEqual([0, 0])
    expect(firstOnly.first[1]).toBeGreaterThan(firstOnly.first[0])
    expect(firstOnly.second).toEqual([0, 0])
    expect(both.first[1]).toBeGreaterThan(both.first[0])
    expect(both.second[1]).toBeGreaterThan(both.second[0])
    expect(secondOnly.first).toEqual([1, 1])
    expect(secondOnly.second[1]).toBeGreaterThan(secondOnly.second[0])
    expect(linearWavyIndeterminateFrame(1750).first).toEqual(cycleStart.first)
    expect(linearWavyIndeterminateFrame(1750).second).toEqual(cycleStart.second)
    expect(
      linearWavyIndeterminateFrame(250).phase - linearWavyIndeterminateFrame(0).phase,
    ).toBeCloseTo(-Math.PI / 2)
    expect(linearWavyIndeterminateFrame(1250).phase).toBeCloseTo(
      linearWavyIndeterminateFrame(250).phase,
    )
  })

  it('splits flat circular progress into a gapped active arc and the remaining track', () => {
    const active = circularArcPath(40, 4, 0, 180, 4)
    const track = circularArcPath(40, 4, 180, 360, 4)
    expect(active).toMatch(/^M /)
    expect(track).toMatch(/^M /)
    expect(circularArcPath(40, 4, 0, 0)).toBe('')
  })

  it('builds a bounded circular wave segment and advances the indeterminate sweep over its full cycle', () => {
    const wave = circularWaveArcPath(48, 4, 1.6, 15, 0, 120)
    expect(wave).toMatch(/^M /)
    expect(wave.split(' L ').length).toBeGreaterThan(50)
    const min = circularWavySweep(0, 8)
    const mid = circularWavySweep(2.3625, 8)
    const max = circularWavySweep(3.15, 8)
    const end = circularWavySweep(6.3, 8)
    expect(min).toBe(26)
    expect(mid).toBeGreaterThan(140)
    expect(max).toBe(272)
    expect(end).toBe(min)
  })

  it('uses the Android Compose default circular amplitude thresholds', () => {
    const atTenPercent = mount(CircularProgressIndicator, { props: { value: 10, variant: 'wavy' } })
    const atHalf = mount(CircularProgressIndicator, { props: { value: 50, variant: 'wavy' } })
    const atNinetyFive = mount(CircularProgressIndicator, { props: { value: 95, variant: 'wavy' } })
    expect(atTenPercent.find('.yam3x-circular-progress__indicator').attributes('d')).toContain(
      ' A ',
    )
    expect(atHalf.find('.yam3x-circular-progress__indicator').attributes('d')).toContain(' L ')
    expect(atNinetyFive.find('.yam3x-circular-progress__indicator').attributes('d')).toContain(
      ' A ',
    )
  })
})

describe('progress indicator semantics', () => {
  it('exposes determinate linear progress and omits its value while indeterminate', async () => {
    const wrapper = mount(LinearProgressIndicator, {
      props: { value: 40, max: 80, mode: 'determinate' },
      attrs: { 'aria-label': 'Upload' },
    })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('80')
    expect(wrapper.attributes('aria-valuenow')).toBe('40')
    expect(wrapper.attributes('aria-label')).toBe('Upload')
    await wrapper.setProps({ mode: 'indeterminate' })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.classes()).toContain('yam3x-linear-progress--indeterminate')
  })

  it('clamps circular values, supports custom maxima and hides slot content from the accessibility tree', () => {
    const wrapper = mount(CircularProgressIndicator, {
      props: { value: 140, max: 120 },
      slots: { default: '42%' },
    })
    expect(wrapper.attributes('aria-valuemax')).toBe('120')
    expect(wrapper.attributes('aria-valuenow')).toBe('120')
    expect(wrapper.find('path.yam3x-circular-progress__indicator').attributes('d')).toMatch(/^M /)
    expect(wrapper.find('.yam3x-circular-progress__content').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.yam3x-circular-progress__content').attributes('inert')).toBeDefined()
  })

  it('renders the circular wavy active segment separately from its flat remainder track', () => {
    const wrapper = mount(CircularProgressIndicator, { props: { value: 50, variant: 'wavy' } })
    const track = wrapper.find('path.yam3x-circular-progress__track')
    const active = wrapper.find('path.yam3x-circular-progress__indicator--wave')
    expect(track.exists()).toBe(true)
    expect(track.attributes('d')).toMatch(/^M /)
    expect(active.attributes('d')).toMatch(/^M /)
    expect(track.attributes('d')).not.toBe(active.attributes('d'))
  })
})
