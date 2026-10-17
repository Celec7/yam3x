import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function revealModalSheetDemo(page: Page) {
  await page.addStyleTag({
    content: '.bottom-sheet-demo__mobile-modal { display: block !important; }',
  })
}

test('standard sheet coexists with the page and cycles between named heights', async ({ page }) => {
  // bottom-sheet.variant.standard
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/components/bottom-sheet')

  const trigger = page.getByRole('button', { name: 'Open standard sheet' })
  const sheet = page.locator('.yam3x-bottom-sheet--standard')
  await expect(sheet).toHaveAttribute('aria-label', 'Supporting panel')
  await expect(trigger).toHaveAttribute('aria-controls', (await sheet.getAttribute('id')) ?? '')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(sheet).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  await sheet.evaluate((element) =>
    element.style.setProperty('--yam3x-bottom-sheet-width', '400px'),
  )
  await expect.poll(async () => (await sheet.boundingBox())!.width).toBeCloseTo(400, 0)
  await sheet.evaluate((element) =>
    element.style.setProperty('--yam3x-bottom-sheet-max-width', '300px', 'important'),
  )
  await expect.poll(async () => (await sheet.boundingBox())!.width).toBeCloseTo(300, 0)
  await sheet.evaluate((element) => element.style.removeProperty('--yam3x-bottom-sheet-max-width'))
  await expect.poll(async () => (await sheet.boundingBox())!.width).toBeCloseTo(400, 0)
  await sheet.evaluate((element) => element.style.removeProperty('--yam3x-bottom-sheet-width'))
  await expect.poll(async () => (await sheet.boundingBox())!.width).toBeCloseTo(640, 0)

  const content = sheet.locator('.yam3x-bottom-sheet__body')
  const fitBeforeContentChange = (await sheet.boundingBox())!.height
  await content.evaluate((element) => {
    const paragraph = document.createElement('p')
    paragraph.textContent = ' Content wraps naturally. '.repeat(20)
    element.append(paragraph)
  })
  await expect
    .poll(async () => (await sheet.boundingBox())!.height)
    .toBeGreaterThan(fitBeforeContentChange)
  await expect
    .poll(async () => {
      const rendered = (await sheet.boundingBox())!.height
      const target = await sheet.evaluate((element) =>
        Number.parseFloat(element.style.getPropertyValue('--_yam3x-bottom-sheet-height')),
      )
      return Math.abs(rendered - target)
    })
    .toBeLessThan(1)

  const handle = sheet.getByRole('button', { name: 'Resize sheet' })
  await handle.focus()
  const tapTarget = (await handle.boundingBox())!
  await page.mouse.move(tapTarget.x + tapTarget.width / 2, tapTarget.y + tapTarget.height / 2)
  await page.mouse.down()
  await page.mouse.move(tapTarget.x + tapTarget.width / 2, tapTarget.y + tapTarget.height / 2 + 4, {
    steps: 2,
  })
  await page.mouse.up()
  await expect(sheet).toContainText('Current detent: partially-expanded')
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeLessThanOrEqual(450)
  await handle.press('Space')
  await expect(sheet).toContainText('Current detent: expanded')
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeGreaterThan(700)
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeCloseTo(844, 0)
  const fullHeight = (await sheet.boundingBox())!.height
  const handleBounds = (await handle.boundingBox())!
  await page.mouse.move(
    handleBounds.x + handleBounds.width / 2,
    handleBounds.y + handleBounds.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    handleBounds.x + handleBounds.width / 2,
    handleBounds.y + handleBounds.height / 2 + 400,
    { steps: 5 },
  )
  await page.mouse.up()
  await expect(sheet).toHaveAttribute('data-detent', 'partially-expanded')
  await handle.focus()
  await handle.press('ArrowUp')
  await expect(sheet).toHaveAttribute('data-detent', 'expanded')
  await expect(sheet.getByRole('button', { name: 'Collapse' })).toBeVisible()
  await sheet.getByRole('button', { name: 'Collapse' }).click()
  await expect(sheet).toContainText('Current detent: fit')
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeLessThan(fullHeight)
  const close = sheet.getByRole('button', { name: 'Close sheet' })
  await expect(close).toBeVisible()
  await close.click()
  await expect(sheet).toHaveAttribute('data-open', 'false')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await expect(content).toHaveCSS('overflow-y', 'auto')
})

