import { expect, test } from '@playwright/test'
import { setM3SliderValue } from './test-utils'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/components/snackbar')
})

test('announces a persistent status without moving focus and exposes keyboard access', async ({
  page,
}) => {
  // snackbar.a11y.live
  const trigger = page.getByRole('button', { name: 'Plain snackbar' })
  await trigger.click()
  const snackbar = page.getByRole('status')
  await expect(snackbar).toContainText('Changes saved')
  await expect(snackbar).toHaveAttribute('aria-live', 'polite')
  await expect(snackbar).toHaveAttribute('aria-atomic', 'true')
  await expect(snackbar).toHaveCSS('transform', 'none')
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.textContent?.trim()))
    .toBe('Plain snackbar')
  await page.waitForTimeout(4200)
  await expect(snackbar).toBeVisible()

  await page.keyboard.press('Alt+g')
  const close = snackbar.getByRole('button', { name: 'Dismiss notification' })
  const loadedMaterialSymbols = await page.evaluate(async () => {
    await document.fonts.load('24px "Material Symbols Outlined"', 'close')
    return document.fonts.check('24px "Material Symbols Outlined"', 'close')
  })
  expect(loadedMaterialSymbols).toBe(true)
  await expect(close.locator('.yam3x-icon')).toHaveCSS('font-family', /Material Symbols Outlined/)
  await expect(close.locator('.yam3x-icon__ligature')).toHaveText('close')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(snackbar).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('queues distinct messages, replaces matching keys, and resolves actions once', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Queued snackbars' }).click()
  let snackbar = page.getByRole('status')
  await expect(snackbar).toContainText('The first update was queued')
  await expect(snackbar).not.toContainText('The second update')
  await snackbar.getByRole('button', { name: 'Dismiss notification' }).click()
  snackbar = page.getByRole('status')
  await expect(snackbar).toContainText('The second update will appear after the first one closes')
  await snackbar.getByRole('button', { name: 'Dismiss notification' }).click()

  await page.getByRole('button', { name: 'Timed snackbar' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Sync complete; page state was also updated.',
  )
  await page.getByRole('button', { name: 'Update the same snackbar' }).click()
  await expect(page.getByRole('status')).toContainText('Processing')
  await expect(page.getByRole('status')).not.toContainText(
    'Sync complete; page state was also updated.',
  )
  await page.getByRole('button', { name: 'Dismiss current snackbar' }).click()
  await expect(page.getByRole('status')).toBeHidden()

  await page.getByRole('button', { name: 'Snackbar with action' }).click()
  snackbar = page.getByRole('status')
  await expect(snackbar).toContainText('File moved to trash')
  await snackbar.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('status')).toBeHidden()
  await expect(page.locator('.yam3x-snackbar-demo__controls p[aria-live="polite"]')).toContainText(
    'Result: action',
  )
  await expect(page.locator('.yam3x-snackbar-demo__controls p[aria-live="polite"]')).toContainText(
    'Undo actions: 1',
  )
})

test('pauses an inline-feedback timeout while hovered or focused', async ({ page }) => {
  await page.clock.install()
  await page.getByRole('button', { name: 'Timed snackbar' }).click()
  const snackbar = page.getByRole('status')
  await expect(snackbar).toBeVisible()
  await page.clock.fastForward(2500)
  await snackbar.hover()
  await page.clock.fastForward(7000)
  await expect(snackbar).toBeVisible()
  await page.mouse.move(2, 2)
  await page.clock.fastForward(2600)
  await expect(snackbar).toBeHidden()
})

