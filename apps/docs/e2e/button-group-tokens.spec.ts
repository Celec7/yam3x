import { expect, test } from '@playwright/test'

test('connected groups keep visible inner corners through selection and press', async ({
  page,
}) => {
  await page.goto('/components/button-group')
  const group = page.getByRole('radiogroup', { name: 'View mode' })
  const list = group.getByRole('radio', { name: 'List' })
  const grid = group.getByRole('radio', { name: 'Grid' })

  await grid.click()
  await expect(grid).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() => list.evaluate((button) => getComputedStyle(button).borderTopRightRadius))
    .toBe('8px')

  const corners = await list.evaluate((button) => {
    const style = getComputedStyle(button)
    const bounds = button.getBoundingClientRect()
    return {
      inner: Number.parseFloat(style.borderTopRightRadius),
      outer: Number.parseFloat(style.borderTopLeftRadius),
      width: bounds.width,
      height: bounds.height,
    }
  })
  expect(corners.inner).toBe(8)
  expect(corners.outer).toBe(20)
  expect(corners.inner + corners.outer).toBeLessThan(corners.width)
  expect(corners.outer * 2).toBeLessThanOrEqual(corners.height + 0.01)

  const bounds = await list.boundingBox()
  expect(bounds).not.toBeNull()
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2)
  await page.mouse.down()
  await expect
    .poll(() =>
      list.evaluate((button) => Number.parseFloat(getComputedStyle(button).borderTopRightRadius)),
    )
    .toBe(4)
  await page.mouse.up()
  await expect(list).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() =>
      list.evaluate((button) => Number.parseFloat(getComputedStyle(button).borderTopRightRadius)),
    )
    .toBe(20)
})

test('group spacing and corners follow size and shape, including icon options', async ({
  page,
}) => {
  await page.goto('/components/button-group')
  const connected = page.getByRole('radiogroup', { name: 'View mode' })
  const standard = page.getByRole('group', { name: 'Content filters' })
  const size = page.getByRole('combobox', { name: 'Button group size' })

  for (const [label, standardGap, connectedInner] of [
    ['XS', '18px', '8px'],
    ['S', '12px', '8px'],
    ['M', '8px', '8px'],
    ['L', '8px', '16px'],
    ['XL', '8px', '20px'],
  ]) {
    await size.click()
    await page.getByRole('option', { name: label, exact: true }).click()
    await expect
      .poll(() => standard.evaluate((group) => getComputedStyle(group).gap))
      .toBe(standardGap)
    await expect.poll(() => connected.evaluate((group) => getComputedStyle(group).gap)).toBe('2px')
    await expect
      .poll(() =>
        connected
          .getByRole('radio', { name: 'Grid' })
          .evaluate((button) => getComputedStyle(button).borderTopLeftRadius),
      )
      .toBe(connectedInner)
  }

  await page.getByRole('combobox', { name: 'Button group shape' }).click()
  await page.getByRole('option', { name: 'Square' }).click()
  await connected.getByRole('radio', { name: 'Grid' }).click()
  await expect
    .poll(() =>
      connected
        .getByRole('radio', { name: 'List' })
        .evaluate((button) => getComputedStyle(button).borderTopLeftRadius),
    )
    .toBe('20px')

  await page.getByRole('combobox', { name: 'Icon group variant' }).click()
  await page.getByRole('option', { name: 'Connected' }).click()
  const iconGroup = page.getByRole('group', { name: 'Text formatting' })
  const icons = iconGroup.locator('.yam3x-icon-button')
  await expect
    .poll(() => icons.first().evaluate((button) => getComputedStyle(button).marginInlineStart))
    .toBe('0px')
  const first = await icons.nth(0).boundingBox()
  const second = await icons.nth(1).boundingBox()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  expect(second!.x - (first!.x + first!.width)).toBeCloseTo(2, 0)

  await connected.evaluate((group) =>
    group.style.setProperty('--yam3x-connected-button-group-spacing', '6px'),
  )
  await expect.poll(() => connected.evaluate((group) => getComputedStyle(group).gap)).toBe('6px')
  await connected.evaluate((group) => group.style.setProperty('--yam3x-button-group-gap', '10px'))
  await expect.poll(() => connected.evaluate((group) => getComputedStyle(group).gap)).toBe('10px')

  await icons.first().hover()
  await page.mouse.down()
  await expect
    .poll(() =>
      icons.first().evaluate((button) => {
        const style = getComputedStyle(button)
        const target = getComputedStyle(button, '::before')
        return [style.borderTopLeftRadius, style.borderTopRightRadius, target.borderTopRightRadius]
      }),
    )
    .toEqual(['20px', '16px', '16px'])
  await page.mouse.up()
})
