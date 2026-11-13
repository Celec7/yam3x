import { afterEach, describe, expect, it, vi } from 'vitest'
import { acquirePageScrollLock } from '../../../../registry/components/_shared/page-scroll-lock'

describe('page scroll lock', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('compensates the removed scrollbar width once and restores it', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024)
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1009,
    })
    const original = document.body.style.paddingRight

    const release = acquirePageScrollLock()
    expect(document.body.style.paddingRight).toBe('15px')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.documentElement.style.overflow).toBe('hidden')

    release()
    expect(document.body.style.paddingRight).toBe(original)
    expect(document.body.style.overflow).toBe('')
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('keeps the compensation while another lock is active', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024)
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1009,
    })
    const original = document.body.style.paddingRight

    const releaseFirst = acquirePageScrollLock()
    const releaseSecond = acquirePageScrollLock()
    expect(document.body.style.paddingRight).toBe('15px')

    releaseFirst()
    expect(document.body.style.paddingRight).toBe('15px')
    expect(document.body.style.overflow).toBe('hidden')

    releaseSecond()
    expect(document.body.style.paddingRight).toBe(original)
    expect(document.body.style.overflow).toBe('')
  })
})
