import { expect, test } from '@playwright/test'

test('assist and suggestion chips perform their documented actions while static chips stay inert', async ({
  page,
}) => {
  await page.goto('/components/chips')

  const assist = page.getByRole('button', { name: 'Refresh content', exact: true })
  const suggestion = page.getByRole('button', { name: 'Nearby cafes', exact: true })
  // assist-chip.geometry.rest
  await expect(assist).toHaveCSS('height', '32px')
  await expect(assist).toHaveCSS('border-radius', '8px')
  // assist-chip.behavior.activate
  await assist.click()
  await expect(page.getByText(/Assistant actions: \s*1/)).toBeVisible()
  // suggestion-chip.behavior.activate
  await suggestion.click()
  await expect(page.getByText(/Suggestion:\s*Nearby cafes/)).toBeVisible()

  // chip.extension.noninteractive
  const passive = page
    .locator('.yam3x-chip:not(.yam3x-chip-set)')
    .filter({ hasText: 'Static' })
    .first()
  await expect(passive).toBeVisible()
  await expect(passive.locator('button, a, [tabindex]')).toHaveCount(0)
})

test('chip surfaces, type, selection, and focus map to System tokens', async ({ page }) => {
  await page.goto('/components/chips')
  const assist = page.getByRole('button', { name: 'Refresh content', exact: true })
  const input = page.getByRole('button', { name: 'Review needed', exact: true })

  const matchesSystemColor = (element: typeof assist, token: string, property: string) =>
    element.evaluate(
      (node, args) => {
        const expected = document.createElement('span')
        expected.style.color = `var(${args.token})`
        document.body.append(expected)
        const expectedColor = getComputedStyle(expected).color
        expected.remove()
        return getComputedStyle(node).getPropertyValue(args.property).trim() === expectedColor
      },
      { token, property },
    )

  await expect
    .poll(() => matchesSystemColor(assist, '--md-sys-color-on-surface', 'color'))
    .toBe(true)
  await expect
    .poll(() => matchesSystemColor(assist, '--md-sys-color-outline', 'border-top-color'))
    .toBe(true)
  await expect(assist).toHaveCSS('font-size', '14px')
  await expect(assist).toHaveCSS('font-weight', '500')
  await expect(assist).toHaveCSS('line-height', '20px')
  await assist.focus()
  await expect(assist).toHaveCSS('outline-width', '3px')
  await expect(assist).toHaveCSS('outline-offset', '2px')
  await expect
    .poll(() => matchesSystemColor(assist, '--md-sys-color-secondary', 'outline-color'))
    .toBe(true)

  await input.click()
  await expect(input).toHaveAttribute('aria-pressed', 'true')
  const inputContainer = input.locator('..')
  await expect
    .poll(() =>
      matchesSystemColor(inputContainer, '--md-sys-color-secondary-container', 'background-color'),
    )
    .toBe(true)
  await expect
    .poll(() => matchesSystemColor(input, '--md-sys-color-on-secondary-container', 'color'))
    .toBe(true)
})

test('ChipSet preserves an 8px minimum between wrapped chips across density settings', async ({
  page,
}) => {
  await page.goto('/components/chips')
  const set = page.getByRole('group', { name: 'Chip spacing example' })

  for (const scale of ['1', '0.875', '0.75']) {
    await page
      .locator('.yam3x-doc-demo-theme')
      .first()
      .evaluate((element, value) => {
        ;(element as HTMLElement).style.setProperty('--md-sys-density-spacing-scale', value)
      }, scale)
    const spacing = await set.evaluate((element) => {
      const style = getComputedStyle(element)
      const chips = [...element.querySelectorAll<HTMLElement>('.yam3x-chip')].map((chip) =>
        chip.getBoundingClientRect(),
      )
      const rows = new Map<number, DOMRect[]>()
      for (const rect of chips) {
        const row = rows.get(rect.top) ?? []
        row.push(rect)
        rows.set(rect.top, row)
      }
      const orderedRows = [...rows.values()].sort((a, b) => a[0]!.top - b[0]!.top)
      return {
        rowGap: Number.parseFloat(style.rowGap),
        columnGap: Number.parseFloat(style.columnGap),
        rowCount: orderedRows.length,
        horizontalIntervals: orderedRows.flatMap((row) =>
          row
            .sort((a, b) => a.left - b.left)
            .slice(1)
            .map((rect, index) => rect.left - row[index]!.right),
        ),
        verticalIntervals: orderedRows
          .slice(1)
          .map(
            (row, index) =>
              row[0]!.top - Math.max(...orderedRows[index]!.map((rect) => rect.bottom)),
          ),
      }
    })
    expect(spacing.rowCount).toBeGreaterThan(1)
    expect(spacing.rowGap).toBeGreaterThanOrEqual(8)
    expect(spacing.columnGap).toBeGreaterThanOrEqual(8)
    expect(spacing.horizontalIntervals.every((gap) => gap >= 8)).toBe(true)
    expect(spacing.verticalIntervals.every((gap) => gap >= 8)).toBe(true)
  }
})

