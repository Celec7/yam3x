import { expect, test } from '@playwright/test'

test('single filter grid separates focus from selection and toggles its selected value', async ({
  page,
}) => {
  await page.goto('/components/chips')
  const group = page.getByRole('grid', { name: 'Primary topic' })
  const design = group.getByRole('gridcell', { name: 'Design' })
  const engineering = group.getByRole('gridcell', { name: 'Engineering' })

  await expect(group.getByRole('row')).toHaveCount(1)
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await expect(design).toHaveAttribute('tabindex', '0')
  await design.focus()
  await page.keyboard.press('ArrowRight')
  await expect(engineering).toBeFocused()
  await expect(engineering).toHaveAttribute('aria-selected', 'false')
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Space')
  await expect(engineering).toHaveAttribute('aria-selected', 'true')
  await expect(design).toHaveAttribute('aria-selected', 'false')
  await expect(page.getByText(/Single selection: \s*engineering/)).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(engineering).toHaveAttribute('aria-selected', 'false')
  await expect(page.getByText(/Single selection: \s*$/)).toBeVisible()

  await page.locator('html').evaluate((element) => {
    ;(element as HTMLElement).dir = 'rtl'
  })
  await engineering.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(group.getByRole('gridcell', { name: 'Research' })).toBeFocused()
})

test('multiple filter group keeps choices independent', async ({ page }) => {
  await page.goto('/components/chips')
  const group = page.getByRole('grid', { name: 'More topics' })
  const design = group.getByRole('gridcell', { name: 'Design' })
  const engineering = group.getByRole('gridcell', { name: 'Engineering' })

  await expect(group).toHaveAttribute('aria-multiselectable', 'true')
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await expect(engineering).toHaveAttribute('aria-selected', 'false')
  await engineering.click()
  await expect(design).toHaveAttribute('aria-selected', 'true')
  await expect(engineering).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByText(/Multiple selections: \s*design, engineering/)).toBeVisible()
  await design.click()
  await expect(design).toHaveAttribute('aria-selected', 'false')
  await expect(engineering).toHaveAttribute('aria-selected', 'true')
})

