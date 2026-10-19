import { afterEach, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import CircularProgressIndicator from '../../../../registry/components/progress-indicator/circular-progress-indicator.vue'

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
