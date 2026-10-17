import { expect, test } from '@playwright/test'
import { selectM3Option, setM3SliderValue } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/drawer-container')
})

test('overlay drawer traps focus, blocks background, and restores the menu trigger on Escape', async ({
  page,
}) => {
  // drawer-container.extension.modal-focus
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  const content = page.locator('.yam3x-drawer__content')
  const panel = page.locator('.yam3x-drawer__panel--start')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  const toggleBox = (await toggle.boundingBox())!
  const headingBox = (await page.locator('.drawer-demo__main h3').boundingBox())!
  expect(headingBox.y).toBeGreaterThanOrEqual(toggleBox.y + toggleBox.height)
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(toggle).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!)
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(panel).toBeVisible()
  await expect.poll(async () => (await panel.boundingBox())?.width ?? 0).toBeGreaterThan(300)
  await expect
    .poll(
      async () =>
        (await panel.boundingBox())!.x -
        (await page.locator('.drawer-demo__frame').boundingBox())!.x,
    )
    .toBeCloseTo(1, 0)
  const drawerHeadingIsTopmost = await panel
    .locator('.drawer-demo__nav strong')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const topmost = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
      return Boolean(
        topmost && document.querySelector('.yam3x-drawer__panel--start')?.contains(topmost),
      )
    })
  expect(drawerHeadingIsTopmost).toBe(true)
  await expect(panel.getByRole('navigation', { name: 'Main navigation', exact: true })).toHaveCount(
    1,
  )
  await expect(panel.getByRole('button', { name: 'Close navigation' })).toBeFocused()
  await expect(page.getByTestId('drawer-events')).toContainText('start:open:toggle')
  await expect(content).toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close panel' })).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(panel.getByRole('button', { name: 'Home' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(panel.getByRole('button', { name: 'Close navigation' })).toBeFocused()
  await panel.getByRole('button', { name: 'Open supporting pane' }).focus()
  await page.keyboard.press('Tab')
  await expect(panel.getByRole('button', { name: 'Close navigation' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(content).not.toHaveAttribute('inert', '')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
  await expect(page.getByTestId('drawer-events')).toContainText('start:closed:dismiss')

  await toggle.click()
  await panel.getByRole('button', { name: 'Inbox' }).click()
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.drawer-demo__main')).toContainText('Current page: Inbox')
  await expect(toggle).toBeFocused()
})

test('an empty modal drawer receives focus and keeps Tab inside its boundary', async ({ page }) => {
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  const panel = page.locator('.yam3x-drawer__panel--start')
  await panel.evaluate((element) =>
    element
      .querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex]')
      .forEach((item) => {
        item.setAttribute('tabindex', '-1')
        if (item instanceof HTMLButtonElement) item.disabled = true
      }),
  )
  await toggle.click()
  await expect(panel).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(panel).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
})

test('modal Tab trapping includes assigned slot and open shadow-root controls', async ({
  page,
}) => {
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  const panel = page.locator('.yam3x-drawer__panel--start')
  await toggle.click()
  await panel.evaluate((element) => {
    customElements.define(
      'focus-trap-test-host',
      class extends HTMLElement {
        constructor() {
          super()
          this.attachShadow({ mode: 'open' }).innerHTML =
            '<slot></slot><button id="shadow-last">Shadow action</button>'
        }
      },
    )
    const host = document.createElement('focus-trap-test-host')
    host.innerHTML = '<a id="assigned-link" href="#assigned">Assigned link</a>'
    element.append(host)
  })
  const first = panel.getByRole('button', { name: 'Close navigation' })
  const preceding = panel.getByRole('button', { name: 'Open supporting pane' })
  const host = panel.locator('focus-trap-test-host')
  const assigned = host.locator('#assigned-link')
  const shadowLast = host.locator('#shadow-last')

  await shadowLast.focus()
  await page.keyboard.press('Tab')
  await expect(first).toBeFocused()
  await assigned.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(preceding).toBeFocused()
})