test('input chip examples add, edit, deduplicate, and remove values', async ({ page }) => {
  await page.goto('/components/chips')
  const standalone = page.getByRole('button', { name: 'Review needed', exact: true })
  await expect(standalone).toHaveAttribute('aria-pressed', 'false')
  await standalone.click()
  await expect(standalone).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Standalone selected: yes')).toBeVisible()
  const actionOnly = page.getByRole('button', { name: 'Action only', exact: true })
  await expect(actionOnly).toHaveAttribute('aria-pressed', 'false')
  await actionOnly.click()
  await expect(actionOnly).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByText('Action-only clicks: 1')).toBeVisible()

  const group = page.getByRole('group', { name: 'Participants', exact: true })
  const input = group.getByRole('textbox', { name: 'Participants', exact: true })

  await input.fill('TypeScript')
  await input.press('Enter')
  await expect(group.getByRole('button', { name: 'TypeScript', exact: true })).toBeVisible()
  await input.fill('Vue')
  await input.press('Enter')
  await expect(group.getByRole('button', { name: 'Vue', exact: true })).toHaveCount(1)

  const typeScriptChip = group.getByRole('button', { name: 'TypeScript', exact: true })
  await typeScriptChip.click()
  await expect(input).toHaveValue('TypeScript')
  await input.fill('JavaScript')
  await input.press('Enter')
  const main = group.getByRole('button', { name: 'JavaScript', exact: true })
  // input-chip.a11y.remove-name
  const remove = group.getByRole('button', { name: 'Remove JavaScript', exact: true })
  await expect(main).toBeVisible()
  await remove.click()
  await expect(main).toHaveCount(0)
  await expect(page.getByText(/Current value: .*Material, Vue/)).toBeVisible()
})

test('input chips support keyboard editing and RTL direction', async ({ page }) => {
  await page.goto('/components/chips')
  const group = page.getByRole('group', { name: 'Participants', exact: true })
  const input = group.getByRole('textbox', { name: 'Participants', exact: true })
  const material = group.getByRole('button', { name: 'Material', exact: true })

  await material.click()
  await expect(input).toHaveValue('Material')
  await input.press('Escape')
  await expect(input).toHaveValue('')
  await page.locator('html').evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  await input.fill('Draft')
  await input.press('ArrowRight')
  await expect(input).toBeFocused()
  await input.fill('')
  await input.press('ArrowRight')
  await expect(group.getByRole('button', { name: 'Remove Vue', exact: true })).toBeFocused()
  await page.keyboard.press('Delete')
  await expect(group.getByRole('button', { name: 'Vue', exact: true })).toHaveCount(0)
})

test('InputChipSet keeps wrapped and vertical gaps at 8px across density and expands overflow on focus', async ({
  page,
}) => {
  await page.goto('/components/chips')
  const wrapped = page.getByRole('group', { name: 'Compact values', exact: true })
  const vertical = page.getByRole('group', { name: 'Vertical values', exact: true })
  const input = wrapped.getByRole('textbox', { name: 'Compact values', exact: true })
  await wrapped.evaluate((element) => {
    ;(element as HTMLElement).style.width = '260px'
  })
  await expect(wrapped.locator('.yam3x-input-chip-set__overflow')).toHaveText('+1')

  for (const scale of ['1', '0.875', '0.75']) {
    await page
      .locator('.yam3x-doc-demo-theme')
      .first()
      .evaluate((element, value) => {
        ;(element as HTMLElement).style.setProperty('--md-sys-density-spacing-scale', value)
      }, scale)
    for (const group of [wrapped, vertical]) {
      const spacing = await group.evaluate((element) => {
        const style = getComputedStyle(element)
        const children = [
          ...element.querySelectorAll<HTMLElement>(
            ':scope > .yam3x-input-chip, :scope > .yam3x-input-chip-set__overflow, :scope > .yam3x-input-chip-set__input',
          ),
        ].map((child) => child.getBoundingClientRect())
        const rows: Array<{ top: number; bottom: number }> = []
        for (const child of children) {
          const row = rows.at(-1)
          if (!row || child.top >= row.bottom) rows.push({ top: child.top, bottom: child.bottom })
          else row.bottom = Math.max(row.bottom, child.bottom)
        }
        return {
          rowGap: Number.parseFloat(style.rowGap),
          columnGap: Number.parseFloat(style.columnGap),
          rowCount: rows.length,
          rowIntervals: rows.slice(1).map((row, index) => row.top - rows[index]!.bottom),
        }
      })
      expect(spacing.rowGap).toBeGreaterThanOrEqual(8)
      expect(spacing.columnGap).toBeGreaterThanOrEqual(8)
      if (group === wrapped) expect(spacing.rowCount).toBeGreaterThan(1)
      expect(spacing.rowIntervals.every((gap) => gap >= 8)).toBe(true)
    }
  }

  await input.focus()
  await expect(wrapped.locator('.yam3x-input-chip-set__overflow')).toHaveCount(0)
  await expect(wrapped.getByRole('button', { name: 'Expressive', exact: true })).toBeVisible()
  await page.locator('h1#chips').click()
  await expect(wrapped.locator('.yam3x-input-chip-set__overflow')).toHaveText('+1')
})

test('chip hover, press, forced colors, and reduced motion remain usable', async ({ page }) => {
  await page.goto('/components/chips')
  const assist = page.getByRole('button', { name: 'Refresh content', exact: true })
  await assist.hover()
  const box = await assist.boundingBox()
  expect(box).not.toBeNull()
  await expect
    .poll(() => assist.evaluate((element) => getComputedStyle(element, '::after').opacity))
    .toBe('0.08')
  await page.mouse.down()
  const ripple = assist.locator('.yam3x-ripple--visible')
  await expect(ripple).toHaveCount(1)
  const center = await ripple.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })
  expect(Math.abs(center.x - (box!.x + box!.width / 2))).toBeLessThanOrEqual(1.1)
  expect(Math.abs(center.y - (box!.y + box!.height / 2))).toBeLessThanOrEqual(1.1)
  await expect(assist.locator('.yam3x-ripple-container')).toHaveCSS('border-radius', '8px')
  await page.mouse.up()

  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await assist.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(assist).toBeFocused()
  await expect(assist).toHaveCSS('outline-style', 'solid')
  await expect(assist).toHaveCSS('outline-color', /rgba?\(/)
  await expect(assist).toHaveCSS('border-color', /rgb\(/)
})