test('fit sheet height follows a desktop pointer without the content observer resetting it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/bottom-sheet')
  await page.getByRole('button', { name: 'Open standard sheet' }).click()

  const sheet = page.locator('.yam3x-bottom-sheet--standard')
  const handle = sheet.getByRole('button', { name: 'Resize sheet' })
  await expect(sheet).toHaveAttribute('data-detent', 'fit')
  await expect
    .poll(async () =>
      sheet.evaluate((element) =>
        Math.abs(
          element.getBoundingClientRect().height -
            Number.parseFloat(element.style.getPropertyValue('--_yam3x-bottom-sheet-height')),
        ),
      ),
    )
    .toBeLessThan(1)
  await expect
    .poll(async () => {
      const box = (await sheet.boundingBox())!
      return 900 - box.y - box.height
    })
    .toBeCloseTo(0, 0)
  const initial = (await sheet.boundingBox())!
  let handleBounds = (await handle.boundingBox())!
  const x = handleBounds.x + handleBounds.width / 2
  let y = handleBounds.y + handleBounds.height / 2
  const nextFrames = () =>
    page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )

  await page.evaluate(() =>
    window.addEventListener(
      'pointerdown',
      (event) => sessionStorage.setItem('bottom-sheet-pointer-id', String(event.pointerId)),
      { capture: true, once: true },
    ),
  )
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y - 20, { steps: 2 })
  await expect(sheet).toHaveAttribute('data-dragging', 'true')
  const pointerId = await page.evaluate(() =>
    Number(sessionStorage.getItem('bottom-sheet-pointer-id')),
  )
  await page.evaluate(
    (id) =>
      window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: id, bubbles: true })),
    pointerId,
  )
  await expect(sheet).toHaveAttribute('data-dragging', 'false')
  await expect(sheet).toHaveAttribute('data-detent', 'fit')
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeCloseTo(initial.height, 0)
  await page.mouse.move(x + 80, y + 80)
  await page.mouse.up()

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + 80, { steps: 4 })
  await expect(sheet).toHaveAttribute('data-dragging', 'true')
  await nextFrames()
  await expect
    .poll(async () => (await sheet.boundingBox())!.height)
    .toBeCloseTo(initial.height - 80, 0)
  await page.mouse.up()
  await expect(sheet).toHaveAttribute('data-detent', 'fit')
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeCloseTo(initial.height, 0)

  handleBounds = (await handle.boundingBox())!
  y = handleBounds.y + handleBounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y - 80, { steps: 4 })
  await expect(sheet).toHaveAttribute('data-dragging', 'true')
  await nextFrames()
  await expect
    .poll(async () => (await sheet.boundingBox())!.height)
    .toBeCloseTo(initial.height + 80, 0)
  await page.waitForTimeout(140)
  await page.mouse.up()
  await expect(sheet).toHaveAttribute('data-detent', 'partially-expanded')
})

test('fit sheet follows small continuous desktop pointer movements frame by frame', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/bottom-sheet')
  await page.getByRole('button', { name: 'Open standard sheet' }).click()

  const sheet = page.locator('.yam3x-bottom-sheet--standard')
  const handle = sheet.getByRole('button', { name: 'Resize sheet' })
  await expect(sheet).toHaveAttribute('data-detent', 'fit')
  const heights = await handle.evaluate(async (element) => {
    const row = element.closest('.yam3x-bottom-sheet__handle-row')!
    const box = row.getBoundingClientRect()
    const startY = box.y + box.height / 2
    const pointer = (type: string, y: number) =>
      new PointerEvent(type, {
        bubbles: true,
        pointerId: 91,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        clientY: y,
      })
    row.dispatchEvent(pointer('pointerdown', startY))
    const samples: number[] = []
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    for (let step = 1; step <= 16; step++) {
      window.dispatchEvent(pointer('pointermove', startY + step * 2))
      await frame()
      await frame()
      samples.push(row.closest('.yam3x-bottom-sheet')!.getBoundingClientRect().height)
    }
    window.dispatchEvent(pointer('pointerup', startY + 32))
    return samples
  })

  expect(heights.slice(5).length).toBeGreaterThan(8)
  for (let index = 6; index < heights.length; index++) {
    // Once the 8px activation threshold is crossed, each 2px pointer step
    // should move the sheet by that same amount instead of accumulating lag.
    expect(heights[index - 1]! - heights[index]!).toBeCloseTo(2, 0)
  }
  await expect(sheet).toHaveAttribute('data-dragging', 'false')
})