test('filter chips map selected, unselected, and focus styles to System roles', async ({
  page,
}) => {
  await page.goto('/components/chips')
  const group = page.getByRole('grid', { name: 'Primary topic' })
  const selected = group.getByRole('gridcell', { name: 'Design' })
  const unselected = group.getByRole('gridcell', { name: 'Engineering' })

  const selectedStyles = await selected.evaluate((element) => {
    const resolveColor = (token: string) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${token})`
      element.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    }
    const style = getComputedStyle(element)
    return {
      background: style.backgroundColor,
      foreground: style.color,
      systemBackground: resolveColor('--md-sys-color-secondary-container'),
      systemForeground: resolveColor('--md-sys-color-on-secondary-container'),
      height: element.getBoundingClientRect().height,
      radius: style.borderTopLeftRadius,
    }
  })
  expect(selectedStyles.background).toBe(selectedStyles.systemBackground)
  expect(selectedStyles.foreground).toBe(selectedStyles.systemForeground)
  expect(selectedStyles.height).toBeCloseTo(32, 1)
  expect(selectedStyles.radius).toBe('8px')

  const unselectedStyles = await unselected.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-on-surface-variant)'
    element.append(probe)
    const systemForeground = getComputedStyle(probe).color
    probe.remove()
    return {
      foreground: getComputedStyle(element).color,
      systemForeground,
      outlineWidth: getComputedStyle(element).borderTopWidth,
    }
  })
  expect(unselectedStyles.foreground).toBe(unselectedStyles.systemForeground)
  expect(unselectedStyles.outlineWidth).toBe('1px')

  await unselected.focus()
  const focusStyles = await unselected.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-secondary)'
    element.append(probe)
    const systemFocusColor = getComputedStyle(probe).color
    probe.remove()
    const style = getComputedStyle(element)
    return {
      color: style.outlineColor,
      systemColor: systemFocusColor,
      width: style.outlineWidth,
      offset: style.outlineOffset,
    }
  })
  expect(focusStyles.color).toBe(focusStyles.systemColor)
  expect(focusStyles.width).toBe('3px')
  expect(focusStyles.offset).toBe('2px')

  const disabled = page.locator('.yam3x-filter-chip:disabled').first()
  const disabledStyles = await disabled.evaluate((element) => {
    const probe = document.createElement('span')
    probe.style.color = 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)'
    probe.style.borderColor = 'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)'
    element.append(probe)
    const systemDisabledLabel = getComputedStyle(probe).color
    const systemDisabledOutline = getComputedStyle(probe).borderTopColor
    probe.remove()
    const style = getComputedStyle(element)
    return {
      background: style.backgroundColor,
      foreground: style.color,
      systemForeground: systemDisabledLabel,
      outline: style.borderTopColor,
      systemOutline: systemDisabledOutline,
    }
  })
  expect(disabledStyles.background).toBe('rgba(0, 0, 0, 0)')
  expect(disabledStyles.foreground).toBe(disabledStyles.systemForeground)
  expect(disabledStyles.outline).toBe(disabledStyles.systemOutline)
})

test('FilterChip trailing action matches the chip visual size and keeps its expanded touch target', async ({
  page,
}) => {
  await page.goto('/components/chips')
  const shell = page.locator('.yam3x-filter-chip-shell--with-action')
  const chip = shell.locator('.yam3x-filter-chip')
  const action = page.getByRole('button', { name: 'More filter actions' })

  const dimensions = await shell.evaluate((element) => {
    const chip = element.querySelector<HTMLElement>('.yam3x-filter-chip')!
    const action = element.querySelector<HTMLElement>('.yam3x-filter-chip__action')!
    const shellRect = element.getBoundingClientRect()
    const chipRect = chip.getBoundingClientRect()
    const actionRect = action.getBoundingClientRect()

    return {
      shellHeight: shellRect.height,
      chipHeight: chipRect.height,
      actionHeight: actionRect.height,
      actionWidth: actionRect.width,
      actionMarginBlock: getComputedStyle(action).marginBlock,
      touchTargetSize: getComputedStyle(action, '::before').width,
    }
  })

  expect(dimensions.chipHeight).toBeCloseTo(32, 1)
  expect(dimensions.actionHeight).toBeCloseTo(dimensions.chipHeight, 1)
  expect(dimensions.actionWidth).toBeCloseTo(dimensions.chipHeight, 1)
  expect(dimensions.shellHeight).toBeCloseTo(48, 1)
  expect(dimensions.actionMarginBlock).toBe('8px')
  expect(dimensions.touchTargetSize).toContain('48px')

  await action.click()
  await expect(page.getByText(/Trailing actions opened:\s*1/)).toBeVisible()
  await expect(chip).toHaveAttribute('aria-pressed', 'true')
})

test('FilterChipSet keeps wrapped and vertical gaps at 8px across density settings', async ({
  page,
}) => {
  await page.goto('/components/chips')
  const wrapped = page.getByRole('grid', { name: 'Primary topic' })
  const vertical = page.getByRole('grid', { name: 'Vertical topics' })
  await wrapped.evaluate((element) => {
    ;(element as HTMLElement).style.maxWidth = '240px'
  })
  for (const scale of ['1', '0.875', '0.75']) {
    await wrapped.evaluate((element, value) => {
      const demoTheme = element.closest<HTMLElement>('.yam3x-doc-demo-theme')
      demoTheme?.style.setProperty('--md-sys-density-spacing-scale', value)
    }, scale)
    const wrappedGaps = await wrapped.evaluate((element) => {
      const row = element.querySelector<HTMLElement>('[role="row"]')!
      const style = getComputedStyle(row)
      const chips = [...element.querySelectorAll<HTMLElement>('.yam3x-filter-chip')]
        .map((chip) => chip.getBoundingClientRect())
        .sort((a, b) => a.top - b.top)
      const rows = new Map<number, DOMRect[]>()
      for (const chip of chips) {
        const row = rows.get(chip.top) ?? []
        row.push(chip)
        rows.set(chip.top, row)
      }
      const rowBoxes = [...rows.values()].map((row) => ({
        top: row[0]!.top,
        bottom: Math.max(...row.map((chip) => chip.bottom)),
      }))
      return {
        rowGap: Number.parseFloat(style.rowGap),
        columnGap: Number.parseFloat(style.columnGap),
        rowBoxes,
      }
    })
    expect(wrappedGaps.rowGap).toBeGreaterThanOrEqual(8)
    expect(wrappedGaps.columnGap).toBeGreaterThanOrEqual(8)
    expect(wrappedGaps.rowBoxes.length).toBeGreaterThan(1)
    for (let index = 1; index < wrappedGaps.rowBoxes.length; index++) {
      expect(
        wrappedGaps.rowBoxes[index]!.top - wrappedGaps.rowBoxes[index - 1]!.bottom,
      ).toBeGreaterThanOrEqual(8)
    }

    const verticalGaps = await vertical.evaluate((element) => {
      const row = element.querySelector<HTMLElement>('[role="row"]')!
      const style = getComputedStyle(row)
      const chips = [...element.querySelectorAll<HTMLElement>('.yam3x-filter-chip')].map((chip) =>
        chip.getBoundingClientRect(),
      )
      return {
        rowGap: Number.parseFloat(style.rowGap),
        columnGap: Number.parseFloat(style.columnGap),
        chips,
      }
    })
    expect(verticalGaps.rowGap).toBeGreaterThanOrEqual(8)
    expect(verticalGaps.columnGap).toBeGreaterThanOrEqual(8)
    for (let index = 1; index < verticalGaps.chips.length; index++) {
      expect(
        verticalGaps.chips[index]!.top - verticalGaps.chips[index - 1]!.bottom,
      ).toBeGreaterThanOrEqual(8)
    }
  }
})