test('modal scrim dismisses and a horizontal drag follows the pointer before closing', async ({
  page,
}) => {
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  await toggle.click()
  const scrim = page.locator('.yam3x-drawer__scrim')
  await expect(scrim).toHaveAccessibleName('Close panel')
  const frame = page.locator('.drawer-demo__frame')
  const frameSize = (await frame.boundingBox())!
  const pageScroll = await page.evaluate(() => window.scrollY)
  await page.mouse.move(frameSize.x + frameSize.width / 2, frameSize.y + frameSize.height / 2)
  await page.mouse.wheel(0, 400)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(pageScroll)
  await scrim.click({ position: { x: frameSize.width - 24, y: frameSize.height / 2 } })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByTestId('drawer-events')).toContainText('start:closed:dismiss')
  await expect(scrim).toHaveAttribute('aria-hidden', 'true')
  await expect(scrim).toHaveCSS('pointer-events', 'none')
  await expect
    .poll(() => scrim.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeLessThan(1)
  await expect(scrim).toHaveCSS('visibility', 'hidden')

  await toggle.click()
  const panel = page.locator('.yam3x-drawer__panel--start')
  await expect
    .poll(async () => (await panel.boundingBox())!.x - (await frame.boundingBox())!.x)
    .toBeCloseTo(1, 0)
  await page.evaluate(() =>
    window.addEventListener(
      'pointerdown',
      (event) => sessionStorage.setItem('drawer-pointer-id', String(event.pointerId)),
      { capture: true, once: true },
    ),
  )
  const initial = await panel.boundingBox()
  const startX = initial!.x + initial!.width - 36
  const startY = initial!.y + initial!.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX - 24, startY, { steps: 2 })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--dragging/)
  const pointerId = await page.evaluate(() => Number(sessionStorage.getItem('drawer-pointer-id')))
  await page.evaluate(
    (id) =>
      window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: id, bubbles: true })),
    pointerId,
  )
  await page.mouse.move(
    (await frame.boundingBox())!.x + (await frame.boundingBox())!.width + 12,
    startY,
  )
  await page.mouse.up()
  await expect(panel).not.toHaveClass(/yam3x-drawer__panel--dragging/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect
    .poll(async () => (await panel.boundingBox())!.x - (await frame.boundingBox())!.x)
    .toBeCloseTo(1, 0)

  const dragOrigin = await panel.boundingBox()
  const dragFromX = dragOrigin!.x + dragOrigin!.width - 36
  const dragY = dragOrigin!.y + dragOrigin!.height / 2
  await page.mouse.move(dragFromX, dragY)
  await page.mouse.down()
  await page.mouse.move(dragFromX - 48, dragY, { steps: 3 })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--dragging/)
  await expect.poll(async () => (await panel.boundingBox())!.x).toBeLessThan(dragOrigin!.x - 30)
  await page.mouse.move(dragFromX - 140, dragY, { steps: 4 })
  await page.mouse.up()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
})

test('desktop dragging tracks every 2px pointer step and pointer cancellation restores the open position', async ({
  page,
}) => {
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  await toggle.click()
  const panel = page.locator('.yam3x-drawer__panel--start')
  const positions = await panel.evaluate(async (element) => {
    const box = element.getBoundingClientRect()
    const x = box.x + box.width - 36
    const y = box.y + box.height / 2
    const pointer = (type: string, clientX: number) =>
      new PointerEvent(type, {
        bubbles: true,
        pointerId: 91,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        clientX,
        clientY: y,
      })
    element.dispatchEvent(pointer('pointerdown', x))
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const samples: number[] = []
    for (let step = 1; step <= 14; step++) {
      window.dispatchEvent(pointer('pointermove', x - step * 2))
      await frame()
      await frame()
      samples.push(element.getBoundingClientRect().x)
    }
    window.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 91 }))
    await frame()
    return samples
  })
  for (let index = 5; index < positions.length; index++) {
    expect(positions[index - 1]! - positions[index]!).toBeCloseTo(2, 0)
  }
  await expect(panel).not.toHaveClass(/yam3x-drawer__panel--dragging/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect
    .poll(async () => (await panel.boundingBox())!.x)
    .toBeCloseTo((await page.locator('.drawer-demo__frame').boundingBox())!.x + 1, 0)
})

