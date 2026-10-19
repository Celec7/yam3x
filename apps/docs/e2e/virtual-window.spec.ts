import { expect, test } from '@playwright/test'

for (const kind of ['select', 'autocomplete'] as const) {
  for (const padding of [undefined, 0, 64]) {
    test(`${kind}.virtual.catalog: zero overscan covers the viewport and reaches edges (padding=${padding ?? 'default'})`, async ({
      page,
    }) => {
      await page.goto(`/components/${kind}`)
      const example = page.getByTestId(
        kind === 'select' ? 'select-virtual' : 'autocomplete-virtual',
      )
      await example.getByRole('checkbox', { name: 'Use zero overscan', exact: true }).check()
      if (kind === 'autocomplete' && padding !== undefined)
        await example.locator('.yam3x-autocomplete').evaluate((element, padding) => {
          ;(element as HTMLElement).style.setProperty(
            '--yam3x-autocomplete-popup-padding-block',
            `${padding}px`,
          )
        }, padding)
      const trigger = example.getByRole('combobox', {
        name: kind === 'select' ? 'Large catalog' : 'Large suggestion catalog',
        exact: true,
      })
      await trigger.click()
      const list = page.getByRole('listbox', {
        name: kind === 'select' ? 'Large catalog' : 'Large suggestion catalog suggestions',
        exact: true,
      })
      if (kind === 'select' && padding !== undefined)
        await list.evaluate((element, padding) => {
          ;(element as HTMLElement).style.setProperty(
            '--yam3x-option-panel-container-padding-block',
            `${padding}px`,
          )
        }, padding)
      await list.evaluate((element) => {
        element.scrollTop = 1500
      })
      await expect
        .poll(() =>
          list.evaluate((element) => {
            const box = element.getBoundingClientRect()
            const rows = [...element.querySelectorAll('[role="option"]')]
              .map((row) => {
                const rect = row.getBoundingClientRect()
                return { top: rect.top - box.top, bottom: rect.bottom - box.top }
              })
              .filter((row) => row.bottom > 0 && row.top < element.clientHeight)
              .sort((a, b) => a.top - b.top)
            return (
              rows.length > 0 &&
              rows[0]!.top <= 1 &&
              rows.at(-1)!.bottom >= element.clientHeight - 1 &&
              rows.every((row, index) => index === 0 || row.top - rows[index - 1]!.bottom <= 1)
            )
          }),
        )
        .toBe(true)
      expect(await list.getByRole('option').count()).toBeLessThan(35)
      await trigger.press(kind === 'select' ? 'End' : 'ArrowUp')
      await expect(list.getByRole('option', { name: 'Item 10000', exact: true })).toBeInViewport({
        ratio: 0.95,
      })
      await list.evaluate((element) => {
        element.scrollTop = 0
      })
      await expect(list.getByRole('option', { name: 'Item 1', exact: true })).toBeInViewport({
        ratio: 0.95,
      })
    })
  }
}

for (const kind of ['select', 'autocomplete', 'tree-view', 'tree-select'] as const) {
  test(`${kind}.virtual.catalog: data changes preserve the visible anchor and existing focus`, async ({
    page,
  }) => {
    await page.goto(`/components/${kind}`)
    const example = page.getByTestId(
      {
        select: 'select-virtual',
        autocomplete: 'autocomplete-virtual',
        'tree-view': 'tree-virtual',
        'tree-select': 'tree-select-demo',
      }[kind],
    )
    let region
    if (kind === 'tree-view') {
      await example.getByRole('treeitem', { name: 'Catalog', exact: true }).focus()
      region = example.getByRole('region', { name: 'Large record tree' })
    } else {
      const trigger = example.getByRole('combobox', {
        name: {
          select: 'Large catalog',
          autocomplete: 'Large suggestion catalog',
          'tree-select': 'Large document catalog',
        }[kind],
        exact: true,
      })
      await trigger.click()
      if (kind === 'tree-select') {
        const dialog = page.getByRole('dialog', { name: 'Large document catalog', exact: true })
        await dialog.getByRole('searchbox').press('ArrowDown')
        region = dialog.getByRole('region')
      } else
        region = page.getByRole('listbox', {
          name: kind === 'select' ? 'Large catalog' : 'Large suggestion catalog suggestions',
          exact: true,
        })
    }
    await region.evaluate((element) => {
      element.scrollTop = 1500
    })
    const readAnchor = () =>
      region.evaluate((element) => {
        const top = element.getBoundingClientRect().top
        const rows = [
          ...element.querySelectorAll('[role="option"], [role="treeitem"] > .yam3x-tree-view__row'),
        ]
          .map((row) => {
            const rect = row.getBoundingClientRect()
            return {
              key:
                row.getAttribute('aria-label') ??
                (row.parentElement as HTMLElement).dataset.treeKey,
              top: rect.top - top,
              bottom: rect.bottom - top,
            }
          })
          .filter((row) => row.bottom > 0 && row.top < element.clientHeight)
          .sort((a, b) => a.top - b.top)
        return rows[0] ?? null
      })
    await expect.poll(readAnchor).not.toBeNull()
    const before = (await readAnchor())!
    const focused = await page.evaluate(() => document.activeElement?.id)
    const control = example.getByRole('checkbox', {
      name: {
        select: 'Hide leading choices',
        autocomplete: 'Hide leading choices',
        'tree-view': 'Hide leading records',
        'tree-select': 'Hide leading large records',
      }[kind],
      exact: true,
    })
    for (const checked of [true, false]) {
      await control.evaluate((element: HTMLInputElement, checked) => {
        if (element.checked !== checked) element.click()
      }, checked)
      await expect
        .poll(async () => {
          const after = await readAnchor()
          return after?.key === before.key && Math.abs(after.top - before.top) <= 1
        })
        .toBe(true)
      expect(await page.evaluate(() => document.activeElement?.id)).toBe(focused)
    }
  })
}

test('tree-view.virtual.catalog: shrinking the partially visible anchor keeps that record in view', async ({
  page,
}) => {
  await page.goto('/components/tree-view')
  const example = page.getByTestId('tree-virtual')
  const region = example.getByRole('region', { name: 'Large record tree' })
  const first = example
    .getByRole('treeitem', { name: 'Item 1', exact: true })
    .locator(':scope > .yam3x-tree-view__row')
  const second = example
    .getByRole('treeitem', { name: 'Item 2', exact: true })
    .locator(':scope > .yam3x-tree-view__row')
  await first.evaluate((element: HTMLElement) => {
    element.style.minBlockSize = '320px'
  })
  await expect
    .poll(async () => (await second.boundingBox())!.y - (await first.boundingBox())!.y)
    .toBe(320)
  await region.evaluate((element) => {
    element.scrollTop = 156
  })
  await expect
    .poll(async () => (await first.boundingBox())!.y - (await region.boundingBox())!.y)
    .toBe(-100)
  await first.evaluate((element: HTMLElement) => {
    element.style.minBlockSize = '56px'
    ;(element.querySelector('.yam3x-tree-view__metadata') as HTMLElement).style.display = 'none'
  })
  await expect
    .poll(async () => {
      const row = await first.boundingBox()
      return row ? row.y + row.height - (await region.boundingBox())!.y : -1
    })
    .toBeGreaterThan(0)
})
