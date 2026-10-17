import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/dialog')
  await page.getByRole('button', { name: 'Open dialog', exact: true }).waitFor()
})

test('names and describes the modal, traps focus, and restores it after close', async ({
  page,
}) => {
  // dialog.a11y.focus
  const trigger = page.getByRole('button', { name: 'Open dialog', exact: true })
  await trigger.click()

  const dialog = page.getByRole('alertdialog', { name: 'Save changes?' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-describedby', /.+/)
  const cancel = page.getByRole('button', { name: 'Cancel', exact: true })
  const save = page.getByRole('button', { name: 'Save', exact: true })
  await expect(cancel).toBeFocused()
  await save.focus()
  await page.keyboard.press('Tab')
  await expect(cancel).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(save).toBeFocused()

  await cancel.click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('project close target stays 48px with a title icon at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  const cases = [
    {
      trigger: 'Open dialog with icon and project close button',
      close: 'Close delete dialog',
    },
  ]

  for (const item of cases) {
    await page.getByRole('button', { name: item.trigger, exact: true }).click()
    const close = page.getByRole('button', { name: item.close })
    const geometry = await close.evaluate((element) => {
      const button = element.getBoundingClientRect()
      const dialog = element.closest('.yam3x-dialog__content')!.getBoundingClientRect()
      const icon = element.querySelector('.yam3x-icon')!.getBoundingClientRect()
      return {
        width: button.width,
        height: button.height,
        left: button.left,
        right: button.right,
        top: button.top,
        bottom: button.bottom,
        dialog,
        iconWidth: icon.width,
        iconHeight: icon.height,
      }
    })
    expect(geometry.width).toBe(48)
    expect(geometry.height).toBe(48)
    expect(geometry.left).toBeGreaterThanOrEqual(geometry.dialog.left)
    expect(geometry.right).toBeLessThanOrEqual(geometry.dialog.right)
    expect(geometry.top).toBeGreaterThanOrEqual(geometry.dialog.top)
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.dialog.bottom)
    expect(geometry.iconWidth).toBe(24)
    expect(geometry.iconHeight).toBe(24)
    await close.click()
  }
})

test('closing events can cancel a close, and action results are retained', async ({ page }) => {
  await page.getByRole('button', { name: 'Prevent next close' }).click()
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Save changes?' })
  const cancel = page.getByRole('button', { name: 'Cancel', exact: true })

  await cancel.click()
  await expect(dialog).toBeVisible()
  await expect(page.locator('.yam3x-demo__status[role="log"]')).toContainText(
    'opening → opened → closing',
  )
  await cancel.click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('.yam3x-demo__status[role="log"]')).toContainText('closing → closed')

  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Last result: saved')
})

test('dismissal defaults allow Escape and outside clicks independently', async ({ page }) => {
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  const standardDialog = page.getByRole('alertdialog', { name: 'Save changes?' })
  await page.keyboard.press('Escape')
  await expect(standardDialog).toBeHidden()

  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  await page.mouse.click(8, 8)
  await expect(standardDialog).toBeHidden()
})

test('Escape and outside dismissal can be disabled separately', async ({ page }) => {
  await page.getByRole('button', { name: 'Open urgent alert' }).click()
  const alert = page.getByRole('alertdialog', { name: 'Network connection lost' })
  await expect(alert).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(alert).toBeVisible()
  await page.mouse.click(8, 8)
  await expect(alert).toBeHidden()

  await page.getByRole('button', { name: 'Open outside-locked dialog' }).click()
  const outsideLocked = page.getByRole('alertdialog', { name: 'Review your changes' })
  await expect(outsideLocked).toBeVisible()
  await page.mouse.click(8, 8)
  await expect(outsideLocked).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(outsideLocked).toBeHidden()
})