test('two modal edges cannot obscure each other and focus moves into the active drawer', async ({
  page,
}) => {
  const startToggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  const startPanel = page.locator('.yam3x-drawer__panel--start')
  const endPanel = page.locator('.yam3x-drawer__panel--end')
  await startToggle.click()
  await expect(startPanel.getByRole('button', { name: 'Open supporting pane' })).toBeVisible()
  await startPanel.getByRole('button', { name: 'Open supporting pane' }).click()
  await expect(startPanel).toHaveAttribute('aria-hidden', 'true')
  await expect(endPanel).toHaveAttribute('aria-hidden', 'false')
  const closeButton = endPanel.getByRole('button', { name: 'Close supporting pane' })
  await expect(closeButton).toBeFocused()
  await expect.poll(async () => (await endPanel.boundingBox())!.width).toBeGreaterThan(200)
  await endPanel.getByRole('button', { name: 'Close supporting pane' }).click()
  await expect(endPanel).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.yam3x-drawer__toggles button[aria-controls$="-end"]')).toBeFocused()
})

test('push mode shifts the main pane but leaves it interactive without a scrim', async ({
  page,
}) => {
  await selectM3Option(page, page.getByLabel('Drawer mode'), 'push')
  const content = page.locator('.yam3x-drawer__content')
  const before = await content.boundingBox()
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  await toggle.click()
  const panel = page.locator('.yam3x-drawer__panel--start')
  await expect.poll(async () => (await content.boundingBox())!.x).toBeGreaterThan(before!.x + 200)
  await expect
    .poll(async () =>
      Math.abs(
        (await content.boundingBox())!.x -
          ((await panel.boundingBox())!.x + (await panel.boundingBox())!.width),
      ),
    )
    .toBeLessThan(1)
  await expect(content).not.toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close panel' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Inbox' }).click()
  await expect(page.locator('.drawer-demo__main')).toContainText('Current page: Inbox')
})

test('the end panel independently supports push and persistent side modes', async ({ page }) => {
  await selectM3Option(page, page.getByLabel('Supporting pane mode'), 'push')
  const panel = page.locator('.yam3x-drawer__panel--end')
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-end"]')
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await toggle.click()
  await expect(panel).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('.yam3x-drawer__content')).not.toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close panel' })).toHaveCount(0)

  await selectM3Option(page, page.getByLabel('Supporting pane mode'), 'side')
  await expect(panel).toHaveClass(/yam3x-drawer__panel--side/)
  await expect(panel).toHaveAttribute('aria-hidden', 'false')
  await expect(toggle).toHaveCount(0)
})

test('auto mode follows compact, medium, and expanded widths without losing open state, then mirrors in RTL', async ({
  page,
}) => {
  // drawer-container.extension.adaptive
  await page.setViewportSize({ width: 1920, height: 1080 })
  const frame = page.locator('.drawer-demo__frame')
  await frame.evaluate((element) => {
    Object.assign((element as HTMLElement).style, { inlineSize: '960px', maxInlineSize: 'none' })
  })
  await selectM3Option(page, page.getByLabel('Drawer mode'), 'auto')
  const panel = page.locator('.yam3x-drawer__panel--start')
  await expect(panel).toHaveClass(/yam3x-drawer__panel--side/)
  await expect(panel).toBeVisible()
  await expect(page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')).toHaveCount(
    0,
  )

  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '601px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--overlay/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '602px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '839px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '842px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--side/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '760px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  await toggle.click()
  const content = page.locator('.yam3x-drawer__content')
  await expect(panel).toHaveAttribute('aria-hidden', 'false')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(content).not.toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close panel' })).toHaveCount(0)

  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '560px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--overlay/)
  await expect(content).toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close panel' })).toBeVisible()

  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '760px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await expect(content).not.toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Close panel' })).toHaveCount(0)
  await expect(panel.getByRole('button', { name: 'Close navigation' })).toBeFocused()

  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '960px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--side/)
  await expect(panel.getByRole('button', { name: 'Close navigation' })).toBeFocused()
  await expect(page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')).toHaveCount(
    0,
  )

  await frame.evaluate((element) => {
    Object.assign((element as HTMLElement).style, { inlineSize: '760px', maxInlineSize: 'none' })
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '560px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--overlay/)
  await expect(panel).toHaveAttribute('aria-hidden', 'false')
  await expect(panel.getByRole('button', { name: 'Close navigation' })).toBeFocused()
  await frame.evaluate((element) => {
    ;(element as HTMLElement).setAttribute('dir', 'rtl')
  })
  const frameBox = (await frame.boundingBox())!
  await expect
    .poll(async () => {
      const panelBox = (await panel.boundingBox())!
      return frameBox.x + frameBox.width - 1 - (panelBox.x + panelBox.width)
    })
    .toBeCloseTo(0, 0)
  await expect(page.locator('.drawer-demo__main')).toContainText('Current page: Home')
  const rtlStart = await panel.boundingBox()
  const rtlDragX = rtlStart!.x + 36
  const rtlDragY = rtlStart!.y + rtlStart!.height / 2
  await page.mouse.move(rtlDragX, rtlDragY)
  await page.mouse.down()
  await page.mouse.move(rtlDragX + 48, rtlDragY, { steps: 3 })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--dragging/)
  await expect.poll(async () => (await panel.boundingBox())!.x).toBeGreaterThan(rtlStart!.x + 30)
  await page.mouse.move(rtlDragX + 140, rtlDragY, { steps: 4 })
  await page.mouse.up()
  await expect(panel).toHaveAttribute('aria-hidden', 'true')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')

  await setM3SliderValue(page.getByRole('slider', { name: 'Compact breakpoint' }), 500)
  await setM3SliderValue(page.getByRole('slider', { name: 'Expanded breakpoint' }), 900)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '560px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--push/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '500px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--overlay/)
  await frame.evaluate((element) => {
    ;(element as HTMLElement).style.inlineSize = '902px'
  })
  await expect(panel).toHaveClass(/yam3x-drawer__panel--side/)
})

