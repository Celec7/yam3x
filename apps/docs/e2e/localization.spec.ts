import { expect, test } from '@playwright/test'

test('switches inherited UI language without resetting page, files, or form edits', async ({
  page,
}) => {
  await page.goto('/components/localization')
  const inherited = page.getByTestId('locale-inherited')
  await inherited.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.getByTestId('locale-page')).toHaveText('3')
  await inherited
    .locator('input[type="file"]')
    .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('saved') })
  await inherited.locator('input[name="title"]').fill('Pending edits')
  await page.getByRole('button', { name: '简体中文', exact: true }).click()
  await expect(inherited.getByRole('button', { name: '下一页', exact: true })).toBeVisible()
  await expect(page.getByTestId('locale-page')).toHaveText('3')
  await expect(inherited).toContainText('第 21–30 条，共 200 条')
  await expect(inherited).toContainText('暂无条目')
  await expect(inherited).toContainText('暂无记录')
  await expect(inherited.getByRole('button', { name: '选择文件', exact: true })).toBeVisible()
  await expect(inherited).toContainText('notes.txt')
  await expect(inherited.getByTestId('locale-number')).toHaveValue('2.5')
  await expect(
    inherited.getByRole('button', { name: '增加Quantity / 数量', exact: true }),
  ).toBeVisible()
  await expect(inherited.getByTestId('locale-number')).toHaveAttribute('lang', 'zh-CN')
  await expect(inherited.locator('input[name="title"]')).toHaveValue('Pending edits')
  await inherited.locator('input[name="title"]').clear()
  await inherited.getByRole('button', { name: 'Submit / 提交', exact: true }).click()
  await expect(inherited).toContainText('请检查这份表单')
})

test('retains nested English configuration when the outer language changes', async ({ page }) => {
  await page.goto('/components/localization')
  await page.getByRole('button', { name: '简体中文', exact: true }).click()
  const nested = page.getByTestId('locale-nested')
  await expect(nested.getByRole('button', { name: 'Continue', exact: true })).toBeVisible()
  await expect(nested.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled()
  await expect(nested).toContainText('1–10 of 100 results')
  await expect(nested.getByRole('button', { name: '下一页', exact: true })).toHaveCount(0)
})

test('starts the Chinese documentation example with Chinese inherited UI text', async ({
  page,
}) => {
  await page.goto('/zh/components/localization')
  await expect(page.getByRole('heading', { name: '本地化', level: 1 })).toBeVisible()
  await expect(
    page.getByTestId('locale-inherited').getByRole('button', { name: '下一页', exact: true }),
  ).toBeVisible()
})

test('keeps Calendar navigation and selection and supports localized keyboard focus when the shared language changes', async ({
  page,
}) => {
  await page.goto('/components/localization')
  const calendar = page.getByTestId('locale-calendar')
  await calendar.getByRole('button', { name: 'Next month', exact: true }).click()
  await expect(calendar.getByRole('grid', { name: 'November 2026' })).toBeVisible()
  const focusedDate = calendar.locator('[data-date="2026-11-01"]')
  await focusedDate.focus()
  // A programmatic language update retains the user's current focus inside the grid.
  await page
    .getByRole('button', { name: '简体中文', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(focusedDate).toBeFocused()
  await expect(calendar).toHaveAccessibleName('日历')
  await expect(calendar.getByRole('grid', { name: '2026年11月' })).toBeVisible()
  await calendar.getByRole('button', { name: '上个月', exact: true }).click()
  const selected = calendar.locator('[data-date="2026-10-05"]')
  await expect(selected).toHaveAttribute('aria-pressed', 'true')
  await selected.focus()
  await selected.press('ArrowRight')
  await expect(calendar.locator('[data-date="2026-10-06"]')).toBeFocused()
  await calendar.getByRole('button', { name: /选择日期周期/ }).click()
  await expect(calendar.getByRole('listbox', { name: /选择年份/ })).toBeVisible()
  await calendar.getByRole('option', { name: '2026', exact: true }).click()
  await expect(calendar.getByRole('listbox', { name: '选择月份，2026年' })).toBeVisible()
})

test('keeps a Date input draft and focused segment while inherited language changes', async ({
  page,
}) => {
  await page.goto('/components/localization')
  const input = page.getByTestId('locale-date-input')
  const month = input.locator('input[id$="-month"]')
  await month.fill('10')
  await month.focus()
  await page
    .getByRole('button', { name: '简体中文', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(month).toBeFocused()
  await expect(month).toHaveAttribute('tabindex', '0')
  await expect(month).toHaveValue('10')
  await expect(input.getByRole('group')).toHaveAccessibleName('日期')
  await expect(input.getByRole('alert')).toContainText('请输入有效的日期或时间。')
  await expect(input.locator('input[role="spinbutton"]').first()).toHaveAttribute('id', /-year$/)
  await input.locator('input[id$="-day"]').fill('05')
  await input.locator('input[id$="-year"]').fill('2026')
  await expect(input.getByRole('group')).not.toHaveAttribute('aria-invalid', 'true')
  await expect
    .poll(() =>
      input
        .locator('input[role="spinbutton"]')
        .evaluateAll((fields) =>
          fields.every((field) => (field as HTMLInputElement).validity.valid),
        ),
    )
    .toBe(true)
})
