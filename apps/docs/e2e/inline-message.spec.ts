import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/inline-message')
})

test('keeps announcement independent from visual tone and dismissal does not steal focus', async ({
  page,
}) => {
  // inline-message.announcement.independent; inline-message.dismiss.focus
  const error = page.locator('.yam3x-inline-message--error')
  await expect(error).toHaveAttribute('role', 'status')
  await expect(page.locator('.yam3x-inline-message--warning')).not.toHaveAttribute('role')
  const dismiss = page.getByRole('button', { name: 'Dismiss save error', exact: true })
  await dismiss.focus()
  await dismiss.press('Enter')
  await expect(error).toHaveCount(0)
  const show = page.getByRole('button', { name: 'Show save error', exact: true })
  await expect(show).toBeFocused()
  await show.click()
  await expect(error).toBeVisible()
  await expect(show).toBeFocused()
  await page.getByRole('button', { name: 'Retry saving', exact: true }).click()
  await expect(page.locator('.yam3x-inline-message--success')).toHaveAttribute('role', 'status')
  await expect(show).toBeFocused()
})

test('pairs error foreground and background roles in both themes', async ({ page }) => {
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('switch', { name: /dark theme|dark mode/i }).click()
    const colors = await page.locator('.yam3x-inline-message--error').evaluate((element) => {
      const sample = document.createElement('span')
      sample.style.background = 'var(--md-sys-color-error-container)'
      sample.style.color = 'var(--md-sys-color-on-error-container)'
      element.append(sample)
      const expected = getComputedStyle(sample)
      const actual = getComputedStyle(element)
      const close = getComputedStyle(element.querySelector('.yam3x-inline-message__dismiss')!)
      const action = getComputedStyle(
        element.querySelector('.yam3x-inline-message__actions button')!,
      )
      const result = {
        actualBackground: actual.backgroundColor,
        expectedBackground: expected.backgroundColor,
        actualColor: actual.color,
        expectedColor: expected.color,
        closeColor: close.color,
        actionColor: action.color,
      }
      sample.remove()
      return result
    })
    expect(colors.actualBackground).toBe(colors.expectedBackground)
    expect(colors.actualColor).toBe(colors.expectedColor)
    expect(colors.closeColor).toBe(colors.expectedColor)
    expect(colors.actionColor).toBe(colors.expectedColor)
  }
})

test('grows at 200% text, preserves separate actions in RTL, and remains visible in forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const demo = page.locator('.inline-message-demo')
  await demo.evaluate((element) => element.setAttribute('dir', 'rtl'))
  const error = page.locator('.yam3x-inline-message--error')
  const geometry = await error.evaluate((element) => {
    const action = element.querySelector('.yam3x-inline-message__actions')!.getBoundingClientRect()
    const dismiss = element
      .querySelector('.yam3x-inline-message__dismiss-target')!
      .getBoundingClientRect()
    return {
      overflow: element.scrollWidth > element.clientWidth,
      actionLeft: action.left,
      dismissRight: dismiss.right,
      width: dismiss.width,
      height: dismiss.height,
    }
  })
  expect(geometry.overflow).toBe(false)
  expect(geometry.width).toBeGreaterThanOrEqual(48)
  expect(geometry.height).toBeGreaterThanOrEqual(48)
  expect(geometry.actionLeft).toBeGreaterThanOrEqual(geometry.dismissRight)
  await demo.screenshot({ path: '/tmp/yam3x-inline-message-mobile.png' })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(error).toHaveCSS('border-top-style', 'solid')
  await expect(page.getByRole('button', { name: 'Dismiss save error', exact: true })).toBeVisible()
})

test('shows localized instructions and close labels on the Chinese page', async ({ page }) => {
  await page.goto('/zh/components/inline-message')
  await expect(page.getByText('更改尚未保存', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '关闭保存错误提示', exact: true }).click()
  await expect(page.getByRole('button', { name: '显示保存错误', exact: true })).toBeFocused()
})