test('maps in-flow and overlay panels to the Side sheet System surface roles', async ({ page }) => {
  const root = page.locator('.yam3x-drawer')
  const expected = await root.evaluate((element) => {
    const probe = document.createElement('span')
    const properties = {
      surface: '--md-sys-color-surface',
      modal: '--md-sys-color-surface-container-low',
      divider: '--md-sys-color-outline-variant',
    }
    const values = Object.fromEntries(
      Object.entries(properties).map(([key, token]) => {
        probe.style.backgroundColor = `var(${token})`
        element.append(probe)
        const value = getComputedStyle(probe).backgroundColor
        probe.remove()
        return [key, value]
      }),
    )
    return values
  })
  const panel = page.locator('.yam3x-drawer__panel--start')

  await selectM3Option(page, page.getByLabel('Drawer mode'), 'side')
  await expect(panel).toHaveCSS('background-color', expected.surface)
  await expect(panel).toHaveCSS('border-inline-end-color', expected.divider)

  await selectM3Option(page, page.getByLabel('Drawer mode'), 'overlay')
  await page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]').click()
  await expect(panel).toHaveCSS('background-color', expected.modal)
})

test('documented drawer style hooks affect the rendered panel, scrim, and divider', async ({
  page,
}) => {
  const root = page.locator('.yam3x-drawer')
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  const panel = page.locator('.yam3x-drawer__panel--start')
  await toggle.click()
  await expect(panel).toBeVisible()
  await root.evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--yam3x-drawer-container-color', 'rgb(1, 2, 3)')
    style.setProperty('--yam3x-drawer-container-elevation', '0 2px 4px rgb(1 2 3 / .4)')
    style.setProperty('--yam3x-drawer-container-width', '400px')
    style.setProperty('--yam3x-drawer-container-scrim-opacity', '70%')
    style.setProperty('--yam3x-modal-drawer-end-shape', '12px')
    style.setProperty('--yam3x-modal-drawer-start-shape', '20px')
    style.setProperty('--yam3x-modal-drawer-container-color', 'rgb(4, 5, 6)')
    style.setProperty('--yam3x-modal-drawer-elevation', '0 8px 12px rgb(4 5 6 / .5)')
    style.setProperty('--yam3x-drawer-divider-color', 'rgb(7, 8, 9)')
    style.setProperty('--yam3x-drawer-divider-thickness', '2px')
    style.setProperty('--md-sys-color-on-surface-variant', 'rgb(10, 11, 12)')
  })
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeCloseTo(360, 0)
  await root.evaluate((element) =>
    (element as HTMLElement).style.setProperty('--yam3x-drawer-container-max-width', '500px'),
  )
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeCloseTo(400, 0)
  await expect(panel).toHaveCSS('border-start-end-radius', '12px')
  await expect(panel).toHaveCSS('background-color', 'rgb(4, 5, 6)')
  await expect(panel).toHaveCSS('box-shadow', 'rgba(4, 5, 6, 0.5) 0px 8px 12px 0px')
  await expect(panel.getByRole('button', { name: 'Saved' })).toHaveCSS('color', 'rgb(10, 11, 12)')
  const scrim = page.getByRole('button', { name: 'Close panel' })
  await expect
    .poll(() => scrim.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toContain('0.7')

  const scrimBox = (await scrim.boundingBox())!
  await scrim.click({ position: { x: scrimBox.width - 8, y: 8 } })
  await page.locator('.yam3x-drawer__toggles button[aria-controls$="-end"]').click()
  const endPanel = page.locator('.yam3x-drawer__panel--end')
  await expect(endPanel).toHaveCSS('border-start-start-radius', '20px')
  await page.getByRole('button', { name: 'Close panel' }).click({ position: { x: 8, y: 8 } })

  await selectM3Option(page, page.getByLabel('Drawer mode'), 'side')
  await expect(panel).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(panel).toHaveCSS('box-shadow', 'rgba(1, 2, 3, 0.4) 0px 2px 4px 0px')
  await expect(panel).toHaveCSS('border-inline-end-width', '2px')
  await expect(panel).toHaveCSS('border-inline-end-color', 'rgb(7, 8, 9)')
})

