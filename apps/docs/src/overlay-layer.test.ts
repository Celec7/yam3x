import { describe, expect, it, vi } from 'vitest'
import { acquireOverlayLayer } from '../../../registry/components/_shared/overlay-layer'

describe('overlay layer stack', () => {
  it('orders popups above their dialog and a newer dialog above existing popups', () => {
    const closePopup = vi.fn()
    const dialogA = acquireOverlayLayer('dialog')
    const popup = acquireOverlayLayer('popup', closePopup)
    expect(popup.zIndex).toBeGreaterThan(dialogA.zIndex)

    const dialogB = acquireOverlayLayer('dialog')
    expect(closePopup).toHaveBeenCalledOnce()
    expect(dialogB.zIndex).toBeGreaterThan(popup.zIndex)

    const nestedPopup = acquireOverlayLayer('popup')
    expect(nestedPopup.zIndex).toBeGreaterThan(dialogB.zIndex)

    nestedPopup.release()
    dialogB.release()
    popup.release()
    dialogA.release()
  })
})
