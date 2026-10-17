import { expect, test } from '@playwright/test'

test('segmented button rows render composed segments with the classic geometry', async ({
  page,
}) => {
  await page.goto('/components/segmented-button')

  const group = page.getByRole('radiogroup', { name: 'View mode' })
  const segments = group.getByRole('radio')
  await expect(segments).toHaveCount(3)
  const measurements = await segments.evaluateAll((elements) =>
    elements.map((element) => {
      const surface = element.querySelector<HTMLElement>('.yam3x-segmented-button__surface')!
      const style = getComputedStyle(surface)
      return {
        visualHeight: surface.getBoundingClientRect().height,
        targetHeight: element.getBoundingClientRect().height,
        outlineWidth: style.borderTopWidth,
        radius: style.borderStartStartRadius,
      }
    }),
  )
  expect(measurements.every((item) => item.visualHeight === 40)).toBe(true)
  expect(measurements.every((item) => item.targetHeight === 48)).toBe(true)
  expect(measurements.every((item) => item.outlineWidth === '1px')).toBe(true)
  expect(measurements[0]!.radius).toBe('9999px')
  const grid = group.getByRole('radio', { name: 'Grid' })
  await grid.focus()
  const focusIndicator = await grid.evaluate((element) => {
    const style = getComputedStyle(element)
    return { thickness: style.outlineWidth, offset: style.outlineOffset }
  })
  expect(focusIndicator).toEqual({ thickness: '3px', offset: '2px' })
  await expect(
    page
      .getByRole('group', { name: 'Content filters' })
      .getByRole('checkbox', { name: 'Recent' })
      .locator('.yam3x-segmented-button__check'),
  ).toBeVisible()
  await expect(
    group.getByRole('radio', { name: 'Grid' }).locator('.yam3x-segmented-button__icon'),
  ).toContainText('grid_view')

  const density = page.locator('.yam3x-segmented-button').nth(1)
  await expect(density.getByRole('checkbox')).toHaveCount(3)
  expect(
    await density
      .getByRole('checkbox')
      .first()
      .locator('.yam3x-segmented-button__surface')
      .evaluate((element) => element.getBoundingClientRect().height),
  ).toBe(32)
})

test('single and multiple rows expose separate models, semantics, keyboard behavior, and form values', async ({
  page,
}) => {
  await page.goto('/components/segmented-button')
  const single = page.getByRole('radiogroup', { name: 'View mode' })
  const list = single.getByRole('radio', { name: 'List' })
  const grid = single.getByRole('radio', { name: 'Grid' })
  await expect(list).toHaveAttribute('aria-checked', 'true')
  await expect(list).toHaveAttribute('tabindex', '0')
  await expect(grid).toHaveAttribute('tabindex', '-1')
  await expect(single.getByRole('radio', { name: 'Map' })).toBeDisabled()

  await grid.click()
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await expect(list).toHaveAttribute('aria-checked', 'false')
  await expect
    .poll(() =>
      page
        .getByTestId('segmented-form')
        .evaluate((form) => [...new FormData(form as HTMLFormElement).getAll('view')]),
    )
    .toEqual(['grid'])

  await list.focus()
  await page.keyboard.press('ArrowRight')
  await expect(grid).toBeFocused()
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Space')
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(single.getByRole('radio', { name: 'Map' })).not.toBeFocused()

  const multi = page.getByRole('group', { name: 'Content filters' })
  const recent = multi.getByRole('checkbox', { name: 'Recent' })
  const saved = multi.getByRole('checkbox', { name: 'Saved' })
  await expect(recent).toHaveAttribute('aria-checked', 'true')
  await expect(recent).toHaveAttribute('tabindex', '0')
  await expect(saved).toHaveAttribute('tabindex', '-1')
  await saved.click()
  await expect(saved).toHaveAttribute('aria-checked', 'true')
  await saved.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(recent).toBeFocused()
  await expect(saved).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Space')
  await expect(recent).toHaveAttribute('aria-checked', 'false')
  await expect(saved).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() =>
      page
        .getByTestId('filter-form')
        .evaluate((form) => [...new FormData(form as HTMLFormElement).getAll('filter')]),
    )
    .toEqual(['saved'])

  await page.getByRole('checkbox', { name: 'Disable multi-select group' }).check()
  await expect(saved).toBeDisabled()
  await expect
    .poll(() =>
      page
        .getByTestId('filter-form')
        .evaluate((form) => [...new FormData(form as HTMLFormElement).getAll('filter')]),
    )
    .toEqual([])
})

test('rows emit change details and preserve RTL focus direction and corner shapes', async ({
  page,
}) => {
  await page.goto('/components/segmented-button')
  const group = page.getByRole('radiogroup', { name: 'View mode' })
  const items = group.getByRole('radio')
  await group.evaluate((element) => {
    element.style.direction = 'rtl'
  })
  const first = items.nth(0)
  const last = items.nth(2)
  await first.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(items.nth(1)).toBeFocused()
  await expect(items.nth(1)).toHaveAttribute('aria-checked', 'false')
  await page.keyboard.press('Enter')
  await expect(items.nth(1)).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByTestId('single-change')).toContainText('List → Grid')

  const firstRadii = await first.evaluate((element) => {
    const style = getComputedStyle(element.querySelector('.yam3x-segmented-button__surface')!)
    return [style.borderStartStartRadius, style.borderEndStartRadius]
  })
  expect(firstRadii).toEqual(['9999px', '9999px'])
  const lastRadii = await last.evaluate((element) => {
    const style = getComputedStyle(element.querySelector('.yam3x-segmented-button__surface')!)
    return [style.borderStartEndRadius, style.borderEndEndRadius]
  })
  expect(lastRadii).toEqual(['9999px', '9999px'])
})
