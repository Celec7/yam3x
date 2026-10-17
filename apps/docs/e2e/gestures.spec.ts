import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/guide/gestures')
})

test('long press reports start and end while preserving the native button', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Press and hold for 450 ms' })
  await expect(button).toBeVisible()
  await button.focus()
  await page.keyboard.press('Space')
  await expect(page.getByTestId('gesture-status')).toHaveText('Long press: Not triggered')
  await button.hover()
  await page.mouse.down()
  await expect(page.getByTestId('gesture-status')).toHaveText('Long press: start')
  await page.waitForTimeout(500)
  await expect(page.getByTestId('gesture-status')).toHaveText('Long press: end')
  await page.mouse.up()
  await button.focus()
  await expect(button).toBeFocused()
})

test('long press cancels when the pointer drifts before its duration', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Press and hold for 450 ms' })
  await button.scrollIntoViewIfNeeded()
  const bounds = await button.boundingBox()
  if (!bounds) throw new Error('Gesture demo button has no layout box')
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await expect(page.getByTestId('gesture-status')).toHaveText('Long press: start')
  await page.mouse.move(bounds.x + bounds.width + 40, bounds.y + bounds.height / 2, { steps: 2 })
  await expect(page.getByTestId('gesture-status')).toHaveText('Long press: cancel')
  await page.mouse.up()
})

test('pan streams movement details and swipe reports its resolved direction', async ({ page }) => {
  const panButton = page.getByRole('button', { name: 'Drag to pan' })
  await panButton.scrollIntoViewIfNeeded()
  const panBox = await panButton.boundingBox()
  if (!panBox) throw new Error('Pan demo button has no layout box')
  await page.mouse.move(panBox.x + 20, panBox.y + panBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(panBox.x + 50, panBox.y + panBox.height / 2, { steps: 2 })
  await expect(page.getByTestId('pan-status')).toContainText('update')
  await page.mouse.up()
  await expect(page.getByTestId('pan-status')).toContainText('end')

  const swipeButton = page.getByRole('button', { name: 'Swipe quickly' })
  await swipeButton.scrollIntoViewIfNeeded()
  const swipeBox = await swipeButton.boundingBox()
  if (!swipeBox) throw new Error('Swipe demo button has no layout box')
  await page.mouse.move(swipeBox.x + 15, swipeBox.y + swipeBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(swipeBox.x + swipeBox.width - 5, swipeBox.y + swipeBox.height / 2, {
    steps: 2,
  })
  await page.mouse.up()
  await expect(page.getByTestId('swipe-status')).toContainText('end · right')
})

test('two-pointer transform tracks scale and rotation until both pointers end', async ({
  page,
}) => {
  const target = page.getByTestId('transform-target')
  await target.scrollIntoViewIfNeeded()
  await target.evaluate((element) => {
    const send = (
      type: string,
      pointerId: number,
      clientX: number,
      clientY: number,
      timeStamp: number,
    ) => {
      const event = new PointerEvent(type, {
        pointerId,
        pointerType: 'touch',
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX,
        clientY,
        bubbles: true,
      })
      Object.defineProperty(event, 'timeStamp', { value: timeStamp })
      element.dispatchEvent(event)
    }
    send('pointerdown', 81, 10, 10, 100)
    send('pointerdown', 82, 30, 10, 110)
    send('pointermove', 82, 40, 10, 120)
    send('pointermove', 82, 48, 20, 130)
    send('pointerup', 81, 10, 10, 140)
  })
  await expect(page.getByTestId('transform-status')).toContainText('update')
  await target.evaluate((element) => {
    const event = new PointerEvent('pointerup', {
      pointerId: 82,
      pointerType: 'touch',
      button: 0,
      buttons: 0,
      clientX: 48,
      clientY: 20,
      bubbles: true,
    })
    Object.defineProperty(event, 'timeStamp', { value: 150 })
    element.dispatchEvent(event)
  })
  await expect(page.getByTestId('transform-status')).toContainText('end')
})