test('modal sheet opens partially expanded, traps focus, and restores focus after a dismissing action', async ({
  page,
}) => {
  // bottom-sheet.modal.focus
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/bottom-sheet')

  const trigger = page.getByRole('button', { name: 'Open modal sheet' })
  const initialBodyOverflow = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).overflow)
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  await expect(dialog).toHaveAttribute('data-detent', 'partially-expanded')
  await expect.poll(async () => (await dialog.boundingBox())!.height).toBeLessThanOrEqual(422)
  await expect(page.locator('.yam3x-bottom-sheet__scrim')).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await expect(page.getByRole('log')).toContainText('Events: opening → opened')
  const handle = dialog.getByRole('button', { name: 'Resize sheet' })
  await expect(handle).toBeVisible()
  const lastTabStop = dialog.getByRole('button', { name: 'Done' })
  await lastTabStop.focus()
  await expect(lastTabStop).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(handle).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(lastTabStop).toBeFocused()
  await handle.press('Space')
  await expect(dialog).toHaveAttribute('data-detent', 'expanded')
  await expect(dialog.getByRole('button', { name: 'Close sheet' })).toBeVisible()

  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('data-detent', 'expanded')
  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect
    .poll(async () =>
      page.locator('body').evaluate((element) => getComputedStyle(element).overflow),
    )
    .toBe(initialBodyOverflow)
})

test('modal handle resizes with desktop mouse drag and keeps the sheet centered within wide-window margins', async ({
  page,
}) => {
  // bottom-sheet.geometry.wide
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/bottom-sheet')
  await revealModalSheetDemo(page)

  const trigger = page.getByRole('button', { name: 'Open modal sheet' })
  await trigger.click()
  await page.setViewportSize({ width: 1280, height: 900 })
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  const handle = dialog.getByRole('button', { name: 'Resize sheet' })
  await expect(dialog).toHaveAttribute('data-detent', 'partially-expanded')
  await expect(handle).toHaveCSS('cursor', 'grab')
  const half = (await dialog.boundingBox())!
  expect(half.height).toBeCloseTo(450, 0)
  expect(half.x).toBeGreaterThanOrEqual(56)
  expect(half.x + half.width).toBeLessThanOrEqual(1280 - 56)

  const handleBox = (await handle.boundingBox())!
  const x = handleBox.x + handleBox.width / 2
  const y = handleBox.y + handleBox.height / 2
  await page.mouse.move(x, y)
  await expect(dialog.locator('.yam3x-bottom-sheet__handle-row')).toHaveCSS('cursor', 'grab')
  await page.mouse.down()
  await page.mouse.move(x, y - 280, { steps: 8 })
  await expect(dialog).toHaveAttribute('data-dragging', 'true')
  await expect(dialog).toHaveCSS('transition-duration', '0s')
  await expect.poll(async () => (await dialog.boundingBox())!.height).toBeCloseTo(730, 0)
  await page.mouse.move(x, y - 150, { steps: 4 })
  await expect.poll(async () => (await dialog.boundingBox())!.height).toBeCloseTo(600, 0)
  await page.mouse.move(x, y - 280, { steps: 4 })
  await expect.poll(async () => (await dialog.boundingBox())!.height).toBeCloseTo(730, 0)
  await page.mouse.up()
  await expect(dialog).toHaveAttribute('data-detent', 'expanded')
  await expect(dialog.getByRole('button', { name: 'Close sheet' })).toBeVisible()
  await expect.poll(async () => (await dialog.boundingBox())!.y).toBeCloseTo(56, 0)

  const full = (await dialog.boundingBox())!
  expect(full.width).toBeLessThanOrEqual(640)
  expect(full.x).toBeGreaterThanOrEqual(56)
  expect(full.x + full.width).toBeLessThanOrEqual(1280 - 56)

  await page.setViewportSize({ width: 641, height: 800 })
  await expect.poll(async () => (await dialog.boundingBox())!.y).toBeCloseTo(56, 0)
  const justWide = (await dialog.boundingBox())!
  expect(justWide.width).toBeCloseTo(529, 0)
  expect(justWide.x).toBeCloseTo(56, 0)

  await page.setViewportSize({ width: 640, height: 800 })
  await expect.poll(async () => (await dialog.boundingBox())!.y).toBeCloseTo(72, 0)
  const compact = (await dialog.boundingBox())!
  expect(compact.width).toBeCloseTo(640, 0)
  expect(compact.x).toBeCloseTo(0, 0)
})