test('uses responsive Material geometry and moves above a focused page control', async ({
  page,
}) => {
  // snackbar.geometry.responsive
  await page.getByRole('button', { name: 'Plain snackbar' }).click()
  const snackbar = page.getByRole('status')
  await expect.poll(async () => (await snackbar.boundingBox())?.width ?? 0).toBe(600)
  await expect
    .poll(async () => {
      const snackbarBox = (await snackbar.boundingBox())!
      const messageBox = (await snackbar.locator('.yam3x-snackbar__message').boundingBox())!
      return messageBox.x - snackbarBox.x
    })
    .toBe(16)
  await expect
    .poll(async () => {
      const box = (await snackbar.boundingBox())!
      return 900 - box.y - box.height
    })
    .toBeCloseTo(16, 0)
  await selectM3Option(page, page.getByLabel('Alignment'), 'start')
  await expect.poll(async () => (await snackbar.boundingBox())!.x).toBeCloseTo(16, 0)
  await setM3SliderValue(page.getByRole('slider', { name: /Bottom offset/ }), 32)
  await expect
    .poll(async () => {
      const box = (await snackbar.boundingBox())!
      return 900 - box.y - box.height
    })
    .toBeCloseTo(48, 0)
  await selectM3Option(page, page.getByLabel('Alignment'), 'center')
  await setM3SliderValue(page.getByRole('slider', { name: /Bottom offset/ }), 0)

  const pageControl = page.getByRole('button', { name: 'Page footer control' })
  await pageControl.focus()
  await expect
    .poll(async () => {
      const controlBox = (await pageControl.boundingBox())!
      const snackbarBox = (await snackbar.boundingBox())!
      return snackbarBox.y + snackbarBox.height <= controlBox.y - 7
    })
    .toBe(true)

  await page.setViewportSize({ width: 360, height: 800 })
  await expect.poll(async () => (await snackbar.boundingBox())?.width ?? 0).toBeLessThanOrEqual(328)
  await expect.poll(async () => (await snackbar.boundingBox())!.x).toBeCloseTo(16, 0)
})

test('anchors above the supplied element and follows it while scrolling', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Anchor snackbar above demo button' }).check()
  const anchor = page.locator('.yam3x-snackbar-demo__anchor')
  await expect(anchor).toBeVisible()

  await page.getByRole('button', { name: 'Plain snackbar' }).click()
  const snackbar = page.getByRole('status')
  await expect(snackbar).toBeVisible()
  await expect
    .poll(async () => {
      const anchorBox = (await anchor.boundingBox())!
      const snackbarBox = (await snackbar.boundingBox())!
      return anchorBox.y - snackbarBox.y - snackbarBox.height
    })
    .toBeCloseTo(16, 0)

  await anchor.evaluate((element) => {
    if (element instanceof HTMLElement) element.style.visibility = 'hidden'
  })
  await expect
    .poll(async () => {
      const box = (await snackbar.boundingBox())!
      return 900 - box.y - box.height
    })
    .toBeCloseTo(16, 0)

  await anchor.evaluate((element) => {
    if (element instanceof HTMLElement) element.style.visibility = ''
  })
  const initialAnchorY = (await anchor.boundingBox())!.y
  await page.evaluate(() => window.scrollBy(0, 80))
  await expect.poll(async () => (await anchor.boundingBox())!.y).toBeCloseTo(initialAnchorY - 80, 0)
  await expect
    .poll(async () => {
      const anchorBox = (await anchor.boundingBox())!
      const snackbarBox = (await snackbar.boundingBox())!
      return anchorBox.y - snackbarBox.y - snackbarBox.height
    })
    .toBeCloseTo(16, 0)
})

