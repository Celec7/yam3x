import { expect, test } from '@playwright/test'

test('cascader.path.commit: explores named levels without accepting and submits a complete path', async ({
  page,
}) => {
  await page.goto('/components/cascader')
  const demo = page.getByTestId('cascader-demo')
  const trigger = demo.getByRole('combobox', { name: 'Destination', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Destination', exact: true })
  const search = dialog.getByRole('searchbox', { name: 'Search paths' })
  await expect(search).toBeFocused()
  await search.press('ArrowDown')
  await expect(
    dialog
      .getByRole('listbox', { name: 'Level 3: Design' })
      .getByRole('option', { name: 'Brief', exact: true }),
  ).toBeFocused()
  const root = dialog.getByRole('listbox', { name: 'Level 1', exact: true })
  await root.getByRole('option', { name: 'Documentation', exact: true }).click()
  await expect(trigger).toContainText('Product / Design / Brief')
  await expect(dialog.getByRole('listbox', { name: 'Level 2: Documentation' })).toBeVisible()
  await dialog
    .getByRole('listbox', { name: 'Level 2: Documentation' })
    .getByRole('option', { name: 'Design', exact: true })
    .press('Enter')
  const leaves = dialog.getByRole('listbox', { name: 'Level 3: Design' })
  await leaves.getByRole('option', { name: 'Guide', exact: true }).press('a')
  const api = leaves.getByRole('option', { name: 'API', exact: true })
  await expect(api).toBeFocused()
  await expect(trigger).toContainText('Product / Design / Brief')
  await api.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toContainText('Documentation / Design / API')
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) =>
        JSON.parse(String(new FormData(form).get('destination'))),
      ),
  ).toEqual(['docs', 'design', 'api'])
})

test('cascader.path.commit: cancels leaf acceptance and permits only explicit intermediate confirmation', async ({
  page,
}) => {
  await page.goto('/components/cascader')
  const demo = page.getByTestId('cascader-demo')
  await demo.getByRole('checkbox', { name: 'Reject path changes' }).check()
  const trigger = demo.getByRole('combobox', { name: 'Destination', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Destination', exact: true })
  await dialog.getByRole('searchbox', { name: 'Search paths' }).press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(dialog).toBeVisible()
  await expect(trigger).toContainText('Brief')
  await page.keyboard.press('Escape')
  await demo.getByRole('checkbox', { name: 'Reject path changes' }).uncheck()
  await demo.getByRole('checkbox', { name: 'Allow branch confirmation' }).check()
  await trigger.click()
  await dialog
    .getByRole('listbox', { name: 'Level 1', exact: true })
    .getByRole('option', { name: 'Documentation', exact: true })
    .click()
  await expect(trigger).toContainText('Brief')
  await dialog.getByRole('button', { name: 'Select this path', exact: true }).click()
  await expect(trigger).toHaveText(/Documentation/)
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).get('destination')),
  ).toBe('["docs"]')
})

