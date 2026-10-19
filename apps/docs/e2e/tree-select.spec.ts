import { expect, test } from '@playwright/test'

test('tree-select.dialog.focus: moves from search into the tree, commits a key, and restores trigger focus', async ({
  page,
}) => {
  await page.goto('/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  const trigger = demo.getByRole('combobox', { name: 'Document', exact: true })
  await expect(trigger).toHaveAttribute('aria-required', 'true')
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Document', exact: true })
  const search = dialog.getByRole('searchbox', { name: 'Search records' })
  await expect(search).toBeFocused()
  const searchField = dialog.locator('.yam3x-tree-select__search-field')
  expect((await searchField.boundingBox())!.height).toBeCloseTo(
    (await searchField.locator('.yam3x-form-field__container').boundingBox())!.height,
    0,
  )
  expect((await searchField.boundingBox())!.width).toBeCloseTo(
    (await dialog.boundingBox())!.width - 24,
    0,
  )
  await search.dispatchEvent('keydown', { key: 'Escape', isComposing: true })
  await search.dispatchEvent('keydown', { key: 'ArrowDown', isComposing: true })
  await search.dispatchEvent('keydown', { key: 'ArrowDown', ctrlKey: true })
  await expect(search).toBeFocused()
  await expect(dialog).toBeVisible()
  await expect(dialog).not.toHaveAttribute('aria-modal')
  await search.press('ArrowDown')
  const brief = dialog.getByRole('treeitem', { name: 'Brief', exact: true })
  await expect(brief).toBeFocused()
  await brief.press('ArrowDown')
  const tokens = dialog.getByRole('treeitem', { name: 'Tokens', exact: true })
  await expect(tokens).toBeFocused()
  await tokens.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toContainText('Tokens')
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).get('document')),
  ).toBe('tokens')
})

test('tree-select.search.ancestry: multi-selection retains filtered-out and unknown keys, keeps chips separate from the floating label, and cancels acceptance', async ({
  page,
}) => {
  await page.goto('/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  const trigger = demo.getByRole('button', { name: 'Document collection', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Document collection', exact: true })
  const search = dialog.getByRole('searchbox', { name: 'Search records' })
  await search.fill('Notes')
  await expect(dialog.getByRole('treeitem')).toHaveCount(2)
  await search.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  const notes = dialog.getByRole('treeitem', { name: 'Notes', exact: true })
  await expect(notes).toBeFocused()
  await notes.press('Space')
  await expect(dialog).toBeVisible()
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).getAll('documents')),
  ).toEqual(['tokens', 'external', 'notes'])
  await notes.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  const field = demo
    .locator('.yam3x-form-field')
    .filter({ has: page.getByRole('button', { name: 'Document collection', exact: true }) })
  await expect(field).toHaveClass(/yam3x-form-field--floating/)
  await expect(demo.getByRole('button', { name: 'Remove external', exact: true })).toBeVisible()
  await demo.getByRole('checkbox', { name: 'Reject changes' }).check()
  await trigger.click()
  await dialog.getByRole('searchbox', { name: 'Search records' }).fill('Brief')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).getAll('documents')),
  ).toEqual(['tokens', 'external', 'notes'])
  await page.keyboard.press('Escape')
  await demo.getByRole('button', { name: 'Remove external', exact: true }).click()
  await expect(demo.getByRole('button', { name: 'Remove external', exact: true })).toBeVisible()
})

test('tree-select.form.native: clearing validates accepted values and reset restores the initial model', async ({
  page,
}) => {
  await page.goto('/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  const trigger = demo.getByRole('combobox', { name: 'Document', exact: true })
  await trigger.click()
  await page
    .getByRole('dialog', { name: 'Document', exact: true })
    .getByRole('button', { name: 'Clear', exact: true })
    .click()
  expect(
    await demo.locator('form').evaluate((form: HTMLFormElement) => form.reportValidity()),
  ).toBe(false)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-invalid', 'true')
  await expect(trigger).not.toContainText('Brief')
  await demo.getByRole('button', { name: 'Reset documents' }).click()
  await expect(trigger).toContainText('Brief')
  expect(
    await demo
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).get('document')),
  ).toBe('brief')
  await expect(trigger).not.toHaveAttribute('aria-invalid', 'true')
  await expect(demo.getByRole('button', { name: 'Remove external', exact: true })).toBeVisible()
})

