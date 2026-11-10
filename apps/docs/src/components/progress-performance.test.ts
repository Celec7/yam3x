import { afterEach, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import CircularProgressIndicator from '../../../../registry/components/progress-indicator/circular-progress-indicator.vue'
import LinearProgressIndicator from '../../../../registry/components/progress-indicator/linear-progress-indicator.vue'

enableAutoUnmount(afterEach)
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('animates circular progress without remeasuring geometry on every frame', async () => {
  const frames = new Map<number, FrameRequestCallback>()
  let id = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  const geometryReads = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const width = this.className.includes('amplitude')
        ? 1.6
        : this.className.includes('wavelength')
          ? 15
          : this.className.includes('diameter')
            ? 48
            : 4
      return DOMRect.fromRect({ width })
    })
  const wrapper = mount(CircularProgressIndicator, { props: { variant: 'wavy', value: 50 } })
  await flushPromises()
  geometryReads.mockClear()
  const before = wrapper.get('.yam3x-circular-progress__indicator').attributes('d')
  for (let index = 1; index <= 5; index++) {
    for (const [id, callback] of [...frames]) {
      frames.delete(id)
      callback(index * 16)
    }
    await flushPromises()
  }
  expect(wrapper.get('.yam3x-circular-progress__indicator').attributes('d')).not.toBe(before)
  expect(geometryReads).not.toHaveBeenCalled()
  wrapper.unmount()
  expect(frames.size).toBe(0)
})

it('does not start animation after an immediate unmount', async () => {
  const schedule = vi.fn(() => 1)
  vi.stubGlobal('requestAnimationFrame', schedule)
  const wrapper = mount(CircularProgressIndicator, { props: { variant: 'wavy', value: 50 } })
  wrapper.unmount()
  await flushPromises()
  expect(schedule).not.toHaveBeenCalled()
})

function linearGeometryFixture() {
  const observed = new Set<Element>()
  let notify: ResizeObserverCallback | undefined
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback
      }
      observe(element: Element) {
        observed.add(element)
      }
      disconnect() {
        observed.clear()
      }
    },
  )
  const widths = {
    track: 200,
    thickness: 4,
    amplitude: 3,
    wavelength: 40,
    'indeterminate-wavelength': 20,
  }
  const geometryReads = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const key = Object.keys(widths).find((key) =>
        this.classList.contains(
          key === 'track' ? 'yam3x-linear-progress__track' : `yam3x-linear-progress__${key}-probe`,
        ),
      ) as keyof typeof widths | undefined
      return DOMRect.fromRect({ width: key ? widths[key] : 0 })
    })
  return {
    observed,
    widths,
    geometryReads,
    resize(element: Element) {
      expect(observed.has(element)).toBe(true)
      notify?.([{ target: element } as ResizeObserverEntry], {} as ResizeObserver)
    },
  }
}

it('updates linear values without allocating probes or reading geometry', async () => {
  const { geometryReads } = linearGeometryFixture()
  const wrapper = mount(LinearProgressIndicator, {
    props: { variant: 'wavy', mode: 'buffer', value: 10, bufferValue: 20 },
  })
  await flushPromises()
  const before = wrapper.get('.yam3x-linear-progress__wave').attributes('width')
  const createElement = vi.spyOn(document, 'createElement')
  geometryReads.mockClear()
  for (const value of [25, 50, 75, 100]) {
    await wrapper.setProps({ value, bufferValue: value + 10, stopSize: value / 10 })
    await flushPromises()
  }
  expect(wrapper.attributes('aria-valuenow')).toBe('100')
  expect(wrapper.element.style.getPropertyValue('--_yam3x-progress-buffer')).toBe('100%')
  expect(wrapper.get('.yam3x-linear-progress__wave').attributes('width')).not.toBe(before)
  expect(createElement.mock.calls.filter(([tag]) => tag === 'span')).toHaveLength(0)
  expect(geometryReads).not.toHaveBeenCalled()
})

it('updates linear wave geometry when measured tokens and the track resize', async () => {
  const fixture = linearGeometryFixture()
  const wrapper = mount(LinearProgressIndicator, { props: { variant: 'wavy', value: 50 } })
  await flushPromises()
  const wave = () => wrapper.get('.yam3x-linear-progress__wave')
  expect(wave().attributes('viewBox')).toBe('0 0 220 10')

  fixture.widths.amplitude = 6
  fixture.widths.thickness = 8
  fixture.widths.wavelength = 30
  wrapper.element.classList.add('custom-geometry')
  wrapper.element.style.setProperty('--yam3x-linear-progress-indicator-thickness', '8px')
  wrapper.element.style.setProperty('--yam3x-linear-wavy-progress-indicator-amplitude', '6px')
  wrapper.element.style.setProperty('--yam3x-linear-wavy-progress-indicator-wavelength', '30px')
  fixture.resize(wrapper.get('.yam3x-linear-progress__amplitude-probe').element)
  await flushPromises()
  expect(wave().attributes('viewBox')).toBe('0 0 190 20')

  fixture.widths.track = 300
  fixture.resize(wrapper.get('.yam3x-linear-progress__track').element)
  await flushPromises()
  expect(wave().attributes('viewBox')).toBe('0 0 240 20')
  wrapper.unmount()
  expect(fixture.observed.size).toBe(0)
})

it('cancels linear animation and pending setup on unmount', async () => {
  const fixture = linearGeometryFixture()
  const frames = new Map<number, FrameRequestCallback>()
  let id = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  const wrapper = mount(LinearProgressIndicator, {
    props: { variant: 'wavy', mode: 'indeterminate' },
  })
  await flushPromises()
  expect(frames.size).toBe(1)
  wrapper.unmount()
  await flushPromises()
  expect(frames.size).toBe(0)
  expect(fixture.observed.size).toBe(0)

  const immediate = mount(LinearProgressIndicator, {
    props: { variant: 'wavy', mode: 'indeterminate' },
  })
  immediate.unmount()
  await flushPromises()
  expect(frames.size).toBe(0)
  expect(fixture.observed.size).toBe(0)
})