test('cascader.search.paths: full-path results distinguish repeated values and preserve disabled ancestry', async ({
  page,
}) => {
  await page.goto('/components/cascader')
  const demo = page.getByTestId('cascader-demo')
  const trigger = demo.getByRole('combobox', { name: 'Destination', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Destination', exact: true })
  const search = dialog.getByRole('searchbox', { name: 'Search paths' })
  await search.fill('Archive')
  const list = dialog.getByRole('listbox', { name: 'Destination paths' })
  await expect(list.getByRole('option')).toHaveCount(1)
  await expect(list.getByRole('option')).toHaveAttribute('aria-disabled', 'true')
  await search.press('ArrowDown')
  await expect(list).toBeFocused()
  await search.fill('Documentation / Design / API')
  await search.press('ArrowDown')
  const api = list.getByRole('option', { name: 'Documentation / Design / API', exact: true })
  await expect(api).toBeFocused()
  await api.press('Enter')
  await expect(trigger).toContainText('Documentation / Design / API')
  await trigger.click()
  await dialog.getByRole('searchbox', { name: 'Search paths' }).fill('missing')
  await expect(dialog.getByRole('status')).toHaveText('No matching paths')
  await page.keyboard.press('Escape')
  await expect(trigger).toContainText('Documentation / Design / API')
})

test('cascader.form.native: validates empty selection, honors canceled reset, and restores initial values', async ({
  page,
}) => {
  await page.goto('/components/cascader')
  const demo = page.getByTestId('cascader-demo')
  const trigger = demo.getByRole('combobox', { name: 'Destination', exact: true })
  await trigger.click()
  await page
    .getByRole('dialog', { name: 'Destination', exact: true })
    .getByRole('button', { name: 'Clear', exact: true })
    .click()
  expect(
    await demo.locator('form').evaluate((form: HTMLFormElement) => form.reportValidity()),
  ).toBe(false)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-invalid', 'true')
  await demo.locator('form').evaluate((form: HTMLFormElement) => {
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true })
    form.reset()
  })
  await expect(trigger).not.toContainText('Brief')
  await demo.getByRole('button', { name: 'Reset destination' }).click()
  await expect(trigger).toContainText('Product / Design / Brief')
  await expect(trigger).not.toHaveAttribute('aria-invalid', 'true')
})

test('cascader.dialog.focus: outside dismissal, Tab, and native fieldset disabling preserve their destinations', async ({
  page,
}) => {
  await page.goto('/components/cascader')
  await page.evaluate(() => {
    const button = document.createElement('button')
    button.textContent = 'After path picker'
    button.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:1000'
    document.body.append(button)
  })
  const demo = page.getByTestId('cascader-demo')
  const trigger = demo.getByRole('combobox', { name: 'Destination', exact: true })
  const outside = page.getByRole('button', { name: 'After path picker', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Destination', exact: true })
  await outside.click()
  await expect(dialog).toBeHidden()
  await expect(outside).toBeFocused()
  await trigger.click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(outside).toBeFocused()
  await expect(dialog).toBeHidden()
  await trigger.click()
  await demo.locator('fieldset').evaluate((fieldset: HTMLFieldSetElement) => {
    fieldset.disabled = true
  })
  await expect(trigger).toBeDisabled()
  await expect(dialog).toBeHidden()
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).get('destination')),
  ).toBeNull()
})

test('cascader.layout.adaptive: shows one level with Back navigation and RTL keys in a compact viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/zh/components/cascader')
  const demo = page.getByTestId('cascader-demo')
  await demo.getByRole('checkbox', { name: '镜像路径选择器' }).check()
  await demo.getByRole('combobox', { name: '目标位置', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '目标位置', exact: true })
  await expect(dialog).toHaveCSS('direction', 'rtl')
  await expect(dialog.getByRole('listbox')).toHaveCount(1)
  await dialog.getByRole('searchbox', { name: '搜索路径' }).press('ArrowDown')
  await expect(dialog.getByRole('option', { name: '简报', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(dialog.getByRole('listbox')).toHaveAttribute('aria-label', '第 2 级：产品')
  await dialog.getByRole('button', { name: '返回', exact: true }).click()
  await expect(dialog.getByRole('listbox')).toHaveAttribute('aria-label', '第 1 级')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.getByRole('option', { name: '简报', exact: true })).toBeFocused()
  const box = await dialog.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(7)
  expect(box!.x + box!.width).toBeLessThanOrEqual(383)
  await dialog.evaluate((element) => {
    for (const label of element.querySelectorAll('.yam3x-option__label')) {
      ;(label as HTMLElement).style.fontSize = '32px'
      ;(label as HTMLElement).style.lineHeight = '1.5'
    }
  })
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(2)
  await page.keyboard.press('Escape')
  await expect(demo.getByRole('combobox', { name: '目标位置', exact: true })).toBeFocused()
})
