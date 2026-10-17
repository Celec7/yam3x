import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/components/icon')
})

test('registered icons expose an image name only when requested and stay non-interactive', async ({
  page,
}) => {
  const home = page.getByTestId('icon-home')
  // icon.extension.accessible-name
  await expect(home).toHaveAttribute('role', 'img')
  await expect(home).toHaveAttribute('aria-label', 'Home')
  await expect(home).not.toHaveAttribute('aria-hidden')
  await expect(page.getByRole('img', { name: 'Home' })).toBeVisible()
  await expect(home).not.toHaveAttribute('tabindex')

  const toggle = page.getByRole('button', { name: 'Favorite' })
  const icon = toggle.getByTestId('icon-favorite')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(icon).toHaveAttribute('aria-hidden', 'true')
  await expect(icon.locator('path')).toHaveAttribute('d', /M12 2/)
  await toggle.focus()
  await page.keyboard.press('Space')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(icon.locator('path')).toHaveAttribute('d', /m12 2/)

  const settings = page.getByTestId('icon-settings')
  await expect(settings).toHaveAttribute('aria-label', 'Settings')
  await expect(settings.locator('svg')).toHaveAttribute('viewBox', '0 0 24 24')
})

test('Material Symbols axes, icon size, and inherited color resolve through CSS', async ({
  page,
}) => {
  const icon = page.getByTestId('icon-home')
  await icon.evaluate((element) => {
    const host = element as HTMLElement
    host.style.setProperty('--yam3x-icon-size', '32px')
    host.style.color = 'rgb(12, 34, 56)'
  })
  await expect(icon).toHaveCSS('width', '32px')
  await expect(icon).toHaveCSS('height', '32px')
  await expect(icon).toHaveCSS('color', 'rgb(12, 34, 56)')

  await expect(icon).toHaveCSS('font-family', /Material Symbols Rounded/)
  await expect(page.getByTestId('icon-settings')).toHaveCSS('font-family', /Material Symbols Sharp/)
  const axes = await page
    .getByTestId('icon-favorite')
    .evaluate((element) => getComputedStyle(element).fontVariationSettings)
  expect(axes).toContain('FILL')
  expect(axes).toContain('GRAD')
  const defaults = await icon.evaluate((element) => getComputedStyle(element).fontVariationSettings)
  expect(defaults).toMatch(/FILL"?\s+0/)
  expect(defaults).toMatch(/wght"?\s+400/)
  expect(defaults).toMatch(/GRAD"?\s+0/)
  expect(defaults).toMatch(/opsz"?\s+24/)
  const styleOwnership = await icon.evaluate((element) => {
    const style = (element as HTMLElement).style
    return {
      directFamily: style.fontFamily,
      directVariationSettings: style.fontVariationSettings,
      componentFamily: style.getPropertyValue('--_yam3x-icon-font-family'),
      componentVariationSettings: style.getPropertyValue('--_yam3x-icon-font-variation-settings'),
    }
  })
  expect(styleOwnership.directFamily).toBe('')
  expect(styleOwnership.directVariationSettings).toBe('')
  expect(styleOwnership.componentFamily).toContain('Material Symbols Rounded')
  expect(styleOwnership.componentVariationSettings).toContain("'wght' 400")

  const themeContainer = icon.locator('..')
  await page.emulateMedia({ colorScheme: 'dark' })
  await themeContainer.evaluate((element) => element.setAttribute('data-theme', 'light'))
  await expect(icon).toHaveCSS('font-variation-settings', /GRAD["']?\s+0/)
  await themeContainer.evaluate((element) => element.setAttribute('data-theme', 'dark'))
  await expect(icon).toHaveCSS('font-variation-settings', /GRAD["']?\s+-25/)
  await themeContainer.evaluate((element) => element.removeAttribute('data-theme'))
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(icon).toBeVisible()
})

test('late registration and entry replacement update a mounted icon without losing its name', async ({
  page,
}) => {
  const deferred = page.getByTestId('icon-deferred')
  await expect(deferred.locator('.yam3x-icon__ligature')).toHaveText('deferred')
  await page.getByRole('button', { name: 'Deferred icon' }).click()
  await expect(deferred.locator('svg')).toHaveAttribute('viewBox', '0 0 24 24')
  await expect(deferred.locator('path')).toHaveAttribute('d', 'M3 3h18v18H3z')
  await page.getByRole('button', { name: 'Replace registered icon' }).click()
  await expect(deferred.locator('svg')).toHaveAttribute('viewBox', '0 0 48 48')
  await expect(deferred.locator('path')).toHaveAttribute('d', 'M4 4h40v40H4z')
  await expect(deferred).toHaveAttribute('aria-label', 'Deferred icon')
})

test('hidden icons disappear while forced colors and reduced motion preserve the glyph', async ({
  page,
}) => {
  const icon = page.getByTestId('icon-settings')
  await icon.evaluate((element) => {
    ;(element as HTMLElement).setAttribute('hidden', '')
  })
  await expect(icon).toBeHidden()
  await icon.evaluate((element) => {
    ;(element as HTMLElement).removeAttribute('hidden')
  })
  await expect(icon).toBeVisible()
})
