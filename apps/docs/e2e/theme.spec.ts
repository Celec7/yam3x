import { expect, test } from '@playwright/test'
import { selectM3Option } from './test-utils'

test('theme guide applies variants and settings, follows system mode, and reports changes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/guide/theme')
  const target = page.getByTestId('theme-target')
  const icon = page.getByRole('img', { name: 'Current theme preview' })
  await expect(target).toHaveAttribute('data-theme', 'light')
  const initialIcon = await icon.getAttribute('style')

  const readPalette = () =>
    target.evaluate((element) => ({
      primary: getComputedStyle(element).getPropertyValue('--md-sys-color-primary').trim(),
      secondary: getComputedStyle(element).getPropertyValue('--md-sys-color-secondary').trim(),
      surface: getComputedStyle(element)
        .getPropertyValue('--md-sys-color-surface-container')
        .trim(),
      background: getComputedStyle(element).backgroundColor,
    }))
  const defaultPalette = await readPalette()
  const secondaryHex = /^#([\da-f]{6})$/i.exec(defaultPalette.secondary)?.[1]
  expect(secondaryHex).toBeDefined()
  const secondaryGreen = Number.parseInt(secondaryHex!.slice(2, 4), 16)
  const secondaryBlue = Number.parseInt(secondaryHex!.slice(4, 6), 16)
  expect(secondaryBlue).toBeGreaterThan(secondaryGreen)
  await expect
    .poll(() =>
      page
        .locator('html')
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--md-sys-color-primary').trim(),
        ),
    )
    .toBe(defaultPalette.primary)

  await selectM3Option(page, page.getByLabel('Variant'), 'neutral')
  await expect.poll(async () => (await readPalette()).primary).not.toBe(defaultPalette.primary)
  await expect.poll(() => icon.getAttribute('style')).not.toBe(initialIcon)
  await selectM3Option(page, page.getByLabel('Color scheme'), 'dark')
  await expect(target).toHaveAttribute('data-theme', 'dark')
  await expect.poll(async () => (await readPalette()).surface).not.toBe(defaultPalette.surface)

  await selectM3Option(page, page.getByLabel('Motion'), 'expressive')
  await selectM3Option(page, page.getByLabel('Density'), '-2')
  await page.getByLabel('Strong focus indicator').check()
  await expect(target).toHaveCSS('--md-sys-density-scale', '-2')
  await expect(target).toHaveCSS('--yam3x-focus-ring-visibility', 'visible')
  await expect(target).toHaveCSS('--md-sys-motion-spring-fast-spatial', /^350ms /)
  await expect(page.getByTestId('theme-changes')).toContainText('Theme change events: 4')

  await selectM3Option(page, page.getByLabel('Color scheme'), 'system')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(target).toHaveAttribute('data-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(target).toHaveAttribute('data-theme', 'light')
  await expect(icon).toBeVisible()
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Choose an image on this device' }).click(),
  ])
  await fileChooser.setFiles({
    name: 'theme-source.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#008577"/></svg>',
    ),
  })
  await expect
    .poll(() =>
      page
        .locator('.theme-example__swatch')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe('rgb(103, 80, 164)')
  await icon.evaluate((element) => {
    element.setAttribute(
      'style',
      [
        '--yam3x-theme-icon-size: 48px',
        '--yam3x-theme-icon-shape: 12px',
        '--yam3x-theme-icon-outline-color: #000000',
        '--yam3x-theme-icon-outline-opacity: 100%',
        '--yam3x-theme-icon-container-color: #ff0000',
        '--yam3x-theme-icon-color: #0000ff',
      ].join(';'),
    )
  })
  await expect(icon).toHaveCSS('width', '48px')
  await expect(icon).toHaveCSS('height', '48px')
  await expect(icon).toHaveCSS('border-radius', '12px')
  await expect(icon).toHaveCSS('outline-style', 'solid')
  await expect(icon).toHaveCSS('outline-color', 'color(srgb 0 0 0)')
  await expect(icon.locator('path').first()).toHaveCSS('fill', 'rgb(255, 0, 0)')
  await expect(icon.locator('path').nth(1)).toHaveCSS('fill', 'rgb(0, 0, 255)')
  const iconElement = page.locator('.yam3x-theme-preview-icon')
  await iconElement.evaluate((element) => element.setAttribute('hidden', ''))
  await expect(iconElement).toBeHidden()
  await iconElement.evaluate((element) => element.removeAttribute('hidden'))

  await selectM3Option(page, page.getByLabel('Variant'), 'vibrant')
  const documentBackground = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  const rootPrimary = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-primary').trim(),
  )
  await page.getByRole('button', { name: 'Apply to component demos' }).click()
  await expect(page.getByRole('button', { name: 'Reset component demo theme' })).toBeVisible()
  await page.getByRole('link', { name: 'Components', exact: true }).first().click()
  await expect(page).toHaveURL('/components/')
  await page.getByRole('link', { name: 'Buttons', exact: true }).first().click()
  await expect(page).toHaveURL('/components/button')
  await expect(page.locator('.yam3x-doc-demo-theme').first()).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('background-color', documentBackground)
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--md-sys-color-primary')
          .trim(),
      ),
    )
    .toBe(rootPrimary)
  await expect
    .poll(() =>
      page
        .locator('.yam3x-doc-demo-theme')
        .first()
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--md-sys-color-primary').trim(),
        ),
    )
    .not.toBe(rootPrimary)
  await page.goBack()
  await page.goBack()
  await expect(page).toHaveURL('/guide/theme')
  await page.getByRole('button', { name: 'Reset component demo theme' }).click()
  await expect(page.getByRole('button', { name: 'Apply to component demos' })).toBeVisible()
})