test('honors RTL, light/dark color roles, reduced motion, and forced colors', async ({ page }) => {
  await page.getByRole('button', { name: 'Snackbar with action' }).click()
  const snackbar = page.getByRole('status')
  await expect(snackbar.locator('.yam3x-snackbar__message')).toHaveCSS('font-weight', '400')
  await expect(snackbar.locator('.yam3x-snackbar__message')).toHaveCSS('letter-spacing', '0.25px')
  await expect(snackbar.locator('[data-snackbar-action]')).toHaveCSS('font-weight', '500')
  await expect(snackbar).toHaveCSS('column-gap', '0px')
  await expect(snackbar.locator('[data-snackbar-action]')).toHaveCSS('min-width', '64px')
  await expect(snackbar.locator('[data-snackbar-action]')).toHaveCSS('padding-left', '12px')
  await expect(snackbar.locator('[data-snackbar-close]')).toHaveCSS('width', '48px')
  await expect(snackbar.locator('[data-snackbar-close] .yam3x-icon')).toHaveCSS('font-size', '24px')
  await expect(snackbar).toHaveCSS('border-radius', '4px')
  await expect(snackbar).not.toHaveCSS('box-shadow', 'none')
  const readColors = () =>
    snackbar.evaluate((element) => {
      const resolveToken = (token: string) => {
        const probe = document.createElement('span')
        probe.style.color = `var(${token})`
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }
      return {
        surface: getComputedStyle(element).backgroundColor,
        onSurface: getComputedStyle(element).color,
        action: getComputedStyle(element.querySelector('[data-snackbar-action]')!).color,
        expectedSurface: resolveToken('--md-sys-color-inverse-surface'),
        expectedOnSurface: resolveToken('--md-sys-color-inverse-on-surface'),
        expectedAction: resolveToken('--md-sys-color-inverse-primary'),
      }
    })
  const assertColorRoles = async () => {
    const tokens = await readColors()
    expect(tokens.surface).toBe(tokens.expectedSurface)
    expect(tokens.onSurface).toBe(tokens.expectedOnSurface)
    expect(tokens.action).toBe(tokens.expectedAction)
  }
  await assertColorRoles()

  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))
  await page.getByRole('button', { name: 'Plain snackbar' }).focus()
  await page.keyboard.press('Alt+g')
  await expect(snackbar.locator('[data-snackbar-action]')).toBeFocused()
  const rtlGeometry = await snackbar.evaluate((element) => {
    const message = element.querySelector('.yam3x-snackbar__message')!.getBoundingClientRect()
    const action = element.querySelector('[data-snackbar-action]')!.getBoundingClientRect()
    const close = element.querySelector('[data-snackbar-close]')?.getBoundingClientRect()
    const style = getComputedStyle(element)
    return {
      message: message.x,
      action: action.x,
      close: close?.x,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
    }
  })
  expect(rtlGeometry.close).toBeLessThan(rtlGeometry.action)
  expect(rtlGeometry.action).toBeLessThan(rtlGeometry.message)
  expect(rtlGeometry.paddingLeft).toBe('8px')
  expect(rtlGeometry.paddingRight).toBe('8px')
  await page.keyboard.press('Escape')

  await page.locator('html').evaluate((element) => element.classList.add('dark'))
  await page.getByRole('button', { name: 'Snackbar with action' }).click()
  await assertColorRoles()
  await page.keyboard.press('Escape')

  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.getByRole('button', { name: 'Plain snackbar' }).click()
  await expect
    .poll(async () =>
      Number.parseFloat(
        await page
          .getByRole('status')
          .evaluate((element) => getComputedStyle(element).transitionDuration),
      ),
    )
    .toBeLessThanOrEqual(0.001)
  await expect(page.getByRole('status')).toHaveCSS('border-top-width', '1px')
})

test('uses responsive line heights and maps snackbar styles through theme tokens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.getByRole('button', { name: 'Plain snackbar' }).click()
  let snackbar = page.getByRole('status')
  await expect.poll(async () => (await snackbar.boundingBox())!.height).toBe(48)

  await page.getByRole('button', { name: 'Dismiss current snackbar' }).click()
  await expect(snackbar).toBeHidden()
  await page.getByRole('button', { name: 'Long message' }).click()
  snackbar = page.getByRole('status')
  await expect.poll(async () => (await snackbar.boundingBox())!.height).toBe(64)

  await page.setViewportSize({ width: 640, height: 800 })
  await snackbar.evaluate((element) => {
    element.style.width = '344px'
  })
  await expect.poll(async () => (await snackbar.boundingBox())!.height).toBe(68)
  await expect(snackbar).toHaveCSS('border-radius', '4px')

  const resolvedColors = await snackbar.evaluate((element) => {
    const style = getComputedStyle(element)
    const probe = document.createElement('div')
    probe.style.backgroundColor = 'var(--md-sys-color-inverse-surface)'
    document.body.append(probe)
    const systemBackground = getComputedStyle(probe).backgroundColor
    probe.style.backgroundColor = 'var(--md-sys-color-inverse-on-surface)'
    const systemMessage = getComputedStyle(probe).backgroundColor
    probe.remove()
    return {
      background: style.backgroundColor,
      message: style.color,
      systemBackground,
      systemMessage,
    }
  })
  expect(resolvedColors.background).toBe(resolvedColors.systemBackground)
  expect(resolvedColors.message).toBe(resolvedColors.systemMessage)
})

test('moves a long action below the message when the compact row would be crowded', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.getByRole('button', { name: 'Long action' }).click()
  const snackbar = page.getByRole('status')
  const action = snackbar.getByRole('button', { name: 'Review account activity' })
  const message = snackbar.locator('.yam3x-snackbar__message')
  await expect(snackbar).toHaveClass(/yam3x-snackbar--long-action/)
  await expect
    .poll(async () => {
      const actionBox = (await action.boundingBox())!
      const messageBox = (await message.boundingBox())!
      return actionBox.y >= messageBox.y + messageBox.height
    })
    .toBe(true)
})