test('System roles map to Dialog component styles and keep viewport spacing in scope', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 500 })
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Save changes?' })
  const positioner = page.locator('.yam3x-dialog__positioner')
  const content = dialog
  const title = dialog.locator('.yam3x-dialog__title')
  const description = dialog.locator('.yam3x-dialog__description')
  const divider = dialog.locator('.yam3x-dialog__divider .yam3x-divider__line')
  const backdrop = page.locator('.yam3x-dialog__backdrop')

  await page.locator('body').evaluate((element) => {
    const style = (element as HTMLElement).style
    style.setProperty('--md-sys-color-surface-container-high', 'rgb(1, 2, 3)')
    style.setProperty('--md-sys-color-on-surface', 'rgb(4, 5, 6)')
    style.setProperty('--md-sys-color-on-surface-variant', 'rgb(7, 8, 9)')
    style.setProperty('--md-sys-color-outline', 'rgb(13, 14, 15)')
    style.setProperty('--md-sys-color-scrim', 'rgb(10, 11, 12)')
    style.setProperty('--md-sys-shape-corner-extra-large', '12px')
    style.setProperty('--md-sys-typescale-headline-small-font-size', '26px')
    style.setProperty('--md-sys-typescale-body-medium-font-size', '18px')
    style.setProperty('--md-sys-density-spacing-scale', '1.5')
  })

  await expect(positioner).toHaveCSS('padding', '36px')
  await expect(content).toHaveCSS('max-height', '428px')
  await expect(content).toHaveCSS('border-radius', '12px')
  await expect(content).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  await expect(title).toHaveCSS('font-size', '26px')
  await expect(title).toHaveCSS('color', 'rgb(4, 5, 6)')
  await expect(description).toHaveCSS('font-size', '18px')
  await expect(description).toHaveCSS('color', 'rgb(7, 8, 9)')
  await expect(divider).toHaveCSS('background-color', 'rgb(13, 14, 15)')
  await divider.evaluate((element) => {
    element
      .closest('.yam3x-divider')!
      .setAttribute('style', '--yam3x-divider-color: rgb(16, 17, 18)')
  })
  await expect(divider).toHaveCSS('background-color', 'rgb(16, 17, 18)')
  const scrimColor = await backdrop.evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(scrimColor).toMatch(/0\.039\d* 0\.043\d* 0\.047\d* \/ 0\.32/)
})

test('dialog remains inside a narrow viewport and body scrolling preserves header and actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 500 })
  await page
    .getByRole('button', { name: 'Open dialog with icon and project close button', exact: true })
    .click()
  const dialog = page.getByRole('alertdialog', { name: 'Delete workspace?' })
  const geometry = await dialog.evaluate((element) => {
    const content = element as HTMLElement
    const body = element.querySelector<HTMLElement>('.yam3x-dialog__body')!
    const filler = document.createElement('div')
    filler.style.height = '1000px'
    body.append(filler)
    const header = element.querySelector('header')!
    const actions = element.querySelector('footer')!
    const before = {
      header: header.getBoundingClientRect().top,
      actions: actions.getBoundingClientRect().top,
    }
    body.scrollTop = body.scrollHeight
    const after = {
      header: header.getBoundingClientRect().top,
      actions: actions.getBoundingClientRect().top,
    }
    const bounds = content.getBoundingClientRect()
    return {
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
      before,
      after,
      scrollTop: body.scrollTop,
    }
  })

  expect(geometry.scrollTop).toBeGreaterThan(0)
  expect(geometry.left).toBeGreaterThanOrEqual(0)
  expect(geometry.right).toBeLessThanOrEqual(320)
  expect(geometry.top).toBeGreaterThanOrEqual(0)
  expect(geometry.bottom).toBeLessThanOrEqual(500)
  expect(geometry.after.header).toBeCloseTo(geometry.before.header, 1)
  expect(geometry.after.actions).toBeCloseTo(geometry.before.actions, 1)
})

test('forced colors and reduced motion preserve the modal boundary and focus', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await page
    .getByRole('button', { name: 'Open dialog with icon and project close button', exact: true })
    .focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('alertdialog', { name: 'Delete workspace?' })
  const content = dialog
  const close = page.getByRole('button', { name: 'Close delete dialog' })

  await expect(close).toBeFocused()
  await expect(close).toHaveCSS('outline-style', 'solid')
  await expect(content).toHaveCSS('border-top-style', 'solid')
  const transformDuration = await content.evaluate((element) =>
    Math.max(
      ...getComputedStyle(element)
        .transitionDuration.split(',')
        .map((value) => parseFloat(value)),
    ),
  )
  expect(transformDuration).toBeLessThan(0.01)
})

test('matches dialog spacing, omits an empty body, centers the icon, and fades without translation', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Save changes?' })
  const header = dialog.locator('.yam3x-dialog__header')
  const title = dialog.locator('.yam3x-dialog__title')
  await expect(dialog.locator('.yam3x-dialog__body')).toHaveCount(0)
  await expect(header).toHaveCSS('row-gap', '16px')
  await expect(title).toHaveCSS('border-top-width', '0px')
  await expect(title).toHaveCSS('padding-top', '0px')
  await expect(dialog.locator('.yam3x-dialog__actions')).toHaveCSS('margin-top', '24px')
  await expect(dialog.locator('.yam3x-button--text')).toHaveCount(2)
  await expect(dialog).toHaveCSS('transform', 'none')
  await expect(dialog).toHaveCSS('transition-property', 'opacity')
  await page.keyboard.press('Escape')

  await page
    .getByRole('button', { name: 'Open dialog with icon and project close button', exact: true })
    .click()
  const iconDialog = page.getByRole('alertdialog', { name: 'Delete workspace?' })
  const icon = iconDialog.locator('.yam3x-dialog__icon')
  await expect(icon).toHaveCSS('justify-content', 'center')
})