test('a hidden handle still has a single-pointer resize control', async ({ page }) => {
  // bottom-sheet.a11y.resize
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/bottom-sheet')

  await page.getByRole('checkbox', { name: 'Show drag handle' }).uncheck()
  await page.getByRole('button', { name: 'Open standard sheet' }).click()
  const sheet = page.locator('.yam3x-bottom-sheet--standard')
  await expect(sheet.locator('.yam3x-bottom-sheet__handle')).toHaveCount(0)
  const resize = sheet.getByRole('button', { name: 'Resize sheet' })
  await expect(resize).toBeVisible()
  await expect(resize).toHaveCSS('min-width', '48px')
  await resize.click()
  await expect(sheet).toHaveAttribute('data-detent', 'partially-expanded')
})

test('documented bottom-sheet CSS overrides map through Component aliases', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/bottom-sheet')
  await revealModalSheetDemo(page)
  await page.getByRole('button', { name: 'Open standard sheet' }).click()
  const sheet = page.locator('.yam3x-bottom-sheet--standard')
  const handle = sheet.getByRole('button', { name: 'Resize sheet' })
  const body = sheet.locator('.yam3x-bottom-sheet__body')
  const title = sheet.locator('.yam3x-bottom-sheet__title')
  const row = sheet.locator('.yam3x-bottom-sheet__handle-row')
  const graphic = sheet.locator('.yam3x-bottom-sheet__handle')
  const token = (name: string, value: string) =>
    sheet.evaluate((element, args) => element.style.setProperty(args.name, args.value), {
      name,
      value,
    })
  const clearToken = (name: string) =>
    sheet.evaluate((element, key) => element.style.removeProperty(key), name)

  await token('--yam3x-bottom-sheet-container-color', 'rgb(1, 2, 3)')
  await token('--yam3x-bottom-sheet-color', 'rgb(4, 5, 6)')
  await token('--yam3x-bottom-sheet-elevation', '0px 0px 0px 9px rgb(7, 8, 9)')
  await token('--yam3x-bottom-sheet-z-index', '73')
  await token('--yam3x-bottom-sheet-container-shape', '12px')
  await token('--yam3x-bottom-sheet-padding-block', '37px')
  await token('--yam3x-bottom-sheet-padding-inline', '33px')
  await token('--yam3x-bottom-sheet-content-font-size', '23px')
  await token('--yam3x-bottom-sheet-content-font-weight', '600')
  await token('--yam3x-bottom-sheet-content-line-height', '31px')
  await token('--yam3x-bottom-sheet-content-tracking', '1.25px')
  await token('--yam3x-bottom-sheet-header-font-size', '29px')
  await token('--yam3x-bottom-sheet-header-font-weight', '700')
  await token('--yam3x-bottom-sheet-header-line-height', '36px')
  await token('--yam3x-bottom-sheet-header-tracking', '1.5px')
  await token('--yam3x-bottom-sheet-drag-handle-container-height', '30px')
  await token('--yam3x-bottom-sheet-handle-width', '44px')
  await token('--yam3x-bottom-sheet-handle-height', '6px')
  await token('--yam3x-bottom-sheet-handle-shape', '3px')
  await token('--yam3x-bottom-sheet-handle-color', 'rgb(10, 11, 12)')
  await token('--yam3x-bottom-sheet-handle-focus-ring-offset', '8px')

  const mapped = await sheet.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      container: style.getPropertyValue('--_yam3x-bottom-sheet-container-color').trim(),
      color: style.getPropertyValue('--_yam3x-bottom-sheet-color').trim(),
      shape: style.getPropertyValue('--_yam3x-bottom-sheet-container-shape').trim(),
    }
  })
  expect(mapped).toEqual({ container: 'rgb(1, 2, 3)', color: 'rgb(4, 5, 6)', shape: '12px' })

  await expect(sheet).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(sheet).toHaveCSS('color', 'rgb(4, 5, 6)')
  await expect(sheet).toHaveCSS('box-shadow', 'rgb(7, 8, 9) 0px 0px 0px 9px')
  await expect(sheet).toHaveCSS('z-index', '73')
  await expect(sheet).toHaveCSS('border-top-left-radius', '12px')
  await expect(body).toHaveCSS('padding-bottom', '37px')
  await expect(body).toHaveCSS('padding-left', '33px')
  await expect(body).toHaveCSS('font-size', '23px')
  await expect(body).toHaveCSS('font-weight', '600')
  await expect(body).toHaveCSS('line-height', '31px')
  await expect(body).toHaveCSS('letter-spacing', '1.25px')
  await expect(title).toHaveCSS('font-size', '29px')
  await expect(title).toHaveCSS('font-weight', '700')
  await expect(title).toHaveCSS('line-height', '36px')
  await expect(title).toHaveCSS('letter-spacing', '1.5px')
  await expect(row).toHaveCSS('flex-basis', '30px')
  await clearToken('--yam3x-bottom-sheet-drag-handle-container-height')
  await expect(row).toHaveCSS('flex-basis', '48px')
  await expect(graphic).toHaveCSS('width', '44px')
  await expect(graphic).toHaveCSS('height', '6px')
  await expect(graphic).toHaveCSS('border-radius', '3px')
  await expect(graphic).toHaveCSS('background-color', 'rgb(10, 11, 12)')
  await handle.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(handle).toHaveCSS('outline-offset', '8px')

  await token('--yam3x-bottom-sheet-expanded-container-shape', '19px')
  await token('--yam3x-bottom-sheet-expanded-elevation', '0px 0px 0px 11px rgb(13, 14, 15)')
  await handle.click()
  await handle.click()
  await expect(sheet).toHaveAttribute('data-detent', 'expanded')
  await expect(sheet).toHaveCSS('border-top-left-radius', '19px')
  await expect(sheet).toHaveCSS('box-shadow', 'rgb(13, 14, 15) 0px 0px 0px 11px')
  await sheet.getByRole('button', { name: 'Collapse' }).click()
  await sheet.getByRole('button', { name: 'Close sheet' }).click()
  await token('--yam3x-bottom-sheet-minimized-container-shape', '7px')
  await expect(sheet).toHaveCSS('border-top-left-radius', '7px')

  const modalTrigger = page.getByRole('button', { name: 'Open modal sheet' })
  await modalTrigger.click()
  const modal = page.getByRole('dialog', { name: 'Sharing settings' })
  const modalToken = (name: string, value: string) =>
    modal.evaluate((element, args) => element.style.setProperty(args.name, args.value), {
      name,
      value,
    })
  await modalToken('--yam3x-bottom-sheet-peek-height', '121px')
  await modal.getByRole('button', { name: 'Resize sheet' }).press('ArrowDown')
  await expect(modal).toHaveAttribute('data-detent', 'collapsed')
  await expect.poll(async () => (await modal.boundingBox())!.height).toBeCloseTo(121, 0)
  await modalToken('--yam3x-bottom-sheet-modal-elevation', '0px 0px 0px 12px rgb(16, 17, 18)')
  await expect(modal).toHaveCSS('box-shadow', 'rgb(16, 17, 18) 0px 0px 0px 12px')
  await modalToken('--yam3x-bottom-sheet-top-space', '100px')
  await expect(modal).toHaveCSS('max-block-size', '800px')
  const scrim = page.locator('.yam3x-bottom-sheet__scrim')
  const initialScrimColor = await scrim.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  await scrim.evaluate((element) =>
    element.style.setProperty('--yam3x-bottom-sheet-scrim-color', 'rgb(20, 30, 40)'),
  )
  await expect
    .poll(async () => scrim.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(initialScrimColor)
  const scrimColor = await scrim.evaluate((element) => getComputedStyle(element).backgroundColor)
  await scrim.evaluate((element) =>
    element.style.setProperty('--yam3x-bottom-sheet-scrim-opacity', '60%'),
  )
  await expect
    .poll(async () => scrim.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(scrimColor)

  await page.setViewportSize({ width: 390, height: 844 })
  await modalToken('--yam3x-bottom-sheet-compact-top-space', '90px')
  await expect(modal).toHaveCSS('max-block-size', '754px')
})

