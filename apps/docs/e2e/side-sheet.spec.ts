import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/side-sheet')
})

test('SideSheet component aliases resolve its official color, type, and spacing roles', async ({
  page,
}) => {
  const sheet = page.locator('.yam3x-side-sheet').first()
  const headline = sheet.locator('.yam3x-side-sheet__headline')
  const header = sheet.locator('.yam3x-side-sheet__header')
  const body = sheet.locator('.yam3x-side-sheet__body')
  const actions = sheet.locator('.yam3x-side-sheet__actions')
  const tokens = await sheet.evaluate((element) => {
    const style = getComputedStyle(element)
    const colorProbe = document.createElement('span')
    colorProbe.style.color = style.getPropertyValue('--_yam3x-side-sheet-on-surface-variant')
    document.body.append(colorProbe)
    const foreground = getComputedStyle(colorProbe).color
    colorProbe.remove()
    const headerStyle = getComputedStyle(element.querySelector('.yam3x-side-sheet__header')!)
    const bodyStyle = getComputedStyle(element.querySelector('.yam3x-side-sheet__body')!)
    const actionsStyle = getComputedStyle(element.querySelector('.yam3x-side-sheet__actions')!)
    const titleStyle = getComputedStyle(element.querySelector('.yam3x-side-sheet__headline')!)
    return {
      foreground,
      container: style.getPropertyValue('--_yam3x-side-sheet-modal-container-color').trim(),
      headlineFont: style.getPropertyValue('--_yam3x-side-sheet-headline-font').trim(),
      headerGap: headerStyle.gap,
      headerPaddingStart: headerStyle.paddingInlineStart,
      headerPaddingEnd: headerStyle.paddingInlineEnd,
      headlineSize: titleStyle.fontSize,
      headlineLineHeight: titleStyle.lineHeight,
      bodyPaddingTop: bodyStyle.paddingTop,
      actionsMinHeight: actionsStyle.minHeight,
      actionsPaddingTop: actionsStyle.paddingTop,
      actionsPaddingBottom: actionsStyle.paddingBottom,
    }
  })

  expect(tokens.foreground).not.toBe('')
  expect(tokens.container).not.toBe('')
  expect(tokens.headlineFont).not.toBe('')
  expect(tokens.headerGap).toBe('12px')
  expect(tokens.headerPaddingStart).toBe('24px')
  expect(tokens.headerPaddingEnd).toBe('24px')
  expect(tokens.headlineSize).toBe('22px')
  expect(tokens.headlineLineHeight).toBe('28px')
  expect(tokens.bodyPaddingTop).toBe('12px')
  expect(tokens.actionsMinHeight).toBe('72px')
  expect(tokens.actionsPaddingTop).toBe('16px')
  expect(tokens.actionsPaddingBottom).toBe('24px')
  await expect(headline).toHaveCSS('color', tokens.foreground)
  await expect(header).toHaveCSS('gap', tokens.headerGap)
  await expect(body).toHaveCSS('padding-top', tokens.bodyPaddingTop)
  await expect(actions).toHaveCSS('min-height', tokens.actionsMinHeight)
})

test('modal SideSheet exposes one named dialog and keeps focus inside until dismissal', async ({
  page,
}) => {
  await selectM3Option(page, page.getByRole('combobox', { name: 'Display mode' }), 'modal')
  const trigger = page.getByRole('button', { name: 'Open settings' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Page settings' })
  await expect(dialog).toBeVisible()
  await expect(page.locator('[role="dialog"]')).toHaveCount(1)
  await expect(dialog).toHaveJSProperty('tagName', 'ASIDE')
  await expect(dialog.locator('.yam3x-side-sheet')).not.toHaveAttribute('role', 'dialog')
  const close = dialog.getByRole('button', { name: 'Close page settings' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('standard SideSheet exposes dialog semantics while leaving primary content interactive', async ({
  page,
}) => {
  await selectM3Option(page, page.getByRole('combobox', { name: 'Display mode' }), 'standard')
  const mainToggle = page.getByRole('button', { name: 'Open from main content' })
  await mainToggle.click()

  const dialog = page.getByRole('dialog', { name: 'Page settings' })
  await expect(dialog).toBeVisible()
  await expect(page.locator('[role="dialog"]')).toHaveCount(1)
  await expect(dialog).not.toHaveAttribute('aria-modal', 'true')
  await expect(page.getByRole('button', { name: 'Close from main content' })).toBeEnabled()
  await expect(page.locator('.side-sheet-demo__main')).toBeVisible()
})
