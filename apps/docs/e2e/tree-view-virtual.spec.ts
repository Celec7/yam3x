import { expect, test } from '@playwright/test'

test('tree-view.virtual.catalog: preserves hierarchy, focus, selection, and checks while windowing ten thousand nodes', async ({
  page,
}) => {
  await page.goto('/components/tree-view')
  const example = page.getByTestId('tree-virtual')
  const tree = example.getByRole('tree', { name: 'Large record tree' })
  const region = example.getByRole('region', { name: 'Large record tree' })
  const root = tree.getByRole('treeitem', { name: 'Catalog', exact: true })
  await root.focus()
  await root.press('End')
  const last = tree.getByRole('treeitem', { name: 'Item 10000', exact: true })
  await expect(last).toBeFocused()
  await expect(last.locator(':scope > .yam3x-tree-view__row')).toBeInViewport({ ratio: 0.95 })
  await expect(last).toHaveAttribute('aria-level', '2')
  await expect(last).toHaveAttribute('aria-posinset', '10000')
  await expect(last).toHaveAttribute('aria-setsize', '10000')
  await expect(
    root
      .locator(':scope > .yam3x-tree-view__branch [role="group"]')
      .first()
      .getByRole('treeitem', { name: 'Item 10000', exact: true }),
  ).toHaveCount(1)
  expect(await tree.getByRole('treeitem').count()).toBeLessThan(40)
  await region.evaluate((element) => {
    element.scrollTop = 0
  })
  await expect(
    tree
      .getByRole('treeitem', { name: 'Item 1', exact: true })
      .locator(':scope > .yam3x-tree-view__row'),
  ).toBeInViewport()
  await expect(last).toBeFocused()
  await last.press('ArrowRight')
  await last.press('ArrowRight')
  const nested = tree.getByRole('treeitem', { name: 'Nested record', exact: true })
  await expect(nested).toBeFocused()
  await expect(nested).toHaveAttribute('aria-level', '3')
  await nested.press('Enter')
  await page.keyboard.down('Space')
  await expect(nested).toHaveAttribute('data-yam3x-pressed', '')
  await expect(root).not.toHaveAttribute('data-yam3x-pressed')
  await page.keyboard.up('Space')
  await expect(nested).not.toHaveAttribute('data-yam3x-pressed')
  await expect(example.getByTestId('virtual-tree-selected')).toHaveText('nested')
  await expect(example.getByTestId('virtual-tree-checked')).toHaveText('nested')
  await example
    .getByRole('button', { name: 'Collapse all', exact: true })
    .evaluate((element: HTMLButtonElement) => element.click())
  await expect(root).toBeFocused()
  await expect(tree.getByRole('treeitem')).toHaveCount(1)
  await root.press('ArrowRight')
  await root.press('End')
  await expect(last).toBeFocused()
  await last.press('ArrowUp')
  const disabled = tree.getByRole('treeitem', { name: 'Item 9999', exact: true })
  await expect(disabled).toBeFocused()
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await disabled.press('Enter')
  await expect(example.getByTestId('virtual-tree-selected')).toHaveText('nested')
})

test('tree-view.virtual.catalog: measures changing row heights and keeps direction-aware navigation on the Chinese page', async ({
  page,
}) => {
  await page.goto('/zh/components/tree-view')
  const example = page.getByTestId('tree-virtual')
  const tree = example.getByRole('tree', { name: '大型记录树' })
  const first = tree.getByRole('treeitem', { name: 'Item 1', exact: true })
  const second = tree.getByRole('treeitem', { name: 'Item 2', exact: true })
  const firstRow = first.locator(':scope > .yam3x-tree-view__row')
  const secondRow = second.locator(':scope > .yam3x-tree-view__row')
  await firstRow.scrollIntoViewIfNeeded()
  expect((await firstRow.boundingBox())!.height).toBeGreaterThan(
    (await secondRow.boundingBox())!.height + 8,
  )
  await firstRow.evaluate((element) => {
    element.style.paddingBlock = '20px'
  })
  await expect
    .poll(
      async () =>
        (await secondRow.boundingBox())!.y -
        ((await firstRow.boundingBox())!.y + (await firstRow.boundingBox())!.height),
    )
    .toBeCloseTo(0, 0)
  await example.getByRole('checkbox', { name: '镜像大型树', exact: true }).check()
  await first.focus()
  await first.press('End')
  const last = tree.getByRole('treeitem', { name: 'Item 10000', exact: true })
  await expect(last).toBeFocused()
  await last.press('ArrowLeft')
  await expect(last).toHaveAttribute('aria-expanded', 'true')
  await last.press('ArrowLeft')
  const nested = tree.getByRole('treeitem', { name: 'Nested record', exact: true })
  await expect(nested).toBeFocused()
  await nested.press('ArrowRight')
  await expect(last).toBeFocused()
  expect(await tree.getByRole('treeitem').count()).toBeLessThan(40)
})