test('reduced motion and forced colors retain a visible panel and focus boundary', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  const toggle = page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]')
  await toggle.focus()
  await page.keyboard.press('Enter')
  const panel = page.locator('.yam3x-drawer__panel--start')
  await expect
    .poll(() =>
      panel.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)),
    )
    .toBeLessThan(0.001)
  await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  const item = panel.getByRole('button', { name: 'Close navigation' })
  await expect(item).toBeFocused()
  await expect(item).toHaveCSS('outline-style', 'solid')
  await expect(item).toHaveCSS('outline-width', '3px')
})

test('drawer and main content scroll independently and overlays fit a narrow desktop pane', async ({
  page,
}) => {
  await selectM3Option(page, page.getByLabel('Drawer mode'), 'side')
  const panel = page.locator('.yam3x-drawer__panel--start')
  const content = page.locator('.yam3x-drawer__content-body')
  await page.evaluate(() => {
    const nav = document.querySelector('.drawer-demo__nav')!
    const main = document.querySelector('.drawer-demo__main')!
    for (let index = 0; index < 20; index++) {
      const item = document.createElement('button')
      item.textContent = `Destination ${index}`
      nav.append(item)
      const paragraph = document.createElement('p')
      paragraph.textContent = `Scrollable content ${index} `.repeat(8)
      main.append(paragraph)
    }
  })
  await panel.evaluate((element) => {
    element.scrollTop = 220
  })
  await content.evaluate((element) => {
    element.scrollTop = 300
  })
  await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(200)
  const panelScroll = await panel.evaluate((element) => element.scrollTop)
  await content.evaluate((element) => {
    element.scrollTop = 500
  })
  await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBe(panelScroll)

  await selectM3Option(page, page.getByLabel('Drawer mode'), 'overlay')
  await setM3SliderValue(page.getByRole('slider', { name: 'Container width' }), 320)
  await page.locator('.yam3x-drawer__toggles button[aria-controls$="-start"]').click()
  const frame = page.locator('.drawer-demo__frame')
  const frameBox = (await frame.boundingBox())!
  await expect
    .poll(async () => (await panel.boundingBox())!.width)
    .toBeLessThanOrEqual(frameBox.width)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )

  await setM3SliderValue(page.getByRole('slider', { name: 'Container width' }), 400)
  await selectM3Option(page, page.getByLabel('Drawer mode'), 'side')
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeLessThanOrEqual(80)
  await expect
    .poll(async () => (await page.locator('.yam3x-drawer__content').boundingBox())!.width)
    .toBeGreaterThanOrEqual(319)
})
