import { expect, test } from '@playwright/test'

test('autocomplete.virtual.catalog: measures variable rows and reveals far keyboard targets without moving input focus', async ({
  page,
}) => {
  await page.goto('/components/autocomplete')
  const example = page.getByTestId('autocomplete-virtual')
  const input = example.getByRole('combobox', { name: 'Large suggestion catalog' })
  const list = example.getByRole('listbox')
  await input.press('ArrowUp')
  const last = list.getByRole('option', { name: 'Item 10000', exact: true })
  await expect(last).toHaveAttribute('aria-posinset', '10000')
  await expect(last).toHaveAttribute('aria-setsize', '10000')
  await expect(last).toBeInViewport({ ratio: 0.95 })
  await expect(input).toBeFocused()
  expect(await list.getByRole('option').count()).toBeLessThan(35)
  const activeId = await input.getAttribute('aria-activedescendant')
  await list.evaluate((element) => {
    element.scrollTop = 0
  })
  await expect(list.getByRole('option', { name: 'Item 1', exact: true })).toBeInViewport()
  await expect(input).toHaveAttribute('aria-activedescendant', activeId!)
  await expect(last).toHaveCount(1)
  await input.press('ArrowUp')
  const previous = list.getByRole('option', { name: 'Item 9998', exact: true })
  await expect(previous).toBeInViewport({ ratio: 0.95 })
  await expect(input).toHaveAttribute('aria-activedescendant', (await previous.getAttribute('id'))!)
  await input.press('Enter')
  await expect(input).toHaveValue('Item 9998')
  await expect(example.locator('output')).toHaveText('item-9997')
  expect(
    await example
      .locator('form')
      .evaluate((form: HTMLFormElement) => new FormData(form).get('suggestion')),
  ).toBe('Item 9998')
  await example.getByRole('button', { name: 'Reset suggestions' }).click()
  await expect(input).toHaveValue('')
  await expect(example.locator('output')).toHaveText('—')
  await input.click()
  const first = list.getByRole('option', { name: 'Item 1', exact: true })
  const second = list.getByRole('option', { name: 'Item 2', exact: true })
  await expect(first).toBeInViewport()
  expect((await first.boundingBox())!.height).toBeGreaterThan(
    (await second.boundingBox())!.height + 8,
  )
  await first.evaluate((element) => {
    element.style.paddingBlock = '16px'
  })
  await expect
    .poll(
      async () =>
        (await second.boundingBox())!.y -
        ((await first.boundingBox())!.y + (await first.boundingBox())!.height),
    )
    .toBeCloseTo(0, 0)
})

test('autocomplete.virtual.catalog: filters the full catalog and restores loading and empty states on the Chinese page', async ({
  page,
}) => {
  await page.goto('/zh/components/autocomplete')
  const example = page.getByTestId('autocomplete-virtual')
  const input = example.getByRole('combobox', { name: '大型建议目录' })
  await input.fill('Item 10000')
  const list = example.getByRole('listbox')
  await expect(list.getByRole('option')).toHaveCount(1)
  await expect(list.getByRole('option')).toHaveAttribute('aria-posinset', '1')
  await expect(list.getByRole('option')).toHaveAttribute('aria-setsize', '1')
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(example.locator('output')).toHaveText('item-9999')
  await example.getByRole('checkbox', { name: '正在加载建议', exact: true }).check()
  await input.click()
  await expect(list.getByRole('option')).toHaveCount(0)
  await expect(list).toContainText('加载')
  await expect(list).toBeVisible()
  await example.getByRole('checkbox', { name: '正在加载建议', exact: true }).uncheck()
  await input.fill('missing')
  await expect(list.getByRole('option')).toHaveCount(0)
  await expect(list).toContainText('暂无选项')
  await expect(list).toBeVisible()
  await input.press('Escape')
  await expect(input).toHaveValue('missing')
  await expect(example.locator('output')).toHaveText('—')
})
