import { expect, test } from '@playwright/test'

for (const locale of ['en', 'zh']) {
  test(`searchable chip labels stay above accepted values after blur (${locale})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(locale === 'zh' ? '/zh/components/select' : '/components/select')
    const example = page.getByTestId('select-search')
    const input = example.getByRole('combobox', {
      name: locale === 'zh' ? '可搜索的集合' : 'Searchable collection',
      exact: true,
    })
    const field = input.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " yam3x-form-field ")][1]',
    )
    const label = field.locator('.yam3x-form-field__label')
    await expect(field).toHaveClass(/yam3x-form-field--floating/)
    await input.fill('rus')
    await input.press('Enter')
    await input.press('Escape')
    await input.press('Tab')
    await expect(input).not.toBeFocused()
    await expect(input).toHaveValue('')
    await expect(field).toHaveClass(/yam3x-form-field--floating/)
    const chips = field.locator('.yam3x-input-chip')
    await expect(chips).toHaveCount(2)
    await expect
      .poll(async () => {
        const labelBox = await label.boundingBox()
        const chipBox = await chips.first().boundingBox()
        return labelBox && chipBox ? chipBox.y - (labelBox.y + labelBox.height) : -1
      })
      .toBeGreaterThanOrEqual(0)
    if (locale === 'zh') await field.screenshot({ path: '/tmp/yam3x-select-chip-label-fixed.png' })
    for (let remaining = 2; remaining > 0; remaining--) {
      await field.locator('.yam3x-input-chip__remove').first().click()
    }
    await input.focus()
    await input.press('Tab')
    await expect(field).not.toHaveClass(/yam3x-form-field--floating/)
  })
}