test('tree-select.dialog.focus: outside dismissal and Tab preserve their destinations, and native fieldset disabling closes the popup', async ({
  page,
}) => {
  await page.goto('/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  const trigger = demo.getByRole('combobox', { name: 'Document', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Document', exact: true })
  const outside = demo.getByRole('button', { name: 'Reset documents', exact: true })
  await outside.click()
  await expect(dialog).toBeHidden()
  await expect(outside).toBeFocused()
  await trigger.click()
  await page.evaluate(() => {
    const button = document.createElement('button')
    button.textContent = 'After picker'
    document.body.append(button)
  })
  await dialog.getByRole('button', { name: 'Close', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'After picker', exact: true })).toBeFocused()
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
      .evaluate((form: HTMLFormElement) => new FormData(form).get('document')),
  ).toBeNull()
  await demo.locator('fieldset').evaluate((fieldset: HTMLFieldSetElement) => {
    fieldset.disabled = false
  })
  await expect(trigger).toBeEnabled()
  await expect(trigger).toContainText('Brief')
})

test('tree-select.virtual.catalog: bounds a ten-thousand-record popup and reveals its offscreen selection', async ({
  page,
}) => {
  await page.goto('/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  const trigger = demo.getByRole('combobox', { name: 'Large document catalog', exact: true })
  await expect(trigger).toContainText('Item 10000')
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Large document catalog', exact: true })
  await dialog.getByRole('searchbox', { name: 'Search records' }).press('ArrowDown')
  const last = dialog.getByRole('treeitem', { name: 'Item 10000', exact: true })
  await expect(last).toBeFocused()
  await expect(last.locator(':scope > .yam3x-tree-view__row')).toBeInViewport({ ratio: 0.95 })
  await expect(last).toHaveAttribute('aria-setsize', '10000')
  expect(await dialog.getByRole('treeitem').count()).toBeLessThan(40)
  await last.press('Home')
  await expect(dialog.getByRole('treeitem', { name: 'Catalog', exact: true })).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(trigger).toBeFocused()
  await expect(trigger).toContainText('Item 10000')
})

test('tree-select.load.recovery: localizes retry and search while retaining loaded labels across openings', async ({
  page,
}) => {
  await page.goto('/zh/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  const trigger = demo.getByRole('combobox', { name: '加载的文档', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '加载的文档', exact: true })
  const root = dialog.getByRole('treeitem', { name: '远端记录', exact: true })
  await expect(root).toBeFocused()
  await root.press('ArrowRight')
  await expect(dialog.getByRole('alert')).toBeVisible()
  await dialog.getByRole('button', { name: '重试加载 远端记录', exact: true }).click()
  await expect(dialog.getByRole('treeitem', { name: '远端简报', exact: true })).toBeVisible()
  await root.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(trigger).toContainText('远端简报')
  await trigger.click()
  await expect(dialog.getByRole('treeitem', { name: '远端简报', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  const documentTrigger = demo.getByRole('combobox', { name: '文档', exact: true })
  await documentTrigger.click()
  const search = page
    .getByRole('dialog', { name: '文档', exact: true })
    .getByRole('searchbox', { name: '搜索记录' })
  await search.fill('missing')
  await expect(
    page.getByRole('dialog', { name: '文档', exact: true }).getByRole('status'),
  ).toContainText('没有匹配的记录')
})

test('tree-select.dialog.focus: mirrors tree navigation and contains enlarged labels in a compact viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/zh/components/tree-select')
  const demo = page.getByTestId('tree-select-demo')
  await demo.getByRole('checkbox', { name: '镜像选择器', exact: true }).check()
  await demo.getByRole('combobox', { name: '文档', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '文档', exact: true })
  await expect(dialog).toHaveCSS('direction', 'rtl')
  const box = await dialog.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(7)
  expect(box!.x + box!.width).toBeLessThanOrEqual(383)
  await dialog.getByRole('searchbox', { name: '搜索记录' }).press('ArrowDown')
  await expect(dialog.getByRole('treeitem', { name: '简报', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  const design = dialog.getByRole('treeitem', { name: '设计', exact: true })
  await expect(design).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(design).toHaveAttribute('aria-expanded', 'false')
  await dialog.evaluate((element) => {
    for (const label of element.querySelectorAll('.yam3x-tree-view__label')) {
      ;(label as HTMLElement).style.fontSize = '32px'
      ;(label as HTMLElement).style.lineHeight = '1.5'
    }
  })
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(2)
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await expect(design.locator(':scope > .yam3x-tree-view__row')).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Escape')
  await expect(demo.getByRole('combobox', { name: '文档', exact: true })).toBeFocused()
})
