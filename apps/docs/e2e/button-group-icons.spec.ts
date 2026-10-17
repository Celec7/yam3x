import { expect, test } from '@playwright/test'

test('ButtonGroup keeps IconButton toggle visuals and accessibility in sync', async ({ page }) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('group', { name: 'Text formatting' })
  const bold = group.getByRole('button', { name: 'Bold' })
  const italic = group.getByRole('button', { name: 'Italic' })

  await expect(bold).toHaveClass(/yam3x-icon-button/)
  await expect(bold).toHaveAttribute('aria-pressed', 'true')
  await expect(italic).toHaveAttribute('aria-pressed', 'false')
  await expect(bold.locator('.yam3x-icon__ligature')).toHaveText('format_bold')

  // button-group.a11y.keyboard
  await italic.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(bold).toBeFocused()
  await page.keyboard.press('Space')
  await expect(bold).toHaveAttribute('aria-pressed', 'false')
  await expect(italic).toHaveAttribute('aria-pressed', 'false')

  await page.keyboard.press('ArrowRight')
  await expect(italic).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(italic).toHaveAttribute('aria-pressed', 'true')
})
