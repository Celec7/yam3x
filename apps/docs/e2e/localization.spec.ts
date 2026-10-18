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