test('bottom-sheet colors and accessibility styling honor theme and system preferences', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/bottom-sheet')
  await page.getByRole('button', { name: 'Open modal sheet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  const handle = dialog.getByRole('button', { name: 'Resize sheet' })
  const scrim = page.locator('.yam3x-bottom-sheet__scrim')
  await expect
    .poll(async () =>
      Number.parseFloat(
        await dialog.evaluate((element) => getComputedStyle(element).transitionDuration),
      ),
    )
    .toBeLessThan(0.001)
  await expect
    .poll(async () =>
      Number.parseFloat(
        await scrim.evaluate((element) => getComputedStyle(element).transitionDuration),
      ),
    )
    .toBeLessThan(0.001)

  const surfaceRole = await dialog.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--md-sys-color-surface-container-low').trim(),
  )
  const normalizedSurface = await page.evaluate((value) => {
    const probe = document.createElement('div')
    probe.style.backgroundColor = value
    document.body.append(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color
  }, surfaceRole)
  await expect(dialog).toHaveCSS('background-color', normalizedSurface)
  await dialog.evaluate((element) =>
    element.style.setProperty('--md-sys-color-surface-container-low', 'rgb(22, 33, 44)'),
  )
  await expect(dialog).toHaveCSS('background-color', 'rgb(22, 33, 44)')

  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' })
  await expect
    .poll(() => page.evaluate(() => matchMedia('(forced-colors: active)').matches))
    .toBe(true)
  await expect(dialog).toHaveCSS('border-top-width', '1px')
  await expect(dialog).toHaveCSS('box-shadow', 'none')
  const systemText = await dialog.evaluate((element) => getComputedStyle(element).color)
  await expect(dialog.locator('.yam3x-bottom-sheet__handle')).toHaveCSS(
    'background-color',
    systemText,
  )
  await handle.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(handle).toBeFocused()
  await expect(handle).toHaveCSS('outline-style', 'solid')
  await expect(handle).toHaveCSS('outline-width', '3px')
})

test('bottom sheet follows RTL layout, theme tokens, and enlarged content without clipping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/bottom-sheet')
  await revealModalSheetDemo(page)
  await page.getByRole('button', { name: 'Open modal sheet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  const handle = dialog.getByRole('button', { name: 'Resize sheet' })
  const body = dialog.locator('.yam3x-bottom-sheet__body')

  const light = await dialog.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    color: getComputedStyle(element).color,
    handle: getComputedStyle(element.querySelector('.yam3x-bottom-sheet__handle')!).backgroundColor,
  }))
  const contrast = (first: string, second: string) => {
    const luminance = (value: string) => {
      const [red, green, blue] = value
        .match(/\d+/g)!
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const normalized = channel / 255
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
    return (lighter + 0.05) / (darker + 0.05)
  }
  expect(contrast(light.color, light.background)).toBeGreaterThanOrEqual(4.5)
  expect(contrast(light.handle, light.background)).toBeGreaterThanOrEqual(3)
  await page.locator('html').evaluate((element) => {
    element.style.setProperty('--md-sys-color-surface-container-low', 'rgb(20, 18, 24)')
    element.style.setProperty('--md-sys-color-on-surface', 'rgb(255, 255, 255)')
    element.style.setProperty('--md-sys-color-on-surface-variant', 'rgb(205, 200, 210)')
  })
  const dark = await dialog.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    color: getComputedStyle(element).color,
    handle: getComputedStyle(element.querySelector('.yam3x-bottom-sheet__handle')!).backgroundColor,
  }))
  expect(dark.background).not.toBe(light.background)
  expect(dark.color).not.toBe(light.color)
  expect(dark.handle).not.toBe(light.handle)
  expect(contrast(dark.color, dark.background)).toBeGreaterThanOrEqual(4.5)
  expect(contrast(dark.handle, dark.background)).toBeGreaterThanOrEqual(3)

  await page.locator('html').evaluate((element) => {
    element.style.removeProperty('--md-sys-color-surface-container-low')
    element.style.removeProperty('--md-sys-color-on-surface')
    element.style.removeProperty('--md-sys-color-on-surface-variant')
  })
  await dialog.evaluate((element) => element.setAttribute('dir', 'rtl'))
  await handle.press('ArrowUp')
  await expect(dialog).toHaveAttribute('data-detent', 'expanded')
  const title = dialog.locator('.yam3x-bottom-sheet__title')
  const close = dialog.getByRole('button', { name: 'Close sheet' })
  const titleBounds = (await title.boundingBox())!
  const closeBounds = (await close.boundingBox())!
  expect(titleBounds.x).toBeGreaterThan(closeBounds.x)
  expect((await dialog.boundingBox())!.x).toBeGreaterThanOrEqual(320)

  await body.evaluate((element) => {
    element.style.setProperty('--yam3x-bottom-sheet-content-font-size', '32px')
    element.style.setProperty('--yam3x-bottom-sheet-content-line-height', '48px')
    const paragraph = document.createElement('p')
    paragraph.textContent = 'Zoomed text should remain readable. '.repeat(100)
    element.append(paragraph)
  })
  await expect
    .poll(async () => body.evaluate((element) => element.scrollHeight > element.clientHeight))
    .toBe(true)
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible()
  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
})

test('modal cancel event can prevent closing and scrim dismissal closes when permitted', async ({
  page,
}) => {
  await page.setViewportSize({ width: 599, height: 844 })
  await page.goto('/components/bottom-sheet')
  const trigger = page.getByRole('button', { name: 'Open modal sheet' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  await expect(dialog).toBeVisible()
  const allowClose = dialog.getByRole('checkbox', { name: 'Allow closing the modal sheet' })
  await allowClose.uncheck()
  await dialog.press('Escape')
  await expect(dialog).toBeVisible()
  await allowClose.check()
  await page.locator('.yam3x-bottom-sheet__scrim').click({ position: { x: 10, y: 10 } })
  await expect(dialog).toBeHidden()
})

test('modal sheet drag can dismiss to hidden and a canceled swipe settles back to its detent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/bottom-sheet')
  const trigger = page.getByRole('button', { name: 'Open modal sheet' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  const handle = dialog.getByRole('button', { name: 'Resize sheet' })
  await expect(dialog).toHaveAttribute('data-detent', 'partially-expanded')
  await expect
    .poll(async () => {
      const box = (await dialog.boundingBox())!
      return 844 - box.y - box.height
    })
    .toBeCloseTo(0, 0)

  const initialHeight = (await dialog.boundingBox())!.height
  const allowClose = dialog.getByRole('checkbox', { name: 'Allow closing the modal sheet' })
  await allowClose.uncheck()

  const swipeToHidden = async () => {
    const bounds = (await handle.boundingBox())!
    const x = bounds.x + bounds.width / 2
    const y = bounds.y + bounds.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + 380, { steps: 16 })
    await expect(dialog).toHaveAttribute('data-dragging', 'true')
    await page.mouse.up()
  }

  await swipeToHidden()
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('data-detent', 'partially-expanded')
  await expect.poll(async () => (await dialog.boundingBox())!.height).toBeCloseTo(initialHeight, 0)

  await allowClose.check()
  await swipeToHidden()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('a fast downward flick advances from the collapsed modal anchor to hidden', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/bottom-sheet')
  await page.getByRole('button', { name: 'Open modal sheet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Sharing settings' })
  const handle = dialog.getByRole('button', { name: 'Resize sheet' })
  await expect(dialog).toHaveAttribute('data-detent', 'partially-expanded')
  await handle.press('ArrowDown')
  await expect(dialog).toHaveAttribute('data-detent', 'collapsed')
  await expect.poll(async () => (await dialog.boundingBox())!.height).toBeCloseTo(96, 0)

  const bounds = (await handle.boundingBox())!
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y + 20, { steps: 1 })
  await page.mouse.up()
  await expect(dialog).toBeHidden()
})
